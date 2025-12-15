import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store';
import { getWeekDays, getDayLabel, formatDate, getTodayDateString, formatCurrency } from '../utils';
import { Plus, Check, X, Clock, LogOut, Share2, Bell, Coffee } from 'lucide-react';
import { AppointmentStatus, PaymentStatus, Appointment } from '../types';
import { useNavigate } from 'react-router-dom';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  existingAppointment?: Appointment;
  initialTime?: string;
  availableSlots: string[];
}

const generateTimeSlots = (startStr: string, endStr: string, intervalMinutes: number) => {
  const slots = [];
  const [startH, startM] = startStr.split(':').map(Number);
  const [endH, endM] = endStr.split(':').map(Number);
  
  let current = new Date();
  current.setHours(startH, startM, 0, 0);
  
  const end = new Date();
  end.setHours(endH, endM, 0, 0);

  // If closing time is exactly on the hour/minute, usually we stop slightly before if the service takes time.
  // But for listing slots, we list until the closing time (e.g. if close at 20:00, last slot 19:30 for 30min service).
  // We'll allow generating up to the end time for now.
  while (current < end) {
    const timeString = current.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    slots.push(timeString);
    current.setMinutes(current.getMinutes() + intervalMinutes);
  }
  return slots;
};

const AppointmentModal: React.FC<AppointmentModalProps> = ({ isOpen, onClose, selectedDate, existingAppointment, initialTime, availableSlots }) => {
  const { clients, services, addAppointment, updateAppointment, addClient, deleteAppointment, settings } = useAppStore();
  const [step, setStep] = useState(1); // 1: Client, 2: Details
  
  // Form State
  const [clientId, setClientId] = useState(existingAppointment?.clientId || '');
  const [serviceIds, setServiceIds] = useState<string[]>(existingAppointment?.serviceIds || []);
  const [time, setTime] = useState(existingAppointment?.time || initialTime || '');
  const [price, setPrice] = useState(existingAppointment?.price || 0);
  const [notes, setNotes] = useState(existingAppointment?.notes || '');
  
  // New Client State
  const [isNewClient, setIsNewClient] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');

  // Initial setup for edit mode
  React.useEffect(() => {
    if (existingAppointment) {
      setStep(2);
      setClientId(existingAppointment.clientId);
      setServiceIds(existingAppointment.serviceIds || []);
      setTime(existingAppointment.time);
      setPrice(existingAppointment.price);
      setNotes(existingAppointment.notes || '');
    } else {
      setStep(1);
      setClientId('');
      setServiceIds([]);
      setTime(initialTime || '');
      setPrice(0);
      setNotes('');
      setIsNewClient(false);
      setNewClientName('');
      setNewClientPhone('');
    }
  }, [existingAppointment, isOpen, initialTime]);

  const toggleService = (id: string) => {
    let newIds: string[];
    
    if (serviceIds.includes(id)) {
      newIds = serviceIds.filter(sid => sid !== id);
    } else {
      newIds = [...serviceIds, id];
    }
    
    setServiceIds(newIds);
    
    // Auto-calculate price
    const total = newIds.reduce((sum, sid) => {
      const s = services.find(srv => srv.id === sid);
      return sum + (s?.price || 0);
    }, 0);
    setPrice(total);
  };

  const handleSave = () => {
    if (!time) {
        alert("Por favor, selecione um horário.");
        return;
    }

    let finalClientId = clientId;

    if (isNewClient) {
      if (!newClientName) return;
      addClient({ name: newClientName, phone: newClientPhone });
    }

    // Attempt to find client if newly added (mock fix)
    if (!finalClientId && isNewClient) {
        const c = clients.find(c => c.name === newClientName);
        if (c) finalClientId = c.id;
    }

    if (!finalClientId && !isNewClient) {
        alert("Selecione um cliente.");
        return;
    }

    const payload = {
      clientId: finalClientId,
      serviceIds,
      date: selectedDate,
      time,
      price,
      status: AppointmentStatus.SCHEDULED,
      paymentStatus: PaymentStatus.PENDING,
      notes
    };

    if (existingAppointment) {
      updateAppointment(existingAppointment.id, payload);
    } else {
      addAppointment(payload);
    }
    onClose();
  };
  
  const handleQuickAddClient = () => {
      if(!newClientName) return;
      addClient({ name: newClientName, phone: newClientPhone });
      setIsNewClient(false);
  }

  const handleShareWhatsApp = () => {
    if (!clientId) return;
    const client = clients.find(c => c.id === clientId);
    if (!client || !client.phone) {
        alert("Cliente sem telefone cadastrado.");
        return;
    }
    
    const selectedServiceNames = serviceIds
        .map(id => services.find(s => s.id === id)?.name)
        .filter(Boolean)
        .join(' + ');
    const [year, month, day] = selectedDate.split('-');
    const formattedDate = `${day}/${month}/${year}`;

    const message = `Olá ${client.name}! 💈\nSeu agendamento na *${settings.shopName}* está confirmado.\n\n🗓 Data: ${formattedDate}\n⏰ Horário: ${time}\n✂ Serviço: ${selectedServiceNames || 'Personalizado'}\n💰 Valor: ${formatCurrency(price)}\n\nTe aguardo!`;
    const encodedMessage = encodeURIComponent(message);
    const cleanPhone = client.phone.replace(/\D/g, '');
    window.open(`https://wa.me/55${cleanPhone}?text=${encodedMessage}`, '_blank');
  };

  const handleSendReminder = () => {
    if (!clientId) return;
    const client = clients.find(c => c.id === clientId);
    if (!client || !client.phone) {
        alert("Cliente sem telefone cadastrado.");
        return;
    }
    
    const selectedServiceNames = serviceIds
        .map(id => services.find(s => s.id === id)?.name)
        .filter(Boolean)
        .join(' + ');
    const [year, month, day] = selectedDate.split('-');
    const formattedDate = `${day}/${month}/${year}`;

    const message = `Olá ${client.name}! 👋\nLembrete do seu horário na *${settings.shopName}*.\n\n🗓 Data: ${formattedDate}\n⏰ Horário: ${time}\n✂ Serviço: ${selectedServiceNames || 'Personalizado'}\n\nAté logo!`;
    const encodedMessage = encodeURIComponent(message);
    const cleanPhone = client.phone.replace(/\D/g, '');
    window.open(`https://wa.me/55${cleanPhone}?text=${encodedMessage}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 shadow-2xl">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-brand-500">
            {existingAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full text-brand-500">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto custom-scrollbar">
          {step === 1 && (
            <div className="space-y-4">
              {!isNewClient ? (
                <>
                  <label className="block text-sm font-medium text-brand-500">Selecione o Cliente</label>
                  <select 
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-brand-500 focus:ring-2 focus:ring-brand-500 outline-none"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <button 
                    onClick={() => setIsNewClient(true)}
                    className="text-brand-600 text-sm font-medium mt-2 flex items-center hover:text-brand-500"
                  >
                    <Plus size={16} className="mr-1" /> Criar novo cliente
                  </button>
                </>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg space-y-3 border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-semibold text-brand-500">Novo Cliente</h4>
                    <button onClick={() => setIsNewClient(false)} className="text-xs text-red-500">Cancelar</button>
                  </div>
                  <input
                    placeholder="Nome"
                    className="w-full p-2 border border-gray-300 rounded bg-white placeholder-gray-400"
                    value={newClientName}
                    onChange={e => setNewClientName(e.target.value)}
                  />
                  <input
                    placeholder="Telefone (WhatsApp)"
                    className="w-full p-2 border border-gray-300 rounded bg-white placeholder-gray-400"
                    value={newClientPhone}
                    onChange={e => setNewClientPhone(e.target.value)}
                  />
                  <button 
                    onClick={handleQuickAddClient}
                    disabled={!newClientName}
                    className="w-full bg-brand-600 text-white py-2 rounded-lg font-medium disabled:opacity-50 hover:bg-brand-700"
                  >
                    Salvar Cliente
                  </button>
                </div>
              )}
              
              <div className="pt-4">
                <button 
                  disabled={!clientId && !isNewClient}
                  onClick={() => setStep(2)}
                  className="w-full bg-brand-600 text-black py-3 rounded-lg font-bold shadow-sm hover:bg-brand-500 disabled:opacity-50 transition-colors"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-brand-500 uppercase tracking-wider mb-2">Horários Disponíveis</label>
                <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                  {availableSlots.map(slot => {
                    const isSelected = time === slot;

                    return (
                      <button
                        key={slot}
                        onClick={() => setTime(slot)}
                        className={`
                          py-2 px-1 rounded-md text-xs font-bold border transition-all
                          ${isSelected 
                              ? 'bg-brand-500 text-black border-brand-500' 
                              : 'bg-white text-gray-500 border-gray-200 hover:border-brand-300'
                          }
                        `}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-brand-500 uppercase tracking-wider mb-1">Serviços</label>
                <div className="grid grid-cols-1 gap-2">
                  {services.map(s => {
                    const isSelected = serviceIds.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        onClick={() => toggleService(s.id)}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          isSelected
                            ? 'border-brand-500 bg-brand-900/20 text-brand-500 ring-1 ring-brand-500' 
                            : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                        }`}
                      >
                        <div className={`font-medium text-sm flex justify-between items-center ${isSelected ? 'text-brand-500' : 'text-gray-400'}`}>
                          {s.name}
                          {isSelected && <Check size={14} />}
                        </div>
                        <div className="text-xs text-gray-400 mt-1 flex justify-between">
                            <span>{s.durationMinutes} min</span>
                            <span>{formatCurrency(s.price)}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-brand-500 uppercase tracking-wider mb-1">Total (R$)</label>
                  <input 
                    type="number" 
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                    value={price}
                    onChange={e => setPrice(Number(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-brand-500 uppercase tracking-wider mb-1">Observações</label>
                <textarea 
                  className="w-full p-3 border border-gray-300 rounded-lg h-20 text-sm bg-gray-50 placeholder-gray-400"
                  placeholder="Ex: Degrade na zero..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>

              <div className="flex gap-2 pt-2">
                 {existingAppointment && (
                    <>
                    <button 
                      onClick={() => {
                        if(confirm('Tem certeza que deseja cancelar este agendamento?')) {
                           deleteAppointment(existingAppointment.id);
                           onClose();
                        }
                      }}
                      className="p-3 bg-red-900/10 text-red-500 rounded-lg font-semibold hover:bg-red-900/20 border border-red-900/30"
                      title="Excluir"
                    >
                      <LogOut size={20} /> 
                    </button>
                    <button onClick={handleSendReminder} className="p-3 bg-brand-100 text-brand-700 rounded-lg border border-brand-300" title="Lembrete">
                        <Bell size={20} />
                    </button>
                    <button onClick={handleShareWhatsApp} className="p-3 bg-green-100 text-green-700 rounded-lg border border-green-300" title="WhatsApp">
                        <Share2 size={20} />
                    </button>
                    </>
                 )}
                 <button 
                  onClick={handleSave}
                  className="flex-1 bg-brand-600 text-black py-3 rounded-lg font-bold shadow-sm hover:bg-brand-500"
                >
                  Salvar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CheckCircleIcon = () => (
    <div className="h-4 w-4 rounded-full bg-brand-500 flex items-center justify-center">
        <Check size={10} className="text-white" />
    </div>
)

const Agenda: React.FC = () => {
  const navigate = useNavigate();
  const [calendarStartDate] = useState<Date>(new Date());
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApt, setEditingApt] = useState<Appointment | undefined>(undefined);
  const [initialTime, setInitialTime] = useState<string | undefined>(undefined);
  
  const { getAppointmentsByDate, getClientById, settings, updateAppointment } = useAppStore();
  
  const weekDays = useMemo(() => getWeekDays(calendarStartDate), [calendarStartDate]);
  const dateKey = formatDate(selectedDate);
  const appointments = getAppointmentsByDate(dateKey);
  
  // Dynamic Time Slots based on settings
  const timeSlots = useMemo(() => {
      const start = settings.workStartTime || '08:00';
      const end = settings.workEndTime || '20:00';
      return generateTimeSlots(start, end, 30);
  }, [settings.workStartTime, settings.workEndTime]);

  // Work Day Check
  const isWorkDay = useMemo(() => {
      if (!settings.workDays) return true;
      return settings.workDays.includes(selectedDate.getDay());
  }, [selectedDate, settings.workDays]);

  const dailyTotal = appointments
    .filter(a => a.status !== AppointmentStatus.CANCELLED)
    .reduce((sum, a) => sum + a.price, 0);

  const handleSlotClick = (slot: string) => {
    setInitialTime(slot);
    setEditingApt(undefined);
    setIsModalOpen(true);
  };

  const handleEditApt = (apt: Appointment) => {
      setInitialTime(undefined);
      setEditingApt(apt);
      setIsModalOpen(true);
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white z-10 border-b border-gray-100 shadow-sm">
        <div className="p-4 flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold text-brand-500">Agenda</h1>
            <p className="text-sm text-gray-500 capitalize">
              {new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(selectedDate)}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-gray-400 font-medium uppercase">Hoje</div>
              <div className="text-lg font-bold text-brand-600">{formatCurrency(dailyTotal)}</div>
            </div>
            <button 
              onClick={() => navigate('/')} 
              className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors border border-gray-100"
              title="Sair"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
        
        {/* Calendar Strip */}
        <div className="flex overflow-x-auto pb-4 px-4 gap-2 no-scrollbar snap-x">
          {weekDays.map((day) => {
            const isSelected = formatDate(day) === formatDate(selectedDate);
            const isToday = formatDate(day) === getTodayDateString();
            const dayIsWorkDay = !settings.workDays || settings.workDays.includes(day.getDay());

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={`flex-shrink-0 w-13 min-w-[3.25rem] h-20 rounded-2xl flex flex-col items-center justify-center snap-center transition-all border ${
                  isSelected 
                    ? 'bg-brand-600 text-black border-brand-600 shadow-lg shadow-brand-900/20 transform scale-105' 
                    : 'bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100'
                } ${!dayIsWorkDay ? 'opacity-40 bg-gray-100 grayscale' : ''}`}
              >
                <span className="text-xs font-medium uppercase mb-1">{getDayLabel(day).slice(0, 3)}</span>
                <span className={`text-xl font-bold ${isToday && !isSelected ? 'text-brand-600' : ''}`}>
                  {day.getDate()}
                </span>
                {isToday && !isSelected && <span className="w-1 h-1 bg-brand-600 rounded-full mt-1"></span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Time Slots or Closed State */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
        {!isWorkDay ? (
             <div className="flex flex-col items-center justify-center h-full text-gray-400 py-10">
                 <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4 text-gray-400">
                    <Coffee size={40} />
                 </div>
                 <h2 className="text-lg font-bold text-gray-500">Barbearia Fechada</h2>
                 <p className="text-sm">Nenhum horário disponível para este dia.</p>
             </div>
        ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pb-20">
                {timeSlots.map((slot) => {
                    const apt = appointments.find(a => a.time === slot && a.status !== AppointmentStatus.CANCELLED);
                    const client = apt ? getClientById(apt.clientId) : null;
                    const isPaid = apt?.paymentStatus === PaymentStatus.PAID;

                    if (apt) {
                        return (
                            <div 
                                key={slot}
                                onClick={() => handleEditApt(apt)}
                                className={`
                                    relative p-4 rounded-xl border flex flex-col justify-between min-h-[7rem] cursor-pointer transition-all active:scale-95 shadow-sm
                                    ${isPaid 
                                        ? 'bg-brand-50/50 border-brand-200 hover:border-brand-400' 
                                        : 'bg-white border-gray-200 hover:border-brand-300'
                                    }
                                `}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-lg font-bold text-gray-800">{slot}</span>
                                    {isPaid && <div className="text-green-500"><CheckCircleIcon /></div>}
                                </div>
                                
                                <div>
                                    <div className="font-semibold text-brand-600 truncate">
                                        {client?.name || 'Cliente'}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1 flex items-center">
                                        <span className="bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
                                            Agendado
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div 
                            key={slot}
                            onClick={() => handleSlotClick(slot)}
                            className="p-4 rounded-xl border border-gray-100 bg-white flex flex-col justify-between min-h-[7rem] cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-all active:scale-95 shadow-sm group"
                        >
                            <div className="flex items-center gap-1.5 text-gray-400 group-hover:text-gray-600 transition-colors">
                                <Clock size={16} />
                                <span className="text-lg font-bold">{slot}</span>
                            </div>
                            
                            <div className="text-sm text-gray-300 group-hover:text-brand-500 font-medium transition-colors">
                                Disponível
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
      </div>

      {/* FAB */}
      {isWorkDay && (
        <button
            onClick={() => { setEditingApt(undefined); setInitialTime(undefined); setIsModalOpen(true); }}
            className="fixed bottom-20 right-4 bg-brand-600 text-black w-14 h-14 rounded-full shadow-lg shadow-black/50 flex items-center justify-center hover:bg-brand-500 transition-colors z-40 active:scale-95"
        >
            <Plus size={28} />
        </button>
      )}

      <AppointmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        selectedDate={dateKey}
        existingAppointment={editingApt}
        initialTime={initialTime}
        availableSlots={timeSlots}
      />
    </div>
  );
};

export default Agenda;
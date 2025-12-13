import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store';
import { getWeekDays, getDayLabel, formatDate, getTodayDateString, formatCurrency, parseDate } from '../utils';
import { Plus, Check, X, Clock, DollarSign, User, LogOut, Share2, Bell } from 'lucide-react';
import { AppointmentStatus, PaymentStatus, Appointment, PaymentMethod } from '../types';
import { useNavigate } from 'react-router-dom';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  existingAppointment?: Appointment;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({ isOpen, onClose, selectedDate, existingAppointment }) => {
  const { clients, services, addAppointment, updateAppointment, addClient, deleteAppointment, settings } = useAppStore();
  const [step, setStep] = useState(1); // 1: Client, 2: Details
  
  // Form State
  const [clientId, setClientId] = useState(existingAppointment?.clientId || '');
  const [serviceIds, setServiceIds] = useState<string[]>(existingAppointment?.serviceIds || []);
  const [time, setTime] = useState(existingAppointment?.time || '09:00');
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
      setTime('09:00');
      setPrice(0);
      setNotes('');
      setIsNewClient(false);
      setNewClientName('');
      setNewClientPhone('');
    }
  }, [existingAppointment, isOpen]);

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
    let finalClientId = clientId;

    if (isNewClient) {
      if (!newClientName) return;
      // Note: In a real app we would await this, but for this sync store it works
      addClient({ name: newClientName, phone: newClientPhone });
      // We would need to retrieve the ID, but for this simple version we rely on user flow
      // A proper fix requires addClient to return ID.
    }

    if (!finalClientId && !isNewClient) return;

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
    
    // Attempt to find client info (could be the existing one or the one just selected)
    const client = clients.find(c => c.id === clientId);
    if (!client || !client.phone) {
        alert("Cliente sem telefone cadastrado.");
        return;
    }
    
    // Format Services
    const selectedServiceNames = serviceIds
        .map(id => services.find(s => s.id === id)?.name)
        .filter(Boolean)
        .join(' + ');

    // Format Date
    const [year, month, day] = selectedDate.split('-');
    const formattedDate = `${day}/${month}/${year}`;

    const message = `Olá ${client.name}! 💈
Seu agendamento na *${settings.shopName}* está confirmado.

🗓 Data: ${formattedDate}
⏰ Horário: ${time}
✂ Serviço: ${selectedServiceNames || 'Personalizado'}
💰 Valor: ${formatCurrency(price)}

Te aguardo!`;

    const encodedMessage = encodeURIComponent(message);
    const cleanPhone = client.phone.replace(/\D/g, ''); // Remove non-numeric chars
    
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

    const message = `Olá ${client.name}! 👋
Lembrete do seu horário na *${settings.shopName}*.

🗓 Data: ${formattedDate}
⏰ Horário: ${time}
✂ Serviço: ${selectedServiceNames || 'Personalizado'}

Até logo!`;

    const encodedMessage = encodeURIComponent(message);
    const cleanPhone = client.phone.replace(/\D/g, '');
    
    window.open(`https://wa.me/55${cleanPhone}?text=${encodedMessage}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] border border-slate-200">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-brand-500">
            {existingAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full text-brand-500">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto">
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
                    placeholder="Telefone (DDD + Número)"
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
                  disabled={!clientId}
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
                <label className="block text-xs font-medium text-brand-500 uppercase tracking-wider mb-1">Serviços</label>
                <div className="grid grid-cols-2 gap-2">
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
                        <div className="text-xs text-gray-400 mt-1">R$ {s.price}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-brand-500 uppercase tracking-wider mb-1">Horário</label>
                  <input 
                    type="time" 
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-brand-500 uppercase tracking-wider mb-1">Preço Total (R$)</label>
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

              <div className="flex gap-3 pt-2">
                 {existingAppointment && (
                    <>
                    <button 
                      onClick={() => {
                        if(confirm('Tem certeza que deseja cancelar?')) {
                           deleteAppointment(existingAppointment.id);
                           onClose();
                        }
                      }}
                      className="px-3 bg-red-900/10 text-red-500 rounded-lg font-semibold hover:bg-red-900/20 border border-red-900/30"
                      title="Excluir"
                    >
                      <LogOut size={20} className="rotate-180" /> 
                    </button>

                    <button
                        onClick={handleSendReminder}
                        className="px-3 bg-brand-100 text-brand-700 rounded-lg font-semibold hover:bg-brand-200 border border-brand-300 flex items-center justify-center"
                        title="Enviar Lembrete"
                    >
                        <Bell size={20} />
                    </button>

                    <button
                        onClick={handleShareWhatsApp}
                        className="px-3 bg-green-100 text-green-700 rounded-lg font-semibold hover:bg-green-200 border border-green-300 flex items-center justify-center"
                        title="Enviar Confirmação"
                    >
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

const Agenda: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApt, setEditingApt] = useState<Appointment | undefined>(undefined);
  
  const { getAppointmentsByDate, getClientById, getServiceById, updateAppointment } = useAppStore();
  
  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate]);
  const dateKey = formatDate(selectedDate);
  const appointments = getAppointmentsByDate(dateKey);

  const dailyTotal = appointments
    .filter(a => a.status !== AppointmentStatus.CANCELLED)
    .reduce((sum, a) => sum + a.price, 0);

  const toggleStatus = (apt: Appointment) => {
    const newStatus = apt.paymentStatus === PaymentStatus.PENDING ? PaymentStatus.PAID : PaymentStatus.PENDING;
    updateAppointment(apt.id, { paymentStatus: newStatus });
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white z-10 border-b border-gray-100 shadow-sm">
        <div className="p-4 flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold text-brand-500">Agenda</h1>
            <p className="text-sm text-gray-500 capitalize">
              {new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(selectedDate)}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-gray-400 font-medium uppercase">Previsto Hoje</div>
              <div className="text-lg font-bold text-brand-600">{formatCurrency(dailyTotal)}</div>
            </div>
            <button 
              onClick={() => navigate('/')} 
              className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors border border-gray-100"
              title="Sair para tela inicial"
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
            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={`flex-shrink-0 w-13 min-w-[3.25rem] h-20 rounded-2xl flex flex-col items-center justify-center snap-center transition-all border ${
                  isSelected 
                    ? 'bg-brand-600 text-black border-brand-600 shadow-lg shadow-brand-900/20 transform scale-105' 
                    : 'bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100'
                }`}
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

      {/* Appointments List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <Clock size={48} className="mb-4 opacity-20" />
            <p>Nenhum agendamento.</p>
            <button 
              onClick={() => { setEditingApt(undefined); setIsModalOpen(true); }}
              className="mt-4 text-brand-600 font-medium hover:text-brand-500"
            >
              Adicionar o primeiro
            </button>
          </div>
        ) : (
          appointments.map((apt) => {
            const client = getClientById(apt.clientId);
            const serviceNames = (apt.serviceIds || []).map(id => getServiceById(id)?.name).filter(Boolean).join(' + ');
            const isPaid = apt.paymentStatus === PaymentStatus.PAID;
            
            return (
              <div 
                key={apt.id}
                className="group relative bg-gray-50 border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex items-start gap-4 active:scale-[0.99]"
              >
                 <div className="flex flex-col items-center min-w-[3rem]">
                    <span className="text-sm font-bold text-gray-900">{apt.time}</span>
                    <div className="h-full w-0.5 bg-gray-200 my-2"></div>
                 </div>

                 <div 
                   className="flex-1 cursor-pointer"
                   onClick={() => { setEditingApt(apt); setIsModalOpen(true); }}
                 >
                    <div className="flex justify-between items-start">
                       <h3 className="font-semibold text-brand-500">{client?.name || 'Cliente Removido'}</h3>
                       <span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded text-gray-300">
                         {formatCurrency(apt.price)}
                       </span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">{serviceNames || 'Serviço Personalizado'}</p>
                    {apt.notes && <p className="text-xs text-gray-500 mt-1 italic">"{apt.notes}"</p>}
                 </div>

                 <button
                   onClick={(e) => { e.stopPropagation(); toggleStatus(apt); }}
                   className={`p-2 rounded-full transition-colors ${
                     isPaid 
                     ? 'bg-green-900/30 text-green-500 border border-green-900/50' 
                     : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200'
                   }`}
                 >
                   <DollarSign size={18} />
                 </button>
              </div>
            );
          })
        )}
        <div className="h-20"></div>
      </div>

      {/* FAB */}
      <button
        onClick={() => { setEditingApt(undefined); setIsModalOpen(true); }}
        className="fixed bottom-20 right-4 bg-brand-600 text-black w-14 h-14 rounded-full shadow-lg shadow-black/50 flex items-center justify-center hover:bg-brand-500 transition-colors z-40 active:scale-95"
      >
        <Plus size={28} />
      </button>

      <AppointmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        selectedDate={dateKey}
        existingAppointment={editingApt}
      />
    </div>
  );
};

export default Agenda;
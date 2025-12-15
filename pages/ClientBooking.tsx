import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Calendar, Clock, Scissors, User, Send, CheckCircle, ChevronRight } from 'lucide-react';
import { formatCurrency, getWeekDays, getDayLabel, formatDate } from '../utils';

interface SimpleService {
  id: string;
  n: string; // name
  p: number; // price
}

const generateSlots = (startStr: string, endStr: string) => {
    const slots = [];
    const [startH, startM] = startStr.split(':').map(Number);
    const [endH, endM] = endStr.split(':').map(Number);
    
    let current = new Date();
    current.setHours(startH, startM, 0, 0);
    
    const end = new Date();
    end.setHours(endH, endM, 0, 0);
  
    while (current < end) {
      const timeString = current.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      slots.push(timeString);
      current.setMinutes(current.getMinutes() + 30);
    }
    return slots;
};

const ClientBooking: React.FC = () => {
  const [searchParams] = useSearchParams();
  
  // Decodes settings from URL
  const shopName = searchParams.get('shop') || 'Barbearia';
  const shopPhone = searchParams.get('phone') || '';
  const servicesParam = searchParams.get('s');
  const startParam = searchParams.get('start') || '08:00';
  const endParam = searchParams.get('end') || '20:00';
  
  const [services, setServices] = useState<SimpleService[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [clientName, setClientName] = useState('');

  // Generate next 7 days
  const weekDays = useMemo(() => {
    const days = [];
    const current = new Date();
    for(let i=0; i<7; i++) {
        days.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }
    return days;
  }, []);

  // Generate time slots based on params
  const timeSlots = useMemo(() => {
      return generateSlots(startParam, endParam);
  }, [startParam, endParam]);

  useEffect(() => {
    if (servicesParam) {
      try {
        let jsonStr = servicesParam;
        // Safety check: if standard decoding didn't happen (unlikely but possible in some envs), try manual decode
        if (servicesParam.startsWith('%')) {
             try {
                 jsonStr = decodeURIComponent(servicesParam);
             } catch (e) {
                 console.warn("Could not decode services param, trying raw");
             }
        }
        
        const parsed = JSON.parse(jsonStr);
        setServices(parsed);
      } catch (e) {
        console.error("Error parsing services", e);
      }
    }
  }, [servicesParam]);

  const handleSendRequest = () => {
    if (!clientName || !selectedTime || !selectedServiceId || !shopPhone) return;

    const service = services.find(s => s.id === selectedServiceId);
    const serviceName = service ? service.n : 'Serviço Personalizado';
    const dateStr = selectedDate.toLocaleDateString('pt-BR');

    const message = `Olá! Gostaria de agendar na *${shopName}*.\n\n👤 *Cliente:* ${clientName}\n🗓 *Data:* ${dateStr}\n⏰ *Horário:* ${selectedTime}\n✂ *Serviço:* ${serviceName}\n💰 *Valor:* ${service ? formatCurrency(service.p) : ''}\n\nAguardo confirmação!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${shopPhone}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  if (!shopPhone) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 text-center">
        <p className="text-zinc-400">Link inválido. Peça ao barbeiro para gerar o link novamente.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Header */}
      <div className="bg-white p-6 shadow-sm border-b border-slate-200 sticky top-0 z-20">
        <h1 className="text-xl font-bold text-brand-600">Agendamento</h1>
        <p className="text-slate-500 text-sm">{shopName}</p>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-md mx-auto p-4 space-y-6">
          
          {/* 1. Date Selection */}
          <section>
            <div className="flex items-center gap-2 mb-3 text-brand-600 font-semibold">
                <Calendar size={18} />
                <h2>Escolha o Dia</h2>
            </div>
            <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
                {weekDays.map(day => {
                    const isSelected = day.toDateString() === selectedDate.toDateString();
                    return (
                        <button
                            key={day.toISOString()}
                            onClick={() => setSelectedDate(day)}
                            className={`flex-shrink-0 w-16 h-20 rounded-xl flex flex-col items-center justify-center border transition-all ${
                                isSelected 
                                ? 'bg-brand-600 text-white border-brand-600 shadow-lg shadow-brand-200' 
                                : 'bg-white border-slate-200 text-slate-500'
                            }`}
                        >
                            <span className="text-xs font-medium uppercase">{getDayLabel(day).slice(0,3)}</span>
                            <span className="text-xl font-bold">{day.getDate()}</span>
                        </button>
                    )
                })}
            </div>
          </section>

          {/* 2. Time Selection */}
          <section>
            <div className="flex items-center gap-2 mb-3 text-brand-600 font-semibold">
                <Clock size={18} />
                <h2>Escolha o Horário</h2>
            </div>
            <div className="grid grid-cols-4 gap-2">
                {timeSlots.map(time => (
                    <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`py-2 px-1 rounded-lg text-sm font-bold border transition-all ${
                            selectedTime === time
                            ? 'bg-brand-600 text-white border-brand-600'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-brand-300'
                        }`}
                    >
                        {time}
                    </button>
                ))}
            </div>
          </section>

          {/* 3. Service Selection */}
          <section>
            <div className="flex items-center gap-2 mb-3 text-brand-600 font-semibold">
                <Scissors size={18} />
                <h2>Escolha o Serviço</h2>
            </div>
            <div className="space-y-2">
                {services.length === 0 && <p className="text-sm text-gray-400 italic">Nenhum serviço listado.</p>}
                {services.map(s => (
                    <button
                        key={s.id}
                        onClick={() => setSelectedServiceId(s.id)}
                        className={`w-full p-4 rounded-xl border flex justify-between items-center transition-all ${
                            selectedServiceId === s.id
                            ? 'bg-brand-50 border-brand-500 ring-1 ring-brand-500'
                            : 'bg-white border-slate-200'
                        }`}
                    >
                        <span className={`font-medium ${selectedServiceId === s.id ? 'text-brand-700' : 'text-slate-700'}`}>{s.n}</span>
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-slate-500">{formatCurrency(s.p)}</span>
                            {selectedServiceId === s.id && <CheckCircle size={18} className="text-brand-600" />}
                        </div>
                    </button>
                ))}
            </div>
          </section>

          {/* 4. Name Input */}
          <section>
            <div className="flex items-center gap-2 mb-3 text-brand-600 font-semibold">
                <User size={18} />
                <h2>Seu Nome</h2>
            </div>
            <input 
                type="text"
                placeholder="Digite seu nome completo"
                className="w-full p-4 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none text-lg"
                value={clientName}
                onChange={e => setClientName(e.target.value)}
            />
          </section>

        </div>
      </div>

      {/* Footer Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 safe-area-bottom">
        <div className="max-w-md mx-auto">
            <button
                onClick={handleSendRequest}
                disabled={!clientName || !selectedTime || !selectedServiceId}
                className="w-full bg-brand-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
            >
                <span>Solicitar Agendamento</span>
                <Send size={18} />
            </button>
            <p className="text-center text-xs text-slate-400 mt-2">
                A solicitação será enviada para o WhatsApp da barbearia.
            </p>
        </div>
      </div>
    </div>
  );
};

export default ClientBooking;
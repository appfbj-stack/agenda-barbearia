import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Calendar, Clock, User, Send } from 'lucide-react';
import { getDayLabel } from '../utils';

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
  const startParam = searchParams.get('start') || '08:00';
  const endParam = searchParams.get('end') || '20:00';
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState('');
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

  const handleSendRequest = () => {
    if (!clientName || !selectedTime || !shopPhone) return;

    const dateStr = selectedDate.toLocaleDateString('pt-BR');

    const message = `Olá! Gostaria de agendar na *${shopName}*.\n\n👤 *Cliente:* ${clientName}\n🗓 *Data:* ${dateStr}\n⏰ *Horário:* ${selectedTime}\n\nAguardo confirmação!`;

    const encodedMessage = encodeURIComponent(message);
    // Use api.whatsapp.com for broad compatibility
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${shopPhone}&text=${encodedMessage}`;
    
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
    <div className="min-h-screen bg-white flex flex-col font-sans text-slate-900">
      {/* Header Simple */}
      <div className="bg-white p-6 border-b border-slate-100 sticky top-0 z-20 text-center">
        <h1 className="text-xl font-bold text-black">{shopName}</h1>
        <p className="text-slate-500 text-xs uppercase tracking-widest mt-1">Solicitar Horário</p>
      </div>

      <div className="flex-1 overflow-y-auto pb-32">
        <div className="max-w-md mx-auto p-5 space-y-8">
          
          {/* 1. Date Selection */}
          <section>
            <div className="flex items-center gap-2 mb-4 text-black font-bold text-sm uppercase tracking-wide">
                <Calendar size={16} />
                <h2>1. Escolha o Dia</h2>
            </div>
            <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar">
                {weekDays.map(day => {
                    const isSelected = day.toDateString() === selectedDate.toDateString();
                    return (
                        <button
                            key={day.toISOString()}
                            onClick={() => setSelectedDate(day)}
                            className={`flex-shrink-0 w-16 h-20 rounded-xl flex flex-col items-center justify-center border transition-all ${
                                isSelected 
                                ? 'bg-black text-white border-black shadow-lg shadow-black/20 transform scale-105' 
                                : 'bg-white border-slate-200 text-slate-400'
                            }`}
                        >
                            <span className="text-[10px] font-bold uppercase">{getDayLabel(day).slice(0,3)}</span>
                            <span className="text-2xl font-bold">{day.getDate()}</span>
                        </button>
                    )
                })}
            </div>
          </section>

          {/* 2. Time Selection */}
          <section>
            <div className="flex items-center gap-2 mb-4 text-black font-bold text-sm uppercase tracking-wide">
                <Clock size={16} />
                <h2>2. Escolha o Horário</h2>
            </div>
            <div className="grid grid-cols-4 gap-3">
                {timeSlots.map(time => (
                    <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`py-3 px-1 rounded-lg text-sm font-bold border transition-all ${
                            selectedTime === time
                            ? 'bg-black text-white border-black shadow-md'
                            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'
                        }`}
                    >
                        {time}
                    </button>
                ))}
            </div>
          </section>

          {/* 3. Name Input */}
          <section>
            <div className="flex items-center gap-2 mb-4 text-black font-bold text-sm uppercase tracking-wide">
                <User size={16} />
                <h2>3. Seu Nome</h2>
            </div>
            <input 
                type="text"
                placeholder="Digite seu nome..."
                className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-black focus:border-transparent outline-none text-lg text-center font-medium placeholder-slate-400"
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
                disabled={!clientName || !selectedTime}
                className="w-full bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
            >
                <span>Enviar Solicitação no WhatsApp</span>
                <Send size={18} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default ClientBooking;
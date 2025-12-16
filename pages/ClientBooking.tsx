import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Calendar, Clock, User, Send, Scissors, Check } from 'lucide-react';
import { getDayLabel, formatCurrency } from '../utils';

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

interface SimpleService {
    name: string;
    price: number;
}

const ClientBooking: React.FC = () => {
  const [searchParams] = useSearchParams();
  
  // Decodes settings from URL
  const shopName = searchParams.get('shop') || 'Barbearia';
  const shopPhone = searchParams.get('phone') || '';
  const startParam = searchParams.get('start') || '08:00';
  const endParam = searchParams.get('end') || '20:00';
  const servicesParam = searchParams.get('s') || ''; // Encoded services string
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedService, setSelectedService] = useState<SimpleService | null>(null);
  const [clientName, setClientName] = useState('');

  // Parse Services from URL (Format: Name_Price;Name_Price)
  const availableServices = useMemo(() => {
      if(!servicesParam) return [];
      try {
          return servicesParam.split(';').map(s => {
              const parts = s.split('_');
              if(parts.length < 2) return null;
              return {
                  name: parts[0],
                  price: Number(parts[1])
              } as SimpleService;
          }).filter(Boolean) as SimpleService[];
      } catch (e) {
          return [];
      }
  }, [servicesParam]);

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
    if (!clientName || !selectedTime || !shopPhone || (availableServices.length > 0 && !selectedService)) return;

    let cleanPhone = shopPhone.replace(/\D/g, '');
    if (cleanPhone.length >= 10 && cleanPhone.length <= 11) {
        cleanPhone = '55' + cleanPhone;
    }

    const dateStr = selectedDate.toLocaleDateString('pt-BR');
    
    // Construct message
    let message = `Olá! Gostaria de agendar na *${shopName}*.\n\n`;
    message += `👤 *Cliente:* ${clientName}\n`;
    message += `🗓 *Data:* ${dateStr}\n`;
    message += `⏰ *Horário:* ${selectedTime}\n`;
    if(selectedService) {
        message += `✂ *Serviço:* ${selectedService.name} (${formatCurrency(selectedService.price)})\n`;
    }
    message += `\nAguardo confirmação!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMessage}`;
    
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
      <div className="bg-white p-6 border-b border-slate-100 sticky top-0 z-20 text-center shadow-sm">
        <h1 className="text-xl font-bold text-black">{shopName}</h1>
        <p className="text-slate-500 text-xs uppercase tracking-widest mt-1">Solicitar Horário</p>
      </div>

      <div className="flex-1 overflow-y-auto pb-32">
        <div className="max-w-md mx-auto p-5 space-y-8">
          
          {/* 1. Date Selection */}
          <section>
            <div className="flex items-center gap-2 mb-4 text-black font-bold text-sm uppercase tracking-wide">
                <Calendar size={18} className="text-brand-600" />
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
                <Clock size={18} className="text-brand-600" />
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

          {/* 3. Service Selection (Only if services provided in URL) */}
          {availableServices.length > 0 && (
             <section>
                <div className="flex items-center gap-2 mb-4 text-black font-bold text-sm uppercase tracking-wide">
                    <Scissors size={18} className="text-brand-600" />
                    <h2>3. Escolha o Serviço</h2>
                </div>
                <div className="grid grid-cols-1 gap-2">
                    {availableServices.map((service, idx) => {
                        const isSelected = selectedService?.name === service.name;
                        return (
                            <button
                                key={idx}
                                onClick={() => setSelectedService(service)}
                                className={`p-4 rounded-xl border text-left transition-all flex justify-between items-center ${
                                    isSelected
                                    ? 'border-black bg-black text-white shadow-md'
                                    : 'bg-white border-slate-200 hover:border-slate-300'
                                }`}
                            >
                                <span className="font-bold">{service.name}</span>
                                <div className="flex items-center gap-3">
                                    <span className={isSelected ? 'text-brand-400' : 'text-slate-500'}>
                                        {formatCurrency(service.price)}
                                    </span>
                                    {isSelected && <Check size={18} className="text-brand-400" />}
                                </div>
                            </button>
                        )
                    })}
                </div>
             </section>
          )}

          {/* 4. Name Input */}
          <section>
            <div className="flex items-center gap-2 mb-4 text-black font-bold text-sm uppercase tracking-wide">
                <User size={18} className="text-brand-600" />
                <h2>{availableServices.length > 0 ? '4.' : '3.'} Seu Nome</h2>
            </div>
            <input 
                type="text"
                placeholder="Digite seu nome..."
                className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-black focus:border-transparent outline-none text-lg text-center font-medium placeholder-slate-400 text-black"
                value={clientName}
                onChange={e => setClientName(e.target.value)}
            />
          </section>

        </div>
      </div>

      {/* Footer Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 safe-area-bottom z-30">
        <div className="max-w-md mx-auto">
            <button
                onClick={handleSendRequest}
                disabled={!clientName || !selectedTime || (availableServices.length > 0 && !selectedService)}
                className="w-full bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
            >
                <span>Enviar no WhatsApp</span>
                <Send size={18} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default ClientBooking;
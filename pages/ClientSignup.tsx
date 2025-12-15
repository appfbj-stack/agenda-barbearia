import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { User, Phone, Send, Scissors } from 'lucide-react';

const ClientSignup: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Get config from URL params (since client doesn't have local data)
  const shopName = searchParams.get('shop') || 'Barbearia';
  const shopPhone = searchParams.get('phone') || '';

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSignup = () => {
    if (!name || !shopPhone) return;

    // Create the message the client will send to the barber
    const message = `Olá! Quero me cadastrar na *${shopName}*.\n\n👤 Nome: ${name}\n📱 Telefone: ${phone || 'Mesmo deste WhatsApp'}`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${shopPhone}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  if (!shopPhone) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center text-red-500 mb-4">
          <Phone size={32} />
        </div>
        <h1 className="text-xl font-bold mb-2">Link Incompleto</h1>
        <p className="text-zinc-400">O barbeiro precisa configurar o telefone nas configurações do app para gerar este link corretamente.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      {/* Header */}
      <div className="p-6 text-center border-b border-zinc-900 bg-zinc-950">
        <div className="w-12 h-12 bg-brand-500 rounded-xl flex items-center justify-center mx-auto mb-3 text-black shadow-lg shadow-brand-500/20">
          <Scissors size={24} />
        </div>
        <h1 className="text-xl font-bold">Cadastro Rápido</h1>
        <p className="text-brand-500 font-medium">{shopName}</p>
      </div>

      <div className="flex-1 p-6 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <p className="text-zinc-400 text-sm text-center">
            Preencha seus dados abaixo para enviar seu cadastro diretamente para o nosso WhatsApp.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-brand-500 uppercase mb-2">Seu Nome</label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 text-zinc-500" size={18} />
                <input 
                  type="text"
                  placeholder="Ex: João Silva"
                  className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent text-white placeholder-zinc-600 transition-all outline-none"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-brand-500 uppercase mb-2">Seu Telefone (Opcional)</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 text-zinc-500" size={18} />
                <input 
                  type="tel"
                  placeholder="DDD + Número"
                  className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent text-white placeholder-zinc-600 transition-all outline-none"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
              </div>
            </div>
          </div>

          <button 
            onClick={handleSignup}
            disabled={!name}
            className="w-full bg-brand-500 hover:bg-brand-400 text-black font-bold py-4 rounded-xl shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Enviar Cadastro</span>
            <Send size={18} />
          </button>
        </div>
      </div>

      <div className="p-6 text-center text-zinc-600 text-xs">
        <p>Ao clicar em enviar, seu WhatsApp será aberto.</p>
      </div>
    </div>
  );
};

export default ClientSignup;
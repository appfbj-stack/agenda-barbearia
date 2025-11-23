import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Scissors, Calendar, TrendingUp, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAppStore } from '../store';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { settings } = useAppStore();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden font-sans">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[40%] bg-brand-600/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[40%] bg-brand-900/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* CSS for Animations */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
        }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
      `}</style>

      {/* Header */}
      <header className="p-6 flex justify-between items-center z-10 animate-fade-up">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-600/20">
            <Scissors className="text-black" size={24} />
          </div>
          <span className="font-bold text-xl tracking-tight">
            {settings.shopName ? (
              <span className="text-white">{settings.shopName}</span>
            ) : (
              <>BarberAgenda <span className="text-brand-500">Pro</span></>
            )}
          </span>
        </div>
        <button 
          onClick={() => navigate('/agenda')}
          className="text-sm font-semibold text-gray-300 hover:text-white transition-colors"
        >
          Entrar
        </button>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10">
        
        <h1 className="text-5xl font-extrabold leading-tight mb-6 animate-fade-up delay-200">
          <span className="text-brand-300 drop-shadow-lg block">A revolução da sua</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-600">
            {settings.shopName || 'Barbearia'}
          </span>
        </h1>

        <p className="text-gray-400 text-lg max-w-xs mb-10 animate-fade-up delay-300">
          Abandone o papel. Organize sua agenda, controle o financeiro e fidelize clientes em um só lugar.
        </p>

        <button 
          onClick={() => navigate('/agenda')}
          className="group relative w-full max-w-xs bg-brand-600 hover:bg-brand-500 text-black font-bold py-4 rounded-xl text-lg shadow-xl shadow-brand-600/20 transition-all transform hover:scale-105 active:scale-95 animate-fade-up delay-300 flex items-center justify-center gap-2"
        >
          Começar Agora
          <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
        </button>

        {/* Features Grid */}
        <div className="grid grid-cols-3 gap-4 mt-16 w-full max-w-md animate-fade-up delay-300">
          <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm">
            <Calendar className="text-brand-500" size={24} />
            <span className="text-xs font-medium text-gray-300">Agenda</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm">
            <TrendingUp className="text-brand-500" size={24} />
            <span className="text-xs font-medium text-gray-300">Financeiro</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm">
            <ShieldCheck className="text-brand-500" size={24} />
            <span className="text-xs font-medium text-gray-300">Seguro</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-zinc-600 text-xs animate-fade-up delay-300">
        <p>© 2024 {settings.shopName || 'BarberAgenda Pro'}. Feito para profissionais.</p>
      </footer>
    </div>
  );
};

export default Landing;
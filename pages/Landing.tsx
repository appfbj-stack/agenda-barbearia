import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Scissors, Calendar, TrendingUp, Users, CheckCircle, ArrowRight, Star, Smartphone } from 'lucide-react';
import { useAppStore } from '../store';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { settings } = useAppStore();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-brand-500 selection:text-black">
      
      {/* --- Background Effects --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-brand-600/10 rounded-full blur-[120px] opacity-50"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-brand-900/10 rounded-full blur-[120px] opacity-50"></div>
        <div className="absolute top-[40%] left-[50%] transform -translate-x-1/2 w-[80%] h-[40%] bg-white/5 rounded-full blur-[100px] opacity-20"></div>
      </div>

      {/* --- CSS Animations --- */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes shine {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .text-shine {
          background: linear-gradient(to right, #f59e0b 20%, #fde68a 50%, #f59e0b 80%);
          background-size: 200% auto;
          color: transparent;
          -webkit-background-clip: text;
          background-clip: text;
          animation: shine 4s linear infinite;
        }
      `}</style>

      {/* --- Header --- */}
      <nav className="relative z-50 w-full px-6 py-6 flex justify-between items-center max-w-5xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Scissors className="text-black" size={22} strokeWidth={2.5} />
          </div>
          <span className="font-bold text-xl tracking-tight hidden sm:block text-[#ffffff]">
            {settings.shopName || 'BarberAgenda'}
          </span>
        </div>
        <button 
          onClick={() => navigate('/agenda')}
          className="px-5 py-2 rounded-full border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-[#ffffff] text-sm font-medium transition-all backdrop-blur-md"
        >
          Acessar Sistema
        </button>
      </nav>

      {/* --- Hero Section --- */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pt-10 pb-20 text-center max-w-4xl mx-auto">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-900/20 border border-brand-500/30 text-brand-400 text-xs font-semibold uppercase tracking-wider mb-8 animate-fade-in-up">
          <Star size={12} fill="currentColor" />
          <span>Gestão Simplificada</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-7xl font-extrabold leading-tight mb-6 tracking-tight">
          <span className="text-[#ffffff] drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">A revolução da sua</span> <br />
          <span className="text-shine">{settings.shopName || 'Barbearia'}</span>
        </h1>

        <p className="text-zinc-400 text-lg sm:text-xl max-w-xl mb-10 leading-relaxed">
          O sistema definitivo para organizar sua agenda, controlar o caixa e fidelizar clientes. Sem mensalidades, funciona offline.
        </p>

        {/* CTA Button */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center items-center">
          <button 
            onClick={() => navigate('/agenda')}
            className="group relative px-8 py-4 bg-brand-500 hover:bg-brand-400 text-black font-bold text-lg rounded-2xl shadow-[0_0_40px_-10px_rgba(245,158,11,0.5)] transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3 w-full sm:w-auto justify-center"
          >
            <span>Começar Agora</span>
            <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
          </button>
          
          <button 
            onClick={() => navigate('/admin')}
             className="px-8 py-4 text-zinc-400 hover:text-white font-medium transition-colors flex items-center gap-2"
          >
            Configurar Barbearia
          </button>
        </div>

        {/* --- 3D Mockup Visual (CSS Only) --- */}
        <div className="mt-20 relative w-full max-w-xs sm:max-w-sm animate-float">
          {/* Back Glow */}
          <div className="absolute inset-0 bg-brand-500/20 blur-[60px] rounded-full"></div>
          
          {/* Card Representation */}
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-2xl rotate-[-6deg] hover:rotate-0 transition-transform duration-500 ease-out">
            {/* Fake Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
              </div>
              <div className="text-xs text-zinc-500 font-mono">APP</div>
            </div>
            
            {/* Fake Appointment Item 1 */}
            <div className="bg-zinc-800/50 rounded-xl p-3 mb-3 flex items-center gap-3 border border-zinc-700/50">
               <div className="w-10 h-10 rounded-lg bg-brand-500 flex items-center justify-center text-black font-bold text-xs">09:00</div>
               <div className="flex-1">
                 <div className="h-2 w-20 bg-zinc-600 rounded mb-1.5"></div>
                 <div className="h-2 w-12 bg-zinc-700 rounded"></div>
               </div>
               <div className="w-6 h-6 rounded-full border-2 border-brand-500 flex items-center justify-center">
                 <div className="w-3 h-3 bg-brand-500 rounded-full"></div>
               </div>
            </div>
            
             {/* Fake Appointment Item 2 */}
            <div className="bg-zinc-800/50 rounded-xl p-3 flex items-center gap-3 border border-zinc-700/50 opacity-50">
               <div className="w-10 h-10 rounded-lg bg-zinc-700 flex items-center justify-center text-zinc-400 font-bold text-xs">10:00</div>
               <div className="flex-1">
                 <div className="h-2 w-24 bg-zinc-600 rounded mb-1.5"></div>
                 <div className="h-2 w-16 bg-zinc-700 rounded"></div>
               </div>
            </div>

            {/* Floating Badge */}
            <div className="absolute -right-4 top-10 bg-[#ffffff] text-black text-xs font-bold px-3 py-1.5 rounded-lg shadow-xl rotate-[12deg]">
              R$ 85,00
            </div>
          </div>
        </div>

      </main>

      {/* --- Features Grid --- */}
      <section className="relative z-10 px-6 py-20 bg-zinc-950/50 backdrop-blur-lg border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12 text-[#ffffff]">
            Tudo o que você precisa em um só lugar
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<Calendar size={28} />}
              title="Agenda Inteligente"
              desc="Visualize seus horários, encaixe clientes e evite conflitos com poucos cliques."
            />
            <FeatureCard 
              icon={<TrendingUp size={28} />}
              title="Controle Financeiro"
              desc="Saiba exatamente quanto faturou no dia, na semana e no mês. Adeus caderninho."
            />
             <FeatureCard 
              icon={<Users size={28} />}
              title="Histórico de Clientes"
              desc="Lembre das preferências de cada cliente e envie lembretes personalizados."
            />
          </div>
        </div>
      </section>

      {/* --- Mobile App Section --- */}
      <section className="relative z-10 px-6 py-16 text-center border-t border-white/5 bg-black">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="mx-auto w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-4 text-brand-500">
            <Smartphone size={32} />
          </div>
          <h2 className="text-3xl font-bold text-[#ffffff]">Instale no seu celular</h2>
          <p className="text-zinc-400">
            Acesse o menu do seu navegador e clique em <strong>"Adicionar à Tela Inicial"</strong> para usar como um aplicativo nativo. Funciona mesmo sem internet.
          </p>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="relative z-10 py-8 text-center text-zinc-600 text-sm border-t border-zinc-900">
        <p>© {new Date().getFullYear()} {settings.shopName}. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode, title: string, desc: string }> = ({ icon, title, desc }) => (
  <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl hover:border-brand-500/50 transition-colors group">
    <div className="text-brand-500 mb-4 group-hover:scale-110 transition-transform duration-300 inline-block">
      {icon}
    </div>
    <h3 className="text-lg font-bold text-[#ffffff] mb-2">{title}</h3>
    <p className="text-zinc-400 text-sm leading-relaxed">{desc}</p>
  </div>
);

export default Landing;
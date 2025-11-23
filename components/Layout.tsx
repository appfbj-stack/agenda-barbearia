import React from 'react';
import { Calendar, Users, Scissors, PieChart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  // Helper to check active state, treating /agenda as the main active for root-like feel if needed
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/agenda', icon: Calendar, label: 'Agenda' },
    { path: '/clients', icon: Users, label: 'Clientes' },
    { path: '/services', icon: Scissors, label: 'Serviços' },
    { path: '/finance', icon: PieChart, label: 'Financeiro' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <main className="flex-1 pb-20 max-w-2xl mx-auto w-full bg-white min-h-screen shadow-sm">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 safe-area-bottom z-50">
        <div className="max-w-2xl mx-auto flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                  active ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Icon size={24} strokeWidth={active ? 2.5 : 2} />
                <span className="text-[10px] mt-1 font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
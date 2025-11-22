import React, { useMemo } from 'react';
import { useAppStore } from '../store';
import { formatCurrency, getTodayDateString } from '../utils';
import { PaymentStatus, AppointmentStatus } from '../types';
import { TrendingUp, DollarSign, Calendar, CheckCircle, Clock } from 'lucide-react';

const Finance: React.FC = () => {
  const { appointments } = useAppStore();

  const stats = useMemo(() => {
    const today = getTodayDateString();
    
    // Filter active appointments
    const active = appointments.filter(a => a.status !== AppointmentStatus.CANCELLED);
    
    const totalRevenue = active.reduce((sum, a) => sum + a.price, 0);
    const paidRevenue = active
      .filter(a => a.paymentStatus === PaymentStatus.PAID)
      .reduce((sum, a) => sum + a.price, 0);
      
    const pendingRevenue = totalRevenue - paidRevenue;
    
    const todayAppointments = active.filter(a => a.date === today);
    const todayRevenue = todayAppointments.reduce((sum, a) => sum + a.price, 0);

    return {
      totalRevenue,
      paidRevenue,
      pendingRevenue,
      todayRevenue,
      count: active.length
    };
  }, [appointments]);

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="p-4 border-b bg-white">
        <h1 className="text-xl font-bold text-brand-500">Financeiro</h1>
        <p className="text-sm text-gray-500">Resumo geral</p>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto">
        {/* Main Card */}
        <div className="bg-brand-600 text-white rounded-2xl p-6 shadow-lg shadow-brand-200">
          <div className="flex items-center space-x-2 opacity-80 mb-2">
             <DollarSign size={20} />
             <span className="font-medium text-black">Faturamento Hoje</span>
          </div>
          <div className="text-4xl font-bold tracking-tight text-black">
            {formatCurrency(stats.todayRevenue)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-green-600 mb-2">
               <CheckCircle size={18} />
               <span className="text-sm font-medium">Recebido</span>
            </div>
            <div className="text-xl font-bold text-brand-500">{formatCurrency(stats.paidRevenue)}</div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-orange-500 mb-2">
               <Clock size={18} />
               <span className="text-sm font-medium">Pendente</span>
            </div>
            <div className="text-xl font-bold text-brand-500">{formatCurrency(stats.pendingRevenue)}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-semibold text-brand-500 mb-4 flex items-center">
            <TrendingUp size={18} className="mr-2 text-brand-600" />
            Performance Total
          </h3>
          
          <div className="space-y-4">
             <div className="flex justify-between items-center pb-2 border-b border-gray-50">
               <span className="text-gray-500 text-sm">Total de Agendamentos</span>
               <span className="font-bold text-brand-500">{stats.count}</span>
             </div>
             <div className="flex justify-between items-center pb-2 border-b border-gray-50">
               <span className="text-gray-500 text-sm">Ticket Médio</span>
               <span className="font-bold text-brand-500">
                 {stats.count > 0 ? formatCurrency(stats.totalRevenue / stats.count) : 'R$ 0,00'}
               </span>
             </div>
             <div className="flex justify-between items-center">
               <span className="text-gray-500 text-sm">Faturamento Total</span>
               <span className="font-bold text-brand-600">{formatCurrency(stats.totalRevenue)}</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Finance;
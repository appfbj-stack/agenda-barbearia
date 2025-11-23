import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Scissors, Clock, Plus, Trash2, Store, Phone, Save, Check } from 'lucide-react';
import { formatCurrency } from '../utils';

const Services: React.FC = () => {
  const { services, addService, deleteService, settings, updateSettings } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newService, setNewService] = useState({ name: '', price: '', duration: '30' });

  // Local state for settings
  const [shopName, setShopName] = useState(settings.shopName);
  const [shopPhone, setShopPhone] = useState(settings.shopPhone);
  
  // Feedback state
  const [isSaved, setIsSaved] = useState(false);

  const handleAdd = () => {
    if (!newService.name || !newService.price) return;
    addService({
      name: newService.name,
      price: Number(newService.price),
      durationMinutes: Number(newService.duration)
    });
    setIsModalOpen(false);
    setNewService({ name: '', price: '', duration: '30' });
  };

  const handleSaveSettings = () => {
    updateSettings({ shopName, shopPhone });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
        <h1 className="text-xl font-bold text-brand-500">Serviços e Loja</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-600 text-black p-2 rounded-lg text-sm font-bold flex items-center hover:bg-brand-500"
        >
          <Plus size={16} className="mr-1" /> Adicionar
        </button>
      </div>

      <div className="p-4 space-y-6 overflow-y-auto">
        
        {/* Settings Card */}
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-brand-500 font-semibold border-b border-gray-200 pb-2">
            <Store size={18} />
            <h2>Dados da Barbearia</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-brand-500 font-medium ml-1">Nome do Estabelecimento</label>
              <input 
                type="text"
                className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 placeholder-gray-400 focus:ring-brand-500 focus:border-brand-500"
                placeholder="Ex: Barbearia do Silva"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-brand-500 font-medium ml-1">WhatsApp da Barbearia</label>
              <input 
                type="tel"
                className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 placeholder-gray-400 focus:ring-brand-500 focus:border-brand-500"
                placeholder="Ex: 11999999999"
                value={shopPhone}
                onChange={(e) => setShopPhone(e.target.value)}
              />
              <p className="text-[10px] text-gray-400 mt-1 ml-1">Usado para compartilhar agendamentos.</p>
            </div>
            
            <button 
              onClick={handleSaveSettings}
              className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                isSaved 
                  ? 'bg-green-500 text-white' 
                  : 'bg-brand-600 text-black hover:bg-brand-500'
              }`}
            >
              {isSaved ? (
                <>
                  <Check size={18} /> Salvo!
                </>
              ) : (
                <>
                  <Save size={18} /> Salvar Dados
                </>
              )}
            </button>
          </div>
        </div>

        {/* Services List */}
        <div className="space-y-3">
          <h3 className="font-bold text-gray-500 ml-1">Lista de Serviços</h3>
          {services.map(service => (
            <div key={service.id} className="border border-gray-100 bg-gray-50 rounded-lg p-4 shadow-sm flex justify-between items-center hover:border-gray-300 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-900/20 flex items-center justify-center text-brand-600">
                  <Scissors size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-brand-500">{service.name}</h3>
                  <div className="flex items-center text-sm text-gray-500 mt-0.5">
                    <Clock size={12} className="mr-1" /> {service.durationMinutes} min
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-brand-600">{formatCurrency(service.price)}</div>
                <button 
                  onClick={() => deleteService(service.id)}
                  className="text-xs text-red-400 mt-1 hover:text-red-500 transition-colors"
                >
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-5 space-y-4 border border-gray-200">
            <h3 className="font-bold text-lg text-brand-500">Novo Serviço</h3>
            <input 
              placeholder="Nome do serviço"
              className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 placeholder-gray-400"
              value={newService.name}
              onChange={e => setNewService({...newService, name: e.target.value})}
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Preço (R$)</label>
                <input 
                  type="number"
                  className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50"
                  value={newService.price}
                  onChange={e => setNewService({...newService, price: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Tempo (min)</label>
                <input 
                  type="number"
                  step="5"
                  className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50"
                  value={newService.duration}
                  onChange={e => setNewService({...newService, duration: e.target.value})}
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-400 rounded-lg font-medium hover:bg-gray-200 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleAdd}
                className="flex-1 py-3 bg-brand-600 text-black rounded-lg font-bold hover:bg-brand-500 transition-colors"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;
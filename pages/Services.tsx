import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Scissors, Clock, Plus, Trash2, Copy, Check, MessageCircle } from 'lucide-react';
import { formatCurrency } from '../utils';

const Services: React.FC = () => {
  const { services, addService, deleteService, settings } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newService, setNewService] = useState({ name: '', price: '', duration: '30' });
  const [isCopied, setIsCopied] = useState(false);

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

  const getShareUrl = () => {
      const baseUrl = window.location.href.split('#')[0];
      // Admin saves phone. We clean it here.
      let cleanPhone = (settings.shopPhone || '').replace(/\D/g, '');
      // Auto-fix Brazil country code if missing (common user error)
      if (cleanPhone.length >= 10 && cleanPhone.length <= 11) {
          cleanPhone = '55' + cleanPhone;
      }

      const encodedShop = encodeURIComponent(settings.shopName);
      const start = settings.workStartTime || '08:00';
      const end = settings.workEndTime || '20:00';

      return `${baseUrl}#/agendar?phone=${cleanPhone}&shop=${encodedShop}&start=${start}&end=${end}`;
  };

  // DIRECT WHATSAPP ACTION
  const handleDirectWhatsApp = () => {
      if(!settings.shopPhone) {
          alert('Configure o telefone da barbearia no menu Admin primeiro.');
          return;
      }
      const url = getShareUrl();
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(url)}`;
      window.open(whatsappUrl, '_blank');
  }

  const handleCopy = async () => {
      const text = getShareUrl();
      // 1. Modern API
      if (navigator.clipboard && navigator.clipboard.writeText) {
          try {
              await navigator.clipboard.writeText(text);
              setIsCopied(true);
              setTimeout(() => setIsCopied(false), 2000);
              return;
          } catch (e) {
              console.warn("Clipboard API failed");
          }
      }
      
      // 2. Fallback
      try {
          const textArea = document.createElement("textarea");
          textArea.value = text;
          textArea.style.position = 'fixed';
          textArea.style.left = '-9999px';
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
          prompt("Copie o link manualmente:", text);
      }
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="p-4 border-b bg-white sticky top-0 z-10 flex justify-between items-center">
        <h1 className="text-xl font-bold text-brand-500">Serviços</h1>
        <div className="flex gap-2">
            {/* Direct Copy Button */}
            <button 
                onClick={handleCopy}
                className={`p-2 rounded-lg text-sm font-bold flex items-center border transition-all active:scale-95 ${
                    isCopied 
                    ? 'bg-green-100 text-green-700 border-green-200' 
                    : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                }`}
                title="Copiar Link"
            >
                {isCopied ? <Check size={20} /> : <Copy size={20} />}
            </button>

            {/* Direct WhatsApp Button */}
            <button 
                onClick={handleDirectWhatsApp}
                className="bg-[#25D366] text-white p-2 rounded-lg text-sm font-bold flex items-center shadow-sm active:scale-95 transition-transform"
                title="Enviar no WhatsApp"
            >
                <MessageCircle size={20} />
            </button>

            {/* Add Button */}
            <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-brand-600 text-black p-2 rounded-lg text-sm font-bold flex items-center hover:bg-brand-500 active:scale-95 transition-transform ml-2"
            >
                <Plus size={20} />
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {services.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <Scissors size={48} className="mx-auto mb-3 opacity-20" />
            <p>Nenhum serviço cadastrado.</p>
          </div>
        ) : (
          services.map(service => (
            <div key={service.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-brand-500">{service.name}</h3>
                <div className="flex items-center text-sm text-gray-400 mt-1 space-x-3">
                  <span className="flex items-center">
                    <Clock size={12} className="mr-1" /> {service.durationMinutes} min
                  </span>
                  <span className="font-bold text-brand-600">
                    {formatCurrency(service.price)}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => {
                   if(confirm('Remover serviço?')) deleteService(service.id);
                }}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors active:scale-95"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-5 space-y-4 border border-gray-200">
            <h3 className="font-bold text-lg text-brand-500">Novo Serviço</h3>
            
            <input 
              placeholder="Nome do serviço"
              className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 placeholder-gray-400"
              autoFocus
              value={newService.name}
              onChange={e => setNewService({...newService, name: e.target.value})}
            />
            
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-brand-500 font-medium ml-1">Preço (R$)</label>
                <input 
                  type="number"
                  placeholder="0.00"
                  className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 placeholder-gray-400"
                  value={newService.price}
                  onChange={e => setNewService({...newService, price: e.target.value})}
                />
              </div>
              <div className="flex-1">
                 <label className="text-xs text-brand-500 font-medium ml-1">Duração (min)</label>
                 <select 
                    className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-700"
                    value={newService.duration}
                    onChange={e => setNewService({...newService, duration: e.target.value})}
                 >
                    <option value="15">15 min</option>
                    <option value="20">20 min</option>
                    <option value="30">30 min</option>
                    <option value="40">40 min</option>
                    <option value="45">45 min</option>
                    <option value="50">50 min</option>
                    <option value="60">1h</option>
                    <option value="90">1h 30m</option>
                 </select>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-400 rounded-lg font-medium hover:bg-gray-200 hover:text-white transition-colors active:scale-95"
              >
                Cancelar
              </button>
              <button 
                onClick={handleAdd}
                className="flex-1 py-3 bg-brand-600 text-black rounded-lg font-bold hover:bg-brand-500 transition-colors active:scale-95"
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
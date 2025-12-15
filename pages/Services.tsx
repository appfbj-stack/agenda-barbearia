import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Scissors, Clock, Plus, Trash2, Share2, Copy, Check, MessageCircle } from 'lucide-react';
import { formatCurrency } from '../utils';

const Services: React.FC = () => {
  const { services, addService, deleteService, settings } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
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
      const simpleServices = services.map(s => ({ id: s.id, n: s.name, p: s.price }));
      const servicesJson = JSON.stringify(simpleServices);
      const encodedServices = encodeURIComponent(servicesJson);
      
      const baseUrl = window.location.href.split('#')[0];
      const cleanPhone = (settings.shopPhone || '').replace(/\D/g, '');
      const encodedShop = encodeURIComponent(settings.shopName);
      
      const start = settings.workStartTime || '08:00';
      const end = settings.workEndTime || '20:00';

      return `${baseUrl}#/agendar?phone=${cleanPhone}&shop=${encodedShop}&start=${start}&end=${end}&s=${encodedServices}`;
  };

  const handleShareClick = () => {
      if(!settings.shopPhone) {
          alert('Configure o telefone da barbearia no menu Admin primeiro.');
          return;
      }
      setIsShareModalOpen(true);
      setIsCopied(false);
  }

  const handleCopySuccess = () => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      setTimeout(() => setIsShareModalOpen(false), 2500); 
  }

  const performCopy = async (text: string) => {
      // 1. Modern API
      if (navigator.clipboard && navigator.clipboard.writeText) {
          try {
              await navigator.clipboard.writeText(text);
              handleCopySuccess();
              return true;
          } catch (e) {
              console.warn("Clipboard API failed");
          }
      }
      
      // 2. iOS/WebView Fallback
      try {
          const textArea = document.createElement("textarea");
          textArea.value = text;
          
          textArea.style.position = 'fixed';
          textArea.style.top = '0';
          textArea.style.left = '0';
          textArea.style.width = '2em';
          textArea.style.height = '2em';
          textArea.style.padding = '0';
          textArea.style.border = 'none';
          textArea.style.outline = 'none';
          textArea.style.boxShadow = 'none';
          textArea.style.background = 'transparent';
          textArea.style.opacity = '0.1';
          textArea.setAttribute('readonly', '');
          
          document.body.appendChild(textArea);
          
          const range = document.createRange();
          range.selectNodeContents(textArea);
          const selection = window.getSelection();
          if (selection) {
              selection.removeAllRanges();
              selection.addRange(range);
          }
          textArea.setSelectionRange(0, 999999);
          
          const successful = document.execCommand('copy');
          document.body.removeChild(textArea);
          
          if (successful) {
              handleCopySuccess();
              return true;
          }
      } catch (fallbackErr) {
          prompt("Copie o link manualmente:", text);
          return false;
      }
  };

  const copyToClipboard = () => {
      const url = getShareUrl();
      performCopy(url);
  }

  const shareWhatsApp = () => {
      const url = getShareUrl();
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(url)}`;
      window.open(whatsappUrl, '_blank');
  };

  const shareNative = async () => {
      const url = getShareUrl();
      if (navigator.share) {
          try {
              await navigator.share({
                  title: `Agendar - ${settings.shopName}`,
                  text: `Agende seu horário na ${settings.shopName} pelo link abaixo:`,
                  url: url
              });
          } catch (err) {
             console.log("Share cancelled");
          }
      } else {
          shareWhatsApp();
      }
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="p-4 border-b bg-white sticky top-0 z-10 flex justify-between items-center">
        <h1 className="text-xl font-bold text-brand-500">Serviços</h1>
        <div className="flex gap-2">
            <button 
                onClick={handleShareClick}
                className="bg-brand-100 text-brand-700 p-2 rounded-lg text-sm font-bold flex items-center hover:bg-brand-200 border border-brand-200 active:scale-95 transition-transform"
                title="Link de Agendamento"
            >
                <Share2 size={16} />
            </button>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-brand-600 text-black p-2 rounded-lg text-sm font-bold flex items-center hover:bg-brand-500 active:scale-95 transition-transform"
            >
                <Plus size={16} className="mr-1" /> Novo
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

      {isShareModalOpen && (
         <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
             <div className="bg-white rounded-xl w-full max-w-sm p-5 border border-gray-200 text-center">
                <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-3 text-brand-600">
                    <Share2 size={24} />
                </div>
                <h3 className="font-bold text-lg text-brand-500 mb-2">Link de Agendamento</h3>
                <p className="text-gray-500 text-sm mb-4">Envie este link para seu cliente escolher o horário e serviço.</p>
                
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-4 break-all text-xs text-gray-500 font-mono max-h-24 overflow-y-auto select-all">
                    {getShareUrl()}
                </div>

                <div className="flex gap-2 flex-col">
                   <div className="flex gap-2">
                        <button 
                            onClick={copyToClipboard}
                            className={`flex-1 py-3 rounded-lg font-bold border flex items-center justify-center gap-2 transition-all active:scale-95 ${
                                isCopied 
                                ? 'bg-green-500 text-white border-green-500' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300'
                            }`}
                        >
                            {isCopied ? <Check size={16} /> : <Copy size={16} />} 
                            {isCopied ? 'Copiado!' : 'Copiar'}
                        </button>
                        <button 
                            onClick={shareWhatsApp}
                            className="flex-1 py-3 bg-[#25D366] text-white rounded-lg font-bold flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all"
                        >
                            <MessageCircle size={18} /> WhatsApp
                        </button>
                   </div>
                   <div className="flex gap-2">
                        <button 
                            onClick={() => setIsShareModalOpen(false)}
                            className="flex-1 py-3 bg-white text-gray-500 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 active:scale-95 transition-all"
                        >
                            Fechar
                        </button>
                        <button 
                            onClick={shareNative}
                            className="flex-1 py-3 bg-brand-600 text-black rounded-lg font-bold hover:bg-brand-500 flex items-center justify-center gap-2 active:scale-95 transition-all"
                        >
                            <Share2 size={16} /> Outros
                        </button>
                   </div>
                </div>
             </div>
         </div>
      )}
    </div>
  );
};

export default Services;
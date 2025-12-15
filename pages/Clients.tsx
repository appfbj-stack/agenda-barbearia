import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Search, Phone, User, Calendar, Plus, X, Share2, Copy, Check, MessageCircle } from 'lucide-react';
import { Client } from '../types';

const Clients: React.FC = () => {
  const { clients, addClient, deleteClient, appointments, settings } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', phone: '', notes: '' });
  const [isCopied, setIsCopied] = useState(false);

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  const getClientHistoryCount = (clientId: string) => {
    return appointments.filter(a => a.clientId === clientId).length;
  };

  const handleAdd = () => {
    if (!newClient.name) return;
    addClient(newClient);
    setIsModalOpen(false);
    setNewClient({ name: '', phone: '', notes: '' });
  };

  const handleShareLink = () => {
    if (!settings.shopPhone) {
        alert("Configure o telefone da barbearia no menu Admin primeiro.");
        return;
    }
    setIsShareModalOpen(true);
    setIsCopied(false);
  };

  const getShareUrl = () => {
      const baseUrl = window.location.href.split('#')[0];
      const cleanPhone = settings.shopPhone.replace(/\D/g, '');
      const encodedShop = encodeURIComponent(settings.shopName);
      return `${baseUrl}#/cadastro?phone=${cleanPhone}&shop=${encodedShop}`;
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
                  title: `Cadastro - ${settings.shopName}`,
                  text: `Cadastre-se na ${settings.shopName} para agendar seu horário!`,
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
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-white sticky top-0 z-10">
        <div className="flex justify-between items-center mb-4 gap-2">
          <h1 className="text-xl font-bold text-brand-500">Clientes</h1>
          <div className="flex gap-2">
            <button 
                onClick={handleShareLink}
                className="bg-brand-100 text-brand-700 p-2 rounded-lg text-sm font-bold flex items-center hover:bg-brand-200 border border-brand-200 active:scale-95 transition-transform"
                title="Link de Auto-Cadastro"
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
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Buscar por nome ou telefone..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-brand-500 placeholder-gray-400"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
        {filteredClients.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <User size={48} className="mx-auto mb-3 opacity-20" />
            <p>Nenhum cliente encontrado.</p>
          </div>
        ) : (
          filteredClients.map(client => (
            <div key={client.id} className="bg-gray-50 border border-gray-100 rounded-lg p-4 shadow-sm flex justify-between items-center hover:border-gray-300 transition-colors">
              <div>
                <h3 className="font-semibold text-brand-500">{client.name}</h3>
                <div className="flex items-center text-sm text-gray-500 mt-1 space-x-3">
                  {client.phone && (
                    <span className="flex items-center">
                      <Phone size={12} className="mr-1" /> {client.phone}
                    </span>
                  )}
                  <span className="flex items-center text-brand-600 font-medium">
                    <Calendar size={12} className="mr-1" /> {getClientHistoryCount(client.id)} visitas
                  </span>
                </div>
              </div>
              <button 
                onClick={() => {
                   if(confirm('Remover cliente?')) deleteClient(client.id);
                }}
                className="p-2 text-gray-500 hover:text-red-500 transition-colors active:scale-95"
              >
                <X size={18} />
              </button>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-5 space-y-4 border border-gray-200">
            <h3 className="font-bold text-lg text-brand-500">Novo Cliente</h3>
            <input 
              placeholder="Nome do cliente"
              className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 placeholder-gray-400"
              autoFocus
              value={newClient.name}
              onChange={e => setNewClient({...newClient, name: e.target.value})}
            />
            <input 
              placeholder="Telefone (WhatsApp)"
              className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 placeholder-gray-400"
              value={newClient.phone}
              onChange={e => setNewClient({...newClient, phone: e.target.value})}
            />
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
                <h3 className="font-bold text-lg text-brand-500 mb-2">Link de Cadastro</h3>
                <p className="text-gray-500 text-sm mb-4">Envie este link para seu cliente se cadastrar sozinho. Os dados chegarão no seu WhatsApp.</p>
                
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-4 break-all text-xs text-gray-500 font-mono select-all">
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

export default Clients;
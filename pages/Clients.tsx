import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Search, Phone, User, Calendar, Plus, X, Copy, Check, MessageCircle } from 'lucide-react';

const Clients: React.FC = () => {
  const { clients, addClient, deleteClient, appointments, settings } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const getShareUrl = () => {
      const baseUrl = window.location.href.split('#')[0];
      
      let cleanPhone = (settings.shopPhone || '').replace(/\D/g, '');
      if (cleanPhone.length >= 10 && cleanPhone.length <= 11) {
          cleanPhone = '55' + cleanPhone;
      }

      const encodedShop = encodeURIComponent(settings.shopName);
      return `${baseUrl}#/cadastro?phone=${cleanPhone}&shop=${encodedShop}`;
  }

  // DIRECT WHATSAPP ACTION
  const handleDirectWhatsApp = () => {
      if(!settings.shopPhone) {
          alert("Configure o telefone da barbearia no menu Admin primeiro.");
          return;
      }
      const url = getShareUrl();
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(url)}`;
      window.open(whatsappUrl, '_blank');
  };

  const handleCopy = async () => {
      const text = getShareUrl();
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
      } catch (fallbackErr) {
          prompt("Copie o link manualmente:", text);
      }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-white sticky top-0 z-10">
        <div className="flex justify-between items-center mb-4 gap-2">
          <h1 className="text-xl font-bold text-brand-500">Clientes</h1>
          <div className="flex gap-2">
            
            {/* Direct Copy Button */}
            <button 
                onClick={handleCopy}
                className={`p-2 rounded-lg text-sm font-bold flex items-center border transition-all active:scale-95 ${
                    isCopied 
                    ? 'bg-green-100 text-green-700 border-green-200' 
                    : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                }`}
                title="Copiar Link de Cadastro"
            >
                {isCopied ? <Check size={20} /> : <Copy size={20} />}
            </button>

            {/* Direct WhatsApp Button */}
            <button 
                onClick={handleDirectWhatsApp}
                className="bg-[#25D366] text-white p-2 rounded-lg text-sm font-bold flex items-center shadow-sm active:scale-95 transition-transform"
                title="Enviar Link de Cadastro no Zap"
            >
                <MessageCircle size={20} />
            </button>

            {/* Add Button */}
            <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-brand-600 text-black p-2 rounded-lg text-sm font-bold flex items-center hover:bg-brand-500 active:scale-95 transition-transform ml-2"
            >
                <Plus size={20} className="mr-1" /> Novo
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
    </div>
  );
};

export default Clients;
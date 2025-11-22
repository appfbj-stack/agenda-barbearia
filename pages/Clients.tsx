import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Search, Phone, User, Calendar, Plus, X } from 'lucide-react';
import { Client } from '../types';

const Clients: React.FC = () => {
  const { clients, addClient, deleteClient, appointments } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', phone: '', notes: '' });

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

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-white sticky top-0 z-10">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-brand-500">Clientes</h1>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-brand-600 text-black p-2 rounded-lg text-sm font-bold flex items-center hover:bg-brand-500"
          >
            <Plus size={16} className="mr-1" /> Novo
          </button>
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
                className="p-2 text-gray-500 hover:text-red-500 transition-colors"
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

export default Clients;
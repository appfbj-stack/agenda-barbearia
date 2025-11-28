import React, { useState, useRef } from 'react';
import { useAppStore } from '../store';
import { Settings, Save, Check, Download, Upload, Trash2, ShieldAlert, Store, Phone } from 'lucide-react';

const Admin: React.FC = () => {
  const { settings, updateSettings, clients, services, appointments, resetData, loadData } = useAppStore();
  
  // Settings State
  const [shopName, setShopName] = useState(settings.shopName);
  const [shopPhone, setShopPhone] = useState(settings.shopPhone);
  const [isSaved, setIsSaved] = useState(false);

  // File Upload Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveSettings = () => {
    updateSettings({ shopName, shopPhone });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleExport = () => {
    const data = {
      clients,
      services,
      appointments,
      settings,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup-barber-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (confirm('Isso substituirá todos os dados atuais pelos dados do backup. Deseja continuar?')) {
          loadData(json);
          setShopName(json.settings?.shopName || '');
          setShopPhone(json.settings?.shopPhone || '');
          alert('Dados restaurados com sucesso!');
        }
      } catch (error) {
        alert('Erro ao ler arquivo de backup. Verifique se é um arquivo JSON válido.');
      }
    };
    reader.readAsText(file);
    // Reset input so same file can be selected again if needed
    event.target.value = '';
  };

  const handleResetApp = () => {
    if (confirm('ATENÇÃO: Isso apagará TODOS os clientes, agendamentos e serviços. Essa ação não pode ser desfeita. Tem certeza?')) {
      resetData();
      setShopName('Minha Barbearia');
      setShopPhone('');
      alert('Aplicativo resetado para as configurações de fábrica.');
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="p-4 border-b bg-white sticky top-0 z-10">
        <h1 className="text-xl font-bold text-brand-500 flex items-center gap-2">
          <Settings size={24} />
          Administração
        </h1>
      </div>

      <div className="p-4 space-y-6 overflow-y-auto">
        
        {/* Shop Settings Card */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-brand-500 font-semibold border-b border-gray-100 pb-2">
            <Store size={20} />
            <h2>Minha Barbearia</h2>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="text-xs text-brand-500 font-medium ml-1">Nome do Estabelecimento</label>
              <input 
                type="text"
                className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 placeholder-gray-400 focus:ring-brand-500 focus:border-brand-500"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-brand-500 font-medium ml-1 flex items-center gap-1">
                <Phone size={12} /> WhatsApp / Telefone
              </label>
              <input 
                type="tel"
                className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 placeholder-gray-400 focus:ring-brand-500 focus:border-brand-500"
                value={shopPhone}
                onChange={(e) => setShopPhone(e.target.value)}
              />
            </div>
            
            <button 
              onClick={handleSaveSettings}
              className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all mt-2 ${
                isSaved 
                  ? 'bg-green-500 text-white' 
                  : 'bg-brand-600 text-black hover:bg-brand-500'
              }`}
            >
              {isSaved ? <><Check size={18} /> Salvo!</> : <><Save size={18} /> Salvar Alterações</>}
            </button>
          </div>
        </div>

        {/* Data Management Card */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-brand-500 font-semibold border-b border-gray-100 pb-2">
            <Download size={20} />
            <h2>Backup & Dados</h2>
          </div>
          
          <p className="text-sm text-gray-400">
            Salve seus dados regularmente. Como este é um app offline, seus dados ficam apenas neste dispositivo.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={handleExport}
              className="flex flex-col items-center justify-center p-4 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 hover:border-brand-500 hover:text-brand-500 transition-all text-gray-500"
            >
              <Download size={24} className="mb-2" />
              <span className="text-sm font-medium">Baixar Backup</span>
            </button>
            
            <button 
              onClick={handleImportClick}
              className="flex flex-col items-center justify-center p-4 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 hover:border-brand-500 hover:text-brand-500 transition-all text-gray-500"
            >
              <Upload size={24} className="mb-2" />
              <span className="text-sm font-medium">Restaurar</span>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".json" 
              className="hidden" 
            />
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50/10 border border-red-900/20 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-red-500 font-semibold border-b border-red-900/20 pb-2">
            <ShieldAlert size={20} />
            <h2>Zona de Perigo</h2>
          </div>
          
          <button 
            onClick={handleResetApp}
            className="w-full py-3 bg-red-900/20 text-red-500 border border-red-900/30 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-red-900/40 transition-colors"
          >
            <Trash2 size={18} /> Formatar Aplicativo
          </button>
        </div>

        <div className="text-center text-xs text-gray-600 pt-6">
          <p>BarberAgenda Pro v1.0</p>
        </div>
      </div>
    </div>
  );
};

export default Admin;
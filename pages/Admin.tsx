import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store';
import { Settings, Save, Check, Download, Upload, ShieldAlert, Store, Phone, Clock, Calendar, Share2, Copy, Link as LinkIcon, MessageCircle } from 'lucide-react';

const Admin: React.FC = () => {
  const { settings, updateSettings, clients, services, appointments, resetData, loadData } = useAppStore();
  
  // Settings State
  const [shopName, setShopName] = useState(settings.shopName);
  const [shopPhone, setShopPhone] = useState(settings.shopPhone);
  const [workStartTime, setWorkStartTime] = useState(settings.workStartTime || '08:00');
  const [workEndTime, setWorkEndTime] = useState(settings.workEndTime || '20:00');
  const [workDays, setWorkDays] = useState<number[]>(settings.workDays || [1, 2, 3, 4, 5, 6]);
  
  const [isSaved, setIsSaved] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // File Upload Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state if global settings change (e.g. on restore)
  useEffect(() => {
    setShopName(settings.shopName);
    setShopPhone(settings.shopPhone);
    setWorkStartTime(settings.workStartTime || '08:00');
    setWorkEndTime(settings.workEndTime || '20:00');
    setWorkDays(settings.workDays || [1, 2, 3, 4, 5, 6]);
  }, [settings]);

  const handleSaveSettings = () => {
    updateSettings({ 
        shopName, 
        shopPhone,
        workStartTime,
        workEndTime,
        workDays
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const toggleWorkDay = (dayIndex: number) => {
      if (workDays.includes(dayIndex)) {
          setWorkDays(workDays.filter(d => d !== dayIndex));
      } else {
          setWorkDays([...workDays, dayIndex].sort());
      }
  };

  // --- Sharing Logic ---
  const getCleanPhoneForLink = () => {
      let clean = (shopPhone || '').replace(/\D/g, '');
      if (clean.length >= 10 && clean.length <= 11) {
          clean = '55' + clean;
      }
      return clean;
  }

  const getEncodedServices = () => {
      // Create a compact string of services: "Corte_35;Barba_25"
      // Replace spaces with + to keep URL safe and short
      return services.map(s => {
          const safeName = s.name.replace(/_/g, ' ').trim(); // Avoid double underscores
          return `${safeName}_${s.price}`;
      }).join(';');
  };

  const getBookingLink = () => {
      const baseUrl = window.location.href.split('#')[0];
      const cleanPhone = getCleanPhoneForLink();
      const encodedShop = encodeURIComponent(shopName);
      const encodedServices = encodeURIComponent(getEncodedServices());
      
      return `${baseUrl}#/agendar?phone=${cleanPhone}&shop=${encodedShop}&start=${workStartTime}&end=${workEndTime}&s=${encodedServices}`;
  };

  const getSignupLink = () => {
      const baseUrl = window.location.href.split('#')[0];
      const cleanPhone = getCleanPhoneForLink();
      const encodedShop = encodeURIComponent(shopName);
      return `${baseUrl}#/cadastro?phone=${cleanPhone}&shop=${encodedShop}`;
  };

  const handleCopySuccess = (id: string) => {
      setCopyFeedback(id);
      setTimeout(() => setCopyFeedback(null), 2500);
  };

  const performCopy = async (text: string, id: string) => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
          try {
              await navigator.clipboard.writeText(text);
              handleCopySuccess(id);
              return true;
          } catch (err) {
              console.warn("Clipboard API failed, trying fallback", err);
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
          handleCopySuccess(id);
          return true;
      } catch (fallbackErr) {
          console.error(fallbackErr);
      }
      
      prompt("Copie o link abaixo:", text);
      return false;
  };

  const copyToClipboard = (text: string, id: string) => {
      if(!shopPhone) {
          alert("Salve o telefone da barbearia acima primeiro.");
          return;
      }
      performCopy(text, id);
  };

  const shareWhatsApp = (text: string) => {
      if(!shopPhone) {
          alert("Salve o telefone da barbearia acima primeiro.");
          return;
      }
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
      window.open(whatsappUrl, '_blank');
  };

  // --- Export/Import Logic ---

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
          alert('Dados restaurados com sucesso!');
        }
      } catch (error) {
        alert('Erro ao ler arquivo de backup. Verifique se é um arquivo JSON válido.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleResetApp = () => {
    if (confirm('ATENÇÃO: Isso apagará TODOS os clientes, agendamentos e serviços. Essa ação não pode ser desfeita. Tem certeza?')) {
      resetData();
      alert('Aplicativo resetado para as configurações de fábrica.');
    }
  };

  const dayLabels = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="p-4 border-b bg-white sticky top-0 z-10">
        <h1 className="text-xl font-bold text-brand-500 flex items-center gap-2">
          <Settings size={24} />
          Administração
        </h1>
      </div>

      <div className="p-4 space-y-6 overflow-y-auto pb-24">
        
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
                placeholder="Ex: 11999999999"
              />
            </div>
          </div>
        </div>

        {/* Schedule Settings Card */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-brand-500 font-semibold border-b border-gray-100 pb-2">
            <Clock size={20} />
            <h2>Horários de Funcionamento</h2>
          </div>

          <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-brand-500 font-medium ml-1 block mb-1">Abertura</label>
                    <input 
                        type="time" 
                        className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-center font-bold"
                        value={workStartTime}
                        onChange={e => setWorkStartTime(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-brand-500 font-medium ml-1 block mb-1">Fechamento</label>
                    <input 
                        type="time" 
                        className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-center font-bold"
                        value={workEndTime}
                        onChange={e => setWorkEndTime(e.target.value)}
                    />
                  </div>
              </div>

              <div>
                  <label className="text-xs text-brand-500 font-medium ml-1 block mb-2 flex items-center gap-1">
                      <Calendar size={12} /> Dias de Trabalho
                  </label>
                  <div className="flex justify-between gap-1">
                      {dayLabels.map((label, index) => {
                          const isActive = workDays.includes(index);
                          return (
                              <button
                                key={index}
                                onClick={() => toggleWorkDay(index)}
                                className={`w-10 h-10 rounded-lg text-sm font-bold transition-all active:scale-95 ${
                                    isActive 
                                    ? 'bg-brand-500 text-black shadow-md shadow-brand-500/20' 
                                    : 'bg-gray-100 text-gray-400 border border-gray-200'
                                }`}
                              >
                                  {label}
                              </button>
                          )
                      })}
                  </div>
              </div>
          </div>
        </div>

        <button 
            onClick={handleSaveSettings}
            className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${
            isSaved 
                ? 'bg-green-500 text-white' 
                : 'bg-brand-600 text-black hover:bg-brand-500 shadow-brand-500/20'
            }`}
        >
            {isSaved ? <><Check size={18} /> Salvo!</> : <><Save size={18} /> Salvar Alterações</>}
        </button>
        
        {/* Client Links Card (NEW) */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-brand-500 font-semibold border-b border-gray-100 pb-2">
            <LinkIcon size={20} />
            <h2>Links para Clientes</h2>
          </div>
          
          <p className="text-sm text-gray-400">
             Envie estes links para seus clientes. O link inclui seus serviços e horários.
          </p>

          <div className="space-y-4">
              {/* Booking Link */}
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-sm text-gray-700">Link de Agendamento</span>
                      <span className="text-[10px] bg-brand-100 text-brand-800 px-2 py-0.5 rounded-full">Automático</span>
                  </div>
                  
                  {/* VISUAL PROOF OF LINK GENERATION */}
                  <input 
                    type="text" 
                    readOnly 
                    value={shopPhone ? getBookingLink() : 'Salve o telefone primeiro'}
                    className="w-full text-[10px] p-2 bg-gray-100 border border-gray-200 rounded mb-2 text-gray-500 font-mono truncate"
                  />

                  <div className="flex gap-2">
                      <button 
                        onClick={() => copyToClipboard(getBookingLink(), 'booking')}
                        className={`flex-1 border py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-all active:scale-95 ${
                            copyFeedback === 'booking' 
                            ? 'bg-green-500 text-white border-green-500' 
                            : 'bg-white border-gray-300 text-gray-700'
                        }`}
                      >
                          {copyFeedback === 'booking' ? <Check size={16} /> : <Copy size={16} />} 
                          {copyFeedback === 'booking' ? 'Copiado' : 'Copiar'}
                      </button>
                      <button 
                        onClick={() => shareWhatsApp(getBookingLink())}
                        className="flex-1 bg-[#25D366] text-white py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all"
                      >
                          <MessageCircle size={18} /> Zap
                      </button>
                  </div>
              </div>

              {/* Signup Link */}
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-sm text-gray-700">Link de Cadastro</span>
                  </div>

                  {/* VISUAL PROOF OF LINK GENERATION */}
                  <input 
                    type="text" 
                    readOnly 
                    value={shopPhone ? getSignupLink() : 'Salve o telefone primeiro'}
                    className="w-full text-[10px] p-2 bg-gray-100 border border-gray-200 rounded mb-2 text-gray-500 font-mono truncate"
                  />

                  <div className="flex gap-2">
                      <button 
                        onClick={() => copyToClipboard(getSignupLink(), 'signup')}
                        className={`flex-1 border py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-all active:scale-95 ${
                            copyFeedback === 'signup' 
                            ? 'bg-green-500 text-white border-green-500' 
                            : 'bg-white border-gray-300 text-gray-700'
                        }`}
                      >
                          {copyFeedback === 'signup' ? <Check size={16} /> : <Copy size={16} />} 
                          {copyFeedback === 'signup' ? 'Copiado' : 'Copiar'}
                      </button>
                      <button 
                        onClick={() => shareWhatsApp(getSignupLink())}
                        className="flex-1 bg-[#25D366] text-white py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all"
                      >
                          <MessageCircle size={18} /> Zap
                      </button>
                  </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
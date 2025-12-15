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
      // If user typed 11999999999 (11 digits) or 1199999999 (10 digits), assume Brazil and add 55
      if (clean.length >= 10 && clean.length <= 11) {
          clean = '55' + clean;
      }
      return clean;
  }

  const getBookingLink = () => {
      const baseUrl = window.location.href.split('#')[0];
      const cleanPhone = getCleanPhoneForLink();
      const encodedShop = encodeURIComponent(shopName);
      // Simplified link: Only shop info and hours, no services list
      return `${baseUrl}#/agendar?phone=${cleanPhone}&shop=${encodedShop}&start=${workStartTime}&end=${workEndTime}`;
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
      // 1. Try modern API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
          try {
              await navigator.clipboard.writeText(text);
              handleCopySuccess(id);
              return true;
          } catch (err) {
              console.warn("Clipboard API failed, trying fallback", err);
          }
      }

      // 2. Fallback for iOS/Android WebView
      try {
          const textArea = document.createElement("textarea");
          textArea.value = text;
          
          // iOS Safe Styling (must be visible in viewport but transparent)
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
          textArea.style.opacity = '0.1'; // Slight opacity to ensure render
          textArea.setAttribute('readonly', ''); // Prevent keyboard popup
          
          document.body.appendChild(textArea);
          
          // iOS Selection Strategy
          const range = document.createRange();
          range.selectNodeContents(textArea);
          const selection = window.getSelection();
          if (selection) {
              selection.removeAllRanges();
              selection.addRange(range);
          }
          textArea.setSelectionRange(0, 999999); // Legacy select
          
          const successful = document.execCommand('copy');
          document.body.removeChild(textArea);
          
          if (successful) {
              handleCopySuccess(id);
              return true;
          }
      } catch (fallbackErr) {
          console.error(fallbackErr);
      }
      
      // 3. Last Resort
      prompt("Não foi possível copiar automaticamente. Copie o link abaixo:", text);
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
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
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
             Envie estes links para seus clientes agendarem ou se cadastrarem sozinhos.
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
              className="flex flex-col items-center justify-center p-4 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-all active:scale-95"
            >
               <Download size={24} className="mb-2 text-brand-600" />
               <span className="text-sm font-bold text-gray-600">Baixar Backup</span>
            </button>
            
            <button 
              onClick={handleImportClick}
              className="flex flex-col items-center justify-center p-4 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-all active:scale-95"
            >
               <Upload size={24} className="mb-2 text-brand-600" />
               <span className="text-sm font-bold text-gray-600">Restaurar</span>
            </button>
            <input 
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".json"
              onChange={handleFileChange}
            />
          </div>

          <div className="pt-2 border-t border-gray-100">
             <button 
                onClick={handleResetApp}
                className="w-full py-3 text-red-500 font-medium text-sm flex items-center justify-center gap-2 hover:bg-red-50 rounded-lg transition-all active:scale-95"
             >
                <ShieldAlert size={16} />
                Resetar Aplicativo (Apagar Tudo)
             </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Admin;
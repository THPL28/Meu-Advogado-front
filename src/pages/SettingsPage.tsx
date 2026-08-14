import React, { useState } from 'react';
import { 
  Settings, 
  Bell, 
  ShieldCheck, 
  Save, 
  CheckCircle2, 
  Mail, 
  Smartphone, 
  Sliders, 
  Lock, 
  Globe, 
  Volume2, 
  VolumeX, 
  KeyRound, 
  Laptop, 
  Zap, 
  MessageSquare, 
  Calendar, 
  FileCheck2,
  Check,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';
import { useLegalPlatform } from '../hooks/useLegalPlatform';
import { useTheme } from '../context/ThemeContext';

export const SettingsPage: React.FC = () => {
  const { user } = useLegalPlatform();
  const { theme, setTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<'APPEARANCE' | 'NOTIFICATIONS' | 'SYSTEM' | 'SECURITY' | 'INTEGRATIONS'>('APPEARANCE');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Notification states
  const [emailNewJobs, setEmailNewJobs] = useState(true);
  const [emailProposals, setEmailProposals] = useState(true);
  const [emailChat, setEmailChat] = useState(true);
  const [emailPayments, setEmailPayments] = useState(true);
  const [emailWeeklyDigest, setEmailWeeklyDigest] = useState(false);

  const [pushSound, setPushSound] = useState(true);
  const [pushDeadlines, setPushDeadlines] = useState(true);
  const [pushWhatsapp, setPushWhatsapp] = useState(true);

  // System states
  const [language, setLanguage] = useState('pt-BR');
  const [timezone, setTimezone] = useState('America/Sao_Paulo');
  const [uiDensity, setUiDensity] = useState('normal');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Security states
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [publicSearchable, setPublicSearchable] = useState(true);
  const [pixKey, setPixKey] = useState(user?.email || '');

  // Integrations states
  const [googleCalendarConnected, setGoogleCalendarConnected] = useState(true);
  const [whatsappConnected, setWhatsappConnected] = useState(true);
  const [icpBrasilConnected, setIcpBrasilConnected] = useState(true);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      
      {/* Header */}
      <div className="pb-4 border-b border-border/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
            <Settings className="w-7 h-7 text-emerald-600" />
            Configurações do Sistema & Notificações
          </h1>
          <p className="text-sm text-muted-foreground/90 mt-1">
            Gerencie alertas por e-mail, notificações push em tempo real, preferências de interface e segurança da conta.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer self-start md:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>Salvar Alterações</span>
        </button>
      </div>

      {/* Success Notification Banner */}
      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-900 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs font-semibold">Configurações do sistema atualizadas com sucesso!</span>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-border/80 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('APPEARANCE')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'APPEARANCE'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-card text-muted-foreground/90 hover:text-foreground border border-border/80 hover:bg-background'
          }`}
        >
          <Moon className="w-4 h-4" />
          Aparência
        </button>
        <button
          onClick={() => setActiveTab('NOTIFICATIONS')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'NOTIFICATIONS'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-card text-muted-foreground/90 hover:text-foreground border border-border/80 hover:bg-background'
          }`}
        >
          <Bell className="w-4 h-4" />
          Notificações & Alertas
        </button>

        <button
          onClick={() => setActiveTab('SYSTEM')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'SYSTEM'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-card text-muted-foreground/90 hover:text-foreground border border-border/80 hover:bg-background'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Preferências do Sistema
        </button>

        <button
          onClick={() => setActiveTab('SECURITY')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'SECURITY'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-card text-muted-foreground/90 hover:text-foreground border border-border/80 hover:bg-background'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Segurança & Acesso
        </button>

        <button
          onClick={() => setActiveTab('INTEGRATIONS')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'INTEGRATIONS'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-card text-muted-foreground/90 hover:text-foreground border border-border/80 hover:bg-background'
          }`}
        >
          <Zap className="w-4 h-4" />
          Integrações
        </button>
      </div>

      {/* Tab 0: Appearance */}
      {activeTab === 'APPEARANCE' && (
        <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs max-w-4xl">
          <div className="flex items-center gap-3 pb-4 border-b border-border/50">
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Tema e Aparência</h2>
              <p className="text-xs text-muted-foreground/90">Escolha a aparência da plataforma LWork.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => setTheme('light')}
              className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all cursor-pointer ${
                theme === 'light' ? 'border-emerald-500 bg-emerald-50' : 'border-border/80 bg-background hover:border-border-strong hover:bg-muted/50'
              }`}
            >
              <div className={`p-3 rounded-full ${theme === 'light' ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'}`}>
                <Sun className="w-6 h-6" />
              </div>
              <div className="text-center">
                <span className={`block text-sm font-bold ${theme === 'light' ? 'text-emerald-900' : 'text-foreground'}`}>Claro</span>
                <span className="text-[11px] text-muted-foreground mt-1 block">Tema claro otimizado</span>
              </div>
            </button>
            
            <button
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all cursor-pointer ${
                theme === 'dark' ? 'border-emerald-500 bg-emerald-50' : 'border-border/80 bg-background hover:border-border-strong hover:bg-muted/50'
              }`}
            >
              <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'}`}>
                <Moon className="w-6 h-6" />
              </div>
              <div className="text-center">
                <span className={`block text-sm font-bold ${theme === 'dark' ? 'text-emerald-900' : 'text-foreground'}`}>Escuro</span>
                <span className="text-[11px] text-muted-foreground mt-1 block">Mais conforto visual</span>
              </div>
            </button>

            <button
              onClick={() => setTheme('system')}
              className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all cursor-pointer ${
                theme === 'system' ? 'border-emerald-500 bg-emerald-50' : 'border-border/80 bg-background hover:border-border-strong hover:bg-muted/50'
              }`}
            >
              <div className={`p-3 rounded-full ${theme === 'system' ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'}`}>
                <Monitor className="w-6 h-6" />
              </div>
              <div className="text-center">
                <span className={`block text-sm font-bold ${theme === 'system' ? 'text-emerald-900' : 'text-foreground'}`}>Automático</span>
                <span className="text-[11px] text-muted-foreground mt-1 block">Seguir o sistema</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Tab 1: Notifications */}
      {activeTab === 'NOTIFICATIONS' && (
        <div className="space-y-6">
          
          {/* E-mail Notifications */}
          <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-center gap-3 pb-4 border-b border-border/50">
              <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">Notificações por E-mail</h2>
                <p className="text-xs text-muted-foreground/90">Escolha quais eventos devem enviar alertas diretos para o seu e-mail cadastrado.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-background/70 rounded-2xl border border-border/50">
                <div>
                  <p className="text-xs font-bold text-foreground/90">Novas demandas na minha área de atuação</p>
                  <p className="text-[11px] text-muted-foreground/90">Receba aviso imediato quando um cliente publicar um caso relevante.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEmailNewJobs(!emailNewJobs)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    emailNewJobs ? 'bg-emerald-600' : 'bg-border-strong'
                  }`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-card shadow-xs ring-0 transition duration-200 ease-in-out ${
                    emailNewJobs ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-background/70 rounded-2xl border border-border/50">
                <div>
                  <p className="text-xs font-bold text-foreground/90">Atualizações de Propostas e Aceites de Contrato</p>
                  <p className="text-[11px] text-muted-foreground/90">Avisos de novas propostas recebidas, alteração de valores ou formalização.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEmailProposals(!emailProposals)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    emailProposals ? 'bg-emerald-600' : 'bg-border-strong'
                  }`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-card shadow-xs ring-0 transition duration-200 ease-in-out ${
                    emailProposals ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-background/70 rounded-2xl border border-border/50">
                <div>
                  <p className="text-xs font-bold text-foreground/90">Mensagens do Chat em Tempo Real</p>
                  <p className="text-[11px] text-muted-foreground/90">Notificar por e-mail quando receber uma nova mensagem não lida no chat.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEmailChat(!emailChat)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    emailChat ? 'bg-emerald-600' : 'bg-border-strong'
                  }`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-card shadow-xs ring-0 transition duration-200 ease-in-out ${
                    emailChat ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-background/70 rounded-2xl border border-border/50">
                <div>
                  <p className="text-xs font-bold text-foreground/90">Alertas Financeiros e Liberação de Escrow</p>
                  <p className="text-[11px] text-muted-foreground/90">Notificações sobre depósitos em garantia, aprovação de marcos e saques PIX.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEmailPayments(!emailPayments)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    emailPayments ? 'bg-emerald-600' : 'bg-border-strong'
                  }`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-card shadow-xs ring-0 transition duration-200 ease-in-out ${
                    emailPayments ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-background/70 rounded-2xl border border-border/50">
                <div>
                  <p className="text-xs font-bold text-foreground/90">Resumo Semanal de Oportunidades & Estatísticas</p>
                  <p className="text-[11px] text-muted-foreground/90">Relatório consolidado toda segunda-feira com estatísticas da sua conta.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEmailWeeklyDigest(!emailWeeklyDigest)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    emailWeeklyDigest ? 'bg-emerald-600' : 'bg-border-strong'
                  }`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-card shadow-xs ring-0 transition duration-200 ease-in-out ${
                    emailWeeklyDigest ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Push & Immediate Alerts */}
          <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-center gap-3 pb-4 border-b border-border/50">
              <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">Alertas Instantâneos & WhatsApp</h2>
                <p className="text-xs text-muted-foreground/90">Notificações no navegador e mensagens instantâneas de urgência.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-background/70 rounded-2xl border border-border/50">
                <div>
                  <p className="text-xs font-bold text-foreground/90">Som de Notificação do Navegador</p>
                  <p className="text-[11px] text-muted-foreground/90">Tocar um sinal sonoro suave quando receber uma notificação ao vivo.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPushSound(!pushSound)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    pushSound ? 'bg-emerald-600' : 'bg-border-strong'
                  }`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-card shadow-xs ring-0 transition duration-200 ease-in-out ${
                    pushSound ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-background/70 rounded-2xl border border-border/50">
                <div>
                  <p className="text-xs font-bold text-foreground/90">Avisos de Prazos e Vencimentos de Marcos</p>
                  <p className="text-[11px] text-muted-foreground/90">Alertar 24h antes da data limite de entrega de uma peça ou marco processual.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPushDeadlines(!pushDeadlines)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    pushDeadlines ? 'bg-emerald-600' : 'bg-border-strong'
                  }`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-card shadow-xs ring-0 transition duration-200 ease-in-out ${
                    pushDeadlines ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-background/70 rounded-2xl border border-border/50">
                <div>
                  <p className="text-xs font-bold text-foreground/90">Notificações no WhatsApp Profissional</p>
                  <p className="text-[11px] text-muted-foreground/90">Receber resumo de propostas e convites de contratação via WhatsApp.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPushWhatsapp(!pushWhatsapp)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    pushWhatsapp ? 'bg-emerald-600' : 'bg-border-strong'
                  }`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-card shadow-xs ring-0 transition duration-200 ease-in-out ${
                    pushWhatsapp ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Tab 2: System Preferences */}
      {activeTab === 'SYSTEM' && (
        <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs max-w-4xl">
          <div className="flex items-center gap-3 pb-4 border-b border-border/50">
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Preferências Regionais & Interface</h2>
              <p className="text-xs text-muted-foreground/90">Ajuste o idioma, fuso horário e experiência visual da plataforma LWork.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground">Idioma do Sistema</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground/90 font-semibold focus:bg-card focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en-US">English (United States)</option>
                <option value="es-ES">Español</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground">Fuso Horário Operacional</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground/90 font-semibold focus:bg-card focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                <option value="America/Sao_Paulo">Horário de Brasília (GMT-3)</option>
                <option value="America/Manaus">Horário de Manaus (GMT-4)</option>
                <option value="America/Noronha">Fernando de Noronha (GMT-2)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground">Densidade dos Cartões de Demandas</label>
              <select
                value={uiDensity}
                onChange={(e) => setUiDensity(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground/90 font-semibold focus:bg-card focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                <option value="normal">Padrão (Espaçamento Confortável)</option>
                <option value="compact">Compacto (Mais informações por tela)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground">Sons da Interface</label>
              <div className="flex items-center justify-between p-2.5 bg-background border border-border rounded-xl">
                <span className="text-xs text-muted-foreground/90 font-medium">Efeitos sonoros ao clicar/enviar</span>
                <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    soundEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-muted/80 text-muted-foreground/90'
                  }`}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Security & Access */}
      {activeTab === 'SECURITY' && (
        <div className="space-y-6 max-w-4xl">
          
          {/* OAB Authentication Status */}
          <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-center gap-3 pb-4 border-b border-border/50">
              <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">Autenticação & Inscrição OAB</h2>
                <p className="text-xs text-muted-foreground/90">Validação oficial no Conselho Federal da OAB para habilitação no marketplace.</p>
              </div>
            </div>

            <div className="p-5 bg-background/80 border border-border/80 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground">Inscrição Ativa</span>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-semibold text-[11px] rounded-full flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  Verificado na OAB
                </span>
              </div>
              <p className="text-xs text-muted-foreground/90 leading-relaxed">
                Inscrição OAB/{user?.oabState || 'SP'} {user?.oabNumber || ''} confirmada no Cadastro Nacional dos Advogados (CNA).
              </p>
              <div className="p-3 bg-card rounded-xl border border-border text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Token de Validação: LWORK-OAB-98421-VERIFIED</span>
              </div>
            </div>
          </div>

          {/* 2FA & Privacy */}
          <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-center gap-3 pb-4 border-b border-border/50">
              <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">Segurança da Conta & Privacidade</h2>
                <p className="text-xs text-muted-foreground/90">Configurações de dois fatores (2FA) e repasses financeiros.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-background/70 rounded-2xl border border-border/50">
                <div>
                  <p className="text-xs font-bold text-foreground/90">Autenticação em Dois Fatores (2FA)</p>
                  <p className="text-[11px] text-muted-foreground/90">Exigir código por SMS ou App de Autenticação em novos logins.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    twoFactorEnabled ? 'bg-emerald-600' : 'bg-border-strong'
                  }`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-card shadow-xs ring-0 transition duration-200 ease-in-out ${
                    twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-background/70 rounded-2xl border border-border/50">
                <div>
                  <p className="text-xs font-bold text-foreground/90">Visibilidade em Buscas Públicas</p>
                  <p className="text-[11px] text-muted-foreground/90">Permitir que potenciais clientes encontrem seu perfil no diretório público.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPublicSearchable(!publicSearchable)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    publicSearchable ? 'bg-emerald-600' : 'bg-border-strong'
                  }`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-card shadow-xs ring-0 transition duration-200 ease-in-out ${
                    publicSearchable ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-muted-foreground">Chave PIX Cadastrada para Repasses do Escrow</label>
                <input
                  type="text"
                  value={pixKey}
                  onChange={(e) => setPixKey(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-mono text-foreground/90 font-semibold focus:bg-card focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  placeholder="Chave PIX (E-mail, CPF ou Aleatória)"
                />
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Tab 4: Integrations */}
      {activeTab === 'INTEGRATIONS' && (
        <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs max-w-4xl">
          <div className="flex items-center gap-3 pb-4 border-b border-border/50">
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Ferramentas & Integrações Externas</h2>
              <p className="text-xs text-muted-foreground/90">Sincronize sua agenda, WhatsApp e certificado digital para automatizar tarefas.</p>
            </div>
          </div>

          <div className="space-y-4">
            
            {/* Google Calendar */}
            <div className="p-4 bg-background/70 border border-border/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-foreground">Google Calendar / Agenda</h3>
                  <p className="text-[11px] text-muted-foreground/90">Sincronizar automaticamete prazos de contratos e reuniões com clientes.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setGoogleCalendarConnected(!googleCalendarConnected)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  googleCalendarConnected
                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    : 'bg-muted/80 text-muted-foreground hover:bg-border-strong'
                }`}
              >
                {googleCalendarConnected ? 'Conectado' : 'Conectar Google'}
              </button>
            </div>

            {/* WhatsApp API */}
            <div className="p-4 bg-background/70 border border-border/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-foreground">WhatsApp Z-API Notificações</h3>
                  <p className="text-[11px] text-muted-foreground/90">Enviar alertas de urgência direto no WhatsApp do seu escritório.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setWhatsappConnected(!whatsappConnected)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  whatsappConnected
                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    : 'bg-muted/80 text-muted-foreground hover:bg-border-strong'
                }`}
              >
                {whatsappConnected ? 'Ativo' : 'Ativar WhatsApp'}
              </button>
            </div>

            {/* Certificado Digital */}
            <div className="p-4 bg-background/70 border border-border/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-foreground">Assinatura Digital ICP-Brasil / OAB</h3>
                  <p className="text-[11px] text-muted-foreground/90">Certificado digital A1/A3 ativo para assinatura eletrônica com validade jurídica.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIcpBrasilConnected(!icpBrasilConnected)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  icpBrasilConnected
                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    : 'bg-muted/80 text-muted-foreground hover:bg-border-strong'
                }`}
              >
                {icpBrasilConnected ? 'Certificado Válido' : 'Instalar Certificado'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};


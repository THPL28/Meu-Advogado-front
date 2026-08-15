import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  User, 
  ShieldCheck, 
  Save, 
  CheckCircle2, 
  Building2, 
  Phone, 
  MapPin, 
  Lock, 
  Moon, 
  Sun, 
  Monitor, 
  CreditCard, 
  Wallet, 
  KeyRound, 
  Briefcase, 
  Calendar, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { useLegalPlatform } from '../hooks/useLegalPlatform';
import { useTheme } from '../context/ThemeContext';
import { authApi } from '../services/api';
import { UserAvatar } from '../components/ui/UserAvatar';

export const SettingsPage: React.FC = () => {
  const { user, refreshData } = useLegalPlatform();
  const { theme, setTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<'PROFILE' | 'SECURITY' | 'APPEARANCE' | 'WALLET'>('PROFILE');
  const [submitting, setSubmitting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Profile Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [clientType, setClientType] = useState('EMPRESARIAL');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [oabNumber, setOabNumber] = useState('');
  const [oabState, setOabState] = useState('');

  // Password Security Form States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Wallet / Payout States (for Lawyer)
  const [pixKeyType, setPixKeyType] = useState('CPF');
  const [pixKey, setPixKey] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setCpfCnpj(user.cpfCnpj || '');
      setCompanyName(user.companyName || '');
      setLocation(user.location || 'São Paulo, SP');
      setBio(user.bio || '');
      setHourlyRate(user.hourlyRate ? String(user.hourlyRate) : '250');
      setExperienceYears(user.experienceYears ? String(user.experienceYears) : '5');
      setOabNumber(user.oabNumber || '');
      setOabState(user.oabState || 'SP');
      
      const bankInfo = user.lawyerWallet?.bankInfo;
      if (bankInfo) {
        setPixKeyType(bankInfo.pixKeyType || 'CPF');
        setPixKey(bankInfo.pixKey || '');
        setPaypalEmail(bankInfo.paypalEmail || user.email || '');
        setBankName(bankInfo.bankName || '');
        setAccountNumber(bankInfo.accountNumber || '');
      } else {
        setPixKey(user.cpfCnpj || user.email || '');
        setPaypalEmail(user.email || '');
      }
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);
    try {
      await authApi.updateProfile({
        name,
        phone,
        cpfCnpj,
        companyName,
        location,
        bio,
        hourlyRate: hourlyRate ? Number(hourlyRate) : undefined,
        experienceYears: experienceYears ? Number(experienceYears) : undefined,
        oabNumber: user?.role === 'LAWYER' ? oabNumber : undefined,
        oabState: user?.role === 'LAWYER' ? oabState : undefined,
      });

      await refreshData();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err: any) {
      console.error('Erro ao salvar perfil:', err);
      setErrorMessage(err?.message || 'Não foi possível atualizar o perfil.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMessage('A nova senha e a confirmação não coincidem.');
      return;
    }
    if (newPassword.length < 8) {
      setErrorMessage('A nova senha deve possuir no mínimo 8 caracteres.');
      return;
    }
    setSubmitting(true);
    setErrorMessage(null);
    try {
      // Simulates secure password change
      await new Promise(r => setTimeout(r, 600));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err: any) {
      setErrorMessage('Erro ao atualizar a senha.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);
    try {
      await authApi.saveLawyerBankInfo({
        pixKeyType: pixKeyType as any,
        pixKey,
        bankName,
        accountType: 'CORRENTE',
        agency: '0001',
        accountNumber,
        paypalEmail
      });
      await refreshData();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err: any) {
      setErrorMessage('Erro ao salvar dados de recebimento.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-16 max-w-5xl">
      
      {/* Header */}
      <div className="pb-4 border-b border-border/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
            <Settings className="w-7 h-7 text-emerald-600" />
            Configurações da Conta
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Atualize seus dados cadastrais, informações de contato, segurança e preferências visuais.
          </p>
        </div>
      </div>

      {/* Success Banner */}
      {savedSuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-3 text-emerald-900 dark:text-emerald-200 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs font-bold">Alterações salvas com sucesso!</span>
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-center gap-3 text-rose-900 dark:text-rose-200 animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="text-xs font-semibold">{errorMessage}</span>
        </div>
      )}

      {/* Clean Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-border/80 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('PROFILE')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'PROFILE'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-card text-muted-foreground hover:text-foreground border border-border/80 hover:bg-muted/80'
          }`}
        >
          <User className="w-4 h-4" />
          Dados do Perfil
        </button>

        <button
          onClick={() => setActiveTab('SECURITY')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'SECURITY'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-card text-muted-foreground hover:text-foreground border border-border/80 hover:bg-muted/80'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Segurança & Acesso
        </button>

        <button
          onClick={() => setActiveTab('APPEARANCE')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'APPEARANCE'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-card text-muted-foreground hover:text-foreground border border-border/80 hover:bg-muted/80'
          }`}
        >
          <Moon className="w-4 h-4" />
          Aparência & Tema
        </button>

        {user?.role === 'LAWYER' && (
          <button
            onClick={() => setActiveTab('WALLET')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'WALLET'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-card text-muted-foreground hover:text-foreground border border-border/80 hover:bg-muted/80'
            }`}
          >
            <Wallet className="w-4 h-4" />
            Dados de Recebimento
          </button>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: DADOS DO PERFIL (Cliente / Advogado)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'PROFILE' && (
        <form onSubmit={handleSaveProfile} className="bg-card rounded-3xl border border-border/80 p-6 sm:p-8 space-y-6 shadow-xs">
          
          <div className="flex items-center gap-4 pb-6 border-b border-border/60">
            <UserAvatar
              src={user?.avatarUrl}
              name={name || user?.name}
              size="xl"
            />
            <div>
              <h3 className="text-base font-bold text-foreground">{user?.name}</h3>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-lg bg-muted text-[11px] font-bold text-muted-foreground">
                {user?.role === 'LAWYER' ? 'Advogado / Parecerista' : 'Cliente Corporativo'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Nome Completo</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:bg-card focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">E-mail de Cadastro</label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 text-xs text-muted-foreground cursor-not-allowed font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Telefone / WhatsApp</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 98765-4321"
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:bg-card focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">CPF ou CNPJ</label>
              <input
                type="text"
                value={cpfCnpj}
                onChange={(e) => setCpfCnpj(e.target.value)}
                placeholder="000.000.000-00 ou 00.000.000/0001-00"
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:bg-card focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono"
              />
            </div>

            {user?.role === 'CLIENT' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">Nome da Empresa / Razão Social</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Ex: Tech Solutions Ltda"
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:bg-card focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">Porte / Segmento do Cliente</label>
                  <select
                    value={clientType}
                    onChange={(e) => setClientType(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:bg-card focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium cursor-pointer"
                  >
                    <option value="EMPRESARIAL">Empresarial / PME</option>
                    <option value="CORPORATIVO">Grande Corporação</option>
                    <option value="STARTUP">Startup & Tecnologia</option>
                    <option value="INDIVIDUAL">Pessoa Física / Autônomo</option>
                  </select>
                </div>
              </>
            )}

            {user?.role === 'LAWYER' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">Número da OAB</label>
                  <input
                    type="text"
                    value={oabNumber}
                    onChange={(e) => setOabNumber(e.target.value)}
                    placeholder="412.980"
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:bg-card focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">Estado da OAB (UF)</label>
                  <select
                    value={oabState}
                    onChange={(e) => setOabState(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:bg-card focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium cursor-pointer"
                  >
                    {['SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'DF', 'PE', 'CE', 'GO', 'AM', 'PA', 'ES', 'MT', 'MS'].map(uf => (
                      <option key={uf} value={uf}>OAB/{uf}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">Honorários por Hora (R$)</label>
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:bg-card focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">Anos de Experiência Prática</label>
                  <input
                    type="number"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:bg-card focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Localização (Cidade / Estado)</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="São Paulo, SP"
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:bg-card focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">
              {user?.role === 'LAWYER' ? 'Resumo Profissional / Apresentação' : 'Sobre a Empresa / Demandante'}
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Descreva brevemente suas atividades e foco de atuação..."
              className="w-full bg-background border border-border rounded-xl p-3.5 text-xs text-foreground focus:bg-card focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium leading-relaxed resize-none"
            />
          </div>

          <div className="pt-4 border-t border-border/60 flex items-center justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Salvando...' : 'Salvar Dados do Perfil'}</span>
            </button>
          </div>

        </form>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: SEGURANÇA & ACESSO
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'SECURITY' && (
        <div className="space-y-6">
          <form onSubmit={handleSavePassword} className="bg-card rounded-3xl border border-border/80 p-6 sm:p-8 space-y-5 shadow-xs">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-emerald-600" />
                Alterar Senha de Acesso
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Utilize uma senha com no mínimo 8 caracteres, combinando letras, números e símbolos.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Senha Atual</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:bg-card focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Nova Senha</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:bg-card focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Confirmar Nova Senha</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:bg-card focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-border/60 flex items-center justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>{submitting ? 'Atualizando...' : 'Atualizar Senha'}</span>
              </button>
            </div>
          </form>

          {/* Privacy & LGPD Notice Card */}
          <div className="bg-card rounded-3xl border border-border/80 p-6 space-y-3 shadow-xs">
            <div className="flex items-center gap-2.5 text-xs font-bold text-foreground">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Privacidade & Conformidade com LGPD</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Todos os seus contratos, propostas e documentos possuem custódia segura com integridade calculada por hash SHA-256 e tráfego criptografado TLS 1.3. O sigilo de suas demandas é preservado conforme as normas da OAB.
            </p>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: APARÊNCIA & TEMA
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'APPEARANCE' && (
        <div className="bg-card rounded-3xl border border-border/80 p-6 sm:p-8 space-y-6 shadow-xs">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Moon className="w-5 h-5 text-emerald-600" />
              Tema Visual da Interface
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Escolha a aparência que proporciona o melhor conforto visual para seu fluxo de trabalho.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-5 rounded-2xl border text-center space-y-3 transition-all cursor-pointer ${
                theme === 'light'
                  ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                  : 'border-border bg-background hover:bg-muted/80 text-foreground'
              }`}
            >
              <Sun className="w-7 h-7 mx-auto text-amber-500" />
              <div>
                <p className="text-xs font-extrabold">Modo Claro</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Alto contraste e máxima legibilidade</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-5 rounded-2xl border text-center space-y-3 transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                  : 'border-border bg-background hover:bg-muted/80 text-foreground'
              }`}
            >
              <Moon className="w-7 h-7 mx-auto text-emerald-500" />
              <div>
                <p className="text-xs font-extrabold">Modo Escuro</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Ideal para ambientes com baixa luminosidade</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTheme('auto')}
              className={`p-5 rounded-2xl border text-center space-y-3 transition-all cursor-pointer ${
                theme === 'auto'
                  ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                  : 'border-border bg-background hover:bg-muted/80 text-foreground'
              }`}
            >
              <Monitor className="w-7 h-7 mx-auto text-muted-foreground" />
              <div>
                <p className="text-xs font-extrabold">Automático</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Sincroniza com as preferências do seu sistema</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 4: DADOS DE RECEBIMENTO & CARTEIRA (Advogado)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'WALLET' && user?.role === 'LAWYER' && (
        <form onSubmit={handleSaveWallet} className="bg-card rounded-3xl border border-border/80 p-6 sm:p-8 space-y-6 shadow-xs">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-600" />
              Dados para Repasses de Honorários
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Configure sua chave PIX nacional e sua carteira PayPal para recebimentos internacionais.
            </p>
          </div>

          <div className="p-4 bg-background border border-border rounded-2xl space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>Chave PIX (Nacional)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Tipo de Chave</label>
                <select
                  value={pixKeyType}
                  onChange={(e) => setPixKeyType(e.target.value)}
                  className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="CPF">CPF</option>
                  <option value="CNPJ">CNPJ</option>
                  <option value="EMAIL">E-mail</option>
                  <option value="TELEFONE">Telefone</option>
                  <option value="ALEATORIA">Chave Aleatória</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Valor da Chave PIX</label>
                <input
                  type="text"
                  required
                  value={pixKey}
                  onChange={(e) => setPixKey(e.target.value)}
                  placeholder="321.654.987-00"
                  className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-background border border-border rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider">
              <Wallet className="w-4 h-4 text-emerald-600" />
              <span>Carteira PayPal (Internacional)</span>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">E-mail da Conta PayPal</label>
              <input
                type="email"
                value={paypalEmail}
                onChange={(e) => setPaypalEmail(e.target.value)}
                placeholder="seu-email@paypal.com"
                className="w-full bg-card border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Os saques internacionais solicitados via PayPal serão direcionados para este endereço.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-border/60 flex items-center justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Salvando...' : 'Salvar Dados de Repasse'}</span>
            </button>
          </div>
        </form>
      )}

    </div>
  );
};

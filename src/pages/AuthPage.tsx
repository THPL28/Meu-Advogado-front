import React, { useState } from 'react';
import { Scale, ShieldCheck, Mail, Lock, User, Briefcase, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePlatform } from '../context/PlatformContext';
import { Role } from '../types';

interface AuthPageProps {
  initialMode?: 'login' | 'register';
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode = 'login' }) => {
  const { login, register, error, clearError, loading } = useAuth();
  const { setActiveTab, refreshData } = usePlatform();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [selectedRole, setSelectedRole] = useState<Role>('LAWYER');
  const [showPassword, setShowPassword] = useState(false);

  // Shared
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register only
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [oabNumber, setOabNumber] = useState('');
  const [oabState, setOabState] = useState('SP');
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [specialty, setSpecialty] = useState('Direito Empresarial');
  const [phone, setPhone] = useState('');

  const [localError, setLocalError] = useState<string | null>(null);

  const displayError = localError || error;

  const switchMode = (m: 'login' | 'register') => {
    setLocalError(null);
    clearError();
    setMode(m);
  };

  const validate = (): string | null => {
    if (!email.trim()) return 'Informe o e-mail.';
    if (!password || password.length < 6) return 'A senha deve ter no mínimo 6 caracteres.';
    if (mode === 'register') {
      if (!firstName.trim()) return 'Informe o primeiro nome.';
      if (!lastName.trim()) return 'Informe o sobrenome / razão social.';
      if (selectedRole === 'LAWYER' && !oabNumber.trim()) return 'Informe o número OAB.';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    const validationError = validate();
    if (validationError) { setLocalError(validationError); return; }

    try {
      if (mode === 'login') {
        await login(email.trim(), password);
      } else {
        await register({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          password,
          role: selectedRole,
          phone: phone.trim() || undefined,
          cpfCnpj: cpfCnpj.trim() || undefined,
          oabNumber: selectedRole === 'LAWYER' ? oabNumber.trim() : undefined,
          oabState: selectedRole === 'LAWYER' ? oabState : undefined,
          companyName: selectedRole === 'CLIENT' ? (companyName.trim() || lastName.trim()) : undefined,
        });
      }
      await refreshData();
      setActiveTab('dashboard');
    } catch (err) {
      // Error is already set in AuthContext; we only catch to prevent unhandled rejection
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs text-foreground space-y-6 animate-in fade-in duration-200">

        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-xs">
            <Scale className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {mode === 'login' ? 'Acesse sua Plataforma Jurídica' : 'Comece Agora no LWork'}
          </h2>
          <p className="text-xs text-muted-foreground/90">
            {mode === 'login'
              ? 'Digite suas credenciais para acessar sua conta'
              : 'Escolha seu perfil profissional e crie sua conta'}
          </p>
        </div>

        {/* Role Selector */}
        <div className="grid grid-cols-2 p-1 bg-muted rounded-2xl border border-border/60">
          {(['LAWYER', 'CLIENT'] as Role[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => { setSelectedRole(r); setLocalError(null); clearError(); }}
              className={`py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                selectedRole === r
                  ? 'bg-card text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-muted-foreground/90 hover:text-foreground'
              }`}
            >
              {r === 'LAWYER' ? <Scale className="w-3.5 h-3.5" /> : <Briefcase className="w-3.5 h-3.5" />}
              {r === 'LAWYER' ? 'Advogado / Escritório' : 'Cliente / Empresa'}
            </button>
          ))}
        </div>

        {/* Error Banner */}
        {displayError && (
          <div className="flex items-start gap-2.5 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{displayError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Register: Name fields */}
          {mode === 'register' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Primeiro Nome *</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70" />
                  <input
                    type="text"
                    required
                    placeholder={selectedRole === 'LAWYER' ? 'Rodrigo' : 'João'}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl pl-9 pr-3 py-2.5 text-xs text-foreground/90 placeholder:text-muted-foreground/60 focus:bg-card focus:outline-none focus:border-emerald-600 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  {selectedRole === 'LAWYER' ? 'Sobrenome *' : 'Sobrenome / Razão Social *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={selectedRole === 'LAWYER' ? 'Silveira' : 'TechCorp Brasil'}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground/90 placeholder:text-muted-foreground/60 focus:bg-card focus:outline-none focus:border-emerald-600 transition-all"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">E-mail *</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70" />
              <input
                type="email"
                required
                placeholder={selectedRole === 'LAWYER' ? 'nome@oab.org.br' : 'juridico@empresa.com.br'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-background border border-border rounded-xl pl-9 pr-3 py-2.5 text-xs text-foreground/90 placeholder:text-muted-foreground/60 focus:bg-card focus:outline-none focus:border-emerald-600 transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Senha *</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-background border border-border rounded-xl pl-9 pr-9 py-2.5 text-xs text-foreground/90 placeholder:text-muted-foreground/60 focus:bg-card focus:outline-none focus:border-emerald-600 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Register: OAB for lawyers */}
          {mode === 'register' && selectedRole === 'LAWYER' && (
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Número OAB *</label>
                <input
                  type="text"
                  required
                  placeholder="412.980"
                  value={oabNumber}
                  onChange={(e) => setOabNumber(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold focus:bg-card focus:outline-none focus:border-emerald-600 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">UF OAB</label>
                <select
                  value={oabState}
                  onChange={(e) => setOabState(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-2 py-2.5 text-xs text-foreground/90 focus:bg-card focus:outline-none focus:border-emerald-600 transition-all"
                >
                  {['SP','RJ','RS','MG','DF','BA','PR','SC','GO','PE','CE'].map(uf => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Register: Specialty for lawyers */}
          {mode === 'register' && selectedRole === 'LAWYER' && (
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Principal Especialidade Jurídica</label>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground/90 focus:bg-card focus:outline-none focus:border-emerald-600 transition-all"
              >
                {[
                  'Direito Empresarial','Compliance & LGPD','Direito Trabalhista',
                  'Direito Tributário','Propriedade Intelectual','Direito Cível & Imobiliário',
                  'Direito de Família','Direito Criminal','Direito Internacional','Outro',
                ].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}

          {/* Register: Company name for clients */}
          {mode === 'register' && selectedRole === 'CLIENT' && (
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Razão Social / Nome da Empresa</label>
              <input
                type="text"
                placeholder="TechCorp Brasil Ltda"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground/90 placeholder:text-muted-foreground/60 focus:bg-card focus:outline-none focus:border-emerald-600 transition-all"
              />
            </div>
          )}

          {/* Register: Phone */}
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Telefone / WhatsApp</label>
              <input
                type="tel"
                placeholder="(11) 99999-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground/90 placeholder:text-muted-foreground/60 focus:bg-card focus:outline-none focus:border-emerald-600 transition-all"
              />
            </div>
          )}

          {/* Register: Role badge summary */}
          {mode === 'register' && (
            <div className={`flex items-center gap-2 p-3 rounded-xl border text-xs ${
              selectedRole === 'LAWYER'
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
                : 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400'
            }`}>
              <ShieldCheck className="w-4 h-4 shrink-0" />
              {selectedRole === 'LAWYER'
                ? 'Perfil Advogado: Poderá oferecer serviços jurídicos, receber honorários via PIX e gerenciar contratos.'
                : 'Perfil Cliente: Poderá publicar demandas, selecionar advogados e gerenciar contratos e pagamentos.'}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
          >
            {loading
              ? (mode === 'login' ? 'Autenticando...' : 'Criando conta...')
              : mode === 'login'
              ? 'Entrar na Plataforma'
              : 'Criar Minha Conta no LWork'}
          </button>
        </form>

        {/* Toggle */}
        <div className="pt-1 text-center text-xs text-muted-foreground/90">
          {mode === 'login' ? (
            <p>
              Ainda não tem conta?{' '}
              <button onClick={() => switchMode('register')} className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline cursor-pointer">
                Cadastre-se aqui
              </button>
            </p>
          ) : (
            <p>
              Já possui conta?{' '}
              <button onClick={() => switchMode('login')} className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline cursor-pointer">
                Faça login
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  FileCheck2,
  Users,
  Award,
  Zap,
  BarChart3,
  LayoutDashboard,
  PenTool,
  Wallet,
  Star,
  ChevronDown,
  Globe,
  Mail,
  User,
  Gavel,
  Shield,
  Bot,
  Laptop,
  Check
} from 'lucide-react';
import { useLegalPlatform } from '../hooks/useLegalPlatform';

export const LandingPage: React.FC = () => {
  const { setActiveTab, switchRole, setIsNewCaseModalOpen } = useLegalPlatform();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="bg-background text-foreground min-h-screen font-sans overflow-x-hidden">
      


      <main>
        {/* Hero Section */}
        <section className="relative min-h-[85vh] flex items-center pt-8 pb-16 overflow-hidden">
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:32px_32px] opacity-40 -z-10" />
          <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-500/5 blur-[120px] rounded-full -z-10 translate-x-1/3" />

          <div className="max-w-[1440px] mx-auto px-6 sm:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
            
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-500/10 text-emerald-600 rounded-full border border-emerald-500/20 w-fit">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-[11px] font-bold uppercase tracking-wider">PLATAFORMA CERTIFICADA LGPD</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
                A plataforma que conecta clientes, <span className="text-emerald-600">advogados</span> e IA para transformar a gestão jurídica.
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground/90 max-w-2xl leading-relaxed">
                Segurança de custódia, inteligência artificial processual e uma rede de advogados verificados para operações de alta performance.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <button
                  onClick={() => { switchRole('CLIENT'); setIsNewCaseModalOpen(true); }}
                  className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-900/10 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Criar Conta Gratuitamente</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setActiveTab('find-lawyers')}
                  className="px-8 py-4 bg-card border border-border-strong hover:bg-background text-foreground font-bold text-sm rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>Encontrar um Advogado</span>
                </button>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground/90 uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Custódia Segura</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground/90 uppercase tracking-wider">
                  <Bot className="w-4 h-4 text-emerald-600" />
                  <span>IA Avançada</span>
                </div>
              </div>

            </div>

            {/* Right Column (Lawyer Image & Glass Cards) */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="relative w-full max-w-[420px]">
                
                {/* Main Hero Graphic Frame */}
                <div className="relative rounded-3xl overflow-hidden aspect-[3/4] border-8 border-border/50 shadow-2xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 flex flex-col items-center justify-center p-8 text-white text-center">
                  <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/10">
                    <Gavel className="w-10 h-10 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-extrabold tracking-tight text-white mb-2">
                    LWork Inteligência Jurídica
                  </h3>
                  <p className="text-xs text-emerald-200/70 leading-relaxed max-w-xs mb-6">
                    Custódia Escrow segura, contratos inteligentes e análise avançada de processos com IA.
                  </p>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-2xl backdrop-blur-xs border border-white/10 text-xs font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>100% Protegido & Verificado</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Floating Glassmorphic Cards */}
                <div className="absolute -top-4 -left-8 bg-card/80 backdrop-blur-md border border-border/80 p-3.5 rounded-2xl shadow-xl flex items-center gap-3 w-56 animate-bounce [animation-duration:6s]">
                  <div className="w-9 h-9 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-alt-foreground/60 uppercase tracking-wider">Status</p>
                    <p className="text-xs font-bold text-foreground">Processo Concluído</p>
                  </div>
                </div>

                <div className="absolute top-1/4 -right-10 bg-card/80 backdrop-blur-md border border-border/80 p-3.5 rounded-2xl shadow-xl flex items-center gap-3 w-60 animate-bounce [animation-duration:8s] [animation-delay:1s]">
                  <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-alt-foreground/60 uppercase tracking-wider">Lexis AI</p>
                    <p className="text-xs font-bold text-foreground">IA analisando contrato</p>
                  </div>
                </div>

                <div className="absolute bottom-1/4 -left-10 bg-card/80 backdrop-blur-md border border-border/80 p-3.5 rounded-2xl shadow-xl flex items-center gap-3 w-56 animate-bounce [animation-duration:7s] [animation-delay:2s]">
                  <div className="w-9 h-9 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-alt-foreground/60 uppercase tracking-wider">Financeiro</p>
                    <p className="text-xs font-bold text-foreground">Pagamento protegido</p>
                  </div>
                </div>

                <div className="absolute -bottom-4 -right-8 bg-card/80 backdrop-blur-md border border-border/80 p-3.5 rounded-2xl shadow-xl flex items-center gap-3 w-52 animate-bounce [animation-duration:6s] [animation-delay:1.5s]">
                  <div className="w-9 h-9 bg-muted text-foreground/90 rounded-xl flex items-center justify-center shrink-0">
                    <PenTool className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-alt-foreground/60 uppercase tracking-wider">Assinatura</p>
                    <p className="text-xs font-bold text-foreground">Contrato assinado</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* Trust Bar (Metrics) */}
        <section className="bg-muted/80 border-y border-border/80 py-10">
          <div className="max-w-[1440px] mx-auto px-6 sm:px-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center items-center">
              
              <div className="space-y-1">
                <p className="text-3xl sm:text-4xl font-extrabold text-emerald-600 font-mono">+15.000</p>
                <p className="text-xs font-bold text-muted-foreground/90 uppercase tracking-wider">Advogados Cadastrados</p>
              </div>

              <div className="space-y-1">
                <p className="text-3xl sm:text-4xl font-extrabold text-emerald-600 font-mono">+120.000</p>
                <p className="text-xs font-bold text-muted-foreground/90 uppercase tracking-wider">Casos Geridos</p>
              </div>

              <div className="space-y-1 border-x border-border-strong/80">
                <p className="text-3xl sm:text-4xl font-extrabold text-emerald-600 font-mono">R$ 48M+</p>
                <p className="text-xs font-bold text-muted-foreground/90 uppercase tracking-wider">Movimentados em Custódia</p>
              </div>

              <div className="space-y-1">
                <p className="text-3xl sm:text-4xl font-extrabold text-emerald-600 font-mono">99.8%</p>
                <p className="text-xs font-bold text-muted-foreground/90 uppercase tracking-wider">Satisfação dos Clientes</p>
              </div>

            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="como-funciona" className="py-20 bg-card">
          <div className="max-w-[1440px] mx-auto px-6 sm:px-12">
            
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">Como funciona</h2>
              <p className="text-base text-muted-foreground/90">Um ecossistema desenhado para clareza, proteção e agilidade.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              
              {/* Para Clientes */}
              <div id="para-clientes" className="space-y-8 bg-background/50 p-8 rounded-3xl border border-border/80">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-md">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Para Clientes</h3>
                    <p className="text-xs text-muted-foreground/90">Contrate com segurança total e acompanhamento em tempo real</p>
                  </div>
                </div>

                <div className="space-y-6 relative">
                  <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-muted/80 -z-0" />

                  <div className="relative z-10 flex gap-5 items-start group">
                    <div className="w-12 h-12 rounded-full bg-card border-2 border-border flex items-center justify-center font-extrabold text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all shadow-xs shrink-0">1</div>
                    <div>
                      <h4 className="text-base font-bold text-foreground">Publique seu Caso</h4>
                      <p className="text-xs text-muted-foreground/90 leading-relaxed mt-0.5">Descreva sua demanda jurídica em poucos minutos com auxílio da nossa IA.</p>
                    </div>
                  </div>

                  <div className="relative z-10 flex gap-5 items-start group">
                    <div className="w-12 h-12 rounded-full bg-card border-2 border-border flex items-center justify-center font-extrabold text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all shadow-xs shrink-0">2</div>
                    <div>
                      <h4 className="text-base font-bold text-foreground">Receba Propostas</h4>
                      <p className="text-xs text-muted-foreground/90 leading-relaxed mt-0.5">Compare orçamentos de advogados verificados OAB com avaliações reais.</p>
                    </div>
                  </div>

                  <div className="relative z-10 flex gap-5 items-start group">
                    <div className="w-12 h-12 rounded-full bg-card border-2 border-border flex items-center justify-center font-extrabold text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all shadow-xs shrink-0">3</div>
                    <div>
                      <h4 className="text-base font-bold text-foreground">Pagamento em Custódia</h4>
                      <p className="text-xs text-muted-foreground/90 leading-relaxed mt-0.5">Seu dinheiro fica protegido em escrow e só é liberado após a aprovação das entregas.</p>
                    </div>
                  </div>

                  <div className="relative z-10 flex gap-5 items-start group">
                    <div className="w-12 h-12 rounded-full bg-card border-2 border-border flex items-center justify-center font-extrabold text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all shadow-xs shrink-0">4</div>
                    <div>
                      <h4 className="text-base font-bold text-foreground">Acompanhamento Real-time</h4>
                      <p className="text-xs text-muted-foreground/90 leading-relaxed mt-0.5">Dashboard intuitivo para acompanhar cada passo e documento do seu processo.</p>
                    </div>
                  </div>

                  <div className="relative z-10 flex gap-5 items-start group">
                    <div className="w-12 h-12 rounded-full bg-card border-2 border-border flex items-center justify-center font-extrabold text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all shadow-xs shrink-0">5</div>
                    <div>
                      <h4 className="text-base font-bold text-foreground">Finalização e Nota</h4>
                      <p className="text-xs text-muted-foreground/90 leading-relaxed mt-0.5">Receba seus documentos finais, encerre o caso e avalie o profissional contratado.</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => { switchRole('CLIENT'); setIsNewCaseModalOpen(true); }}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer text-center"
                >
                  Publicar Minha Primeira Demanda
                </button>
              </div>

              {/* Para Advogados */}
              <div id="para-advogados" className="space-y-8 bg-background/50 p-8 rounded-3xl border border-border/80">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-blue-700 rounded-2xl flex items-center justify-center text-white shadow-md">
                    <Gavel className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Para Advogados</h3>
                    <p className="text-xs text-muted-foreground/90">Aumente sua carteira de clientes com garantia de honorários</p>
                  </div>
                </div>

                <div className="space-y-6 relative">
                  <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-muted/80 -z-0" />

                  <div className="relative z-10 flex gap-5 items-start group">
                    <div className="w-12 h-12 rounded-full bg-card border-2 border-border flex items-center justify-center font-extrabold text-blue-700 group-hover:bg-blue-700 group-hover:text-white group-hover:border-blue-700 transition-all shadow-xs shrink-0">1</div>
                    <div>
                      <h4 className="text-base font-bold text-foreground">Crie seu Perfil</h4>
                      <p className="text-xs text-muted-foreground/90 leading-relaxed mt-0.5">Cadastre sua OAB e valide sua especialidade e pareceres na plataforma.</p>
                    </div>
                  </div>

                  <div className="relative z-10 flex gap-5 items-start group">
                    <div className="w-12 h-12 rounded-full bg-card border-2 border-border flex items-center justify-center font-extrabold text-blue-700 group-hover:bg-blue-700 group-hover:text-white group-hover:border-blue-700 transition-all shadow-xs shrink-0">2</div>
                    <div>
                      <h4 className="text-base font-bold text-foreground">Receba Demandas</h4>
                      <p className="text-xs text-muted-foreground/90 leading-relaxed mt-0.5">Acesso direto a centenas de clientes corporativos e individuais todos os dias.</p>
                    </div>
                  </div>

                  <div className="relative z-10 flex gap-5 items-start group">
                    <div className="w-12 h-12 rounded-full bg-card border-2 border-border flex items-center justify-center font-extrabold text-blue-700 group-hover:bg-blue-700 group-hover:text-white group-hover:border-blue-700 transition-all shadow-xs shrink-0">3</div>
                    <div>
                      <h4 className="text-base font-bold text-foreground">Proponha e Contrate</h4>
                      <p className="text-xs text-muted-foreground/90 leading-relaxed mt-0.5">Envie propostas profissionais com prazos flexíveis e assinatura digital integrada.</p>
                    </div>
                  </div>

                  <div className="relative z-10 flex gap-5 items-start group">
                    <div className="w-12 h-12 rounded-full bg-card border-2 border-border flex items-center justify-center font-extrabold text-blue-700 group-hover:bg-blue-700 group-hover:text-white group-hover:border-blue-700 transition-all shadow-xs shrink-0">4</div>
                    <div>
                      <h4 className="text-base font-bold text-foreground">Use a IA para Produtividade</h4>
                      <p className="text-xs text-muted-foreground/90 leading-relaxed mt-0.5">Analise peças, verifique prazos e gere minutas com nossa IA juridica proprietária.</p>
                    </div>
                  </div>

                  <div className="relative z-10 flex gap-5 items-start group">
                    <div className="w-12 h-12 rounded-full bg-card border-2 border-border flex items-center justify-center font-extrabold text-blue-700 group-hover:bg-blue-700 group-hover:text-white group-hover:border-blue-700 transition-all shadow-xs shrink-0">5</div>
                    <div>
                      <h4 className="text-base font-bold text-foreground">Receba com Garantia</h4>
                      <p className="text-xs text-muted-foreground/90 leading-relaxed mt-0.5">Segurança total no recebimento de honorários via escrow bancário sem risco de inadimplência.</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => { switchRole('LAWYER'); setActiveTab('cases'); }}
                  className="w-full py-3.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer text-center"
                >
                  Explorar Oportunidades & Casos
                </button>
              </div>

            </div>

          </div>
        </section>

        {/* Features Bento Grid */}
        <section className="py-20 bg-background border-t border-border/80">
          <div className="max-w-[1440px] mx-auto px-6 sm:px-12">
            
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">Funcionalidades de Elite</h2>
              <p className="text-base text-muted-foreground/90">Tecnologia de ponta para quem não aceita menos que a perfeição.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* IA Jurídica (Col Span 8) */}
              <div className="lg:col-span-8 bg-card p-10 rounded-3xl border border-border/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-8">
                <div className="max-w-xl space-y-4">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                    <Zap className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">Inteligência Artificial Jurídica</h3>
                  <p className="text-sm text-muted-foreground/90 leading-relaxed">
                    Nossa IA analisa petições, encontra jurisprudência do STJ/STF em segundos e prevê desfechos processuais com alta precisão.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 pt-4">
                  <span className="px-4 py-2 bg-muted text-muted-foreground rounded-full text-xs font-bold border border-border">
                    Análise de Prazos Processuais
                  </span>
                  <span className="px-4 py-2 bg-muted text-muted-foreground rounded-full text-xs font-bold border border-border">
                    Sumarização de Autos
                  </span>
                  <span className="px-4 py-2 bg-muted text-muted-foreground rounded-full text-xs font-bold border border-border">
                    Geração de Minutas
                  </span>
                </div>
              </div>

              {/* Gestão Unificada de Casos (Col Span 4) */}
              <div className="lg:col-span-4 bg-alt text-alt-foreground p-10 rounded-3xl shadow-xl flex flex-col justify-between space-y-8 group">
                <div className="space-y-4">
                  <div className="w-14 h-14 bg-card/10 text-emerald-400 rounded-2xl flex items-center justify-center">
                    <LayoutDashboard className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Gestão Unificada de Casos</h3>
                  <p className="text-sm text-alt-foreground/80 leading-relaxed">
                    Controle todos os seus processos e contratos em uma única tela, com notificações automáticas de movimentação.
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider group-hover:translate-x-2 transition-transform cursor-pointer"
                >
                  <span>Explorar Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Assinatura Digital (Col Span 4) */}
              <div className="lg:col-span-4 bg-card p-10 rounded-3xl border border-border/80 shadow-xs hover:border-emerald-500/40 transition-all space-y-4">
                <div className="w-14 h-14 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center">
                  <PenTool className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Assinatura Digital Integrada</h3>
                <p className="text-xs text-muted-foreground/90 leading-relaxed">
                  Validade jurídica total com carimbo de tempo, procurações com e-CPF e rastreabilidade em todos os documentos.
                </p>
              </div>

              {/* Custódia Segura (Escrow) (Col Span 8) */}
              <div className="lg:col-span-8 bg-muted p-10 rounded-3xl border border-border/80 shadow-xs flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 space-y-4">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                    <Wallet className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">Custódia Segura (Escrow)</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground/90 leading-relaxed">
                    Proteção para quem paga e garantia para quem trabalha. Honorários são retidos em conta vinculada e liberados conforme aprovação dos marcos contratuais.
                  </p>
                </div>

                <div className="w-32 h-32 relative shrink-0 flex items-center justify-center">
                  <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full animate-spin [animation-duration:10s]" />
                  <div className="absolute inset-2 border-4 border-emerald-600/30 rounded-full animate-spin [animation-duration:15s] [animation-direction:reverse]" />
                  <ShieldCheck className="w-12 h-12 text-emerald-600" />
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* Platform Demo Showcase */}
        <section className="py-20 bg-alt text-alt-foreground overflow-hidden relative">
          <div className="max-w-[1440px] mx-auto px-6 sm:px-12 text-center space-y-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Poderosa em qualquer tela</h2>
            
            <div className="relative flex justify-center items-end max-w-4xl mx-auto">
              <div className="w-full bg-alt/90 rounded-t-3xl p-4 shadow-2xl border-x-4 border-t-4 border-border-alt">
                <div className="bg-card rounded-t-xl h-[320px] sm:h-[400px] overflow-hidden flex flex-col text-foreground text-left p-6 space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-border/50">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    <span className="text-xs font-mono text-alt-foreground/60 ml-2">app.lexispremium.com/dashboard</span>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">Propostas Ativas</p>
                      <p className="text-2xl font-mono font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">12</p>
                    </div>
                    <div className="p-4 bg-background rounded-2xl border border-border">
                      <p className="text-[10px] text-muted-foreground/90 font-bold uppercase">Custódia Retida</p>
                      <p className="text-2xl font-mono font-extrabold text-foreground mt-1">R$ 48.500</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
                      <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase">Contratos Vigentes</p>
                      <p className="text-2xl font-mono font-extrabold text-blue-600 dark:text-blue-400 mt-1">8</p>
                    </div>
                  </div>

                  <div className="flex-1 bg-background rounded-2xl p-4 border border-border/80 space-y-2">
                    <p className="text-xs font-bold text-foreground">Atividades Processuais Recentes</p>
                    <div className="space-y-1.5 text-xs text-muted-foreground/90">
                      <div className="p-2 bg-card rounded-xl border border-border/50 flex justify-between items-center">
                        <span>Contrato M&A Societário • Marco #2 Aprovado</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">R$ 15.000 Liberado</span>
                      </div>
                      <div className="p-2 bg-card rounded-xl border border-border/50 flex justify-between items-center">
                        <span>Parecer Tributário ICMS • Minuta gerada via IA Lexis</span>
                        <span className="text-alt-foreground/60">Em Análise</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-card">
          <div className="max-w-[1440px] mx-auto px-6 sm:px-12">
            
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">O que dizem os especialistas</h2>
              <p className="text-base text-muted-foreground/90">Depoimentos de quem transformou sua prática jurídica.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Testimonial 1 */}
              <div className="bg-background p-8 rounded-3xl border border-border/80 flex flex-col justify-between space-y-6 shadow-xs">
                <div className="flex text-amber-400 gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm italic text-muted-foreground leading-relaxed">
                  "O LWork mudou a forma como lidamos com as demandas corporativas. A transparência na custódia de honorários trouxe uma segurança que não encontrávamos em nenhum outro lugar."
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <div className="w-11 h-11 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 flex items-center justify-center font-bold text-xs ring-2 ring-emerald-500/20 shrink-0">
                    RA
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-foreground">Dr. Ricardo Almeida</p>
                    <p className="text-[10px] font-bold text-alt-foreground/60 uppercase">Diretor Jurídico Corporativo</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="bg-background p-8 rounded-3xl border border-border/80 flex flex-col justify-between space-y-6 shadow-xs">
                <div className="flex text-amber-400 gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm italic text-muted-foreground leading-relaxed">
                  "Como advogada autônoma, a IA da plataforma me deu a produtividade de um escritório inteiro. Consigo gerir 3x mais casos com a mesma equipe reduzida."
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <div className="w-11 h-11 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 flex items-center justify-center font-bold text-xs ring-2 ring-emerald-500/20 shrink-0">
                    MC
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-foreground">Dra. Marina Costa</p>
                    <p className="text-[10px] font-bold text-alt-foreground/60 uppercase">Especialista Cível</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="bg-background p-8 rounded-3xl border border-border/80 flex flex-col justify-between space-y-6 shadow-xs">
                <div className="flex text-amber-400 gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm italic text-muted-foreground leading-relaxed">
                  "A ferramenta de assinatura digital e os relatórios em blockchain elevaram nosso padrão de compliance. Nossos clientes sentem a diferença na segurança dos dados."
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <div className="w-11 h-11 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 flex items-center justify-center font-bold text-xs ring-2 ring-emerald-500/20 shrink-0">
                    JM
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-foreground">Dr. Jorge Mendonça</p>
                    <p className="text-[10px] font-bold text-alt-foreground/60 uppercase">Sócio Senior JMB Advogados</p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* Final CTA Banner */}
        <section className="py-16 px-6">
          <div className="max-w-[1440px] mx-auto bg-gradient-to-br from-emerald-600 to-emerald-950 p-12 sm:p-16 rounded-[40px] text-center text-white space-y-8 shadow-2xl relative overflow-hidden">
            <div className="max-w-2xl mx-auto space-y-4 relative z-10">
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                Pronto para transformar sua gestão jurídica?
              </h2>
              <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed">
                Junte-se a mais de 15.000 profissionais e empresas que já estão no futuro do Direito.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <button
                onClick={() => { switchRole('CLIENT'); setIsNewCaseModalOpen(true); }}
                className="px-10 py-4 bg-card text-emerald-600 font-bold text-sm rounded-2xl hover:bg-muted transition-all shadow-xl cursor-pointer"
              >
                Começar Agora Gratuitamente
              </button>
              <button
                onClick={() => setActiveTab('find-lawyers')}
                className="px-10 py-4 bg-transparent border-2 border-white/30 text-white font-bold text-sm rounded-2xl hover:bg-card/10 transition-all cursor-pointer"
              >
                Encontrar Advogados
              </button>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-card border-t border-border/80">
          <div className="max-w-3xl mx-auto px-6 space-y-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground text-center">Dúvidas Frequentes</h2>

            <div className="space-y-4">
              {[
                {
                  q: 'Como funciona a segurança dos dados?',
                  a: 'Utilizamos criptografia de nível bancário AES-256 e estamos 100% em conformidade com a LGPD. Todos os arquivos são armazenados em servidores redundantes de alta segurança com controle de permissão por token.'
                },
                {
                  q: 'Como é garantido o pagamento dos honorários?',
                  a: 'Através do nosso sistema de escrow bancário, o valor acordado fica retido na LexisPremium e é liberado automaticamente ao advogado conforme os marcos de entrega definidos em contrato e aprovados por ambas as partes.'
                },
                {
                  q: 'Posso integrar com meus sistemas atuais?',
                  a: 'Sim, possuímos uma API robusta e integrações nativas com os principais softwares de gestão jurídica do mercado, além de conectores para Google Drive, Outlook e assinatura digital com certificado OAB.'
                }
              ].map((faq, i) => (
                <div key={i} className="border border-border rounded-2xl overflow-hidden bg-background/50">
                  <button
                    onClick={() => toggleFaq(i)}
                    className="w-full p-5 text-left font-bold text-foreground text-sm flex justify-between items-center cursor-pointer hover:bg-muted/60 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground/90 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === i && (
                    <div className="p-5 pt-0 text-xs text-muted-foreground/90 leading-relaxed border-t border-border/50 bg-card">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-alt text-alt-foreground/60 border-t border-border-alt text-xs">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-12 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <span className="font-extrabold text-lg text-white tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              Lexis<span className="text-emerald-500">Premium</span>
            </span>
            <p className="text-alt-foreground/60 text-xs leading-relaxed">
              Tecnologia avançada para a nova era da justiça global e contratação jurídica transparente.
            </p>
            <div className="flex gap-3 text-alt-foreground/60">
              <Globe className="w-4 h-4 hover:text-white cursor-pointer" />
              <Mail className="w-4 h-4 hover:text-white cursor-pointer" />
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 uppercase tracking-wider text-[11px]">Plataforma</h4>
            <ul className="space-y-2">
              <li><button onClick={() => document.getElementById('para-clientes')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-colors cursor-pointer">Para Clientes</button></li>
              <li><button onClick={() => document.getElementById('para-advogados')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-colors cursor-pointer">Para Advogados</button></li>
              <li><button onClick={() => setActiveTab('find-lawyers')} className="hover:text-white transition-colors cursor-pointer">Encontrar Advogados</button></li>
              <li><button onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-colors cursor-pointer">Como Funciona</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 uppercase tracking-wider text-[11px]">Empresa</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">Sobre Nós</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Carreiras</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog Jurídico</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 uppercase tracking-wider text-[11px]">Legal</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">Termos de Serviço</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacidade LGPD</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Compliance OAB</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto px-6 sm:px-12 py-6 border-t border-border-alt flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-muted-foreground/90">
          <p>© 2026 LexisPremium Tech. Todos os direitos reservados. LGPD Compliant.</p>
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-emerald-500" />
            <span>Sessão Criptografada SSL 256-bit</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

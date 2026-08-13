import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PlatformProvider, usePlatform } from './context/PlatformContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';

// Pages
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { CasesPage } from './pages/CasesPage';
import { CaseDetailPage } from './pages/CaseDetailPage';
import { ProposalsPage } from './pages/ProposalsPage';
import { ContractsPage } from './pages/ContractsPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { ChatPage } from './pages/ChatPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { SettingsPage } from './pages/SettingsPage';
import { FindLawyersPage } from './pages/FindLawyersPage';
import { FindJobsPage } from './pages/FindJobsPage';
import { SubscriptionPage } from './pages/SubscriptionPage';
import { LawyerPublicProfile } from './components/profile/LawyerPublicProfile';
import { ClientPublicProfile } from './components/profile/ClientPublicProfile';
import { ProfileEditPanel } from './components/profile/ProfileEditPanel';

// Modals
import { NewCaseModal } from './components/cases/NewCaseModal';
import { NewProposalModal } from './components/proposals/NewProposalModal';
import { UploadDocumentModal } from './components/documents/UploadDocumentModal';
import { LegalAiAssistantModal } from './components/ai/LegalAiAssistantModal';
import { PayoutModal } from './components/payments/PayoutModal';
import { AddBalanceModal } from './components/payments/AddBalanceModal';
import { BankDetailsModal } from './components/payments/BankDetailsModal';
import { InviteToProjectModal } from './components/profile/InviteToProjectModal';
import { ReviewModal } from './components/reviews/ReviewModal';
import { UpgradeModal } from './components/subscription/UpgradeModal';

const MainLayout: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    isReviewModalOpen,
    closeReviewModal,
    reviewContractInfo,
    isUpgradeModalOpen,
    closeUpgradeModal,
    upgradeReason
  } = usePlatform();
  const { user, loading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user && activeTab !== 'landing' && activeTab !== 'login' && activeTab !== 'register' && activeTab !== 'find-lawyers' && activeTab !== 'profile') {
      setActiveTab('landing');
    }
  }, [user, loading, activeTab, setActiveTab]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background text-foreground">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shadow-sm">
          <svg className="w-6 h-6 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0-3 9a5 5 0 006.5.5M6 7l3 9M6 7l6-2m6 2l3-1m-3 1-3 9a5 5 0 01-6.5.5M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5" />
          </svg>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          <p className="text-xs text-muted-foreground/70">Restaurando sessão…</p>
        </div>
      </div>
    );
  }

  // Full-screen pages without main application sidebar
  if (!user || activeTab === 'landing') {
    if (activeTab === 'login' || activeTab === 'register') {
      return (
        <div className="min-h-screen bg-background text-foreground font-['Plus_Jakarta_Sans',sans-serif]">
          <Navbar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
          <AuthPage initialMode={activeTab === 'register' ? 'register' : 'login'} />
        </div>
      );
    }
    
    if (activeTab === 'find-lawyers' || activeTab === 'find-jobs') {
      return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
          <Navbar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
          <main className="flex-1 overflow-y-auto w-full">
            {activeTab === 'find-lawyers' ? <FindLawyersPage /> : <FindJobsPage />}
          </main>
        </div>
      );
    }

    if (activeTab === 'profile') {
      return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
          <Navbar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
          <main className="flex-1 overflow-y-auto w-full p-4 sm:p-6 lg:p-8">
            <LawyerPublicProfile />
          </main>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background text-foreground font-['Plus_Jakarta_Sans',sans-serif]">
        <Navbar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
        <LandingPage />
        {/* Modals */}
        <NewCaseModal />
        <NewProposalModal />
        <UploadDocumentModal />
        <LegalAiAssistantModal />
        <PayoutModal />
        <InviteToProjectModal />
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-screen overflow-hidden bg-background text-foreground flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Fixed Top Navbar (64px / 4rem height) */}
      <div className="h-16 shrink-0 z-40 bg-card border-b border-border/80">
        <Navbar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
      </div>

      {/* Main Body Layout with Fixed Sidebar & Independent Content Scroll */}
      <div className="flex-1 flex w-full max-w-[1920px] mx-auto overflow-hidden h-[calc(100dvh-4rem)]">
        {/* Fixed Left Sidebar with Independent Scroll */}
        <Sidebar />

        {/* Independent Scroll Main Content Container */}
        <main className={`flex-1 min-w-0 ${
          activeTab === 'chat'
            ? 'h-[calc(100dvh-4rem)] overflow-hidden p-0'
            : 'h-[calc(100dvh-4rem)] overflow-y-auto p-4 sm:p-6 lg:p-8 xl:p-10 scroll-smooth pb-24 md:pb-10'
        }`}>
          {activeTab === 'dashboard' && <DashboardPage />}
          {activeTab === 'find-lawyers' && <FindLawyersPage />}
          {activeTab === 'find-jobs' && <FindJobsPage />}
          {activeTab === 'cases' && <CasesPage />}
          {activeTab === 'case-detail' && <CaseDetailPage />}
          {activeTab === 'proposals' && <ProposalsPage />}
          {activeTab === 'contracts' && <ContractsPage />}
          {activeTab === 'payments' && <PaymentsPage />}
          {activeTab === 'chat' && <ChatPage />}
          {activeTab === 'documents' && <DocumentsPage />}
          {activeTab === 'profile' && <LawyerPublicProfile />}
          {activeTab === 'client-profile' && <ClientPublicProfile />}
          {activeTab === 'edit-profile' && <ProfileEditPanel />}
          {activeTab === 'subscription' && <SubscriptionPage />}
          {activeTab === 'settings' && <SettingsPage />}
        </main>
      </div>

      {activeTab !== 'chat' && !isMobileMenuOpen && (
        <MobileBottomNav onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />
      )}

      {/* Global Modals */}
      <NewCaseModal />
      <NewProposalModal />
      <UploadDocumentModal />
      <LegalAiAssistantModal />
      <PayoutModal />
      <AddBalanceModal />
      <BankDetailsModal />
      <InviteToProjectModal />
      {reviewContractInfo && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={closeReviewModal}
          contractId={reviewContractInfo.contractId}
          jobTitle={reviewContractInfo.jobTitle}
          otherPartyName={reviewContractInfo.otherPartyName}
          otherPartyRole={reviewContractInfo.otherPartyRole}
        />
      )}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={closeUpgradeModal}
        reason={upgradeReason}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <PlatformProvider>
        <MainLayout />
      </PlatformProvider>
    </AuthProvider>
  );
}


import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Contexts & Types
import { AuthProvider } from '../src/context/AuthContext';
import { PlatformProvider } from '../src/context/PlatformContext';
import { ThemeProvider } from '../src/context/ThemeContext';

// Pages
import { DashboardPage } from '../src/pages/DashboardPage';
import { CasesPage } from '../src/pages/CasesPage';
import { CaseDetailPage } from '../src/pages/CaseDetailPage';
import { ProposalsPage } from '../src/pages/ProposalsPage';
import { ContractsPage } from '../src/pages/ContractsPage';
import { PaymentsPage } from '../src/pages/PaymentsPage';
import { ChatPage } from '../src/pages/ChatPage';
import { DocumentsPage } from '../src/pages/DocumentsPage';
import { FindLawyersPage } from '../src/pages/FindLawyersPage';
import { FindJobsPage } from '../src/pages/FindJobsPage';
import { LandingPage } from '../src/pages/LandingPage';
import { SubscriptionPage } from '../src/pages/SubscriptionPage';
import { SettingsPage } from '../src/pages/SettingsPage';
import { AuthPage } from '../src/pages/AuthPage';

// Components & Modals
import { LawyerPublicProfile } from '../src/components/profile/LawyerPublicProfile';
import { ClientPublicProfile } from '../src/components/profile/ClientPublicProfile';
import { ProfileEditPanel } from '../src/components/profile/ProfileEditPanel';
import { Navbar } from '../src/components/layout/Navbar';
import { Sidebar } from '../src/components/layout/Sidebar';
import { MobileBottomNav } from '../src/components/layout/MobileBottomNav';
import { NewCaseModal } from '../src/components/cases/NewCaseModal';
import { NewProposalModal } from '../src/components/proposals/NewProposalModal';
import { UploadDocumentModal } from '../src/components/documents/UploadDocumentModal';
import { LegalAiAssistantModal } from '../src/components/ai/LegalAiAssistantModal';
import { PayoutModal } from '../src/components/payments/PayoutModal';
import { AddBalanceModal } from '../src/components/payments/AddBalanceModal';
import { BankDetailsModal } from '../src/components/payments/BankDetailsModal';
import { InviteToProjectModal } from '../src/components/profile/InviteToProjectModal';
import { ReviewModal } from '../src/components/reviews/ReviewModal';
import { UpgradeModal } from '../src/components/subscription/UpgradeModal';

interface TestResult {
  component: string;
  scenario: string;
  status: 'PASS' | 'FAIL';
  error?: string;
  outputLength?: number;
}

const results: TestResult[] = [];

function testRender(name: string, scenario: string, element: React.ReactElement) {
  try {
    const wrapped = (
      <ThemeProvider>
        <AuthProvider>
          <PlatformProvider>
            {element}
          </PlatformProvider>
        </AuthProvider>
      </ThemeProvider>
    );
    const html = renderToStaticMarkup(wrapped);
    results.push({ component: name, scenario, status: 'PASS', outputLength: html.length });
    console.log(`[PASS] ${name.padEnd(25)} | ${scenario.padEnd(40)} | ${html.length} bytes`);
  } catch (err: any) {
    console.error(`[FAIL] ${name.padEnd(25)} | ${scenario.padEnd(40)} | Error: ${err.message}`);
    results.push({ component: name, scenario, status: 'FAIL', error: err.stack || err.message });
  }
}

function runTests() {
  console.log("================================================================================");
  console.log("STARTING EMPIRICAL EMPTY STATE & FALLBACK RENDER TESTS");
  console.log("================================================================================");

  // 1. Pages under Empty State
  console.log("\n--- 1. Testing Pages with Empty Arrays (lawyers, jobs, proposals, contracts, payments, docs, notifs = []) ---");
  testRender("DashboardPage", "Empty Arrays / Default State", <DashboardPage />);
  testRender("CasesPage", "Empty Arrays / Default State", <CasesPage />);
  testRender("CaseDetailPage", "No selectedCaseId & jobs=[]", <CaseDetailPage />);
  testRender("ProposalsPage", "Empty Arrays / Default State", <ProposalsPage />);
  testRender("ContractsPage", "Empty Arrays / Default State", <ContractsPage />);
  testRender("PaymentsPage", "Empty Arrays / Default State", <PaymentsPage />);
  testRender("ChatPage", "Empty Arrays / Default State", <ChatPage />);
  testRender("DocumentsPage", "Empty Arrays / Default State", <DocumentsPage />);
  testRender("FindLawyersPage", "Empty Arrays / Default State", <FindLawyersPage />);
  testRender("FindJobsPage", "Empty Arrays / Default State", <FindJobsPage />);
  testRender("LandingPage", "Default State", <LandingPage />);
  testRender("SubscriptionPage", "Empty State / Lawyer Check", <SubscriptionPage />);
  testRender("SettingsPage", "Empty State / Theme Provider", <SettingsPage />);
  testRender("AuthPage (login)", "Login Mode", <AuthPage initialMode="login" />);
  testRender("AuthPage (register)", "Register Mode", <AuthPage initialMode="register" />);

  // 2. Profiles & Edit Panels
  console.log("\n--- 2. Testing Profile Components with Empty Arrays ---");
  testRender("LawyerPublicProfile", "Empty Lawyers & Default Slug", <LawyerPublicProfile />);
  testRender("ClientPublicProfile", "Empty Client & No Selected Client", <ClientPublicProfile />);
  testRender("ProfileEditPanel", "Empty User Profile Fields", <ProfileEditPanel />);

  // 3. Layout Components
  console.log("\n--- 3. Testing Layout Components ---");
  testRender("Navbar", "Default Empty State", <Navbar isMobileMenuOpen={false} setIsMobileMenuOpen={() => {}} />);
  testRender("Sidebar", "Default Empty State", <Sidebar />);
  testRender("MobileBottomNav", "Default Empty State", <MobileBottomNav onOpenMobileMenu={() => {}} />);

  // 4. Modals
  console.log("\n--- 4. Testing Modal Components ---");
  testRender("NewCaseModal", "Default State", <NewCaseModal />);
  testRender("NewProposalModal", "Default State", <NewProposalModal />);
  testRender("UploadDocumentModal", "Default State", <UploadDocumentModal />);
  testRender("LegalAiAssistantModal", "Default State", <LegalAiAssistantModal />);
  testRender("PayoutModal", "Default State", <PayoutModal />);
  testRender("AddBalanceModal", "Default State", <AddBalanceModal />);
  testRender("BankDetailsModal", "Default State", <BankDetailsModal />);
  testRender("InviteToProjectModal", "Default State", <InviteToProjectModal />);
  testRender("ReviewModal", "Default State", <ReviewModal isOpen={true} onClose={() => {}} contractId="test" jobTitle="Test" otherPartyName="Test Party" otherPartyRole="LAWYER" />);
  testRender("UpgradeModal", "Default State", <UpgradeModal isOpen={true} onClose={() => {}} reason="Test Reason" />);

  console.log("\n================================================================================");
  console.log(`TOTAL TESTS: ${results.length}`);
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log("================================================================================");

  console.log("\nDETAILED FAILURE ANALYSIS:");
  for (const r of results.filter(r => r.status === 'FAIL')) {
    console.log(`- ${r.component} (${r.scenario}): ${r.error}`);
  }
}

runTests();

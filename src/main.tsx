import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SignupPage from './components/signup/SignupPage';
import { ThemeProvider } from '@mui/material/styles';
import SignupForm from './components/signup/SignupForm';
import ResetPasswordRequest from './components/resetpassword/ResetPasswordRequest';
import ResetPasswordConfirm from './components/resetpassword/ResetPasswordConfirm';
import PasswordSent from './components/resetpassword/PasswordSent';
import theme from './styles/theme';
import Login from './components/login/login';
import Header from './components/login/loginHeader';
import { SettingsPage } from './components/settings/SettingsPage';
import HomePage from './components/home/HomePage';
import FindJobs from './components/home/FindJobs';
import { PostJobForm } from './components/jobs/PostJobForm';
import { ManageJobs } from './components/jobs/ManageJobs';
import { JobProposals } from './components/proposal/JobProposals';
import ProposalForm from './components/proposal/ProposalForm';
import { MyContracts } from './components/contracts/MyContracts';
import { ContractDetail } from './components/contracts/ContractDetail';
import { MyPayments } from './components/payments/MyPayments';
import { MyReviews } from './components/reviews/MyReviews';
import { MyNotifications } from './components/notifications/MyNotifications';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { CssBaseline } from '@mui/material';

// non-null assertion operator (!), sure it won't be null
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path='/' element={<SignupPage />} />
          <Route path='/signup/:userType' element={<SignupForm />} />
          <Route path='/home' element={<HomePage />} />
          <Route path='/jobs' element={<FindJobs />} />
          <Route path='/jobs/create' element={<PostJobForm />} />
          <Route path='/jobs/manage' element={<ManageJobs />} />
          <Route path='/jobs/:jobId/proposals' element={<JobProposals />} />
          <Route
            path='/reset-password/:token'
            element={<ResetPasswordConfirm />}
          />
          <Route path='/reset-password' element={<ResetPasswordRequest />} />
          <Route path='/password-sent' element={<PasswordSent />} />
          <Route path='/login' element={<Login />} />
          <Route path='/settings/*' element={<SettingsPage />} />
          <Route path='/proposals/:jobId' element={<ProposalForm />} />
          <Route path='/contracts' element={<MyContracts />} />
          <Route path='/contracts/:contractId' element={<ContractDetail />} />
          <Route path='/payments' element={<MyPayments />} />
          <Route path='/reviews' element={<MyReviews />} />
          <Route path='/notifications' element={<MyNotifications />} />
          <Route path='/dashboard' element={<DashboardPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
);

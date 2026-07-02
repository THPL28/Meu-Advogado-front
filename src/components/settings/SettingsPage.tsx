import { Route, Routes } from 'react-router-dom';
import SideNavigationBar from './SettingsNavigationBar';

import { Container } from '@mui/material';
import ContactInfo from './ContactInfo';
import BillingPayments from './BillingPayments';

export const SettingsPage = () => {
  return (
    <>
      <SideNavigationBar />
      <Container
        sx={{
          marginLeft: '44%',
        }}
      >
        <Routes>
          <Route
            path='/contact-info'
            element={<ContactInfo />}
          />
          <Route
            path='/billing-payments'
            element={<BillingPayments />}
          />
        </Routes>
      </Container>
    </>
  );
};

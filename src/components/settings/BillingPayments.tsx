import { Button, TextField, Typography, Paper, Divider } from '@mui/material';
import { FormEvent, useState } from 'react';
import { green } from '@mui/material/colors';

const BillingPayments = () => {
  const [paymentMethod, setPaymentMethod] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Payment method integration would go here (Stripe, PayPal, etc.)
    alert('Payment method saved! (Integration pending)');
  };

  return (
    <Paper sx={{ p: 4, mt: 2, maxWidth: 600 }}>
      <Typography variant='h5' gutterBottom fontWeight='bold'>
        Billing & Payments
      </Typography>
      <Typography variant='body2' color='text.secondary' gutterBottom sx={{ mb: 3 }}>
        Manage your payment methods and billing information
      </Typography>

      <Divider sx={{ mb: 3 }} />

      <Typography variant='h6' gutterBottom>
        Payment Method
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label='Payment Email (PayPal)'
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          margin='normal'
          placeholder='your-email@example.com'
        />
        <Typography variant='body2' color='text.secondary' sx={{ mt: 1, mb: 2 }}>
          We use PayPal for secure payments. You will receive your earnings here.
        </Typography>
        <Button
          type='submit'
          variant='contained'
          sx={{ backgroundColor: green[700], '&:hover': { backgroundColor: green[800] } }}
        >
          Save Payment Method
        </Button>
      </form>

      <Divider sx={{ my: 4 }} />

      <Typography variant='h6' gutterBottom>
        Transaction History
      </Typography>
      <Typography variant='body2' color='text.secondary'>
        No transactions yet. Your payment history will appear here once you start working.
      </Typography>
    </Paper>
  );
};

export default BillingPayments;

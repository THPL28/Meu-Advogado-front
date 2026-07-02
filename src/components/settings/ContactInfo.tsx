import { Button, CircularProgress, TextField, Typography, Paper } from '@mui/material';
import { FormEvent, useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import { getAuthState } from '../../services/authService';
import { green } from '@mui/material/colors';

interface ProfileData {
  firstName: string;
  lastName: string;
  title: string;
  description: string;
  hourlyRate: string;
  location: string;
}

const ContactInfo = () => {
  const { email } = getAuthState();
  const [formData, setFormData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    title: '',
    description: '',
    hourlyRate: '',
    location: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      // Get self profile - backend identifies user from JWT cookie
      const data = await apiRequest<ProfileData>('/api/users/profile/me', { credentials: 'include' });
      if (data) {
        setFormData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          title: data.title || '',
          description: data.description || '',
          hourlyRate: data.hourlyRate || '',
          location: data.location || '',
        });
      }
    } catch {
      // Profile not found, use empty form
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      await apiRequest('/api/users/profile/me', {
        method: 'PUT',
        body: JSON.stringify(formData),
        credentials: 'include',
      });
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <CircularProgress sx={{ mt: 4 }} />;
  }

  return (
    <Paper sx={{ p: 4, mt: 2, maxWidth: 600 }}>
      <Typography variant='h5' gutterBottom fontWeight='bold'>
        Contact Information
      </Typography>
      <Typography variant='body2' color='text.secondary' gutterBottom sx={{ mb: 3 }}>
        {email && `Logged in as: ${email}`}
      </Typography>

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label='First Name'
          value={formData.firstName}
          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          margin='normal'
          required
        />
        <TextField
          fullWidth
          label='Last Name'
          value={formData.lastName}
          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          margin='normal'
          required
        />
        <TextField
          fullWidth
          label='Professional Title'
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          margin='normal'
          placeholder='e.g. Full Stack Developer'
        />
        <TextField
          fullWidth
          label='Description'
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          margin='normal'
          multiline
          rows={4}
          placeholder='Tell clients about yourself...'
        />
        <TextField
          fullWidth
          label='Hourly Rate ($)'
          value={formData.hourlyRate}
          onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
          margin='normal'
          type='number'
          placeholder='e.g. 50'
        />
        <TextField
          fullWidth
          label='Location'
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          margin='normal'
          placeholder='e.g. New York, USA'
        />

        {error && (
          <Typography color='error' variant='body2' sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
        {success && (
          <Typography color='success' variant='body2' sx={{ mt: 1 }}>
            {success}
          </Typography>
        )}

        <Button
          type='submit'
          variant='contained'
          disabled={saving}
          sx={{ mt: 3, backgroundColor: green[700], '&:hover': { backgroundColor: green[800] } }}
        >
          {saving ? <CircularProgress size={24} color='inherit' /> : 'Save Changes'}
        </Button>
      </form>
    </Paper>
  );
};

export default ContactInfo;

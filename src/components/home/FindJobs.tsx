import { Box, Container, TextField, Typography, InputAdornment, CircularProgress, Chip, MenuItem } from '@mui/material';
import { useEffect, useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import GavelIcon from '@mui/icons-material/Gavel';
import JobCard from './JobCard';
import { apiRequest } from '../../services/api';
import { green, grey } from '@mui/material/colors';

interface LegalCaseDTO {
  jobId?: number;
  title: string;
  description: string;
  budget: string;
  jobType: string;
  urgency: string;
  confidentiality: string;
  estimatedValue?: string;
  deadline?: string;
  specialtyId?: number;
  clientName?: string;
  skills?: string[];
  skillNames?: string[];
}

const urgencyLabels: Record<string, string> = {
  'Low': 'Baixa',
  'Medium': 'Média',
  'High': 'Alta',
  'Urgent': 'Urgente',
};

const typeLabels: Record<string, string> = {
  'Hourly': 'Por Hora',
  'Fixed': 'Fixo',
  'ProBono': 'Pro Bono',
  'Contingency': 'Êxito',
};

const FindJobs = () => {
  const [cases, setCases] = useState<LegalCaseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUrgency, setSelectedUrgency] = useState<string | null>(null);

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      setLoading(true);
      const response = await apiRequest<{ success: boolean; data: LegalCaseDTO[] }>('/api/jobs', { credentials: 'include' });
      if (response?.success && response.data) {
        setCases(response.data);
      }
    } catch {
      // Cases not loaded
    } finally {
      setLoading(false);
    }
  };

  const filteredCases = cases.filter((c) => {
    const matchesSearch = !search || 
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase());
    const matchesUrgency = !selectedUrgency || c.urgency === selectedUrgency;
    return matchesSearch && matchesUrgency;
  });

  const urgencyLevels = [...new Set(cases.map((c) => c.urgency).filter(Boolean))];

  return (
    <Container maxWidth='lg' sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <GavelIcon sx={{ fontSize: 32, color: green[700] }} />
        <Typography variant='h4' fontWeight='bold'>
          Casos Jurídicos Disponíveis
        </Typography>
      </Box>
      <Typography variant='body1' color='text.secondary' sx={{ mb: 4 }}>
        Encontre casos jurídicos que correspondam à sua especialidade
      </Typography>

      {/* Search Bar */}
      <TextField
        fullWidth
        variant='outlined'
        placeholder='Pesquisar casos por título ou descrição...'
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position='start'>
              <SearchIcon color='action' />
            </InputAdornment>
          ),
        }}
      />

      {/* Filter Chips */}
      {urgencyLevels.length > 0 && (
        <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
          <Chip
            label='Todas'
            onClick={() => setSelectedUrgency(null)}
            variant={selectedUrgency === null ? 'filled' : 'outlined'}
            sx={selectedUrgency === null ? { backgroundColor: green[700], color: 'white' } : {}}
          />
          {urgencyLevels.map((level) => (
            <Chip
              key={level}
              label={urgencyLabels[level] || level}
              onClick={() => setSelectedUrgency(level === selectedUrgency ? null : level)}
              variant={selectedUrgency === level ? 'filled' : 'outlined'}
              color={level === 'Urgent' ? 'error' : level === 'High' ? 'warning' : 'default'}
              sx={selectedUrgency === level && level !== 'Urgent' && level !== 'High' ? { backgroundColor: green[700], color: 'white' } : {}}
            />
          ))}
        </Box>
      )}

      {/* Case Listings */}
      {loading ? (
        <Box textAlign='center' py={8}>
          <CircularProgress />
        </Box>
      ) : filteredCases.length === 0 ? (
        <Box textAlign='center' py={8}>
          <Typography variant='h6' color='text.secondary'>
            {search || selectedUrgency ? 'Nenhum caso encontrado com esses critérios.' : 'Nenhum caso disponível no momento.'}
          </Typography>
        </Box>
      ) : (
        filteredCases.map((c, index) => (
          <JobCard
            key={c.jobId || index}
            jobId={c.jobId}
            title={c.title}
            description={c.description}
            budget={c.budget}
            jobType={typeLabels[c.jobType] || c.jobType}
            clientName={c.clientName}
            skills={c.skillNames || c.skills}
            urgency={urgencyLabels[c.urgency] || c.urgency}
            confidentiality={c.confidentiality}
            estimatedValue={c.estimatedValue}
            deadline={c.deadline}
          />
        ))
      )}
    </Container>
  );
};

export default FindJobs;

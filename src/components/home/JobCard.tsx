import { Box, Button, Chip, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { green, grey, red, orange } from '@mui/material/colors';
import { isLawyer } from '../../services/authService';

interface JobCardProps {
  jobId?: number;
  title: string;
  description: string;
  budget: string;
  jobType: string;
  skills?: string[];
  clientName?: string;
  urgency?: string;
  confidentiality?: string;
  estimatedValue?: string;
  deadline?: string;
}

const urgencyColors: Record<string, string> = {
  'Baixa': grey[400],
  'Média': green[500],
  'Alta': orange[600],
  'Urgente': red[700],
};

const JobCard = ({ jobId, title, description, budget, jobType, skills = [], clientName, urgency, confidentiality, estimatedValue, deadline }: JobCardProps) => {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        p: 3,
        border: `1px solid ${grey[300]}`,
        borderRadius: 2,
        mb: 2,
        transition: 'all 0.2s',
        '&:hover': {
          borderColor: green[500],
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
        <Typography variant='h6' fontWeight='bold'>
          {title}
        </Typography>
        {urgency && (
          <Chip
            label={urgency}
            size='small'
            sx={{
              backgroundColor: urgencyColors[urgency] || grey[400],
              color: urgency === 'Baixa' || urgency === 'Média' ? 'white' : 'white',
              fontWeight: 'bold',
            }}
          />
        )}
      </Box>
      
      {clientName && (
        <Typography variant='body2' color='text.secondary' gutterBottom>
          Cliente: {clientName}
        </Typography>
      )}

      <Typography variant='body2' color='text.secondary' sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {description}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, flexWrap: 'wrap' }}>
        <Chip label={jobType} size='small' variant='outlined' />
        {confidentiality === 'Confidential' && (
          <Chip label='Confidencial' size='small' color='error' variant='outlined' />
        )}
        {deadline && (
          <Typography variant='body2' color='text.secondary'>
            Prazo: {new Date(deadline).toLocaleDateString('pt-BR')}
          </Typography>
        )}
      </Box>

      {estimatedValue && (
        <Typography variant='body2' fontWeight='bold' color={green[700]}>
          Valor estimado: R$ {parseFloat(estimatedValue).toLocaleString('pt-BR')}
        </Typography>
      )}

      {skills.length > 0 && (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
          {skills.map((skill) => (
            <Chip key={skill} label={skill} size='small' sx={{ backgroundColor: grey[100] }} />
          ))}
        </Box>
      )}

      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
        {isLawyer() && (
          <Button
            variant='contained'
            size='small'
            onClick={() => navigate(`/proposals/${jobId}`)}
            sx={{ backgroundColor: green[700], '&:hover': { backgroundColor: green[800] } }}
          >
            Enviar Proposta
          </Button>
        )}
        <Button
          variant='outlined'
          size='small'
          sx={{ borderColor: green[700], color: green[700] }}
        >
          Ver Detalhes
        </Button>
      </Box>
    </Box>
  );
};

export default JobCard;

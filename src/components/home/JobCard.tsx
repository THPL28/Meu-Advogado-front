import { Box, Button, Chip, Typography } from '@mui/material';
import { green, grey } from '@mui/material/colors';

interface JobCardProps {
  title: string;
  description: string;
  budget: string;
  jobType: string;
  skills?: string[];
  clientName?: string;
}

const JobCard = ({ title, description, budget, jobType, skills = [], clientName }: JobCardProps) => {
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
      <Typography variant='h6' fontWeight='bold' gutterBottom>
        {title}
      </Typography>
      
      {clientName && (
        <Typography variant='body2' color='text.secondary' gutterBottom>
          Client: {clientName}
        </Typography>
      )}

      <Typography variant='body2' color='text.secondary' sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {description}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
        <Chip label={`${jobType}`} size='small' variant='outlined' />
        <Typography variant='body2' fontWeight='bold' color={green[700]}>
          ${budget}
        </Typography>
      </Box>

      {skills.length > 0 && (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {skills.map((skill) => (
            <Chip key={skill} label={skill} size='small' sx={{ backgroundColor: grey[100] }} />
          ))}
        </Box>
      )}

      <Box sx={{ mt: 2 }}>
        <Button
          variant='contained'
          size='small'
          sx={{ backgroundColor: green[700], '&:hover': { backgroundColor: green[800] } }}
        >
          View Details
        </Button>
      </Box>
    </Box>
  );
};

export default JobCard;

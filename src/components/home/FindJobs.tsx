import { Box, Container, TextField, Typography, InputAdornment, CircularProgress, Chip } from '@mui/material';
import { useEffect, useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import JobCard from './JobCard';
import { apiRequest } from '../../services/api';
import { green, grey } from '@mui/material/colors';

interface JobData {
  title: string;
  description: string;
  budget: string;
  jobType: string;
  skillIds?: number[];
}

interface JobWithSkills extends JobData {
  jobId?: number;
  clientName?: string;
  skills?: string[];
}

const FindJobs = () => {
  const [jobs, setJobs] = useState<JobWithSkills[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const response = await apiRequest<{ data: JobWithSkills[] }>('/api/jobs', { credentials: 'include' });
      if (response && response.data) {
        setJobs(response.data);
      }
    } catch {
      // Jobs not loaded
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = !search || 
      job.title?.toLowerCase().includes(search.toLowerCase()) ||
      job.description?.toLowerCase().includes(search.toLowerCase());
    const matchesType = !selectedType || job.jobType === selectedType;
    return matchesSearch && matchesType;
  });

  const jobTypes = [...new Set(jobs.map((j) => j.jobType).filter(Boolean))];

  return (
    <Container maxWidth='lg' sx={{ py: 4 }}>
      <Typography variant='h4' fontWeight='bold' gutterBottom>
        Find Jobs
      </Typography>
      <Typography variant='body1' color='text.secondary' sx={{ mb: 4 }}>
        Browse available projects and find your next opportunity
      </Typography>

      {/* Search Bar */}
      <TextField
        fullWidth
        variant='outlined'
        placeholder='Search jobs by title or description...'
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
      {jobTypes.length > 0 && (
        <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
          <Chip
            label='All'
            onClick={() => setSelectedType(null)}
            variant={selectedType === null ? 'filled' : 'outlined'}
            sx={selectedType === null ? { backgroundColor: green[700], color: 'white' } : {}}
          />
          {jobTypes.map((type) => (
            <Chip
              key={type}
              label={type}
              onClick={() => setSelectedType(type === selectedType ? null : type)}
              variant={selectedType === type ? 'filled' : 'outlined'}
              sx={selectedType === type ? { backgroundColor: green[700], color: 'white' } : {}}
            />
          ))}
        </Box>
      )}

      {/* Job Listings */}
      {loading ? (
        <Box textAlign='center' py={8}>
          <CircularProgress />
        </Box>
      ) : filteredJobs.length === 0 ? (
        <Box textAlign='center' py={8}>
          <Typography variant='h6' color='text.secondary'>
            {search || selectedType ? 'No jobs match your search criteria.' : 'No jobs available yet. Check back later!'}
          </Typography>
        </Box>
      ) : (
        filteredJobs.map((job, index) => (
          <JobCard
            key={job.jobId || index}
            title={job.title}
            description={job.description}
            budget={job.budget}
            jobType={job.jobType}
            clientName={job.clientName}
            skills={job.skills}
          />
        ))
      )}
    </Container>
  );
};

export default FindJobs;

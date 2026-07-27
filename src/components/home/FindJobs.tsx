import { Box, Typography, Button, Chip, Select, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Pagination } from '@mui/material';
import { Add, VisibilityOutlined, EditOutlined, MoreVert, TrendingUp, Gavel, Description, PriorityHigh } from '@mui/icons-material';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const mockCases = [
  {
    id: 1,
    title: 'Ação Trabalhista - Ref 2024.001',
    subtitle: 'Tribunal Regional do Trabalho - 2ª Região',
    clientName: 'André Martins Almeida',
    clientAvatar: 'AM',
    date: '15 Out 2024',
    timeAgo: 'Há 2 horas',
    status: 'ATIVO',
    icon: 'gavel'
  },
  {
    id: 2,
    title: 'Inventário Extrajudicial - Espólio J.F.',
    subtitle: 'Cartório de Registro Civil',
    clientName: 'Juliana Ferreira Santos',
    clientImg: 'https://i.pravatar.cc/150?img=5',
    date: '12 Out 2024',
    timeAgo: 'Há 3 dias',
    status: 'CONCLUÍDO',
    icon: 'doc'
  },
  {
    id: 3,
    title: 'Execução de Título - Banco Alpha vs Beta LTDA',
    subtitle: 'Vara Cível - Comarca Capital',
    clientName: 'Beta Empreendimentos LTDA',
    clientAvatar: 'B',
    date: '08 Out 2024',
    timeAgo: 'Há 1 semana',
    status: 'PAUSADO',
    icon: 'alert'
  }
];

export default function FindJobs() {
  const [statusFilter, setStatusFilter] = useState('Todos');

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'ATIVO': return { bg: '#e8f5e9', text: '#16a30b' };
      case 'CONCLUÍDO': return { bg: '#eeeeee', text: '#757575' };
      case 'PAUSADO': return { bg: '#ffebee', text: '#d32f2f' };
      default: return { bg: '#eeeeee', text: '#757575' };
    }
  };

  const renderIcon = (icon: string) => {
    switch(icon) {
      case 'gavel': return <Gavel sx={{ color: '#16a30b' }} />;
      case 'doc': return <Description sx={{ color: '#555' }} />;
      case 'alert': return <PriorityHigh sx={{ color: '#d32f2f' }} />;
      default: return <Description />;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1, color: 'text.secondary', mb: 1, fontSize: '0.875rem' }}>
        <Typography variant="body2" color="text.secondary">Dashboard</Typography>
        <Typography variant="body2" color="text.secondary">&gt;</Typography>
        <Typography variant="body2" sx={{ color: '#16a30b', fontWeight: 'bold' }}>Casos</Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ color: '#2d2d2d' }}>
            Listagem de Casos
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Gerencie todos os processos jurídicos e acompanhe as atualizações em tempo real.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          sx={{
            backgroundColor: '#16a30b',
            color: 'white',
            px: 3,
            py: 1,
            fontWeight: 'bold',
            textTransform: 'none',
            borderRadius: 2,
            '&:hover': { backgroundColor: '#128209' }
          }}
        >
          Novo Caso
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
        <Box sx={{ flexGrow: 1, border: '1px solid #e0e0e0', borderRadius: 3, p: 3, backgroundColor: 'white', display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
          <Box>
            <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ display: 'block', mb: 1, letterSpacing: 1 }}>
              Status do Processo
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {['Todos (42)', 'Ativos (28)', 'Concluídos (10)', 'Pausados (4)'].map((filter) => {
                const isActive = statusFilter === filter.split(' ')[0];
                return (
                  <Chip 
                    key={filter} 
                    label={filter}
                    onClick={() => setStatusFilter(filter.split(' ')[0])}
                    sx={{ 
                      backgroundColor: isActive ? '#f5fbf5' : '#f5f5f5', 
                      color: isActive ? '#16a30b' : '#555',
                      border: isActive ? '1px solid #16a30b' : '1px solid #e0e0e0',
                      fontWeight: isActive ? 'bold' : 'normal',
                      borderRadius: 2
                    }}
                  />
                );
              })}
            </Box>
          </Box>

          <Box sx={{ borderLeft: { xs: 'none', md: '1px solid #e0e0e0' }, pl: { xs: 0, md: 4 } }}>
            <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ display: 'block', mb: 1, letterSpacing: 1 }}>
              Prioridade
            </Typography>
            <Select 
              size="small" 
              value="Todas as Prioridades"
              sx={{ minWidth: 200, borderRadius: 2 }}
            >
              <MenuItem value="Todas as Prioridades">Todas as Prioridades</MenuItem>
              <MenuItem value="Alta">Alta</MenuItem>
              <MenuItem value="Média">Média</MenuItem>
              <MenuItem value="Baixa">Baixa</MenuItem>
            </Select>
          </Box>
        </Box>

        <Box sx={{ minWidth: { xs: '100%', md: 280 }, backgroundColor: '#333', color: 'white', borderRadius: 3, p: 3, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="caption" fontWeight="bold" sx={{ letterSpacing: 1 }}>
              Ganhos em 2024
            </Typography>
            <TrendingUp sx={{ color: '#16a30b' }} />
          </Box>
          <Typography variant="h4" fontWeight="bold" sx={{ mb: 0.5 }}>
            R$ 145.200
          </Typography>
          <Typography variant="caption" sx={{ color: '#aaa' }}>
            +12% em relação ao mês anterior
          </Typography>
        </Box>
      </Box>

      <TableContainer sx={{ border: '1px solid #e0e0e0', borderRadius: 3, backgroundColor: 'white', mb: 3 }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f9f9f9' }}>
            <TableRow>
              <TableCell><Typography variant="caption" fontWeight="bold" color="text.secondary">Nome do Caso</Typography></TableCell>
              <TableCell><Typography variant="caption" fontWeight="bold" color="text.secondary">Cliente</Typography></TableCell>
              <TableCell><Typography variant="caption" fontWeight="bold" color="text.secondary">Última Atualização</Typography></TableCell>
              <TableCell><Typography variant="caption" fontWeight="bold" color="text.secondary">Status</Typography></TableCell>
              <TableCell align="right"><Typography variant="caption" fontWeight="bold" color="text.secondary">Ações</Typography></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockCases.map((row) => (
              <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ p: 1.5, backgroundColor: row.icon === 'gavel' ? '#e8f5e9' : '#f5f5f5', borderRadius: 2 }}>
                      {renderIcon(row.icon)}
                    </Box>
                    <Box>
                      <Typography variant="body2" fontWeight="bold" sx={{ color: '#333' }}>{row.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{row.subtitle}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    {row.clientImg ? (
                      <Box component="img" src={row.clientImg} sx={{ width: 32, height: 32, borderRadius: '50%' }} />
                    ) : (
                      <Box sx={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: row.status === 'PAUSADO' ? '#16a30b' : '#c8e6c9', color: row.status === 'PAUSADO' ? 'white' : '#128209', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>
                        {row.clientAvatar}
                      </Box>
                    )}
                    <Typography variant="body2" sx={{ color: '#555', maxWidth: 120, lineHeight: 1.2 }}>{row.clientName}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ color: '#333' }}>{row.date}</Typography>
                  <Typography variant="caption" color="text.secondary">{row.timeAgo}</Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={row.status} 
                    size="small" 
                    sx={{ 
                      backgroundColor: getStatusColor(row.status).bg, 
                      color: getStatusColor(row.status).text, 
                      fontWeight: 'bold', 
                      fontSize: '0.7rem' 
                    }} 
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton component={Link} to={`/casos/${row.id}`} size="small"><VisibilityOutlined fontSize="small" /></IconButton>
                  <IconButton size="small"><EditOutlined fontSize="small" /></IconButton>
                  <IconButton size="small"><MoreVert fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e0e0e0', backgroundColor: '#fafafa' }}>
          <Typography variant="body2" color="text.secondary">
            Mostrando 1 a 3 de 42 casos
          </Typography>
          <Pagination count={3} variant="outlined" shape="rounded" color="primary" sx={{ '& .Mui-selected': { backgroundColor: '#16a30b !important', color: 'white', border: 'none' } }} />
        </Box>
      </TableContainer>
    </Box>
  );
}

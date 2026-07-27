import { Box, Typography, TextField, InputAdornment, Avatar, IconButton, Badge } from '@mui/material';
import { ReactNode } from 'react';
import { Search, NotificationsNone, SettingsOutlined, DashboardOutlined, FolderOutlined, DescriptionOutlined, HistoryOutlined, AssessmentOutlined, HelpOutline, LogoutOutlined } from '@mui/icons-material';
import { useLocation, useNavigate, Link } from 'react-router-dom';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const sidebarMenu = [
    { icon: <DashboardOutlined />, label: 'Visão Geral', path: '/dashboard' },
    { icon: <FolderOutlined />, label: 'Arquivos', path: '/arquivos' },
    { icon: <DescriptionOutlined />, label: 'Documentos', path: '/documentos' },
    { icon: <HistoryOutlined />, label: 'Histórico', path: '/historico' },
    { icon: <AssessmentOutlined />, label: 'Relatórios', path: '/relatorios' },
  ];

  const topTabs = [
    { label: 'Casos', path: '/casos' },
    { label: 'Propostas', path: '/propostas' },
    { label: 'Contratos', path: '/contratos' },
    { label: 'Pagamentos', path: '/payments' },
  ];

  const handleLogout = () => {
    // perform logout logic
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* SIDEBAR */}
      <Box sx={{ width: 260, backgroundColor: '#f4f5f7', borderRight: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 4, pb: 2 }}>
          <Typography variant="h5" sx={{ color: '#16a30b', fontWeight: 900, letterSpacing: 1, fontFamily: 'Rubik, sans-serif' }}>
            LWORK
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Plataforma Jurídica
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1, px: 2, mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {sidebarMenu.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Box 
                key={item.label}
                onClick={() => navigate(item.path)}
                sx={{ 
                  display: 'flex', alignItems: 'center', gap: 2, p: 1.5, px: 2, 
                  borderRadius: 2, cursor: 'pointer',
                  backgroundColor: isActive ? '#d9f9d9' : 'transparent',
                  color: isActive ? '#128209' : '#555',
                  fontWeight: isActive ? 'bold' : 'normal',
                  '&:hover': { backgroundColor: isActive ? '#d9f9d9' : '#eef1f5' }
                }}
              >
                {item.icon}
                <Typography variant="body2" sx={{ fontWeight: 'inherit' }}>{item.label}</Typography>
              </Box>
            );
          })}

          <Box 
            sx={{ 
              mt: 4, p: 2, backgroundColor: '#16a30b', color: 'white', 
              borderRadius: 2, textAlign: 'center', cursor: 'pointer',
              fontWeight: 'bold', '&:hover': { backgroundColor: '#128209' }
            }}
          >
            Nova Proposta
          </Box>
        </Box>

        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1, borderTop: '1px solid #e0e0e0' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, px: 2, cursor: 'pointer', color: '#555', '&:hover': { color: '#000' } }}>
            <HelpOutline />
            <Typography variant="body2">Ajuda</Typography>
          </Box>
          <Box onClick={handleLogout} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, px: 2, cursor: 'pointer', color: '#555', '&:hover': { color: '#000' } }}>
            <LogoutOutlined />
            <Typography variant="body2">Sair</Typography>
          </Box>
        </Box>
      </Box>

      {/* RIGHT CONTENT */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* HEADER */}
        <Box sx={{ height: 80, borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', px: 4, justifyContent: 'space-between', backgroundColor: '#fff' }}>
          <Box sx={{ flex: 1, maxWidth: 500 }}>
            <TextField 
              fullWidth 
              size="small" 
              placeholder="Pesquisar processos ou clientes..." 
              InputProps={{
                startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
                sx: { borderRadius: 6, backgroundColor: '#f9f9f9' }
              }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Box sx={{ display: 'flex', gap: 3 }}>
              {topTabs.map((tab) => {
                const isActive = location.pathname.startsWith(tab.path);
                return (
                  <Link 
                    key={tab.label} 
                    to={tab.path} 
                    style={{ 
                      textDecoration: 'none', 
                      color: isActive ? '#16a30b' : '#666',
                      fontWeight: isActive ? 'bold' : 'normal',
                      borderBottom: isActive ? '2px solid #16a30b' : 'none',
                      paddingBottom: '4px'
                    }}
                  >
                    {tab.label}
                  </Link>
                )
              })}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, borderLeft: '1px solid #e0e0e0', pl: 3 }}>
              <IconButton><Badge color="error" variant="dot"><NotificationsNone /></Badge></IconButton>
              <IconButton><SettingsOutlined /></IconButton>
              <Avatar sx={{ width: 36, height: 36, ml: 1, cursor: 'pointer' }} src="https://i.pravatar.cc/150?img=11" />
            </Box>
          </Box>
        </Box>

        {/* MAIN AREA */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 4 }}>
          {children}
        </Box>

      </Box>
    </Box>
  );
}

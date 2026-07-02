import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';
import WorkOutlineRoundedIcon from '@mui/icons-material/WorkOutlineRounded';
import { Box, Button, Container } from '@mui/material';
import { green } from '@mui/material/colors';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ClickableCard from './ClickableCard';

const SignupPage = () => {
  const [userType, setUserType] = useState('');
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const navigate = useNavigate();
  const handleCardClick = (cardIndex: number | null) => {
    setActiveCard((prev) => (prev === cardIndex ? null : cardIndex));
  };
  const onSubmit = () => {
    navigate(`/signup/${userType}`, { state: { role: userType } });
  };

  return (
    <>
      <Container sx={{ display: 'flex', justifyContent: 'center' }}>
        <ClickableCard
          width={255}
          height={220}
          my={20}            text={"Sou Advogado, em busca de casos"}
          isHovered={activeCard === null || activeCard === 0}
          isactive={activeCard === 0}
          onClick={() => {
            handleCardClick(0);
            setUserType('lawyer');
          }}
          Icon={TerminalRoundedIcon}
        />
        <Box sx={{ width: '50px' }}></Box>
        <ClickableCard
          width={250}
          height={220}
          my={20}
          text={"Sou Cliente, preciso de um advogado"}
          isHovered={activeCard === null || activeCard === 1}
          isactive={activeCard === 1}
          onClick={() => {
            handleCardClick(1);
            setUserType('client');
          }}
          Icon={WorkOutlineRoundedIcon}
        />
      </Container>

      <Container
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
        }}
      >
        <Button
          type='submit'
          onClick={onSubmit}
          variant='contained'
          sx={{
            background: green[900],
            textTransform: 'uppercase',
            borderRadius: 17,
            '&:hover': {
              bgcolor: green[600],
            },
          }}
          disabled={activeCard === null}
        >
          {activeCard === 0
            ? 'Cadastrar como Advogado'
            : activeCard === 1
              ? 'Cadastrar como Cliente'
              : 'Continuar'}
        </Button>
      </Container>
    </>
  );
};

export default SignupPage;

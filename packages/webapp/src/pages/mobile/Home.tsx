import { Stack, Button, Text, Box, Title, Modal } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { getFullViewHeight } from './MobileLayout';
import { IconBackhoe, IconBarrierBlock, IconBook2, IconHammer, IconNotes, IconTools } from '@tabler/icons-react';
import { useState } from 'react';

export const Home = () => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <Stack style={{ height: getFullViewHeight() }} py="xl" align="center" px="md">
      <Button 
        size="lg" 
        fullWidth 
        onClick={() => navigate('/exercise')}
        style={{ 
          maxWidth: 300, 
          fontSize: '1.2rem',
          borderRadius: '10px',
          background: 'linear-gradient(45deg, #4158D0, #C850C0)',
          height: '70px',
          position: 'relative',
        }}
      >
        <Stack gap={0}>
          <Title order={4}>
            תרגול נושאים
          </Title>
          <Text className='opacity-75'>
            תרגול שאלות לפי נושאים
          </Text>
        </Stack>

        <Box style={{ 
          position: 'absolute', 
          right: '16px', 
          top: '50%', 
          transform: 'translateY(-50%)' 
        }}>
          <IconBook2 size={24} />
        </Box>
      </Button>
      
      <Button 
        size="lg" 
        fullWidth 
        onClick={() => setModalOpen(true)}
        style={{ 
          maxWidth: 300, 
          fontSize: '1.2rem',
          borderRadius: '10px',
          background: 'linear-gradient(45deg, #2B86C5, #00C9A7)',
          opacity: 0.5,
          height: '70px',
          marginTop: '20px',
          position: 'relative',
        }}
      >
        <Stack gap={0}>
          <Title order={4}>
            מבחן מלא
          </Title>
          <Text className='opacity-75'>
            100 שאלות, בכל הנושאים
          </Text>
        </Stack>
        <Box style={{ 
          position: 'absolute', 
          right: '16px', 
          top: '50%', 
          transform: 'translateY(-50%)' 
        }}>
          <IconNotes size={24} />
        </Box>
      </Button>

      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title="מבחן מלא"
        centered
        styles={{
          title: { fontWeight: 'bold', fontSize: '1.2rem' },
          body: { textAlign: 'center' }
        }}
      >
        <Box ta="center">
          <IconBarrierBlock size={64} color="#FFD700" />
        </Box>
        <Text size="lg" fw={500} ta="center" pb="md">
          אנחנו עובדים על זה
        </Text>
        <Button 
          onClick={() => setModalOpen(false)} 
          fullWidth 
          mt="md"
        >
          סגור
        </Button>
      </Modal>
    </Stack>
  );
}; 

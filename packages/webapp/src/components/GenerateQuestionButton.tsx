import { Button, Modal, Textarea, Group, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconWand } from '@tabler/icons-react';
import { useState } from 'react';
import { useGenerateQuestion } from '../api/questions';
import { notifications } from '@mantine/notifications';
import { Question } from '../api/types';

interface GenerateQuestionButtonProps {
  subjectId: string;
  onGenerated?: (question: Question) => void;
}

export function GenerateQuestionButton({ subjectId, onGenerated }: GenerateQuestionButtonProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const [questionText, setQuestionText] = useState('');
  const generateQuestionMutation = useGenerateQuestion();

  const handleSubmit = async () => {
    if (!questionText.trim()) {
      notifications.show({
        title: 'שגיאה',
        message: 'נא להזין טקסט לשאלה',
        color: 'red',
      });
      return;
    }

    try {
      const result = await generateQuestionMutation.mutateAsync({
        text: questionText,
        subjectId
      });
            
      if (onGenerated) {
        onGenerated(result);
      }
      
      notifications.show({
        title: 'הצלחה',
        message: 'השאלה נוצרה בהצלחה',
        color: 'green',
      });
      
      close();
      setQuestionText('');
    } catch (error) {
      console.error('Error generating question:', error);
      notifications.show({
        title: 'שגיאה',
        message: 'אירעה שגיאה ביצירת השאלה',
        color: 'red',
      });
    }
  };

  return (
    <>
      <Button 
        leftSection={<IconWand size={16} />}
        onClick={open}
        variant="light"
        color="indigo"
      >
        יצירה עם AI
      </Button>

      <Modal 
        opened={opened} 
        onClose={close} 
        title="יצירת שאלה חדשה באמצעות AI"
        centered
      >
        <Text size="sm" mb="md">
          הכנס את טקסט השאלה והאפשרויות, והמערכת תיצור שאלה מלאה בעברית
        </Text>
        
        <Textarea
          placeholder="הזן את טקסט השאלה והאפשרויות כאן..."
          minRows={6}
          value={questionText}
          onChange={(event) => setQuestionText(event.currentTarget.value)}
          mb="md"
        />
        
        <Group justify="flex-end">
          <Button variant="subtle" onClick={close}>ביטול</Button>
          <Button 
            onClick={handleSubmit}
            loading={generateQuestionMutation.isPending}
          >
            יצירת שאלה
          </Button>
        </Group>
      </Modal>
    </>
  );
} 
import { Container, Title, Group, Loader, Alert, Button, Grid } from '@mantine/core';
import { useParams, useNavigate } from 'react-router-dom';
import { useSubjectsByExamId } from '../../api';
import { IconArrowLeft } from '@tabler/icons-react';
import { SubjectTree } from '../../components/SubjectTree';
import { SubjectEditor } from '../../components/SubjectEditor';

export const GovExam = () => {
  const { govExamId } = useParams<{ govExamId: string }>();
  const navigate = useNavigate();
  const { data: examSubjects, isLoading, error } = useSubjectsByExamId(govExamId || '');

  const handleSubjectSelect = (subjectId: string) => {
    // Handle subject selection here
    console.log('Selected subject:', subjectId);
  };

  if (isLoading) {
    return (
      <Container size="xl" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Loader size="xl" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="xl">
        <Alert color="red" title="Error">
          Failed to load subjects. Please try again later.
        </Alert>
      </Container>
    );
  }

  if (!govExamId || !examSubjects) {
    return null;
  }

  return (
    <Container size="xl">
      <Group mb="xl">
        <Button
          variant="subtle"
          leftSection={<IconArrowLeft size={20} />}
          onClick={() => navigate('/')}
        >
          Back to Exams
        </Button>
      </Group>
      
      <Title order={1} mb="xl">{examSubjects.examName}</Title>
      
      <Grid>
        <Grid.Col span={3} p="0">
          <SubjectTree govExamId={govExamId} onSubjectSelect={handleSubjectSelect} />
        </Grid.Col>
        <Grid.Col span={9} p="0">
          <SubjectEditor />
        </Grid.Col>
      </Grid>
    </Container>
  );
}; 
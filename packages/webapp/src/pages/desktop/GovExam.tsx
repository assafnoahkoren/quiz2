import { Container, Title, Group, Loader, Alert, Button, Grid, Breadcrumbs, Anchor } from '@mantine/core';
import { useParams, useNavigate } from 'react-router-dom';
import { useSubjectsByExamId } from '../../api';
import { IconArrowLeft } from '@tabler/icons-react';
import { SubjectTree } from '../../components/SubjectTree';
import { SubjectEditor } from '../../components/SubjectEditor';
import { useState } from 'react';

export const GovExam = () => {
  const { govExamId } = useParams<{ govExamId: string }>();
  const navigate = useNavigate();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const { data: examSubjects, isLoading, error } = useSubjectsByExamId(govExamId || '');

  const handleSubjectSelect = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
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
        <Breadcrumbs>
          <Anchor onClick={() => navigate('/')}>Exams</Anchor>
          <Anchor>{examSubjects.examName}</Anchor>
        </Breadcrumbs>
      </Group>
      
      <Title order={3} mb="xl">{examSubjects.examName}</Title>
      
      <Grid>
        <Grid.Col span={3} p="0">
          <SubjectTree govExamId={govExamId} onSubjectSelect={handleSubjectSelect} />
        </Grid.Col>
        <Grid.Col span={9} p="0">
          {selectedSubjectId ? (
            <SubjectEditor subjectId={selectedSubjectId} />
          ) : (
            <Alert color="blue" title="Select a Subject">
              Please select a subject from the tree to view and edit its questions.
            </Alert>
          )}
        </Grid.Col>
      </Grid>
    </Container>
  );
}; 
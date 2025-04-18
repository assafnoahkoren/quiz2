import { Container, Title, Group, Loader, Alert, Button, Grid, Breadcrumbs, Anchor } from '@mantine/core';
import { useParams, useNavigate } from 'react-router-dom';
import { useSubjectsByExamId } from '../../api';
import { IconArrowLeft } from '@tabler/icons-react';
import { SubjectTree } from '../../components/SubjectTree';
import { SubjectEditor } from '../../components/SubjectEditor';
import { useState, useMemo } from 'react';
import { SubjectTreeItem } from '../../api/types';

// Helper function to find subject name by ID in the tree
const findSubjectPathById = (subjects: SubjectTreeItem[] | undefined, targetId: string | null): string[] | null => {
  if (!targetId || !subjects) return null;

  for (const subject of subjects) {
    // Check if the current subject is the target
    if (subject.id === targetId) {
      return [subject.name]; // Base case: found the target
    }

    // Recursively search in children
    if (subject.children && subject.children.length > 0) {
      const pathFromChild = findSubjectPathById(subject.children, targetId);
      // If the target was found in a child's subtree
      if (pathFromChild) {
        // Prepend the current subject's name to the path
        return [subject.name, ...pathFromChild];
      }
    }
  }

  // Target ID not found in this branch of the tree
  return null;
};

export const GovExam = () => {
  const { govExamId } = useParams<{ govExamId: string }>();
  const navigate = useNavigate();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const { data: examSubjects, isLoading, error } = useSubjectsByExamId(govExamId || '');

  const handleSubjectSelect = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
  };

  const selectedSubjectPath = useMemo(() => {
    return findSubjectPathById(examSubjects?.subjects, selectedSubjectId);
  }, [examSubjects?.subjects, selectedSubjectId]);

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

  // Keep breadcrumbs simple for now, only showing exam name
  const breadcrumbItems = [
    <Anchor key="exams" onClick={() => navigate('/')}>Exams</Anchor>,
    <Anchor key="examName">{examSubjects.examName}</Anchor>,
  ];

  return (
    <Container size="xl">
      <Group mb="xl">
        <Breadcrumbs>{breadcrumbItems}</Breadcrumbs>
      </Group>
      
      <Title order={3} mb="xl">
        {examSubjects.examName}
        {selectedSubjectPath ? ` / ${selectedSubjectPath.join(' / ')}` : ''}
      </Title>
      
      <Grid>
        <Grid.Col span={3} p="0">
          <SubjectTree govExamId={govExamId} onSubjectSelect={handleSubjectSelect} />
        </Grid.Col>
        <Grid.Col span={9} p="0">
          {selectedSubjectId ? (
            <SubjectEditor subjectId={selectedSubjectId} govExamId={govExamId} />
          ) : (
            <Group  px="md" h="100%">
              <Alert color="blue" title="בחר נושא" flex={1}>
                אנא בחר נושא מהעץ כדי לצפות ולערוך את השאלות שלו.
              </Alert>
            </Group>
          )}
        </Grid.Col>
      </Grid>
    </Container>
  );
}; 
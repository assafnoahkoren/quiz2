import { Card, Text, Loader, Alert, Stack, Group, TextInput, Select, Badge, Accordion, Button } from '@mantine/core';
import { useQuestionsBySubjectId } from '../api';
import { useState } from 'react';
import { QuestionStatus } from '../api/types';
import { QuestionEditor } from './QuestionEditor';
import { IconPlus, IconX } from '@tabler/icons-react';

interface SubjectEditorProps {
  subjectId: string;
  govExamId: string;
}

type OrderBy = 'updatedAt-desc' | 'updatedAt-asc' | 'createdAt-desc' | 'createdAt-asc';

export const SubjectEditor = ({ subjectId, govExamId }: SubjectEditorProps) => {
  const { data: questions, isLoading, error } = useQuestionsBySubjectId(subjectId);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<QuestionStatus | null>(null);
  const [orderBy, setOrderBy] = useState<OrderBy | null>(null);
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const filterByText = (question: { question: string }) => {
    return question.question.toLowerCase().includes(searchText.toLowerCase());
  };

  const filterByStatus = (question: { status: QuestionStatus }) => {
    if (!statusFilter) return true;
    return question.status === statusFilter;
  };

  const sortQuestions = (a: { createdAt: string; updatedAt: string }, b: { createdAt: string; updatedAt: string }) => {
    if (!orderBy) return 0;
    const [field, direction] = orderBy.split('-');
    const aValue = field === 'createdAt' ? new Date(a.createdAt) : new Date(a.updatedAt);
    const bValue = field === 'createdAt' ? new Date(b.createdAt) : new Date(b.updatedAt);
    return direction === 'asc' ? aValue.getTime() - bValue.getTime() : bValue.getTime() - aValue.getTime();
  };

  const handleCreateClick = () => {
    setIsCreatingNew(true);
    setOpenItems(['new-question']);
  };

  const handleNewQuestionSuccess = () => {
    setIsCreatingNew(false);
    setOpenItems([]);
  };

  const handleCancelCreate = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsCreatingNew(false);
  };

  if (isLoading) {
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Loader size="sm" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Alert color="red" title="Error">
          Failed to load questions. Please try again later.
        </Alert>
      </Card>
    );
  }

  const filteredQuestions = questions?.filter(filterByText).filter(filterByStatus).sort(sortQuestions);

  return (
    <Stack p="md" py="0">
      <Group>
        <TextInput 
          flex={1}
          placeholder="חיפוש שאלות" 
          value={searchText}
          onChange={(e) => setSearchText(e.currentTarget.value)}
        />
        <Button
          variant="light"
          leftSection={<IconPlus size={16} />}
          onClick={handleCreateClick}
        >
          צור שאלה
        </Button>
        <Select
          placeholder="סטטוס"
          value={statusFilter}
          onChange={(value) => setStatusFilter(value as QuestionStatus)}
          data={[
            { value: QuestionStatus.DRAFT, label: 'טיוטה' },
            { value: QuestionStatus.PUBLISHED, label: 'פורסם' },
            { value: QuestionStatus.ARCHIVED, label: 'בארכיון' },
          ]}
          clearable
        />
        <Select
          placeholder="מיין לפי"
          value={orderBy}
          onChange={(value) => setOrderBy(value as OrderBy)}
          data={[
            { value: 'updatedAt-desc', label: 'עריכה אחרונה (חדש לישן)' },
            { value: 'updatedAt-asc', label: 'עריכה אחרונה (ישן לחדש)' },
            { value: 'createdAt-desc', label: 'יצירה (חדש לישן)' },
            { value: 'createdAt-asc', label: 'יצירה (ישן לחדש)' },
          ]}
        />
      </Group>
      <Accordion value={openItems} onChange={setOpenItems} multiple>
        {isCreatingNew && (
          <Accordion.Item key="new-question" value="new-question">
            <Accordion.Control>
              <Group justify="space-between">
                <Group>
                  <Badge variant='light' color="yellow">טיוטה</Badge>
                  <Text size="xs" c="dimmed">שאלה חדשה</Text>
                </Group>
                <Button
                  size="compact-xs"
                  me={16}
                  variant="light"
                  color="red"
                  onClick={handleCancelCreate}
                  leftSection={<IconX size={14} />}
                >
                  בטל
                </Button>
              </Group>
              <Text mt={4}>צור שאלה חדשה</Text>
            </Accordion.Control>
            <Accordion.Panel>
              <QuestionEditor 
                subjectId={subjectId} 
                govExamId={govExamId} 
                onSuccess={handleNewQuestionSuccess} 
              />
            </Accordion.Panel>
          </Accordion.Item>
        )}
        {filteredQuestions?.map((question) => (
          <Accordion.Item key={question.id} value={question.id}>
            <Accordion.Control>
              <Group>
                <Badge variant='light' color={question.status === QuestionStatus.PUBLISHED ? 'green' : question.status === QuestionStatus.DRAFT ? 'yellow' : 'gray'}>
                  {question.status === QuestionStatus.PUBLISHED ? 'פורסם' : question.status === QuestionStatus.DRAFT ? 'טיוטה' : 'בארכיון'}
                </Badge>
                <Text size="xs" c="dimmed">נערך לאחרונה: {new Date(question.updatedAt).toLocaleDateString()}</Text>
              </Group>
              <Text>{question.question}</Text>
            </Accordion.Control>
            {openItems.includes(question.id) ? (
              <Accordion.Panel>
                <QuestionEditor 
                  questionId={question.id} 
                  subjectId={subjectId} 
                  govExamId={govExamId} 
                />
              </Accordion.Panel>
            ) : (
              <Accordion.Panel>
                <div className='h-[700px]'></div>
              </Accordion.Panel>
            )}
          </Accordion.Item>
        ))}
      </Accordion>
      {filteredQuestions?.length === 0 && (
        <Text c="dimmed">No questions found for this subject.</Text>
      )}
    </Stack>
  );
}; 
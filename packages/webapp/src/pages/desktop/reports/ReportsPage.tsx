import React from 'react';
import {
  Container,
  Title,
  Table,
  Select,
  Badge,
  Button,
  Group,
  Text,
  Loader,
  Alert,
  ActionIcon,
  Tooltip,
  Modal,
  Stack,
  Divider,
  Box,
  Paper,
} from '@mantine/core';
import { IconCheck, IconAlertCircle, IconBrandWhatsapp } from '@tabler/icons-react';
import { useReports, useUpdateReportStatus, ReportStatus, ReportType, Report } from '../../../api/reports';
import { showNotification } from '@mantine/notifications';
import { useState } from 'react';
import { useDisclosure } from '@mantine/hooks';

const reportTypeLabels: Record<ReportType, string> = {
  [ReportType.TECHNICAL_ISSUE]: 'בעיה טכנית',
  [ReportType.CONTENT_ERROR]: 'טעות בתוכן',
  [ReportType.OTHER]: 'אחר',
};

const reportStatusLabels: Record<ReportStatus, string> = {
  [ReportStatus.PENDING]: 'ממתין',
  [ReportStatus.RESOLVED]: 'טופל',
};

export const ReportsPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'ALL'>(ReportStatus.PENDING);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  
  const { data: reports, isLoading, error } = useReports(
    statusFilter === 'ALL' ? undefined : statusFilter
  );
  
  const updateStatusMutation = useUpdateReportStatus();

  const handleStatusUpdate = async (reportId: string, newStatus: ReportStatus) => {
    try {
      await updateStatusMutation.mutateAsync({
        id: reportId,
        data: { status: newStatus },
      });
      showNotification({
        title: 'הסטטוס עודכן בהצלחה',
        message: `הדיווח סומן כ${reportStatusLabels[newStatus]}`,
        color: 'green',
      });
    } catch (error) {
      showNotification({
        title: 'שגיאה בעדכון סטטוס',
        message: 'אירעה שגיאה בעת עדכון הסטטוס',
        color: 'red',
      });
    }
  };

  if (isLoading) {
    return (
      <Container size="xl">
        <Loader size="lg" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="xl">
        <Alert icon={<IconAlertCircle size="1rem" />} title="שגיאה" color="red">
          אירעה שגיאה בטעינת הדיווחים
        </Alert>
      </Container>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('he-IL', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const formatPhoneForWhatsApp = (phone: string) => {
    // Remove any non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    // If starts with 0, replace with 972 (Israel country code)
    if (cleanPhone.startsWith('0')) {
      return '972' + cleanPhone.substring(1);
    }
    return cleanPhone;
  };

  const handleRowClick = (report: Report) => {
    setSelectedReport(report);
    open();
  };

  return (
    <Container size="xl">
      <Modal
        opened={opened}
        onClose={close}
        title={`דיווח מתאריך ${selectedReport ? formatDate(selectedReport.createdAt) : ''}`}
        size="lg"
      >
        {selectedReport && (
          <Stack>
            <Paper p="md" withBorder>
              <Group justify="space-between" mb="sm">
                <Text fw={700}>הודעת הדיווח:</Text>
                <Badge variant="filled" color={selectedReport.status === ReportStatus.PENDING ? 'orange' : 'green'}>
                  {reportStatusLabels[selectedReport.status]}
                </Badge>
              </Group>
              <Text>{selectedReport.message}</Text>
            </Paper>

            <Paper p="md" withBorder>
              <Text fw={700} mb="sm">פרטים:</Text>
              <Stack gap="xs">
                <Group>
                  <Text c="dimmed">סוג דיווח:</Text>
                  <Badge variant="light">{reportTypeLabels[selectedReport.type]}</Badge>
                </Group>
                <Group>
                  <Text c="dimmed">טלפון:</Text>
                  <Group gap="xs">
                    <Text>{selectedReport.phoneNumber}</Text>
                    <Tooltip label="פתח בוואטסאפ">
                      <ActionIcon
                        color="green"
                        variant="filled"
                        size="sm"
                        component="a"
                        href={`https://wa.me/${formatPhoneForWhatsApp(selectedReport.phoneNumber)}?text=${encodeURIComponent(
                          `הי! זו שגב מקוויז`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <IconBrandWhatsapp size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Group>
              </Stack>
            </Paper>

            {selectedReport.questionData && (
              <Paper p="md" withBorder>
                <Text fw={700} mb="sm">נתוני השאלה:</Text>
                <Stack gap="sm">
                  {selectedReport.questionData.question && (
                    <Box>
                      <Text c="dimmed" size="sm">שאלה:</Text>
                      <Text>{selectedReport.questionData.question}</Text>
                    </Box>
                  )}
                  {selectedReport.questionData.explanation && (
                    <Box>
                      <Text c="dimmed" size="sm">הסבר:</Text>
                      <Text>{selectedReport.questionData.explanation}</Text>
                    </Box>
                  )}
                  {selectedReport.questionData.Options && selectedReport.questionData.Options.length > 0 && (
                    <Box>
                      <Text c="dimmed" size="sm" mb="xs">תשובות:</Text>
                      <Stack gap="xs">
                        {selectedReport.questionData.Options.map((option: any, index: number) => (
                          <Group key={index} gap="xs">
                            <Badge size="sm" variant={option.isCorrect ? 'filled' : 'light'} color={option.isCorrect ? 'green' : 'gray'}>
                              {index + 1}
                            </Badge>
                            <Text size="sm">{option.answer}</Text>
                          </Group>
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Stack>
              </Paper>
            )}

            <Group justify="space-between">
              <Button variant="subtle" onClick={close}>
                סגור
              </Button>
              {selectedReport.status === ReportStatus.PENDING && (
                <Button
                  color="green"
                  leftSection={<IconCheck size={18} />}
                  onClick={() => {
                    handleStatusUpdate(selectedReport.id, ReportStatus.RESOLVED);
                    close();
                  }}
                  loading={updateStatusMutation.isPending}
                >
                  סמן כטופל
                </Button>
              )}
            </Group>
          </Stack>
        )}
      </Modal>
      <Group justify="space-between" mb="md">
        <Title order={2}>דיווחים</Title>
        <Select
          value={statusFilter}
          onChange={(value) => setStatusFilter(value as ReportStatus | 'ALL')}
          data={[
            { value: 'ALL', label: 'כל הדיווחים' },
            { value: ReportStatus.PENDING, label: reportStatusLabels[ReportStatus.PENDING] },
            { value: ReportStatus.RESOLVED, label: reportStatusLabels[ReportStatus.RESOLVED] },
          ]}
          style={{ width: 200 }}
        />
      </Group>

      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>תאריך</Table.Th>
            <Table.Th>סוג</Table.Th>
            <Table.Th>הודעה</Table.Th>
            <Table.Th>טלפון</Table.Th>
            <Table.Th>שאלה</Table.Th>
            <Table.Th>סטטוס</Table.Th>
            <Table.Th>פעולות</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {reports && reports.length > 0 ? (
            reports.map((report) => (
              <Table.Tr 
                key={report.id}
                onClick={() => handleRowClick(report)}
                style={{ cursor: 'pointer' }}
              >
                <Table.Td>{formatDate(report.createdAt)}</Table.Td>
                <Table.Td>
                  <Badge variant="light">{reportTypeLabels[report.type]}</Badge>
                </Table.Td>
                <Table.Td>
                  <Tooltip label={report.message} multiline w={300}>
                    <Text size="sm">{truncateText(report.message)}</Text>
                  </Tooltip>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <Text size="sm">{report.phoneNumber}</Text>
                    <Tooltip label="פתח בוואטסאפ">
                      <ActionIcon
                        color="green"
                        variant="subtle"
                        size="sm"
                        component="a"
                        href={`https://wa.me/${formatPhoneForWhatsApp(report.phoneNumber)}?text=${encodeURIComponent(
                          `הי! זו שגב מקוויז`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <IconBrandWhatsapp size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Table.Td>
                <Table.Td>
                  {report.questionData?.question ? (
                    <Tooltip label={report.questionData.question} multiline w={300}>
                      <Text size="sm">{truncateText(report.questionData.question, 30)}</Text>
                    </Tooltip>
                  ) : (
                    <Text size="sm" c="dimmed">-</Text>
                  )}
                </Table.Td>
                <Table.Td>
                  <Badge
                    color={report.status === ReportStatus.PENDING ? 'orange' : 'green'}
                    variant="filled"
                  >
                    {reportStatusLabels[report.status]}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  {report.status === ReportStatus.PENDING && (
                    <Tooltip label="סמן כטופל">
                      <ActionIcon
                        color="green"
                        variant="subtle"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusUpdate(report.id, ReportStatus.RESOLVED);
                        }}
                        loading={updateStatusMutation.isPending}
                      >
                        <IconCheck size={18} />
                      </ActionIcon>
                    </Tooltip>
                  )}
                </Table.Td>
              </Table.Tr>
            ))
          ) : (
            <Table.Tr>
              <Table.Td colSpan={7} style={{ textAlign: 'center' }}>
                <Text c="dimmed">אין דיווחים להצגה</Text>
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>
    </Container>
  );
};
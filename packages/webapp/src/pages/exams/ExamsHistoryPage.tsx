import React from 'react';
import { useGetUserExams } from '../../api/exams'; // Adjust path as needed
import { Link } from 'react-router-dom'; // Import Link for the button
import {
	Card,
	Text,
	Group,
	Badge,
	SimpleGrid,
	Container,
	Title,
	Loader,
	Alert,
	Center,
	Stack,
	Flex,
	RingProgress, // Import RingProgress
	Button, // Import Button
	ActionIcon // Import ActionIcon for potentially smaller 'End' button
} from '@mantine/core';
import {
	IconCheck,
	IconClock,
	IconFileOff,
	IconClockHour4,
	IconExternalLink, // Icon for Open Exam
	IconPlayerStop, // Icon for End Exam
	IconPlayerPause,
	IconPlayerPauseFilled
} from '@tabler/icons-react';

// Helper function to format duration in milliseconds to MM:SS
function formatDuration(ms: number): string {
	const totalSeconds = Math.floor(ms / 1000);
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

const ExamsHistoryPage: React.FC = () => {
	const { data: exams, isLoading, error } = useGetUserExams();

	if (isLoading) {
		return (
			<Container>
				<Center style={{ height: '200px' }}>
					<Stack align="center">
						<Loader />
						<Text>טוען היסטוריית בחינות...</Text>
					</Stack>
				</Center>
			</Container>
		);
	}

	if (error) {
		const errorMessage = error instanceof Error ? error.message : 'אירעה שגיאה לא ידועה';
		return (
			<Container>
				<Alert icon={<IconFileOff size="1rem" />} color="red" title="שגיאה בטעינת הבחינות">
					{errorMessage}
				</Alert>
			</Container>
		);
	}

	return (
		<Container dir="rtl">
			<Title order={3} mb="lg" mt="md">היסטוריית בחינות</Title>
			{(!exams || exams.length === 0) ? (
				<Center style={{ height: '200px' }}>
					<Stack align="center">
						<IconFileOff size="2rem" stroke={1.5} />
						<Text c="dimmed">עדיין לא ביצעת בחינות.</Text>
					</Stack>
				</Center>
			) : (
				<SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
					{exams.map((exam) => {
						const duration = exam.completedAt ? new Date(exam.completedAt).getTime() - new Date(exam.startedAt).getTime() : 0;
						const scoreValue = typeof exam.score === 'number' ? exam.score : 0; // Default to 0 if score is null/undefined
						const scoreLabel = typeof exam.score === 'number' ? `${exam.score}` : '-';

						return (
							<Card shadow="sm" padding="lg" radius="md" withBorder key={exam.id} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
								<div>
									<Group justify="space-between" mb="xs">
										<Flex align="center" gap="xs">
											<Text size="sm" c="dimmed" fw={700}>
												{new Date(exam.startedAt).toLocaleString('he-IL', { dateStyle: 'short', timeStyle: 'short' })}
											</Text>
											{exam.completedAt && (
												<Group gap={2} align="center">
													<IconClockHour4 size={14} stroke={1.5} style={{ color: 'var(--mantine-color-dimmed)', marginTop: '2px' }} />
													<Text size="sm" c="dimmed">
														{formatDuration(duration)}
													</Text>
												</Group>
											)}
										</Flex>

										{exam.completedAt ? (
											<Badge color="green" variant="light" leftSection={<IconCheck size={14} />}>
												הושלם
											</Badge>
										) : (
											<Badge color="blue" variant="light" leftSection={<IconClock size={14} />}>
												בתהליך
											</Badge>
										)}
									</Group>

								</div>

								<Group justify="space-between" pt="sm" style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}>
									<Group>
										<Button
											component={Link}
											to={`/exam/${exam.id}`}
											variant="light"
											leftSection={<IconExternalLink size={16} />}
										>
											פתח בחינה
										</Button>

									</Group>

									{exam.completedAt && (
										<RingProgress
												size={60}
												thickness={6}
												roundCaps
												label={
													<Text c="blue" fw={800} ta="center" size="xs">
														{scoreLabel}
													</Text>
												}
												sections={[
													{ value: scoreValue, color: 'blue' }, // Assuming score is 0-100
												]}
											/>
									)}
								</Group>
							</Card>
						);
					})}
				</SimpleGrid>
			)}
		</Container>
	);
};

export default ExamsHistoryPage; 
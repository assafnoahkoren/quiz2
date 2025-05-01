import React, { useEffect, useState, useRef } from 'react';
import { Box, Text, Button, Radio, Group, Stack, Paper, Loader, Alert, Accordion, ActionIcon, Tooltip } from '@mantine/core';
import { useRandomQuestion, useAnswerExercise } from '../../../api/questions';
import { Question } from '../../../api/types';
import { IconAlertCircle, IconArrowRight, IconArrowLeft, IconShare, IconLink, IconCheck } from '@tabler/icons-react';
import { useExerciseStore } from './exerciseStore';
import { getFullViewHeight } from '../MobileLayout';
import { useClipboard } from '@mantine/hooks';
import { SubjectScore } from '../../../components/SubjectScore/SubjectScore';

// Define a type for our answers map
interface AnswerState {
	selectedOption: string | null;
	answered: boolean;
}

// Helper function to shuffle an array
const shuffleArray = <T,>(array: T[]): T[] => {
	const newArray = [...array];
	for (let i = newArray.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[newArray[i], newArray[j]] = [newArray[j], newArray[i]];
	}
	return newArray;
};

const QuestionsPage: React.FC = () => {
	const exerciseStore = useExerciseStore();
	const [questions, setQuestions] = useState<Question[]>([]);
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [selectedOption, setSelectedOption] = useState<string | null>(null);
	const [answered, setAnswered] = useState(false);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	// Map to store answers for each question
	const [answerMap, setAnswerMap] = useState<Map<number, AnswerState>>(new Map());
	// State for footer spacer height
	const [footerHeight, setFooterHeight] = useState(0);
	// Reference to the footer element
	const footerRef = useRef<HTMLDivElement>(null);

	// Clipboard hook for copy link functionality
	const clipboard = useClipboard({ timeout: 500 });

	const randomQuestionMutation = useRandomQuestion();
	const answerExerciseMutation = useAnswerExercise();

	// Helper function to generate the question URL
	const getQuestionUrl = (questionId: string): string => {
		return `${window.location.origin}/question/${questionId}`;
	};

	// Update footer spacer height whenever needed
	useEffect(() => {
		const updateFooterHeight = () => {
			if (footerRef.current) {
				const height = footerRef.current.offsetHeight;
				setFooterHeight(height);
			}
		};

		// Initial measurement
		updateFooterHeight();

		// Set up resize observer to detect size changes
		const resizeObserver = new ResizeObserver(updateFooterHeight);
		if (footerRef.current) {
			resizeObserver.observe(footerRef.current);
		}

		// Cleanup
		return () => {
			if (footerRef.current) {
				resizeObserver.unobserve(footerRef.current);
			}
		};
	}, [currentQuestionIndex, answered]); // Re-measure when index or answer state changes

	const fetchRandomQuestion = async (): Promise<Question | null> => {
		try {
			const subjectIds = Array.from(exerciseStore.selectedSubjectIds);
			if (subjectIds.length === 0) return null;

			const question = await randomQuestionMutation.mutateAsync(subjectIds);

			// Shuffle the options when we get the question
			if (question) {
				question.options = shuffleArray(question.options);
			}

			return question;
		} catch (err) {
			console.error('Error fetching question:', err);
			setError('נכשל בטעינת השאלה. אנא נסה שוב.');
			return null;
		}
	};

	// Fetch a new question and add it to the queue
	const addQuestionToQueue = async () => {
		const newQuestion = await fetchRandomQuestion();
		if (newQuestion) {
			setQuestions(prev => [...prev, newQuestion]);
		}
	};

	// Initialize with 2 questions
	useEffect(() => {
		const initializeQuestions = async () => {
			if (exerciseStore.currentPhase === 'exercising' && exerciseStore.selectedSubjectIds.size > 0) {
				setLoading(true);
				setError(null);

				try {
					// Fetch two questions in parallel
					const questionPromises = [fetchRandomQuestion(), fetchRandomQuestion()];
					const results = await Promise.all(questionPromises);

					const validQuestions = results.filter(q => q !== null) as Question[];
					if (validQuestions.length === 0) {
						setError('אין שאלות זמינות לנושאים שנבחרו.');
					} else {
						setQuestions(validQuestions);
						setCurrentQuestionIndex(0);
						setSelectedOption(null);
						setAnswered(false);
						setAnswerMap(new Map());
					}
				} catch (err) {
					console.error('Error initializing questions:', err);
					setError('נכשל בטעינת השאלות. אנא נסה שוב.');
				} finally {
					setLoading(false);
				}
			}
		};

		initializeQuestions();
	}, [exerciseStore.currentPhase, exerciseStore.selectedSubjectIds]);

	// Load saved answers when changing questions
	useEffect(() => {
		// Check if we have saved state for this question
		const savedState = answerMap.get(currentQuestionIndex);
		if (savedState) {
			setSelectedOption(savedState.selectedOption);
			setAnswered(savedState.answered);
		} else {
			// Reset state for new questions
			setSelectedOption(null);
			setAnswered(false);
		}
	}, [currentQuestionIndex, answerMap]);

	const handleOptionSelect = (optionId: string) => {
		if (!answered) {
			setSelectedOption(optionId);
		}
	};

	const handleSubmitAnswer = () => {
		setAnswered(true);

		// Save the answer state locally
		const newMap = new Map(answerMap);
		newMap.set(currentQuestionIndex, {
			selectedOption,
			answered: true
		});
		setAnswerMap(newMap);

		// Get the current question and check if answer is correct
		const currentQuestion = questions[currentQuestionIndex];
		if (currentQuestion && selectedOption) {
			const selectedOptionObj = currentQuestion.options.find(opt => opt.id === selectedOption);
			const isCorrect = selectedOptionObj?.isCorrect || false;

			// Save answer to server
			answerExerciseMutation.mutate({
				questionId: currentQuestion.id,
				chosenOption: JSON.stringify(selectedOptionObj),
				isCorrect,
				subjectId: currentQuestion.subjectId
			});
		}
	};

	const handleNextQuestion = async () => {
		// Save current state before navigating
		if (selectedOption) {
			const newMap = new Map(answerMap);
			newMap.set(currentQuestionIndex, {
				selectedOption,
				answered
			});
			setAnswerMap(newMap);
		}

		// Move to the next question
		const nextIndex = currentQuestionIndex + 1;
		setCurrentQuestionIndex(nextIndex);

		// If we've moved to the second-to-last question, fetch a new one
		if (nextIndex >= questions.length - 1) {
			addQuestionToQueue();
		}
	};

	const handlePreviousQuestion = () => {
		if (currentQuestionIndex > 0) {
			// Save current state before navigating
			if (selectedOption) {
				const newMap = new Map(answerMap);
				newMap.set(currentQuestionIndex, {
					selectedOption,
					answered
				});
				setAnswerMap(newMap);
			}

			// Navigate to previous question
			setCurrentQuestionIndex(currentQuestionIndex - 1);
		}
	};

	const handleFinishExercise = () => {
		exerciseStore.finishExercise();
	};

	// Share current question
	const handleShare = async () => {
		if (!currentQuestion) return;

		const shareData = {
			title: 'שתף שאלה',
			text: 'הנה קישור לשאלה:',
			url: getQuestionUrl(currentQuestion.id), // Use helper function for URL
		};

		if (navigator.share) {
			try {
				await navigator.share(shareData);
				console.log('Question shared successfully');
			} catch (error) {
				console.error('Error sharing question:', error);
				// Optionally notify the user about the error
			}
		} else {
			console.log('Web Share API not supported in this browser.');
			// Optionally implement a fallback (e.g., copy to clipboard or show a message)
			alert('שיתוף אינו נתמך בדפדפן זה.');
		}
	};

	// If not in exercising phase, don't render the questions UI
	if (exerciseStore.currentPhase !== 'exercising') {
		return null;
	}

	const currentQuestion = questions[currentQuestionIndex];

	return (
		<Box p="md" style={{ height: getFullViewHeight() }}>
			{loading ? (
				<Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
					<Loader size="xl" />
				</Box>
			) : error ? (
				<Alert
					icon={<IconAlertCircle size="1rem" />}
					title="שגיאה"
					color="red"
				>
					{error}
				</Alert>
			) : currentQuestion ? (
				<Stack gap={0} style={{ height: '100%', position: 'relative' }}>
					<Group justify="space-between" gap={2}>
						{/* Add Text component to display the subject name with truncation and tooltip */}
						<Box style={{ flex: 2 }}>
							<SubjectScore subjectId={currentQuestion.subjectId} />
						</Box>
						<Text
							size="sm"
							c="dimmed"
							truncate
							style={{ cursor: 'default', flex: 6, overflow: 'hidden', textAlign: 'center' }} // Allow text to grow/shrink but aim for 60%
						>
							{exerciseStore.allSubjectsFlatMap.get(currentQuestion.subjectId)?.name}
						</Text>
						<Box style={{ pointerEvents: 'none', opacity: 0, flex: 2 }}>
							{/* This Box is likely for spacing, keep its basis */}
							<SubjectScore subjectId={currentQuestion.subjectId} />
						</Box>
					</Group>

					<Group justify="space-between">
						<Button
							variant="subtle"
							color="blue"
							leftSection={<IconArrowRight size="1rem" />}
							onClick={handlePreviousQuestion}
							disabled={currentQuestionIndex === 0}
							style={{
								backgroundColor: currentQuestionIndex === 0 ? 'transparent' : undefined,
							}}
						>
							אחורה
						</Button>

						<Text size="sm" fw={500}>שאלה {currentQuestionIndex + 1}</Text>

						<Button
							variant="subtle"
							color="blue"
							rightSection={<IconArrowLeft size="1rem" />}
							onClick={handleNextQuestion}
						>
							קדימה
						</Button>
					</Group>

					{/* Question and explanation section */}
					<Box>
						<Group justify="space-between" align="center">
							<Group gap={0}> {/* Group share and copy buttons */}
								{/* Share button */}
								<Button
									variant="subtle"
									size="xs"
									c="gray"
									onClick={handleShare}
									aria-label="Share question"
									leftSection={<IconShare size={16} />}
								>
									שתף שאלה
								</Button>

								{/* Copy Link button */}
								<Button
									variant="subtle"
									c="gray"
									size="xs"
									onClick={() => {
										if (currentQuestion) {
											const questionUrl = getQuestionUrl(currentQuestion.id); // Use helper function
											clipboard.copy(questionUrl);
										}
									}}
									aria-label="Copy link"
									leftSection={clipboard.copied ? <IconCheck size={20} /> : <IconLink size={16} />}
									color={clipboard.copied ? 'teal' : 'blue'}
								>
									{clipboard.copied ? 'הקישור הועתק' : 'העתק קישור'}
								</Button>

							</Group>

						</Group>
						<Paper p="md" pt={0}>
							<Text size="lg" fw={700} mb="md">
								{currentQuestion.question}
							</Text>

							{answered && currentQuestion.explanation && (
								<Accordion
									mb="md"
									variant="filled"
									styles={{
										item: {
											borderRadius: '8px',
											border: '1px solid #e9ecef',
											overflow: 'hidden',
											marginTop: '12px',
											backgroundColor: '#f8f9fa'
										},
										control: {
											padding: '12px 16px',
											'&:hover': {
												backgroundColor: '#f1f3f5'
											}
										},
										panel: {
											padding: '16px',
											backgroundColor: 'white',
											borderTop: '1px solid #e9ecef'
										},
										chevron: {
											color: '#4dabf7'
										}
									}}
								>
									<Accordion.Item value="explanation">
										<Accordion.Control py={0}>הצג הסבר</Accordion.Control>
										<Accordion.Panel px={0}>
											<Text style={{ whiteSpace: 'pre-line' }}>{currentQuestion.explanation}</Text>
										</Accordion.Panel>
									</Accordion.Item>
								</Accordion>
							)}
						</Paper>

						{/* Spacer Box that matches the height of the footer */}
						<Box style={{ height: footerHeight, marginTop: '1rem' }} />
					</Box>

					{/* Fixed footer with options and buttons */}
					<Box
						id="question-footer"
						ref={footerRef}
						style={{
							position: 'fixed',
							bottom: 0,
							left: 0,
							right: 0,
							padding: '16px',
							background: 'white',
							zIndex: 10,
							boxShadow: '0 -2px 15px rgba(0, 0, 0, 0.05)',
						}}
					>
						<Paper p={0} mb="md">
							<Radio.Group
								value={selectedOption || ''}
								onChange={(value) => handleOptionSelect(value)}
							>
								<Stack>
									{currentQuestion.options.map((option) => (
										<Paper
											key={option.id}
											p="sm"
											withBorder
											style={{
												backgroundColor: answered ? (
													option.isCorrect ? '#e7f5ea' :
														option.id === selectedOption ? '#ffebee' : 'white'
												) : 'white',
												borderColor: answered ? (
													option.isCorrect ? '#e7f5ea' :
														option.id === selectedOption ? '#ffebee' : '#dee2e6'
												) : '#dee2e6',
												marginBottom: '8px',
												cursor: answered ? 'default' : 'pointer'
											}}
											onClick={() => !answered && handleOptionSelect(option.id)}
										>
											<Radio
												value={option.id}
												label={option.answer}
												readOnly
											/>
										</Paper>
									))}
								</Stack>
							</Radio.Group>
						</Paper>

						<Group justify="space-between">
							{!answered ? (
								<Button
									onClick={handleSubmitAnswer}
									disabled={!selectedOption}
									color="blue"
									fullWidth
								>
									בדוק
								</Button>
							) : (
								<Group style={{ width: '100%' }}>
									<Button
										onClick={handleNextQuestion}
										color="green"
										style={{ flex: 1 }}
										rightSection={<IconArrowLeft size="1.2rem" />}
										disabled={currentQuestionIndex === questions.length - 1 && questions.length === 1}
									>
										לשאלה הבאה
									</Button>
								</Group>
							)}
						</Group>
					</Box>
				</Stack>
			) : (
				<Alert
					icon={<IconAlertCircle size="1rem" />}
					title="אין שאלות"
					color="blue"
				>
					אין שאלות זמינות לנושאים שנבחרו.
				</Alert>
			)}
		</Box>
	);
};

export default QuestionsPage; 
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetExamById, EnrichedUserExamQuestion, useEndExam } from '../../api/exams'; // Corrected import
import { Loader, Alert, Title, Text, Paper, Box, Stack, Radio, Group, Button, ScrollArea, ScrollAreaProps, Modal, List, Accordion } from '@mantine/core'; // Import Mantine components & ScrollArea, ScrollAreaProps, Modal, List, Accordion
import { IconAlertCircle, IconArrowLeft, IconArrowRight, IconShare, IconLink, IconCheck, IconListCheck, IconHome } from '@tabler/icons-react';
import examStoreInstance from '../../stores/examStore'; // Import the exam store instance
import { observer } from 'mobx-react-lite'; // Import observer for MobX reactivity
import { getFullViewHeight } from '../mobile/MobileLayout'; // Assuming this helper is suitable
import { makeObservable, observable, action, computed } from 'mobx'; // Import MobX utilities
import { useClipboard, useDisclosure } from '@mantine/hooks'; // Import useClipboard, useDisclosure
import ExamTimer from './ExamTimer'; // Import the new timer component
import { useExamDuration } from './utils';

// Helper class to manage local answer state
class LocalExamState {
	// Map: questionId -> selectedOptionId
	answersMap = observable.map<string, string>();

	constructor() {
		makeObservable(this, {
			answersMap: observable,
			setSelectedAnswer: action,
			currentAnswerForQuestion: computed
		});
	}

	setSelectedAnswer(questionId: string, optionId: string) {
		this.answersMap.set(questionId, optionId);
	}

	// Computed property to get the answer for a specific question
	get currentAnswerForQuestion() {
		return (questionId: string): string | undefined => {
			return this.answersMap.get(questionId);
		};
	}
}

const ExamPageComponent: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const { data: examData, isLoading, isError, error, isSuccess } = useGetExamById(id);
	const examStore = examStoreInstance; // Use the imported instance
	const [footerHeight, setFooterHeight] = useState(0); // State for footer spacer height
	const footerRef = useRef<HTMLDivElement>(null); // Reference to the footer element
	const localState = useMemo(() => new LocalExamState(), []);
	const clipboard = useClipboard({ timeout: 500 }); // Initialize clipboard hook
	const scrollViewportRef = useRef<HTMLDivElement>(null); // Ref for the ScrollArea viewport
	const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]); // Ref for button elements
	const [opened, { open, close }] = useDisclosure(false); // State for confirmation modal
	const [scoreModalOpened, { open: openScoreModal, close: closeScoreModal }] = useDisclosure(false); // State for score modal
	const [finalScore, setFinalScore] = useState<number | null>(null); // State for the final score percentage
	const [isCalculatingScore, setIsCalculatingScore] = useState(false); // State for score calculation loading
	const endExamMutation = useEndExam(); // Instantiate the hook
	const examDuration = useExamDuration();
	const navigate = useNavigate();
	
	const handleScoreModalClose = () => {
		closeScoreModal();
		navigate('/');
	};

	// Effect to load data into the store once fetched
	useEffect(() => {
		if (isSuccess && examData) {
			examStore.loadExamData(examData);
		}
	}, [isSuccess]);

	// Effect to measure footer height
	useEffect(() => {
		const updateFooterHeight = () => {
			if (footerRef.current) {
				const height = footerRef.current.offsetHeight;
				setFooterHeight(height);
			}
		};
		updateFooterHeight(); // Initial measurement
		const resizeObserver = new ResizeObserver(updateFooterHeight);
		if (footerRef.current) {
			resizeObserver.observe(footerRef.current);
		}
		return () => {
			if (footerRef.current) {
				resizeObserver.unobserve(footerRef.current);
			}
		};
	}, [examStore.currentQuestionIndex]); // Re-measure when question changes

	// Effect to scroll the current question button into view
	useEffect(() => {
		if (scrollViewportRef.current && buttonRefs.current[examStore.currentQuestionIndex]) {
			const currentButton = buttonRefs.current[examStore.currentQuestionIndex];
			if (currentButton) {
				currentButton.scrollIntoView({
					behavior: 'smooth', // Optional: smooth scrolling
					block: 'nearest',
					inline: 'center', // Center the button horizontally
				});
			}
		}
	}, [examStore.currentQuestionIndex]); // Dependency: trigger on index change

	// Placeholder handler for submitting the exam
	const handleSubmitExam = () => {
		// Calculate score
		examStore.setTimeUp();
		let score = 0;
		const totalQuestions = examStore.currentExam?.UserExamQuestions.length ?? 0;
		let percentageScore = 0; // Declare percentageScore outside the if block

		if (examStore.currentExam && totalQuestions > 0) {
			examStore.currentExam.UserExamQuestions.forEach(userExamQuestion => {
				const questionId = userExamQuestion.questionId;
				const selectedOptionId = localState.answersMap.get(questionId);
				if (selectedOptionId) {
					// Ensure Question and Options exist
					const questionData = userExamQuestion.Question;
					const correctOption = questionData?.Options?.find(opt => opt.isCorrect);
					if (correctOption && correctOption.id === selectedOptionId) {
						score++;
					}
				}
			});
			percentageScore = Math.round((score / totalQuestions) * 100); // Assign calculated percentage
		}

		// Call the end exam mutation
		if (examStore.currentExam?.id) {
			console.log(`Ending exam ${examStore.currentExam.id} with score ${percentageScore}`);
			endExamMutation.mutate({ examId: examStore.currentExam.id, data: { score: percentageScore } });
			close(); // Close the confirmation modal
			openScoreModal(); // Open the score modal *before* delay
			setIsCalculatingScore(true); // Start loader
	
			// Simulate calculation time for dramatic effect
			setTimeout(() => {
				setFinalScore(percentageScore); // Store the calculated score
				setIsCalculatingScore(false); // Stop loader and reveal score
			}, 1500); // Delay in milliseconds (e.g., 1.5 seconds)
		} else {
			console.error("Cannot end exam: currentExam or currentExam.id is missing.");
			// Optionally: Show an error to the user in the UI
		}
		
		// console.log('Exam submitted!'); // Removed console log
		// close(); // Close the confirmation modal - Moved up
		// openScoreModal(); // Open the score modal - Moved up
	};

	if (examStore.examPhase === 'loading' || isLoading) {
		return (
			<Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
				<Loader size="xl" />
			</Box>
		);
	}

	if (isError || (!isLoading && !examStore.currentExam)) {
		const errorMessage = isError
			? error?.message
			: 'Exam data could not be loaded into the store.';
		return (
			<Alert icon={<IconAlertCircle size="1rem" />} title="Error!" color="red" m="md">
				{errorMessage}
			</Alert>
		);
	}

	// Get current question data from the store - Assume it's typed EnrichedUserExamQuestion | null | undefined
	const currentQuestion = examStore.currentQuestionData as EnrichedUserExamQuestion | undefined | null;

	// Access options from the nested Question object
	// Use optional chaining for safety
	const options = currentQuestion?.Question?.Options ?? [];

	// Helper function to generate the question URL
	const getQuestionUrl = (questionId: string): string => {
		return `${window.location.origin}/question/${questionId}`;
	};

	// Handler for selecting an answer - updates local state
	const handleOptionSelect = (optionId: string) => {
		// Prevent changes if time is up
		if (examStore.isTimeUp) {
			console.log("Time is up, cannot change answer.");
			return; 
		}

		if (currentQuestion?.questionId) {
			localState.setSelectedAnswer(currentQuestion.questionId, optionId);
		}

		// Keep this commented until store logic is clear
		// examStore.answerQuestion(optionId); // Linter Error: Expected 2 arguments, but got 1. TODO: Determine the correct arguments for answerQuestion.
		console.log("Selected option (local state update):", optionId);
	};

	// Share current question handler
	const handleShare = async () => {
		if (!currentQuestion?.questionId) return;

		const shareData = {
			title: 'שתף שאלה', // Share Question (Hebrew)
			text: 'הנה קישור לשאלה:', // Here is a link to the question (Hebrew)
			url: getQuestionUrl(currentQuestion.questionId), // Use helper function for URL
		};

		if (navigator.share) {
			try {
				await navigator.share(shareData);
				console.log('Question shared successfully');
			} catch (error) {
				console.error('Error sharing question:', error);
				// Optionally notify the user about the error
				alert('שגיאה בשיתוף השאלה.'); // Error sharing question (Hebrew)
			}
		} else {
			console.log('Web Share API not supported in this browser.');
			// Optionally implement a fallback
			alert('שיתוף אינו נתמך בדפדפן זה.'); // Sharing not supported (Hebrew)
		}
	};

	// Handlers for navigation - delegate to the store
	const handlePreviousQuestion = () => {
		// Using property suggested by linter
		examStore.previousQuestion();
	};

	const handleNextQuestion = () => {
		// Using property suggested by linter
		examStore.nextQuestion();
	};

	// Structure similar to QuestionsPage
	return (
		<>
			{/* Row 0: questions navigation */}
			<ScrollArea
				py="xs" mb="xs"
				viewportRef={scrollViewportRef} // Assign viewport ref
			> {/* Add ScrollArea for horizontal scrolling */}
				<Group justify="start" gap={0} wrap="nowrap">
					{/* Map through questions to create navigation buttons */}
					{examStore.currentExam?.UserExamQuestions.map((question, index) => {
						const isLastQuestion = examStore.currentExam && index === examStore.currentExam.UserExamQuestions.length - 1;
						const isCurrent = index === examStore.currentQuestionIndex;
						const isAnswered = localState.answersMap.has(question.questionId);

						let buttonVariant: 'filled' | 'light' | 'subtle' = 'subtle'; // Default: subtle for unanswered
						let buttonColor = 'gray'; // Default color for unanswered

						if (isCurrent) {
							buttonVariant = 'filled';
							buttonColor = 'blue'; // Blue for current
						} else if (isAnswered) {
							buttonVariant = 'light';
							buttonColor = 'blue'; // Blue for answered
						}

						return (
							<Button
								ref={(el) => (buttonRefs.current[index] = el)} // Assign button ref to array
								key={question.questionId} // Use a unique key
								variant={buttonVariant} // Use the determined variant
								color={buttonColor} // Use the determined color
								size="xs"
								style={{ minWidth: 36, height: 36, padding: 0, flexShrink: 0, marginInlineEnd: isLastQuestion ? 10 : 0 }} // Style as square-ish
								onClick={() => examStore.setCurrentQuestionIndex(index)} // Navigate on click (assuming method exists)
								aria-label={`Go to question ${index + 1}`}
								ms={10}
							>
								{index + 1}
							</Button>
						);
					})}
				</Group>
			</ScrollArea>

			<Box p="md" pt={0} style={{ height: getFullViewHeight(-66) }}>
				{currentQuestion ? (
					<Stack gap={0} style={{ height: '100%', position: 'relative' }}>
						{/* Header Section (similar to QuestionsPage) */}
						<Group justify="space-between">
							{/* Use a Box for alignment/spacing if needed, or remove if subject info isn't displayed */}
							<Box style={{ flex: 2 }}></Box>
							<Text
								size="sm"
								c="dimmed"
								truncate
								style={{ flex: 6, overflow: 'hidden', textAlign: 'center' }}
							>
								{/* Optional: Display subject if available in store/question data */}
								{/* {examStore.allSubjectsFlatMap?.get(currentQuestion.subjectId)?.name} */}
							</Text>
							<Box style={{ flex: 2 }}></Box>
						</Group>

						{/* Row 1: Navigation and Question Count */}
						<Group justify="space-between">
							<Button
								variant="subtle"
								color="blue"
								leftSection={<IconArrowRight size="1rem" />}
								onClick={handlePreviousQuestion}
								disabled={examStore.currentQuestionIndex === 0}
								style={{
									backgroundColor: examStore.currentQuestionIndex === 0 ? 'transparent' : undefined,
								}}
							>
								הקודם
							</Button>

							<Text size="sm" fw={500}>
								שאלה {examStore.currentQuestionIndex + 1} מתוך {examStore.totalQuestions}
							</Text>

							<Button
								variant="subtle"
								color="blue"
								rightSection={<IconArrowLeft size="1rem" />}
								onClick={handleNextQuestion}
								disabled={examStore.currentQuestionIndex >= examStore.totalQuestions - 1}
							>
								הבא
							</Button>
						</Group>

						{/* Row 2: Share and Copy Buttons - Centered */}
						<Group justify="space-between" mt="xs"> {/* Change justify to space-between */}
							{/* Share and Copy buttons group */}
							<Group gap={0}>
								{/* Share button */}
								<Button
									variant="subtle"
									size="xs"
									c="gray"
									onClick={handleShare}
									aria-label="שתף שאלה"
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
										if (currentQuestion?.questionId) {
											const questionUrl = getQuestionUrl(currentQuestion.questionId);
											clipboard.copy(questionUrl);
										}
									}}
									aria-label="העתק קישור"
									leftSection={clipboard.copied ? <IconCheck size={20} /> : <IconLink size={16} />}
									color={clipboard.copied ? 'teal' : 'blue'}
								>
									{clipboard.copied ? 'הקישור הועתק' : 'העתק קישור'}
								</Button>
							</Group>

							{/* Timer component */}
							<ExamTimer 
								startTimeString={examStore.currentExam?.startedAt} // Use startedAt based on grep search
								durationMinutes={examDuration} 
							/>
						</Group>

						{/* Question Display Area */}
						<Box style={{ flexGrow: 1 }}>
							<Paper p="md" pt={0} mt="md">
								<Text size="lg" fw={700} mb="md">
									{/* Access question text from nested Question object */}
									{currentQuestion?.Question?.question ?? 'Loading question...'}
								</Text>
								{/* Add conditional explanation accordion */}
								{examStore.isTimeUp && currentQuestion?.Question?.explanation && (
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
											<Accordion.Control py={0}>
												הצג הסבר
											</Accordion.Control>
											<Accordion.Panel px={0}>
												<Text style={{ whiteSpace: 'pre-line' }}>{currentQuestion.Question.explanation}</Text>
											</Accordion.Panel>
										</Accordion.Item>
									</Accordion>
								)}
								{/* No explanation accordion in exam mode usually */}
							</Paper>

							{/* Spacer Box */}
							<Box style={{ height: footerHeight, marginTop: '1rem' }} />
						</Box>


						{/* Fixed Footer with Options */}
						<Box
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
								{/* Remove placeholder text */}
								{/* <Text c="dimmed" ta="center">Answer selection UI goes here.</Text> */}
								{/* This Radio.Group will cause linter errors until store/types are updated */}
								<Radio.Group
									// Read value from the local state map based on the current question ID
									value={currentQuestion?.questionId ? localState.currentAnswerForQuestion(currentQuestion.questionId) || '' : ''}
									onChange={handleOptionSelect} // Use the handler
								>
									<Stack>
										{/* Map over the options array from nested Question */}
										{options.map((option) => { // Type for 'option' should now be inferred correctly if store is updated
											const isTimeUp = examStore.isTimeUp;
											const selectedOptionId = currentQuestion?.questionId ? localState.currentAnswerForQuestion(currentQuestion.questionId) : undefined;
											const isSelected = selectedOptionId === option.id;
											const isCorrect = option.isCorrect; // Assuming 'isCorrect' exists on the option object

											let paperStyle: React.CSSProperties = {
												borderColor: '#dee2e6',
												marginBottom: '8px',
												cursor: isTimeUp ? 'default' : 'pointer', // Change cursor when time is up
												position: 'relative', // Needed for potential absolute positioning of icons
												backgroundColor: 'white', // Default background
											};

											if (isTimeUp) {
												if (isCorrect) {
													// Style for correct answer (selected or not)
													paperStyle.backgroundColor = '#e7f5ea'; // Light green background
													paperStyle.borderColor = '#e7f5ea'; // Matching green border (effectively hidden)
													// Removed specific check icon logic
												} else if (isSelected) {
													// Style for incorrectly selected answer
													paperStyle.backgroundColor = '#ffebee'; // Light red background
													paperStyle.borderColor = '#ffebee'; // Matching red border (effectively hidden)
													// Removed specific 'X' icon logic
												} else {
													// Style for incorrect answer, not selected (neutral)
													paperStyle.backgroundColor = '#f8f9fa'; // Keep slightly gray background
													paperStyle.borderColor = '#dee2e6'; // Keep default border
												}
											}
											// Removed feedbackIcon rendering from Paper

											return (
												<Paper
													key={option.id} // Use option.id as key
													p="sm"
													withBorder
													style={paperStyle}
													// Disable click if time is up
													onClick={() => !isTimeUp && handleOptionSelect(option.id)} 
												>
													<Radio
														value={option.id} // Use option.id as value
														label={option.answer} // Use option.answer as label
														// Make radio visually read-only, interaction is via Paper
														readOnly 
														// Ensure radio reflects the actual selection state but is not interactive if time is up
														checked={isSelected}
														// Prevent interaction with the radio itself if time is up
														styles={{ 
															radio: { cursor: isTimeUp ? 'default' : 'pointer' },
															label: { cursor: isTimeUp ? 'default' : 'pointer' }
														}}
													/>
													{/* Removed feedbackIcon rendering */}
												</Paper>
											);
										})}
									</Stack>
								</Radio.Group>
							</Paper>

							{/* Conditional Next/Submit button */} 
							{examStore.currentQuestionIndex >= examStore.totalQuestions - 1 ? (
								<Button
									fullWidth
									mt="md" // Add some margin top
									color="green" // Indicate final action
									onClick={open} // Open confirmation modal
									rightSection={<IconCheck size="1rem" />} // Optional: Change icon
								>
									סיים
								</Button>
							) : (
								<Button
									fullWidth
									mt="md" // Add some margin top
									onClick={handleNextQuestion}
									disabled={examStore.currentQuestionIndex >= examStore.totalQuestions - 1}
									rightSection={<IconArrowLeft size="1rem" />} // Using IconArrowLeft for consistency with header
								>
									לשאלה הבאה
								</Button>
							)}
						</Box>
					</Stack>
				) : (
					// Handle case where there's no current question (e.g., exam finished or error state)
					<Alert
						icon={<IconAlertCircle size="1rem" />}
						title="No Question Available"
						color="blue"
						m="md"
					>
						The current question could not be displayed.
					</Alert>
				)}
			</Box>

			{/* Confirmation Modal */}
			<Modal opened={opened} onClose={close} title="אישור הגשה" centered>
				<Text>האם אתה בטוח שברצונך לסיים ולהגיש את המבחן?</Text>

				{(() => {
					// Calculate unanswered questions inside the render logic for the modal
					const allQuestions = examStore.currentExam?.UserExamQuestions ?? [];
					const unansweredQuestionNumbers = allQuestions
						.map((q, index) => ({ id: q.questionId, number: index + 1 }))
						.filter(q => !localState.answersMap.has(q.id))
						.map(q => q.number);

					if (unansweredQuestionNumbers.length > 0) {
						return (
							<Box mt="md">
								<Text fw={500} c="dimmed" size="sm" mb="xs">שאלות שלא נענו:</Text> 
								{/* Keep a small title */}
								<Group gap="xs" wrap="wrap"> {/* Use Group with wrap */}
									{unansweredQuestionNumbers.map(num => (
										<Button
											key={num}
											variant="subtle" // Style like the top row
											color="gray"     // Use gray for unanswered indication
											size="xs"
											style={{ minWidth: 36, height: 36, padding: 0, flexShrink: 0 }} // Square-ish
											onClick={() => {
												examStore.setCurrentQuestionIndex(num - 1); // Navigate to question (0-based index)
												close(); // Close the modal
											}}
											aria-label={`Go to question ${num}`}
										>
											{num}
										</Button>
									))}
								</Group>
							</Box>
						);
					} else {
						// Optional: message when all answered
						// return <Text mt="md" c="green" size="sm">כל השאלות נענו.</Text>;
						return null; // Or return null if no message is needed when all are answered
					}
				})()}

				<Group justify="flex-end" mt="md">
					<Button variant="default" onClick={close}>
						ביטול
					</Button>
					<Button color="red" onClick={handleSubmitExam}>
						אישור והגשה
					</Button>
				</Group>
			</Modal>

			{/* Score Modal */}
			<Modal opened={scoreModalOpened} onClose={() => !isCalculatingScore && closeScoreModal()} title="תוצאות המבחן" centered>
				{isCalculatingScore ? (
					<Stack align="center">
						<Loader size="xl" />
						<Text>מעבד תוצאות...</Text> {/* Processing results... (Hebrew) */}
					</Stack>
				) : finalScore !== null ? (
					<Stack align="center">
						<Text ta="center" size="lg">
							הציון שלך הוא:
						</Text>
						<Text ta="center" size="2rem" fw={700} my="sm">
							{`${finalScore}%`}
						</Text>
						<Group justify="center" mt="md">
							<Button onClick={handleScoreModalClose} mt="md" leftSection={<IconHome size={18} />} color='gray' variant='subtle'>
								יציאה לדף הבית
							</Button>
							<Button onClick={closeScoreModal} mt="md" leftSection={<IconListCheck size={18} />}>
								בדוק תשובות
							</Button>
						</Group>
					</Stack>
				) : (
					// Should not happen if logic is correct, but fallback
					<Text ta="center" c="dimmed">שגיאה בחישוב הציון.</Text> // Error calculating score (Hebrew)
				)}
				{/* Remove the original button group from here if displaying button inside the Stack */}
				{/* <Group justify="center" mt="md">
					<Button onClick={closeScoreModal}>
						סגור
					</Button>
				</Group> */}
			</Modal>
		</>
	);
};

// Wrap the component with observer for MobX reactivity
const ExamPage = observer(ExamPageComponent);

export default ExamPage; 
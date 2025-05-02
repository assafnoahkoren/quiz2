import React, { useState, useEffect, useRef } from 'react';
import { Text, Box, UnstyledButton } from '@mantine/core';
import { IconClock } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite'; // Import observer
import examStoreInstance from '../../stores/examStore'; // Import store instance

interface ExamTimerProps {
	startTimeString: string | null | undefined; // Expecting ISO string or similar from backend
	durationMinutes: number;
}

// Wrap component with observer
const ExamTimerComponent: React.FC<ExamTimerProps> = ({ startTimeString, durationMinutes }) => {
	const examStore = examStoreInstance; // Use the store instance
	const [endTime, setEndTime] = useState<number | null>(null); // Keep end time for calculations
	const [showTime, setShowTime] = useState(false); // State to control time visibility
	const [displayedSeconds, setDisplayedSeconds] = useState<number | null>(null); // State for the actively displayed countdown
	const timeoutRef = useRef<NodeJS.Timeout | null>(null); // Ref to store hide timeout ID
	const displayIntervalRef = useRef<NodeJS.Timeout | null>(null); // Ref for the display update interval

	useEffect(() => {
		// Calculate end time based on props
		if (!startTimeString) {
			setEndTime(null);
			setShowTime(false);
			setDisplayedSeconds(null);
			return;
		}

		const startTime = new Date(startTimeString).getTime();
		if (isNaN(startTime)) {
			console.error("Invalid start time provided:", startTimeString);
			setEndTime(null);
			setShowTime(false);
			setDisplayedSeconds(null);
			return;
		}

		const calculatedEndTime = startTime + durationMinutes * 60 * 1000;
		setEndTime(calculatedEndTime);

		// Cleanup timeout and interval on unmount or prop change
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
			if (displayIntervalRef.current) {
				clearInterval(displayIntervalRef.current);
			}
		};

	}, [startTimeString, durationMinutes]);

	const calculateRemainingSeconds = (): number => {
		if (endTime === null) return 0;
		const now = Date.now();
		// Use store's isTimeUp flag to determine if we should show 0
		if (examStore.isTimeUp) return examStore.frozenRemainingTime ?? 0; // Return frozen time if available
		return Math.max(0, Math.floor((endTime - now) / 1000));
	};

	const formatTime = (totalSeconds: number): string => {
		if (totalSeconds <= 0) return "00:00"; // Show 00:00 if time is up or calculation results in 0/negative
		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;

		if (hours > 0) {
			return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
		} else {
			return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
		}
	};

	const clearTimers = () => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}
		if (displayIntervalRef.current) {
			clearInterval(displayIntervalRef.current);
			displayIntervalRef.current = null;
		}
	};

	const handleShowTime = () => {
		// Do nothing if time is up according to the store or if endTime isn't calculated
		if (examStore.isTimeUp || endTime === null) return;

		// Clear existing timers first
		clearTimers();

		const currentSeconds = calculateRemainingSeconds();
		setDisplayedSeconds(currentSeconds); // Set initial display time
		setShowTime(true);

		// Start interval to update displayed time every second
		displayIntervalRef.current = setInterval(() => {
			const newSeconds = calculateRemainingSeconds();
			setDisplayedSeconds(newSeconds);
			if (newSeconds <= 0) { // Stop interval if time runs out during display
				clearTimers();
				// Note: examStore's checkTimeUp will handle the actual isTimeUp flag
			}
		}, 1000);

		// Start timeout to hide the time after 3 seconds
		timeoutRef.current = setTimeout(() => {
			setShowTime(false);
			// Clear the display interval when hiding
			if (displayIntervalRef.current) {
				clearInterval(displayIntervalRef.current);
				displayIntervalRef.current = null;
			}
			timeoutRef.current = null; // Clear the ref itself
		}, 3000); 
	};

	// Don't render if start time is invalid or end time couldn't be calculated
	if (endTime === null) {
		return null;
	}

	// If time is up, show the frozen time permanently and make it non-interactive
	if (examStore.isTimeUp) {
		// Ensure timers are cleared if isTimeUp becomes true
		clearTimers(); 
		return (
			<Box style={{ display: 'flex', alignItems: 'center', cursor: 'default' }}>
				<Text size="xs" c="red" fw={500}> {/* Always red when time is up */}
					{/* Show frozen time from store, default to 00:00 if null */}
					{formatTime(examStore.frozenRemainingTime ?? 0)} 
				</Text>
				<IconClock size={16} style={{ marginInlineStart: 4 }} color="red"/> {/* Red icon */}
			</Box>
		);
	}

	// If time is not up, use the button interaction
	// const currentRemainingSeconds = calculateRemainingSeconds(); // No longer needed here
	return (
		<UnstyledButton onClick={handleShowTime} style={{ display: 'inline-block' }}>
			<Box style={{ display: 'flex', alignItems: 'center' }}>
				{showTime && displayedSeconds !== null ? (
					<Text size="xs" c={displayedSeconds < 300 ? 'red' : 'dimmed'} fw={500}> {/* Turn red in last 5 mins */}
						{formatTime(displayedSeconds)}
					</Text>
				) : (
					<Text size="xs" c="dimmed" fw={500}>
						צפה בשעון
					</Text>
				)}
				<IconClock size={16} style={{ marginInlineStart: 4 }} color="gray"/>
			</Box>
		</UnstyledButton>
	);
};

const ExamTimer = observer(ExamTimerComponent); // Export the observed component

export default ExamTimer; 
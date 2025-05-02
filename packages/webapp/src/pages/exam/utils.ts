export const EXAM_DURATION_MINUTES = 210;
export const useExamDuration = (): number => {
	// For now, it returns a fixed value.
	// This hook structure allows for potential future logic
	// (e.g., fetching duration based on exam type) without changing the call sites.
	return EXAM_DURATION_MINUTES;
};


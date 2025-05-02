import { makeAutoObservable, runInAction } from 'mobx';
import { createContext, useContext } from 'react';
import { UserExam, UserExamQuestion } from '../api/exams'; // Adjust import path as needed
import { EXAM_DURATION_MINUTES } from '../pages/exam/utils';

export type ExamPhase = "loading" | "inProgress" | "review" | "completed";

export interface UserAnswer {
  userExamQuestionId: string;
  answerId: string | null; // Store the selected answer ID, null if unanswered
}

export class ExamStore {
  currentExam: UserExam | null = null;
  currentQuestionIndex: number = 0;
  userAnswers = new Map<string, UserAnswer>(); // Map UserExamQuestion.id to UserAnswer
  examPhase: ExamPhase = "loading";
  isTimeUp: boolean = false; // Flag to indicate if the timer has run out
  frozenRemainingTime: number | null = null; // Store remaining time when timer stops
  private timerIntervalId: ReturnType<typeof setInterval> | null = null; // Timer ID for cleanup
  // Add other relevant state properties like timer, etc.

  constructor() {
    makeAutoObservable(this);
    // Timer is now started in loadExamData
  }

  private clearTimer() {
    if (this.timerIntervalId) {
        clearInterval(this.timerIntervalId);
        this.timerIntervalId = null;
    }
  }

  // Action to load exam data into the store
  loadExamData(examData: UserExam) {
    runInAction(() => {
      // Reset state fully before loading new data, including clearing any existing timer
      this.resetExamState();

      this.currentExam = examData;
      this.currentQuestionIndex = 0; // Start at the first question
      this.userAnswers.clear(); // Clear previous answers if any
      // Initialize answers map based on loaded data
      examData.UserExamQuestions.forEach(q => {
        // Pre-populate answers if the exam was already started and answers saved
        if (!this.userAnswers.has(q.id)) { // Check if already initialized (e.g., from server)
            this.userAnswers.set(q.id, { userExamQuestionId: q.id, answerId: q.userAnswerId || null });
        }
      });
      this.examPhase = "inProgress"; // Set phase to inProgress after loading

      // Start the timer only if there's a valid start time and time limit
      if (this.currentExam?.startedAt) {
          this.clearTimer(); // Ensure no old timer is running
          this.timerIntervalId = setInterval(() => {
              this.checkTimeUp();
          }, 1000); // Check every second
          // Perform an initial check immediately in case the loaded exam is already expired
          this.checkTimeUp();
      }
    });
  }

  // Action to update the answer for a specific question
  answerQuestion(userExamQuestionId: string, answerId: string | null) {
    if (this.userAnswers.has(userExamQuestionId)) {
        runInAction(() => {
          const answer = this.userAnswers.get(userExamQuestionId)!;
          answer.answerId = answerId;
        });
    } else {
        // Handle case where question ID might not be in the map (shouldn't happen in normal flow)
        console.warn(`Attempted to answer non-existent question ID: ${userExamQuestionId}`);
    }
  }

  // Action to move to the next question
  nextQuestion() {
    if (this.currentExam && this.currentQuestionIndex < this.currentExam.UserExamQuestions.length - 1) {
        runInAction(() => {
          this.currentQuestionIndex++;
        });
    }
  }

  // Action to move to the previous question
  previousQuestion() {
    if (this.currentQuestionIndex > 0) {
        runInAction(() => {
          this.currentQuestionIndex--;
        });
    }
  }

  // Action to set a specific question index
  setCurrentQuestionIndex(index: number) {
    if (this.currentExam && index >= 0 && index < this.currentExam.UserExamQuestions.length) {
        runInAction(() => {
          this.currentQuestionIndex = index;
        });
    }
  }

  // Action to mark the exam as completed (or move to review phase)
  finishExam() {
     runInAction(() => {
       this.clearTimer(); // Stop the timer when finishing
       this.examPhase = "completed"; // Or "review"
       // Potentially submit answers to backend here
     });
  }

  // Action to explicitly set the time as up
  setTimeUp() {
    runInAction(() => {
        // Only act if time wasn't already up and the exam is in progress
      if (!this.isTimeUp && this.examPhase === "inProgress") {
        console.log("Exam time is up!");
        // Calculate and store remaining time *before* stopping timer/setting flag
        if (this.currentExam?.startedAt) {
          try {
            const startTime = new Date(this.currentExam.startedAt).getTime();
            if (!isNaN(startTime)) {
              const timeLimitMillis = EXAM_DURATION_MINUTES * 60 * 1000;
              const endTime = startTime + timeLimitMillis;
              const now = Date.now();
              this.frozenRemainingTime = Math.max(0, Math.floor((endTime - now) / 1000));
            } else {
              this.frozenRemainingTime = 0; // Default to 0 if start time was invalid
            }
          } catch (error) {
            console.error("Error calculating frozen time:", error);
            this.frozenRemainingTime = 0; // Default to 0 on error
          }
        } else {
          this.frozenRemainingTime = 0; // Default to 0 if no start time
        }
        
        this.isTimeUp = true;
        this.examPhase = "completed"; // Automatically complete if time runs out
        this.clearTimer(); // Stop the timer since time is up
      }
    });
  }

  // Checks if the allocated time for the exam has passed
  private checkTimeUp() {
    // Timer should only be running if these conditions were met initially,
    // but double-check for safety and to handle potential edge cases.
    if (!this.currentExam || !this.currentExam.startedAt) {
        this.clearTimer(); // Stop timer if state is invalid
        return;
    }

    try {
        const startTime = new Date(this.currentExam.startedAt).getTime();
        // Check if startTime is a valid date
        if (isNaN(startTime)) {
            console.error("Invalid start time detected:", this.currentExam.startedAt);
            this.clearTimer(); // Stop timer due to invalid data
            // Consider setting an error state in the store
            return;
        }
        const timeLimitMillis = EXAM_DURATION_MINUTES * 60 * 1000; // Assuming timeLimit is in minutes
        const elapsedTime = Date.now() - startTime;

        if (elapsedTime >= timeLimitMillis) {
            this.setTimeUp(); // Call setTimeUp action if time has expired
        }
    } catch (error) {
        console.error("Error during checkTimeUp:", error);
        this.clearTimer(); // Stop timer on unexpected error
    }
}

  // Reset store state
  resetExamState() {
    runInAction(() => {
        this.clearTimer(); // Ensure timer is cleared on reset
        this.currentExam = null;
        this.currentQuestionIndex = 0;
        this.userAnswers.clear();
        this.examPhase = "loading";
        this.frozenRemainingTime = null; // Reset frozen time
		this.isTimeUp = false;
    });
  }

  // Optional: Method to explicitly clean up resources like timers
  cleanup() {
      this.clearTimer();
  }

  // Computed property to get the current question data
  get currentQuestionData(): UserExamQuestion | null {
    if (!this.currentExam || this.currentQuestionIndex < 0 || this.currentQuestionIndex >= this.currentExam.UserExamQuestions.length) {
      return null;
    }
    return this.currentExam.UserExamQuestions[this.currentQuestionIndex];
  }

  // Computed property to get the user's answer for the current question
  get currentAnswer(): string | null | undefined {
    const currentQ = this.currentQuestionData;
    if (!currentQ) return undefined;
    return this.userAnswers.get(currentQ.id)?.answerId;
  }
  
  get totalQuestions(): number {
    return this.currentExam?.UserExamQuestions.length ?? 0;
  }

  // Add other computed properties or methods as needed
}

// Create an instance of the store
const examStoreInstance = new ExamStore();

// Create the context
const ExamContext = createContext<ExamStore | undefined>(undefined);

// Hook to use the store context
export const useExamStore = () => {
  const context = useContext(ExamContext);
  if (!context) {
    throw new Error('useExamStore must be used within an ExamProvider or context value must be provided');
  }
  return context;
};

// Export the context itself if needed for direct use
export { ExamContext };

// Export the instance as default
export default examStoreInstance; 
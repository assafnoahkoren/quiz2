import { makeAutoObservable, runInAction } from 'mobx';
import { createContext, useContext } from 'react';
import { UserExam, UserExamQuestion } from '../api/exams'; // Adjust import path as needed

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
  // Add other relevant state properties like timer, etc.

  constructor() {
    makeAutoObservable(this);
  }

  // Action to load exam data into the store
  loadExamData(examData: UserExam) {
    runInAction(() => {
      this.currentExam = examData;
      this.currentQuestionIndex = 0; // Start at the first question
      this.userAnswers.clear(); // Clear previous answers if any
      // Initialize answers map based on loaded data if needed (e.g., resuming an exam)
      examData.UserExamQuestions.forEach(q => {
        // Pre-populate answers if the exam was already started and answers saved
        // For now, assume starting fresh or handle resume logic later
        if (!this.userAnswers.has(q.id)) { // Check if already initialized (e.g., from server)
            this.userAnswers.set(q.id, { userExamQuestionId: q.id, answerId: q.userAnswerId || null });
        }
      });
      this.examPhase = "inProgress"; // Set phase to inProgress after loading
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
       this.examPhase = "completed"; // Or "review"
       // Potentially submit answers to backend here
     });
  }

  // Reset store state
  resetExamState() {
    runInAction(() => {
        this.currentExam = null;
        this.currentQuestionIndex = 0;
        this.userAnswers.clear();
        this.examPhase = "loading";
    });
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
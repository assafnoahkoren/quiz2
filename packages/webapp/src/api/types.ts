// Authentication types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface GovExam {
  id: string;
  name: string;
  description?: string;
}

export interface Subject {
  id: string;
  name: string;
  description?: string;
  govExamId: string;
  parentId?: string;
  children?: Subject[];
}

export interface SubjectTreeItem extends Subject {
  children: SubjectTreeItem[];
  questionCount: number;
}

export interface GovExamResponse {
  examId: string;
  examName: string;
  subjects: SubjectTreeItem[];
}

export enum QuestionType {
  FREE_TEXT = 'FREE_TEXT',
  MCQ = 'MCQ',
  TRUE_FALSE = 'TRUE_FALSE',
  MATCHING = 'MATCHING',
  COMPLETION = 'COMPLETION'
}

export enum QuestionStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED'
}

export interface Question {
  id: string;
  question: string;
  subjectId: string;
  imageUrl: string | null;
  explanation: string | null;
  type: QuestionType;
  status: QuestionStatus;
  createdAt: string;
  updatedAt: string;
  options: {
    id: string;
    answer: string;
    isCorrect: boolean;
  }[];
}

export interface CreateQuestionDto {
  question: string;
  subjectId: string;
  imageUrl?: string;
  explanation?: string;
  type: QuestionType;
  status?: QuestionStatus;
  options: {
    answer: string;
    isCorrect: boolean;
  }[];
}

export interface UpdateQuestionDto {
  question?: string;
  subjectId?: string;
  imageUrl?: string;
  explanation?: string;
  type?: QuestionType;
  status?: QuestionStatus;
  options?: {
    id?: string;
    answer: string;
    isCorrect: boolean;
  }[];
}

export interface CreateSubjectDto {
  name: string;
  description?: string;
  govExamId: string;
  parentId?: string;
}

export interface UpdateSubjectDto {
  name?: string;
  description?: string;
  govExamId?: string;
  parentId?: string;
} 
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
}

export interface Question {
  id: string;
  text: string;
  subjectId: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  explanation?: string;
}

export interface CreateQuestionDto {
  text: string;
  subjectId: string;
  options: {
    text: string;
    isCorrect: boolean;
  }[];
  explanation?: string;
}

export interface UpdateQuestionDto {
  text?: string;
  subjectId?: string;
  options?: {
    id?: string;
    text: string;
    isCorrect: boolean;
  }[];
  explanation?: string;
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
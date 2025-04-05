// DTO for creating a subject
export class CreateSubjectDto {
  name: string;
  govExamId: string;
  parentSubjectId?: string;
}

// DTO for updating a subject
export class UpdateSubjectDto {
  name?: string;
  parentSubjectId?: string;
}

// Type for the subject tree response
export class SubjectTreeItemDto {
  id: string;
  name: string;
  questionCount: number;
  children: SubjectTreeItemDto[];
} 
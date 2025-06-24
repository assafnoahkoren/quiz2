import React from 'react';
import { Modal } from '@mantine/core';
import { ReportIssueForm } from './ReportIssueForm';

interface ReportIssueModalProps {
  opened: boolean;
  onClose: () => void;
  questionId?: string;
  govExamId: string;
  questionData?: any;
}

export const ReportIssueModal: React.FC<ReportIssueModalProps> = ({
  opened,
  onClose,
  questionId,
  govExamId,
  questionData,
}) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="דיווח על בעיה"
      size="md"
      centered
    >
      <ReportIssueForm
        questionId={questionId}
        govExamId={govExamId}
        questionData={questionData}
        onSuccess={onClose}
        onCancel={onClose}
      />
    </Modal>
  );
};

// Utility function to open the report modal programmatically
export interface ReportModalContext {
  questionId?: string;
  govExamId: string;
  questionData?: any;
}

let reportModalHandler: ((context: ReportModalContext) => void) | null = null;

export const setReportModalHandler = (handler: ((context: ReportModalContext) => void) | null) => {
  reportModalHandler = handler;
};

export const openReportModal = (context: ReportModalContext) => {
  if (reportModalHandler) {
    reportModalHandler(context);
  } else {
    console.warn('Report modal handler not set. Make sure ReportModalProvider is mounted.');
  }
};
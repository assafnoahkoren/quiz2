import React, { useState } from 'react';
import { Button, ButtonProps } from '@mantine/core';
import { IconBug } from '@tabler/icons-react';
import { ReportIssueModal } from './ReportIssueModal';

interface ReportIssueButtonProps extends Omit<ButtonProps, 'onClick'> {
  questionId?: string;
  govExamId: string;
  questionData?: any;
  withIcon?: boolean;
}

export const ReportIssueButton: React.FC<ReportIssueButtonProps> = ({
  questionId,
  govExamId,
  questionData,
  withIcon = true,
  children = 'דווח על בעיה',
  variant = 'subtle',
  size = 'sm',
  ...buttonProps
}) => {
  const [modalOpened, setModalOpened] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        leftSection={withIcon ? <IconBug size={16} /> : undefined}
        onClick={() => setModalOpened(true)}
        {...buttonProps}
      >
        {children}
      </Button>

      <ReportIssueModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        questionId={questionId}
        govExamId={govExamId}
        questionData={questionData}
      />
    </>
  );
};
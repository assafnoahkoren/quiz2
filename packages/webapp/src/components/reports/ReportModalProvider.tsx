import React, { useState, useEffect } from 'react';
import { ReportIssueModal, setReportModalHandler, ReportModalContext } from './ReportIssueModal';

interface ReportModalProviderProps {
  children: React.ReactNode;
}

export const ReportModalProvider: React.FC<ReportModalProviderProps> = ({ children }) => {
  const [modalOpened, setModalOpened] = useState(false);
  const [modalContext, setModalContext] = useState<ReportModalContext>({
    govExamId: '',
  });

  useEffect(() => {
    const handler = (context: ReportModalContext) => {
      setModalContext(context);
      setModalOpened(true);
    };

    setReportModalHandler(handler);

    return () => {
      setReportModalHandler(null);
    };
  }, []);

  return (
    <>
      {children}
      <ReportIssueModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        questionId={modalContext.questionId}
        govExamId={modalContext.govExamId}
        questionData={modalContext.questionData}
      />
    </>
  );
};
export interface FeynmanInterviewProps {
  lessonBlockId: string;
  lessonId: string;
  onComplete: () => void;
  onNextBlock: () => void;
  onBackToDashboard: () => void;
  hasNextBlock: boolean;
}

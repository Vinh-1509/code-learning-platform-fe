export interface FeynmanMessage {
  id: string;
  role: 'ai' | 'user';
  content: string;
  timestamp?: Date;
  isCorrect?: boolean; // For feedback messages
}

export interface FeynmanInterviewState {
  messages: FeynmanMessage[];
  currentQuestion: string;
  isLoading: boolean;
  error: string | null;
  userResponse: string;
  feedbackMessage: string | null;
  isCorrect: boolean | null;
  questionCount: number;
  totalQuestions?: number;
}

export interface FeynmanInterviewProps {
  lessonBlockId: string;
  onComplete: () => void;
  onNextBlock: () => void;
  onBackToDashboard: () => void;
  hasNextBlock: boolean;
}

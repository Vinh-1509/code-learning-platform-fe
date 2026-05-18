export type LessonStatus = 'completed' | 'active' | 'locked';

export interface LessonBlock {
  id: number;
  title: string;
  subtitle: string;
  tag: string;
  status: LessonStatus;
}

export interface DraggableBlock {
  id: string;
  code: string;
  indent: number;
}

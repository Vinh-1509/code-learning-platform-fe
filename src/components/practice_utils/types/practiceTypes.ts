export interface DraggableBlock {
  id: string;
  code: string;
  indent: number;
}

export interface BlankPart {
  id: string;
  text: string;
  isBlank: boolean;
  answer?: string;
}

export interface BlankLine {
  id: string;
  parts: BlankPart[];
  indent: number;
}

export interface DragDropExercise {
  id: string;
  type: 'dragdrop';
  title: string;
  expectedSlots: number;
  blocks: DraggableBlock[];
  answer?: (string | null)[];
  description: string;
  hints?: Record<string, string>;
}

export interface FillBlankExercise {
  id: string;
  type: 'fillblank';
  title: string;
  lines: BlankLine[];
  description: string;
  hints?: Record<string, string>;
}

export type PracticeExercise = DragDropExercise | FillBlankExercise;

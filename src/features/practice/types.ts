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
  type: 'dragdrop';
  blocks: DraggableBlock[];
  answer: (string | null)[];
  description: string;
}

export interface FillBlankExercise {
  type: 'fillblank';
  lines: BlankLine[];
  description: string;
}

export type PracticeExercise = DragDropExercise | FillBlankExercise;

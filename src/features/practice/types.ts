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
  blocks: DraggableBlock[];
  answer?: (string | null)[];
  description: string;
}

export interface FillBlankExercise {
  id: string;
  type: 'fillblank';
  title: string;
  lines: BlankLine[];
  description: string;
}

export type PracticeExercise = DragDropExercise | FillBlankExercise;

// Conversion functions for API responses
import type {
  DragDropExerciseResponse,
  FillBlankExerciseResponse,
  ExerciseResponse,
} from '@/lib/axios';

export function convertDragDropExercise(
  apiExercise: DragDropExerciseResponse
): DragDropExercise {
  return {
    id: apiExercise._id,
    type: 'dragdrop',
    title: apiExercise.title,
    description: apiExercise.description,
    blocks: apiExercise.blocks,
    answer: apiExercise.answer,
  };
}

export function convertFillBlankExercise(
  apiExercise: FillBlankExerciseResponse
): FillBlankExercise {
  return {
    id: apiExercise._id,
    type: 'fillblank',
    title: apiExercise.title,
    description: apiExercise.description,
    lines: apiExercise.lines.map((line) => ({
      id: line.id,
      indent: line.indent,
      parts: line.parts,
    })),
  };
}

export function convertExerciseResponse(
  apiExercise: ExerciseResponse
): PracticeExercise {
  if (apiExercise.type === 'dragdrop') {
    return convertDragDropExercise(apiExercise);
  }
  return convertFillBlankExercise(apiExercise);
}

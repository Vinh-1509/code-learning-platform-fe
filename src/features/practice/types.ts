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

// ---------------------------------------------------------------------------
// Conversion: raw API response → UI exercise types
// ---------------------------------------------------------------------------
import type {
  DragDropExerciseResponse,
  FillBlankExerciseResponse,
  ExerciseResponse,
} from '@/lib/axios';

export function convertDragDropExercise(
  api: DragDropExerciseResponse
): DragDropExercise {
  return {
    id: api._id,
    type: 'dragdrop',
    title: api.title,
    description: api.instruction,
    blocks: api.data.blocks,
    answer: api.data.answer,
    hints: api.hints,
  };
}

export function convertFillBlankExercise(
  api: FillBlankExerciseResponse
): FillBlankExercise {
  const { template, placeholders } = api.data;

  const flat: Array<
    | { kind: 'text'; text: string }
    | { kind: 'blank'; id: string; answer: string }
  > = [];

  template.forEach((text, i) => {
    flat.push({ kind: 'text', text });
    const key = `input_${i + 1}`;
    if (placeholders && placeholders[key]) {
      flat.push({ kind: 'blank', id: key, answer: placeholders[key] });
    }
  });

  const lines: BlankLine[] = [];
  let currentParts: BlankPart[] = [];
  let lineIdx = 0;
  let textPartIdx = 0;

  const flushLine = () => {
    if (currentParts.length > 0) {
      lines.push({ id: `line-${lineIdx++}`, parts: currentParts, indent: 0 });
      currentParts = [];
    }
  };

  for (const item of flat) {
    if (item.kind === 'blank') {
      currentParts.push({
        id: item.id,
        text: '',
        isBlank: true,
        answer: item.answer,
      });
    } else {
      const subLines = item.text.split('\n');
      subLines.forEach((subLine, idx) => {
        if (idx > 0) flushLine();
        if (subLine.length > 0) {
          currentParts.push({
            id: `text-${textPartIdx++}`,
            text: subLine,
            isBlank: false,
          });
        }
      });
    }
  }
  flushLine();

  return {
    id: api._id,
    type: 'fillblank',
    title: api.title,
    description: api.instruction,
    lines,
    hints: api.hints,
  };
}

export function convertExerciseResponse(
  api: ExerciseResponse
): PracticeExercise {
  if (api.type === 'fill_blank') {
    return convertFillBlankExercise(api);
  }
  return convertDragDropExercise(api);
}

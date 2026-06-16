import type {
  DragDropExercise,
  FillBlankExercise,
  PracticeExercise,
  BlankLine,
  BlankPart,
} from '../types/practice.types';
import type {
  DragDropExerciseResponse,
  FillBlankExerciseResponse,
  ExerciseResponse,
} from '@/lib/axios';

/**
 * Convert a raw drag-drop exercise from the API response into the UI exercise type.
 */

export function convertDragDropExercise(
  api: DragDropExerciseResponse
): DragDropExercise {
  return {
    id: api._id,
    type: 'dragdrop',
    title: api.title,
    description: api.instruction,
    expectedSlots: api.data.expectedSlots ?? api.data.blocks.length,
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

export const prepareAnswerForSubmission = (
  type: PracticeExercise['type'],
  rawAnswer: unknown
): Record<string, string> => {
  if (type === 'dragdrop' && Array.isArray(rawAnswer)) {
    return rawAnswer.reduce<Record<string, string>>((acc, val, idx) => {
      if (val !== null && val !== undefined) {
        acc[String(idx + 1)] = String(val);
      }
      return acc;
    }, {});
  }

  return rawAnswer as Record<string, string>;
};

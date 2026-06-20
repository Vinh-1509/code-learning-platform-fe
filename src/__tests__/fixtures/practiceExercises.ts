import type {
  DragDropExercise,
  FillBlankExercise,
} from '@/components/practice_utils/types/practiceTypes';

export const fillBlankExerciseFixture: FillBlankExercise = {
  id: 'ex-fill-1',
  type: 'fillblank',
  title: 'Complete the variable',
  description: 'Fill in the missing code snippets',
  lines: [
    {
      id: 'line-1',
      indent: 0,
      parts: [
        { id: 'text-1', text: 'int ', isBlank: false },
        { id: 'input_1', text: '', isBlank: true, answer: 'count' },
        { id: 'text-2', text: ' = 0;', isBlank: false },
      ],
    },
  ],
  hints: {
    '1': 'The variable stores a count.',
    '2': 'It should be initialized to zero.',
    '3': 'Consider the variable name used elsewhere.',
  },
};

export const dragDropExerciseFixture: DragDropExercise = {
  id: 'ex-drag-1',
  type: 'dragdrop',
  title: 'Build a loop',
  description: 'Arrange the blocks in the correct order',
  expectedSlots: 2,
  blocks: [
    { id: 'b1', code: 'for', indent: 0 },
    { id: 'b2', code: 'while', indent: 0 },
  ],
  hints: { '1': 'Pick the loop keyword first.' },
};

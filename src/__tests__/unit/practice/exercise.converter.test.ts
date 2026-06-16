import { describe, it, expect } from 'vitest';
import {
  convertDragDropExercise,
  convertFillBlankExercise,
  convertExerciseResponse,
  prepareAnswerForSubmission,
} from '@/features/practice_utils/utils/exercise.converter';
import type {
  DragDropExerciseResponse,
  FillBlankExerciseResponse,
} from '@/lib/axios';

// ── Fixtures ─────────────────────────────────────────────────────────────────

const dragDropApiFixture: DragDropExerciseResponse = {
  _id: 'ex-001',
  type: 'drag_drop',
  title: 'Build a loop',
  instruction: 'Arrange the blocks to form a for loop.',
  language: 'C++',
  level: 'beginner',
  order: 1,
  data: {
    expectedSlots: 3,
    blocks: [
      { id: 'b1', code: 'for (int i = 0;', indent: 0 },
      { id: 'b2', code: 'i < 10;', indent: 0 },
      { id: 'b3', code: 'i++)', indent: 0 },
    ],
    answer: ['b1', 'b2', 'b3'],
  },
  hints: { '1': 'Start with the for keyword' },
};

const fillBlankApiFixture: FillBlankExerciseResponse = {
  _id: 'ex-002',
  type: 'fill_blank',
  title: 'Complete the function',
  instruction: 'Fill in the blanks to complete the function signature.',
  language: 'C++',
  level: 'intermediate',
  order: 2,
  data: {
    template: ['int ', ' = 0;', '\nreturn ', ';'],
    placeholders: {
      input_1: 'x',
      input_2: 'x',
      input_3: 'x',
    },
  },
  hints: { '1': 'The variable name is x' },
};

// ── convertDragDropExercise() ─────────────────────────────────────────────────

describe('convertDragDropExercise()', () => {
  it('should map _id to id', () => {
    const result = convertDragDropExercise(dragDropApiFixture);
    expect(result.id).toBe('ex-001');
  });

  it('should set type to "dragdrop"', () => {
    const result = convertDragDropExercise(dragDropApiFixture);
    expect(result.type).toBe('dragdrop');
  });

  it('should map instruction to description', () => {
    const result = convertDragDropExercise(dragDropApiFixture);
    expect(result.description).toBe('Arrange the blocks to form a for loop.');
  });

  it('should preserve the blocks array from the API response', () => {
    const result = convertDragDropExercise(dragDropApiFixture);
    expect(result.blocks).toEqual(dragDropApiFixture.data.blocks);
  });

  it('should use expectedSlots from the API when present', () => {
    const result = convertDragDropExercise(dragDropApiFixture);
    expect(result.expectedSlots).toBe(3);
  });

  it('should fall back to blocks.length when expectedSlots is absent', () => {
    const withoutSlots: DragDropExerciseResponse = {
      ...dragDropApiFixture,
      data: { ...dragDropApiFixture.data, expectedSlots: undefined },
    };
    const result = convertDragDropExercise(withoutSlots);
    expect(result.expectedSlots).toBe(dragDropApiFixture.data.blocks.length);
  });

  it('should preserve the hints object', () => {
    const result = convertDragDropExercise(dragDropApiFixture);
    expect(result.hints).toEqual({ '1': 'Start with the for keyword' });
  });

  it('should handle an exercise with no blocks (empty array)', () => {
    const noBlocks: DragDropExerciseResponse = {
      ...dragDropApiFixture,
      data: { blocks: [], expectedSlots: 0 },
    };
    const result = convertDragDropExercise(noBlocks);
    expect(result.blocks).toHaveLength(0);
    expect(result.expectedSlots).toBe(0);
  });
});

// ── convertFillBlankExercise() ────────────────────────────────────────────────

describe('convertFillBlankExercise()', () => {
  it('should map _id to id', () => {
    const result = convertFillBlankExercise(fillBlankApiFixture);
    expect(result.id).toBe('ex-002');
  });

  it('should set type to "fillblank"', () => {
    const result = convertFillBlankExercise(fillBlankApiFixture);
    expect(result.type).toBe('fillblank');
  });

  it('should map instruction to description', () => {
    const result = convertFillBlankExercise(fillBlankApiFixture);
    expect(result.description).toBe(
      'Fill in the blanks to complete the function signature.'
    );
  });

  it('should produce a non-empty lines array', () => {
    const result = convertFillBlankExercise(fillBlankApiFixture);
    expect(result.lines.length).toBeGreaterThan(0);
  });

  it('should create blank parts with isBlank=true for each placeholder', () => {
    const result = convertFillBlankExercise(fillBlankApiFixture);
    const blankParts = result.lines.flatMap((l) =>
      l.parts.filter((p) => p.isBlank)
    );
    // The fixture has 3 placeholders (input_1..3)
    expect(blankParts.length).toBe(3);
  });

  it('should set the correct answer on each blank part', () => {
    const result = convertFillBlankExercise(fillBlankApiFixture);
    const blankParts = result.lines.flatMap((l) =>
      l.parts.filter((p) => p.isBlank)
    );
    // All answers in the fixture are 'x'
    blankParts.forEach((part) => expect(part.answer).toBe('x'));
  });

  it('should create text parts with isBlank=false', () => {
    const result = convertFillBlankExercise(fillBlankApiFixture);
    const textParts = result.lines.flatMap((l) =>
      l.parts.filter((p) => !p.isBlank)
    );
    expect(textParts.length).toBeGreaterThan(0);
    textParts.forEach((part) => expect(part.isBlank).toBe(false));
  });

  it('should split text segments on newline into separate lines', () => {
    // The fixture template contains '\nreturn' which should create a new line
    const result = convertFillBlankExercise(fillBlankApiFixture);
    expect(result.lines.length).toBeGreaterThanOrEqual(2);
  });

  it('should preserve the hints object', () => {
    const result = convertFillBlankExercise(fillBlankApiFixture);
    expect(result.hints).toEqual({ '1': 'The variable name is x' });
  });

  it('should handle a template with no placeholders gracefully', () => {
    const noPlaceholders: FillBlankExerciseResponse = {
      ...fillBlankApiFixture,
      data: {
        template: ['int x = 0;'],
        placeholders: {},
      },
    };
    const result = convertFillBlankExercise(noPlaceholders);
    const blankParts = result.lines.flatMap((l) =>
      l.parts.filter((p) => p.isBlank)
    );
    expect(blankParts).toHaveLength(0);
  });
});

// ── convertExerciseResponse() ─────────────────────────────────────────────────

describe('convertExerciseResponse()', () => {
  it('should call convertFillBlankExercise for fill_blank type', () => {
    const result = convertExerciseResponse(fillBlankApiFixture);
    expect(result.type).toBe('fillblank');
    expect(result.id).toBe('ex-002');
  });

  it('should call convertDragDropExercise for drag_drop type', () => {
    const result = convertExerciseResponse(dragDropApiFixture);
    expect(result.type).toBe('dragdrop');
    expect(result.id).toBe('ex-001');
  });
});

// ── prepareAnswerForSubmission() ──────────────────────────────────────────────

describe('prepareAnswerForSubmission()', () => {
  describe('when type is "dragdrop"', () => {
    it('should convert a filled array into a 1-indexed Record<string, string>', () => {
      const result = prepareAnswerForSubmission('dragdrop', ['b1', 'b2', 'b3']);
      expect(result).toEqual({ '1': 'b1', '2': 'b2', '3': 'b3' });
    });

    it('should skip null slots and not include them in the result', () => {
      const result = prepareAnswerForSubmission('dragdrop', ['b1', null, 'b3']);
      expect(result).toEqual({ '1': 'b1', '3': 'b3' });
      expect(result['2']).toBeUndefined();
    });

    it('should return an empty object for an empty array', () => {
      const result = prepareAnswerForSubmission('dragdrop', []);
      expect(result).toEqual({});
    });

    it('should return an empty object when all slots are null', () => {
      const result = prepareAnswerForSubmission('dragdrop', [null, null]);
      expect(result).toEqual({});
    });

    it('should convert non-string block values to strings', () => {
      // Defensive: if a block id is a number (runtime edge case)
      const result = prepareAnswerForSubmission('dragdrop', [
        42 as unknown as string,
      ]);
      expect(result['1']).toBe('42');
    });
  });

  describe('when type is "fillblank"', () => {
    it('should pass through the rawAnswer object as-is', () => {
      const userAnswer = { input_1: 'int', input_2: 'x' };
      const result = prepareAnswerForSubmission('fillblank', userAnswer);
      expect(result).toEqual(userAnswer);
    });

    it('should pass through an empty object as-is', () => {
      const result = prepareAnswerForSubmission('fillblank', {});
      expect(result).toEqual({});
    });
  });
});

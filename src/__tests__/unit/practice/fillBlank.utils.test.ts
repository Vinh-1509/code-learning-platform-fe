import { describe, it, expect } from 'vitest';
import {
  getInputWidth,
  getBlankInputClass,
} from '@/features/practice_utils/utils/fillBlank.utils';

describe('getInputWidth()', () => {
  const CHAR_WIDTH = 8.4;
  const MIN_WIDTH = 60;
  const PADDING = 16;

  it('should return the minimum width when both answer and placeholder are empty', () => {
    expect(getInputWidth('', '')).toBe(MIN_WIDTH);
  });

  it('should use the answer length when answer is provided', () => {
    const answer = 'hello'; // 5 chars
    const expected = Math.max(MIN_WIDTH, answer.length * CHAR_WIDTH + PADDING);
    expect(getInputWidth(answer, 'placeholder')).toBe(expected);
  });

  it('should fall back to placeholder length when answer is empty', () => {
    const placeholder = 'Enter value here'; // 16 chars
    const expected = Math.max(
      MIN_WIDTH,
      placeholder.length * CHAR_WIDTH + PADDING
    );
    expect(getInputWidth('', placeholder)).toBe(expected);
  });

  it('should return the minimum width when answer is shorter than the minimum', () => {
    // 1 char * 8.4 + 16 = 24.4 < 60
    expect(getInputWidth('a', '')).toBe(MIN_WIDTH);
  });

  it('should scale beyond the minimum for a long answer', () => {
    const longAnswer = 'std::unordered_map<int, int>'; // 28 chars
    const expectedWidth = longAnswer.length * CHAR_WIDTH + PADDING;
    expect(getInputWidth(longAnswer, '')).toBeGreaterThan(MIN_WIDTH);
    expect(getInputWidth(longAnswer, '')).toBeCloseTo(expectedWidth);
  });

  it('should prefer answer over placeholder when both are non-empty', () => {
    // answer is shorter, but it wins over placeholder
    const answer = 'int'; // 3 chars → 3*8.4+16 = 41.2 → clamped to 60
    const placeholder = 'longer-placeholder'; // 18 chars
    // Since answer is used when non-empty, result should be based on answer (min width)
    expect(getInputWidth(answer, placeholder)).toBe(MIN_WIDTH);
  });

  it('should always return a number >= the minimum width (never negative)', () => {
    expect(getInputWidth('', '')).toBeGreaterThanOrEqual(MIN_WIDTH);
    expect(getInputWidth('x', 'y')).toBeGreaterThanOrEqual(MIN_WIDTH);
  });
});

describe('getBlankInputClass()', () => {
  it('should return filled-state classes when answer is a non-empty string', () => {
    const result = getBlankInputClass('int');
    // Filled: blue background classes
    expect(result).toContain('bg-[#264F78]');
    expect(result).toContain('border-[#0E639C]');
    expect(result).toContain('text-[#CE9178]');
  });

  it('should return empty-state classes when answer is an empty string', () => {
    const result = getBlankInputClass('');
    // Empty: dark neutral background classes
    expect(result).toContain('bg-[#2d2d30]');
    expect(result).toContain('border-[#3e3e42]');
    expect(result).toContain('text-[#858585]');
  });

  it('should always include the shared base classes regardless of answer', () => {
    const baseClasses = [
      'px-2',
      'py-0.5',
      'rounded',
      'border',
      'font-mono',
      'text-sm',
      'text-center',
      'focus:outline-none',
    ];
    const filledResult = getBlankInputClass('value');
    const emptyResult = getBlankInputClass('');
    for (const cls of baseClasses) {
      expect(filledResult).toContain(cls);
      expect(emptyResult).toContain(cls);
    }
  });

  it('should NOT include filled-state classes when answer is empty', () => {
    const result = getBlankInputClass('');
    expect(result).not.toContain('bg-[#264F78]');
    expect(result).not.toContain('border-[#0E639C]');
  });

  it('should NOT include empty-state classes when answer is filled', () => {
    const result = getBlankInputClass('return');
    expect(result).not.toContain('bg-[#2d2d30]');
    expect(result).not.toContain('border-[#3e3e42]');
  });
});

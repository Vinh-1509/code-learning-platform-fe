import { describe, it, expect } from 'vitest';
import {
  getUsedIds,
  isAllFilled,
} from '@/features/practice_utils/utils/dragDrop.utils';

describe('getUsedIds()', () => {
  it('should return an empty Set when the array is empty', () => {
    expect(getUsedIds([])).toEqual(new Set());
  });

  it('should return an empty Set when all slots are null (nothing dropped)', () => {
    expect(getUsedIds([null, null, null])).toEqual(new Set());
  });

  it('should return a Set containing only the non-null string IDs', () => {
    const result = getUsedIds(['block-1', null, 'block-2', null]);
    expect(result).toEqual(new Set(['block-1', 'block-2']));
  });

  it('should handle an array where all slots are filled', () => {
    const result = getUsedIds(['a', 'b', 'c']);
    expect(result).toEqual(new Set(['a', 'b', 'c']));
  });

  it('should deduplicate identical IDs (Set semantics)', () => {
    // Same block dropped into two slots — Set should still hold only one entry
    const result = getUsedIds(['block-1', 'block-1', null]);
    expect(result.size).toBe(1);
    expect(result.has('block-1')).toBe(true);
  });

  it('should ignore null values but keep empty strings (they are truthy-ish strings)', () => {
    // '' is a valid string — filter only drops `null`
    const result = getUsedIds(['block-1', null]);
    expect(result.has('block-1')).toBe(true);
    expect(result.has(null as unknown as string)).toBe(false);
  });
});

describe('isAllFilled()', () => {
  it('should return true for an empty array (vacuously all filled)', () => {
    expect(isAllFilled([])).toBe(true);
  });

  it('should return false when all slots are null', () => {
    expect(isAllFilled([null, null, null])).toBe(false);
  });

  it('should return false when at least one slot is null', () => {
    expect(isAllFilled(['block-1', null, 'block-3'])).toBe(false);
  });

  it('should return true when every slot contains a non-null string', () => {
    expect(isAllFilled(['block-1', 'block-2', 'block-3'])).toBe(true);
  });

  it('should return true for a single-element array with a filled slot', () => {
    expect(isAllFilled(['block-1'])).toBe(true);
  });

  it('should return false for a single-element array with a null slot', () => {
    expect(isAllFilled([null])).toBe(false);
  });
});

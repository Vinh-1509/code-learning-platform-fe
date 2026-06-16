import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn()', () => {
  it('should return an empty string when called with no arguments', () => {
    expect(cn()).toBe('');
  });

  it('should return a single class name unchanged', () => {
    expect(cn('font-bold')).toBe('font-bold');
  });

  it('should join multiple class names with a space', () => {
    expect(cn('text-sm', 'font-medium', 'text-slate-700')).toBe(
      'text-sm font-medium text-slate-700'
    );
  });

  it('should omit falsy values (false, null, undefined)', () => {
    expect(cn('text-sm', false, null, undefined, 'font-bold')).toBe(
      'text-sm font-bold'
    );
  });

  it('should include a class name only when its condition is true', () => {
    const isActive = true;
    const isDisabled = false;
    expect(
      cn('base', isActive && 'bg-blue-500', isDisabled && 'opacity-50')
    ).toBe('base bg-blue-500');
  });

  it('should resolve Tailwind conflicts by keeping the last class (tailwind-merge)', () => {
    // tailwind-merge removes the earlier conflicting utility
    expect(cn('px-4', 'px-8')).toBe('px-8');
    expect(cn('text-red-500', 'text-blue-600')).toBe('text-blue-600');
    expect(cn('font-bold', 'font-normal')).toBe('font-normal');
  });

  it('should handle object syntax from clsx', () => {
    expect(cn({ 'bg-green-500': true, 'bg-red-500': false })).toBe(
      'bg-green-500'
    );
  });

  it('should handle array syntax from clsx', () => {
    expect(cn(['text-sm', 'font-mono'])).toBe('text-sm font-mono');
  });

  it('should handle a mix of strings, objects, and arrays', () => {
    expect(cn('base', { active: true, disabled: false }, ['extra'])).toBe(
      'base active extra'
    );
  });
});

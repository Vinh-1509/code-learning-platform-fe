import { describe, it, expect } from 'vitest';
import { tokenize } from '@/lib/syntax';
import type { SyntaxToken } from '@/lib/syntax';

// Helper: extract just the token types from the result array
const types = (tokens: SyntaxToken[]) => tokens.map((t) => t.type);
// Helper: extract just the token text values
const texts = (tokens: SyntaxToken[]) => tokens.map((t) => t.text);

describe('tokenize()', () => {
  // ── Edge cases ─────────────────────────────────────────────────────────────

  it('should return an empty array for an empty string', () => {
    expect(tokenize('')).toEqual([]);
  });

  it('should handle a string containing only whitespace', () => {
    const result = tokenize('   ');
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('default');
    expect(result[0].text).toBe('   ');
  });

  // ── Keywords ───────────────────────────────────────────────────────────────

  it('should classify C++ keywords correctly', () => {
    const keywords = [
      'int',
      'float',
      'return',
      'void',
      'const',
      'new',
      'class',
    ];
    for (const kw of keywords) {
      const result = tokenize(kw);
      expect(result[0].type).toBe('keyword');
      expect(result[0].text).toBe(kw);
    }
  });

  it('should NOT classify a word that starts with a keyword as a keyword', () => {
    // "integer" should not be classified as "int"
    const result = tokenize('integer');
    expect(result[0].type).toBe('default');
  });

  // ── Strings ────────────────────────────────────────────────────────────────

  it('should classify a double-quoted string literal as "string"', () => {
    const result = tokenize('"hello world"');
    expect(result[0].type).toBe('string');
    expect(result[0].text).toBe('"hello world"');
  });

  it('should classify a single-quoted string literal as "string"', () => {
    const result = tokenize("'x'");
    expect(result[0].type).toBe('string');
    expect(result[0].text).toBe("'x'");
  });

  // ── Numbers ────────────────────────────────────────────────────────────────

  it('should classify integer literals as "number"', () => {
    const result = tokenize('42');
    expect(result[0].type).toBe('number');
    expect(result[0].text).toBe('42');
  });

  it('should classify floating-point literals as "number"', () => {
    const result = tokenize('3.14');
    expect(result[0].type).toBe('number');
    expect(result[0].text).toBe('3.14');
  });

  // ── Comments ───────────────────────────────────────────────────────────────

  it('should classify a single-line comment (//) as "comment"', () => {
    const result = tokenize('// this is a comment');
    expect(result[0].type).toBe('comment');
    expect(result[0].text).toBe('// this is a comment');
  });

  it('should classify a block comment (/* ... */) as "comment"', () => {
    const result = tokenize('/* block */');
    expect(result[0].type).toBe('comment');
    expect(result[0].text).toBe('/* block */');
  });

  // ── Functions ──────────────────────────────────────────────────────────────

  it('should classify a function call identifier as "function"', () => {
    const result = tokenize('main()');
    expect(result[0].type).toBe('function');
    expect(result[0].text).toBe('main');
  });

  it('should classify a function call with a space before parens as "function"', () => {
    const result = tokenize('printf ()');
    expect(result[0].type).toBe('function');
    expect(result[0].text).toBe('printf');
  });

  // ── Punctuation ────────────────────────────────────────────────────────────

  it('should classify punctuation characters as "punctuation"', () => {
    const punctChars = ['{', '}', '(', ')', '[', ']', ';', ','];
    for (const ch of punctChars) {
      const result = tokenize(ch);
      expect(result[0].type).toBe('punctuation');
    }
  });

  // ── Operators ──────────────────────────────────────────────────────────────

  it('should classify operator characters as "operator"', () => {
    const opChars = ['=', '+', '-', '*', '/', '%', '!'];
    for (const ch of opChars) {
      const result = tokenize(ch);
      expect(result[0].type).toBe('operator');
    }
  });

  // ── Full snippet tokenization ──────────────────────────────────────────────

  it('should tokenize a complete C++ snippet into the correct sequence of types', () => {
    // "int main()" → keyword, whitespace/default, function, punctuation, punctuation
    const result = tokenize('int main()');
    expect(types(result)).toContain('keyword');
    expect(types(result)).toContain('function');
    expect(types(result)).toContain('punctuation');
  });

  it('should tokenize a return statement correctly', () => {
    const result = tokenize('return 0;');
    expect(types(result)).toContain('keyword'); // 'return'
    expect(types(result)).toContain('number'); // '0'
    expect(types(result)).toContain('punctuation'); // ';'
  });

  it('should never infinite-loop on a single unknown character', () => {
    // A character that matches no pattern still gets consumed as 'default'
    const result = tokenize('@');
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('default');
    expect(result[0].text).toBe('@');
  });

  it('should correctly reconstruct the original string from all token texts', () => {
    const input = 'int x = 42; // answer';
    const result = tokenize(input);
    expect(texts(result).join('')).toBe(input);
  });

  it('should handle a multi-line string by producing tokens for each segment', () => {
    const input = 'int a;\nreturn a;';
    const result = tokenize(input);
    // The full text must be reconstructible
    expect(texts(result).join('')).toBe(input);
    // 'int' and 'return' should both appear as keywords
    expect(types(result).filter((t) => t === 'keyword')).toHaveLength(2);
  });
});

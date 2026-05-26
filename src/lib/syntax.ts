// ── VS Code One Dark Pro token colours ────────────────────────────────────────
export const TOKEN_COLORS: Record<string, string> = {
  keyword: '#C586C0', // purple
  string: '#CE9178', // orange
  number: '#B5CEA8', // green
  function: '#DCDCAA', // yellow
  comment: '#6A9955', // dim green
  variable: '#9CDCFE', // blue
  operator: '#D4D4D4', // white
  punctuation: '#D4D4D4', // white
  default: '#D4D4D4', // white
};

export type TokenType =
  | 'keyword'
  | 'string'
  | 'number'
  | 'function'
  | 'comment'
  | 'variable'
  | 'operator'
  | 'punctuation'
  | 'default';

export interface SyntaxToken {
  type: TokenType;
  text: string;
}

/** Minimal C++ / Python tokeniser – good enough for short code snippets. */
export function tokenize(text: string): SyntaxToken[] {
  const patterns: [TokenType, RegExp][] = [
    ['comment', /^\/\/[^\n]*|^\/\*[\s\S]*?\*\//],
    ['string', /^(?:'[^'\\]*'|"[^"\\]*")/],
    ['number', /^\b\d+\.?\d*\b/],
    [
      'keyword',
      /^\b(int|float|double|char|bool|void|return|if|else|for|while|do|break|continue|class|struct|const|auto|new|delete|nullptr|true|false|std|string|unordered_map|map|vector|using|namespace|include|template|typename|and|or|not)\b/,
    ],
    ['function', /^\b[a-zA-Z_]\w*(?=\s*\()/], // Matches function names before '('
    ['punctuation', /^[{}()[\];,<>]/],
    ['operator', /^[=+\-*/%&|^!~?:]/],
    // identifiers + whitespace + everything else consumed one-chunk at a time
    ['default', /^[^\s{}()[\];,<>'"+=\-*/%&|^!~?:]+|^\s+/],
  ];

  const tokens: SyntaxToken[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    let matched = false;
    for (const [type, pattern] of patterns) {
      const m = remaining.match(pattern);
      if (m) {
        tokens.push({ type, text: m[0] });
        remaining = remaining.slice(m[0].length);
        matched = true;
        break;
      }
    }
    // safety: consume one character so we never loop infinitely
    if (!matched) {
      tokens.push({ type: 'default', text: remaining[0] });
      remaining = remaining.slice(1);
    }
  }

  return tokens;
}

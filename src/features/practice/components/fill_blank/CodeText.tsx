import { TOKEN_COLORS, tokenize } from '@/lib/syntax';

interface CodeTextProps {
  text: string;
}

export function CodeText({ text }: CodeTextProps) {
  return (
    <>
      {tokenize(text).map((token, idx) => (
        <span
          key={idx}
          style={{ color: TOKEN_COLORS[token.type] }}
          className="whitespace-pre"
        >
          {token.text}
        </span>
      ))}
    </>
  );
}

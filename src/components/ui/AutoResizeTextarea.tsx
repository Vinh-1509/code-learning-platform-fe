import { type TextareaHTMLAttributes } from 'react';

type AutoResizeTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function AutoResizeTextarea({
  onChange,
  className,
  ...props
}: AutoResizeTextareaProps) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;

    onChange?.(e);
  };

  return (
    <textarea
      {...props}
      rows={1}
      onChange={handleChange}
      className={`resize-none overflow-hidden ${className ?? ''}`}
    />
  );
}

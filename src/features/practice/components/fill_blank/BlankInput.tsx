import { getBlankInputClass, getInputWidth } from '../../utils/fillBlank.utils';

interface BlankInputProps {
  partId: string;
  answer: string;
  onAnswerChange: (partId: string, value: string) => void;
}

export function BlankInput({
  partId,
  answer,
  onAnswerChange,
}: BlankInputProps) {
  const placeholder = `[${partId}]`;

  return (
    <input
      type="text"
      value={answer}
      placeholder={placeholder}
      style={{
        width: `${getInputWidth(answer, placeholder)}px`,
      }}
      onChange={(e) => onAnswerChange(partId, e.target.value)}
      className={getBlankInputClass(answer)}
    />
  );
}

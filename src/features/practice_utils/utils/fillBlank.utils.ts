import { cn } from '@/lib/utils';

export function getInputWidth(answer: string, placeholder: string) {
  const charWidth = 8.4;
  const minWidth = 60;
  const paddingWidth = 16;

  return Math.max(
    minWidth,
    (answer || placeholder).length * charWidth + paddingWidth
  );
}

export function getBlankInputClass(answer: string) {
  return cn(
    'px-2 py-0.5 rounded border font-mono text-sm text-center transition-all focus:outline-none focus:ring-1 mx-0.5 shrink-0 cursor-text',
    answer
      ? 'bg-[#264F78] border-[#0E639C] text-[#CE9178] focus:ring-[#007ACC]'
      : 'bg-[#2d2d30] border-[#3e3e42] text-[#858585] focus:ring-[#007ACC]'
  );
}

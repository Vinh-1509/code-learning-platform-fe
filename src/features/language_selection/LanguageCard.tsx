import type { LanguageOption } from '@/types/language_selection';

interface LanguageCardProps {
  lang: LanguageOption;
  isSelected: boolean;
  onSelect: () => void;
}

export function LanguageCard({
  lang,
  isSelected,
  onSelect,
}: LanguageCardProps) {
  const ringClass = isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : '';

  return (
    <div
      className={`flex-1 rounded-2xl overflow-hidden border border-slate-200 shadow-sm transition-all ${ringClass}`}
    >
      <div className={`${lang.color.background} p-6 relative`}>
        <div className="flex items-start justify-between">
          <span className="text-xs font-bold text-white/80 bg-white/20 px-2.5 py-1 rounded-lg">
            {lang.language}
          </span>
          <div className="w-6 h-6 rounded-full border-2 border-white/60 flex items-center justify-center">
            {isSelected && (
              <div className="w-2.5 h-2.5 rounded-full bg-white" />
            )}
          </div>
        </div>
        <div className="mt-6">
          <h2 className="text-2xl font-extrabold text-white">
            {lang.language}
          </h2>
          <p className="text-sm text-white/70 mt-1">{lang.tagline}</p>
        </div>
      </div>

      <div className="p-5 space-y-4 bg-white">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
            Strengths
          </p>
          <div className="flex flex-wrap gap-1.5">
            {lang.strengths.map((s) => (
              <span
                key={s}
                className={`text-xs px-2.5 py-1 rounded-full border ${lang.color.background} ${lang.color.main}`}
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
            Challenges
          </p>
          <div className="flex flex-wrap gap-1.5">
            {lang.challenges.map((c) => (
              <span
                key={c}
                className="text-xs px-2.5 py-1 rounded-full border border-slate-200 text-slate-500"
              >
                {c}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
            Use Cases
          </p>
          <ul className="space-y-1">
            {lang.useCases.map((u) => (
              <li
                key={u}
                className="flex items-center gap-2 text-sm text-slate-600"
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${lang.color.main}`}
                />
                {u}
              </li>
            ))}
          </ul>
        </div>

        <button
          type="button"
          onClick={onSelect}
          className={`w-full mt-2 h-11 rounded-xl text-white text-sm font-semibold transition-colors ${lang.color.main}`}
        >
          {isSelected ? '✓ Selected' : `Select ${lang.language}`}
        </button>
      </div>
    </div>
  );
}

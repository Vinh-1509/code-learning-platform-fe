import { Button } from '@/components/ui/button';
import type { LanguageOption } from '@/types/languageSelection';

interface LanguageCardProps {
  lang: LanguageOption;
  isSelected: boolean;
  onSelect: () => void;
}

/**
 * LanguageCard displays key information for a single language option (e.g. C++ or Java).
 * Demonstrates specialized Figma colors (purple-cpp / orange-jv) for tags, badges, buttons and selected borders.
 *
 * @param {LanguageCardProps} props - The component properties.
 * @param {LanguageOption} props.lang - The language data object (id, tagline, strengths, challenges, etc.).
 * @param {boolean} props.isSelected - Indicates if this language is currently active/selected.
 * @param {Function} props.onSelect - Callback function triggered when card is clicked.
 * @returns {JSX.Element} The rendered LanguageCard component.
 */
export function LanguageCard({
  lang,
  isSelected,
  onSelect,
}: LanguageCardProps) {
  const isCpp = lang.language === 'C++';

  const theme = isCpp
    ? {
        headerBg: 'bg-purple-cpp',
        badgeBg: 'bg-purple-jv-background',
        badgeText: 'text-purple-cpp',
        badgeBorder: 'border-purple-cpp/20',
        bulletBg: 'bg-purple-cpp',
        buttonBg: 'bg-purple-cpp hover:bg-purple-cpp/90 text-white',
        selectedBorder:
          'border-purple-cpp ring-2 ring-purple-cpp ring-offset-2',
        unselectedBorder: 'border-slate-200 hover:border-purple-cpp/30',
      }
    : {
        headerBg: 'bg-orange-jv',
        badgeBg: 'bg-orange-jv-background',
        badgeText: 'text-orange-jv',
        badgeBorder: 'border-orange-jv/20',
        bulletBg: 'bg-orange-jv',
        buttonBg: 'bg-orange-jv hover:bg-orange-jv/90 text-white',
        selectedBorder: 'border-orange-jv ring-2 ring-orange-jv ring-offset-2',
        unselectedBorder: 'border-slate-200 hover:border-orange-jv/30',
      };

  const borderClass = isSelected
    ? theme.selectedBorder
    : theme.unselectedBorder;

  return (
    <div
      onClick={onSelect}
      className={`flex-1 rounded-2xl overflow-hidden border shadow-sm transition-all duration-300 cursor-pointer ${borderClass}`}
    >
      <div className={`${theme.headerBg} p-6 relative`}>
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

      <div
        className="p-5 space-y-4 bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
            Strengths
          </p>
          <div className="flex flex-wrap gap-1.5">
            {lang.strengths.map((s) => (
              <span
                key={s}
                className={`text-xs px-2.5 py-1 rounded-full border ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}
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
                className="text-xs px-2.5 py-1 rounded-full border border-slate-200 text-slate-500 bg-slate-50/50"
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
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${theme.bulletBg}`}
                />
                {u}
              </li>
            ))}
          </ul>
        </div>

        <Button
          type="button"
          onClick={onSelect}
          className={`w-full mt-2 h-11 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md ${theme.buttonBg}`}
        >
          {isSelected ? '✓ Selected' : `Select ${lang.language}`}
        </Button>
      </div>
    </div>
  );
}

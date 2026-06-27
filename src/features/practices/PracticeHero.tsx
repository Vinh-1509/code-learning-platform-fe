import { Link } from '@tanstack/react-router';
import { Play, AlertTriangle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Exercise } from '@/types/api/exercise.types';

// Định nghĩa màu sắc đồng bộ hoàn toàn với bộ màu của ExerciseCard ở dưới
const difficultyStyles: Record<string, string> = {
  easy: 'text-green-700 bg-green-50 border border-green-200',
  medium: 'text-amber-700 bg-amber-50 border border-amber-200',
  hard: 'text-red-700 bg-red-50 border border-red-200',
};

interface PracticeHeroProps {
  exercise: Exercise | null;
  isWeak?: boolean;
}

export function PracticeHero({ exercise, isWeak = false }: PracticeHeroProps) {
  if (!exercise) return null;

  const { title, instruction, level, _id } = exercise;
  const levelStyle = difficultyStyles[level] ?? 'bg-slate-50 text-slate-600';

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card to-muted/30 p-6 sm:p-8 shadow-sm">
      {/* Background Glow hiệu ứng nhẹ nhàng, tinh tế */}
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:items-center">
        {/* Cột trái & giữa: Content Area */}
        <div className="space-y-4 md:col-span-2 text-left">
          <div className="flex flex-wrap items-center gap-2">
            {/* Tag đặc trưng dựa trên loại đề xuất */}
            {isWeak ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 border border-amber-200 animate-pulse">
                <AlertTriangle className="size-3.5" />
                Weakness-Based Recommendation
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary border border-primary/20">
                <Sparkles className="size-3.5" />
                Daily Core Challenge
              </span>
            )}

            {/* Độ khó đồng bộ 100% với Card bên dưới */}
            <span
              className={cn(
                'rounded-md px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider',
                levelStyle
              )}
            >
              {level}
            </span>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
              {title}
            </h2>
            <p className="max-w-2xl text-sm text-muted-foreground leading-relaxed">
              {instruction}
            </p>
          </div>

          {/* CTA Button: Nút vào học to rõ ràng, giải quyết triệt để lỗi trống trải */}
          <div className="pt-2">
            <Link
              to="/practice-dedicated/$exerciseId"
              params={{ exerciseId: _id }}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow transition-all hover:bg-primary/90 hover:shadow-md active:scale-98"
            >
              <Play className="size-4 fill-current" />
              Start Practice Now
            </Link>
          </div>
        </div>

        {/* Cột phải: Vùng Graphic trừu tượng giúp cân bằng layout thị giác */}
        <div className="hidden md:flex items-center justify-center border-l border-border/60 pl-6 h-full select-none">
          <div className="w-full max-w-[240px] space-y-2 font-mono text-[11px] text-muted-foreground/40 leading-normal">
            <p className="text-primary/30">
              // Target Concept Optimization Framework
            </p>
            <p>
              <span className="text-blue-500/40">const</span> analytics ={' '}
              <span className="text-yellow-500/40">useWeaknessAnalysis</span>();
            </p>
            <p>
              <span className="text-purple-500/40">if</span> (analytics.hasGaps)
              &#123;
            </p>
            <p className="pl-4">
              prioritize(<span className="text-emerald-500/40">"{title}"</span>
              );
            </p>
            <p>&#125;</p>
          </div>
        </div>
      </div>
    </div>
  );
}

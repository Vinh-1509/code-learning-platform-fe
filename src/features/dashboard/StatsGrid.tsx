import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Target } from 'lucide-react';

interface StatCardProps {
  icon: React.ReactNode;
  value: number;
  label: string;
}

/**
 * StatCard displays an individual metric block (such as lessons learned or problems solved) with an icon, numeric value, and descriptive label.
 *
 * @param {StatCardProps} props - The component properties.
 * @param {React.ReactNode} props.icon - The Lucide icon or node to render.
 * @param {number} props.value - The numerical state value to display.
 * @param {string} props.label - Label describing the stat block.
 * @returns {JSX.Element} The rendered StatCard.
 */
function StatCard({ icon, value, label }: StatCardProps) {
  return (
    <Card className="bg-card border border-border/85 shadow-sm rounded-2xl transition-all duration-300 ease-in-out hover:shadow-md hover:border-primary/40">
      <CardContent className="p-4 sm:p-6 flex flex-col items-center justify-center text-center">
        <div className="text-primary mb-2.5 shrink-0 size-6 sm:size-7 flex items-center justify-center">
          {icon}
        </div>
        <span className="text-2xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">
          {value}
        </span>
        <span className="text-[11px] sm:text-sm text-slate-500 font-bold mt-1.5 leading-normal">
          {label}
        </span>
      </CardContent>
    </Card>
  );
}

interface StatsGridProps {
  lessonsLearned: number;
  problemsSolved: number;
}

/**
 * StatsGrid organizes and renders the active layout grid containing StatCard metrics.
 *
 * @param {StatsGridProps} props - The component properties.
 * @param {number} props.lessonsLearned - The total number of completed lessons.
 * @param {number} props.problemsSolved - The total number of exercises/problems resolved.
 * @returns {JSX.Element} The rendered StatsGrid.
 */
export function StatsGrid({ lessonsLearned, problemsSolved }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3.5 sm:gap-6">
      <StatCard
        icon={<CheckCircle2 className="size-5 sm:size-6 text-primary" />}
        value={lessonsLearned}
        label="Lessons Learned"
      />
      <StatCard
        icon={<Target className="size-5 sm:size-6 text-primary" />}
        value={problemsSolved}
        label="Problems Solved"
      />
    </div>
  );
}

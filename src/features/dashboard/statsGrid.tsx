import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Target } from 'lucide-react';

interface StatCardProps {
  icon: React.ReactNode;
  value: number;
  label: string;
}

function StatCard({ icon, value, label }: StatCardProps) {
  return (
    <Card className="bg-white border-2 border-primary shadow-sm rounded-xl transition-all duration-300 ease-in-out hover:shadow-md hover:border-primary/80">
      <CardContent className="p-6 flex flex-col items-center justify-center text-center">
        <div className="text-primary mb-2">{icon}</div>
        <span className="text-4xl font-semibold text-foreground">{value}</span>
        <span className="text-sm text-muted-foreground mt-1">{label}</span>
      </CardContent>
    </Card>
  );
}

interface StatsGridProps {
  lessonsLearned: number;
  problemsSolved: number;
}

export function StatsGrid({ lessonsLearned, problemsSolved }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <StatCard
        icon={<CheckCircle2 className="size-7" />}
        value={lessonsLearned}
        label="Lessons Learned"
      />
      <StatCard
        icon={<Target className="size-7" />}
        value={problemsSolved}
        label="Problems Solved"
      />
    </div>
  );
}

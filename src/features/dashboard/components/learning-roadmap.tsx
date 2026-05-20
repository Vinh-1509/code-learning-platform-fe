import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  Play,
  Lock,
  ChevronDown,
  ChevronUp,
  Map,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type LessonStatus = 'done' | 'current' | 'locked';

interface Lesson {
  id: string;
  name: string;
  status: LessonStatus;
}

interface Module {
  id: number;
  name: string;
  lessons: Lesson[];
}

const initialModules: Module[] = [
  {
    id: 1,
    name: 'Variables & Types',
    lessons: [
      { id: '1-1', name: 'Setting Up', status: 'done' },
      { id: '1-2', name: 'Loop', status: 'current' },
      { id: '1-3', name: 'Your First App', status: 'locked' },
    ],
  },
  {
    id: 2,
    name: 'Variables',
    lessons: [
      { id: '2-1', name: 'Variable Declaration', status: 'locked' },
      { id: '2-2', name: 'Data Types', status: 'locked' },
      { id: '2-3', name: 'Type Conversion', status: 'locked' },
    ],
  },
  {
    id: 3,
    name: 'Control Flow',
    lessons: [
      { id: '3-1', name: 'If Statements', status: 'locked' },
      { id: '3-2', name: 'Switch Cases', status: 'locked' },
    ],
  },
  {
    id: 4,
    name: 'Functions',
    lessons: [
      { id: '4-1', name: 'Function Basics', status: 'locked' },
      { id: '4-2', name: 'Parameters & Arguments', status: 'locked' },
      { id: '4-3', name: 'Return Values', status: 'locked' },
    ],
  },
];

function LessonIcon({ status }: { status: LessonStatus }) {
  switch (status) {
    case 'done':
      return <CheckCircle2 className="size-5 text-green-500" />;
    case 'current':
      return (
        <div className="size-5 rounded-full bg-primary flex items-center justify-center">
          <Play className="size-3 text-primary-foreground fill-primary-foreground ml-0.5" />
        </div>
      );
    case 'locked':
      return <Lock className="size-5 text-muted-foreground/50" />;
  }
}

interface LessonItemProps {
  lesson: Lesson;
  onComplete: () => void;
}

function LessonItem({ lesson, onComplete }: LessonItemProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between p-4 rounded-lg border-2 border-dashed transition-all',
        lesson.status === 'locked' && 'opacity-50 border-muted-foreground/30',
        lesson.status === 'current' && 'border-slate-200 bg-white',
        lesson.status === 'done' && 'border-muted-foreground/30'
      )}
    >
      <div className="flex items-center gap-3">
        <LessonIcon status={lesson.status} />
        <span
          className={cn(
            'text-sm font-medium',
            lesson.status === 'locked'
              ? 'text-muted-foreground'
              : 'text-foreground'
          )}
        >
          {lesson.name}
        </span>
      </div>
      {lesson.status === 'done' && (
        <span className="px-3 py-1 text-xs font-medium text-green-600 border border-green-200 bg-green-50 rounded-full">
          Done
        </span>
      )}
      {lesson.status === 'current' && (
        <Button
          size="sm"
          className="bg-primary hover:bg-primary/90 text-primary-foreground h-8 px-4"
          onClick={onComplete}
        >
          Start
        </Button>
      )}
      {lesson.status === 'locked' && (
        <span className="text-xs font-medium text-muted-foreground/50 tracking-wider">
          LOCKED
        </span>
      )}
    </div>
  );
}

interface ModuleItemProps {
  module: Module;
  isExpanded: boolean;
  onToggle: () => void;
  onLessonComplete: (lessonId: string) => void;
}

function ModuleItem({
  module,
  isExpanded,
  onToggle,
  onLessonComplete,
}: ModuleItemProps) {
  const completedLessons = module.lessons.filter(
    (l) => l.status === 'done'
  ).length;
  const hasCurrentLesson = module.lessons.some((l) => l.status === 'current');
  const allLocked = module.lessons.every((l) => l.status === 'locked');

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className={cn(
            'size-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 transition-colors',
            hasCurrentLesson || completedLessons > 0
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground border border-border'
          )}
        >
          {module.id}
        </div>
        {module.id < 4 && (
          <div
            className={cn(
              'w-0.5 flex-1 mt-2 transition-colors',
              completedLessons === module.lessons.length
                ? 'bg-primary'
                : 'bg-border'
            )}
          />
        )}
      </div>

      <div className="flex-1 pb-6">
        {isExpanded ? (
          <div
            className={cn(
              'border-2 rounded-xl p-4 transition-all duration-200',
              allLocked
                ? 'border-border bg-muted/30 shadow-sm'
                : 'border-primary/40 bg-primary/5 shadow-[0_4px_20px_rgba(59,130,246,0.12)] hover:shadow-[0_6px_24px_rgba(59,130,246,0.18)] hover:border-primary/60'
            )}
          >
            <button
              onClick={onToggle}
              className="w-full flex items-center justify-between mb-4 group"
            >
              <h4
                className={cn(
                  'text-base font-semibold',
                  allLocked ? 'text-muted-foreground' : 'text-primary'
                )}
              >
                Module {module.id}: {module.name}
              </h4>
              <ChevronUp className="size-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>
            <div className="space-y-3">
              {module.lessons.map((lesson) => (
                <LessonItem
                  key={lesson.id}
                  lesson={lesson}
                  onComplete={() => onLessonComplete(lesson.id)}
                />
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-border/50">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>Progress</span>
                <span>
                  {completedLessons}/{module.lessons.length} completed
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{
                    width: `${(completedLessons / module.lessons.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={onToggle}
            className={cn(
              'w-full flex items-center justify-between py-3 px-4 border-2 rounded-xl transition-all duration-200',
              allLocked
                ? 'border-border hover:bg-muted/50 hover:shadow-sm cursor-pointer'
                : 'border-primary/40 bg-primary/5 shadow-[0_2px_12px_rgba(59,130,246,0.08)] hover:shadow-[0_4px_16px_rgba(59,130,246,0.15)] hover:border-primary/60'
            )}
          >
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  'text-sm font-medium',
                  allLocked ? 'text-muted-foreground' : 'text-foreground'
                )}
              >
                {module.name}
              </span>
              {completedLessons > 0 && (
                <span className="text-xs text-muted-foreground">
                  ({completedLessons}/{module.lessons.length})
                </span>
              )}
            </div>
            <ChevronDown className="size-5 text-muted-foreground" />
          </button>
        )}
      </div>
    </div>
  );
}

export function LearningRoadmap() {
  const [modules, setModules] = useState(initialModules);
  const [expandedModules, setExpandedModules] = useState<number[]>([1]);

  const toggleModule = (moduleId: number) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleLessonComplete = (lessonId: string) => {
    setModules((prev) => {
      const newModules: Module[] = prev.map((module) => ({
        ...module,
        lessons: module.lessons.map((lesson) => ({ ...lesson })),
      }));

      for (let i = 0; i < newModules.length; i++) {
        for (let j = 0; j < newModules[i].lessons.length; j++) {
          if (
            newModules[i].lessons[j].id === lessonId &&
            newModules[i].lessons[j].status === 'current'
          ) {
            newModules[i].lessons[j].status = 'done';

            for (let mi = i; mi < newModules.length; mi++) {
              const startJ = mi === i ? j + 1 : 0;
              for (let mj = startJ; mj < newModules[mi].lessons.length; mj++) {
                if (newModules[mi].lessons[mj].status === 'locked') {
                  newModules[mi].lessons[mj].status = 'current';
                  if (!expandedModules.includes(newModules[mi].id)) {
                    setExpandedModules((exp) => [...exp, newModules[mi].id]);
                  }
                  return newModules;
                }
              }
            }
            return newModules;
          }
        }
      }
      return newModules;
    });
  };

  return (
    <Card className="bg-card border-2 border-primary/40 shadow-[0_4px_20px_rgba(59,130,246,0.08)]">
      <CardHeader className="p-6 pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Map className="size-5 text-primary" />
          Learning Roadmap
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-2">
        <div className="space-y-4">
          {modules.map((module) => (
            <ModuleItem
              key={module.id}
              module={module}
              isExpanded={expandedModules.includes(module.id)}
              onToggle={() => toggleModule(module.id)}
              onLessonComplete={handleLessonComplete}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

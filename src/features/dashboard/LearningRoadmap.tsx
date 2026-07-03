import {
  Map,
  CheckCircle2,
  Play,
  Lock,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Module, Lesson } from './useRoadmap';

/**
 * LessonIcon displays a visual state indicator (checkmark, play button, lock) based on the lesson's status.
 *
 * @param {Object} props - The component properties.
 * @param {string} props.status - The status of the lesson ('completed', 'active', or 'locked').
 * @returns {JSX.Element} The status icon.
 */
function LessonIcon({ status }: { status: string }) {
  if (status === 'completed')
    return (
      <CheckCircle2 className="size-5 text-success animate-in fade-in zoom-in duration-300" />
    );
  if (status === 'active')
    return (
      <div className="size-5 rounded-full bg-primary flex items-center justify-center shadow-sm shadow-primary/20">
        <Play className="size-3 text-white fill-white ml-0.5" />
      </div>
    );
  return <Lock className="size-5 text-muted-foreground/50" />;
}

interface LessonItemProps {
  lesson: Lesson;
  onStart: () => void;
}

/**
 * LessonItem renders a single lesson block row within a module.
 * Displays the lesson name, status icon, and an action button (Start/Continue) if unlocked.
 *
 * @param {LessonItemProps} props - The component properties.
 * @param {Lesson} props.lesson - The lesson metadata.
 * @param {Function} props.onStart - Callback function to initiate or resume the lesson.
 * @returns {JSX.Element} The rendered LessonItem.
 */
function LessonItem({ lesson, onStart }: LessonItemProps) {
  return (
    <div
      onClick={lesson.status !== 'locked' ? onStart : undefined}
      className={cn(
        'flex items-center gap-2.5 sm:gap-3 p-3 sm:p-4 border rounded-xl transition-all duration-200',
        lesson.status === 'completed'
          ? 'bg-green-mint/20 border-green-mint/40 hover:bg-green-mint/30 hover:border-green-mint/60 hover:scale-[1.01] hover:shadow-sm active:scale-[0.995] cursor-pointer'
          : lesson.status === 'active'
            ? 'bg-primary-second/20 border-primary-second-border/40 shadow-sm hover:bg-primary-second/35 hover:border-primary-second-border/60 hover:scale-[1.01] hover:shadow-md active:scale-[0.995] cursor-pointer'
            : 'bg-muted/40 border-border/60 opacity-80'
      )}
    >
      <LessonIcon status={lesson.status} />
      <span
        className={cn(
          'text-xs sm:text-sm font-semibold tracking-tight',
          lesson.status === 'locked' ? 'text-slate-400' : 'text-slate-700'
        )}
      >
        {lesson.name}
      </span>
    </div>
  );
}

interface ModuleItemProps {
  module: Module;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onLessonStart: (lessonId: string) => void;
  isLast: boolean;
}

/**
 * ModuleItem represents an expandable milestone/module container.
 * Displays the module title, progress bar, status, and nesting list of child lessons.
 *
 * @param {ModuleItemProps} props - The component properties.
 * @param {Module} props.module - The module data structure containing lessons and completion status.
 * @param {number} props.index - The numerical order of the module.
 * @param {boolean} props.isExpanded - Toggle state indicating if nested lessons are visible.
 * @param {Function} props.onToggle - Callback to toggle expansion state.
 * @param {Function} props.onLessonStart - Callback to start a nested lesson.
 * @param {boolean} props.isLast - Check if this is the final module to adjust timeline connection lines.
 * @returns {JSX.Element} The rendered ModuleItem.
 */
function ModuleItem({
  module,
  index,
  isExpanded,
  onToggle,
  onLessonStart,
  isLast,
}: ModuleItemProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="text-[9px] sm:text-[10px] uppercase font-bold text-green-foreground bg-green-mint px-2 py-0.5 rounded-full border border-green-mint/30 shrink-0">
            Done
          </span>
        );
      case 'active':
        return (
          <span className="text-[9px] sm:text-[10px] uppercase font-bold text-primary bg-primary-second px-2 py-0.5 rounded-full border border-primary-second-border/30 shrink-0">
            Active
          </span>
        );
      case 'locked':
      default:
        return (
          <span className="text-[9px] sm:text-[10px] uppercase font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border/30 shrink-0">
            Locked
          </span>
        );
    }
  };

  const lessonItems = module.lessons.map((l: Lesson) => (
    <LessonItem key={l.id} lesson={l} onStart={() => onLessonStart(l.id)} />
  ));

  return (
    <div className="flex gap-3 sm:gap-4">
      <div className="flex flex-col items-center w-8 sm:w-9 shrink-0">
        <div
          className={cn(
            'size-8 sm:size-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-300',
            module.status === 'completed'
              ? 'bg-success text-white shadow-sm shadow-success/10'
              : module.status === 'active'
                ? 'bg-primary text-white shadow-sm shadow-primary/10'
                : 'bg-muted text-muted-foreground'
          )}
        >
          {index}
        </div>
        {(!isLast || isExpanded) && (
          <div
            className={cn(
              'w-0.5 flex-1 mt-2 transition-colors duration-300',
              module.status === 'completed' ? 'bg-success/50' : 'bg-border'
            )}
          />
        )}
      </div>

      <div className="flex-1 pb-5 sm:pb-6 min-w-0">
        <Button
          variant="ghost"
          onClick={onToggle}
          className={cn(
            'w-full flex items-center justify-between p-3.5 sm:p-4 border rounded-xl text-left transition-all h-auto text-foreground shadow-sm font-normal cursor-pointer hover:shadow-md duration-200 whitespace-normal',
            module.status === 'active'
              ? 'bg-primary-second/30 border-primary-second-border hover:bg-primary-second/50'
              : module.status === 'completed'
                ? 'bg-card border-border hover:bg-muted/50'
                : 'bg-muted/50 border-border/50 hover:bg-muted/30 opacity-70'
          )}
        >
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 min-w-0 mr-2">
            <span className="font-extrabold text-sm sm:text-base text-slate-800 tracking-tight">
              {module.name}
            </span>
            {getStatusBadge(module.status)}
          </div>
          {isExpanded ? (
            <ChevronUp className="text-muted-foreground shrink-0 size-4 sm:size-5" />
          ) : (
            <ChevronDown className="text-muted-foreground shrink-0 size-4 sm:size-5" />
          )}
        </Button>

        {isExpanded && (
          <div className="mt-3.5 sm:mt-4 space-y-2.5 sm:space-y-3 animate-in slide-in-from-top-2 duration-200">
            {lessonItems}
            <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-3.5 sm:mt-4 border border-border/60">
              <div
                className={cn(
                  'h-full transition-all duration-500',
                  module.status === 'completed' ? 'bg-success' : 'bg-primary'
                )}
                style={{ width: `${module.progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface LearningRoadmapProps {
  modules: Module[];
  expandedModules: string[];
  toggleModule: (id: string) => void;
  handleStartLesson: (lessonId: string) => void;
  loading: boolean;
  className?: string;
}

/**
 * LearningRoadmap renders the entire curriculum structure.
 * Consists of sequentially ordered modules/milestones, handling loading states and rendering child ModuleItems.
 *
 * @param {LearningRoadmapProps} props - The component properties.
 * @param {Module[]} props.modules - List of modules loaded from the API.
 * @param {string[]} props.expandedModules - IDs of modules that are currently expanded.
 * @param {Function} props.toggleModule - Callback to toggle expansion of a specific module.
 * @param {Function} props.handleStartLesson - Callback triggered when clicking start/continue on any lesson.
 * @param {boolean} props.loading - Loading state indicator.
 * @param {string} props.className - Custom styling class names.
 * @returns {JSX.Element} The rendered LearningRoadmap dashboard view.
 */
export function LearningRoadmap({
  modules,
  expandedModules,
  toggleModule,
  handleStartLesson,
  loading,
  className,
}: LearningRoadmapProps) {
  const loadingContent = <div>Loading...</div>;

  if (loading) return loadingContent;

  const moduleItems = modules.map((m, i) => (
    <ModuleItem
      key={m.id}
      index={i + 1}
      module={m}
      isExpanded={expandedModules.includes(m.id)}
      onToggle={() => toggleModule(m.id)}
      onLessonStart={handleStartLesson}
      isLast={i === modules.length - 1}
    />
  ));

  return (
    <Card
      data-tour="learning-roadmap"
      className={cn(
        'bg-card border border-border shadow-md p-4 sm:p-6 rounded-2xl',
        className
      )}
    >
      <CardContent className="p-0">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-primary-second text-primary shadow-sm">
            <Map className="size-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Learning Roadmap
            </h2>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              Follow your custom path to coding mastery
            </p>
          </div>
        </div>
        <div className="space-y-1">{moduleItems}</div>
      </CardContent>
    </Card>
  );
}

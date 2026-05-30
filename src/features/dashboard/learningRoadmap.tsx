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
    return <CheckCircle2 className="size-5 text-green-500" />;
  if (status === 'active')
    return (
      <div className="size-5 rounded-full bg-blue-500 flex items-center justify-center">
        <Play className="size-3 text-white fill-white ml-0.5" />
      </div>
    );
  return <Lock className="size-5 text-slate-400/50" />;
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
  const showStartButton = lesson.status !== 'locked';
  const startButtonLabel = lesson.status === 'completed' ? 'Continue' : 'Start';
  console.log(lesson.status);

  const startButton = showStartButton ? (
    <Button
      type="button"
      onClick={onStart}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 h-7 text-xs rounded-md shadow-sm font-semibold"
    >
      {startButtonLabel}
    </Button>
  ) : null;

  return (
    <div className="flex items-center justify-between p-4 border-2 border-dashed rounded-lg">
      <div className="flex items-center gap-3">
        <LessonIcon status={lesson.status} />
        <span
          className={cn(
            'text-sm font-medium',
            lesson.status === 'locked' ? 'text-slate-400' : 'text-slate-900'
          )}
        >
          {lesson.name}
        </span>
      </div>
      {startButton}
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
          <span className="text-[10px] uppercase font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
            Done
          </span>
        );
      case 'active':
        return (
          <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
            Active
          </span>
        );
      case 'locked':
      default:
        return (
          <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            Locked
          </span>
        );
    }
  };

  const lessonItems = module.lessons.map((l: Lesson) => (
    <LessonItem key={l.id} lesson={l} onStart={() => onLessonStart(l.id)} />
  ));

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className={cn(
            'size-9 rounded-full flex items-center justify-center text-sm font-semibold text-white',
            module.status === 'Completed' ? 'bg-green-500' : 'bg-blue-500'
          )}
        >
          {index}
        </div>
        {(!isLast || isExpanded) && (
          <div className="w-0.5 flex-1 mt-2 bg-slate-200" />
        )}
      </div>

      <div className="flex-1 pb-6">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between p-4 border-2 rounded-xl bg-white text-left hover:border-blue-200 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-800">{module.name}</span>
            {getStatusBadge(module.status)}
          </div>
          {isExpanded ? (
            <ChevronUp className="text-slate-500" />
          ) : (
            <ChevronDown className="text-slate-500" />
          )}
        </button>

        {isExpanded && (
          <div className="mt-4 space-y-3">
            {lessonItems}
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-4 border border-slate-200">
              <div
                className={cn(
                  'h-full transition-all',
                  module.status === 'Completed' ? 'bg-green-500' : 'bg-blue-500'
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
 * @returns {JSX.Element} The rendered LearningRoadmap dashboard view.
 */
export function LearningRoadmap({
  modules,
  expandedModules,
  toggleModule,
  handleStartLesson,
  loading,
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
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6 font-bold text-lg">
        <Map /> Learning Roadmap
      </div>
      {moduleItems}
    </div>
  );
}

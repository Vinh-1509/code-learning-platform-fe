import {
  Map,
  CheckCircle2,
  Play,
  Lock,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from '@tanstack/react-router';
import { useRoadmap } from './useRoadmap';

// ✅ ĐỊNH NGHĨA TYPE CHUẨN ĐỂ DIỆT SẠCH LỖI ANY
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

// --- COMPONENT CON 1: ICON BÀI HỌC ---
function LessonIcon({ status }: { status: LessonStatus }) {
  switch (status) {
    case 'done':
      return <CheckCircle2 className="size-5 text-green-500" />;
    case 'current':
      return (
        <div className="size-5 rounded-full bg-[#3b82f6] flex items-center justify-center">
          <Play className="size-3 text-white fill-white ml-0.5" />
        </div>
      );
    case 'locked':
      return <Lock className="size-5 text-slate-400/50" />;
  }
}

// --- COMPONENT CON 2: TỪNG DÒNG BÀI HỌC ---
function LessonItem({
  lesson,
  onComplete,
}: {
  lesson: Lesson;
  onComplete: () => void;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between p-4 rounded-lg border-2 border-dashed transition-all',
        lesson.status === 'locked' && 'opacity-50 border-slate-300',
        lesson.status === 'current' && 'border-slate-200 bg-white',
        lesson.status === 'done' && 'border-slate-300'
      )}
    >
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
      {lesson.status === 'done' && (
        <span className="px-3 py-1 text-xs font-medium text-green-600 border border-green-200 bg-green-50 rounded-full">
          Done
        </span>
      )}
      {lesson.status === 'current' && (
        <Link to="/lesson">
          <button
            className="bg-[#3b82f6] hover:bg-[#2563eb] text-white h-8 px-4 text-xs font-semibold rounded-md transition-colors"
            onClick={onComplete}
          >
            Start
          </button>
        </Link>
      )}
      {lesson.status === 'locked' && (
        <span className="text-xs font-medium text-slate-400 tracking-wider">
          LOCKED
        </span>
      )}
    </div>
  );
}

// --- COMPONENT CON 3: KHỐI MODULE ---
function ModuleItem({
  module,
  isExpanded,
  onToggle,
  onLessonComplete,
}: {
  module: Module;
  isExpanded: boolean;
  onToggle: () => void;
  onLessonComplete: (id: string) => void;
}) {
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
              ? 'bg-[#3b82f6] text-white'
              : 'bg-slate-100 text-slate-500 border border-slate-200'
          )}
        >
          {module.id}
        </div>
        {module.id < 4 && (
          <div
            className={cn(
              'w-0.5 flex-1 mt-2 transition-colors',
              completedLessons === module.lessons.length
                ? 'bg-[#3b82f6]'
                : 'bg-slate-200'
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
                ? 'border-slate-200 bg-slate-50/30 shadow-sm'
                : 'border-blue-500/40 bg-blue-50/5 shadow-[0_4px_20px_rgba(59,130,246,0.12)] hover:shadow-[0_6px_24px_rgba(59,130,246,0.18)] hover:border-blue-500/60'
            )}
          >
            <button
              onClick={onToggle}
              className="w-full flex items-center justify-between mb-4 group text-left"
            >
              <h4
                className={cn(
                  'text-base font-semibold',
                  allLocked ? 'text-slate-400' : 'text-[#3b82f6]'
                )}
              >
                Module {module.id}: {module.name}
              </h4>
              <ChevronUp className="size-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
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
            <div className="mt-4 pt-3 border-t border-slate-200/50">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span>Progress</span>
                <span>
                  {completedLessons}/{module.lessons.length} completed
                </span>
              </div>
              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#3b82f6] rounded-full transition-all duration-500"
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
              'w-full flex items-center justify-between py-3 px-4 border-2 rounded-xl transition-all duration-200 text-left',
              allLocked
                ? 'border-slate-200 hover:bg-slate-50 hover:shadow-sm cursor-pointer'
                : 'border-blue-500/40 bg-blue-50/5 shadow-[0_2px_12px_rgba(59,130,246,0.08)] hover:shadow-[0_4px_16px_rgba(59,130,246,0.15)] hover:border-blue-500/60'
            )}
          >
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  'text-sm font-medium',
                  allLocked ? 'text-slate-400' : 'text-slate-900'
                )}
              >
                {module.name}
              </span>
              {completedLessons > 0 && (
                <span className="text-xs text-slate-500">
                  ({completedLessons}/{module.lessons.length})
                </span>
              )}
            </div>
            <ChevronDown className="size-5 text-slate-400" />
          </button>
        )}
      </div>
    </div>
  );
}

// --- COMPONENT CHÍNH ---
export function LearningRoadmap() {
  const { modules, expandedModules, toggleModule, handleLessonComplete } =
    useRoadmap();

  return (
    <div className="bg-white border-2 border-blue-500/40 shadow-[0_4px_20px_rgba(59,130,246,0.08)] rounded-xl p-6">
      <div className="flex items-center gap-2 text-lg font-semibold text-slate-900 mb-4">
        <Map className="size-5 text-[#3b82f6]" /> Learning Roadmap
      </div>
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
    </div>
  );
}

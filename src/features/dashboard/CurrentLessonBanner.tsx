import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface CurrentLessonBannerProps {
  lessonId: string;
  lessonName: string;
  moduleName: string;
  progress: number;
  onStartLesson: (lessonId: string) => void;
}

/**
 * CurrentLessonBanner displays a prominent card representing the user's active/in-progress lesson.
 * Includes lesson details (title, module), a progress bar, navigation arrows, and a button to resume.
 *
 * @param {CurrentLessonBannerProps} props - The component properties.
 * @param {string} props.lessonId - Unique ID of the current lesson.
 * @param {string} props.lessonName - Name/title of the current lesson.
 * @param {string} props.moduleName - Name of the parent module this lesson belongs to.
 * @param {number} props.progress - Numeric percentage (0-100) indicating current completion progress.
 * @param {Function} props.onStartLesson - Callback to redirect or launch the lesson content.
 * @returns {JSX.Element} The rendered CurrentLessonBanner card component.
 */
export function CurrentLessonBanner({
  lessonId,
  lessonName,
  moduleName,
  progress,
  onStartLesson,
}: CurrentLessonBannerProps) {
  const handleContinue = () => {
    onStartLesson(lessonId);
  };

  return (
    <Card
      onClick={handleContinue}
      className="bg-card border border-border/80 shadow-sm rounded-2xl transition-all duration-300 ease-in-out hover:bg-muted/30 hover:shadow-md hover:scale-[1.008] hover:border-border cursor-pointer"
    >
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary-second text-primary text-[10px] uppercase font-bold tracking-wider mb-2 border border-primary-second-border/20">
              In progress
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight truncate sm:whitespace-normal">
              {lessonName}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-1 truncate sm:whitespace-normal">
              {moduleName}
            </p>
          </div>
        </div>
        <div className="mt-5">
          <Progress value={progress} className="h-2.5" />
          <div className="flex items-center justify-between mt-4 gap-2">
            <span className="text-xs sm:text-sm text-slate-600 font-bold">
              {progress.toFixed(0)}% Completed
            </span>
            <span className="text-xs sm:text-sm font-bold text-primary hover:underline flex items-center gap-1 transition-all duration-200">
              Click here to continue &rarr;
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

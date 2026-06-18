import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
    <Card className="bg-card drop-shadow-lg border border-border shadow-sm transition-all duration-300 ease-in-out hover:bg-muted/40 hover:shadow-lg hover:scale-[1.01] hover:border-border/80 cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary-second text-primary text-xs font-medium mb-3">
              In progress
            </span>
            <h2 className="text-2xl font-bold text-foreground">{lessonName}</h2>
            <p className="text-sm text-muted-foreground mt-1">{moduleName}</p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="size-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="size-5" />
            </Button>
          </div>
        </div>
        <div className="mt-6">
          <Progress value={progress} className="h-2.5" />
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-muted-foreground">
              {progress.toFixed(0)}% Completed
            </span>
            <Button
              type="button"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={handleContinue}
            >
              Continue lesson
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

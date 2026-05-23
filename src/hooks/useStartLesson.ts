import { useNavigate } from '@tanstack/react-router';

export function useStartLesson(): (lessonId: string) => void {
  const navigate = useNavigate();

  return (lessonId: string) => {
    void navigate({ to: '/lesson', search: { lessonId } });
  };
}

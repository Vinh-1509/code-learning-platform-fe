import { useState, useEffect } from 'react';
import { fetchMilestones, fetchLessonsByMilestone } from '../../lib/axios';
import type { MilestoneResponse, LessonResponse } from '../../lib/axios';
import { useStartLesson } from '@/features/dashboard/useStartLesson';

export type LessonStatus = 'done' | 'current' | 'locked';

export interface Lesson {
  id: string;
  name: string;
  status: LessonStatus;
}

export interface Module {
  id: string;
  name: string;
  status: string;
  progress: number;
  lessons: Lesson[];
}

export interface CurrentLessonInfo {
  lessonId: string;
  lessonName: string;
  moduleName: string;
  progress: number;
}

export function getCurrentLesson(modules: Module[]): CurrentLessonInfo | null {
  for (const module of modules) {
    const currentLesson = module.lessons.find((l) => l.status === 'current');
    if (currentLesson) {
      return {
        lessonId: currentLesson.id,
        lessonName: currentLesson.name,
        moduleName: module.name,
        progress: module.progress,
      };
    }
  }
  return null;
}

export function useRoadmap() {
  const [modules, setModules] = useState<Module[]>([]);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const startLesson = useStartLesson();

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const milestones = await fetchMilestones();

        if (!Array.isArray(milestones)) {
          console.error('Backend trả về KHÔNG PHẢI MẢNG:', milestones);
          return;
        }

        const data: Module[] = await Promise.all(
          milestones.map(async (m: MilestoneResponse) => {
            const lessons = await fetchLessonsByMilestone(m._id);
            const lessonList = Array.isArray(lessons) ? lessons : [];

            return {
              id: m._id,
              name: m.title,
              status: m.progress.status,
              progress: m.progress.completionPercentage,
              lessons: lessonList.map((l: LessonResponse) => ({
                id: l._id,
                name: l.title,
                status: l.status,
              })),
            };
          })
        );

        setModules(
          data.sort((a: Module, b: Module) => a.id.localeCompare(b.id))
        );
      } catch (error) {
        console.error('Lỗi:', error);
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, []);

  const toggleModule = (id: string) => {
    setExpandedModules((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleStartLesson = (lessonId: string) => {
    startLesson(lessonId);
  };

  const currentLesson = getCurrentLesson(modules);

  return {
    modules,
    expandedModules,
    toggleModule,
    handleStartLesson,
    currentLesson,
    loading,
  };
}

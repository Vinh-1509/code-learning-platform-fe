import { useState, useEffect } from 'react';
import {
  fetchMilestones,
  fetchLessonsByMilestone,
} from '@/features/dashboard/api/dashboard.api';
import type {
  MilestoneResponse,
  LessonResponse,
} from '@/types/api/learning.types';
import { useStartLesson } from '@/features/dashboard/useStartLesson';

export type LessonStatus = 'active' | 'completed' | 'locked';
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

/**
 * getCurrentLesson searches through the course curriculum modules to find the first in-progress/active lesson.
 * Used to display the shortcut resume banner on the dashboard.
 *
 * @param {Module[]} modules - List of modules containing lesson items.
 * @returns {CurrentLessonInfo | null} Information about the current active lesson, or null if none is in progress.
 */
export function getCurrentLesson(modules: Module[]): CurrentLessonInfo | null {
  for (const module of modules) {
    const currentLesson = module.lessons.find((l) => l.status === 'active');
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

/**
 * useRoadmap is a custom React hook that manages data fetching and expansion state for the dashboard learning roadmap.
 * Handles fetching milestones and their lessons from the API and sorting them to construct modules.
 *
 * @returns {Object} State and handler functions:
 *   - modules: Array of sorted module data structures.
 *   - expandedModules: List of expanded module IDs.
 *   - toggleModule: Function to toggle a module's accordion expansion state.
 *   - handleStartLesson: Callback trigger when starting/resuming a lesson.
 *   - currentLesson: Shortcut info of the user's active lesson.
 *   - loading: Boolean indicating if fetch queries are active.
 */
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

        const data: Module[] = await Promise.all(
          milestones.map(async (m: MilestoneResponse) => {
            const lessons = await fetchLessonsByMilestone(m._id);

            return {
              id: m._id,
              name: m.title,
              status: m.progress.status,
              progress: m.progress.completionPercentage,
              lessons: lessons.map((l: LessonResponse) => ({
                id: l._id,
                name: l.title,
                status: l.progress.status,
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

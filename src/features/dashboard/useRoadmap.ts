import { useState } from 'react';

// 1. Định nghĩa kiểu dữ liệu (Types)
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

// 2. Dữ liệu Mock ban đầu
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

// 3. Khai báo Custom Hook chứa toàn bộ logic nhấn nút & trạng thái
export function useRoadmap() {
  const [modules, setModules] = useState<Module[]>(initialModules);
  const [expandedModules, setExpandedModules] = useState<number[]>([1]);

  // Logic Đóng / Mở Module
  const toggleModule = (moduleId: number) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  // Logic Bấm nút hoàn thành bài học và tự động mở khóa bài tiếp theo
  const handleLessonComplete = (lessonId: string) => {
    setModules((prev) => {
      const newModules: Module[] = prev.map((m) => ({
        ...m,
        lessons: m.lessons.map((l) => ({ ...l })),
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

  return {
    modules,
    expandedModules,
    toggleModule,
    handleLessonComplete,
  };
}

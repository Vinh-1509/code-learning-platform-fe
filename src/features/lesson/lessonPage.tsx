import { getRouteApi } from '@tanstack/react-router';
import { usePractice } from './usePractice';
import { LessonSidebar } from './lessonSidebar';
import { TheoryPane } from './theoryPanel';
import { useState } from 'react';
import type { Block } from '@/lib/axios';
import { PracticePanel } from '@/features/practice/practicePanel';
import type {
  FillBlankExercise,
  DragDropExercise,
} from '@/features/practice/types';
import { cn } from '@/lib/utils';
import Navbar from '@/components/sidebar/Navbar';

const lessonRouteApi = getRouteApi('/lesson/$lessonId');

export function LessonPage() {
  const { lessonId } = lessonRouteApi.useParams();
  const { currentLesson } = usePractice({ lessonId });
  const [exerciseType, setExerciseType] = useState<'dragdrop' | 'fillinblank'>(
    'dragdrop'
  );

  // Dummy Drag & Drop Exercise
  const dragDropExercise: DragDropExercise = {
    type: 'dragdrop',
    description: 'Task: Arrange the blocks to print numbers 0, 1, 2',
    blocks: [
      { id: '1', code: 'for i in range(3):', indent: 0 },
      { id: '2', code: 'print(i)', indent: 1 },
      { id: '3', code: '# → 0, 1, 2', indent: 1 },
    ],
    answer: [null, null, null],
  };

  // Dummy Fill in the Blank Exercise with improved UI
  const fillBlankExercise: FillBlankExercise = {
    type: 'fillblank',
    description: 'Task: Fill in the missing code snippets',
    lines: [
      {
        id: '1',
        indent: 0,
        parts: [
          { id: 'p1', text: 'int', isBlank: false },
          { id: 'p2', text: ' ', isBlank: false },
          { id: 'p3', text: 'romanToInt', isBlank: false },
          { id: 'p4', text: '(std::string s) {', isBlank: false },
        ],
      },
      {
        id: '2',
        indent: 2,
        parts: [
          {
            id: 'p5',
            text: 'std::unordered_map<char, int> roman_to_int = {',
            isBlank: false,
          },
        ],
      },
      {
        id: '3',
        indent: 4,
        parts: [
          { id: 'p6', text: "{'I', 1}, {'V', 5}, {'X', 10},", isBlank: false },
        ],
      },
      {
        id: '4',
        indent: 4,
        parts: [
          {
            id: 'p7',
            text: "{'L', 50}, {'C', 100}, {'D', 500},",
            isBlank: false,
          },
        ],
      },
      {
        id: '5',
        indent: 4,
        parts: [{ id: 'p8', text: "{'M', 1000}", isBlank: false }],
      },
      {
        id: '6',
        indent: 2,
        parts: [{ id: 'p9', text: '};', isBlank: false }],
      },
      {
        id: '7',
        indent: 2,
        parts: [
          { id: 'p10', text: 'int result = ', isBlank: false },
          { id: 'p11', text: '', isBlank: true, answer: '0' },
          { id: 'p12', text: ';', isBlank: false },
        ],
      },
      {
        id: '8',
        indent: 2,
        parts: [
          {
            id: 'p13',
            text: 'for (int i = 0; i < s.length(); i++) {',
            isBlank: false,
          },
        ],
      },
      {
        id: '9',
        indent: 4,
        parts: [
          { id: 'p14', text: 'if (i + 1 < s.length() &&', isBlank: false },
        ],
      },
      {
        id: '10',
        indent: 8,
        parts: [
          {
            id: 'p15',
            text: 'roman_to_int[s[i]] < roman_to_int[s[i+1]]) {',
            isBlank: false,
          },
        ],
      },
      {
        id: '11',
        indent: 6,
        parts: [
          { id: 'p16', text: 'result -= roman_to_int[', isBlank: false },
          { id: 'p17', text: '', isBlank: true, answer: 's[i]' },
          { id: 'p18', text: '];', isBlank: false },
        ],
      },
      {
        id: '12',
        indent: 4,
        parts: [{ id: 'p19', text: '} else {', isBlank: false }],
      },
      {
        id: '13',
        indent: 6,
        parts: [
          { id: 'p20', text: 'result += roman_to_int[s[i]];', isBlank: false },
        ],
      },
      {
        id: '14',
        indent: 4,
        parts: [{ id: 'p21', text: '}', isBlank: false }],
      },
      {
        id: '15',
        indent: 2,
        parts: [{ id: 'p22', text: '}', isBlank: false }],
      },
      {
        id: '16',
        indent: 2,
        parts: [
          { id: 'p23', text: 'return ', isBlank: false },
          { id: 'p24', text: '', isBlank: true, answer: 'result' },
          { id: 'p25', text: ';', isBlank: false },
        ],
      },
      {
        id: '17',
        indent: 0,
        parts: [{ id: 'p26', text: '}', isBlank: false }],
      },
    ],
  };

  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  const activeBlockId =
    selectedBlockId ??
    currentLesson?.blocks.find((b: Block) => b.state === 'active')?._id ??
    currentLesson?.blocks[0]?._id ??
    null;

  const currentBlock =
    currentLesson?.blocks.find((b: Block) => b._id === activeBlockId) ??
    undefined;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      <Navbar variant="lesson" />

      <div className="flex flex-1 pt-14 overflow-hidden">
        <LessonSidebar
          blocks={currentLesson?.blocks || []}
          lessonTitle={currentLesson?.title}
          selectedBlockId={activeBlockId}
          onSelectBlock={setSelectedBlockId}
        />

        <div className="flex-1  overflow-y-auto">
          <TheoryPane block={currentBlock} />
        </div>

        <div className="flex-1  overflow-y-auto flex flex-col">
          <div className="flex gap-2 p-4 border-b border-slate-200 bg-slate-50">
            <button
              onClick={() => setExerciseType('dragdrop')}
              className={cn(
                'px-3 py-1.5 text-xs font-bold rounded-lg transition-colors',
                exerciseType === 'dragdrop'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              )}
            >
              Drag & Drop
            </button>
            <button
              onClick={() => setExerciseType('fillinblank')}
              className={cn(
                'px-3 py-1.5 text-xs font-bold rounded-lg transition-colors',
                exerciseType === 'fillinblank'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              )}
            >
              Fill in the Blank
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <PracticePanel
              exercise={
                exerciseType === 'dragdrop'
                  ? dragDropExercise
                  : fillBlankExercise
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

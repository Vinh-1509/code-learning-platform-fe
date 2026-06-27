/**
 * Learning domain API response types.
 * Covers milestones, lessons, blocks, and block content items.
 */

export interface MilestoneResponse {
  _id: string;
  title: string;
  description: string;
  order: number;
  progress: {
    status: 'active' | 'locked' | 'completed';
    completionPercentage: number;
  };
}

export interface LessonResponse {
  _id: string;
  title: string;
  order: number;
  progress: {
    status: 'active' | 'locked' | 'completed';
    isCompleted: boolean;
    completionPercentage: number;
  };
}

export interface ContentItem {
  type: 'theory' | 'code' | 'practice';
  data: {
    order: number;
    text?: string;
    code?: string;
    explanation?: string;
    exerciseId?: string;
    required?: boolean;
  };
}

export interface Block {
  _id: string;
  title: string;
  description?: string;
  content: ContentItem[];
  feynmanQuestion: string;
  status: 'active' | 'locked' | 'completed';
  isFeynmanPassed: boolean;
}

export interface LessonDetailResponse {
  _id: string;
  title: string;
  order: number;
  blocks: Block[];
  progress: {
    completionPercentage: number;
    isCompleted: boolean;
    lastAccessed?: string;
  };
}

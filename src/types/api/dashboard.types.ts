/**
 * Dashboard domain API response types.
 */

export interface DashboardUser {
  _id: string;
  email: string;
  username: string;
  fullName: string;
  selectedLanguage: string[];
}

export interface DashboardRoadmap {
  _id: string;
  title: string;
  language: string;
}

export interface DashboardStats {
  totalLessons: number;
  totalLearnedLessons: number;
  totalExercises: number;
  totalCompletedExercises: number;
  overallProgress: number;
  weakTagsCount: number;
}

export interface DashboardMilestone {
  _id: string;
  title: string;
  status: 'active' | 'locked' | 'completed';
  completionPercentage: number;
}

export interface DashboardResponse {
  user: DashboardUser;
  roadmap: DashboardRoadmap;
  stats: DashboardStats;
  milestones: DashboardMilestone[];
  dailyReview: {
    pendingCount: number;
  };
}

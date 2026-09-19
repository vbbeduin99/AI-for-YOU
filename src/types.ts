export type ThemeMode = 'system' | 'light' | 'dark';
export type LanguageMode = 'en' | 'bn' | 'bn-en';

export interface UserProfile {
  name: string;
  profession: string;
  jobTitle: string;
  responsibilities: string;
  aiExperience: string;
  toolsUsed: string[];
  timeAvailable: string;
  formats: string[];
  objective: string;
}

export interface UserPriorities {
  selected: string[];
  ranked: string[]; // up to 3 priority IDs in order
}

export interface DiagnosticState {
  administered: string[]; // 24 question IDs (16 core + 8 adaptive)
  answers: Record<string, number>; // questionId -> selectedOptionIndex
  submitted: boolean;
}

export type ModuleStatus = 'not_started' | 'practice_pending' | 'completed';

export interface ModuleProgressItem {
  status: ModuleStatus;
  quizScore: number | null; // percentage e.g. 80, 100
  quizAttempts: number;
  quizAnswers: Record<string, number>; // questionIndex -> selectedOptionIndex
  notes?: string;
  completedAt?: string;
}

export interface AppState {
  profile: UserProfile;
  priorities: UserPriorities;
  diagnostic: DiagnosticState;
  moduleProgress: Record<string, ModuleProgressItem>;
  libraryShowAll: boolean;
  settings: {
    theme: ThemeMode;
    language: LanguageMode;
  };
}

export interface PriorityItem {
  id: string;
  name: string;
  tags: string[];
  primaryDimension: string;
}

export interface DimensionItem {
  id: string;
  name: string;
}

export interface Question {
  id: string;
  dimensionId: string;
  priorityId?: string;
  text: string;
  options: string[];
  correctIndex: number;
}

export type ModuleCategory =
  | 'fundamentals'
  | 'prompting'
  | 'verification'
  | 'data'
  | 'communication'
  | 'automation'
  | 'strategy'
  | 'implementation';

export interface ModuleItem {
  id: string;
  title: string;
  level: 'Foundation' | 'Intermediate' | 'Advanced' | 'Applied';
  hours: number;
  tags: string[];
  prereq: string[];
  category: ModuleCategory;
  outcome: string;
  task: string;
  lesson: string;
}

export interface QuizQuestion {
  text: string;
  options: string[];
  correctIndex: number;
}

export interface RecommendationResult {
  module: ModuleItem;
  score: number;
  reasons: string[];
  isPrerequisiteAddon?: boolean;
}

export interface DimensionScore {
  id: string;
  name: string;
  correct: number;
  administered: number;
  percentage: number | null; // null if 0 administered
}

export interface WeeklySchedulePlan {
  totalHours: number;
  dailyMinutes: number;
  sessionsPerWeek: number;
  totalWeeks: number;
  weeks: {
    weekNumber: number;
    hours: number;
    modules: ModuleItem[];
  }[];
}

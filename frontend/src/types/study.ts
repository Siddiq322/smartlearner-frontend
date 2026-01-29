export interface StudyTask {
  id: string;
  name: string;
  estimatedTime: string;
  difficulty: "Easy" | "Medium" | "Hard";
  completed: boolean;
  completedAt?: Date;
  createdAt: Date;
}

export interface StudyPlan {
  id: string;
  name: string;
  totalDuration: string;
  tasks: StudyTask[];
  createdAt: Date;
  examDate?: Date;
  goal?: string;
}

export interface UserProfile {
  name: string;
  goal: string;
  examDate: Date | null;
  daysRemaining: number;
}
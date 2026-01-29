import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { api } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { StudyPlan, StudyTask, UserProfile } from "@/types/study";

interface StudyContextType {
  user: UserProfile;
  setUser: (user: UserProfile) => void;
  currentPlan: StudyPlan | null;
  plans: StudyPlan[];
  addPlan: (plan: Omit<StudyPlan, "id" | "createdAt">) => void;
  addTaskToPlan: (planId: string, task: Omit<StudyTask, "id" | "createdAt" | "completed">) => void;
  toggleTaskComplete: (planId: string, taskId: string) => void;
  setCurrentPlan: (plan: StudyPlan | null) => void;
  getCompletedTasksCount: () => number;
  getTotalTasksCount: () => number;
  getCompletionPercentage: () => number;
  getTodaysTasks: () => StudyTask[];
  getWeeklyProgress: () => { day: string; completed: number; total: number }[];
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

export const useStudy = () => {
  const context = useContext(StudyContext);
  if (!context) {
    throw new Error("useStudy must be used within a StudyProvider");
  }
  return context;
};

export const StudyProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Get user profile
  const { data: profileData } = useQuery({
    queryKey: ['profile'],
    queryFn: api.getProfile,
    enabled: !!localStorage.getItem('token'),
  });

  // Get current study plan
  const { data: currentPlan, isLoading: planLoading } = useQuery({
    queryKey: ['currentPlan'],
    queryFn: api.getCurrentStudyPlan,
    enabled: !!localStorage.getItem('token'),
  });

  // Update currentUser when profileData is available
  useEffect(() => {
    if (profileData?.user) {
      setCurrentUser({
        name: profileData.user.name,
        goal: profileData.user.goal || 'Top 10%',
        examDate: profileData.user.examDate ? new Date(profileData.user.examDate) : null,
        daysRemaining: profileData.user.examDate
          ? Math.ceil((new Date(profileData.user.examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : 30,
      });
    }
  }, [profileData]);

  // Mutations
  const createPlanMutation = useMutation({
    mutationFn: api.createStudyPlan,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['currentPlan'] });
      toast.success('Study plan created successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: api.updateTaskStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentPlan'] });
      toast.success('Task updated!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const user: UserProfile = currentUser || (profileData?.user ? {
    name: profileData.user.name,
    goal: profileData.user.goal || 'Top 10%',
    examDate: profileData.user.examDate ? new Date(profileData.user.examDate) : null,
    daysRemaining: profileData.user.examDate
      ? Math.ceil((new Date(profileData.user.examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : 30,
  } : {
    name: "Student",
    goal: "Top 10%",
    examDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    daysRemaining: 30,
  });

  const addPlan = (plan: Omit<StudyPlan, "id" | "createdAt">) => {
    createPlanMutation.mutate(plan);
  };

  const addTaskToPlan = (planId: string, task: Omit<StudyTask, "id" | "createdAt" | "completed">) => {
    // This would be implemented if we had a separate add task endpoint
    console.log('Add task to plan:', planId, task);
  };

  const toggleTaskComplete = (planId: string, taskId: string) => {
    if (!currentPlan) return;
    const task = currentPlan.tasks.find((t: any) => t._id === taskId);
    if (task) {
      updateTaskMutation.mutate({
        planId,
        taskId,
        completed: !task.completed,
      });
    }
  };

  const setCurrentPlan = (plan: StudyPlan | null) => {
    // This would be implemented if we had a set current plan endpoint
    console.log('Set current plan:', plan);
  };

  const getCompletedTasksCount = () => {
    if (!currentPlan) return 0;
    return currentPlan.tasks.filter((t: any) => t.completed).length;
  };

  const getTotalTasksCount = () => {
    if (!currentPlan) return 0;
    return currentPlan.tasks.length;
  };

  const getCompletionPercentage = () => {
    const total = getTotalTasksCount();
    if (total === 0) return 0;
    return Math.round((getCompletedTasksCount() / total) * 100);
  };

  const getTodaysTasks = () => {
    if (!currentPlan) return [];
    return currentPlan.tasks;
  };

  const getWeeklyProgress = () => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((day, index) => {
      const completed = currentPlan?.tasks.filter((t: any) => t.completed).length || 0;
      const total = currentPlan?.tasks.length || 0;
      return {
        day,
        completed: index < new Date().getDay() ? Math.floor(Math.random() * 5) : 0,
        total: Math.floor(Math.random() * 5) + 3,
      };
    });
  };

  return (
    <StudyContext.Provider
      value={{
        user,
        setUser: setCurrentUser,
        currentPlan: currentPlan || null,
        plans: currentPlan ? [currentPlan] : [],
        addPlan,
        addTaskToPlan,
        toggleTaskComplete,
        setCurrentPlan,
        getCompletedTasksCount,
        getTotalTasksCount,
        getCompletionPercentage,
        getTodaysTasks,
        getWeeklyProgress,
      }}
    >
      {children}
    </StudyContext.Provider>
  );
};

import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  Clock,
  CheckCircle2,
  Circle,
  BookOpen,
  Plus,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState } from "react";

const DailyPlanPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDuration, setNewTaskDuration] = useState("");

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => api.getTasks(),
  });

  const addTaskMutation = useMutation({
    mutationFn: (data: { title: string; duration: number }) => api.addTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task added!");
      setNewTaskTitle("");
      setNewTaskDuration("");
    },
    onError: (error) => {
      toast.error("Failed to add task");
      console.error(error);
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, completed }: { taskId: string; completed: boolean }) => api.updateTask(taskId, { completed }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task updated!");
    },
    onError: (error) => {
      toast.error("Failed to update task");
      console.error(error);
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      console.log('Attempting to delete task:', taskId);
      const result = await api.deleteTask(taskId);
      console.log('Delete API response:', result);
      return result;
    },
    onSuccess: (data) => {
      console.log('Delete success:', data);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task deleted!");
    },
    onError: (error: any) => {
      console.error('Delete task error details:', error);
      console.error('Error response:', error?.response?.data);
      console.error('Error status:', error?.response?.status);
      toast.error("Failed to delete task");
    },
  });

  const handleAddTask = () => {
    if (!newTaskTitle || !newTaskDuration) return;
    addTaskMutation.mutate({
      title: newTaskTitle,
      duration: parseInt(newTaskDuration) * 60, // Convert minutes to seconds
    });
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  const tasksList = tasks || [];
  const completedCount = tasksList.filter((task: any) => task.completed).length;
  const totalCount = tasksList.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Daily Plan</h1>
            <p className="text-muted-foreground mt-1">
              {completedCount}/{totalCount} tasks completed
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <GlassCard className="py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Today's Progress</span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </GlassCard>

        {/* Add Task Form */}
        <GlassCard className="py-4">
          <h3 className="text-lg font-semibold mb-4">Add New Task</h3>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Task title"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="flex-1 px-3 py-2 border border-border rounded-lg bg-background"
            />
            <input
              type="number"
              placeholder="Duration (minutes)"
              value={newTaskDuration}
              onChange={(e) => setNewTaskDuration(e.target.value)}
              className="w-32 px-3 py-2 border border-border rounded-lg bg-background"
            />
            <AnimatedButton
              variant="primary"
              onClick={handleAddTask}
              disabled={addTaskMutation.isPending}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </AnimatedButton>
          </div>
        </GlassCard>

        {/* Tasks List */}
        <div className="space-y-3">
          {tasksList.length === 0 ? (
            <GlassCard className="text-center py-8">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No tasks yet</h3>
              <p className="text-muted-foreground">Add tasks above to get started!</p>
            </GlassCard>
          ) : (
            tasksList.map((task: any, index: number) => (
              <motion.div
                key={task._id || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ x: 4, scale: 1.01 }}
              >
                <GlassCard
                  className={cn(
                    "flex items-center gap-4 py-4 transition-all",
                    task.completed && "opacity-60"
                  )}
                  hover3D
                >
                  <motion.button
                    className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0",
                      task.completed
                        ? "bg-secondary border-secondary text-secondary-foreground"
                        : "border-border hover:border-primary"
                    )}
                    onClick={() => updateTaskMutation.mutate({ taskId: task._id, completed: !task.completed })}
                    whileTap={{ scale: 0.8 }}
                    disabled={updateTaskMutation.isPending}
                  >
                    {task.completed ? (
                      <CheckCircle2 size={16} />
                    ) : (
                      <Circle size={16} className="opacity-0" />
                    )}
                  </motion.button>

                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "font-medium truncate",
                        task.completed
                          ? "text-muted-foreground line-through"
                          : "text-foreground"
                      )}
                    >
                      {task.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Duration: {Math.round(task.duration / 60)}m
                    </p>
                  </div>

                  <div className="flex items-center gap-1 text-sm text-muted-foreground shrink-0">
                    <Clock size={14} />
                    {Math.round(task.duration / 60)}m
                  </div>

                  <motion.button
                    className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                    onClick={() => deleteTaskMutation.mutate(task._id)}
                    whileTap={{ scale: 0.8 }}
                    disabled={deleteTaskMutation.isPending}
                    title="Delete task"
                  >
                    <Trash2 size={16} />
                  </motion.button>
                </GlassCard>
              </motion.div>
            ))
          )}
        </div>

        {/* Completion Message */}
        {progress === 100 && tasksList.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <GlassCard className="text-center bg-gradient-to-r from-secondary/10 to-primary/10 border-secondary/20">
              <div className="text-4xl mb-2">🎉</div>
              <h3 className="text-lg font-semibold text-foreground">All tasks completed!</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Great job! Check your progress report for insights.
              </p>
              <AnimatedButton
                variant="primary"
                className="mt-4"
                onClick={() => navigate("/progress")}
              >
                View Progress
              </AnimatedButton>
            </GlassCard>
          </motion.div>
        )}
      </motion.div>
    </AppLayout>
  );
};

export default DailyPlanPage;

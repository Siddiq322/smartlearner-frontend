import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { ProgressRing } from "@/components/ui/ProgressRing";
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  Target,
  Flame,
  BookOpen,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { AnimatedButton } from "@/components/ui/AnimatedButton";

const ProgressPage = () => {
  const navigate = useNavigate();
  const { data: tasks, isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => api.getTasks(),
  });

  // Generate weekly data based on tasks
  const tasksList = tasks || [];
  const completedTasks = tasksList.filter((task: any) => task.completed);
  const totalTasks = tasksList.length;
  const progress = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;

  // For now, use static weekly data since we don't have historical data
  const weeklyData = [
    { day: "Mon", completed: 4, total: 5 },
    { day: "Tue", completed: 3, total: 4 },
    { day: "Wed", completed: 5, total: 5 },
    { day: "Thu", completed: 2, total: 4 },
    { day: "Fri", completed: completedTasks.length, total: totalTasks },
    { day: "Sat", completed: 0, total: 3 },
    { day: "Sun", completed: 0, total: 2 },
  ];

  // Calculate total study time
  const totalMinutes = tasksList.reduce((acc, task) => {
    const minutes = task.duration / 60;
    return acc + (task.completed ? minutes : 0);
  }, 0);

  const studyHours = (totalMinutes / 60).toFixed(1);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  if (!tasksList || tasksList.length === 0) {
    return (
      <AppLayout>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center min-h-[60vh] text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
            <TrendingUp className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">No Progress Yet</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Add tasks and complete them to see your progress analytics here.
          </p>
          <AnimatedButton variant="primary" onClick={() => navigate("/daily-plan")}>
            Add Tasks
          </AnimatedButton>
        </motion.div>
      </AppLayout>
    );
  }

  const statsData = [
    { label: "Completion", value: `${Math.round(progress)}%`, icon: Target, color: "primary" },
    { label: "Tasks Done", value: `${completedTasks.length}/${totalTasks}`, icon: CheckCircle2, color: "secondary" },
    { label: "Study Hours", value: studyHours, icon: Clock, color: "accent" },
    { label: "Today's Tasks", value: totalTasks.toString(), icon: BookOpen, color: "primary" },
  ];

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
            <h1 className="text-3xl font-bold text-foreground">Progress Report</h1>
            <p className="text-muted-foreground mt-1">
              Track your learning journey and improvements
            </p>
          </div>
          <motion.div
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/20 text-accent"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Flame className="w-5 h-5 animate-gentle-pulse" />
            <span className="font-bold">7 day streak</span>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {statsData.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard className="text-center" hover3D>
                <div
                  className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center"
                  style={{
                    backgroundColor: `hsl(var(--${stat.color}) / 0.1)`,
                    color: `hsl(var(--${stat.color}))`,
                  }}
                >
                  <stat.icon size={24} />
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly Progress Chart */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard>
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Weekly Progress
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyData}>
                    <defs>
                      <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(239, 84%, 67%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(239, 84%, 67%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="completed"
                      stroke="hsl(239, 84%, 67%)"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorCompleted)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </motion.div>

          {/* Progress Ring */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard className="text-center h-full flex flex-col justify-center">
              <h2 className="text-lg font-semibold text-foreground mb-4">Overall Progress</h2>
              <div className="flex justify-center mb-4">
                <ProgressRing progress={progress} size={160} strokeWidth={12} />
              </div>
              <p className="text-muted-foreground text-sm">
                {progress >= 80
                  ? "Excellent work! Keep it up! 🚀"
                  : progress >= 50
                  ? "Good progress! Stay focused 💪"
                  : "Keep going! You've got this 🌟"}
              </p>
            </GlassCard>
          </motion.div>
        </div>

        {/* Motivational Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard className="bg-gradient-soft text-center">
            <motion.p
              className="text-lg font-medium text-foreground"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              You're improving steadily 🚀
            </motion.p>
            <p className="text-sm text-muted-foreground mt-1">
              Keep up the great work with your daily tasks!
            </p>
          </GlassCard>
        </motion.div>
      </motion.div>
    </AppLayout>
  );
};

export default ProgressPage;

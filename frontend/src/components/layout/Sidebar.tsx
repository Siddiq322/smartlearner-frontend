import { motion } from "framer-motion";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Calendar,
  BarChart3,
  LogOut,
  Brain,
  Target,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStudy } from "@/contexts/StudyContext";

const navItems = [
  { path: "/daily-plan", label: "Daily Plan", icon: Calendar },
  { path: "/progress", label: "Progress", icon: BarChart3 },
];

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useStudy();

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <motion.aside
      className="fixed left-0 top-0 h-screen w-64 bg-card/80 backdrop-blur-xl border-r border-border p-6 flex flex-col z-50"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <motion.div
          className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center"
          whileHover={{ scale: 1.05, rotate: 5 }}
        >
          <Brain className="w-5 h-5 text-primary-foreground" />
        </motion.div>
        <div>
          <h1 className="font-bold text-foreground">Smart Learning</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink key={item.path} to={item.path}>
              <motion.div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full bg-primary-foreground ml-auto"
                    layoutId="activeIndicator"
                  />
                )}
              </motion.div>
            </NavLink>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="space-y-3 pt-4 border-t border-border">
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
            <User size={16} className="text-muted-foreground" />
          </div>
          <span className="text-sm text-foreground">Welcome, {user.name}</span>
        </div>

        <div className="px-4 py-3 rounded-xl bg-muted/50">
          <div className="flex items-center gap-2 mb-1">
            <Target size={14} className="text-primary" />
            <span className="text-xs font-medium text-foreground">Current Goal</span>
          </div>
          <p className="text-sm text-primary font-semibold">{user.goal}</p>
          <p className="text-xs text-muted-foreground">
            {user.daysRemaining} days remaining
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all w-full"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </motion.aside>
  );
};

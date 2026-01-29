import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  hover3D?: boolean;
  float?: boolean;
  glow?: boolean;
}

export const GlassCard = ({
  children,
  className,
  hover3D = true,
  float = false,
  glow = false,
  ...props
}: GlassCardProps) => {
  return (
    <motion.div
      className={cn(
        "glass-card p-6",
        float && "animate-float",
        glow && "hover-glow",
        className
      )}
      whileHover={
        hover3D
          ? {
              y: -4,
              rotateX: 2,
              rotateY: -2,
              boxShadow: "0 20px 40px -15px rgba(99, 102, 241, 0.2)",
            }
          : undefined
      }
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

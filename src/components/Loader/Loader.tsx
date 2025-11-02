import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { HiCog } from "react-icons/hi2";

interface LoaderProps {
  text?: string;
  icon?: ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({
  text = "Ładowanie...",
  icon = <HiCog className="w-6 h-6 text-indigo-500" />,
  size = "md",
  className = "",
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const iconSize = sizeClasses[size];
  const containerPadding =
    size === "sm" ? "p-2" : size === "md" ? "p-4" : "p-6";

  return (
    <div
      className={`flex items-center justify-center min-h-[200px] ${className}`}
    >
      <motion.div
        className={`flex flex-col items-center space-y-4 ${containerPadding}`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="flex"
        >
          <div className={iconSize}>{icon}</div>
        </motion.div>
        <div className="text-lg font-medium text-gray-600 dark:text-gray-400 text-center">
          {text}
        </div>
      </motion.div>
    </div>
  );
};

export default Loader;

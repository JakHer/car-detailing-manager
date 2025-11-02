import type { ReactNode } from "react";
import { motion } from "framer-motion";
import Title from "../Title/Title";
import { cloneElement } from "react";

interface PageHeaderProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  rightContent?: ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  icon,
  title,
  subtitle,
  rightContent,
}) => {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <motion.div
          className="flex-shrink-0 relative overflow-hidden"
          transition={{ duration: 0 }}
        >
          {cloneElement(
            icon as React.ReactElement<React.SVGProps<SVGSVGElement>>,
            {
              className: "w-8 h-8 text-indigo-600 dark:text-indigo-400",
            }
          )}

          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 bg-yellow-300/70 dark:bg-amber-200/60 rounded-full shadow-lg" // Slightly larger, more opaque yellow with shadow for pop
              style={{
                top: `${15 + i * 18}%`,
                left: `${15 + (i % 3) * 35}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 1 + i * 0.25,
                repeat: Infinity,
                repeatDelay: 1.2 + i * 0.15,
                ease: "easeOut",
              }}
            />
          ))}

          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-radial from-yellow-300/20 dark:from-amber-300/20 to-transparent blur-md"
            animate={{
              opacity: [0.4, 0.7, 0.4],
              scale: [1, 1.08, 1],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
        <div>
          <Title>{title}</Title>
          {subtitle && <p className="text-gray-600">{subtitle}</p>}
        </div>
      </div>
      {rightContent && <div>{rightContent}</div>}
    </div>
  );
};

export default PageHeader;

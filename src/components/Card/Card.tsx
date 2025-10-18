import Button from "../../components/Button/Button";

interface CardProps {
  title: string;
  status?: "W toku" | "Zakończone";
  children: React.ReactNode;
  className?: string;
  onAction?: () => void;
  actionLabel?: string;
}

export default function Card({
  title,
  status,
  children,
  className,
  onAction,
  actionLabel,
}: CardProps) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors duration-300 ${
        className ?? ""
      }`}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
          {title}
        </h3>
        {status && (
          <span
            className={`font-semibold ${
              status === "Zakończone"
                ? "text-green-600 dark:text-green-400"
                : "text-yellow-600 dark:text-yellow-400"
            }`}
          >
            {status}
          </span>
        )}
      </div>

      <div className="text-gray-700 dark:text-gray-300 transition-colors duration-300">
        {children}
      </div>

      {onAction && actionLabel && (
        <div className="mt-4">
          <Button
            variant="secondary" // uses your Button's secondary colors
            onClick={onAction}
            className="w-full text-sm py-1"
          >
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

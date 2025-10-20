import React from "react";
import type { OrderStatus } from "../../stores/OrdersStore";

export interface CardProps {
  title: string;
  status?: OrderStatus;
  actionLabel?: string;
  onAction?: () => void;
  children?: React.ReactNode;
  className?: string;
  compact?: boolean;
}

export const STATUS_COLORS: Record<
  OrderStatus,
  { bg: string; text: string; hex: string }
> = {
  Nowe: { bg: "bg-blue-200", text: "text-blue-800", hex: "#3b82f6" },
  Przyjęte: { bg: "bg-cyan-200", text: "text-cyan-800", hex: "#06b6d4" },
  "W toku": { bg: "bg-yellow-200", text: "text-yellow-800", hex: "#facc15" },
  "Czeka na odbiór": {
    bg: "bg-purple-200",
    text: "text-purple-800",
    hex: "#a78bfa",
  },
  Zakończone: { bg: "bg-green-200", text: "text-green-800", hex: "#16a34a" },
  Anulowane: { bg: "bg-red-200", text: "text-red-800", hex: "#ef4444" },
};

export default function Card({
  title,
  status,
  actionLabel,
  onAction,
  children,
  className = "",
  compact = false,
}: CardProps) {
  return (
    <div
      className={`border rounded-xl shadow-sm bg-white dark:bg-gray-800 w-full transition-colors duration-300
        ${compact ? "p-3" : "p-5"} ${className}`}
    >
      <div className="flex justify-between items-start mb-2 w-full">
        <h3
          className={`w-full ${
            compact ? "text-sm font-semibold" : "text-lg font-semibold"
          } text-gray-900 dark:text-gray-100`}
        >
          {title}
        </h3>

        {status && (
          <span
            className={`flex-shrink-0 ml-2 px-2 py-0.5 ${
              compact ? "text-xs" : "text-sm"
            } font-semibold rounded 
              ${STATUS_COLORS[status].bg} ${STATUS_COLORS[status].text}`}
          >
            {status}
          </span>
        )}
      </div>

      <div
        className={`text-gray-800 dark:text-gray-100 space-y-1 ${
          compact ? "text-sm" : "text-base"
        } overflow-hidden w-full`}
      >
        {children}
      </div>

      {actionLabel && onAction && (
        <button
          className={`mt-2 ${
            compact ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
          } bg-gray-200 dark:bg-gray-700 rounded text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors w-full`}
          onClick={onAction}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import { FiFilter, FiX, FiCalendar, FiCheck } from "react-icons/fi";
import Button from "../Button/Button";
import { formatLocalDate } from "../../utils/dateUtils";

interface FilterPopoverProps {
  searchValue: string;
  onSearchChange: (v: string) => void;
  statusOptions?: string[];
  statusValue?: string;
  onStatusChange?: (v: string) => void;
  dateFrom?: string;
  dateTo?: string;
  onDateFromChange?: (v: string) => void;
  onDateToChange?: (v: string) => void;
  quickFilters?: { label: string; type: "7days" | "month" | "all" }[];
  activeQuickFilter?: "7days" | "month" | "all";
  onQuickFilterChange?: (type: "7days" | "month" | "all") => void;
  onReset?: () => void;
}

const FilterPopover = ({
  searchValue,
  onSearchChange,
  statusOptions,
  statusValue,
  onStatusChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  quickFilters = [
    { label: "Ostatnie 7 dni", type: "7days" },
    { label: "Ten miesiąc", type: "month" },
    { label: "Wszystkie", type: "all" },
  ],
  activeQuickFilter,
  onQuickFilterChange,
  onReset,
}: FilterPopoverProps) => {
  const [open, setOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchValue);
  const [localStatus, setLocalStatus] = useState(statusValue ?? "");
  const [localDateFrom, setLocalDateFrom] = useState(dateFrom ?? "");
  const [localDateTo, setLocalDateTo] = useState(dateTo ?? "");

  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const anyFilterActive =
    !!searchValue ||
    !!statusValue ||
    !!dateFrom ||
    !!dateTo ||
    (activeQuickFilter && activeQuickFilter !== "all");

  const activeFilterCount = [
    searchValue,
    statusValue,
    dateFrom,
    dateTo,
    activeQuickFilter && activeQuickFilter !== "all",
  ].filter(Boolean).length;

  useEffect(() => {
    if (open) {
      setLocalSearch(searchValue);
      setLocalStatus(statusValue ?? "");
      setLocalDateFrom(dateFrom ?? "");
      setLocalDateTo(dateTo ?? "");
    }
  }, [open, searchValue, statusValue, dateFrom, dateTo]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      )
        setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const applyQuickRange = (type: "today" | "week" | "month") => {
    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    let from = startOfToday;
    let to = startOfToday;

    if (type === "week") {
      const dayOfWeek = startOfToday.getDay();
      const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const diffToSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
      from = new Date(startOfToday);
      from.setDate(startOfToday.getDate() - diffToMonday);
      to = new Date(startOfToday);
      to.setDate(startOfToday.getDate() + diffToSunday);
    } else if (type === "month") {
      from = new Date(today.getFullYear(), today.getMonth(), 1);
      to = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    }

    setLocalDateFrom(formatLocalDate(from));
    setLocalDateTo(formatLocalDate(to));
  };

  return (
    <div className="relative inline-block mb-2">
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        className="flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition"
      >
        <FiFilter className="mr-1" />
        {anyFilterActive && (
          <span className="ml-1 bg-cyan-500 text-white text-xs font-bold px-1 rounded-full">
            {activeFilterCount}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={popoverRef}
          className="absolute left-0 mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-lg p-4 z-50 w-auto min-w-[220px] max-w-[90vw] sm:max-w-sm md:max-w-md lg:max-w-lg"
        >
          <input
            type="text"
            placeholder="Szukaj..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className={`border rounded px-3 py-2 dark:bg-gray-700 w-full mb-3 focus:ring-2 ${
              localSearch
                ? "border-cyan-500 focus:ring-cyan-500"
                : "border-gray-300 dark:border-gray-600 focus:ring-cyan-400"
            }`}
          />

          {statusOptions && onStatusChange && (
            <select
              value={localStatus}
              onChange={(e) => setLocalStatus(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 dark:bg-gray-700 focus:ring-2 focus:ring-cyan-400 w-full mb-3"
            >
              <option value="">Wszystkie</option>
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          )}

          {(onDateFromChange || onDateToChange) && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
              <input
                type="date"
                value={localDateFrom}
                onChange={(e) => setLocalDateFrom(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 dark:bg-gray-700 focus:ring-2 focus:ring-cyan-400 w-full"
              />
              <span className="text-gray-500 dark:text-gray-300 text-center hidden sm:inline">
                –
              </span>
              <input
                type="date"
                value={localDateTo}
                onChange={(e) => setLocalDateTo(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 dark:bg-gray-700 focus:ring-2 focus:ring-cyan-400 w-full"
              />
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-3">
            {["today", "week", "month"].map((type) => {
              const today = new Date();
              const startOfToday = new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate()
              );

              let from = startOfToday;
              let to = startOfToday;

              if (type === "week") {
                const dayOfWeek = startOfToday.getDay();
                const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                const diffToSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
                from = new Date(startOfToday);
                from.setDate(startOfToday.getDate() - diffToMonday);
                to = new Date(startOfToday);
                to.setDate(startOfToday.getDate() + diffToSunday);
              } else if (type === "month") {
                from = new Date(today.getFullYear(), today.getMonth(), 1);
                to = new Date(today.getFullYear(), today.getMonth() + 1, 0);
              }

              const isActive =
                formatLocalDate(from) === localDateFrom &&
                formatLocalDate(to) === localDateTo;

              const label =
                type === "today"
                  ? "Today"
                  : type === "week"
                  ? "This Week"
                  : "This Month";

              return (
                <Button
                  key={type}
                  size="sm"
                  variant={isActive ? "primary" : "outline"}
                  onClick={() =>
                    applyQuickRange(type as "today" | "week" | "month")
                  }
                >
                  {label}
                </Button>
              );
            })}
          </div>

          {quickFilters.length > 0 && onQuickFilterChange && (
            <div className="flex flex-wrap gap-2 mb-3">
              {quickFilters.map((qf) => (
                <Button
                  key={qf.type}
                  size="sm"
                  variant={
                    activeQuickFilter === qf.type ? "primary" : "outline"
                  }
                  onClick={() => onQuickFilterChange(qf.type)}
                >
                  <FiCalendar className="mr-1" />
                  {qf.label}
                </Button>
              ))}
            </div>
          )}

          <div className="flex gap-2 mt-2">
            <Button
              size="sm"
              variant="primary"
              className="flex-1"
              onClick={() => {
                onSearchChange(localSearch);
                onStatusChange?.(localStatus);
                onDateFromChange?.(localDateFrom);
                onDateToChange?.(localDateTo);
                setOpen(false);
              }}
            >
              <FiCheck className="mr-1" />
            </Button>

            {onReset && (
              <Button
                size="sm"
                variant="outline"
                onClick={onReset}
                className="flex-1"
                disabled={activeFilterCount === 0}
              >
                <FiX className="mr-1" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPopover;

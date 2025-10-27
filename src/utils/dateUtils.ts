import { parse, endOfDay, format } from "date-fns";

export const parseLocalDate = (dateStr: string | null) =>
  dateStr ? parse(dateStr, "yyyy-MM-dd", new Date()) : null;

export const parseLocalDateEnd = (dateStr: string | null) =>
  dateStr ? endOfDay(parse(dateStr, "yyyy-MM-dd", new Date())) : null;

export const formatLocalDate = (d: Date) => format(d, "yyyy-MM-dd");

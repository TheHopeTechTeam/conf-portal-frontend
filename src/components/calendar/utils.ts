import { CalendarDay, CalendarEvent, CalendarMonth, DateRange, EventHorizontalLayout } from "./types";
import moment from "moment-timezone";

/**
 * IANA zone for calendar event labels; falls back to the runtime local zone when missing.
 */
export const resolveEventDisplayTimeZone = (timeZone?: string): string => {
  const trimmed = timeZone?.trim();
  if (trimmed) {
    return trimmed;
  }
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

/** Same as resolveEventDisplayTimeZone; use for calendar grid display. */
export const resolveCalendarDisplayTimeZone = (timeZone?: string): string => resolveEventDisplayTimeZone(timeZone);

export const formatTimeInTimeZone = (date: Date, timeZone: string): string => {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone,
  });
};

export const formatShortDateInTimeZone = (date: Date, timeZone: string): string => {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone,
  });
};

export const formatShortDateRangeInTimeZone = (start: Date, end: Date, timeZone: string): string => {
  return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone })} – ${end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone,
  })}`;
};

export const isSameCalendarDayInTimeZone = (a: Date, b: Date, timeZone: string): boolean => {
  const key = (d: Date) => d.toLocaleDateString("en-CA", { timeZone });
  return key(a) === key(b);
};

/**
 * UTC offset at this instant for the IANA zone, e.g. UTC+08:00 (replaces GMT with UTC).
 */
export const formatUtcOffsetLabelAtInstant = (date: Date, timeZone: string): string => {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "longOffset",
    }).formatToParts(date);
    const raw = parts.find((p) => p.type === "timeZoneName")?.value ?? "";
    if (!raw) {
      return "";
    }
    return raw
      .replace(/^GMT/i, "UTC")
      .replace(/\u2212/g, "-")
      .replace(/\s+/g, "");
  } catch {
    return "";
  }
};

/**
 * Create a Date object in local timezone from a date string (YYYY-MM-DD) or Date object
 * This ensures the date is interpreted in local time, not UTC
 * @param dateInput Date string (YYYY-MM-DD) or Date object
 * @param time Optional time string (HH:mm:ss) or hours, minutes, seconds
 * @returns Date object in local timezone
 */
export const createLocalDate = (dateInput: string | Date, time?: { hours?: number; minutes?: number; seconds?: number }): Date => {
  if (dateInput instanceof Date) {
    // If it's already a Date, extract date parts and create a new local date
    const hours = time?.hours ?? dateInput.getHours();
    const minutes = time?.minutes ?? dateInput.getMinutes();
    const seconds = time?.seconds ?? dateInput.getSeconds();
    return new Date(dateInput.getFullYear(), dateInput.getMonth(), dateInput.getDate(), hours, minutes, seconds);
  }

  // Parse date string (YYYY-MM-DD)
  const parts = dateInput.split("-");
  if (parts.length !== 3) {
    throw new Error(`Invalid date format: ${dateInput}. Expected YYYY-MM-DD`);
  }

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
  const day = parseInt(parts[2], 10);
  const hours = time?.hours ?? 0;
  const minutes = time?.minutes ?? 0;
  const seconds = time?.seconds ?? 0;

  return new Date(year, month, day, hours, minutes, seconds);
};

/**
 * Create a Date object in local timezone from date and time string (YYYY-MM-DDTHH:mm:ss)
 * This ensures the date is interpreted in local time, not UTC
 * @param dateTimeString Date-time string (YYYY-MM-DDTHH:mm:ss or YYYY-MM-DDTHH:mm:ssZ)
 * @returns Date object in local timezone
 */
export const createLocalDateTime = (dateTimeString: string): Date => {
  // Remove 'Z' suffix if present (indicates UTC)
  const cleanString = dateTimeString.replace(/Z$/, "");

  // Parse the date-time string
  const [datePart, timePart = "00:00:00"] = cleanString.split("T");
  const [hours = 0, minutes = 0, seconds = 0] = timePart.split(":").map(Number);

  return createLocalDate(datePart, { hours, minutes, seconds });
};

export const formatDate = (date: Date, format: "full" | "short" | "month-year" | "year" = "full"): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  switch (format) {
    case "short":
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    case "month-year":
      return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    case "year":
      return date.getFullYear().toString();
    default:
      return date.toLocaleDateString("en-US", options);
  }
};

export const formatWeekday = (date: Date, format: "full" | "short" = "short"): string => {
  if (format === "full") {
    return date.toLocaleDateString("en-US", { weekday: "long" });
  }
  return date.toLocaleDateString("en-US", { weekday: "short" });
};

export const getStartOfWeek = (date: Date): Date => {
  const d = new Date(date);
  // Normalize to midnight for consistent calculations
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  // Sunday = 0, so subtract day to get to Sunday (start of week)
  const diff = d.getDate() - day;
  const result = new Date(d);
  result.setDate(diff);
  return result;
};

export const getEndOfWeek = (date: Date): Date => {
  const start = getStartOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return end;
};

export const getWeekDates = (date: Date): Date[] => {
  const start = getStartOfWeek(date);
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    // Ensure all dates are normalized to midnight
    d.setHours(0, 0, 0, 0);
    dates.push(d);
  }
  return dates;
};

/** Sunday-start week; each entry is start-of-day in `tz` for that wall date. */
export const getWeekDatesInTimeZone = (anchor: Date, tz: string): Date[] => {
  const m = moment.tz(anchor, tz).startOf("day");
  const dow = m.day();
  const sunday = m.clone().subtract(dow, "days");
  return Array.from({ length: 7 }, (_, i) => sunday.clone().add(i, "days").toDate());
};

export const getStartOfWeekInTimeZone = (anchor: Date, tz: string): Date => getWeekDatesInTimeZone(anchor, tz)[0];

export const getEndOfWeekInTimeZone = (anchor: Date, tz: string): Date => getWeekDatesInTimeZone(anchor, tz)[6];

export const getZonedDayBounds = (dayAnchor: Date, tz: string): { dayStart: Date; dayEnd: Date } => {
  const m = moment.tz(dayAnchor, tz);
  return {
    dayStart: m.clone().startOf("day").toDate(),
    dayEnd: m.clone().endOf("day").toDate(),
  };
};

export const getMonthDaysInTimeZone = (anchor: Date, tz: string): CalendarDay[] => {
  const m = moment.tz(anchor, tz);
  const year = m.year();
  const month = m.month();
  const firstOfMonth = moment.tz({ year, month, day: 1 }, tz);
  const firstDayOfWeek = firstOfMonth.day();
  const gridStart = firstOfMonth.clone().subtract(firstDayOfWeek, "days").startOf("day");
  const now = moment().tz(tz);
  const days: CalendarDay[] = [];
  for (let i = 0; i < 42; i++) {
    const d = gridStart.clone().add(i, "days");
    const dateStr = d.format("YYYY-MM-DD");
    days.push({
      date: dateStr,
      isCurrentMonth: d.month() === month,
      isToday: d.isSame(now, "day"),
    });
  }
  return days;
};

export const formatCalendarDateInTimeZone = (date: Date, format: "full" | "short" | "month-year", tz: string): string => {
  const opts: Intl.DateTimeFormatOptions = { timeZone: tz };
  if (format === "short") {
    opts.month = "short";
    opts.day = "numeric";
    opts.year = "numeric";
    return date.toLocaleDateString("en-US", opts);
  }
  if (format === "month-year") {
    opts.month = "long";
    opts.year = "numeric";
    return date.toLocaleDateString("en-US", opts);
  }
  opts.year = "numeric";
  opts.month = "long";
  opts.day = "numeric";
  return date.toLocaleDateString("en-US", opts);
};

export const formatWeekdayInTimeZone = (date: Date, format: "full" | "short", tz: string): string => {
  return date.toLocaleDateString("en-US", {
    timeZone: tz,
    weekday: format === "full" ? "long" : "short",
  });
};

export const getWeekNumberInTimeZone = (date: Date, tz: string): number => {
  const m = moment.tz(date, tz);
  const day = m.date();
  const firstDow = m.clone().startOf("month").day();
  return Math.ceil((day + firstDow) / 7);
};

export const formatYmdInTimeZone = (instant: Date, tz: string): string => {
  return moment.tz(instant, tz).format("YYYY-MM-DD");
};

export const wallYmdToZonedStartOfDay = (ymd: string, tz: string): Date => {
  return moment.tz(ymd, "YYYY-MM-DD", tz).startOf("day").toDate();
};

export const filterEventsByYmdInTimeZone = (events: CalendarEvent[], ymd: string, tz: string): CalendarEvent[] => {
  const dayStart = moment.tz(ymd, "YYYY-MM-DD", tz).startOf("day").toDate();
  const dayEnd = moment.tz(ymd, "YYYY-MM-DD", tz).endOf("day").toDate();
  return events.filter((event) => {
    const eventStart = event.start instanceof Date ? event.start : new Date(event.start);
    const eventEnd = event.end instanceof Date ? event.end : new Date(event.end);
    return eventStart <= dayEnd && eventEnd >= dayStart;
  });
};

/** Minutes from midnight in `tz` for this instant (fractional for sub-minute). */
export const getMinutesFromZonedMidnight = (instant: Date, tz: string): number => {
  const m = moment.tz(instant, tz);
  return m.hour() * 60 + m.minute() + m.second() / 60 + m.millisecond() / 60000;
};

// Helper function to format date as YYYY-MM-DD in local timezone
export const formatDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getMonthDays = (date: Date): CalendarDay[] => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDate = new Date(firstDay);
  const firstDayOfMonth = firstDay.getDay();
  // Sunday = 0, so subtract firstDayOfMonth to get to the Sunday of that week
  startDate.setDate(startDate.getDate() - firstDayOfMonth);

  const days: CalendarDay[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 42; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    currentDate.setHours(0, 0, 0, 0);
    const dateStr = formatDateString(currentDate);

    days.push({
      date: dateStr,
      isCurrentMonth: currentDate.getMonth() === month,
      isToday: currentDate.getTime() === today.getTime(),
    });
  }

  return days;
};

export const getYearMonths = (year: number): CalendarMonth[] => {
  const months: CalendarMonth[] = [];
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    const startDate = new Date(firstDay);
    const firstDayOfMonth = firstDay.getDay();
    // Sunday = 0, so subtract firstDayOfMonth to get to the Sunday of that week
    startDate.setDate(startDate.getDate() - firstDayOfMonth);

    const days: CalendarDay[] = [];
    const daysInMonth = lastDay.getDate();
    const totalDays = Math.ceil((startDate.getDate() - 1 + daysInMonth) / 7) * 7;

    for (let i = 0; i < totalDays; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      currentDate.setHours(0, 0, 0, 0);
      const dateStr = formatDateString(currentDate);

      days.push({
        date: dateStr,
        isCurrentMonth: currentDate.getMonth() === monthIndex,
        isToday: currentDate.getTime() === today.getTime(),
      });
    }

    months.push({
      name: monthNames[monthIndex],
      days,
    });
  }

  return months;
};

export const filterEventsByDate = (events: CalendarEvent[], date: Date): CalendarEvent[] => {
  // Normalize date to local timezone by extracting date parts
  const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dateStr = formatDateString(normalizedDate);

  return events.filter((event) => {
    // Extract date parts from event.start to compare in local timezone
    const eventStart = event.start instanceof Date ? event.start : new Date(event.start);
    const eventStartNormalized = new Date(eventStart.getFullYear(), eventStart.getMonth(), eventStart.getDate());
    return formatDateString(eventStartNormalized) === dateStr;
  });
};

/**
 * Assign side-by-side columns for events that overlap in time on the same day.
 * Uses greedy column packing so concurrent events get distinct lanes (same idea as many calendar UIs).
 */
export const computeOverlappingEventLayouts = (events: CalendarEvent[]): Map<string, EventHorizontalLayout> => {
  const result = new Map<string, EventHorizontalLayout>();
  if (events.length === 0) {
    return result;
  }

  const sorted = [...events].sort((a, b) => {
    const aStart = a.start instanceof Date ? a.start : new Date(a.start);
    const bStart = b.start instanceof Date ? b.start : new Date(b.start);
    const byStart = aStart.getTime() - bStart.getTime();
    if (byStart !== 0) {
      return byStart;
    }
    const aEnd = a.end instanceof Date ? a.end : new Date(a.end);
    const bEnd = b.end instanceof Date ? b.end : new Date(b.end);
    return bEnd.getTime() - aEnd.getTime();
  });

  const columnEnds: number[] = [];
  const columnByEventId = new Map<string, number>();

  sorted.forEach((event) => {
    const start = event.start instanceof Date ? event.start : new Date(event.start);
    const end = event.end instanceof Date ? event.end : new Date(event.end);
    const startMs = start.getTime();
    const endMs = end.getTime();

    let col = columnEnds.findIndex((lastEndMs) => lastEndMs <= startMs);
    if (col === -1) {
      col = columnEnds.length;
      columnEnds.push(endMs);
    } else {
      columnEnds[col] = Math.max(columnEnds[col], endMs);
    }

    columnByEventId.set(String(event.id), col);
  });

  const columnCount = Math.max(1, columnEnds.length);

  sorted.forEach((event) => {
    const col = columnByEventId.get(String(event.id)) ?? 0;
    result.set(String(event.id), {
      leftPercent: (col / columnCount) * 100,
      widthPercent: (1 / columnCount) * 100,
    });
  });

  return result;
};

export const filterEventsByDateRange = (events: CalendarEvent[], startDate: Date, endDate: Date): CalendarEvent[] => {
  // Normalize dates to local timezone by extracting date parts
  const rangeStart = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0);
  const rangeEnd = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59);

  return events.filter((event) => {
    // Event dates are already in their original timezone, compare directly
    const eventStart = event.start instanceof Date ? event.start : new Date(event.start);
    const eventEnd = event.end instanceof Date ? event.end : new Date(event.end);
    // Event overlaps with the date range if it starts before the range ends and ends after the range starts
    return eventStart <= rangeEnd && eventEnd >= rangeStart;
  });
};

export const getTimeSlotPosition = (date: string | Date): number => {
  const dateObj = new Date(date);
  const hours = dateObj.getHours();
  const minutes = dateObj.getMinutes();
  // Each hour is 2 rows (2 * 3.5rem = 7rem), plus minutes as fraction
  return hours * 2 + minutes / 30;
};

export const getTimeSlotDuration = (start: string | Date, end: string | Date): number => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffMinutes = (endDate.getTime() - startDate.getTime()) / (1000 * 60);
  // Convert minutes to row spans (each row is 30 minutes)
  return Math.ceil(diffMinutes / 30);
};

const localCalendarDayBounds = (date: Date): { dayStart: Date; dayEnd: Date } => {
  const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
  const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
  return { dayStart, dayEnd };
};

const intervalsOverlap = (aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean => {
  return aStart.getTime() <= bEnd.getTime() && bStart.getTime() <= aEnd.getTime();
};

// True if the calendar cell's calendar day (local or `displayTimeZone`) overlaps validRange [start, end] as instants
export const isDateInRange = (date: Date, validRange?: DateRange, displayTimeZone?: string): boolean => {
  if (!validRange) return true;
  const { dayStart, dayEnd } = displayTimeZone ? getZonedDayBounds(date, displayTimeZone) : localCalendarDayBounds(date);
  return intervalsOverlap(dayStart, dayEnd, validRange.start, validRange.end);
};

export const canNavigatePrevious = (
  currentDate: Date,
  view: "day" | "week" | "month",
  validRange?: DateRange,
  displayTimeZone?: string,
): boolean => {
  if (!validRange) return true;

  if (displayTimeZone) {
    const tz = displayTimeZone;
    switch (view) {
      case "day": {
        const prev = moment.tz(currentDate, tz).subtract(1, "day");
        const dayStart = prev.clone().startOf("day").toDate();
        const dayEnd = prev.clone().endOf("day").toDate();
        return intervalsOverlap(dayStart, dayEnd, validRange.start, validRange.end);
      }
      case "week": {
        const startCurrent = moment.tz(getWeekDatesInTimeZone(currentDate, tz)[0], tz);
        const startPrev = startCurrent.clone().subtract(7, "days").startOf("day");
        const endPrev = startPrev.clone().add(6, "days").endOf("day");
        return intervalsOverlap(startPrev.toDate(), endPrev.toDate(), validRange.start, validRange.end);
      }
      case "month": {
        const prev = moment.tz(currentDate, tz).subtract(1, "month").startOf("month");
        const endPrev = prev.clone().endOf("month");
        return intervalsOverlap(prev.toDate(), endPrev.toDate(), validRange.start, validRange.end);
      }
    }
    return false;
  }

  switch (view) {
    case "day": {
      const prev = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1);
      const { dayStart, dayEnd } = localCalendarDayBounds(prev);
      return intervalsOverlap(dayStart, dayEnd, validRange.start, validRange.end);
    }
    case "week": {
      const startOfCurrentWeek = getStartOfWeek(currentDate);
      const startOfPreviousWeek = new Date(startOfCurrentWeek);
      startOfPreviousWeek.setDate(startOfPreviousWeek.getDate() - 7);
      startOfPreviousWeek.setHours(0, 0, 0, 0);
      const endOfPreviousWeek = new Date(startOfCurrentWeek);
      endOfPreviousWeek.setDate(endOfPreviousWeek.getDate() - 1);
      endOfPreviousWeek.setHours(23, 59, 59, 999);
      return intervalsOverlap(startOfPreviousWeek, endOfPreviousWeek, validRange.start, validRange.end);
    }
    case "month": {
      const firstDayPrevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1, 0, 0, 0, 0);
      const lastDayPrevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0, 23, 59, 59, 999);
      return intervalsOverlap(firstDayPrevMonth, lastDayPrevMonth, validRange.start, validRange.end);
    }
  }

  return false;
};

export const canNavigateNext = (
  currentDate: Date,
  view: "day" | "week" | "month",
  validRange?: DateRange,
  displayTimeZone?: string,
): boolean => {
  if (!validRange) return true;

  if (displayTimeZone) {
    const tz = displayTimeZone;
    switch (view) {
      case "day": {
        const next = moment.tz(currentDate, tz).add(1, "day");
        const dayStart = next.clone().startOf("day").toDate();
        const dayEnd = next.clone().endOf("day").toDate();
        return intervalsOverlap(dayStart, dayEnd, validRange.start, validRange.end);
      }
      case "week": {
        const startCurrent = moment.tz(getWeekDatesInTimeZone(currentDate, tz)[0], tz);
        const startNext = startCurrent.clone().add(7, "days").startOf("day");
        const endNext = startNext.clone().add(6, "days").endOf("day");
        return intervalsOverlap(startNext.toDate(), endNext.toDate(), validRange.start, validRange.end);
      }
      case "month": {
        const next = moment.tz(currentDate, tz).add(1, "month").startOf("month");
        const endNext = next.clone().endOf("month");
        return intervalsOverlap(next.toDate(), endNext.toDate(), validRange.start, validRange.end);
      }
    }
    return false;
  }

  switch (view) {
    case "day": {
      const next = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1);
      const { dayStart, dayEnd } = localCalendarDayBounds(next);
      return intervalsOverlap(dayStart, dayEnd, validRange.start, validRange.end);
    }
    case "week": {
      const endOfCurrentWeek = getEndOfWeek(currentDate);
      const startOfNextWeek = new Date(endOfCurrentWeek.getFullYear(), endOfCurrentWeek.getMonth(), endOfCurrentWeek.getDate() + 1, 0, 0, 0, 0);
      const endOfNextWeek = new Date(startOfNextWeek);
      endOfNextWeek.setDate(endOfNextWeek.getDate() + 6);
      endOfNextWeek.setHours(23, 59, 59, 999);
      return intervalsOverlap(startOfNextWeek, endOfNextWeek, validRange.start, validRange.end);
    }
    case "month": {
      const firstDayNextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1, 0, 0, 0, 0);
      const lastDayNextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 0, 23, 59, 59, 999);
      return intervalsOverlap(firstDayNextMonth, lastDayNextMonth, validRange.start, validRange.end);
    }
  }

  return false;
};

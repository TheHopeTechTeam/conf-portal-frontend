import { CalendarDay, CalendarEvent, CalendarMonth, FirstDayOfWeek } from "./types";

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

export const getStartOfWeek = (date: Date, firstDayOfWeek: FirstDayOfWeek = 'monday'): Date => {
  const d = new Date(date);
  // Normalize to midnight for consistent calculations
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  let diff: number;
  
  if (firstDayOfWeek === 'sunday') {
    // Sunday = 0, so subtract day to get to Sunday
    diff = d.getDate() - day;
  } else {
    // Monday = 1, so adjust when day is Sunday (0) to go back to previous Monday
    diff = d.getDate() - day + (day === 0 ? -6 : 1);
  }
  
  const result = new Date(d);
  result.setDate(diff);
  return result;
};

export const getEndOfWeek = (date: Date, firstDayOfWeek: FirstDayOfWeek = 'monday'): Date => {
  const start = getStartOfWeek(date, firstDayOfWeek);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return end;
};

export const getWeekDates = (date: Date, firstDayOfWeek: FirstDayOfWeek = 'monday'): Date[] => {
  const start = getStartOfWeek(date, firstDayOfWeek);
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

// Helper function to format date as YYYY-MM-DD in local timezone
export const formatDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getMonthDays = (date: Date, firstDayOfWeek: FirstDayOfWeek = 'monday'): CalendarDay[] => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDate = new Date(firstDay);
  const firstDayOfMonth = firstDay.getDay();
  
  if (firstDayOfWeek === 'sunday') {
    startDate.setDate(startDate.getDate() - firstDayOfMonth);
  } else {
    // Monday = 1
    startDate.setDate(startDate.getDate() - firstDayOfMonth + (firstDayOfMonth === 0 ? -6 : 1));
  }

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

export const getYearMonths = (year: number, firstDayOfWeek: FirstDayOfWeek = 'monday'): CalendarMonth[] => {
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
    
    if (firstDayOfWeek === 'sunday') {
      startDate.setDate(startDate.getDate() - firstDayOfMonth);
    } else {
      // Monday = 1
      startDate.setDate(startDate.getDate() - firstDayOfMonth + (firstDayOfMonth === 0 ? -6 : 1));
    }

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
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);
  const dateStr = formatDateString(normalizedDate);
  
  return events.filter((event) => {
    const eventStart = new Date(event.start);
    eventStart.setHours(0, 0, 0, 0);
    return formatDateString(eventStart) === dateStr;
  });
};

export const filterEventsByDateRange = (events: CalendarEvent[], startDate: Date, endDate: Date): CalendarEvent[] => {
  const rangeStart = new Date(startDate);
  rangeStart.setHours(0, 0, 0, 0);
  const rangeEnd = new Date(endDate);
  rangeEnd.setHours(23, 59, 59, 999);

  return events.filter((event) => {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);
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

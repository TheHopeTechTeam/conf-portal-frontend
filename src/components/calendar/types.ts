export type CalendarView = "day" | "week" | "month";
export type FirstDayOfWeek = "sunday" | "monday";

export interface CalendarEvent {
  id: string | number;
  title: string;
  start: string | Date;
  end: string | Date;
  textColor?: string;
  backgroundColor?: string;
  item?: unknown;
}

export interface CalendarDay {
  date: string;
  isCurrentMonth?: boolean;
  isToday?: boolean;
  isSelected?: boolean;
  events?: CalendarEvent[];
}

export interface CalendarMonth {
  name: string;
  days: CalendarDay[];
}

export interface CalendarProps {
  currentDate?: Date;
  defaultView?: CalendarView;
  firstDayOfWeek?: FirstDayOfWeek;
  availableViews?: CalendarView[];
  events?: CalendarEvent[];
  onDateChange?: (date: Date) => void;
  onViewChange?: (view: CalendarView) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onAddEvent?: () => void;
}

export interface CalendarViewProps {
  currentDate: Date;
  firstDayOfWeek?: FirstDayOfWeek;
  events?: CalendarEvent[];
  onDateChange: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onAddEvent?: () => void;
}

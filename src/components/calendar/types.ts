export type CalendarView = "day" | "week" | "month";

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

export interface DateRange {
  start: Date;
  end: Date;
}

export interface CalendarProps {
  currentDate?: Date;
  defaultView?: CalendarView;
  availableViews?: CalendarView[];
  events?: CalendarEvent[];
  validRange?: DateRange;
  onDateChange?: (date: Date) => void;
  onViewChange?: (view: CalendarView) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onEventContextMenu?: (event: CalendarEvent, mouseEvent: React.MouseEvent) => void;
  onAddEvent?: (date?: Date, startTime?: string, endTime?: string) => void;
  showNavigationButtons?:
    | boolean
    | {
        month?: boolean | { nav?: boolean; today?: boolean };
        week?: boolean | { nav?: boolean; today?: boolean };
        day?: boolean | { nav?: boolean; today?: boolean };
      }; // 是否显示切换周期和 Today 按钮，可以是布尔值或根据视图配置的对象
}

export interface CalendarViewProps {
  currentDate: Date;
  events?: CalendarEvent[];
  validRange?: DateRange;
  onDateChange: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onEventContextMenu?: (event: CalendarEvent, mouseEvent: React.MouseEvent) => void;
  onAddEvent?: (date?: Date, startTime?: string, endTime?: string) => void;
}

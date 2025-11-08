import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import { useState } from "react";
import { MdChevronLeft, MdChevronRight, MdKeyboardArrowDown } from "react-icons/md";
import { CalendarView, FirstDayOfWeek } from "./types";
import { formatDate, formatWeekday, getEndOfWeek, getStartOfWeek } from "./utils";

interface CalendarToolBarProps {
  currentDate: Date;
  currentView: CalendarView;
  firstDayOfWeek?: FirstDayOfWeek;
  availableViews?: CalendarView[];
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onViewChange: (view: CalendarView) => void;
  onAddEvent?: () => void;
}

const CalendarToolBar = ({
  currentDate,
  currentView,
  firstDayOfWeek = "monday",
  availableViews = ["day", "week", "month"],
  onPrevious,
  onNext,
  onToday,
  onViewChange,
  onAddEvent,
}: CalendarToolBarProps) => {
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);

  // Calculate week number of the month (1-based)
  const getWeekNumber = (date: Date): number => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    // Get the first day of the month
    const firstDayOfMonth = new Date(year, month, 1);
    // Get the day of the week for the first day (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const firstDayOfMonthWeekday = firstDayOfMonth.getDay();

    // Adjust based on firstDayOfWeek setting
    let adjustedFirstDayOfWeek: number;
    if (firstDayOfWeek === "sunday") {
      adjustedFirstDayOfWeek = firstDayOfMonthWeekday;
    } else {
      // Monday = 1, so convert Sunday (0) to 7
      adjustedFirstDayOfWeek = firstDayOfMonthWeekday === 0 ? 7 : firstDayOfMonthWeekday;
    }

    // Calculate which week of the month this date falls into
    // Week 1: days 1 to (7 - adjustedFirstDayOfWeek + 1)
    const weekNumber = Math.ceil((day + adjustedFirstDayOfWeek - 1) / 7);

    return weekNumber;
  };

  const getViewLabel = (): string => {
    switch (currentView) {
      case "day":
        return "Day view";
      case "week":
        return "Week view";
      case "month":
        return "Month view";
    }
  };

  const getTitle = (): string => {
    switch (currentView) {
      case "day":
        return formatDate(currentDate, "full");
      case "week":
        return formatDate(currentDate, "month-year");
      case "month":
        return formatDate(currentDate, "month-year");
    }
  };

  const formatDateForSubtitle = (date: Date): string => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const getSubtitle = (): string | null => {
    switch (currentView) {
      case "day":
        return formatWeekday(currentDate, "full");
      case "week": {
        const startOfWeek = getStartOfWeek(currentDate, firstDayOfWeek);
        const endOfWeek = getEndOfWeek(currentDate, firstDayOfWeek);
        const startFormatted = formatDateForSubtitle(startOfWeek);
        const endFormatted = formatDateForSubtitle(endOfWeek);
        return `${startFormatted} – ${endFormatted}`;
      }
      case "month": {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startFormatted = formatDateForSubtitle(firstDay);
        const endFormatted = formatDateForSubtitle(lastDay);
        return `${startFormatted} – ${endFormatted}`;
      }
      default:
        return null;
    }
  };

  const getNavigationLabel = (): string => {
    switch (currentView) {
      case "day":
        return "Previous day";
      case "week":
        return "Previous week";
      case "month":
        return "Previous month";
    }
  };

  const getNextLabel = (): string => {
    switch (currentView) {
      case "day":
        return "Next day";
      case "week":
        return "Next week";
      case "month":
        return "Next month";
    }
  };

  const handleViewChange = (view: CalendarView) => {
    onViewChange(view);
    setIsViewMenuOpen(false);
  };

  // Get the date to display in the calendar icon
  const getCalendarIconDate = (): Date => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Normalize currentDate to midnight for accurate comparison
    const normalizedCurrentDate = new Date(currentDate);
    normalizedCurrentDate.setHours(0, 0, 0, 0);

    switch (currentView) {
      case "day":
        return normalizedCurrentDate;
      case "week": {
        // Check if current week is the same as today's week
        const startOfWeek = getStartOfWeek(normalizedCurrentDate, firstDayOfWeek);
        const startOfTodayWeek = getStartOfWeek(today, firstDayOfWeek);

        // If current week is the same as today's week, show today's date
        if (startOfWeek.getTime() === startOfTodayWeek.getTime()) {
          return today;
        }
        // Otherwise show the first day of the week
        return startOfWeek;
      }
      case "month": {
        const year = normalizedCurrentDate.getFullYear();
        const month = normalizedCurrentDate.getMonth();
        const todayYear = today.getFullYear();
        const todayMonth = today.getMonth();

        // If current month is today's month, show today's date
        if (year === todayYear && month === todayMonth) {
          return today;
        }
        // Otherwise show the first day of the month
        const firstDay = new Date(year, month, 1);
        firstDay.setHours(0, 0, 0, 0);
        return firstDay;
      }
      default:
        return normalizedCurrentDate;
    }
  };

  const calendarIconDate = getCalendarIconDate();
  const monthAbbr = calendarIconDate.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  const day = calendarIconDate.getDate();

  return (
    <div className="flex flex-none items-center justify-between px-6 py-4 rounded-t-2xl border border-gray-300 dark:border-white/10 bg-gray-200 dark:bg-gray-800/50">
      <div className="flex items-start gap-3">
        {/* Calendar Icon */}
        <div className="flex flex-col rounded-lg bg-white shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-white/10 overflow-hidden w-12">
          <div className="flex items-center justify-center bg-gray-50 px-2 py-1 border-b border-gray-200 dark:border-white/10 text-[9px] font-semibold uppercase tracking-wide text-gray-700 dark:bg-gray-700 dark:text-gray-300">
            {monthAbbr}
          </div>
          <div className="flex items-center justify-center px-4 py-0.5 text-xl font-bold text-indigo-600 dark:text-indigo-400">{day}</div>
        </div>
        <div>
          <h1 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <time dateTime={currentDate.toISOString().split("T")[0]}>{getTitle()}</time>
            <Badge variant="solid" color="primary" size="sm">
              Week {getWeekNumber(currentDate)}
            </Badge>
          </h1>
          {getSubtitle() && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{getSubtitle()}</p>}
        </div>
      </div>
      <div className="flex items-center">
        <div className="relative flex items-stretch rounded-md bg-white shadow-xs outline -outline-offset-1 outline-gray-300 dark:bg-white/10 dark:shadow-none dark:outline-white/5">
          <button
            type="button"
            onClick={onPrevious}
            className="flex h-9 w-9 items-center justify-center rounded-l-md text-gray-400 hover:text-gray-500 focus:relative hover:bg-gray-50 dark:hover:text-white dark:hover:bg-white/10"
          >
            <span className="sr-only">{getNavigationLabel()}</span>
            <MdChevronLeft className="size-5" />
          </button>
          <Button
            onClick={onToday}
            variant="outline"
            size="sm"
            className="h-9 px-3.5 py-2 text-sm font-semibold rounded-none border-0 shadow-none bg-transparent hover:bg-gray-50 dark:hover:bg-white/10"
          >
            Today
          </Button>
          <button
            type="button"
            onClick={onNext}
            className="flex h-9 w-9 items-center justify-center rounded-r-md text-gray-400 hover:text-gray-500 focus:relative hover:bg-gray-50 dark:hover:text-white dark:hover:bg-white/10"
          >
            <span className="sr-only">{getNextLabel()}</span>
            <MdChevronRight className="size-5" />
          </button>
        </div>
        <div className="ml-4 flex items-center">
          {availableViews.length > 1 && (
            <div className="relative">
              <Button
                onClick={() => setIsViewMenuOpen(!isViewMenuOpen)}
                variant="outline"
                size="sm"
                endIcon={<MdKeyboardArrowDown className="-mr-1 size-5 text-gray-400" />}
                className="h-9 px-3 py-2 text-sm font-semibold shadow-xs"
              >
                {getViewLabel()}
              </Button>

              <Dropdown
                isOpen={isViewMenuOpen}
                onClose={() => setIsViewMenuOpen(false)}
                className="absolute right-0 z-10 mt-3 w-36 origin-top-right overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black/5 dark:bg-gray-800 dark:ring-white/10"
              >
                <div className="py-1">
                  {availableViews.includes("day") && (
                    <DropdownItem
                      onClick={() => handleViewChange("day")}
                      className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white"
                    >
                      Day view
                    </DropdownItem>
                  )}
                  {availableViews.includes("week") && (
                    <DropdownItem
                      onClick={() => handleViewChange("week")}
                      className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white"
                    >
                      Week view
                    </DropdownItem>
                  )}
                  {availableViews.includes("month") && (
                    <DropdownItem
                      onClick={() => handleViewChange("month")}
                      className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white"
                    >
                      Month view
                    </DropdownItem>
                  )}
                </div>
              </Dropdown>
            </div>
          )}
          {availableViews.length > 1 && onAddEvent && <div className="ml-6 h-6 w-px bg-gray-300 dark:bg-white/10" />}
          {onAddEvent && (
            <Button
              onClick={onAddEvent}
              variant="primary"
              size="sm"
              className={`h-9 ${
                availableViews.length > 1 ? "ml-6" : ""
              } bg-indigo-600 hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500`}
            >
              Add event
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarToolBar;

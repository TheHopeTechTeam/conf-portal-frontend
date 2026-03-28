import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button";
import ButtonGroup from "@/components/ui/buttons-group";
import moment from "moment-timezone";
import NavigationButtons from "./NavigationButtons";
import { CalendarView, DateRange } from "./types";
import {
  formatCalendarDateInTimeZone,
  formatUtcOffsetLabelAtInstant,
  formatWeekdayInTimeZone,
  formatYmdInTimeZone,
  getEndOfWeekInTimeZone,
  getStartOfWeekInTimeZone,
  getWeekDatesInTimeZone,
  getWeekNumberInTimeZone,
} from "./utils";

interface CalendarToolBarProps {
  currentDate: Date;
  displayTimeZone: string;
  /** When true, show IANA zone and offset under the title (e.g. when parent passed `timeZone`). */
  showTimeZoneLabel?: boolean;
  currentView: CalendarView;
  availableViews?: CalendarView[];
  validRange?: DateRange;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onViewChange: (view: CalendarView) => void;
  onAddEvent?: () => void;
  showNavigationButtons?: { nav: boolean; today: boolean };
}

const CalendarToolBar = ({
  currentDate,
  displayTimeZone,
  showTimeZoneLabel = false,
  currentView,
  availableViews = ["day", "week", "month"],
  validRange,
  onPrevious,
  onNext,
  onToday,
  onViewChange,
  onAddEvent,
  showNavigationButtons = { nav: true, today: true },
}: CalendarToolBarProps) => {
  const tz = displayTimeZone;

  // Create view buttons for ButtonGroup
  const getViewButtons = () => {
    const buttons = [];

    if (availableViews.includes("day")) {
      buttons.push({
        text: "Day",
        onClick: () => onViewChange("day"),
        active: currentView === "day",
        className: "h-9 py-0 px-3 text-sm",
      });
    }

    if (availableViews.includes("week")) {
      buttons.push({
        text: "Week",
        onClick: () => onViewChange("week"),
        active: currentView === "week",
        className: "h-9 py-0 px-3 text-sm",
      });
    }

    if (availableViews.includes("month")) {
      buttons.push({
        text: "Month",
        onClick: () => onViewChange("month"),
        active: currentView === "month",
        className: "h-9 py-0 px-3 text-sm",
      });
    }

    return buttons;
  };

  const getTitle = (): string => {
    switch (currentView) {
      case "day":
        return formatCalendarDateInTimeZone(currentDate, "full", tz);
      case "week":
        return formatCalendarDateInTimeZone(currentDate, "month-year", tz);
      case "month":
        return formatCalendarDateInTimeZone(currentDate, "month-year", tz);
    }
  };

  const getSubtitle = (): string | null => {
    switch (currentView) {
      case "day":
        return formatWeekdayInTimeZone(currentDate, "full", tz);
      case "week": {
        const startOfWeek = getStartOfWeekInTimeZone(currentDate, tz);
        const endOfWeek = getEndOfWeekInTimeZone(currentDate, tz);
        const startFormatted = formatCalendarDateInTimeZone(startOfWeek, "short", tz);
        const endFormatted = formatCalendarDateInTimeZone(endOfWeek, "short", tz);
        return `${startFormatted} – ${endFormatted}`;
      }
      case "month": {
        const m = moment.tz(currentDate, tz);
        const firstDay = m.clone().startOf("month").toDate();
        const lastDay = m.clone().endOf("month").toDate();
        const startFormatted = formatCalendarDateInTimeZone(firstDay, "short", tz);
        const endFormatted = formatCalendarDateInTimeZone(lastDay, "short", tz);
        return `${startFormatted} – ${endFormatted}`;
      }
      default:
        return null;
    }
  };

  const getCalendarIconDate = (): Date => {
    const todayStart = moment.tz(tz).startOf("day");
    const normalizedCurrent = moment.tz(currentDate, tz).startOf("day");

    switch (currentView) {
      case "day":
        return normalizedCurrent.toDate();
      case "week": {
        const weekDates = getWeekDatesInTimeZone(currentDate, tz);
        const startOfWeek = weekDates[0];
        const endOfWeekEnd = moment.tz(weekDates[6], tz).endOf("day");
        const norm = normalizedCurrent.toDate();
        if (norm.getTime() >= startOfWeek.getTime() && norm.getTime() <= endOfWeekEnd.toDate().getTime()) {
          return norm;
        }
        const startOfTodayWeek = getWeekDatesInTimeZone(new Date(), tz)[0];
        if (startOfWeek.getTime() === startOfTodayWeek.getTime()) {
          return todayStart.toDate();
        }
        return startOfWeek;
      }
      case "month": {
        const viewStart = normalizedCurrent.clone().startOf("month");
        const todayM = moment.tz(tz).startOf("day");
        if (viewStart.year() === todayM.year() && viewStart.month() === todayM.month()) {
          return todayM.toDate();
        }
        return viewStart.toDate();
      }
      default:
        return normalizedCurrent.toDate();
    }
  };

  const calendarIconDate = getCalendarIconDate();
  const iconMoment = moment.tz(calendarIconDate, tz);
  const monthAbbr = iconMoment.format("MMM").toUpperCase();
  const day = iconMoment.date();
  const zoneOffsetLabel = formatUtcOffsetLabelAtInstant(new Date(), tz);

  return (
    <div className="flex flex-none items-center justify-between px-6 py-4 rounded-t-2xl border border-gray-300 dark:border-white/10 bg-gray-200 dark:bg-gray-800/50">
      <div className="flex items-start gap-3">
        {/* Calendar Icon */}
        <div className="flex flex-col rounded-lg bg-white shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-white/10 overflow-hidden w-12">
          <div className="flex items-center justify-center bg-gray-50 px-2 py-1 border-b border-gray-200 dark:border-white/10 text-[9px] font-semibold uppercase tracking-wide text-gray-700 dark:bg-gray-700 dark:text-gray-300">
            {monthAbbr}
          </div>
          <div className="flex items-center justify-center px-4 py-0.5 text-xl font-bold text-brand-500 dark:text-brand-400">{day}</div>
        </div>
        <div>
          <h1 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <time dateTime={formatYmdInTimeZone(currentDate, tz)}>{getTitle()}</time>
            <Badge variant="solid" color="primary" size="sm">
              Week {getWeekNumberInTimeZone(currentDate, tz)}
            </Badge>
          </h1>
          {getSubtitle() && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{getSubtitle()}</p>}
          {showTimeZoneLabel ? (
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400" title={tz}>
              {zoneOffsetLabel ? `${tz} (${zoneOffsetLabel})` : tz}
            </p>
          ) : null}
        </div>
      </div>
      <div className="flex items-center">
        {(showNavigationButtons.nav || showNavigationButtons.today) && (
          <NavigationButtons
            currentDate={currentDate}
            currentView={currentView}
            displayTimeZone={displayTimeZone}
            validRange={validRange}
            onPrevious={onPrevious}
            onNext={onNext}
            onToday={onToday}
            showNav={showNavigationButtons.nav}
            showToday={showNavigationButtons.today}
          />
        )}
        <div className={`flex items-center ${showNavigationButtons.nav || showNavigationButtons.today ? "ml-4" : ""}`}>
          {availableViews.length > 1 && (
            <div className="mr-4">
              <ButtonGroup variant="primary" buttons={getViewButtons()} className="!pb-0 [&>div>div]:!shadow-none" minWidth="auto" />
            </div>
          )}
          {onAddEvent && <div className="mr-6 h-6 w-px bg-gray-300 dark:bg-white/10" />}
          {onAddEvent && (
            <Button
              onClick={onAddEvent}
              variant="primary"
              size="sm"
              className="h-9 bg-brand-500 hover:bg-brand-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 dark:bg-brand-600 dark:hover:bg-brand-700 dark:focus-visible:outline-brand-700"
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

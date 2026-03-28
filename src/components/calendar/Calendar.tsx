import moment from "moment-timezone";
import { useEffect, useMemo, useState } from "react";
import CalendarToolBar from "./CalendarToolbar";
import DayView from "./DayView";
import MonthView from "./MonthView";
import { CalendarProps, CalendarView } from "./types";
import { resolveCalendarDisplayTimeZone } from "./utils";
import WeekView from "./WeekView";

const Calendar = ({
  currentDate = new Date(),
  timeZone: timeZoneProp,
  defaultView = "month",
  availableViews = ["day", "week", "month"],
  events = [],
  validRange,
  onDateChange,
  onViewChange,
  onEventClick,
  onEventContextMenu,
  onAddEvent,
  showNavigationButtons = true,
}: CalendarProps) => {
  const displayTimeZone = useMemo(() => resolveCalendarDisplayTimeZone(timeZoneProp), [timeZoneProp]);
  const timeZoneExplicit = Boolean(timeZoneProp?.trim());
  const [selectedDate, setSelectedDate] = useState<Date>(currentDate);

  // Validate and set initial view
  const getInitialView = (): CalendarView => {
    if (availableViews.includes(defaultView)) {
      return defaultView;
    }
    // If defaultView is not in availableViews, use the first available view
    return availableViews[0] || "month";
  };

  const [currentView, setCurrentView] = useState<CalendarView>(getInitialView());

  // Get showNavigationButtons value based on current view
  const getShowNavigationButtons = (): { nav: boolean; today: boolean } => {
    if (typeof showNavigationButtons === "boolean") {
      return { nav: showNavigationButtons, today: showNavigationButtons };
    }

    // If it's an object, get the value for current view
    const viewConfig = showNavigationButtons[currentView];

    if (viewConfig === undefined) {
      return { nav: false, today: false };
    }

    // If it's a boolean, use it for both nav and today
    if (typeof viewConfig === "boolean") {
      return { nav: viewConfig, today: viewConfig };
    }

    // If it's an object with nav and today properties
    return {
      nav: viewConfig.nav ?? false,
      today: viewConfig.today ?? false,
    };
  };

  // Validate currentView when availableViews changes
  useEffect(() => {
    if (!availableViews.includes(currentView)) {
      const fallbackView = availableViews[0] || "month";
      setCurrentView(fallbackView);
      onViewChange?.(fallbackView);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableViews]);

  const handleDateChange = (newDate: Date) => {
    setSelectedDate(newDate);
    onDateChange?.(newDate);
  };

  const handleViewChange = (newView: CalendarView) => {
    setCurrentView(newView);
    onViewChange?.(newView);
  };

  const handlePrevious = () => {
    const m = moment.tz(selectedDate, displayTimeZone);
    switch (currentView) {
      case "day":
        m.subtract(1, "day");
        break;
      case "week":
        m.subtract(7, "day");
        break;
      case "month":
        m.subtract(1, "month");
        break;
    }
    handleDateChange(m.startOf("day").toDate());
  };

  const handleNext = () => {
    const m = moment.tz(selectedDate, displayTimeZone);
    switch (currentView) {
      case "day":
        m.add(1, "day");
        break;
      case "week":
        m.add(7, "day");
        break;
      case "month":
        m.add(1, "month");
        break;
    }
    handleDateChange(m.startOf("day").toDate());
  };

  const handleToday = () => {
    handleDateChange(moment.tz(displayTimeZone).startOf("day").toDate());
  };

  const renderView = () => {
    const viewProps = {
      currentDate: selectedDate,
      displayTimeZone,
      events,
      validRange,
      onDateChange: handleDateChange,
      onEventClick,
      onEventContextMenu,
      onAddEvent,
    };

    switch (currentView) {
      case "day":
        return <DayView {...viewProps} />;
      case "week":
        return <WeekView {...viewProps} />;
      case "month":
        return <MonthView {...viewProps} />;
    }
  };

  return (
    <div className="flex h-full flex-col">
      <CalendarToolBar
        currentDate={selectedDate}
        displayTimeZone={displayTimeZone}
        showTimeZoneLabel={timeZoneExplicit}
        currentView={currentView}
        availableViews={availableViews}
        validRange={validRange}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onToday={handleToday}
        onViewChange={handleViewChange}
        onAddEvent={onAddEvent ? () => onAddEvent() : undefined}
        showNavigationButtons={getShowNavigationButtons()}
      />
      {renderView()}
    </div>
  );
};

export default Calendar;

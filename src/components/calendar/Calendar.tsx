import { useEffect, useState } from "react";
import CalendarToolBar from "./CalendarToolbar";
import DayView from "./DayView";
import MonthView from "./MonthView";
import { CalendarProps, CalendarView } from "./types";
import WeekView from "./WeekView";

const Calendar = ({
  currentDate = new Date(),
  defaultView = "month",
  firstDayOfWeek = "monday",
  availableViews = ["day", "week", "month"],
  events = [],
  onDateChange,
  onViewChange,
  onEventClick,
  onAddEvent,
}: CalendarProps) => {
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
    const newDate = new Date(selectedDate);
    switch (currentView) {
      case "day":
        newDate.setDate(newDate.getDate() - 1);
        break;
      case "week":
        newDate.setDate(newDate.getDate() - 7);
        break;
      case "month":
        newDate.setMonth(newDate.getMonth() - 1);
        break;
    }
    handleDateChange(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(selectedDate);
    switch (currentView) {
      case "day":
        newDate.setDate(newDate.getDate() + 1);
        break;
      case "week":
        newDate.setDate(newDate.getDate() + 7);
        break;
      case "month":
        newDate.setMonth(newDate.getMonth() + 1);
        break;
    }
    handleDateChange(newDate);
  };

  const handleToday = () => {
    handleDateChange(new Date());
  };

  const renderView = () => {
    const viewProps = {
      currentDate: selectedDate,
      firstDayOfWeek,
      events,
      onDateChange: handleDateChange,
      onEventClick,
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
        currentView={currentView}
        firstDayOfWeek={firstDayOfWeek}
        availableViews={availableViews}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onToday={handleToday}
        onViewChange={handleViewChange}
        onAddEvent={onAddEvent}
      />
      {renderView()}
    </div>
  );
};

export default Calendar;

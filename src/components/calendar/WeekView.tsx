import moment from "moment-timezone";
import { MdAdd } from "react-icons/md";
import EventBlock from "./EventBlock";
import { CalendarViewProps } from "./types";
import {
  computeOverlappingEventLayouts,
  formatWeekdayInTimeZone,
  getMinutesFromZonedMidnight,
  getWeekDatesInTimeZone,
  getZonedDayBounds,
  isDateInRange,
  isSameCalendarDayInTimeZone,
} from "./utils";

const WeekView = ({
  currentDate,
  displayTimeZone,
  events = [],
  validRange,
  onEventClick,
  onDateChange,
  onAddEvent,
  onEventContextMenu,
}: CalendarViewProps) => {
  const tz = displayTimeZone;
  const weekDates = getWeekDatesInTimeZone(currentDate, tz);
  const rangeStart = moment.tz(weekDates[0], tz).startOf("day").toDate();
  const rangeEnd = moment.tz(weekDates[6], tz).endOf("day").toDate();
  const weekEvents = events.filter((event) => {
    const eventStart = event.start instanceof Date ? event.start : new Date(event.start);
    const eventEnd = event.end instanceof Date ? event.end : new Date(event.end);
    return eventStart <= rangeEnd && eventEnd >= rangeStart;
  });

  // Generate 24 hours for time axis
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Generate 48 time slots (24 hours * 2 slots per hour = 30-minute intervals)
  // Each slot is 48px tall (h-24 = 96px / 2 = 48px for 30 minutes)
  // Total height: 48 * 48px = 2304px
  const timeSlots = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const isHalfHour = i % 2 === 1;
    return { hour, isHalfHour, index: i };
  });

  const getEventsForDay = (dayAnchor: Date) => {
    const { dayStart, dayEnd } = getZonedDayBounds(dayAnchor, tz);
    return weekEvents.filter((event) => {
      const eventStart = event.start instanceof Date ? event.start : new Date(event.start);
      const eventEnd = event.end instanceof Date ? event.end : new Date(event.end);
      return eventStart <= dayEnd && eventEnd >= dayStart;
    });
  };

  const getEventTop = (eventTime: string | Date, dayDate: Date): number => {
    const dateObj = eventTime instanceof Date ? eventTime : new Date(eventTime);
    const { dayStart } = getZonedDayBounds(dayDate, tz);
    if (dateObj < dayStart) {
      return 0;
    }
    const totalMinutes = getMinutesFromZonedMidnight(dateObj, tz);
    return (totalMinutes / 30) * 48;
  };

  const getEventHeight = (start: string | Date, end: string | Date, dayDate: Date): number => {
    const startDate = start instanceof Date ? start : new Date(start);
    const endDate = end instanceof Date ? end : new Date(end);
    const { dayStart, dayEnd } = getZonedDayBounds(dayDate, tz);
    const clampedStart = startDate < dayStart ? dayStart : startDate;
    const clampedEnd = endDate > dayEnd ? dayEnd : endDate;
    const diffMinutes = (clampedEnd.getTime() - clampedStart.getTime()) / (1000 * 60);
    return Math.max((diffMinutes / 30) * 48, 48);
  };

  const isEventSpanningToNextDay = (_start: string | Date, end: string | Date, dayDate: Date): boolean => {
    const endDate = end instanceof Date ? end : new Date(end);
    const { dayEnd } = getZonedDayBounds(dayDate, tz);
    return endDate > dayEnd;
  };

  const isEventContinuingFromPreviousDay = (start: string | Date, dayDate: Date): boolean => {
    const startDate = start instanceof Date ? start : new Date(start);
    const { dayStart } = getZonedDayBounds(dayDate, tz);
    return startDate < dayStart;
  };

  const isEventFullyWithinDay = (start: string | Date, end: string | Date, dayDate: Date): boolean => {
    const startDate = start instanceof Date ? start : new Date(start);
    const endDate = end instanceof Date ? end : new Date(end);
    const { dayStart, dayEnd } = getZonedDayBounds(dayDate, tz);
    return startDate >= dayStart && endDate <= dayEnd;
  };

  return (
    <div className="flex flex-1 flex-col overflow-auto max-md:hidden border border-gray-300 dark:border-white/10 rounded-b-2xl">
      {/* Header with weekday labels */}
      <div className="sticky top-0 grid grid-cols-7 bg-white dark:bg-gray-900 pl-18 shadow-sm border-b border-gray-300 dark:border-white/10">
        {weekDates.map((date, index) => {
          const isToday = isSameCalendarDayInTimeZone(new Date(), date, tz);
          const isSelected = isSameCalendarDayInTimeZone(currentDate, date, tz);

          const isInRange = isDateInRange(date, validRange, tz);
          const isDisabled = !isInRange;

          return (
            <div
              key={index}
              onClick={() => {
                if (!isDisabled) {
                  onDateChange(date);
                }
              }}
              className={`relative flex w-full flex-col items-center justify-center gap-1.5 bg-white dark:bg-gray-900 p-2 md:flex-row md:gap-1 hover:bg-gray-50 dark:hover:bg-gray-800/50 before:pointer-events-none before:absolute before:inset-0 before:border-gray-300 dark:before:border-white/10 not-last:before:border-r first:before:-left-px first:before:border-l transition-colors ${
                isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{formatWeekdayInTimeZone(date, "short", tz)}</span>
              <span
                className={`flex h-6 items-center justify-center text-xs font-semibold ${
                  isToday
                    ? "w-6 rounded-full bg-indigo-600 text-white dark:bg-indigo-500"
                    : isSelected
                      ? "w-6 rounded-full bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                      : "text-gray-900 dark:text-white"
                }`}
              >
                {moment.tz(date, tz).date()}
              </span>
            </div>
          );
        })}
      </div>

      <div className="relative flex flex-1 overflow-y-auto">
        {/* Left time axis */}
        <div className="flex h-max w-18 flex-col border-r border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-gray-800/50">
          {hours.map((hour) => (
            <div key={hour} className="group relative flex h-24 items-start justify-end bg-gray-50 dark:bg-gray-800/50 pr-2">
              <span className="text-right text-xs font-medium whitespace-nowrap text-gray-500 dark:text-gray-400 group-first:translate-y-1">
                {hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
              </span>
            </div>
          ))}
        </div>

        {/* Main grid for days and events */}
        <div className="grid flex-1 grid-cols-7">
          {weekDates.map((date, dayIndex) => {
            const dayEvents = getEventsForDay(date);
            const overlapLayouts = computeOverlappingEventLayouts(dayEvents);
            const isLastColumn = dayIndex === 6;
            return (
              <div key={dayIndex} className="flex flex-col border-gray-300 dark:border-white/10">
                <div className="relative flex-1 bg-white dark:bg-gray-900" style={{ minHeight: "2304px" }}>
                  {/* Hoverable time slots with Add event buttons */}
                  {/* Render 48 time slots, each 48px tall (30-minute intervals) */}
                  {timeSlots.map((slot) => {
                    const isLastSlot = slot.index === 47;
                    const top = slot.index * 48; // Each slot is 48px

                    // Calculate start time for this slot (HH:mm format)
                    const startHour = slot.hour;
                    const startMinute = slot.isHalfHour ? 30 : 0;
                    const startTime = `${startHour.toString().padStart(2, "0")}:${startMinute.toString().padStart(2, "0")}`;

                    // Calculate end time for this slot (30 minutes later, HH:mm format)
                    const endHour = slot.isHalfHour ? (slot.hour + 1) % 24 : slot.hour;
                    const endMinute = slot.isHalfHour ? 0 : 30;
                    const endTime = `${endHour.toString().padStart(2, "0")}:${endMinute.toString().padStart(2, "0")}`;

                    return (
                      <div
                        key={slot.index}
                        className={`group relative flex h-12 flex-col bg-white dark:bg-gray-900 p-1.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 before:pointer-events-none before:absolute before:inset-0 before:border-r before:border-b before:border-gray-200 dark:before:border-white/5 ${
                          isLastSlot ? "last:before:border-b-0" : ""
                        } ${isLastColumn ? "before:border-r-0" : ""} transition-colors`}
                        style={{
                          position: "absolute",
                          top: `${top}px`,
                          left: 0,
                          width: "100%",
                          height: "48px",
                        }}
                      >
                        {onAddEvent && (
                          <div className="absolute right-1.5 bottom-1.5 hidden group-hover:inline-flex z-20">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddEvent(date, startTime, endTime);
                              }}
                              className="flex items-center justify-center size-7 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                              aria-label="Add event"
                            >
                              <MdAdd className="size-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Events */}
                  {dayEvents.map((event) => {
                    const eventTop = getEventTop(event.start, date);
                    const eventHeight = getEventHeight(event.start, event.end, date);
                    const isSpanning = isEventSpanningToNextDay(event.start, event.end, date);
                    const isContinuing = isEventContinuingFromPreviousDay(event.start, date);
                    const isFullDay = isEventFullyWithinDay(event.start, event.end, date);
                    const horizontalLayout = overlapLayouts.get(String(event.id));

                    return (
                      <EventBlock
                        key={`${dayIndex}-${event.id}`}
                        event={event}
                        top={eventTop}
                        height={eventHeight}
                        isSpanning={isSpanning}
                        isContinuing={isContinuing}
                        isFullDay={isFullDay}
                        dayDate={date}
                        horizontalLayout={horizontalLayout}
                        onEventClick={onEventClick}
                        onContextMenu={onEventContextMenu}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WeekView;

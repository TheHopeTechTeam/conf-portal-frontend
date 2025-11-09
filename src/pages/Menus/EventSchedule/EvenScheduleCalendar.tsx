import { CalendarEvent } from "@/components/calendar";
import Calendar from "@/components/calendar/Calendar";

export default function EventScheduleCalendar() {
  // Create dates in local timezone
  // Use new Date(year, month, day, hour, minute, second) to ensure local time
  const events: CalendarEvent[] = [
    {
      id: 1,
      title: "Event 1",
      start: new Date(2025, 10, 7, 0, 0, 0), // November 7, 2025, 00:00:00 (month is 0-indexed)
      end: new Date(2025, 10, 7, 1, 0, 0), // November 7, 2025, 01:00:00
      item: {
        id: 1,
        title: "Event 1",
        description: "Event 1 description",
        start: new Date(2025, 10, 7, 0, 0, 0),
        end: new Date(2025, 10, 7, 1, 0, 0),
      },
    },
    {
      id: 2,
      title: "Event 2",
      start: new Date(2025, 10, 7, 1, 0, 0), // November 7, 2025, 01:00:00
      end: new Date(2025, 10, 7, 2, 0, 0), // November 7, 2025, 02:00:00
    },
  ];

  // Create validRange in local timezone
  // Use new Date(year, month, day) to ensure local time
  const validRange = {
    start: new Date(2025, 10, 1), // November 1, 2025 (month is 0-indexed)
    end: new Date(2025, 10, 30), // November 30, 2025
  };

  return (
    <div className="flex h-full flex-col">
      <Calendar
        currentDate={new Date()}
        defaultView="week"
        availableViews={["week", "day"]}
        events={events}
        validRange={validRange}
        onDateChange={(date) => console.log("Date changed:", date)}
        onViewChange={(view) => console.log("View changed:", view)}
        onEventClick={(event) => console.log("Event clicked:", event)}
        onAddEvent={() => console.log("Add event clicked")}
      />
    </div>
  );
}

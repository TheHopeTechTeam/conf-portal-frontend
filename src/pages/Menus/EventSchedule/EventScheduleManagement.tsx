import { CalendarEvent } from "@/components/calendar";
import Calendar from "@/components/calendar/Calendar";
import ManagementPage from "@/components/common/ManagementPage";

export default function EventScheduleManagement() {
  const events: CalendarEvent[] = [
    {
      id: 1,
      title: "Event 1",
      start: new Date("2025-11-07T00:00:00"),
      end: new Date("2025-11-07T01:00:00"),
      item: {
        id: 1,
        title: "Event 1",
        description: "Event 1 description",
        start: new Date("2025-11-07T00:00:00"),
        end: new Date("2025-11-07T01:00:00"),
      },
    },
    {
      id: 2,
      title: "Event 2",
      start: new Date("2025-11-07T01:00:00"),
      end: new Date("2025-11-07T02:00:00"),
    },
  ];
  return (
    <ManagementPage title="活動時程管理" description="管理活動時程">
      <Calendar
        currentDate={new Date()}
        defaultView="month"
        firstDayOfWeek="sunday"
        availableViews={["week", "day"]}
        events={events}
        onDateChange={(date) => console.log("Date changed:", date)}
        onViewChange={(view) => console.log("View changed:", view)}
        onEventClick={(event) => console.log("Event clicked:", event)}
        onAddEvent={() => console.log("Add event clicked")}
      />
    </ManagementPage>
  );
}

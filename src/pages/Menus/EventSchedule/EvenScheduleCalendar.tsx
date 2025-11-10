import { ConferenceItem } from "@/api/services/conferenceService";
import { EventInfoItem, eventInfoService } from "@/api/services/eventInfoService";
import { CalendarEvent } from "@/components/calendar";
import Calendar from "@/components/calendar/Calendar";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import moment from "moment-timezone";
import { useEffect, useMemo, useState } from "react";

interface EventScheduleCalendarProps {
  conference: ConferenceItem;
}

/**
 * Parse a datetime string without timezone info and convert it to a Date object
 * based on the specified timezone.
 *
 * The datetime string is in the format "YYYY-MM-DDTHH:mm:ss" (no timezone),
 * and it represents a time in the specified timezone (e.g., "Asia/Taipei").
 *
 * Uses moment-timezone to parse the datetime string as a local time in the specified timezone
 * and convert it to a JavaScript Date object (which represents UTC time internally).
 *
 * @param dateTimeString Datetime string (e.g., "2024-01-01T09:00:00" or "2024-01-01T09:00:00Z")
 * @param timezone Timezone name (e.g., "Asia/Taipei")
 * @returns Date object that represents the correct UTC time
 */
const parseDateTimeWithTimezone = (dateTimeString: string, timezone: string): Date => {
  try {
    // Remove any timezone information (Z, +HH:MM, -HH:MM) from the string
    // The time should be interpreted according to the timezone parameter
    let cleanDateTimeString = dateTimeString.trim();

    // Remove 'Z' suffix (UTC indicator)
    if (cleanDateTimeString.endsWith("Z")) {
      cleanDateTimeString = cleanDateTimeString.slice(0, -1);
    }

    // Remove timezone offset (e.g., +08:00, -05:00)
    const timezoneOffsetPattern = /([+-]\d{2}):(\d{2})$/;
    if (timezoneOffsetPattern.test(cleanDateTimeString)) {
      cleanDateTimeString = cleanDateTimeString.replace(timezoneOffsetPattern, "");
    }

    // Remove milliseconds if present (e.g., .123)
    const millisecondsPattern = /\.\d{1,3}$/;
    if (millisecondsPattern.test(cleanDateTimeString)) {
      cleanDateTimeString = cleanDateTimeString.replace(millisecondsPattern, "");
    }

    // Validate timezone name
    if (!timezone || typeof timezone !== "string") {
      throw new Error(`Invalid timezone: ${timezone}`);
    }

    // Use moment-timezone to parse the datetime string as a local time in the specified timezone
    // moment.tz() interprets the input string as a time in the specified timezone
    // and returns a moment object representing the correct UTC time
    const momentDate = moment.tz(cleanDateTimeString, "YYYY-MM-DDTHH:mm:ss", timezone);

    // Validate the parsed moment object
    if (!momentDate.isValid()) {
      throw new Error(`Invalid datetime: ${dateTimeString} in timezone: ${timezone}`);
    }

    // Convert moment object to JavaScript Date object
    return momentDate.toDate();
  } catch (error) {
    console.error(`Error parsing datetime with timezone: ${dateTimeString}, ${timezone}`, error);

    // Fallback: try to parse using moment without timezone (as UTC)
    try {
      let cleanString = dateTimeString.trim();
      if (cleanString.endsWith("Z")) {
        cleanString = cleanString.slice(0, -1);
      }
      const timezoneOffsetPattern = /([+-]\d{2}):(\d{2})$/;
      if (timezoneOffsetPattern.test(cleanString)) {
        cleanString = cleanString.replace(timezoneOffsetPattern, "");
      }
      const millisecondsPattern = /\.\d{1,3}$/;
      if (millisecondsPattern.test(cleanString)) {
        cleanString = cleanString.replace(millisecondsPattern, "");
      }

      const fallbackMoment = moment.utc(cleanString, "YYYY-MM-DDTHH:mm:ss", true);
      if (fallbackMoment.isValid()) {
        console.warn(`Using UTC fallback for ${dateTimeString}`);
        return fallbackMoment.toDate();
      }
    } catch (fallbackError) {
      console.error("Fallback parsing also failed:", fallbackError);
    }

    // Last resort: return current date
    console.warn(`Could not parse date: ${dateTimeString}, returning current date`);
    return new Date();
  }
};

export default function EventScheduleCalendar({ conference }: EventScheduleCalendarProps) {
  const [events, setEvents] = useState<EventInfoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEventInfoList = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await eventInfoService.getList(conference.id);
        if (response.success && response.data) {
          setEvents(response.data.items || []);
        }
      } catch (err) {
        console.error("Failed to fetch event info list:", err);
        setError("載入活動資訊失敗，請稍後重試");
      } finally {
        setLoading(false);
      }
    };

    if (conference.id) {
      fetchEventInfoList();
    }
  }, [conference.id]);

  // Convert EventInfoItem to CalendarEvent
  const calendarEvents: CalendarEvent[] = useMemo(() => {
    return events.map((event) => ({
      id: event.id,
      title: event.title,
      start: parseDateTimeWithTimezone(event.startTime, event.timezone),
      end: parseDateTimeWithTimezone(event.endTime, event.timezone),
      textColor: event.textColor,
      backgroundColor: event.backgroundColor,
      item: event,
    }));
  }, [events]);

  // Create validRange from conference dates
  const validRange = useMemo(() => {
    return {
      start: new Date(conference.startDate),
      end: new Date(conference.endDate),
    };
  }, [conference.startDate, conference.endDate]);

  // Set currentDate to conference start date
  const currentDate = useMemo(() => {
    return new Date(conference.startDate);
  }, [conference.startDate]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner size="lg" text="載入活動資訊中..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-red-500 dark:text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <Calendar
        currentDate={currentDate}
        defaultView="week"
        availableViews={["week", "day"]}
        events={calendarEvents}
        validRange={validRange}
        onDateChange={(date) => console.log("Date changed:", date)}
        onViewChange={(view) => console.log("View changed:", view)}
        onEventClick={(event) => console.log("Event clicked:", event)}
        onAddEvent={() => console.log("Add event clicked")}
      />
    </div>
  );
}

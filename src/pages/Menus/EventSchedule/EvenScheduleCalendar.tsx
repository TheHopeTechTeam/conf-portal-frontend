import { ConferenceItem } from "@/api/services/conferenceService";
import { EventInfoCreate, EventInfoDetail, EventInfoItem, eventInfoService } from "@/api/services/eventInfoService";
import { CalendarEvent } from "@/components/calendar";
import Calendar from "@/components/calendar/Calendar";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ContextMenu from "@/components/DataPage/ContextMenu";
import { PageButtonType } from "@/components/DataPage/types";
import { useContextMenu } from "@/components/DataPage/useContextMenu";
import Button from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import moment from "moment-timezone";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MdDelete, MdEdit, MdVisibility } from "react-icons/md";
import EventDataForm from "./EventDataForm";
import EventDetailView from "./EventDetailView";

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

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedEvent, setSelectedEvent] = useState<EventInfoDetail | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [formDefaultDate, setFormDefaultDate] = useState<string | undefined>(undefined);
  const [formDefaultTime, setFormDefaultTime] = useState<string | undefined>(undefined);
  const [formDefaultEndTime, setFormDefaultEndTime] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Context menu
  const contextMenu = useContextMenu();

  // Fetch events
  const fetchEvents = useCallback(async () => {
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
  }, [conference.id]);

  useEffect(() => {
    if (conference.id) {
      fetchEvents();
    }
  }, [conference.id, fetchEvents]);

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

  // Handle add event
  const handleAddEvent = (date?: Date, startTime?: string, endTime?: string) => {
    const targetDate = date || currentDate;
    const targetStartTime = startTime || "09:00";
    const targetEndTime = endTime || "10:00";

    // If endTime is earlier than startTime (e.g., 23:30 -> 00:00), it means the event spans to next day
    // For now, we'll set endTime to 23:59 for same day events, or handle it in the form
    // The form will handle date adjustment if endTime < startTime

    setFormDefaultDate(moment(targetDate).format("YYYY-MM-DD"));
    setFormDefaultTime(targetStartTime);
    setFormDefaultEndTime(targetEndTime);
    setFormMode("create");
    setSelectedEvent(null);
    setIsFormModalOpen(true);
  };

  // Handle edit event
  const handleEditEvent = async (eventId: string) => {
    try {
      const response = await eventInfoService.getById(eventId);
      if (response.success && response.data) {
        setSelectedEvent(response.data);
        setFormMode("edit");
        setIsFormModalOpen(true);
        contextMenu.hideContextMenu();
      }
    } catch (err) {
      console.error("Failed to fetch event detail:", err);
    }
  };

  // Handle view event
  const handleViewEvent = async (eventId: string) => {
    setSelectedEventId(eventId);
    setIsDetailModalOpen(true);
    contextMenu.hideContextMenu();
  };

  // Handle delete event - show confirmation dialog
  const handleDeleteEvent = (eventId: string) => {
    setEventToDelete(eventId);
    setIsDeleteConfirmModalOpen(true);
    contextMenu.hideContextMenu();
  };

  // Confirm delete event
  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;

    try {
      setDeleting(true);
      await eventInfoService.remove(eventToDelete);
      await fetchEvents();
      setIsDeleteConfirmModalOpen(false);
      setEventToDelete(null);
      contextMenu.hideContextMenu();
    } catch (err) {
      console.error("Failed to delete event:", err);
      alert("刪除活動失敗，請稍後重試");
    } finally {
      setDeleting(false);
    }
  };

  // Cancel delete
  const handleCancelDelete = () => {
    setIsDeleteConfirmModalOpen(false);
    setEventToDelete(null);
  };

  // Handle event click
  const handleEventClick = (event: CalendarEvent) => {
    if (event.item && typeof event.item === "object" && "id" in event.item) {
      handleViewEvent(event.item.id as string);
    }
  };

  // Handle event context menu
  const handleEventContextMenu = (event: CalendarEvent, mouseEvent: React.MouseEvent) => {
    if (!event.item || typeof event.item !== "object" || !("id" in event.item)) {
      return;
    }

    const eventId = event.item.id as string;
    const buttons: PageButtonType[] = [
      {
        key: "view",
        text: "檢視",
        icon: <MdVisibility className="size-4" />,
        onClick: () => handleViewEvent(eventId),
        color: "default",
      },
      {
        key: "edit",
        text: "編輯",
        icon: <MdEdit className="size-4" />,
        onClick: () => handleEditEvent(eventId),
        color: "primary",
      },
      {
        key: "delete",
        text: "刪除",
        icon: <MdDelete className="size-4" />,
        onClick: () => handleDeleteEvent(eventId),
        color: "danger",
      },
    ];

    contextMenu.showContextMenu(mouseEvent, buttons);
  };

  // Handle form submit
  const handleFormSubmit = async (values: EventInfoCreate) => {
    try {
      setSubmitting(true);
      if (formMode === "create") {
        await eventInfoService.create(values);
      } else if (selectedEvent) {
        await eventInfoService.update(selectedEvent.id, values);
      }
      await fetchEvents();
      setIsFormModalOpen(false);
      setSelectedEvent(null);
    } catch (err) {
      console.error("Failed to save event:", err);
      alert(formMode === "create" ? "新增活動失敗，請稍後重試" : "更新活動失敗，請稍後重試");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle form cancel
  const handleFormCancel = () => {
    setIsFormModalOpen(false);
    setSelectedEvent(null);
    setFormDefaultDate(undefined);
    setFormDefaultTime(undefined);
    setFormDefaultEndTime(undefined);
  };

  // Handle detail modal close
  const handleDetailClose = () => {
    setIsDetailModalOpen(false);
    setSelectedEventId(null);
  };

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
    <>
      <div className="flex h-full flex-col">
        <Calendar
          currentDate={currentDate}
          defaultView="week"
          availableViews={["week", "day"]}
          events={calendarEvents}
          validRange={validRange}
          onViewChange={() => {}}
          onEventClick={handleEventClick}
          onEventContextMenu={handleEventContextMenu}
          onAddEvent={(date, startTime, endTime) => handleAddEvent(date, startTime, endTime)}
          showNavigationButtons={{
            month: { nav: false, today: false },
            week: { nav: false, today: false },
            day: { nav: true, today: false },
          }}
        />
      </div>

      {/* Context Menu */}
      <ContextMenu
        buttons={contextMenu.buttons}
        visible={contextMenu.visible}
        position={contextMenu.position}
        onClose={contextMenu.hideContextMenu}
      />

      {/* Form Modal */}
      <Modal
        title={formMode === "create" ? "新增活動" : "編輯活動"}
        isOpen={isFormModalOpen}
        onClose={handleFormCancel}
        className="max-w-2xl w-full mx-4 p-6"
      >
        <EventDataForm
          mode={formMode}
          conferenceId={conference.id}
          defaultValues={selectedEvent || undefined}
          defaultStartDate={formDefaultDate}
          defaultStartTime={formDefaultTime}
          defaultEndTime={formDefaultEndTime}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          submitting={submitting}
        />
      </Modal>

      {/* Detail Modal */}
      <Modal title="活動詳情" isOpen={isDetailModalOpen} onClose={handleDetailClose} className="max-w-2xl w-full mx-4 p-6">
        {selectedEventId && <EventDetailView eventId={selectedEventId} />}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={handleDetailClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            關閉
          </button>
          {selectedEventId && (
            <>
              <button
                type="button"
                onClick={() => {
                  handleDetailClose();
                  handleEditEvent(selectedEventId);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600"
              >
                編輯
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDetailClose();
                  handleDeleteEvent(selectedEventId);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
              >
                刪除
              </button>
            </>
          )}
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="確認刪除"
        isOpen={isDeleteConfirmModalOpen}
        onClose={handleCancelDelete}
        className="max-w-md w-full mx-4 p-6"
        showCloseButton={!deleting}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleCancelDelete} disabled={deleting}>
              取消
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
            >
              {deleting ? "刪除中..." : "確定刪除"}
            </Button>
          </div>
        }
      >
        <div className="text-gray-900 dark:text-white">
          <p>確定要刪除這個活動嗎？</p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">此操作無法復原。</p>
        </div>
      </Modal>
    </>
  );
}

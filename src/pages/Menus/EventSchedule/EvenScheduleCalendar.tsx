import { ConferenceItem } from "@/api/services/conferenceService";
import { EventInfoCreate, EventInfoDetail, EventInfoItem, eventInfoService } from "@/api/services/eventInfoService";
import { CalendarEvent } from "@/components/calendar";
import Calendar from "@/components/calendar/Calendar";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ContextMenu from "@/components/DataPage/ContextMenu";
import { MenuButtonType } from "@/components/DataPage/types";
import { useContextMenu } from "@/components/DataPage/useContextMenu";
import Button from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { parseApiDateTimeToDate } from "@/utils/timezone";
import moment from "moment-timezone";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MdDelete, MdEdit, MdVisibility } from "react-icons/md";
import EventDataForm from "./EventDataForm";
import EventDetailView from "./EventDetailView";

interface EventScheduleCalendarProps {
  conference: ConferenceItem;
}

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
  const contextMenu = useContextMenu<EventInfoItem>();

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
      start: parseApiDateTimeToDate(event.startTime, event.timezone),
      end: parseApiDateTimeToDate(event.endTime, event.timezone),
      timezone: event.timezone,
      textColor: event.textColor,
      backgroundColor: event.backgroundColor,
      item: event,
    }));
  }, [events]);

  // Valid range: first moment of startDate through last moment of endDate in the conference IANA timezone
  const validRange = useMemo(() => {
    const tz = conference.timezone?.trim() || "UTC";
    return {
      start: moment.tz(`${conference.startDate}T00:00:00`, tz).toDate(),
      end: moment.tz(`${conference.endDate}T23:59:59.999`, tz).toDate(),
    };
  }, [conference.startDate, conference.endDate, conference.timezone]);

  const currentDate = useMemo(() => {
    const tz = conference.timezone?.trim() || "UTC";
    return moment.tz(conference.startDate, "YYYY-MM-DD", tz).startOf("day").toDate();
  }, [conference.startDate, conference.timezone]);

  // Handle add event
  const handleAddEvent = (date?: Date, startTime?: string, endTime?: string) => {
    const targetDate = date || currentDate;
    const targetStartTime = startTime || "09:00";
    const targetEndTime = endTime || "10:00";

    // If endTime is earlier than startTime (e.g., 23:30 -> 00:00), it means the event spans to next day
    // For now, we'll set endTime to 23:59 for same day events, or handle it in the form
    // The form will handle date adjustment if endTime < startTime

    const confTz = conference.timezone?.trim() || "UTC";
    setFormDefaultDate(moment.tz(targetDate, confTz).format("YYYY-MM-DD"));
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
      const listItem = event.item as EventInfoItem;
      console.log("[EventSchedule] EventBlock open (calendar list data)", {
        calendarEvent: {
          id: event.id,
          title: event.title,
          start: event.start,
          end: event.end,
          timezone: event.timezone,
          textColor: event.textColor,
          backgroundColor: event.backgroundColor,
        },
        listItem,
      });
      handleViewEvent(event.item.id as string);
    }
  };

  // Handle event context menu
  const handleEventContextMenu = (event: CalendarEvent, mouseEvent: React.MouseEvent) => {
    if (!event.item || typeof event.item !== "object" || !("id" in event.item)) {
      return;
    }

    const eventItem = event.item as EventInfoItem;
    const buttons: MenuButtonType<EventInfoItem>[] = [
      {
        key: "view",
        text: "檢視",
        icon: <MdVisibility className="size-4" />,
        onClick: () => handleViewEvent(eventItem.id),
        variant: "default",
      },
      {
        key: "edit",
        text: "編輯",
        icon: <MdEdit className="size-4" />,
        onClick: () => handleEditEvent(eventItem.id),
        variant: "primary",
      },
      {
        key: "delete",
        text: "刪除",
        icon: <MdDelete className="size-4" />,
        onClick: () => handleDeleteEvent(eventItem.id),
        variant: "danger",
      },
    ];

    contextMenu.showContextMenu(mouseEvent, buttons, eventItem, 0);
  };

  // Handle form submit
  const handleFormSubmit = async (values: EventInfoCreate) => {
    if (formMode === "create") {
      console.log("[EventSchedule] Form submit before API (create)", { payload: values });
    } else if (selectedEvent) {
      console.log("[EventSchedule] Form submit before API (update)", {
        payload: values,
        previousDetail: selectedEvent,
      });
    }
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
          timeZone={conference.timezone?.trim() || undefined}
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
      {contextMenu.row && contextMenu.index !== undefined && (
        <ContextMenu
          buttons={contextMenu.buttons}
          row={contextMenu.row}
          index={contextMenu.index}
          visible={contextMenu.visible}
          position={contextMenu.position}
          onClose={contextMenu.hideContextMenu}
        />
      )}

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

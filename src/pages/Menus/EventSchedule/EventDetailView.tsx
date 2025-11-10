import { eventInfoService, EventInfoDetail } from "@/api/services/eventInfoService";
import Input from "@/components/ui/input";
import TextArea from "@/components/ui/textarea";
import { formatDateTimeLocal } from "@/utils/timezone";
import { useEffect, useState } from "react";

interface EventDetailViewProps {
  eventId: string;
}

const EventDetailView: React.FC<EventDetailViewProps> = ({ eventId }) => {
  const [eventData, setEventData] = useState<EventInfoDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEventDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await eventInfoService.getById(eventId);
        if (response.success && response.data) {
          setEventData(response.data);
        } else {
          setError("載入活動詳情失敗");
        }
      } catch (e) {
        console.error("Error fetching event detail:", e);
        setError("載入活動詳情失敗，請稍後重試");
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEventDetail();
    }
  }, [eventId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500 dark:text-gray-400">載入中...</div>
      </div>
    );
  }

  if (error || !eventData) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-red-500 dark:text-red-400">{error || "載入失敗"}</div>
      </div>
    );
  }

  const startDateTime = formatDateTimeLocal(eventData.startTime, eventData.timezone);
  const endDateTime = formatDateTimeLocal(eventData.endTime, eventData.timezone);
  const [startDate, startTime] = startDateTime.split("T");
  const [endDate, endTime] = endDateTime.split("T");

  return (
    <div className="space-y-6">
      {/* 基本資訊 */}
      <div>
        <Input id="title" label="活動標題" type="text" value={eventData.title} disabled />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input id="startDate" label="開始日期" type="text" value={startDate} disabled />
        </div>

        <div>
          <Input id="startTime" label="開始時間" type="text" value={startTime} disabled />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input id="endDate" label="結束日期" type="text" value={endDate} disabled />
        </div>

        <div>
          <Input id="endTime" label="結束時間" type="text" value={endTime} disabled />
        </div>
      </div>

      <div>
        <Input id="timezone" label="時區" type="text" value={eventData.timezone} disabled />
      </div>

      <div>
        <div className="flex items-center gap-3">
          <Input
            id="backgroundColor"
            label="背景顏色"
            type="color"
            value={eventData.backgroundColor}
            disabled
            className="w-20 h-11"
          />
          <Input
            id="backgroundColorText"
            type="text"
            value={eventData.backgroundColor}
            disabled
            className="flex-1"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3">
          <Input
            id="textColor"
            label="文字顏色"
            type="color"
            value={eventData.textColor}
            disabled
            className="w-20 h-11"
          />
          <Input
            id="textColorText"
            type="text"
            value={eventData.textColor}
            disabled
            className="flex-1"
          />
        </div>
      </div>

      {eventData.conference && (
        <div>
          <Input id="conference" label="會議" type="text" value={eventData.conference.title} disabled />
        </div>
      )}

      {/* 描述 */}
      {eventData.description && (
        <div>
          <TextArea id="description" label="描述" placeholder="" value={eventData.description || ""} disabled rows={3} />
        </div>
      )}

      {/* 備註 */}
      {eventData.remark && (
        <div>
          <TextArea id="remark" label="備註" placeholder="" value={eventData.remark || ""} disabled rows={3} />
        </div>
      )}
    </div>
  );
};

export default EventDetailView;


import { CalendarEvent } from "./types";

export interface EventColorClasses {
  bg: string;
  ring: string;
  hoverBg: string;
  text: string;
  timeText: string;
}

/**
 * Get event color classes based on event color
 */
export const getEventColorClasses = (color?: string): EventColorClasses => {
  switch (color) {
    case "blue":
      return {
        bg: "bg-blue-50",
        ring: "ring-blue-200",
        hoverBg: "hover:bg-blue-100",
        text: "text-blue-700",
        timeText: "text-blue-600",
      };
    case "purple":
      return {
        bg: "bg-purple-50",
        ring: "ring-purple-200",
        hoverBg: "hover:bg-purple-100",
        text: "text-purple-700",
        timeText: "text-purple-600",
      };
    case "green":
      return {
        bg: "bg-green-50",
        ring: "ring-green-200",
        hoverBg: "hover:bg-green-100",
        text: "text-green-700",
        timeText: "text-green-600",
      };
    case "red":
      return {
        bg: "bg-red-50",
        ring: "ring-red-200",
        hoverBg: "hover:bg-red-100",
        text: "text-red-700",
        timeText: "text-red-600",
      };
    case "orange":
      return {
        bg: "bg-orange-50",
        ring: "ring-orange-200",
        hoverBg: "hover:bg-orange-100",
        text: "text-orange-700",
        timeText: "text-orange-600",
      };
    default:
      // Default to purple-like color (using indigo as fallback)
      return {
        bg: "bg-indigo-50",
        ring: "ring-indigo-200",
        hoverBg: "hover:bg-indigo-100",
        text: "text-indigo-700",
        timeText: "text-indigo-600",
      };
  }
};

export interface EventBlockProps {
  event: CalendarEvent;
  top: number;
  height: number;
  onEventClick?: (event: CalendarEvent) => void;
}

/**
 * Event block component for rendering calendar events
 */
const EventBlock = ({ event, top, height, onEventClick }: EventBlockProps) => {
  const eventStart = new Date(event.start);
  const eventEnd = new Date(event.end);
  const startTimeString = eventStart.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const endTimeString = eventEnd.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  // TODO: 根據用戶設定textColor&backgroundColor來產生各項顏色類別 (ring, hoverBg)
  // e.g. textColor: text-[#bada55], backgroundColor: bg-[#FFFFFF]
  const colorClasses = getEventColorClasses(event.textColor);

  return (
    <div
      className="absolute w-full px-1.5 py-1.5"
      style={{
        top: `${top}px`,
        height: `${height}px`,
        left: 0,
      }}
    >
      <button
        type="button"
        onClick={() => onEventClick?.(event)}
        className={`flex h-full w-full flex-1 cursor-pointer flex-col gap-0.5 rounded-md px-2 py-1.5 ring-1 ring-inset ${colorClasses.bg} ${colorClasses.ring} ${colorClasses.hoverBg}`}
      >
        <div className="flex w-full flex-col items-start">
          <div className={`truncate text-xs font-semibold ${colorClasses.text}`}>{event.title}</div>
          <div className={`text-xs ${colorClasses.timeText}`}>
            {startTimeString}
            {height > 96 && ` – ${endTimeString}`}
          </div>
        </div>
      </button>
    </div>
  );
};

export default EventBlock;

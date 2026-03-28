import { cn } from "@/utils";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarEvent, EventHorizontalLayout } from "./types";
import {
  formatShortDateInTimeZone,
  formatShortDateRangeInTimeZone,
  formatTimeInTimeZone,
  formatUtcOffsetLabelAtInstant,
  isSameCalendarDayInTimeZone,
  resolveEventDisplayTimeZone,
} from "./utils";

export interface EventColorClasses {
  bg: string;
  border: string;
  hoverBg: string;
  text: string;
  timeText: string;
}

export interface EventColorStyles {
  backgroundColor?: string;
  color?: string;
}

/**
 * Get default event color classes based on color name
 */
const getDefaultColorClasses = (): EventColorClasses => {
  return {
    bg: "bg-brand-50",
    border: "border-brand-200",
    hoverBg: "hover:bg-brand-100",
    text: "text-brand-500",
    timeText: "text-brand-400",
  };
};

export interface EventBlockProps {
  event: CalendarEvent;
  top: number;
  height: number;
  isSpanning?: boolean; // Event spans to next day
  isContinuing?: boolean; // Event continues from previous day
  isFullDay?: boolean; // Event is fully within this day
  dayDate?: Date; // The date this event block represents
  /** When multiple events share the same time range, lay them out side by side in the day column. */
  horizontalLayout?: EventHorizontalLayout;
  onEventClick?: (event: CalendarEvent) => void;
  onContextMenu?: (event: CalendarEvent, mouseEvent: React.MouseEvent) => void;
}

const TOOLTIP_SHOW_DELAY_MS = 140;
const TOOLTIP_GAP_PX = 8;
const TOOLTIP_ESTIMATED_HEIGHT_PX = 96;

interface TooltipLayout {
  top: number;
  left: number;
  placeAbove: boolean;
}

/**
 * Event block component for rendering calendar events
 */
const EventBlock = ({ event, top, height, isSpanning, isContinuing, horizontalLayout, onEventClick, onContextMenu }: EventBlockProps) => {
  const eventStart = new Date(event.start);
  const eventEnd = new Date(event.end);
  const tooltipId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipLayout, setTooltipLayout] = useState<TooltipLayout | null>(null);

  const clearShowTimer = useCallback(() => {
    if (showTimerRef.current !== null) {
      clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }
  }, []);

  const updateTooltipLayout = useCallback(() => {
    const el = triggerRef.current;
    if (!el) {
      return;
    }
    const rect = el.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const placeAbove = spaceBelow < TOOLTIP_ESTIMATED_HEIGHT_PX && rect.top > spaceBelow;
    const left = rect.left + rect.width / 2;
    const topPx = placeAbove ? rect.top - TOOLTIP_GAP_PX : rect.bottom + TOOLTIP_GAP_PX;
    setTooltipLayout({ top: topPx, left, placeAbove });
  }, []);

  const scheduleShowTooltip = useCallback(() => {
    clearShowTimer();
    showTimerRef.current = setTimeout(() => {
      showTimerRef.current = null;
      updateTooltipLayout();
      setTooltipVisible(true);
    }, TOOLTIP_SHOW_DELAY_MS);
  }, [clearShowTimer, updateTooltipLayout]);

  const hideTooltip = useCallback(() => {
    clearShowTimer();
    setTooltipVisible(false);
    setTooltipLayout(null);
  }, [clearShowTimer]);

  useEffect(() => {
    return () => {
      clearShowTimer();
    };
  }, [clearShowTimer]);

  useEffect(() => {
    if (!tooltipVisible) {
      return;
    }
    const sync = () => {
      updateTooltipLayout();
    };
    window.addEventListener("scroll", sync, true);
    window.addEventListener("resize", sync);
    return () => {
      window.removeEventListener("scroll", sync, true);
      window.removeEventListener("resize", sync);
    };
  }, [tooltipVisible, updateTooltipLayout]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onContextMenu) {
      onContextMenu(event, e);
    }
  };

  const displayTimeZone = resolveEventDisplayTimeZone(event.timezone);
  const startTimeString = formatTimeInTimeZone(eventStart, displayTimeZone);
  const endTimeString = formatTimeInTimeZone(eventEnd, displayTimeZone);
  const offsetLabel = formatUtcOffsetLabelAtInstant(eventStart, displayTimeZone);
  const offsetSuffix = offsetLabel ? ` (${offsetLabel})` : "";

  const sameCalendarDay = isSameCalendarDayInTimeZone(eventStart, eventEnd, displayTimeZone);

  const dateLine = sameCalendarDay
    ? formatShortDateInTimeZone(eventStart, displayTimeZone)
    : formatShortDateRangeInTimeZone(eventStart, eventEnd, displayTimeZone);

  // Get default classes based on preset color name (if any)
  const defaultClasses = getDefaultColorClasses();

  // Build inline styles for custom colors
  // Normalize color values (trim whitespace, ensure proper format)
  const inlineStyles: EventColorStyles = {};
  if (event.backgroundColor) {
    inlineStyles.backgroundColor = event.backgroundColor.trim();
  }
  if (event.textColor) {
    inlineStyles.color = event.textColor.trim();
  }

  const colorClasses: EventColorClasses = {
    bg: event.backgroundColor ? "" : defaultClasses.bg,
    border: defaultClasses.border,
    hoverBg: event.backgroundColor ? "hover:brightness-95" : defaultClasses.hoverBg,
    text: event.textColor ? "" : defaultClasses.text,
    timeText: event.textColor ? "" : defaultClasses.timeText,
  };

  // Determine rounded corners based on event state
  // - isSpanning: remove bottom rounded (event continues to next day)
  // - isContinuing: remove top rounded (event continues from previous day)
  // - Both: remove both top and bottom rounded
  // - Neither: keep all rounded (default)
  const getEventClasses = (): string => {
    if (isSpanning && isContinuing) {
      return "border-x";
    } else if (isSpanning) {
      return "rounded-t-md border-x border-t";
    } else if (isContinuing) {
      return "rounded-b-md pt-3 border-x border-b";
    }
    return "rounded-md border";
  };

  const getPaddingClasses = (): string => {
    if (isSpanning && isContinuing) {
      return "px-1";
    } else if (isSpanning) {
      return "pt-1 px-1";
    } else if (isContinuing) {
      return "px-1 pb-1";
    }
    return "px-1 py-1";
  };

  const tooltipNode =
    tooltipVisible &&
    tooltipLayout &&
    typeof document !== "undefined" &&
    createPortal(
      <div
        id={tooltipId}
        role="tooltip"
        className={cn(
          "pointer-events-none fixed z-200 min-w-40 max-w-xs rounded-lg border px-3 py-2 shadow-lg",
          "border-gray-200 bg-white text-gray-900",
          "dark:border-white/10 dark:bg-gray-900 dark:text-gray-100",
        )}
        style={{
          top: tooltipLayout.top,
          left: tooltipLayout.left,
          transform: tooltipLayout.placeAbove ? "translate(-50%, -100%)" : "translateX(-50%)",
        }}
      >
        <span
          aria-hidden
          className={cn(
            "absolute left-1/2 size-2 -translate-x-1/2 rotate-45 border bg-white dark:bg-gray-900",
            tooltipLayout.placeAbove
              ? "-bottom-1 border-b border-r border-gray-200 dark:border-white/10"
              : "-top-1 border-l border-t border-gray-200 dark:border-white/10",
          )}
        />
        <div className="relative flex flex-col gap-1">
          <p className="text-sm font-semibold leading-snug text-gray-900 dark:text-white">{event.title}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{dateLine}</p>
          <p className="text-xs font-medium tabular-nums text-gray-700 dark:text-gray-300">
            {startTimeString} – {endTimeString}
            {offsetSuffix}
          </p>
        </div>
      </div>,
      document.body,
    );

  return (
    <div
      className={`absolute box-border min-w-0 max-w-full overflow-hidden ${getPaddingClasses()}`}
      style={{
        top: `${top}px`,
        height: `${height}px`,
        left: horizontalLayout ? `${horizontalLayout.leftPercent}%` : 0,
        width: horizontalLayout ? `${horizontalLayout.widthPercent}%` : "100%",
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-describedby={tooltipVisible ? tooltipId : undefined}
        onClick={() => onEventClick?.(event)}
        onContextMenu={handleContextMenu}
        onMouseEnter={scheduleShowTooltip}
        onMouseLeave={hideTooltip}
        onFocus={scheduleShowTooltip}
        onBlur={hideTooltip}
        className={cn(
          "flex h-full min-h-0 min-w-0 w-full flex-1 cursor-pointer flex-col gap-0.5 overflow-hidden",
          getEventClasses(),
          "px-1 py-0.5",
          colorClasses.bg,
          colorClasses.border,
          colorClasses.hoverBg,
          "relative",
        )}
        style={inlineStyles}
      >
        <div className="relative flex min-h-0 min-w-0 w-full max-w-full flex-col items-stretch overflow-hidden">
          <div className="flex min-h-0 min-w-0 w-full max-w-full flex-col items-stretch overflow-hidden">
            <div
              className={cn("min-w-0 max-w-full text-xs font-semibold text-start truncate", colorClasses.text)}
              style={inlineStyles.color ? { color: inlineStyles.color } : undefined}
            >
              {event.title}
            </div>
            <div
              className={cn("min-w-0 max-w-full truncate text-start text-xs", colorClasses.timeText)}
              style={inlineStyles.color ? { color: inlineStyles.color } : undefined}
            >
              {startTimeString}
              {height > 48 && ` – ${endTimeString}`}
              {offsetSuffix}
            </div>
          </div>
        </div>
      </button>
      {tooltipNode}
    </div>
  );
};

export default EventBlock;

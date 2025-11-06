import { useTheme } from "@/context/ThemeContext";
import React, { useMemo } from "react";

export type TooltipPlacement = "top" | "right" | "bottom" | "left";
type TooltipTheme = "light" | "dark" | "auto";

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  placement?: TooltipPlacement;
  theme?: TooltipTheme;
  enterDelay?: number;
  leaveDelay?: number;
}

function getPositionClasses(placement: TooltipPlacement) {
  switch (placement) {
    case "top":
      return {
        container: "bottom-full left-1/2 mb-2.5 -translate-x-1/2",
        arrow: "-bottom-1 left-1/2 -translate-x-1/2",
      };
    case "right":
      return {
        container: "left-full top-1/2 ml-2.5 -translate-y-1/2",
        arrow: "-left-1.5 top-1/2 -translate-y-1/2",
      };
    case "left":
      return {
        container: "right-full top-1/2 mr-2.5 -translate-y-1/2",
        arrow: "-right-1.5 top-1/2 -translate-y-1/2",
      };
    case "bottom":
      return {
        container: "left-1/2 top-full mt-2.5 -translate-x-1/2",
        arrow: "-top-1 left-1/2 -translate-x-1/2",
      };
    default:
      return {
        container: "left-1/2 top-full mt-2.5 -translate-x-1/2",
        arrow: "-top-1 left-1/2 -translate-x-1/2",
      };
  }
}

export default function Tooltip({
  content,
  children,
  placement = "bottom",
  theme = "auto",
  enterDelay = 100,
  leaveDelay = 100,
}: TooltipProps) {
  const pos = getPositionClasses(placement);
  const { theme: currentTheme } = useTheme();
  const [isVisible, setIsVisible] = React.useState(false);
  const [timeoutId, setTimeoutId] = React.useState<NodeJS.Timeout | null>(null);

  // auto: use opposite of current app theme
  const isDark = useMemo(() => {
    if (theme === "dark") return true;
    if (theme === "light") return false;
    // theme === 'auto'
    return currentTheme === "light"; // invert
  }, [theme, currentTheme]);

  const handleMouseEnter = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }

    if (enterDelay > 0) {
      const id = setTimeout(() => setIsVisible(true), enterDelay);
      setTimeoutId(id);
    } else {
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }

    if (leaveDelay > 0) {
      const id = setTimeout(() => setIsVisible(false), leaveDelay);
      setTimeoutId(id);
    } else {
      setIsVisible(false);
    }
  };

  React.useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  const bubbleClass = isDark ? "bg-[#1E2634] text-white" : "bg-white text-gray-700";
  const arrowBg = isDark ? "bg-[#1E2634]" : "bg-white";

  return (
    <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {children}
      <div
        className={`absolute z-999 ${pos.container} transition-opacity duration-200 ${
          isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="relative">
          <div className={`drop-shadow-4xl whitespace-nowrap rounded-lg px-3 py-3 text-xs font-medium ${bubbleClass}`}>{content}</div>
          <div className={`absolute ${pos.arrow} h-3 w-4 rotate-45 ${arrowBg}`}></div>
        </div>
      </div>
    </div>
  );
}

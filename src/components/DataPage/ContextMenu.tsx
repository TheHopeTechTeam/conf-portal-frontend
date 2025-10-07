import { useEffect, useRef, useState } from "react";
import { PageButtonType } from "./types";

interface ContextMenuProps {
  /** 選單按鈕 */
  buttons: PageButtonType[];
  /** 是否顯示 */
  visible: boolean;
  /** 位置 */
  position: { x: number; y: number };
  /** 關閉事件 */
  onClose: () => void;
  /** 容器樣式類名 */
  className?: string;
}

export default function ContextMenu({ buttons, visible, position, onClose, className }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  // 處理位置調整（避免超出視窗邊界）
  useEffect(() => {
    if (!visible || !menuRef.current) return;

    const menu = menuRef.current;
    const rect = menu.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    let x = position.x;
    let y = position.y;

    // 右邊界檢查
    if (x + rect.width > viewport.width) {
      x = viewport.width - rect.width - 10;
    }

    // 下邊界檢查
    if (y + rect.height > viewport.height) {
      y = viewport.height - rect.height - 10;
    }

    // 左邊界檢查
    if (x < 10) {
      x = 10;
    }

    // 上邊界檢查
    if (y < 10) {
      y = 10;
    }

    setAdjustedPosition({ x, y });
  }, [visible, position]);

  // 處理點擊外部關閉
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleScroll = () => {
      onClose();
    };

    const handleResize = () => {
      onClose();
    };

    if (visible) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("scroll", handleScroll, true);
      window.addEventListener("resize", handleResize);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [visible, onClose]);

  // 處理鍵盤事件
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [visible, onClose]);

  if (!visible || buttons.length === 0) {
    return null;
  }

  return (
    <div
      ref={menuRef}
      className={`
        fixed z-999999 w-full overflow-hidden rounded-lg border border-gray-200 
        bg-white dark:border-gray-700 dark:bg-gray-900 min-w-[160px] max-w-[240px]
        ${className || ""}
      `.trim()}
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
      }}
      role="menu"
      aria-label="右鍵選單"
    >
      <ul className="flex flex-col">
        {buttons.map((button) => {
          // 根據顏色變體決定樣式
          const getButtonStyles = () => {
            const baseStyles = "flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium disabled:opacity-50";

            switch (button.color) {
              case "primary":
                return `${baseStyles} text-brand-600 hover:bg-brand-50 hover:text-brand-700 dark:text-brand-400 dark:hover:bg-brand-500/[0.12] dark:hover:text-brand-300`;
              case "danger":
                return `${baseStyles} text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-500/[0.12] dark:hover:text-red-300`;
              case "warning":
                return `${baseStyles} text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700 dark:text-yellow-400 dark:hover:bg-yellow-500/[0.12] dark:hover:text-yellow-300`;
              case "success":
                return `${baseStyles} text-green-600 hover:bg-green-50 hover:text-green-700 dark:text-green-400 dark:hover:bg-green-500/[0.12] dark:hover:text-green-300`;
              default:
                return `${baseStyles} text-gray-500 hover:bg-brand-50 hover:text-brand-500 dark:text-gray-400 dark:hover:bg-brand-500/[0.12] dark:hover:text-brand-400`;
            }
          };

          return (
            <li key={button.key} className="border-b border-gray-200 last:border-b-0 dark:border-gray-800">
              <button
                className={`${getButtonStyles()} ${button.className || ""}`}
                onClick={() => {
                  button.onClick?.();
                  onClose();
                }}
                disabled={button.disabled}
              >
                {button.icon && <span className="flex-shrink-0">{button.icon}</span>}
                <span className="whitespace-nowrap">{button.text}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

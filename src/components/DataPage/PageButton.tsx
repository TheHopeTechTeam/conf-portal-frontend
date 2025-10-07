import Popover from "@/components/ui/popover";
import Tooltip from "@/components/ui/tooltip";
import { PageButtonType } from "./types";

interface PageButtonProps {
  /** 按鈕配置 */
  button: PageButtonType;
  /** 顯示模式 */
  mode: "toolbar" | "contextmenu";
}

export default function PageButton({ button, mode }: PageButtonProps) {
  const {
    key,
    text,
    icon,
    onClick,
    disabled = false,
    loading = false,
    variant = "outline",
    size = "sm",
    tooltip,
    flat = false,
    popover,
    className,
  } = button;

  // 根據模式決定顯示內容
  const showIcon = mode === "toolbar" || mode === "contextmenu";
  const showText = mode === "contextmenu";
  const showTooltip = mode === "toolbar" && (tooltip || text) && !popover;

  // 樣式配置
  const getVariantClasses = () => {
    switch (variant) {
      case "primary":
        return "bg-brand-500 text-white hover:bg-brand-600 dark:bg-brand-600 dark:hover:bg-brand-700";
      case "ghost":
        return "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800";
      case "outline":
      default:
        return "border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800";
    }
  };

  const getSizeClasses = () => {
    // 工具列按鈕採用等寬等高，讓外觀更方正
    if (mode === "toolbar") {
      switch (size) {
        case "lg":
          return "w-10 h-10 text-sm";
        case "md":
          return "w-9 h-9 text-sm";
        case "sm":
        default:
          return "w-8 h-8 text-xs";
      }
    }

    // 右鍵選單/列表等情境維持原本 padding 式樣
    switch (size) {
      case "lg":
        return "px-4 py-2 text-sm";
      case "md":
        return "px-3 py-1.5 text-sm";
      case "sm":
      default:
        return "px-2 py-1 text-xs";
    }
  };

  const baseClasses = `
    inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-brand-500/20
    ${getVariantClasses()}
    ${getSizeClasses()}
    ${flat ? "shadow-none" : "shadow-theme-xs"}
    ${className || ""}
  `.trim();

  const buttonElement = (
    <button key={key} className={baseClasses} onClick={onClick} disabled={disabled || loading} aria-label={text}>
      {loading && (
        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {!loading && showIcon && icon && <span className="flex-shrink-0">{icon}</span>}
      {showText && text && <span className="whitespace-nowrap">{text}</span>}
    </button>
  );

  const wrappedWithTooltip = showTooltip ? (
    <Tooltip content={tooltip || text}>
      <span className="inline-block">{buttonElement}</span>
    </Tooltip>
  ) : (
    buttonElement
  );

  if (mode === "toolbar" && popover) {
    return (
      <Popover
        title={popover.title}
        position={popover.position || "bottom"}
        trigger={<span className="inline-block">{wrappedWithTooltip}</span>}
      >
        {popover.content}
      </Popover>
    );
  }

  return wrappedWithTooltip;
}

import { ToolbarButtonGroup } from "./PageButtonGroup";
import { PageButtonType } from "./types";

interface DataTableToolbarProps {
  /** 工具欄按鈕 */
  buttons?: PageButtonType[];
  /** 資源名稱（用於權限檢查） */
  resource: string;
  /** 容器樣式類名 */
  className?: string;
}

export default function DataTableToolbar({ buttons = [], resource, className }: DataTableToolbarProps) {
  // 依 align 分群（預設為左側）
  const leftButtons = (buttons || []).filter((b) => !b.align || b.align === "left");
  const rightButtons = (buttons || []).filter((b) => b.align === "right");

  // 如果沒有任何按鈕，不顯示 toolbar
  if (leftButtons.length === 0 && rightButtons.length === 0) {
    return null;
  }

  return (
    <div
      className={`flex gap-2 px-4 py-4 border border-gray-100 dark:border-white/[0.05] rounded-t-xl sm:flex-row sm:items-center sm:justify-between ${
        className || ""
      }`}
    >
      {/* 左側：功能按鈕（align: left 或未指定） */}
      <div className="flex gap-3 sm:flex-row sm:items-center">
        {leftButtons.length > 0 && <ToolbarButtonGroup buttons={leftButtons} resource={resource} align="left" gap="md" />}
      </div>

      <div className="flex items-center gap-2">
        {/* 右側：功能按鈕（align: right） */}
        {rightButtons.length > 0 && <ToolbarButtonGroup buttons={rightButtons} resource={resource} align="right" gap="md" />}
      </div>
    </div>
  );
}

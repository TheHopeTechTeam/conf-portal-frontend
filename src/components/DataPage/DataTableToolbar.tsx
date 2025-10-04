import Tooltip from "@/components/ui/tooltip";
import { useState } from "react";
import { MdClear, MdOutlineRecycling, MdSearch } from "react-icons/md";
import { ToolbarButtonGroup } from "./PageButtonGroup";
import { PageButton } from "./types";

interface DataTableToolbarProps {
  /** 搜尋關鍵字 */
  keyword?: string;
  /** 搜尋變更事件 */
  onKeywordChange?: (keyword: string) => void;
  /** 搜尋事件 */
  onSearch?: (keyword: string) => void;
  /** 是否顯示搜尋功能 */
  searchable?: boolean;
  /** 搜尋佔位符文字 */
  searchPlaceholder?: string;
  /** 工具欄按鈕 */
  buttons?: PageButton[];
  /** 是否顯示回收站切換 */
  showRecycleToggle?: boolean;
  /** 回收站狀態 */
  showDeleted?: boolean;
  /** 回收站切換事件 */
  onRecycleToggle?: (showDeleted: boolean) => void;
  /** 容器樣式類名 */
  className?: string;
}

export default function DataTableToolbar({
  keyword = "",
  onKeywordChange,
  onSearch,
  searchable = true,
  searchPlaceholder = "搜尋...",
  buttons = [],
  showRecycleToggle = false,
  showDeleted = false,
  onRecycleToggle,
  className,
}: DataTableToolbarProps) {
  const [localKeyword, setLocalKeyword] = useState(keyword);

  // 依 align 分群（預設為左側）
  const leftButtons = (buttons || []).filter((b) => b.align !== "right");
  const rightButtons = (buttons || []).filter((b) => b.align === "right");

  // 處理搜尋輸入
  const handleKeywordChange = (value: string) => {
    setLocalKeyword(value);
    onKeywordChange?.(value);
  };

  // 處理搜尋
  const handleSearch = () => {
    onSearch?.(localKeyword);
  };

  // 清除搜尋
  const handleClearSearch = () => {
    setLocalKeyword("");
    onKeywordChange?.("");
    onSearch?.("");
  };

  // 處理 Enter 鍵搜尋
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div
      className={`flex gap-2 px-4 py-4 border border-gray-100 dark:border-white/[0.05] rounded-t-xl sm:flex-row sm:items-center sm:justify-between ${
        className || ""
      }`}
    >
      {/* 左側：功能按鈕（align: left 或未指定） */}
      <div className="flex gap-3 sm:flex-row sm:items-center">
        {leftButtons.length > 0 && <ToolbarButtonGroup buttons={leftButtons} align="left" gap="md" />}
      </div>

      <div className="flex items-center gap-2">
        {/* 右側：功能按鈕（align: right） */}
        {rightButtons.length > 0 && <ToolbarButtonGroup buttons={rightButtons} align="right" gap="md" />}
        {/* 右側：回收站切換（改為 icon 按鈕） */}
        {showRecycleToggle && (
          <Tooltip content="顯示已刪除項目">
            <button
              type="button"
              aria-label="顯示已刪除項目"
              onClick={() => onRecycleToggle?.(!showDeleted)}
              className={`${
                showDeleted
                  ? "bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                  : "border border-red-300 text-red-500 hover:bg-red-50 dark:border-red-600 dark:text-red-500 dark:hover:bg-red-800"
              } inline-flex items-center justify-center w-9 h-9 rounded-md shadow-theme-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20`}
            >
              <MdOutlineRecycling className="w-4 h-4" />
            </button>
          </Tooltip>
        )}

        {/* 搜尋輸入框 */}
        {searchable && (
          <div className="relative">
            <button
              className="absolute text-gray-500 -translate-y-1/2 left-4 top-1/2 dark:text-gray-400"
              onClick={handleSearch}
              aria-label="搜尋"
            >
              <MdSearch className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={localKeyword}
              onChange={(e) => handleKeywordChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={searchPlaceholder}
              className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-11 pr-10 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[300px]"
            />

            {/* 清除按鈕 */}
            {localKeyword && (
              <button
                className="absolute text-gray-400 hover:text-gray-600 -translate-y-1/2 right-3 top-1/2 dark:text-gray-500 dark:hover:text-gray-300"
                onClick={handleClearSearch}
                aria-label="清除搜尋"
              >
                <MdClear className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

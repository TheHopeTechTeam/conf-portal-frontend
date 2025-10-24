import Checkbox from "@/components/form/input/Checkbox";
import { TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { DataTableColumn } from "./types";

interface DataTableHeaderProps<T> {
  /** 欄位定義 */
  columns: DataTableColumn<T>[];
  /** 是否為單選模式 */
  singleSelect?: boolean;
  /** 當前排序欄位 */
  orderBy?: string;
  /** 是否降序 */
  descending?: boolean;
  /** 排序事件 */
  onSort?: (columnKey: string) => void;
  /** 全選事件 */
  onSelectAll?: (checked: boolean) => void;
  /** 已選取數量 */
  selectedCount?: number;
  /** 總數量 */
  totalCount?: number;
  /** 樣式類名 */
  className?: string;
}

export default function DataTableHeader<T>({
  columns,
  singleSelect = false,
  orderBy,
  descending = false,
  onSort,
  onSelectAll,
  selectedCount = 0,
  totalCount = 0,
  className,
}: DataTableHeaderProps<T>) {
  const isAllSelected = totalCount > 0 && selectedCount === totalCount;
  const hasExpandColumn = columns.some((c) => typeof c.renderExpand === "function");

  const handleSelectAll = (checked: boolean) => {
    onSelectAll?.(checked);
  };

  const handleSort = (columnKey: string) => {
    onSort?.(columnKey);
  };

  const renderSortIcon = (columnKey: string) => {
    const isActive = orderBy === columnKey;

    return (
      <div className="flex flex-col gap-0.5">
        {/* 上箭頭 - 升序 */}
        <svg
          className={isActive && !descending ? "text-brand-500" : "text-gray-300 dark:text-gray-700"}
          width="8"
          height="5"
          viewBox="0 0 8 5"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.40962 0.585167C4.21057 0.300808 3.78943 0.300807 3.59038 0.585166L1.05071 4.21327C0.81874 4.54466 1.05582 5 1.46033 5H6.53967C6.94418 5 7.18126 4.54466 6.94929 4.21327L4.40962 0.585167Z"
            fill="currentColor"
          />
        </svg>
        {/* 下箭頭 - 降序 */}
        <svg
          className={isActive && descending ? "text-brand-500" : "text-gray-300 dark:text-gray-700"}
          width="8"
          height="5"
          viewBox="0 0 8 5"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.40962 4.41483C4.21057 4.69919 3.78943 4.69919 3.59038 4.41483L1.05071 0.786732C0.81874 0.455343 1.05582 0 1.46033 0H6.53967C6.94418 0 7.18126 0.455342 6.94929 0.786731L4.40962 4.41483Z"
            fill="currentColor"
          />
        </svg>
      </div>
    );
  };

  return (
    <TableHeader className={className}>
      <TableRow className="border-l border-b border-gray-100 dark:border-white/[0.05]">
        {/* 選取欄位 */}
        {!singleSelect && onSelectAll && (
          <TableCell isHeader className="px-2 py-3 w-12">
            <div className="flex items-center justify-center">
              <Checkbox checked={isAllSelected} onChange={handleSelectAll} />
            </div>
          </TableCell>
        )}

        {/* 動態欄位 */}
        {columns.map((column, columnIndex) => {
          if (column.visible === false) return null;

          const firstColumn = columnIndex === 0 && singleSelect ? "pl-8" : "";
          const isSortable = column.sortable && onSort;
          const isActive = orderBy === column.key;
          const isLastColumn = columnIndex === columns.filter((c) => c.visible !== false).length - 1;
          const shouldShowExpandHeader = hasExpandColumn && isLastColumn;

          return (
            <TableCell
              key={column.key}
              isHeader
              className={`${firstColumn} px-4 py-3 border-b border-gray-100 dark:border-white/[0.05] ${column.className || ""}`}
              style={{
                width: column.width,
                minWidth: column.minWidth,
                maxWidth: column.maxWidth,
              }}
            >
              <div
                className={`flex items-center justify-between ${isSortable ? "cursor-pointer" : ""}`}
                onClick={() => isSortable && handleSort(column.key)}
              >
                <span
                  className={`font-medium text-gray-700 text-theme-xs dark:text-gray-400 ${isActive ? "text-brand-500" : ""}`}
                  style={{ textAlign: column.align || "start" }}
                >
                  {column.label}
                </span>
                <div className="flex items-center gap-2">
                  {isSortable && renderSortIcon(column.key)}
                  {shouldShowExpandHeader && (
                    <span className="w-4 h-4 flex-shrink-0" aria-hidden="true">
                      {/* 展開圖標的佔位空間 */}
                    </span>
                  )}
                </div>
              </div>
            </TableCell>
          );
        })}
      </TableRow>
    </TableHeader>
  );
}

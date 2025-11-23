import Checkbox from "@/components/ui/checkbox";
import Spinner from "@/components/ui/spinner";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import Tooltip from "@/components/ui/tooltip";
import { Fragment } from "react";
import { DataTableColumn } from "./types";

interface DataTableBodyProps<T> {
  /** 表格資料 */
  data: T[];
  /** 欄位定義 */
  columns: DataTableColumn<T>[];
  /** 是否為單選模式 */
  singleSelect?: boolean;
  /** 已選取的行 */
  selectedRows: T[];
  /** 已選取的鍵值 */
  selectedKeys: string[];
  /** 行選取事件 */
  onRowSelect: (row: T, checked: boolean) => void;
  /** 右鍵選單事件 */
  onRowContextMenu?: (row: T, index: number, event: React.MouseEvent) => void;
  /** 行鍵值 */
  rowKey?: keyof T | ((row: T) => string);
  /** 行樣式類名 */
  rowClassName?: string;
  /** 載入狀態 */
  loading?: boolean;
  /** 空資料訊息 */
  emptyMessage?: string;
  /** 展開中的鍵集合 */
  expandedKeys?: Set<string>;
  /** 切換展開 */
  onToggleExpand?: (row: T) => void;
}

export default function DataTableBody<T extends Record<string, unknown>>({
  data,
  columns,
  singleSelect = false,
  selectedKeys,
  onRowSelect,
  onRowContextMenu,
  rowKey = "id",
  rowClassName,
  loading = false,
  emptyMessage = "No data available",
  expandedKeys,
  onToggleExpand,
}: DataTableBodyProps<T>) {
  const getRowKey = (row: T): string => {
    if (typeof rowKey === "function") {
      return rowKey(row);
    }
    return String(row[rowKey]);
  };

  const isRowSelected = (row: T): boolean => {
    const key = getRowKey(row);
    return selectedKeys.includes(key);
  };

  const handleRowSelect = (row: T, checked: boolean) => {
    onRowSelect(row, checked);
  };

  const renderCellValue = (column: DataTableColumn<T>, row: T, index: number) => {
    const value = row[column.key];

    // 使用自定義渲染函數
    if (column.render) {
      return column.render(value, row, index);
    }

    // 使用 valueEnum 渲染
    if (column.valueEnum) {
      const enumItem = column.valueEnum.item(value);
      if (enumItem) {
        return (
          <div className="flex items-center gap-2">
            {enumItem.icon}
            <span className={enumItem.color || ""}>{enumItem.text}</span>
          </div>
        );
      }
    }

    // 預設渲染 + copyable
    const displayValue = String(value ?? "");
    if (column.copyable) {
      return (
        <Tooltip content="點擊複製" wrapContent={false}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard?.writeText(displayValue).catch(() => {});
            }}
            className="w-full text-left cursor-copy hover:text-gray-800 dark:hover:text-white/90"
            aria-label="點擊複製"
          >
            <span className="truncate">{displayValue}</span>
          </button>
        </Tooltip>
      );
    }

    return <span>{displayValue}</span>;
  };

  const renderTooltip = (column: DataTableColumn<T>, row: T, index: number) => {
    if (!column.tooltip) return null;

    const tooltipText =
      typeof column.tooltip === "string"
        ? column.tooltip
        : typeof column.tooltip === "function"
        ? column.tooltip(row)
        : String(row[column.key] || "");

    if (tooltipText === undefined || tooltipText === null || tooltipText === "") {
      return renderCellValue(column, row, index);
    }
    const wrapContent = column.tooltipWrapContent !== undefined ? column.tooltipWrapContent : true;

    return (
      <Tooltip
        content={tooltipText}
        wrapContent={wrapContent}
        className={column.tooltipWidth || ""}
        contentClassName={column.tooltipWidth || ""}
        placement="bottom"
      >
        <span className="cursor-help truncate block">{renderCellValue(column, row, index)}</span>
      </Tooltip>
    );
  };

  if (loading) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={columns.length + 1} className="px-4 py-8 text-center">
            <div className="flex items-center justify-center gap-2">
              <Spinner size="md" color="primary" showText />
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  if (data.length === 0) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={columns.length + 1} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
            {emptyMessage}
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  return (
    <TableBody>
      {data.map((row, index) => {
        const key = getRowKey(row);
        const isSelected = isRowSelected(row);
        const hasExpandColumn = columns.some((c) => typeof c.renderExpand === "function");
        const isExpanded = expandedKeys?.has(key);

        return (
          <Fragment key={key}>
            <TableRow
              className={`border-l border-b border-gray-100 dark:border-white/[0.05] ${rowClassName}`}
              onContextMenu={(e: React.MouseEvent<HTMLTableRowElement>) => onRowContextMenu?.(row, index, e)}
            >
              {/* 選取欄位 */}
              {!singleSelect && (
                <TableCell className="px-2 py-4 dark:text-white/90 whitespace-nowrap w-12">
                  <div className="flex items-center justify-center">
                    <Checkbox checked={isSelected} onChange={(checked) => handleRowSelect(row, checked)} />
                  </div>
                </TableCell>
              )}

              {/* 動態欄位 */}
              {columns.map((column, columnIndex) => {
                if (column.visible === false) return null;

                const firstColumn = columnIndex === 0 && singleSelect ? "pl-8" : "";
                const isLastColumn = columnIndex === columns.filter((c) => c.visible !== false).length - 1;
                const shouldShowExpandButton = hasExpandColumn && isLastColumn;

                // 構建對齊相關的 Tailwind CSS 類名
                const alignClass = column.align === "center" ? "text-center" : column.align === "end" ? "text-right" : "text-left";

                // 構建 cursor 相關的 Tailwind CSS 類名
                const cursorClass = column.onClick ? "cursor-pointer" : "cursor-default";

                return (
                  <TableCell
                    key={column.key}
                    className={`${firstColumn} px-4 py-4 font-normal text-gray-800 text-theme-sm dark:text-white/90 ${
                      column.overflow ? "" : "whitespace-nowrap"
                    } ${column.width || ""} ${alignClass} ${cursorClass} ${column.className || ""}`}
                  >
                    <div className="flex items-center justify-between gap-2 w-full">
                      <div className="flex-1 min-w-0 w-full">
                        {column.copyable
                          ? renderCellValue(column, row, index)
                          : column.tooltip
                          ? renderTooltip(column, row, index)
                          : renderCellValue(column, row, index)}
                      </div>
                      {shouldShowExpandButton && (
                        <button
                          className="flex-shrink-0 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white/90 ml-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleExpand?.(row);
                          }}
                          aria-expanded={!!isExpanded}
                          aria-label={isExpanded ? "收合" : "展開"}
                        >
                          <svg
                            className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-90" : "rotate-0"}`}
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M7 5l5 5-5 5V5z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </TableCell>
                );
              })}
            </TableRow>

            {hasExpandColumn && isExpanded && (
              <TableRow>
                <TableCell
                  colSpan={1 + (hasExpandColumn ? 1 : 0) + columns.filter((c) => c.visible !== false).length}
                  className="px-4 py-3 border border-gray-100 dark:border-white/[0.05]"
                >
                  {columns.find((c) => typeof c.renderExpand === "function")?.renderExpand?.(row)}
                </TableCell>
              </TableRow>
            )}
          </Fragment>
        );
      })}
    </TableBody>
  );
}

import ContextMenu from "@/components/DataPage/ContextMenu";
import DataTableBody from "@/components/DataPage/DataTableBody";
import DataTableFooter from "@/components/DataPage/DataTableFooter";
import DataTableHeader from "@/components/DataPage/DataTableHeader";
import { useContextMenu } from "@/components/DataPage/useContextMenu";
import { Table } from "@/components/ui/table";
import { useState } from "react";
import { DataTablePagedData, DataTableProps, PageButtonType } from "./types";

export default function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  loading = false,
  emptyMessage = "No data available",
  singleSelect = false,
  rowActions,
  onRowContextMenu,
  onRowSelect,
  orderBy,
  descending = false,
  onSort,
  pagination,
  className,
  headerClassName,
  rowClassName,
  rowKey = "id",
}: DataTableProps<T>) {
  const [selectedRows, setSelectedRows] = useState<T[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  // 右鍵選單狀態
  const contextMenu = useContextMenu();

  // 處理資料格式：支援分頁資料或一般陣列
  const pagedData: DataTablePagedData<T> = Array.isArray(data) ? { page: 1, pageSize: data.length, total: data.length, items: data } : data;

  const { items, total, page, pageSize } = pagedData;

  // 處理行選取
  const handleRowSelect = (row: T, checked: boolean) => {
    const key = typeof rowKey === "function" ? rowKey(row) : String(row[rowKey]);
    let newSelectedRows: T[] = [];
    let newSelectedKeys: string[] = [];

    if (singleSelect) {
      if (checked) {
        newSelectedRows = [row];
        newSelectedKeys = [key];
      } else {
        newSelectedRows = [];
        newSelectedKeys = [];
      }
    } else {
      if (checked) {
        newSelectedRows = [...selectedRows, row];
        newSelectedKeys = [...selectedKeys, key];
      } else {
        newSelectedRows = selectedRows.filter((r) => {
          const rKey = typeof rowKey === "function" ? rowKey(r) : String(r[rowKey]);
          return rKey !== key;
        });
        newSelectedKeys = selectedKeys.filter((k) => k !== key);
      }
    }

    setSelectedRows(newSelectedRows);
    setSelectedKeys(newSelectedKeys);
    onRowSelect?.(newSelectedRows, newSelectedKeys);
  };

  // 處理全選
  const handleSelectAll = (checked: boolean) => {
    let newSelectedRows: T[] = [];
    let newSelectedKeys: string[] = [];

    if (checked) {
      newSelectedRows = [...items];
      newSelectedKeys = items.map((row) => {
        const key = typeof rowKey === "function" ? rowKey(row) : String(row[rowKey]);
        return key;
      });
    }

    setSelectedRows(newSelectedRows);
    setSelectedKeys(newSelectedKeys);
    onRowSelect?.(newSelectedRows, newSelectedKeys);
  };

  // 處理排序 - 支援三態循環：未排序 → 升序 → 降序 → 未排序
  const handleSort = (columnKey: string) => {
    if (onSort) {
      if (orderBy !== columnKey) {
        // 切換到新欄位，設為升序
        onSort(columnKey, false);
      } else {
        // 同一欄位，循環三態
        if (!descending) {
          // 升序 → 降序
          onSort(columnKey, true);
        } else {
          // 降序 → 未排序（傳遞 null 表示取消排序）
          onSort(null, false);
        }
      }
    }
  };

  // 處理分頁
  const handlePageChange = (newPage: number) => {
    pagination?.onPageChange(newPage);
  };

  const handleItemsPerPageChange = (newPageSize: number) => {
    pagination?.onItemsPerPageChange?.(newPageSize);
  };

  // 處理右鍵選單
  const handleRowContextMenu = (row: T, index: number, event: React.MouseEvent) => {
    event.preventDefault();

    // 如果有自定義的右鍵選單處理器，先執行
    if (onRowContextMenu) {
      onRowContextMenu(row, index, event);
      return;
    }

    // 生成右鍵選單按鈕
    let contextMenuButtons: PageButtonType[] = [];

    if (rowActions) {
      if (typeof rowActions === "function") {
        const actions = rowActions(row, index);
        contextMenuButtons = actions.map((action) => ({
          key: action.key,
          text: action.label,
          icon: action.icon,
          onClick: () => {
            action.onClick(row, index);
            contextMenu.hideContextMenu();
          },
          disabled: action.disabled?.(row),
          variant: "ghost" as const,
          size: "sm" as const,
          color: action.variant,
          className: action.className,
        }));
      } else {
        contextMenuButtons = rowActions.map((action) => ({
          key: action.key,
          text: action.label,
          icon: action.icon,
          onClick: () => {
            action.onClick(row, index);
            contextMenu.hideContextMenu();
          },
          disabled: action.disabled?.(row),
          variant: "ghost" as const,
          size: "sm" as const,
          color: action.variant,
          className: action.className,
        }));
      }
    }

    if (contextMenuButtons.length > 0) {
      contextMenu.showContextMenu(event, contextMenuButtons);
    }
  };

  // 展開/收合
  const toggleExpand = (row: T) => {
    const key = typeof rowKey === "function" ? rowKey(row) : String(row[rowKey]);
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className={`h-full flex flex-col ${className || ""}`}>
      <div className="flex-auto min-h-0 max-w-full overflow-x-auto overflow-y-auto custom-scrollbar">
        <Table className="w-full">
          <DataTableHeader<T>
            columns={columns}
            orderBy={orderBy}
            descending={descending}
            onSort={handleSort}
            onSelectAll={handleSelectAll}
            selectedCount={selectedRows.length}
            totalCount={items.length}
            className={headerClassName}
          />
          <DataTableBody<T>
            data={items}
            columns={columns}
            selectedRows={selectedRows}
            selectedKeys={selectedKeys}
            onRowSelect={handleRowSelect}
            onRowContextMenu={handleRowContextMenu}
            rowActions={rowActions}
            rowKey={rowKey}
            rowClassName={rowClassName}
            loading={loading}
            emptyMessage={emptyMessage}
            expandedKeys={expandedKeys}
            onToggleExpand={toggleExpand}
          />
        </Table>
      </div>
      <DataTableFooter
        currentPage={page}
        totalPages={Math.ceil(total / pageSize)}
        rowsPerPage={pageSize}
        totalEntries={total}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleItemsPerPageChange}
        pageSizeOptions={pagination?.itemsPerPageOptions}
      />

      {/* 右鍵選單 */}
      <ContextMenu
        buttons={contextMenu.buttons}
        visible={contextMenu.visible}
        position={contextMenu.position}
        onClose={contextMenu.hideContextMenu}
      />
    </div>
  );
}

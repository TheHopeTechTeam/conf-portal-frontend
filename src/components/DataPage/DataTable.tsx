import ContextMenu from "@/components/DataPage/ContextMenu";
import DataTableBody from "@/components/DataPage/DataTableBody";
import DataTableFooter from "@/components/DataPage/DataTableFooter";
import DataTableHeader from "@/components/DataPage/DataTableHeader";
import { CommonMenuButton } from "@/components/DataPage/MenuButtonTypes";
import { useContextMenu } from "@/components/DataPage/useContextMenu";
import { Table } from "@/components/ui/table";
import { usePermissions } from "@/context/AuthContext";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DataTablePagedData, DataTableProps, MenuButtonType } from "./types";

export default function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  loading = false,
  emptyMessage = "No data available",
  singleSelect = false,
  resource,
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
  onClearSelectionRef,
  getReorderInfo,
  onReorder,
  defaultSelectedKeys = [],
}: DataTableProps<T>) {
  const [selectedRows, setSelectedRows] = useState<T[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>(defaultSelectedKeys || []);
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  // 權限檢查
  const { hasPermission } = usePermissions();

  // 右鍵選單狀態
  const contextMenu = useContextMenu<T>();

  // 處理資料格式：支援分頁資料或一般陣列
  const pagedData: DataTablePagedData<T> = Array.isArray(data) ? { page: 1, pageSize: data.length, total: data.length, items: data } : data;

  const { items, total, page, pageSize } = pagedData;

  // 獲取 rowKey 的輔助函數
  const getRowKeyValue = useCallback(
    (row: T): string => {
      return typeof rowKey === "function" ? rowKey(row) : String(row[rowKey]);
    },
    [rowKey]
  );

  // 使用 ref 追蹤上一次的 defaultSelectedKeys，只在真正改變時才同步
  const prevDefaultSelectedKeysRef = useRef<string[]>(defaultSelectedKeys || []);
  const isInitialMountRef = useRef(true);

  // 計算當前頁面中應該被選中的 keys
  const keysToSelect = useMemo(() => {
    if (!defaultSelectedKeys || defaultSelectedKeys.length === 0 || items.length === 0) {
      return [];
    }
    return defaultSelectedKeys.filter((key) => {
      return items.some((row) => {
        const rowKeyValue = getRowKeyValue(row);
        return rowKeyValue === key;
      });
    });
  }, [defaultSelectedKeys, items, getRowKeyValue]);

  // 只在 defaultSelectedKeys 真正改變時才同步選中狀態（不干擾用戶手動選擇）
  useEffect(() => {
    const prevKeys = prevDefaultSelectedKeysRef.current;
    const currentKeys = defaultSelectedKeys || [];

    // 檢查 defaultSelectedKeys 是否真的改變了
    const keysChanged =
      prevKeys.length !== currentKeys.length ||
      !prevKeys.every((key) => currentKeys.includes(key)) ||
      !currentKeys.every((key) => prevKeys.includes(key));

    // 只在以下情況同步：
    // 1. 首次掛載時（isInitialMountRef.current === true）
    // 2. defaultSelectedKeys 真正改變時（keysChanged === true）
    if (isInitialMountRef.current || keysChanged) {
      if (keysToSelect.length > 0) {
        // 找出對應的行數據
        const rowsToSelect = items.filter((row) => {
          const rowKeyValue = getRowKeyValue(row);
          return keysToSelect.includes(rowKeyValue);
        });

        setSelectedRows(rowsToSelect);
        setSelectedKeys(keysToSelect);
        // 通知父組件選中狀態變化
        onRowSelect?.(rowsToSelect, keysToSelect);
      } else if (isInitialMountRef.current && currentKeys.length === 0) {
        // 只在首次掛載且 defaultSelectedKeys 為空時才清除選中狀態
        setSelectedRows([]);
        setSelectedKeys([]);
        onRowSelect?.([], []);
      }

      // 更新 ref
      prevDefaultSelectedKeysRef.current = currentKeys;
      isInitialMountRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keysToSelect.join(","), defaultSelectedKeys?.join(",") || ""]);

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

  // 清除選中狀態
  const clearSelection = useCallback(() => {
    setSelectedRows([]);
    setSelectedKeys([]);
    onRowSelect?.([], []);
  }, [onRowSelect]);

  // 將 clearSelection 暴露給父組件
  useEffect(() => {
    if (onClearSelectionRef) {
      onClearSelectionRef(clearSelection);
    }
  }, [onClearSelectionRef, clearSelection]);

  // 處理全選
  const handleSelectAll = (checked: boolean) => {
    // 單選模式下不支援全選
    if (singleSelect) return;

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

  // 檢查行操作權限
  const checkRowActionPermission = (action: MenuButtonType<T>): boolean => {
    // 如果沒有設置權限，則允許顯示
    // 如果沒有 resource，則允許顯示（向後兼容）
    if (!action.permission || !resource) {
      return true;
    }

    // 判斷 permission 是否為完整的權限代碼（包含冒號）
    // 如果是完整權限代碼（例如 "system:role:modify"），則直接使用
    // 如果是動詞（例如 "modify"），則與 resource 拼接為 resource:verb
    const permissionCode = action.permission.includes(":") ? action.permission : `${resource}:${action.permission}`;

    // 檢查權限
    return hasPermission(permissionCode);
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
    const contextMenuButtons: MenuButtonType<T>[] = [];

    // 如果支援重新排序，添加移動選項
    if (getReorderInfo && onReorder) {
      const reorderInfo = getReorderInfo(row, index);
      const rowId = typeof rowKey === "function" ? rowKey(row) : String(row[rowKey]);
      const rowSequence = (row as { sequence?: number }).sequence ?? 0;

      // 調試信息（開發時使用）
      if (process.env.NODE_ENV === "development") {
        console.log("Reorder Info:", {
          index,
          canMoveUp: reorderInfo.canMoveUp,
          canMoveDown: reorderInfo.canMoveDown,
          prevItem: reorderInfo.prevItem,
          nextItem: reorderInfo.nextItem,
        });
      }

      // 向上移動：需要 canMoveUp 為 true 且有 prevItem
      if (reorderInfo.canMoveUp && reorderInfo.prevItem) {
        const prevItem = reorderInfo.prevItem;
        contextMenuButtons.push(
          CommonMenuButton.MOVE_UP(
            () => {
              onReorder(rowId, rowSequence, prevItem.id, prevItem.sequence);
              contextMenu.hideContextMenu();
            },
            {
              className: "",
            }
          )
        );
      }

      // 向下移動：需要 canMoveDown 為 true 且有 nextItem
      if (reorderInfo.canMoveDown && reorderInfo.nextItem) {
        const nextItem = reorderInfo.nextItem;
        contextMenuButtons.push(
          CommonMenuButton.MOVE_DOWN(
            () => {
              onReorder(rowId, rowSequence, nextItem.id, nextItem.sequence);
              contextMenu.hideContextMenu();
            },
            {
              className: "",
            }
          )
        );
      }

      // 如果有移動選項且有 rowActions，添加分隔線
      if (contextMenuButtons.length > 0 && rowActions) {
        contextMenuButtons.push(CommonMenuButton.SEPARATOR());
      }
    }

    if (rowActions) {
      if (typeof rowActions === "function") {
        const actions = rowActions(row, index);
        contextMenuButtons.push(
          ...actions.filter((action) => {
            // 先檢查 visible 屬性
            if (action.visible !== undefined) {
              const isVisible = typeof action.visible === "function" ? action.visible(row) : action.visible;
              if (!isVisible) return false;
            }
            // 再檢查權限
            return checkRowActionPermission(action);
          })
        );
      } else {
        contextMenuButtons.push(
          ...rowActions.filter((action) => {
            // 先檢查 visible 屬性
            if (action.visible !== undefined) {
              const isVisible = typeof action.visible === "function" ? action.visible(row) : action.visible;
              if (!isVisible) return false;
            }
            // 再檢查權限
            return checkRowActionPermission(action);
          })
        );
      }
    }

    if (contextMenuButtons.length > 0) {
      contextMenu.showContextMenu(event, contextMenuButtons, row, index);
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
            singleSelect={singleSelect}
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
            singleSelect={singleSelect}
            selectedRows={selectedRows}
            selectedKeys={selectedKeys}
            onRowSelect={handleRowSelect}
            onRowContextMenu={handleRowContextMenu}
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
      {contextMenu.row !== undefined && contextMenu.index !== undefined && (
        <ContextMenu
          buttons={contextMenu.buttons}
          row={contextMenu.row}
          index={contextMenu.index}
          visible={contextMenu.visible}
          position={contextMenu.position}
          onClose={contextMenu.hideContextMenu}
        />
      )}
    </div>
  );
}

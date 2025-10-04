import { useState } from "react";
import DataTable from "./DataTable";
import DataTableToolbar from "./DataTableToolbar";
import { DataTableColumn, DataTablePagedData, DataTableRowAction, PageButton } from "./types";

interface DataPageProps<T extends Record<string, unknown>> {
  /** 表格資料 */
  data: DataTablePagedData<T>;
  /** 欄位定義 */
  columns: DataTableColumn<T>[];
  /** 載入狀態 */
  loading?: boolean;
  /** 初始排序欄位 */
  initialOrderBy?: string;
  /** 初始排序方向 */
  initialDescending?: boolean;
  /** 初始搜尋關鍵字 */
  initialKeyword?: string;
  /** 初始回收站狀態 */
  initialShowDeleted?: boolean;
  /** 是否顯示搜尋功能 */
  searchable?: boolean;
  /** 搜尋佔位符文字 */
  searchPlaceholder?: string;
  /** 工具欄按鈕 */
  buttons?: PageButton[];
  /** 是否顯示回收站切換 */
  showRecycleToggle?: boolean;
  /** 右鍵選單動作 */
  rowActions?: DataTableRowAction<T>[] | ((row: T, index: number) => DataTableRowAction<T>[]);
  /** 排序變更事件 */
  onSort?: (columnKey: string | null, descending: boolean) => void;
  /** 搜尋事件 */
  onSearch?: (keyword: string) => void;
  /** 回收站切換事件 */
  onRecycleToggle?: (showDeleted: boolean) => void;
  /** 行選擇事件 */
  onRowSelect?: (selectedRows: T[], selectedKeys: string[]) => void;
  /** 分頁變更事件 */
  onPageChange?: (page: number) => void;
  /** 每頁項目數變更事件 */
  onItemsPerPageChange?: (pageSize: number) => void;
  /** 容器樣式類名 */
  className?: string;
}

export default function DataPage<T extends Record<string, unknown>>({
  data,
  columns,
  loading = false,
  initialOrderBy = "createdAt",
  initialDescending = true,
  initialKeyword = "",
  initialShowDeleted = false,
  searchable = true,
  searchPlaceholder = "搜尋...",
  buttons = [],
  showRecycleToggle = false,
  rowActions,
  onSort,
  onSearch,
  onRecycleToggle,
  onRowSelect,
  onPageChange,
  onItemsPerPageChange,
  className,
}: DataPageProps<T>) {
  const [orderBy, setOrderBy] = useState<string>(initialOrderBy);
  const [descending, setDescending] = useState<boolean>(initialDescending);
  const [keyword, setKeyword] = useState<string>(initialKeyword);
  const [showDeleted, setShowDeleted] = useState<boolean>(initialShowDeleted);

  // 處理排序
  const handleSort = (columnKey: string | null, newDescending: boolean) => {
    if (columnKey === null) {
      // 取消排序
      setOrderBy("");
      setDescending(false);
    } else {
      setOrderBy(columnKey);
      setDescending(newDescending);
    }
    onSort?.(columnKey, newDescending);
  };

  // 處理搜尋
  const handleSearch = (searchKeyword: string) => {
    onSearch?.(searchKeyword);
  };

  // 處理搜尋關鍵字變更
  const handleKeywordChange = (newKeyword: string) => {
    setKeyword(newKeyword);
  };

  // 處理回收站切換
  const handleRecycleToggle = (newShowDeleted: boolean) => {
    setShowDeleted(newShowDeleted);
    onRecycleToggle?.(newShowDeleted);
  };

  return (
    <div className={`h-full flex flex-col rounded-xl bg-white dark:bg-white/[0.03] ${className || ""}`}>
      <DataTableToolbar
        keyword={keyword}
        onKeywordChange={handleKeywordChange}
        onSearch={handleSearch}
        buttons={buttons}
        searchable={searchable}
        searchPlaceholder={searchPlaceholder}
        showRecycleToggle={showRecycleToggle}
        showDeleted={showDeleted}
        onRecycleToggle={handleRecycleToggle}
      />
      <div className="flex-1 min-h-0">
        <DataTable<T>
          data={data}
          columns={columns}
          loading={loading}
          orderBy={orderBy}
          descending={descending}
          onSort={handleSort}
          onRowSelect={onRowSelect}
          rowActions={rowActions}
          pagination={{
            onPageChange: onPageChange || (() => {}),
            onItemsPerPageChange: onItemsPerPageChange || (() => {}),
            itemsPerPageOptions: [5, 10, 20, 50],
          }}
        />
      </div>
    </div>
  );
}

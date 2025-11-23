import DataTable from "./DataTable";
import DataTableToolbar from "./DataTableToolbar";
import { DataTableColumn, DataTablePagedData, MenuButtonType, PageButtonType } from "./types";

interface DataPageProps<T extends Record<string, unknown>> {
  /** 表格資料 */
  data: DataTablePagedData<T>;
  /** 欄位定義 */
  columns: DataTableColumn<T>[];
  /** 載入狀態 */
  loading?: boolean;
  /** 是否為單選模式 */
  singleSelect?: boolean;
  /** 當前排序欄位（外部控制） */
  orderBy?: string;
  /** 是否降序（外部控制） */
  descending?: boolean;
  /** 資源名稱（用於權限檢查，例如 "user"） */
  resource: string;
  /** 工具欄按鈕 */
  buttons?: PageButtonType[];
  /** 右鍵選單動作 */
  rowActions?: MenuButtonType<T>[] | ((row: T, index: number) => MenuButtonType<T>[]);
  /** 排序變更事件 */
  onSort?: (columnKey: string | null, descending: boolean) => void;
  /** 行選擇事件 */
  onRowSelect?: (selectedRows: T[], selectedKeys: string[]) => void;
  /** 分頁變更事件 */
  onPageChange?: (page: number) => void;
  /** 每頁項目數變更事件 */
  onItemsPerPageChange?: (pageSize: number) => void;
  /** 容器樣式類名 */
  className?: string;
  /** 清除選中狀態的回調 */
  onClearSelectionRef?: (clearFn: () => void) => void;
  /** 獲取重新排序資訊的函數 */
  getReorderInfo?: (
    row: T,
    index: number
  ) => {
    canMoveUp: boolean;
    canMoveDown: boolean;
    prevItem?: { id: string; sequence: number };
    nextItem?: { id: string; sequence: number };
  };
  /** 重新排序事件 */
  onReorder?: (currentId: string, currentSequence: number, targetId: string, targetSequence: number) => void;
  /** 預設選中的鍵值列表 */
  defaultSelectedKeys?: string[];
}

export default function DataPage<T extends Record<string, unknown>>({
  data,
  columns,
  loading = false,
  singleSelect = false,
  orderBy,
  descending,
  resource,
  buttons = [],
  rowActions,
  onSort,
  onRowSelect,
  onPageChange,
  onItemsPerPageChange,
  className,
  onClearSelectionRef,
  getReorderInfo,
  onReorder,
  defaultSelectedKeys,
}: DataPageProps<T>) {
  return (
    <div className={`h-full flex flex-col rounded-xl bg-white dark:bg-white/[0.03] ${className || ""}`}>
      <DataTableToolbar buttons={buttons} resource={resource} />
      <div className="flex-1 min-h-0">
        <DataTable<T>
          data={data}
          columns={columns}
          loading={loading}
          singleSelect={singleSelect}
          orderBy={orderBy}
          descending={descending}
          resource={resource}
          onSort={onSort}
          onRowSelect={onRowSelect}
          rowActions={rowActions}
          onClearSelectionRef={onClearSelectionRef}
          getReorderInfo={getReorderInfo}
          onReorder={onReorder}
          defaultSelectedKeys={defaultSelectedKeys}
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

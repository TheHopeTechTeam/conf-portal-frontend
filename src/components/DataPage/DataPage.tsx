import DataTable from "./DataTable";
import DataTableToolbar from "./DataTableToolbar";
import { DataTableColumn, DataTablePagedData, DataTableRowAction, PageButtonType } from "./types";

interface DataPageProps<T extends Record<string, unknown>> {
  /** 表格資料 */
  data: DataTablePagedData<T>;
  /** 欄位定義 */
  columns: DataTableColumn<T>[];
  /** 載入狀態 */
  loading?: boolean;
  /** 當前排序欄位（外部控制） */
  orderBy?: string;
  /** 是否降序（外部控制） */
  descending?: boolean;
  /** 工具欄按鈕 */
  buttons?: PageButtonType[];
  /** 右鍵選單動作 */
  rowActions?: DataTableRowAction<T>[] | ((row: T, index: number) => DataTableRowAction<T>[]);
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
}

export default function DataPage<T extends Record<string, unknown>>({
  data,
  columns,
  loading = false,
  orderBy,
  descending,
  buttons = [],
  rowActions,
  onSort,
  onRowSelect,
  onPageChange,
  onItemsPerPageChange,
  className,
}: DataPageProps<T>) {
  return (
    <div className={`h-full flex flex-col rounded-xl bg-white dark:bg-white/[0.03] ${className || ""}`}>
      <DataTableToolbar buttons={buttons} />
      <div className="flex-1 min-h-0">
        <DataTable<T>
          data={data}
          columns={columns}
          loading={loading}
          orderBy={orderBy}
          descending={descending}
          onSort={onSort}
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

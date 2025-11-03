import { PopoverPosition } from "@/const/enums";
import { ReactNode } from "react";

/**
 * 欄位定義介面
 */
export interface DataTableColumn<T> {
  /** 欄位鍵值 */
  key: string;
  /** 欄位標籤 */
  label: string;
  /** 是否可排序 */
  sortable?: boolean;
  /** 自定義渲染函數 */
  render?: (value: unknown, row: T, index: number) => ReactNode;
  /** 欄位樣式類名 */
  className?: string | string[];
  /** 欄位寬度 */
  width?: string | number;
  /** 最小寬度 */
  minWidth?: string | number;
  /** 最大寬度 */
  maxWidth?: string | number;
  /** 對齊方式 */
  align?: "start" | "center" | "end";
  /** 是否可見 */
  visible?: boolean;
  /** 是否可複製 */
  copyable?: boolean;
  /** 是否允許溢出 */
  overflow?: boolean;
  /** 提示文字 */
  tooltip?: boolean | string | ((row: T) => string);
  /** 提示寬度 */
  tooltipWidth?: number | string;
  /** 值枚舉配置 */
  valueEnum?: {
    item: (value: unknown) => {
      text: string;
      color?: string;
      icon?: ReactNode;
      loading?: boolean;
      tooltip?: string;
    } | null;
  };
  /** 展開渲染 */
  renderExpand?: (row: T) => ReactNode;
  /** 點擊事件 */
  onClick?: (row: T, index: number) => void;
}

/**
 * 行右鍵選單動作
 */
export interface DataTableRowAction<T> {
  /** 動作鍵值 */
  key: string;
  /** 動作標籤 */
  label: string;
  /** 動作圖標 */
  icon?: ReactNode;
  /** 點擊事件 */
  onClick: (row: T, index: number) => void;
  /** 是否禁用 */
  disabled?: (row: T) => boolean;
  /** 是否可見 */
  visible?: boolean | ((row: T) => boolean);
  /** 動作顏色變體 */
  variant?: "default" | "primary" | "danger" | "warning" | "success";
  /** 自定義顏色類名 */
  className?: string;
}

/**
 * 分頁資料結構
 */
export interface DataTablePagedData<T> {
  /** 當前頁碼 */
  page: number;
  /** 每頁數量 */
  pageSize: number;
  /** 總數量 */
  total: number;
  /** 資料項目 */
  items: T[];
}

/**
 * DataTable 元件屬性
 */
export interface DataTableProps<T> {
  /** 資料來源 */
  data: DataTablePagedData<T> | T[];
  /** 欄位定義 */
  columns: DataTableColumn<T>[];
  /** 載入狀態 */
  loading?: boolean;
  /** 空資料訊息 */
  emptyMessage?: string;
  /** 是否可操作 */
  actionable?: boolean;
  /** 是否單選 */
  singleSelect?: boolean;
  /** 行右鍵選單動作 */
  rowActions?: DataTableRowAction<T>[] | ((row: T, index: number) => DataTableRowAction<T>[]);
  /** 右鍵選單觸發事件 */
  onRowContextMenu?: (row: T, index: number, event: React.MouseEvent) => void;
  /** 行選取事件 */
  onRowSelect?: (selectedRows: T[], selectedKeys: string[]) => void;
  /** 排序欄位 */
  orderBy?: string;
  /** 是否降序 */
  descending?: boolean;
  /** 排序事件 */
  onSort?: (orderBy: string | null, descending: boolean) => void;
  /** 分頁配置 */
  pagination?: {
    onPageChange: (page: number) => void;
    onItemsPerPageChange?: (n: number) => void;
    itemsPerPageOptions?: number[];
  };
  /** 樣式類名 */
  className?: string;
  /** 表頭樣式類名 */
  headerClassName?: string;
  /** 行樣式類名 */
  rowClassName?: string;
  /** 行鍵值 */
  rowKey?: keyof T | ((row: T) => string);
  /** 清除選中狀態的回調 */
  onClearSelectionRef?: (clearFn: () => void) => void;
}

/**
 * DataTablePage 內部狀態
 */
export interface DataTablePageInternalState {
  /** 當前頁碼 */
  page: number;
  /** 每頁數量 */
  pageSize: number;
  /** 總數量 */
  total: number;
  /** 排序欄位 */
  orderBy?: string;
  /** 是否降序 */
  descending?: boolean;
  /** 搜尋關鍵字 */
  keyword?: string;
  /** 回收站模式 */
  recycleBinActive: boolean;
  /** 載入狀態 */
  loading: boolean;
  /** 資料項目 */
  items: unknown[];
}

/**
 * Popover 介面
 */
export interface PopoverType {
  title: ReactNode;
  position?: PopoverPosition;
  width?: string;
}

/**
 * PageButton 介面（對應現有的 DataTableButton）
 */
export interface PageButtonType {
  /** 按鈕鍵值 */
  key: string;
  /** 按鈕文字 */
  text: string;
  /** 按鈕圖標 */
  icon?: ReactNode;
  /** 按鈕位置 */
  align?: "left" | "right";
  /** 按鈕顏色 */
  color?: string;
  /** 點擊事件 */
  onClick: () => void;
  /** 顯示順序 */
  order?: number;
  /** 是否可見 */
  visible?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否載入中 */
  loading?: boolean;
  /** 扁平樣式 */
  flat?: boolean;
  /** 邊框樣式 */
  outline?: boolean;
  /** 變體樣式 */
  variant?: "primary" | "ghost" | "success" | "warning" | "danger" | "info" | "secondary";
  /** 尺寸 */
  size?: "sm" | "md" | "lg";
  /** 提示文字 */
  tooltip?: string;
  /** 自定義樣式類名 */
  className?: string;
  /** Popover 回調函數（僅 toolbar 模式適用） */
  popoverCallback?: (props: {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    trigger: ReactNode;
    popover: PopoverType;
  }) => ReactNode;
  popover?: PopoverType;
  render?: () => ReactNode;
}

/**
 * DataTablePage 元件屬性
 */
export interface DataTablePageProps<T> {
  /** 欄位定義 */
  columns: DataTableColumn<T>[];
  /** API 版本號 */
  version?: string;
  /** API 資源名稱 */
  resource: string;
  /** 資料轉換函數 */
  transformItem?: (raw: unknown) => T;
  /** 是否可搜尋 */
  searchable?: boolean;
  /** 初始搜尋關鍵字 */
  initialKeyword?: string;
  /** 初始頁碼 */
  initialPage?: number;
  /** 初始每頁數量 */
  initialPageSize?: number;
  /** 每頁數量選項 */
  pageSizeOptions?: number[];
  /** 初始排序欄位 */
  initialOrderBy?: string;
  /** 初始是否降序 */
  initialDescending?: boolean;
  /** 是否支援回收站 */
  recycleable?: boolean;
  /** 頁面按鈕 */
  pageButtons?: PageButtonType[] | ((state: DataTablePageInternalState) => PageButtonType[]);
  /** 行右鍵選單 */
  getRowContextMenu?: (row: T, index: number, state: DataTablePageInternalState) => PageButtonType[];
  /** 預設查詢參數 */
  defaultParams?: Record<string, unknown>;
  /** 樣式類名 */
  className?: string;
  /** 表頭樣式類名 */
  headerClassName?: string;
  /** 行樣式類名 */
  rowClassName?: string;
  /** 行鍵值 */
  rowKey?: keyof T | ((row: T) => string);
}

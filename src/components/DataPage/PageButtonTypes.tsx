import { Verb } from "@/const/enums";
import { ReactNode } from "react";
import {
  MdAdd,
  MdContentCopy,
  MdDelete,
  MdDownload,
  MdEdit,
  MdFileDownload,
  MdOutlineRecycling,
  MdRefresh,
  MdRestore,
  MdSearch,
  MdVisibility,
} from "react-icons/md";
import { PageButtonType, PopoverType } from "./types";

// 內建按鈕類型
export enum PAGE_BUTTON_TYPES {
  ADD = "add",
  REFRESH = "refresh",
  SEARCH = "search",
  BULK_DELETE = "bulk_delete",
  RECYCLE = "recycle",
  RESTORE = "restore",
  DOWNLOAD = "download",
  EDIT = "edit",
  DELETE = "delete",
  VIEW = "view",
  COPY = "copy",
  EXPORT = "export",
}

export type PageButtonTypeKey = (typeof PAGE_BUTTON_TYPES)[keyof typeof PAGE_BUTTON_TYPES];

// 供回收站按鈕使用的樣式（與原 Toolbar 一致）
export const getRecycleButtonClassName = (active: boolean): string => {
  return active
    ? "bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
    : "border border-red-500 text-red-500 hover:bg-red-50 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-500/10";
};

// 內建按鈕圖標（使用 react-icons/md）
export const getPageButtonIcon = (type: PageButtonTypeKey): ReactNode => {
  const icons: Record<PageButtonTypeKey, ReactNode> = {
    [PAGE_BUTTON_TYPES.ADD]: <MdAdd className="size-4" />,
    [PAGE_BUTTON_TYPES.REFRESH]: <MdRefresh className="w-4 h-4" />,
    [PAGE_BUTTON_TYPES.SEARCH]: <MdSearch className="size-4" />,
    [PAGE_BUTTON_TYPES.BULK_DELETE]: <MdDelete className="size-4" />,
    [PAGE_BUTTON_TYPES.RECYCLE]: <MdOutlineRecycling className="size-4" />,
    [PAGE_BUTTON_TYPES.RESTORE]: <MdRestore className="size-4" />,
    [PAGE_BUTTON_TYPES.DOWNLOAD]: <MdDownload className="size-4" />,
    [PAGE_BUTTON_TYPES.EDIT]: <MdEdit className="size-4" />,
    [PAGE_BUTTON_TYPES.DELETE]: <MdDelete className="size-4" />,
    [PAGE_BUTTON_TYPES.VIEW]: <MdVisibility className="size-4" />,
    [PAGE_BUTTON_TYPES.COPY]: <MdContentCopy className="size-4" />,
    [PAGE_BUTTON_TYPES.EXPORT]: <MdFileDownload className="size-4" />,
  };

  return icons[type];
};

// 內建按鈕文字
export const getPageButtonText = (type: PageButtonTypeKey): string => {
  const texts: Record<PageButtonTypeKey, string> = {
    [PAGE_BUTTON_TYPES.SEARCH]: "搜尋",
    [PAGE_BUTTON_TYPES.ADD]: "新增",
    [PAGE_BUTTON_TYPES.REFRESH]: "刷新",
    [PAGE_BUTTON_TYPES.BULK_DELETE]: "批量刪除",
    [PAGE_BUTTON_TYPES.RECYCLE]: "回收站",
    [PAGE_BUTTON_TYPES.RESTORE]: "批量還原",
    [PAGE_BUTTON_TYPES.DOWNLOAD]: "下載",
    [PAGE_BUTTON_TYPES.EDIT]: "編輯",
    [PAGE_BUTTON_TYPES.DELETE]: "刪除",
    [PAGE_BUTTON_TYPES.VIEW]: "檢視",
    [PAGE_BUTTON_TYPES.COPY]: "複製",
    [PAGE_BUTTON_TYPES.EXPORT]: "匯出",
  };

  return texts[type];
};

// 按鈕類型對應的默認權限動詞
const getDefaultPermission = (type: PageButtonTypeKey): string | undefined => {
  const permissionMap: Partial<Record<PageButtonTypeKey, string>> = {
    [PAGE_BUTTON_TYPES.SEARCH]: Verb.Read,
    [PAGE_BUTTON_TYPES.ADD]: Verb.Create,
    [PAGE_BUTTON_TYPES.REFRESH]: Verb.Read,
    [PAGE_BUTTON_TYPES.BULK_DELETE]: Verb.Delete,
    [PAGE_BUTTON_TYPES.RECYCLE]: Verb.Delete,
    [PAGE_BUTTON_TYPES.RESTORE]: Verb.Modify,
    [PAGE_BUTTON_TYPES.EDIT]: Verb.Modify,
    [PAGE_BUTTON_TYPES.DELETE]: Verb.Delete,
    [PAGE_BUTTON_TYPES.VIEW]: Verb.Read,
    // DOWNLOAD, COPY, EXPORT 沒有默認權限（可選）
  };

  return permissionMap[type];
};

// 建立內建按鈕的工廠函數
export const createPageButton = (type: PageButtonTypeKey, onClick: () => void, options: Partial<PageButtonType> = {}): PageButtonType => {
  const defaultPermission = getDefaultPermission(type);
  const { permission, ...restOptions } = options;

  return {
    key: type,
    text: getPageButtonText(type),
    icon: getPageButtonIcon(type),
    onClick,
    size: "md",
    // 如果 options 中沒有指定 permission，則使用默認權限
    // 如果 options 中指定了 permission（字符串），則使用它
    // 如果 options 中指定了 permission: undefined，則移除權限（不檢查權限）
    permission: permission ?? defaultPermission,
    ...restOptions,
  };
};

export class CommonPageButton {
  static SEARCH = (
    popoverCallback: (props: {
      isOpen: boolean;
      onOpenChange: (open: boolean) => void;
      trigger: ReactNode;
      popover: PopoverType;
    }) => ReactNode,
    options: Partial<PageButtonType> = {}
  ) => {
    return createPageButton(PAGE_BUTTON_TYPES.SEARCH, () => {}, {
      align: "left",
      tooltip: "搜尋",
      popoverCallback,
      ...options,
    });
  };

  static ADD = (onClick: () => void, options: Partial<PageButtonType> = {}) => {
    return createPageButton(PAGE_BUTTON_TYPES.ADD, onClick, {
      variant: "primary",
      align: "left",
      ...options,
    });
  };

  static REFRESH = (onClick: () => void, options: Partial<PageButtonType> = {}) => {
    return createPageButton(PAGE_BUTTON_TYPES.REFRESH, onClick, {
      outline: true,
      align: "right",
      ...options,
    });
  };

  static BULK_DELETE = (onClick: () => void, options: Partial<PageButtonType> = {}) => {
    return createPageButton(PAGE_BUTTON_TYPES.BULK_DELETE, onClick, {
      variant: "danger",
      outline: true,
      align: "right",
      tooltip: "批量刪除",
      ...options,
    });
  };
  static RECYCLE = (onClick: () => void, options: Partial<PageButtonType> = {}) => {
    return createPageButton(PAGE_BUTTON_TYPES.RECYCLE, onClick, {
      align: "right",
      tooltip: "顯示已刪除項目",
      ...options,
    });
  };

  static RESTORE = (onClick: () => void, options: Partial<PageButtonType> = {}) => {
    return createPageButton(PAGE_BUTTON_TYPES.RESTORE, onClick, {
      align: "left",
      tooltip: "批量還原",
      ...options,
    });
  };
}

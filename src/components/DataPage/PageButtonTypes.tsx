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
  MdSearch,
  MdVisibility,
} from "react-icons/md";
import { PageButtonType } from "./types";

// 內建按鈕類型
export enum PAGE_BUTTON_TYPES {
  ADD = "add",
  REFRESH = "refresh",
  SEARCH = "search",
  RECYCLE = "recycle",
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
    : "border border-red-300 text-red-500 hover:bg-red-50 dark:border-red-600 dark:text-red-500 dark:hover:bg-red-800";
};

// 內建按鈕圖標（使用 react-icons/md）
export const getPageButtonIcon = (type: PageButtonTypeKey): ReactNode => {
  const icons: Record<PageButtonTypeKey, ReactNode> = {
    [PAGE_BUTTON_TYPES.ADD]: <MdAdd className="w-4 h-4" />,
    [PAGE_BUTTON_TYPES.REFRESH]: <MdRefresh className="w-4 h-4" />,
    [PAGE_BUTTON_TYPES.SEARCH]: <MdSearch className="w-4 h-4" />,
    [PAGE_BUTTON_TYPES.RECYCLE]: <MdOutlineRecycling className="w-4 h-4" />,
    [PAGE_BUTTON_TYPES.DOWNLOAD]: <MdDownload className="w-4 h-4" />,
    [PAGE_BUTTON_TYPES.EDIT]: <MdEdit className="w-4 h-4" />,
    [PAGE_BUTTON_TYPES.DELETE]: <MdDelete className="w-4 h-4" />,
    [PAGE_BUTTON_TYPES.VIEW]: <MdVisibility className="w-4 h-4" />,
    [PAGE_BUTTON_TYPES.COPY]: <MdContentCopy className="w-4 h-4" />,
    [PAGE_BUTTON_TYPES.EXPORT]: <MdFileDownload className="w-4 h-4" />,
  };

  return icons[type];
};

// 內建按鈕文字
export const getPageButtonText = (type: PageButtonTypeKey): string => {
  const texts: Record<PageButtonTypeKey, string> = {
    [PAGE_BUTTON_TYPES.SEARCH]: "搜尋",
    [PAGE_BUTTON_TYPES.ADD]: "新增",
    [PAGE_BUTTON_TYPES.REFRESH]: "刷新",
    [PAGE_BUTTON_TYPES.RECYCLE]: "回收站",
    [PAGE_BUTTON_TYPES.DOWNLOAD]: "下載",
    [PAGE_BUTTON_TYPES.EDIT]: "編輯",
    [PAGE_BUTTON_TYPES.DELETE]: "刪除",
    [PAGE_BUTTON_TYPES.VIEW]: "檢視",
    [PAGE_BUTTON_TYPES.COPY]: "複製",
    [PAGE_BUTTON_TYPES.EXPORT]: "匯出",
  };

  return texts[type];
};

// 建立內建按鈕的工廠函數
export const createPageButton = (type: PageButtonTypeKey, onClick: () => void, options: Partial<PageButtonType> = {}): PageButtonType => {
  return {
    key: type,
    text: getPageButtonText(type),
    icon: getPageButtonIcon(type),
    onClick,
    variant: "outline",
    size: "md",
    ...options,
  };
};

export class CommonPageButton {
  static SEARCH = (onClick: () => void, options: Partial<PageButtonType> = {}) => {
    return createPageButton(PAGE_BUTTON_TYPES.SEARCH, onClick, {
      variant: "outline",
      align: "right",
      ...options,
    });
  };

  static SEARCH_POPOVER = (content: ReactNode, options: Partial<PageButtonType> = {}) => {
    return createPageButton(PAGE_BUTTON_TYPES.SEARCH, () => {}, {
      variant: "outline",
      align: "left",
      tooltip: "搜尋",
      popover: {
        title: "搜尋",
        position: "bottom",
        content,
      },
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
      variant: "outline",
      align: "right",
      ...options,
    });
  };

  static RECYCLE = (onClick: () => void, options: Partial<PageButtonType> = {}) => {
    console.log(options);
    return createPageButton(PAGE_BUTTON_TYPES.RECYCLE, onClick, {
      variant: "outline",
      align: "right",
      tooltip: "顯示已刪除項目",
      ...options,
    });
  };
}

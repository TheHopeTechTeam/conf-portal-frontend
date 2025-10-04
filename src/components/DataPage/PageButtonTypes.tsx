import { ReactNode } from "react";
import {
  MdAdd,
  MdContentCopy,
  MdDelete,
  MdDeleteForever,
  MdDownload,
  MdEdit,
  MdFileDownload,
  MdRefresh,
  MdSearch,
  MdVisibility,
} from "react-icons/md";
import { PageButton } from "./types";

// 內建按鈕類型
export const PAGE_BUTTON_TYPES = {
  ADD: "add",
  REFRESH: "refresh",
  SEARCH: "search",
  RECYCLE: "recycle",
  DOWNLOAD: "download",
  EDIT: "edit",
  DELETE: "delete",
  VIEW: "view",
  COPY: "copy",
  EXPORT: "export",
} as const;

export type PageButtonTypeKey = (typeof PAGE_BUTTON_TYPES)[keyof typeof PAGE_BUTTON_TYPES];

// 內建按鈕圖標（使用 react-icons/md）
export const getPageButtonIcon = (type: PageButtonTypeKey): ReactNode => {
  const icons: Record<PageButtonTypeKey, ReactNode> = {
    [PAGE_BUTTON_TYPES.ADD]: <MdAdd className="w-4 h-4" />,
    [PAGE_BUTTON_TYPES.REFRESH]: <MdRefresh className="w-4 h-4" />,
    [PAGE_BUTTON_TYPES.SEARCH]: <MdSearch className="w-4 h-4" />,
    [PAGE_BUTTON_TYPES.RECYCLE]: <MdDeleteForever className="w-4 h-4" />,
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
    [PAGE_BUTTON_TYPES.ADD]: "新增",
    [PAGE_BUTTON_TYPES.REFRESH]: "刷新",
    [PAGE_BUTTON_TYPES.SEARCH]: "搜尋",
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
export const createPageButton = (type: PageButtonTypeKey, onClick: () => void, options: Partial<PageButton> = {}): PageButton => {
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

// 常用的按鈕組合
export const createCommonButtons = (handlers: {
  onSearch?: () => void;
  onAdd?: () => void;
  onRefresh?: () => void;
  onRecycle?: () => void;
}): PageButton[] => {
  const buttons: PageButton[] = [];

  if (handlers.onSearch) {
    buttons.push(createPageButton(PAGE_BUTTON_TYPES.SEARCH, handlers.onSearch));
  }
  if (handlers.onAdd) {
    buttons.push(createPageButton(PAGE_BUTTON_TYPES.ADD, handlers.onAdd, { variant: "primary" }));
  }
  if (handlers.onRefresh) {
    buttons.push(createPageButton(PAGE_BUTTON_TYPES.REFRESH, handlers.onRefresh, { align: "right" }));
  }
  if (handlers.onRecycle) {
    buttons.push(createPageButton(PAGE_BUTTON_TYPES.RECYCLE, handlers.onRecycle));
  }

  return buttons;
};

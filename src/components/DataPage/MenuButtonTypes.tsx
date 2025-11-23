import { ReactNode } from "react";
import { MdArrowDownward, MdArrowUpward, MdDelete, MdEdit, MdRestore, MdVisibility } from "react-icons/md";
import { MenuButtonType } from "./types";

// 內建行操作類型
export enum ROW_ACTION_TYPES {
  VIEW = "view",
  EDIT = "edit",
  DELETE = "delete",
  RESTORE = "restore",
}

export type RowActionTypeKey = (typeof ROW_ACTION_TYPES)[keyof typeof ROW_ACTION_TYPES];

// 內建行操作圖標（使用 react-icons/md）
export const getRowActionIcon = (type: RowActionTypeKey): ReactNode => {
  const icons: Record<RowActionTypeKey, ReactNode> = {
    [ROW_ACTION_TYPES.VIEW]: <MdVisibility />,
    [ROW_ACTION_TYPES.EDIT]: <MdEdit />,
    [ROW_ACTION_TYPES.DELETE]: <MdDelete />,
    [ROW_ACTION_TYPES.RESTORE]: <MdRestore />,
  };

  return icons[type];
};

// 內建行操作文字
export const getRowActionLabel = (type: RowActionTypeKey): string => {
  const labels: Record<RowActionTypeKey, string> = {
    [ROW_ACTION_TYPES.VIEW]: "檢視",
    [ROW_ACTION_TYPES.EDIT]: "編輯",
    [ROW_ACTION_TYPES.DELETE]: "刪除",
    [ROW_ACTION_TYPES.RESTORE]: "還原",
  };

  return labels[type];
};

// 行操作類型對應的默認權限動詞
const getDefaultPermission = (type: RowActionTypeKey): string | undefined => {
  const permissionMap: Record<RowActionTypeKey, string> = {
    [ROW_ACTION_TYPES.VIEW]: "read",
    [ROW_ACTION_TYPES.EDIT]: "modify",
    [ROW_ACTION_TYPES.DELETE]: "delete",
    [ROW_ACTION_TYPES.RESTORE]: "modify",
  };

  return permissionMap[type];
};

// 建立內建行操作的工廠函數
export const createRowAction = <T extends Record<string, unknown>>(
  type: RowActionTypeKey,
  onClick: (row: T, index: number) => void,
  options: Partial<MenuButtonType<T>> = {}
): MenuButtonType<T> => {
  const defaultPermission = getDefaultPermission(type);
  const { permission, ...restOptions } = options;

  return {
    key: type,
    text: getRowActionLabel(type),
    icon: getRowActionIcon(type),
    onClick,
    // 如果 options 中沒有指定 permission，則使用默認權限
    // 如果 options 中指定了 permission（字符串），則使用它
    // 如果 options 中指定了 permission: undefined，則移除權限（不檢查權限）
    permission: permission ?? defaultPermission,
    ...restOptions,
  };
};

export class CommonMenuButton {
  static SEPARATOR = <T extends Record<string, unknown>>(options: Partial<MenuButtonType<T>> = {}): MenuButtonType<T> => {
    return {
      key: "separator",
      text: "",
      icon: null,
      onClick: () => {},
      variant: "default" as const,
      disabled: true,
      render: () => <div className="cursor-default pointer-events-none h-px bg-gray-200 dark:bg-gray-800" />,
      ...options,
    };
  };

  static MOVE_UP = <T extends Record<string, unknown>>(
    onClick: (row: T, index: number) => void,
    options: Partial<MenuButtonType<T>> = {}
  ): MenuButtonType<T> => {
    return {
      key: "move-up",
      text: "向上移動",
      icon: <MdArrowUpward />,
      onClick,
      variant: "default" as const,
      ...options,
    };
  };

  static MOVE_DOWN = <T extends Record<string, unknown>>(
    onClick: (row: T, index: number) => void,
    options: Partial<MenuButtonType<T>> = {}
  ): MenuButtonType<T> => {
    return {
      key: "move-down",
      text: "向下移動",
      icon: <MdArrowDownward />,
      onClick,
      variant: "default" as const,
      ...options,
    };
  };

  static VIEW = <T extends Record<string, unknown>>(
    onClick: (row: T, index: number) => void,
    options: Partial<MenuButtonType<T>> = {}
  ): MenuButtonType<T> => {
    return createRowAction(ROW_ACTION_TYPES.VIEW, onClick, {
      ...options,
    });
  };

  static EDIT = <T extends Record<string, unknown>>(
    onClick: (row: T, index: number) => void,
    options: Partial<MenuButtonType<T>> = {}
  ): MenuButtonType<T> => {
    return createRowAction(ROW_ACTION_TYPES.EDIT, onClick, {
      ...options,
    });
  };

  static DELETE = <T extends Record<string, unknown>>(
    onClick: (row: T, index: number) => void,
    options: Partial<MenuButtonType<T>> = {}
  ): MenuButtonType<T> => {
    return createRowAction(ROW_ACTION_TYPES.DELETE, onClick, {
      variant: "danger",
      ...options,
    });
  };

  static RESTORE = <T extends Record<string, unknown>>(
    onClick: (row: T, index: number) => void,
    options: Partial<MenuButtonType<T>> = {}
  ): MenuButtonType<T> => {
    return createRowAction(ROW_ACTION_TYPES.RESTORE, onClick, {
      variant: "primary",
      ...options,
    });
  };
}

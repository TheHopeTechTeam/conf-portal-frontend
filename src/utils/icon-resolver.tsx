import React from "react";
import * as FaIcons from "react-icons/fa";
import * as HiIcons from "react-icons/hi";
import * as IoIcons from "react-icons/io5";
import * as MdIcons from "react-icons/md";

export type IconLibrary = "md" | "fa" | "hi" | "io";

export interface IconResolverOptions {
  library?: IconLibrary;
  className?: string;
  size?: number;
}

export interface IconResolverResult {
  icon: React.ReactNode | null;
  error: string | null;
  isValid: boolean;
}

/**
 * 圖示解析器 - 根據輸入的文字動態生成對應的圖示
 * @param iconName 圖示名稱 (如: "home", "person", "settings")
 * @param options 配置選項
 * @returns IconResolverResult 包含圖示組件、錯誤訊息和有效性
 */
export const resolveIcon = (iconName: string, options: IconResolverOptions = {}): IconResolverResult => {
  const { library = "md", className = "size-5", size } = options;

  if (!iconName?.trim()) {
    return {
      icon: null,
      error: null,
      isValid: true,
    };
  }

  // 根據圖示庫選擇對應的圖示集合
  const iconMap = {
    md: MdIcons,
    fa: FaIcons,
    hi: HiIcons,
    io: IoIcons,
  };

  const iconSet = iconMap[library];
  if (!iconSet) {
    return {
      icon: null,
      error: `不支援的圖示庫: ${library}`,
      isValid: false,
    };
  }

  // 生成圖示名稱並嘗試多種鍵名匹配
  const originalName = iconName.trim();
  const normalizedName = originalName.toLowerCase();
  const capitalizedName = normalizedName.charAt(0).toUpperCase() + normalizedName.slice(1);
  const libPrefix = { md: "Md", fa: "Fa", hi: "Hi", io: "Io" }[library];
  const candidates = [
    originalName, // 直接鍵名（如：MdHome）
    `${libPrefix}${capitalizedName}`, // 前綴 + 名稱（如：MdHome）
    capitalizedName, // 僅名稱首字大寫（少數情況）
  ];

  // 嘗試找到圖示組件
  const IconComponent = (iconSet as any)[candidates.find((k) => (iconSet as any)[k]) as string];

  if (IconComponent) {
    const iconProps = {
      className,
      ...(size && { size }),
    };

    return {
      icon: <IconComponent {...iconProps} />,
      error: null,
      isValid: true,
    };
  }

  // 如果找不到圖示，返回錯誤
  const libraryNames = {
    md: "Material Design",
    fa: "Font Awesome",
    hi: "Heroicons",
    io: "Ionicons",
  };

  return {
    icon: null,
    error: `找不到對應的 ${libraryNames[library]} 圖示，請輸入有效的圖示名稱`,
    isValid: false,
  };
};

/**
 * Hook 版本 - 用於 React 組件中
 * @param iconName 圖示名稱
 * @param options 配置選項
 * @returns IconResolverResult
 */
export const useIconResolver = (iconName: string, options: IconResolverOptions = {}): IconResolverResult => {
  const { library = "md", className = "size-5", size } = options;

  return React.useMemo(() => resolveIcon(iconName, { library, className, size }), [iconName, library, className, size]);
};

/**
 * 獲取可用的圖示庫列表
 */
export const getAvailableLibraries = (): IconLibrary[] => {
  return ["md", "fa", "hi", "io"];
};

/**
 * 獲取圖示庫的顯示名稱
 */
export const getLibraryDisplayName = (library: IconLibrary): string => {
  const names = {
    md: "Material Design",
    fa: "Font Awesome",
    hi: "Heroicons",
    io: "Ionicons",
  };
  return names[library];
};

/**
 * 獲取常用圖示名稱列表（用於提示）
 */
export const getCommonIconNames = (library: IconLibrary = "md"): string[] => {
  const commonIcons = {
    md: [
      "home",
      "person",
      "settings",
      "email",
      "phone",
      "search",
      "menu",
      "close",
      "edit",
      "delete",
      "add",
      "remove",
      "save",
      "cancel",
      "check",
      "warning",
      "error",
      "info",
      "help",
      "star",
      "favorite",
      "share",
      "download",
      "upload",
      "refresh",
      "lock",
      "unlock",
      "visibility",
      "visibilityOff",
    ],
    fa: [
      "home",
      "user",
      "cog",
      "envelope",
      "phone",
      "search",
      "bars",
      "times",
      "edit",
      "trash",
      "plus",
      "minus",
      "save",
      "times",
      "check",
      "exclamation",
      "times",
      "info",
      "question",
      "star",
      "heart",
      "share",
      "download",
      "upload",
      "refresh",
      "lock",
      "unlock",
      "eye",
      "eyeSlash",
    ],
    hi: [
      "home",
      "user",
      "cog",
      "mail",
      "phone",
      "search",
      "menu",
      "x",
      "pencil",
      "trash",
      "plus",
      "minus",
      "save",
      "x",
      "check",
      "exclamation",
      "x",
      "information",
      "question",
      "star",
      "heart",
      "share",
      "download",
      "upload",
      "refresh",
      "lockClosed",
      "lockOpen",
      "eye",
      "eyeSlash",
    ],
    io: [
      "home",
      "person",
      "settings",
      "mail",
      "call",
      "search",
      "menu",
      "close",
      "create",
      "trash",
      "add",
      "remove",
      "save",
      "close",
      "checkmark",
      "warning",
      "close",
      "information",
      "help",
      "star",
      "heart",
      "share",
      "download",
      "cloudUpload",
      "refresh",
      "lockClosed",
      "lockOpen",
      "eye",
      "eyeOff",
    ],
  };

  return commonIcons[library] || [];
};

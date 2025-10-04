import React from "react";

// Spinner 尺寸類型定義
export type SpinnerSize = "sm" | "md" | "lg" | "xl";

// Spinner 顏色類型定義
export type SpinnerColor = "primary" | "secondary" | "white" | "gray";

// Spinner 組件 Props 接口
export interface SpinnerProps {
  size?: SpinnerSize;
  color?: SpinnerColor;
  className?: string;
  showText?: boolean;
  text?: string;
}

// 尺寸對應的 CSS 類
const sizeMap: Record<SpinnerSize, string> = {
  sm: "w-5 h-5",
  md: "w-7 h-7",
  lg: "w-9 h-9",
  xl: "w-12 h-12",
};

// 顏色對應的 CSS 類
const colorMap: Record<SpinnerColor, string> = {
  primary: "border-brand-500",
  secondary: "border-gray-500",
  white: "border-white",
  gray: "border-gray-400",
};

const Spinner: React.FC<SpinnerProps> = ({ size = "md", color = "primary", className = "", showText = false, text = "Loading..." }) => {
  const sizeClass = sizeMap[size];
  const colorClass = colorMap[color];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`${sizeClass} ${colorClass} border-3 border-t-transparent rounded-full animate-spin`} />
      {showText && <span className={`text-sm ${color === "white" ? "text-white" : "text-gray-600"}`}>{text}</span>}
    </div>
  );
};

export default Spinner;

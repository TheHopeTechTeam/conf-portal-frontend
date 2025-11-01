import type React from "react";
import type { FC, ReactNode } from "react";
import Input from "./index";

interface IconInputProps {
  type?: "text" | "number" | "email" | "password" | "date" | "time" | string;
  id?: string;
  name?: string;
  placeholder?: string;
  value?: string | number | undefined;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  min?: string;
  max?: string;
  step?: number;
  disabled?: boolean;
  success?: boolean;
  error?: boolean;
  hint?: string;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  clearable?: boolean;
}

const IconInput: FC<IconInputProps> = ({
  type = "text",
  id,
  name,
  placeholder,
  value,
  onChange,
  className = "",
  min,
  max,
  step,
  disabled = false,
  success = false,
  error = false,
  hint,
  icon,
  iconPosition = "left",
  clearable = false,
}) => {
  // 判斷是否顯示清除按鈕
  const shouldShowClear = clearable && value !== null && value !== undefined && value !== "" && type !== "password";

  // 當圖標在右側且需要顯示清除按鈕時，調整圖標位置
  // 清除按鈕在右側（pr-3），所以圖標需要更靠左一些（約 pr-10）
  const iconRightPosition = shouldShowClear && iconPosition === "right" ? "right-10" : "right-4";

  const iconClasses = `absolute text-gray-500 -translate-y-7 pointer-events-none top-1/2 dark:text-gray-400 ${
    iconPosition === "left" ? "left-4" : iconRightPosition
  }`;

  // 計算輸入框的右側 padding
  // 當圖標在右側且有清除按鈕時，需要更多空間（pr-16 = 4rem）
  // 當圖標在右側但沒有清除按鈕時，使用 pr-11
  // 當圖標在左側時，使用 pl-11
  const inputPadding = icon ? (iconPosition === "left" ? "pl-11" : shouldShowClear ? "pr-16" : "pr-11") : "";

  return (
    <div className="relative">
      <Input
        type={type}
        id={id}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`${inputPadding} ${className}`}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        success={success}
        error={error}
        hint={hint}
        clearable={clearable}
      />
      {icon && <span className={iconClasses}>{icon}</span>}
    </div>
  );
};

export default IconInput;

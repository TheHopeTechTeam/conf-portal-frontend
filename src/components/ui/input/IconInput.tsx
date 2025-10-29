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
}) => {
  const iconClasses = `absolute text-gray-500 -translate-y-1/2 pointer-events-none top-1/2 dark:text-gray-400 ${
    iconPosition === "left" ? "left-4" : "right-4"
  }`;

  const inputPadding = icon ? (iconPosition === "left" ? "pl-11" : "pr-11") : "";

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
      />
      {icon && <span className={iconClasses}>{icon}</span>}
    </div>
  );
};

export default IconInput;

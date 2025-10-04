import { MdRefresh } from "react-icons/md";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

export default function LoadingSpinner({ size = "md", text = "載入中...", className = "" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <div className="relative">
        <MdRefresh className={`${sizeClasses[size]} animate-spin text-blue-600`} aria-hidden="true" />
      </div>
      {text && <p className={`mt-4 text-gray-600 ${textSizes[size]} font-medium`}>{text}</p>}
    </div>
  );
}

// 全頁載入元件
export function FullPageLoading({ text = "應用程式載入中..." }: { text?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}

// 內嵌載入元件
export function InlineLoading({ text = "載入中..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-4">
      <LoadingSpinner size="sm" text={text} />
    </div>
  );
}

import ProgressBar from "@/components/ui/progress/ProgressBar";
import Tooltip from "@/components/ui/tooltip";
import { ReactNode } from "react";
import { MdDelete, MdImage } from "react-icons/md";

interface FileInfo {
  name: string;
  size?: number;
  type?: string;
  nameClassName?: string; // 檔名的自訂樣式
}

interface ImagePreviewCardProps {
  imageUrl: string;
  alt: string;
  className?: string;
  topLeft?: ReactNode; // 左上角自訂元素
  showDeleteButton?: boolean; // 是否顯示右上角刪除按鈕
  onDelete?: () => void; // 刪除按鈕點擊事件
  onClick?: () => void; // 點擊圖片容器事件
  fileInfo?: FileInfo; // 檔案資訊
  formatFileSize?: (bytes: number) => string; // 格式化檔案大小的函數
  uploadProgress?: number; // 0-100 上傳進度
  uploadStatus?: "pending" | "uploading" | "success" | "error"; // 上傳狀態
  message?: string; // 訊息
  showUploadProgress?: boolean; // 是否顯示上傳進度
}

const defaultFormatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

const ImagePreviewCard = ({
  imageUrl,
  alt,
  className = "",
  topLeft,
  showDeleteButton = false,
  onDelete,
  onClick,
  fileInfo,
  formatFileSize = defaultFormatFileSize,
  uploadProgress,
  uploadStatus,
  showUploadProgress = false,
  message,
}: ImagePreviewCardProps) => {
  return (
    <div className="flex flex-col">
      {/* 圖片容器 */}
      <div
        className={`group relative aspect-square overflow-hidden transition-all rounded-t-lg border-gray-200 dark:border-gray-700 ${className}`}
        onClick={onClick}
      >
        <img
          src={imageUrl}
          alt={alt}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src =
              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ddd' width='100' height='100'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='sans-serif' font-size='14'%3E無法載入%3C/text%3E%3C/svg%3E";
          }}
        />
        {/* 左上角自訂元素 */}
        {topLeft && <div className="absolute top-2 left-2 z-10">{topLeft}</div>}
        {/* 右上角刪除按鈕 */}
        {showDeleteButton && onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
          >
            <MdDelete size={16} />
          </button>
        )}
      </div>

      {/* 檔案資訊 */}
      {fileInfo && (
        <div className="p-2 space-y-1 rounded-b-lg border-1 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <Tooltip content={fileInfo.name} placement="bottom">
            <p
              className={`truncate text-xs font-medium ${fileInfo.nameClassName || "text-gray-700 dark:text-gray-300"}`}
              title={fileInfo.name}
            >
              {fileInfo.name}
            </p>
          </Tooltip>
          {(fileInfo.size !== undefined || fileInfo.type) && (
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              {fileInfo.size !== undefined && <span>{formatFileSize(fileInfo.size)}</span>}
              {fileInfo.type && (
                <span className="flex items-center gap-1">
                  <MdImage size={12} />
                  {fileInfo.type}
                </span>
              )}
            </div>
          )}
          {showUploadProgress && uploadStatus === "uploading" && typeof uploadProgress === "number" && (
            <div className="pt-2">
              <ProgressBar progress={uploadProgress} size="sm" label="inside" />
            </div>
          )}
          {showUploadProgress && uploadStatus === "error" && <p className="pt-2 text-[10px] text-center text-red-600 dark:text-red-400">{message || "上傳失敗"}</p>}
          {showUploadProgress && uploadStatus === "success" && <p className="pt-2 text-[10px] text-center text-green-600 dark:text-green-400">{message || "上傳完成"}</p>}
        </div>
      )}
    </div>
  );
};

export default ImagePreviewCard;

import Checkbox from "@/components/ui/checkbox";
import ImagePreviewCard from "./ImagePreviewCard";
import type { FileItem } from "./types";

interface FileGridProps {
  files: FileItem[];
  selectedKeys: string[];
  onSelect: (fileId: string, checked: boolean) => void;
}

const FileGrid = ({ files, selectedKeys, onSelect }: FileGridProps) => {
  if (files.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] rounded-xl bg-white dark:bg-white/[0.03]">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">目前沒有任何圖片</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-8 p-4">
      {files.map((file) => {
        const isSelected = selectedKeys.includes(file.id);

        // 左上角元素（勾選框）
        const topLeftElement = (
          <div
            className={`transition-opacity duration-200 ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(file.id, !isSelected);
            }}
          >
            <Checkbox
              checked={isSelected}
              onChange={() => {}}
              className="size-5 rounded-md border-white shadow-md bg-white/90 dark:bg-gray-900/90 dark:border-gray-700 pointer-events-none"
            />
          </div>
        );

        return (
          <div key={file.id} className="flex flex-col gap-2 rounded-lg transition-colors bg-white dark:bg-gray-800">
            <ImagePreviewCard
              imageUrl={file.url}
              alt={file.name}
              topLeft={topLeftElement}
              showDeleteButton={false}
              onClick={() => onSelect(file.id, !isSelected)}
              className="bg-gray-50 dark:bg-gray-900"
              fileInfo={{
                name: file.name,
                size: file.size,
              }}
              enableImagePreview={false}
            />
          </div>
        );
      })}
    </div>
  );
};

export default FileGrid;

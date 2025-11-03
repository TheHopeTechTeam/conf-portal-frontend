import Button from "@/components/ui/button";
import { MdWarning } from "react-icons/md";

interface FileDeleteFormProps {
  fileCount: number;
  onSubmit: () => Promise<void> | void;
  onCancel: () => void;
  submitting?: boolean;
}

const FileDeleteForm: React.FC<FileDeleteFormProps> = ({ fileCount, onSubmit, onCancel, submitting = false }) => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <MdWarning className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">確認刪除檔案</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            確定要刪除選中的 <span className="font-semibold text-gray-900 dark:text-white">{fileCount}</span> 個檔案嗎？
          </p>
          <div className="bg-red-50 border border-red-200 rounded-md p-3 dark:bg-red-900/20 dark:border-red-800">
            <p className="text-sm text-red-700 dark:text-red-300">
              <strong>警告：</strong>此操作為物理刪除，檔案將從系統中永久移除且無法復原，請謹慎操作。
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button onClick={onCancel} size="sm" variant="outline" disabled={submitting}>
          取消
        </Button>
        <Button
          btnType="submit"
          size="sm"
          variant="primary"
          disabled={submitting}
          className="bg-red-500 hover:bg-red-600 disabled:bg-red-300"
        >
          {submitting ? "刪除中..." : "確認刪除"}
        </Button>
      </div>
    </form>
  );
};

export default FileDeleteForm;


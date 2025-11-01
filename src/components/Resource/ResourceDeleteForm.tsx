import { useState } from "react";
import Button from "../ui/button";
import TextArea from "../ui/textarea";

interface ResourceDeleteFormProps {
  onSubmit: (data: { reason?: string; permanent?: boolean }) => Promise<void> | void;
  onCancel: () => void;
  submitting?: boolean;
  isPermanent?: boolean;
}

const ResourceDeleteForm: React.FC<ResourceDeleteFormProps> = ({ onSubmit, onCancel, submitting, isPermanent = false }) => {
  const [reason, setReason] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ reason: reason.trim() || undefined, permanent: isPermanent });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
          <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{isPermanent ? "確認永久刪除資源" : "確認刪除資源"}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {isPermanent ? "此操作將永久刪除資源，無法恢復。" : "此操作將軟刪除資源，可以在回收桶中恢復。"}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">刪除原因（可選）</label>
        <TextArea value={reason} onChange={(value) => setReason(value)} rows={3} placeholder="請輸入刪除原因" />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button btnType="button" variant="outline" onClick={onCancel} disabled={submitting}>
          取消
        </Button>
        <Button
          btnType="submit"
          variant="primary"
          disabled={submitting}
          className="bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300"
        >
          {submitting ? "刪除中..." : isPermanent ? "永久刪除" : "刪除"}
        </Button>
      </div>
    </form>
  );
};

export default ResourceDeleteForm;

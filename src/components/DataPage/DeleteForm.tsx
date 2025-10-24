import { useEffect, useState } from "react";
import Button from "../ui/button/Button";

interface DeleteFormProps {
  onSubmit: (payload: { reason?: string; permanent?: boolean }) => Promise<void> | void;
  onCancel: () => void;
  submitting?: boolean;
  entityName?: string; // 實體名稱，用於警告文字
  isPermanent?: boolean; // 是否為永久刪除模式
}

const DeleteForm: React.FC<DeleteFormProps> = ({ onSubmit, onCancel, submitting, entityName = "資料", isPermanent = false }) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
  }, [reason]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPermanent && reason.trim().length === 0) {
      setError("軟刪除時需填寫原因");
      return;
    }
    await onSubmit({ reason: reason.trim() || undefined, permanent: isPermanent });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!isPermanent && (
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">刪除原因（軟刪除必填）</label>
          <textarea
            className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
            rows={3}
            placeholder="請輸入刪除原因"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          {error && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>}
        </div>
      )}

      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 dark:bg-yellow-900/20 dark:border-yellow-800">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">{isPermanent ? "永久刪除警告" : "軟刪除說明"}</h3>
            <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
              {isPermanent ? (
                <p>永久刪除後，{entityName}將無法復原，請謹慎操作。</p>
              ) : (
                <p>軟刪除後，{entityName}將被標記為已刪除，但可以通過還原功能恢復。</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button onClick={onCancel} size="sm" variant="outline" disabled={!!submitting}>
          取消
        </Button>
        <Button
          btnType="submit"
          size="sm"
          variant="primary"
          disabled={!!submitting}
          className="bg-red-500 hover:bg-red-600 disabled:bg-red-300"
        >
          {isPermanent ? "確認永久刪除" : "確認刪除"}
        </Button>
      </div>
    </form>
  );
};

export default DeleteForm;

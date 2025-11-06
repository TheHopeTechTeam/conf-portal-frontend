import { useEffect, useState } from "react";
import Button from "../ui/button";
import Checkbox from "../ui/checkbox";
import TextArea from "../ui/textarea";

interface DemoDeleteFormProps {
  onSubmit: (payload: { reason?: string; permanent?: boolean }) => Promise<void> | void;
  onCancel: () => void;
  submitting?: boolean;
}

const DemoDeleteForm: React.FC<DemoDeleteFormProps> = ({ onSubmit, onCancel, submitting }) => {
  const [permanent, setPermanent] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
  }, [permanent, reason]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!permanent && reason.trim().length === 0) {
      setError("軟刪除時需填寫原因");
      return;
    }
    await onSubmit({ reason: reason.trim() || undefined, permanent });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-2">
        <Checkbox id="permanent" checked={permanent} onChange={(checked) => setPermanent(checked)} label="永久刪除" />
      </div>

      {!permanent && (
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">刪除原因（軟刪除必填）</label>
          <TextArea id="demo-delete-reason" rows={3} value={reason} onChange={(value) => setReason(value)} placeholder="請輸入刪除原因" error={error || undefined} />
          {error && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>}
        </div>
      )}

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
          確認刪除
        </Button>
      </div>
    </form>
  );
};

export default DemoDeleteForm;

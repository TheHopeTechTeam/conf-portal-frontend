import Button from "../ui/button/Button";

interface RestoreFormProps {
  onSubmit: (ids: string[]) => Promise<void> | void;
  onCancel: () => void;
  submitting?: boolean;
  entityName?: string; // 實體名稱，用於確認文字
  ids: string[]; // 要還原的 ID 列表
}

const RestoreForm: React.FC<RestoreFormProps> = ({ onSubmit, onCancel, submitting, entityName = "資料", ids }) => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(ids);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-md p-3 dark:bg-blue-900/20 dark:border-blue-800">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">還原確認</h3>
            <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
              <p>
                您即將還原 {ids.length} 個{entityName}，此操作將恢復{entityName}的正常狀態。
              </p>
              <p className="mt-1 font-medium">請確認是否要繼續此操作？</p>
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
          className="bg-green-500 hover:bg-green-600 disabled:bg-green-300"
        >
          {submitting ? "還原中..." : "確認還原"}
        </Button>
      </div>
    </form>
  );
};

export default RestoreForm;

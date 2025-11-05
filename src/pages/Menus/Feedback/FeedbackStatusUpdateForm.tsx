import { FeedbackStatus } from "@/api/services/feedbackService";
import Button from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import TextArea from "@/components/ui/textarea";
import { useState } from "react";

interface FeedbackStatusUpdateFormProps {
  currentStatus: FeedbackStatus;
  currentDescription?: string;
  currentRemark?: string;
  onSubmit: (data: { status: FeedbackStatus; description?: string; remark?: string }) => Promise<void>;
  onCancel: () => void;
  submitting?: boolean;
}

const getStatusOptions = () => {
  return [
    { value: FeedbackStatus.PENDING.toString(), label: "待處理" },
    { value: FeedbackStatus.REVIEW.toString(), label: "審查中" },
    { value: FeedbackStatus.DISCUSSION.toString(), label: "討論中" },
    { value: FeedbackStatus.ACCEPTED.toString(), label: "已接受" },
    { value: FeedbackStatus.DONE.toString(), label: "已完成" },
    { value: FeedbackStatus.REJECTED.toString(), label: "已拒絕" },
    { value: FeedbackStatus.ARCHIVED.toString(), label: "已歸檔" },
  ];
};

const FeedbackStatusUpdateForm: React.FC<FeedbackStatusUpdateFormProps> = ({
  currentStatus,
  currentDescription,
  currentRemark,
  onSubmit,
  onCancel,
  submitting = false,
}) => {
  const [status, setStatus] = useState<FeedbackStatus>(currentStatus);
  const [description, setDescription] = useState<string>(currentDescription || "");
  const [remark, setRemark] = useState<string>(currentRemark || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      status,
      description: description.trim() || undefined,
      remark: remark.trim() || undefined,
    });
  };

  const hasChanges =
    status !== currentStatus ||
    description.trim() !== (currentDescription || "") ||
    remark.trim() !== (currentRemark || "");

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Select
          id="status"
          label="狀態"
          options={getStatusOptions()}
          value={status.toString()}
          onChange={(value) => setStatus(Number(value) as FeedbackStatus)}
          placeholder="請選擇狀態"
          size="md"
          required
        />
      </div>

      <div>
        <TextArea
          id="description"
          label="描述"
          placeholder="請輸入描述"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      <div>
        <TextArea
          id="remark"
          label="備註"
          placeholder="請輸入備註"
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          取消
        </Button>
        <Button type="submit" variant="primary" disabled={submitting || !hasChanges}>
          {submitting ? "更新中..." : "更新"}
        </Button>
      </div>
    </form>
  );
};

export default FeedbackStatusUpdateForm;


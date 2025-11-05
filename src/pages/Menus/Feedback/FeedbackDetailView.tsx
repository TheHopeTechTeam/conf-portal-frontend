import { feedbackService } from "@/api/services/feedbackService";
import Input from "@/components/ui/input";
import TextArea from "@/components/ui/textarea";
import { DateUtil } from "@/utils/dateUtil";
import { useEffect, useState } from "react";
import { FeedbackStatus } from "@/api/services/feedbackService";

interface FeedbackDetailViewProps {
  feedbackId: string;
}

interface FeedbackDetailData {
  id: string;
  name: string;
  email?: string;
  status: FeedbackStatus;
  message?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

const getStatusText = (status: FeedbackStatus) => {
  switch (status) {
    case FeedbackStatus.PENDING:
      return "待處理";
    case FeedbackStatus.REVIEW:
      return "審查中";
    case FeedbackStatus.DISCUSSION:
      return "討論中";
    case FeedbackStatus.ACCEPTED:
      return "已接受";
    case FeedbackStatus.DONE:
      return "已完成";
    case FeedbackStatus.REJECTED:
      return "已拒絕";
    case FeedbackStatus.ARCHIVED:
      return "已歸檔";
    default:
      return "未知";
  }
};

const getStatusColor = (status: FeedbackStatus) => {
  switch (status) {
    case FeedbackStatus.PENDING:
      return "text-yellow-600 dark:text-yellow-400";
    case FeedbackStatus.REVIEW:
      return "text-blue-600 dark:text-blue-400";
    case FeedbackStatus.DISCUSSION:
      return "text-purple-600 dark:text-purple-400";
    case FeedbackStatus.ACCEPTED:
      return "text-green-600 dark:text-green-400";
    case FeedbackStatus.DONE:
      return "text-green-700 dark:text-green-300";
    case FeedbackStatus.REJECTED:
      return "text-red-600 dark:text-red-400";
    case FeedbackStatus.ARCHIVED:
      return "text-gray-600 dark:text-gray-400";
    default:
      return "text-gray-500 dark:text-gray-400";
  }
};

const FeedbackDetailView: React.FC<FeedbackDetailViewProps> = ({ feedbackId }) => {
  const [feedbackData, setFeedbackData] = useState<FeedbackDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeedbackDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await feedbackService.getById(feedbackId);
        setFeedbackData(response.data);
      } catch (e) {
        console.error("Error fetching feedback detail:", e);
        setError("載入意見回饋詳情失敗");
      } finally {
        setLoading(false);
      }
    };

    if (feedbackId) {
      fetchFeedbackDetail();
    }
  }, [feedbackId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500 dark:text-gray-400">載入中...</div>
      </div>
    );
  }

  if (error || !feedbackData) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-red-500 dark:text-red-400">{error || "載入失敗"}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 基本資訊 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Input id="name" label="姓名" type="text" value={feedbackData.name} disabled />
        </div>

        <div>
          <Input
            id="email"
            label="電子郵件"
            type="email"
            value={feedbackData.email || "未提供"}
            disabled
          />
        </div>

        <div className="md:col-span-2">
          <Input
            id="status"
            label="狀態"
            type="text"
            value={getStatusText(feedbackData.status)}
            disabled
            className={getStatusColor(feedbackData.status)}
          />
        </div>
      </div>

      {/* 訊息內容 */}
      {feedbackData.message && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            訊息內容
          </label>
          <TextArea id="message" placeholder="" value={feedbackData.message || ""} disabled rows={5} />
        </div>
      )}

      {/* 描述 */}
      {feedbackData.description && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">描述</label>
          <TextArea
            id="description"
            placeholder=""
            value={feedbackData.description || ""}
            disabled
            rows={3}
          />
        </div>
      )}

      {/* 時間資訊 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Input
            id="createdAt"
            label="建立時間"
            type="text"
            value={feedbackData.createdAt ? DateUtil.format(feedbackData.createdAt) : "未知"}
            disabled
          />
        </div>

        <div>
          <Input
            id="updatedAt"
            label="更新時間"
            type="text"
            value={feedbackData.updatedAt ? DateUtil.format(feedbackData.updatedAt) : "未知"}
            disabled
          />
        </div>
      </div>

      {/* 備註 */}
      {feedbackData.remark && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">備註</label>
          <TextArea id="remark" placeholder="" value={feedbackData.remark || ""} disabled rows={3} />
        </div>
      )}
    </div>
  );
};

export default FeedbackDetailView;


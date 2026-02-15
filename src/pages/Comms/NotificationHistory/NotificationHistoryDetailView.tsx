import type { AdminNotificationHistoryItem } from "@/api/services/notificationService";
import { NotificationHistoryStatus } from "@/api/services/notificationService";
import { DateUtil } from "@/utils/dateUtil";
import { cn } from "@/utils";

interface NotificationHistoryDetailViewProps {
  item: AdminNotificationHistoryItem;
  className?: string;
}

const getStatusText = (status: number) => {
  switch (status) {
    case NotificationHistoryStatus.PENDING:
      return "待處理";
    case NotificationHistoryStatus.SUCCESS:
      return "成功";
    case NotificationHistoryStatus.FAILED:
      return "失敗";
    default:
      return "未知";
  }
};

const getStatusColor = (status: number) => {
  switch (status) {
    case NotificationHistoryStatus.PENDING:
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
    case NotificationHistoryStatus.SUCCESS:
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case NotificationHistoryStatus.FAILED:
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    default:
      return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400";
  }
};

const NotificationHistoryDetailView: React.FC<NotificationHistoryDetailViewProps> = ({ item, className }) => {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div>
          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">狀態</dt>
          <dd className="mt-1">
            <span className={cn("inline-flex px-2 py-0.5 rounded text-xs font-medium", getStatusColor(item.status))}>
              {getStatusText(item.status)}
            </span>
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">已讀</dt>
          <dd className="mt-1 text-sm text-gray-900 dark:text-white">{item.is_read ? "是" : "否"}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">通知 ID</dt>
          <dd className="mt-1 text-sm text-gray-900 dark:text-white font-mono text-xs truncate" title={item.notification_id}>
            {item.notification_id}
          </dd>
        </div>
      </div>
      {(item.user_display_name || item.user_email || item.user_phone_number) && (
        <div>
          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">關聯用戶</dt>
          <dd className="text-sm text-gray-900 dark:text-white space-y-1">
            {item.user_display_name && <div>顯示名稱: {item.user_display_name}</div>}
            {item.user_email && <div>電子郵件: {item.user_email}</div>}
            {item.user_phone_number && <div>電話: {item.user_phone_number}</div>}
          </dd>
        </div>
      )}
      {item.exception && (
        <div>
          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">異常訊息</dt>
          <dd className="mt-1 text-sm text-red-600 dark:text-red-400 whitespace-pre-wrap">{item.exception}</dd>
        </div>
      )}
      {item.message_id && (
        <div>
          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">FCM Message ID</dt>
          <dd className="mt-1 text-sm text-gray-900 dark:text-white font-mono text-xs">{item.message_id}</dd>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">建立時間</dt>
          <dd className="mt-1 text-sm text-gray-900 dark:text-white">
            {item.created_at ? DateUtil.format(item.created_at) : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">更新時間</dt>
          <dd className="mt-1 text-sm text-gray-900 dark:text-white">
            {item.updated_at ? DateUtil.format(item.updated_at) : "—"}
          </dd>
        </div>
      </div>
    </div>
  );
};

export default NotificationHistoryDetailView;

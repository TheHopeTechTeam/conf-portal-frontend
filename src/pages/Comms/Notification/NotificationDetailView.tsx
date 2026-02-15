import type { AdminNotificationItem } from "@/api/services/notificationService";
import {
  NotificationMethod,
  NotificationStatus,
  NotificationType,
} from "@/api/services/notificationService";
import { DateUtil } from "@/utils/dateUtil";
import { cn } from "@/utils";

interface NotificationDetailViewProps {
  item: AdminNotificationItem;
  className?: string;
}

const getMethodText = (method: number) => (method === NotificationMethod.PUSH ? "推播" : "電子郵件");
const getTypeText = (type: number) => {
  if (type === NotificationType.INDIVIDUAL) return "單一用戶";
  if (type === NotificationType.MULTIPLE) return "群組";
  if (type === NotificationType.SYSTEM) return "系統群發";
  return "未知";
};

const getStatusText = (status: number) => {
  switch (status) {
    case NotificationStatus.PENDING:
      return "待處理";
    case NotificationStatus.SENT:
      return "已發送";
    case NotificationStatus.FAILED:
      return "失敗";
    case NotificationStatus.DRY_RUN:
      return "試跑";
    default:
      return "未知";
  }
};

const getStatusColor = (status: number) => {
  switch (status) {
    case NotificationStatus.PENDING:
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
    case NotificationStatus.SENT:
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case NotificationStatus.FAILED:
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    case NotificationStatus.DRY_RUN:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    default:
      return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400";
  }
};

const NotificationDetailView: React.FC<NotificationDetailViewProps> = ({ item, className }) => {
  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">標題</dt>
        <dd className="mt-1 text-sm text-gray-900 dark:text-white">{item.title}</dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">內容</dt>
        <dd className="mt-1 text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{item.message}</dd>
      </div>
      {item.url && (
        <div>
          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">連結</dt>
          <dd className="mt-1 text-sm">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-600 hover:underline dark:text-brand-400"
            >
              {item.url}
            </a>
          </dd>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">發送方式</dt>
          <dd className="mt-1 text-sm text-gray-900 dark:text-white">{getMethodText(item.method)}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">類型</dt>
          <dd className="mt-1 text-sm text-gray-900 dark:text-white">{getTypeText(item.type)}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">狀態</dt>
          <dd className="mt-1">
            <span className={cn("inline-flex px-2 py-0.5 rounded text-xs font-medium", getStatusColor(item.status))}>
              {getStatusText(item.status)}
            </span>
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">成功 / 失敗</dt>
          <dd className="mt-1 text-sm text-gray-900 dark:text-white">
            {item.success_count} / {item.failure_count}
          </dd>
        </div>
      </div>
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

export default NotificationDetailView;

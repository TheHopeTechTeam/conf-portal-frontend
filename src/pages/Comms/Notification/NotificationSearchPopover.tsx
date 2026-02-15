import {
  NotificationMethod,
  NotificationStatus,
  NotificationType,
} from "@/api/services/notificationService";
import { PopoverType } from "@/components/DataPage";
import SearchPopoverContent from "@/components/DataPage/SearchPopoverContent";
import Input from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ReactNode } from "react";

export interface NotificationSearchFilters {
  keyword?: string;
  method?: NotificationMethod;
  type?: NotificationType;
  status?: NotificationStatus;
}

interface NotificationSearchPopoverProps {
  filters: NotificationSearchFilters;
  onFiltersChange: (filters: NotificationSearchFilters) => void;
  onSearch: (filters: NotificationSearchFilters) => void;
  onClear: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
  popover: PopoverType;
}

const getMethodOptions = () => [
  { value: "", label: "不限" },
  { value: NotificationMethod.PUSH.toString(), label: "推播" },
  { value: NotificationMethod.EMAIL.toString(), label: "電子郵件" },
];

const getTypeOptions = () => [
  { value: "", label: "不限" },
  { value: NotificationType.INDIVIDUAL.toString(), label: "單一用戶" },
  { value: NotificationType.MULTIPLE.toString(), label: "群組" },
  { value: NotificationType.SYSTEM.toString(), label: "系統群發" },
];

const getStatusOptions = () => [
  { value: "", label: "不限" },
  { value: NotificationStatus.PENDING.toString(), label: "待處理" },
  { value: NotificationStatus.SENT.toString(), label: "已發送" },
  { value: NotificationStatus.FAILED.toString(), label: "失敗" },
  { value: NotificationStatus.DRY_RUN.toString(), label: "試跑" },
];

const getMethodLabel = (method?: NotificationMethod) => {
  if (method === undefined) return "不限";
  return method === NotificationMethod.PUSH ? "推播" : "電子郵件";
};

const getTypeLabel = (type?: NotificationType) => {
  if (type === undefined) return "不限";
  if (type === NotificationType.INDIVIDUAL) return "單一用戶";
  if (type === NotificationType.MULTIPLE) return "群組";
  if (type === NotificationType.SYSTEM) return "系統群發";
  return "不限";
};

const getStatusLabel = (status?: NotificationStatus) => {
  if (status === undefined) return "不限";
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
      return "不限";
  }
};

const NotificationSearchPopover: React.FC<NotificationSearchPopoverProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  onClear,
  isOpen,
  onOpenChange,
  trigger,
  popover,
}) => {
  const handleFilterChange = (key: keyof NotificationSearchFilters, value: unknown) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  return (
    <SearchPopoverContent
      onSearch={() => onSearch(filters)}
      onClear={onClear}
      trigger={trigger}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      popover={popover}
    >
      <div className="space-y-4">
        <div>
          <Input
            id="keyword"
            label="關鍵字搜尋"
            type="text"
            value={filters.keyword || ""}
            onChange={(e) => handleFilterChange("keyword", e.target.value)}
            placeholder="搜尋標題或內容"
            clearable
          />
        </div>
        <div>
          <Select
            id="method"
            label="發送方式"
            options={getMethodOptions()}
            value={filters.method?.toString() ?? ""}
            onChange={(value) => handleFilterChange("method", value ? Number(value) : undefined)}
            placeholder="請選擇"
            clearable
            size="md"
          />
        </div>
        <div>
          <Select
            id="type"
            label="通知類型"
            options={getTypeOptions()}
            value={filters.type?.toString() ?? ""}
            onChange={(value) => handleFilterChange("type", value ? Number(value) : undefined)}
            placeholder="請選擇"
            clearable
            size="md"
          />
        </div>
        <div>
          <Select
            id="status"
            label="狀態"
            options={getStatusOptions()}
            value={filters.status?.toString() ?? ""}
            onChange={(value) => handleFilterChange("status", value ? Number(value) : undefined)}
            placeholder="請選擇"
            clearable
            size="md"
          />
        </div>
        {(filters.keyword ||
          filters.method !== undefined ||
          filters.type !== undefined ||
          filters.status !== undefined) && (
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">當前篩選：</div>
            <div className="flex flex-wrap gap-1">
              {filters.keyword && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  關鍵字: {filters.keyword}
                </span>
              )}
              {filters.method !== undefined && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                  方式: {getMethodLabel(filters.method)}
                </span>
              )}
              {filters.type !== undefined && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                  類型: {getTypeLabel(filters.type)}
                </span>
              )}
              {filters.status !== undefined && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                  狀態: {getStatusLabel(filters.status)}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </SearchPopoverContent>
  );
};

export default NotificationSearchPopover;

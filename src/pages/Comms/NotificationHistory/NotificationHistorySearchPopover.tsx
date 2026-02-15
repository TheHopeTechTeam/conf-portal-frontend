import { NotificationHistoryStatus } from "@/api/services/notificationService";
import { PopoverType } from "@/components/DataPage";
import SearchPopoverContent from "@/components/DataPage/SearchPopoverContent";
import Input from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ReactNode } from "react";

export interface NotificationHistorySearchFilters {
  keyword?: string;
  notification_id?: string;
  user_id?: string;
  status?: NotificationHistoryStatus;
}

interface NotificationHistorySearchPopoverProps {
  filters: NotificationHistorySearchFilters;
  onFiltersChange: (filters: NotificationHistorySearchFilters) => void;
  onSearch: (filters: NotificationHistorySearchFilters) => void;
  onClear: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
  popover: PopoverType;
}

const getStatusOptions = () => [
  { value: "", label: "不限" },
  { value: NotificationHistoryStatus.PENDING.toString(), label: "待處理" },
  { value: NotificationHistoryStatus.SUCCESS.toString(), label: "成功" },
  { value: NotificationHistoryStatus.FAILED.toString(), label: "失敗" },
];

const getStatusLabel = (status?: NotificationHistoryStatus) => {
  if (status === undefined) return "不限";
  switch (status) {
    case NotificationHistoryStatus.PENDING:
      return "待處理";
    case NotificationHistoryStatus.SUCCESS:
      return "成功";
    case NotificationHistoryStatus.FAILED:
      return "失敗";
    default:
      return "不限";
  }
};

const NotificationHistorySearchPopover: React.FC<NotificationHistorySearchPopoverProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  onClear,
  isOpen,
  onOpenChange,
  trigger,
  popover,
}) => {
  const handleFilterChange = (key: keyof NotificationHistorySearchFilters, value: unknown) => {
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
            placeholder="搜尋"
            clearable
          />
        </div>
        <div>
          <Input
            id="notification_id"
            label="通知 ID"
            type="text"
            value={filters.notification_id || ""}
            onChange={(e) => handleFilterChange("notification_id", e.target.value || undefined)}
            placeholder="UUID"
            clearable
          />
        </div>
        <div>
          <Input
            id="user_id"
            label="用戶 ID"
            type="text"
            value={filters.user_id || ""}
            onChange={(e) => handleFilterChange("user_id", e.target.value || undefined)}
            placeholder="UUID"
            clearable
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
        {(filters.keyword || filters.notification_id || filters.user_id || filters.status !== undefined) && (
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">當前篩選：</div>
            <div className="flex flex-wrap gap-1">
              {filters.keyword && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  關鍵字: {filters.keyword}
                </span>
              )}
              {filters.notification_id && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                  通知ID
                </span>
              )}
              {filters.user_id && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                  用戶ID
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

export default NotificationHistorySearchPopover;

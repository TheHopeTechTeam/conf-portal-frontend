import { FeedbackStatus } from "@/api/services/feedbackService";
import { PopoverType } from "@/components/DataPage";
import SearchPopoverContent from "@/components/DataPage/SearchPopoverContent";
import Input from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ReactNode } from "react";

export interface FeedbackSearchFilters {
  keyword?: string;
  status?: FeedbackStatus;
}

interface FeedbackSearchPopoverProps {
  filters: FeedbackSearchFilters;
  onFiltersChange: (filters: FeedbackSearchFilters) => void;
  onSearch: (filters: FeedbackSearchFilters) => void;
  onClear: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
  popover: PopoverType;
}

const getStatusOptions = () => {
  return [
    { value: "", label: "不限" },
    { value: FeedbackStatus.PENDING.toString(), label: "待處理" },
    { value: FeedbackStatus.REVIEW.toString(), label: "審查中" },
    { value: FeedbackStatus.DISCUSSION.toString(), label: "討論中" },
    { value: FeedbackStatus.ACCEPTED.toString(), label: "已接受" },
    { value: FeedbackStatus.DONE.toString(), label: "已完成" },
    { value: FeedbackStatus.REJECTED.toString(), label: "已拒絕" },
    { value: FeedbackStatus.ARCHIVED.toString(), label: "已歸檔" },
  ];
};

const getStatusLabel = (status?: FeedbackStatus) => {
  if (status === undefined) return "不限";
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
      return "不限";
  }
};

const FeedbackSearchPopover: React.FC<FeedbackSearchPopoverProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  onClear,
  isOpen,
  onOpenChange,
  trigger,
  popover,
}) => {
  const handleFilterChange = (key: keyof FeedbackSearchFilters, value: unknown) => {
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
        {/* 關鍵字搜尋 */}
        <div>
          <Input
            id="keyword"
            label="關鍵字搜尋"
            type="text"
            value={filters.keyword || ""}
            onChange={(e) => handleFilterChange("keyword", e.target.value)}
            placeholder="搜尋姓名或電子郵件"
            clearable
          />
        </div>

        {/* 狀態篩選 */}
        <div>
          <Select
            id="status"
            label="狀態篩選"
            options={getStatusOptions()}
            value={filters.status?.toString() || ""}
            onChange={(value) => handleFilterChange("status", value ? Number(value) : undefined)}
            placeholder="請選擇狀態"
            clearable
            size="md"
          />
        </div>

        {/* 篩選摘要 */}
        {(filters.keyword || filters.status !== undefined) && (
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">當前篩選條件：</div>
            <div className="flex flex-wrap gap-1">
              {filters.keyword && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  關鍵字: {filters.keyword}
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

export default FeedbackSearchPopover;


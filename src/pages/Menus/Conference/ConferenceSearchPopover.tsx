import { PopoverType } from "@/components/DataPage";
import SearchPopoverContent from "@/components/DataPage/SearchPopoverContent";
import Input from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ReactNode, useState } from "react";

export interface ConferenceSearchFilters {
  keyword?: string;
  isActive?: boolean;
}

interface ConferenceSearchPopoverProps {
  filters: ConferenceSearchFilters;
  onFiltersChange: (filters: ConferenceSearchFilters) => void;
  onSearch: (filters: ConferenceSearchFilters) => void;
  onClear: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
  popover: PopoverType;
}

const ConferenceSearchPopover: React.FC<ConferenceSearchPopoverProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  onClear,
  isOpen,
  onOpenChange,
  trigger,
  popover,
}) => {
  const handleFilterChange = (key: keyof ConferenceSearchFilters, value: unknown) => {
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
            placeholder="搜尋標題或備註"
            clearable
          />
        </div>

        {/* 啟用狀態篩選 */}
        <div>
          <Select
            id="isActive"
            label="啟用狀態"
            options={[
              { value: "true", label: "已啟用" },
              { value: "false", label: "未啟用" },
            ]}
            value={filters.isActive !== undefined ? String(filters.isActive) : ""}
            onChange={(value) => {
              if (value === "" || value === null) {
                handleFilterChange("isActive", undefined);
              } else {
                handleFilterChange("isActive", value === "true");
              }
            }}
            placeholder="全部"
            clearable
          />
        </div>

        {/* 篩選摘要 */}
        {(filters.keyword || filters.isActive !== undefined) && (
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">當前篩選條件：</div>
            <div className="flex flex-wrap gap-1">
              {filters.keyword && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  關鍵字: {filters.keyword}
                </span>
              )}
              {filters.isActive !== undefined && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                  狀態: {filters.isActive ? "已啟用" : "未啟用"}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </SearchPopoverContent>
  );
};

export default ConferenceSearchPopover;


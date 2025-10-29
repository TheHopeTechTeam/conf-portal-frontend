import { PopoverType } from "@/components/DataPage";
import SearchPopoverContent from "@/components/DataPage/SearchPopoverContent";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { ReactNode } from "react";

export interface PermissionSearchFilters {
  keyword?: string;
  isActive?: boolean;
}

interface PermissionSearchPopoverProps {
  filters: PermissionSearchFilters;
  onFiltersChange: (filters: PermissionSearchFilters) => void;
  onSearch: (filters: PermissionSearchFilters) => void;
  onClear: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
  popover: PopoverType;
}

const PermissionSearchPopover: React.FC<PermissionSearchPopoverProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  onClear,
  isOpen,
  onOpenChange,
  trigger,
  popover,
}) => {
  const handleFilterChange = (key: keyof PermissionSearchFilters, value: unknown) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const handleBooleanFilterChange = (key: keyof PermissionSearchFilters) => {
    const currentValue = filters[key];
    if (currentValue === true) {
      handleFilterChange(key, false);
    } else if (currentValue === false) {
      handleFilterChange(key, undefined);
    } else {
      handleFilterChange(key, true);
    }
  };

  const getBooleanLabel = (currentValue?: boolean, trueLabel = "是", falseLabel = "否") => {
    if (currentValue === true) return trueLabel;
    if (currentValue === false) return falseLabel;
    return "不限";
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">關鍵字搜尋</label>
          <Input
            type="text"
            value={filters.keyword || ""}
            onChange={(e) => handleFilterChange("keyword", e.target.value)}
            placeholder="搜尋顯示名稱或代碼"
          />
        </div>

        {/* 狀態篩選 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">狀態篩選</label>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">啟用狀態</label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBooleanFilterChange("isActive")}
                className={`w-full justify-start text-xs ${
                  filters.isActive === true
                    ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-300"
                    : filters.isActive === false
                    ? "bg-red-100 text-red-700 border-red-300 dark:bg-red-900 dark:text-red-300"
                    : ""
                }`}
              >
                {getBooleanLabel(filters.isActive, "已啟用", "未啟用")}
              </Button>
            </div>
          </div>
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
                  啟用: {getBooleanLabel(filters.isActive, "是", "否")}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </SearchPopoverContent>
  );
};

export default PermissionSearchPopover;

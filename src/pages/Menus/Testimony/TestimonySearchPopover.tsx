import { PopoverType } from "@/components/DataPage";
import SearchPopoverContent from "@/components/DataPage/SearchPopoverContent";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { ReactNode } from "react";

export interface TestimonySearchFilters {
  keyword?: string;
  share?: boolean;
}

interface TestimonySearchPopoverProps {
  filters: TestimonySearchFilters;
  onFiltersChange: (filters: TestimonySearchFilters) => void;
  onSearch: (filters: TestimonySearchFilters) => void;
  onClear: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
  popover: PopoverType;
}

const getBooleanLabel = (currentValue?: boolean, trueLabel = "是", falseLabel = "否") => {
  if (currentValue === true) return trueLabel;
  if (currentValue === false) return falseLabel;
  return "不限";
};

const TestimonySearchPopover: React.FC<TestimonySearchPopoverProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  onClear,
  isOpen,
  onOpenChange,
  trigger,
  popover,
}) => {
  const handleFilterChange = (key: keyof TestimonySearchFilters, value: unknown) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const handleBooleanFilterChange = (key: keyof TestimonySearchFilters) => {
    const currentValue = filters[key];
    if (currentValue === true) {
      handleFilterChange(key, false);
    } else if (currentValue === false) {
      handleFilterChange(key, undefined);
    } else {
      handleFilterChange(key, true);
    }
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
            placeholder="搜尋姓名或電話號碼"
            clearable
          />
        </div>

        {/* 分享狀態篩選 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">分享狀態</label>
          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBooleanFilterChange("share")}
              className={`w-full justify-start text-xs ${
                filters.share === true
                  ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-300"
                  : filters.share === false
                  ? "bg-red-100 text-red-700 border-red-300 dark:bg-red-900 dark:text-red-300"
                  : ""
              }`}
            >
              {getBooleanLabel(filters.share, "允許分享", "不允許分享")}
            </Button>
          </div>
        </div>

        {/* 篩選摘要 */}
        {(filters.keyword || filters.share !== undefined) && (
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">當前篩選條件：</div>
            <div className="flex flex-wrap gap-1">
              {filters.keyword && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  關鍵字: {filters.keyword}
                </span>
              )}
              {filters.share !== undefined && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                  分享: {getBooleanLabel(filters.share, "允許", "不允許")}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </SearchPopoverContent>
  );
};

export default TestimonySearchPopover;


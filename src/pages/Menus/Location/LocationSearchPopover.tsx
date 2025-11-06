import { PopoverType } from "@/components/DataPage";
import SearchPopoverContent from "@/components/DataPage/SearchPopoverContent";
import Input from "@/components/ui/input";
import { ReactNode } from "react";

export interface LocationSearchFilters {
  keyword?: string;
  roomNumber?: string;
}

interface LocationSearchPopoverProps {
  filters: LocationSearchFilters;
  onFiltersChange: (filters: LocationSearchFilters) => void;
  onSearch: (filters: LocationSearchFilters) => void;
  onClear: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
  popover: PopoverType;
}

const LocationSearchPopover: React.FC<LocationSearchPopoverProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  onClear,
  isOpen,
  onOpenChange,
  trigger,
  popover,
}) => {
  const handleFilterChange = (key: keyof LocationSearchFilters, value: unknown) => {
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
            placeholder="搜尋地點名稱、地址或備註"
            clearable
          />
        </div>

        {/* 房間號碼篩選 */}
        <div>
          <Input
            id="roomNumber"
            label="房間號碼篩選"
            type="text"
            value={filters.roomNumber || ""}
            onChange={(e) => handleFilterChange("roomNumber", e.target.value)}
            placeholder="搜尋房間號碼"
            clearable
          />
        </div>

        {/* 篩選摘要 */}
        {(filters.keyword || filters.roomNumber) && (
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">當前篩選條件：</div>
            <div className="flex flex-wrap gap-1">
              {filters.keyword && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  關鍵字: {filters.keyword}
                </span>
              )}
              {filters.roomNumber && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                  房間號碼: {filters.roomNumber}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </SearchPopoverContent>
  );
};

export default LocationSearchPopover;


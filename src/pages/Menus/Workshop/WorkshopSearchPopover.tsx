import { conferenceService } from "@/api/services/conferenceService";
import { locationService } from "@/api/services/locationService";
import { PopoverType } from "@/components/DataPage";
import SearchPopoverContent from "@/components/DataPage/SearchPopoverContent";
import Input from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ReactNode, useEffect, useState } from "react";

export interface WorkshopSearchFilters {
  keyword?: string;
  isActive?: boolean;
  locationId?: string;
  conferenceId?: string;
  startTime?: string; // ISO 8601 datetime
  endTime?: string; // ISO 8601 datetime
}

interface WorkshopSearchPopoverProps {
  filters: WorkshopSearchFilters;
  onFiltersChange: (filters: WorkshopSearchFilters) => void;
  onSearch: (filters: WorkshopSearchFilters) => void;
  onClear: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
  popover: PopoverType;
}

const WorkshopSearchPopover: React.FC<WorkshopSearchPopoverProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  onClear,
  isOpen,
  onOpenChange,
  trigger,
  popover,
}) => {
  const [locations, setLocations] = useState<Array<{ value: string; label: string }>>([]);
  const [conferences, setConferences] = useState<Array<{ value: string; label: string }>>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [loadingConferences, setLoadingConferences] = useState(false);

  // 載入地點列表
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoadingLocations(true);
        const response = await locationService.getList();
        const locationItems = response.data.items || [];
        setLocations(
          locationItems.map((item) => ({
            value: item.id,
            label: item.name,
          }))
        );
      } catch (e) {
        console.error("Error fetching locations:", e);
      } finally {
        setLoadingLocations(false);
      }
    };

    fetchLocations();
  }, []);

  // 載入會議列表
  useEffect(() => {
    const fetchConferences = async () => {
      try {
        setLoadingConferences(true);
        const response = await conferenceService.getList();
        const conferenceItems = response.data.items || [];
        setConferences(
          conferenceItems.map((item) => ({
            value: item.id,
            label: item.title,
          }))
        );
      } catch (e) {
        console.error("Error fetching conferences:", e);
      } finally {
        setLoadingConferences(false);
      }
    };

    fetchConferences();
  }, []);

  const handleFilterChange = (key: keyof WorkshopSearchFilters, value: unknown) => {
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

        {/* 地點篩選 */}
        <div>
          <Select
            id="locationId"
            label="地點"
            options={locations}
            value={filters.locationId || ""}
            onChange={(value) => {
              handleFilterChange("locationId", value ? String(value) : undefined);
            }}
            placeholder="全部"
            clearable
            disabled={loadingLocations}
          />
        </div>

        {/* 會議篩選 */}
        <div>
          <Select
            id="conferenceId"
            label="會議"
            options={conferences}
            value={filters.conferenceId || ""}
            onChange={(value) => {
              handleFilterChange("conferenceId", value ? String(value) : undefined);
            }}
            placeholder="全部"
            clearable
            disabled={loadingConferences}
          />
        </div>

        {/* 開始時間篩選 */}
        <div>
          <Input
            id="startTime"
            label="開始時間"
            type="datetime-local"
            value={filters.startTime ? filters.startTime.substring(0, 16) : ""}
            onChange={(e) => {
              const value = e.target.value;
              handleFilterChange("startTime", value ? `${value}:00` : undefined);
            }}
            clearable
          />
        </div>

        {/* 結束時間篩選 */}
        <div>
          <Input
            id="endTime"
            label="結束時間"
            type="datetime-local"
            value={filters.endTime ? filters.endTime.substring(0, 16) : ""}
            onChange={(e) => {
              const value = e.target.value;
              handleFilterChange("endTime", value ? `${value}:00` : undefined);
            }}
            clearable
          />
        </div>

        {/* 篩選摘要 */}
        {(filters.keyword ||
          filters.isActive !== undefined ||
          filters.locationId ||
          filters.conferenceId ||
          filters.startTime ||
          filters.endTime) && (
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
              {filters.locationId && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                  地點: {locations.find((l) => l.value === filters.locationId)?.label || filters.locationId}
                </span>
              )}
              {filters.conferenceId && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                  會議: {conferences.find((c) => c.value === filters.conferenceId)?.label || filters.conferenceId}
                </span>
              )}
              {filters.startTime && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                  開始: {filters.startTime.substring(0, 16)}
                </span>
              )}
              {filters.endTime && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                  結束: {filters.endTime.substring(0, 16)}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </SearchPopoverContent>
  );
};

export default WorkshopSearchPopover;

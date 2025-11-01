import { PopoverType } from "@/components/DataPage";
import SearchPopoverContent from "@/components/DataPage/SearchPopoverContent";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Gender } from "@/const/enums";
import { ReactNode } from "react";

export interface UserSearchFilters {
  keyword?: string;
  verified?: boolean;
  is_active?: boolean;
  is_admin?: boolean;
  is_superuser?: boolean;
  is_ministry?: boolean;
  gender?: Gender;
}

interface UserSearchPopoverProps {
  filters: UserSearchFilters;
  onFiltersChange: (filters: UserSearchFilters) => void;
  onSearch: (filters: UserSearchFilters) => void;
  onClear: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
  popover: PopoverType;
}

const UserSearchPopover: React.FC<UserSearchPopoverProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  onClear,
  isOpen,
  onOpenChange,
  trigger,
  popover,
}) => {
  const handleFilterChange = (key: keyof UserSearchFilters, value: unknown) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const handleBooleanFilterChange = (key: keyof UserSearchFilters) => {
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

  const getGenderLabel = (gender?: Gender) => {
    switch (gender) {
      case Gender.Male:
        return "男性";
      case Gender.Female:
        return "女性";
      case Gender.Other:
        return "其他";
      default:
        return "不限";
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
            placeholder="搜尋手機號碼、電子郵件、顯示名稱"
            clearable
          />
        </div>

        {/* 狀態篩選 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">狀態篩選</label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">已驗證</label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBooleanFilterChange("verified")}
                className={`w-full justify-start text-xs ${
                  filters.verified === true
                    ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-300"
                    : filters.verified === false
                    ? "bg-red-100 text-red-700 border-red-300 dark:bg-red-900 dark:text-red-300"
                    : ""
                }`}
              >
                {getBooleanLabel(filters.verified, "已驗證", "未驗證")}
              </Button>
            </div>

            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">啟用狀態</label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBooleanFilterChange("is_active")}
                className={`w-full justify-start text-xs ${
                  filters.is_active === true
                    ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-300"
                    : filters.is_active === false
                    ? "bg-red-100 text-red-700 border-red-300 dark:bg-red-900 dark:text-red-300"
                    : ""
                }`}
              >
                {getBooleanLabel(filters.is_active, "已啟用", "未啟用")}
              </Button>
            </div>

            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">後台管理員</label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBooleanFilterChange("is_admin")}
                className={`w-full justify-start text-xs ${
                  filters.is_admin === true
                    ? "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900 dark:text-blue-300"
                    : filters.is_admin === false
                    ? "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300"
                    : ""
                }`}
              >
                {getBooleanLabel(filters.is_admin, "管理員", "一般用戶")}
              </Button>
            </div>

            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">超級管理員</label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBooleanFilterChange("is_superuser")}
                className={`w-full justify-start text-xs ${
                  filters.is_superuser === true
                    ? "bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900 dark:text-purple-300"
                    : filters.is_superuser === false
                    ? "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300"
                    : ""
                }`}
              >
                {getBooleanLabel(filters.is_superuser, "超級管理員", "非超級管理員")}
              </Button>
            </div>

            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">服事人員</label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBooleanFilterChange("is_ministry")}
                className={`w-full justify-start text-xs ${
                  filters.is_ministry === true
                    ? "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900 dark:text-orange-300"
                    : filters.is_ministry === false
                    ? "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300"
                    : ""
                }`}
              >
                {getBooleanLabel(filters.is_ministry, "服事人員", "非服事人員")}
              </Button>
            </div>
          </div>
        </div>

        {/* 性別篩選 */}
        <div>
          <Select
            id="gender"
            label="性別篩選"
            options={[
              { value: "", label: "不限" },
              { value: Gender.Male.toString(), label: "男性" },
              { value: Gender.Female.toString(), label: "女性" },
              { value: Gender.Other.toString(), label: "其他" },
            ]}
            value={filters.gender?.toString() || ""}
            onChange={(value) => handleFilterChange("gender", value ? Number(value) : undefined)}
            placeholder="請選擇性別"
            clearable
            size="md"
          />
        </div>

        {/* 篩選摘要 */}
        {(filters.keyword ||
          filters.verified !== undefined ||
          filters.is_active !== undefined ||
          filters.is_admin !== undefined ||
          filters.is_superuser !== undefined ||
          filters.is_ministry !== undefined ||
          filters.gender !== undefined) && (
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">當前篩選條件：</div>
            <div className="flex flex-wrap gap-1">
              {filters.keyword && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  關鍵字: {filters.keyword}
                </span>
              )}
              {filters.verified !== undefined && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                  已驗證: {getBooleanLabel(filters.verified, "是", "否")}
                </span>
              )}
              {filters.is_active !== undefined && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                  啟用: {getBooleanLabel(filters.is_active, "是", "否")}
                </span>
              )}
              {filters.is_admin !== undefined && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  管理員: {getBooleanLabel(filters.is_admin, "是", "否")}
                </span>
              )}
              {filters.is_superuser !== undefined && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                  超級管理員: {getBooleanLabel(filters.is_superuser, "是", "否")}
                </span>
              )}
              {filters.is_ministry !== undefined && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                  服事人員: {getBooleanLabel(filters.is_ministry, "是", "否")}
                </span>
              )}
              {filters.gender !== undefined && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300">
                  性別: {getGenderLabel(filters.gender)}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </SearchPopoverContent>
  );
};

export default UserSearchPopover;

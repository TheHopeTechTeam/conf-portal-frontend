import { faqCategoryService, type FaqCategoryBase } from "@/api/services/faqService";
import { PopoverType } from "@/components/DataPage";
import SearchPopoverContent from "@/components/DataPage/SearchPopoverContent";
import Input from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ReactNode, useEffect, useState } from "react";

export interface FaqSearchFilters {
  keyword?: string;
  categoryId?: string;
}

interface FaqSearchPopoverProps {
  filters: FaqSearchFilters;
  onFiltersChange: (filters: FaqSearchFilters) => void;
  onSearch: (filters: FaqSearchFilters) => void;
  onClear: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
  popover: PopoverType;
}

const FaqSearchPopover: React.FC<FaqSearchPopoverProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  onClear,
  isOpen,
  onOpenChange,
  trigger,
  popover,
}) => {
  const [categories, setCategories] = useState<FaqCategoryBase[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await faqCategoryService.getList();
        setCategories(response.data.categories || []);
      } catch (e) {
        console.error("Error fetching categories:", e);
      } finally {
        setLoadingCategories(false);
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const handleFilterChange = (key: keyof FaqSearchFilters, value: unknown) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const categoryOptions = [
    { value: "", label: "不限" },
    ...categories.map((cat) => ({
      value: cat.id,
      label: cat.name,
    })),
  ];

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
            placeholder="搜尋問題或答案"
            clearable
          />
        </div>

        {/* 分類篩選 */}
        <div>
          <Select
            id="categoryId"
            label="分類篩選"
            options={categoryOptions}
            value={filters.categoryId || ""}
            onChange={(value) => handleFilterChange("categoryId", value || undefined)}
            placeholder="請選擇分類"
            clearable
            size="md"
            disabled={loadingCategories}
          />
        </div>

        {/* 篩選摘要 */}
        {(filters.keyword || filters.categoryId) && (
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">當前篩選條件：</div>
            <div className="flex flex-wrap gap-1">
              {filters.keyword && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  關鍵字: {filters.keyword}
                </span>
              )}
              {filters.categoryId && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                  分類: {categories.find((c) => c.id === filters.categoryId)?.name || "未知"}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </SearchPopoverContent>
  );
};

export default FaqSearchPopover;


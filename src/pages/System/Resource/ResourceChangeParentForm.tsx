import Button from "@/components/ui/button";
import Radio from "@/components/ui/radio";
import type { ResourceMenuItem } from "@/types/resource";
import { useState } from "react";

interface ResourceChangeParentFormProps {
  rootResources: ResourceMenuItem[];
  currentResource: ResourceMenuItem;
  onSubmit: (parentId: string) => Promise<void> | void;
  onCancel: () => void;
  submitting?: boolean;
}

const ResourceChangeParentForm: React.FC<ResourceChangeParentFormProps> = ({
  rootResources,
  currentResource,
  onSubmit,
  onCancel,
  submitting = false,
}) => {
  const [selectedParentId, setSelectedParentId] = useState<string>(currentResource.pid || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedParentId) {
      await onSubmit(selectedParentId);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 mb-4">
          <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">切換父資源</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          選擇要將「<span className="font-medium">{currentResource.name}</span>」移動到的父資源（僅能選擇根節點）
        </p>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
        {rootResources.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">沒有可用的根節點資源</p>
        ) : (
          rootResources.map((resource) => (
            <Radio
              key={resource.id}
              id={`parent-${resource.id}`}
              name="parent"
              value={resource.id}
              checked={selectedParentId === resource.id}
              label={resource.name}
              onChange={(value) => setSelectedParentId(value as string)}
              disabled={submitting}
            />
          ))
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button btnType="button" variant="outline" onClick={onCancel} disabled={submitting}>
          取消
        </Button>
        <Button btnType="submit" variant="primary" disabled={submitting || !selectedParentId || selectedParentId === currentResource.pid}>
          {submitting ? "處理中..." : "確認切換"}
        </Button>
      </div>
    </form>
  );
};

export default ResourceChangeParentForm;


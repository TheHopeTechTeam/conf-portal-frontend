import React, { useState } from "react";
import { MdClear, MdDelete, MdSelectAll } from "react-icons/md";
import { useResourcePermissions } from "@/hooks/useResourcePermissions";
import Button from "@/components/ui/button";

interface ResourceBulkActionsProps {
  selectedIds: string[];
  totalCount: number;
  onBulkDelete: (ids: string[]) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
}

export const ResourceBulkActions: React.FC<ResourceBulkActionsProps> = ({
  selectedIds,
  totalCount,
  onBulkDelete,
  onSelectAll,
  onClearSelection,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const permissions = useResourcePermissions();

  const selectedCount = selectedIds.length;
  const isAllSelected = selectedCount === totalCount && totalCount > 0;
  const hasSelection = selectedCount > 0;

  const handleBulkDelete = () => {
    if (selectedCount === 0) return;

    if (window.confirm(`確定要刪除選中的 ${selectedCount} 個資源嗎？此操作無法撤銷。`)) {
      onBulkDelete(selectedIds);
      setShowDeleteConfirm(false);
    }
  };

  if (!hasSelection) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            已選擇 <span className="font-medium text-gray-900">{selectedCount}</span> 個資源
          </span>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={isAllSelected ? onClearSelection : onSelectAll}
              className="flex items-center gap-2"
            >
              {isAllSelected ? (
                <>
                  <MdClear className="h-4 w-4" />
                  取消全選
                </>
              ) : (
                <>
                  <MdSelectAll className="h-4 w-4" />
                  全選
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          {permissions.canDelete && (
            <Button size="sm" variant="destructive" onClick={handleBulkDelete} className="flex items-center gap-2">
              <MdDelete className="h-4 w-4" />
              批量刪除 ({selectedCount})
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

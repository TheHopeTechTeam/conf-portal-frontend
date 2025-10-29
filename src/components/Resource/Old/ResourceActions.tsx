import type { ResourceMenuItem } from "@/api/services/resourceService";
import React from "react";
import { MdDelete, MdEdit } from "react-icons/md";

interface ResourceActionsProps {
  resource: ResourceMenuItem;
  onEdit?: (resource: ResourceMenuItem) => void;
  onDelete?: (id: string) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export const ResourceActions: React.FC<ResourceActionsProps> = ({ resource, onEdit, onDelete, canEdit = false, canDelete = false }) => {
  const hasActions = canEdit || canDelete;

  if (!hasActions) {
    return null;
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit(resource);
    }
  };

  const handleDelete = () => {
    if (onDelete && window.confirm(`確定要刪除資源 "${resource.name}" 嗎？`)) {
      onDelete(resource.id);
    }
  };

  // 如果只有一個操作，直接顯示按鈕
  if (canEdit && !canDelete) {
    return (
      <button
        onClick={handleEdit}
        className="h-8 w-8 p-1 flex items-center justify-center rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
        title="編輯資源"
      >
        <MdEdit className="h-4 w-4" />
      </button>
    );
  }

  if (canDelete && !canEdit) {
    return (
      <button
        onClick={handleDelete}
        className="h-8 w-8 p-1 flex items-center justify-center rounded border border-gray-300 bg-white text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
        title="刪除資源"
      >
        <MdDelete className="h-4 w-4" />
      </button>
    );
  }

  // 多個操作時並排顯示按鈕
  return (
    <div className="flex items-center gap-1">
      {canEdit && (
        <button
          onClick={handleEdit}
          className="h-8 w-8 p-1 flex items-center justify-center rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
          title="編輯資源"
        >
          <MdEdit className="h-4 w-4" />
        </button>
      )}

      {canDelete && (
        <button
          onClick={handleDelete}
          className="h-8 w-8 p-1 flex items-center justify-center rounded border border-gray-300 bg-white text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
          title="刪除資源"
        >
          <MdDelete className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

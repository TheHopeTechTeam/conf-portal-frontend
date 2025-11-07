import type { ResourceMenuItem } from "@/types/resource";
import { useEffect, useRef, useState } from "react";
import { MdAdd, MdArrowDownward, MdArrowUpward, MdDelete, MdEdit, MdRestore, MdVisibility, MdSwapHoriz } from "react-icons/md";

interface ResourceContextMenuProps {
  visible: boolean;
  x: number;
  y: number;
  resource: ResourceMenuItem | null;
  onView: (resource: ResourceMenuItem) => void;
  onEdit: (resource: ResourceMenuItem) => void;
  onDelete: (resource: ResourceMenuItem) => void;
  onRestore: (resource: ResourceMenuItem) => void;
  onAddChild: (resource: ResourceMenuItem) => void;
  onMoveUp: (resource: ResourceMenuItem) => void;
  onMoveDown: (resource: ResourceMenuItem) => void;
  onChangeParent: (resource: ResourceMenuItem) => void;
  canView?: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canRestore: boolean;
  canAddChild: boolean;
  canMoveUp: (id: string) => boolean;
  canMoveDown: (id: string) => boolean;
  canChangeParent?: boolean;
}

export const ResourceContextMenu: React.FC<ResourceContextMenuProps> = ({
  visible,
  x,
  y,
  resource,
  onView,
  onEdit,
  onDelete,
  onRestore,
  onAddChild,
  onMoveUp,
  onMoveDown,
  onChangeParent,
  canView = true,
  canEdit,
  canDelete,
  canRestore,
  canAddChild,
  canMoveUp,
  canMoveDown,
  canChangeParent = true,
}) => {
  // 限制菜單位置在可視區域內
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number }>({ left: x, top: y });

  useEffect(() => {
    if (!visible) return;
    const padding = 8;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let left = x;
    let top = y;

    // 暫用預估尺寸，渲染後再校正
    const rect = menuRef.current?.getBoundingClientRect();
    const width = rect?.width ?? 200;
    const height = rect?.height ?? 260;

    if (left + width + padding > vw) {
      left = Math.max(padding, vw - width - padding);
    }
    if (top + height + padding > vh) {
      top = Math.max(padding, vh - height - padding);
    }

    setPos({ left, top });
  }, [visible, x, y]);

  if (!visible || !resource) {
    return null;
  }

  // 在回收桶模式下，未刪除的根資源：僅顯示「查看資料」
  const showOnlyViewInTrashForRoot = canRestore && !resource.is_deleted && !resource.pid;

  return (
    <div
      ref={menuRef}
      className="fixed z-[1000] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[180px] max-w-[90vw]"
      style={{ left: pos.left, top: pos.top }}
    >
      {/* 查看 - 任何狀態都可查看 */}
      {canView && (
        <button
          onClick={() => onView(resource)}
          className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
        >
          <MdVisibility className="h-4 w-4" />
          查看資料
        </button>
      )}

      {/* 編輯 - 只有未刪除的資源才顯示編輯選項 */}
      {!showOnlyViewInTrashForRoot && canEdit && !resource.is_deleted && (
        <button
          onClick={() => onEdit(resource)}
          className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
        >
          <MdEdit className="h-4 w-4" />
          編輯資源
        </button>
      )}

      {/* 新增子資源 - 只有未刪除的根資源才顯示 */}
      {!showOnlyViewInTrashForRoot && canAddChild && !resource.is_deleted && !resource.pid && (
        <button
          onClick={() => onAddChild(resource)}
          className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
        >
          <MdAdd className="h-4 w-4" />
          新增子資源
        </button>
      )}

      {/* 切換父資源 - 只有未刪除的子資源才顯示 */}
      {!showOnlyViewInTrashForRoot && canChangeParent && canEdit && !resource.is_deleted && resource.pid && (
        <button
          onClick={() => onChangeParent(resource)}
          className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
        >
          <MdSwapHoriz className="h-4 w-4" />
          切換父資源
        </button>
      )}

      {/* 排序操作 - 只有未刪除的資源才顯示排序選項 */}
      {!showOnlyViewInTrashForRoot && canEdit && !resource.is_deleted && (
        <>
          <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>

          {canMoveUp(resource.id) && (
            <button
              onClick={() => onMoveUp(resource)}
              className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <MdArrowUpward className="h-4 w-4" />
              上移一位
            </button>
          )}

          {canMoveDown(resource.id) && (
            <button
              onClick={() => onMoveDown(resource)}
              className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <MdArrowDownward className="h-4 w-4" />
              下移一位
            </button>
          )}
        </>
      )}

      {/* 恢復 - 只有在回收桶模式且資源已刪除時才顯示 */}
      {!showOnlyViewInTrashForRoot && canRestore && resource.is_deleted && (
        <>
          <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>
          <button
            onClick={() => onRestore(resource)}
            className="w-full px-3 py-2 text-left text-sm text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 flex items-center gap-2"
          >
            <MdRestore className="h-4 w-4" />
            恢復資源
          </button>
        </>
      )}

      {/* 刪除 */}
      {!showOnlyViewInTrashForRoot && canDelete && (
        <>
          <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>
          <button
            onClick={() => onDelete(resource)}
            className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
          >
            <MdDelete className="h-4 w-4" />
            {canRestore && resource.is_deleted ? "永久刪除" : "刪除資源"}
          </button>
        </>
      )}
    </div>
  );
};

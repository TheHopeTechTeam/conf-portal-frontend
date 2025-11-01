import { resourceService } from "@/api";
import type { ResourceMenuItem } from "@/api/services/resourceService";
import { useResourceManagement } from "@/hooks/useResourceManagement";
import { useResourcePermissions } from "@/hooks/useResourcePermissions";
import type { ResourceTreeNode } from "@/types/resource";
import { useCallback, useState } from "react";
import RestoreForm from "../DataPage/RestoreForm";
import { Modal } from "../ui/modal";
import { ResourceContextMenu } from "./ResourceContextMenu";
import ResourceDataForm, { type ResourceFormValues } from "./ResourceDataForm";
import ResourceDeleteForm from "./ResourceDeleteForm";
import ResourceDetailView from "./ResourceDetailView";
import { ResourceToolbar } from "./ResourceToolbar";
import { ResourceTreeView } from "./ResourceTreeView";

export default function ResourcePageNew() {
  const permissions = useResourcePermissions();

  // 使用重構後的 hook
  const {
    resources,
    treeData,
    selectedResource,
    isLoading,
    error,
    showDeleted,
    selectResource,
    saveResource,
    deleteResource,
    restoreResource,
    moveUp,
    moveDown,
    canMoveUp,
    canMoveDown,
    toggleTrashMode,
    fetchResources,
  } = useResourceManagement();

  // UI 狀態
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    resource: ResourceMenuItem | null;
  }>({
    visible: false,
    x: 0,
    y: 0,
    resource: null,
  });

  // 表單狀態
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isRestoreOpen, setIsRestoreOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<ResourceMenuItem | null>(null);
  const [parentResource, setParentResource] = useState<{ id: string; name: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [restoreIds, setRestoreIds] = useState<string[]>([]);

  // 展開/收合節點
  const toggleExpand = useCallback((nodeId: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, []);

  // 展開全部
  const expandAll = useCallback(() => {
    const allNodeIds = new Set<string>();
    const collectIds = (nodes: ResourceTreeNode[]) => {
      nodes.forEach((node) => {
        allNodeIds.add(node.id);
        collectIds(node.children);
      });
    };
    collectIds(treeData);
    setExpandedNodes(allNodeIds);
  }, [treeData]);

  // 收合全部
  const collapseAll = useCallback(() => {
    setExpandedNodes(new Set());
  }, []);

  // 刷新資源（包裝 hook 的 fetchResources 以處理錯誤）
  const refreshResources = useCallback(async () => {
    try {
      await fetchResources();
    } catch (e) {
      console.error("刷新資源失敗:", e);
      alert("刷新失敗，請稍後再試");
    }
  }, [fetchResources]);

  // Context Menu 處理
  const handleContextMenu = useCallback((e: React.MouseEvent, resource: ResourceMenuItem) => {
    e.preventDefault();
    e.stopPropagation();

    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      resource,
    });
  }, []);

  const hideContextMenu = useCallback(() => {
    setContextMenu((prev) => ({ ...prev, visible: false }));
  }, []);

  // 表單處理函數
  const openModal = useCallback((mode: "create" | "edit", resource?: ResourceMenuItem, parent?: { id: string; name: string }) => {
    setFormMode(mode);
    setEditing(resource || null);
    setParentResource(parent || null);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setEditing(null);
    setParentResource(null);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setIsDeleteOpen(false);
    setEditing(null);
  }, []);

  const closeRestoreModal = useCallback(() => {
    setIsRestoreOpen(false);
    setRestoreIds([]);
  }, []);

  const closeViewModal = useCallback(() => {
    setIsViewOpen(false);
    setEditing(null);
  }, []);

  // 處理新增根資源
  const handleAddRootResource = useCallback(() => {
    // 新增時清除選取，確保走建立流程
    selectResource(null);
    openModal("create");
  }, [openModal, selectResource]);

  // 處理新增子資源
  const handleAddChild = useCallback(
    (resource: ResourceMenuItem) => {
      // 新增子資源也視為建立流程
      selectResource(null);
      openModal("create", undefined, { id: resource.id, name: resource.name });
      hideContextMenu();
    },
    [openModal, hideContextMenu, selectResource]
  );

  // 處理編輯
  const handleEdit = useCallback(
    async (resource: ResourceMenuItem) => {
      try {
        // 先取得資源詳細資訊，再打開編輯表單
        const resp = await resourceService.getResource(resource.id);
        if (resp.success && resp.data) {
          // 設定當前選取資源，讓保存時走更新 API
          selectResource(resp.data as any);
          openModal("edit", resp.data);
        } else {
          // 若取得失敗，退回使用原有資料
          selectResource(resource);
          openModal("edit", resource);
        }
      } catch (e) {
        // 發生錯誤時，也使用原有資料
        selectResource(resource);
        openModal("edit", resource);
      } finally {
        hideContextMenu();
      }
    },
    [openModal, hideContextMenu, selectResource]
  );

  // 處理查看
  const handleView = useCallback(
    (resource: ResourceMenuItem) => {
      setEditing(resource);
      setIsViewOpen(true);
      hideContextMenu();
    },
    [hideContextMenu]
  );

  // 處理刪除
  const handleDelete = useCallback(
    (resource: ResourceMenuItem) => {
      setEditing(resource);
      setIsDeleteOpen(true);
      hideContextMenu();
    },
    [hideContextMenu]
  );

  // 處理刪除確認
  const handleDeleteConfirm = useCallback(
    async (data: { reason?: string; permanent?: boolean }) => {
      if (!editing) return;

      setSubmitting(true);
      try {
        await deleteResource(editing.id, data.reason, data.permanent);
        closeDeleteModal();
      } catch (e) {
        console.error("刪除資源失敗:", e);
        alert("刪除失敗，請稍後再試");
      } finally {
        setSubmitting(false);
      }
    },
    [editing, deleteResource, closeDeleteModal]
  );

  // 處理恢復
  const handleRestore = useCallback(
    (resource: ResourceMenuItem) => {
      setRestoreIds([resource.id]);
      setIsRestoreOpen(true);
      hideContextMenu();
    },
    [hideContextMenu]
  );

  // 處理恢復確認
  const handleRestoreConfirm = useCallback(
    async (ids: string[]) => {
      setSubmitting(true);
      try {
        for (const id of ids) {
          await restoreResource(id);
        }
        closeRestoreModal();
      } catch (e) {
        console.error("恢復資源失敗:", e);
        alert("恢復失敗，請稍後再試");
      } finally {
        setSubmitting(false);
      }
    },
    [restoreResource, closeRestoreModal]
  );

  // 處理排序
  const handleMoveUp = useCallback(
    async (resource: ResourceMenuItem) => {
      try {
        await moveUp(resource.id);
      } catch (e) {
        console.error("上移資源失敗:", e);
        alert("上移失敗，請稍後再試");
      }
      hideContextMenu();
    },
    [moveUp, hideContextMenu]
  );

  const handleMoveDown = useCallback(
    async (resource: ResourceMenuItem) => {
      try {
        await moveDown(resource.id);
      } catch (e) {
        console.error("下移資源失敗:", e);
        alert("下移失敗，請稍後再試");
      }
      hideContextMenu();
    },
    [moveDown, hideContextMenu]
  );

  // 處理表單提交
  const handleSubmit = useCallback(
    async (values: ResourceFormValues) => {
      setSubmitting(true);
      try {
        await saveResource(values);
        closeModal();
      } catch (e) {
        console.error("儲存資源失敗:", e);
        alert("儲存失敗，請稍後再試");
      } finally {
        setSubmitting(false);
      }
    },
    [saveResource, closeModal]
  );

  // 點擊外部關閉 Context Menu
  const handleClickOutside = useCallback(() => {
    hideContextMenu();
  }, [hideContextMenu]);

  // 載入狀態
  if (isLoading && resources.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">載入資源資料中...</p>
        </div>
      </div>
    );
  }

  // 錯誤狀態
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">載入資源資料失敗</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col rounded-xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-700 relative">
      {/* Resource Toolbar */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <ResourceToolbar
          onExpandAll={expandAll}
          onCollapseAll={collapseAll}
          onRefresh={refreshResources}
          onToggleTrashMode={toggleTrashMode}
          onAddRootResource={handleAddRootResource}
          isLoading={isLoading}
          isTrashMode={showDeleted}
          canAdd={permissions.canModify}
        />
      </div>

      {/* 資源樹狀結構 */}
      <div className="flex-1 relative">
        <ResourceTreeView
          treeData={treeData}
          selectedResource={selectedResource}
          onSelect={selectResource}
          onContextMenu={handleContextMenu}
          expandedNodes={expandedNodes}
          onToggleExpand={toggleExpand}
        />

        {/* 刷新時的 Loading 覆蓋層 */}
        {isLoading && resources.length > 0 && (
          <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">刷新中...</p>
            </div>
          </div>
        )}
      </div>

      {/* Context Menu */}
      <ResourceContextMenu
        visible={contextMenu.visible}
        x={contextMenu.x}
        y={contextMenu.y}
        resource={contextMenu.resource}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRestore={handleRestore}
        onAddChild={handleAddChild}
        onMoveUp={handleMoveUp}
        onMoveDown={handleMoveDown}
        canView
        canEdit={permissions.canModify}
        canDelete={permissions.canDelete}
        canRestore={showDeleted}
        canAddChild={permissions.canModify}
        canMoveUp={canMoveUp}
        canMoveDown={canMoveDown}
      />

      {/* 點擊外部關閉 Context Menu */}
      {contextMenu.visible && <div className="fixed inset-0 z-40" onClick={handleClickOutside} />}

      {/* 新增/編輯 Modal */}
      <Modal
        title={formMode === "create" ? "新增資源" : "編輯資源"}
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[800px] w-full mx-4 p-6"
      >
        <ResourceDataForm
          mode={formMode}
          defaultValues={
            editing
              ? {
                  id: editing.id,
                  name: editing.name,
                  key: editing.key,
                  code: editing.code,
                  icon: editing.icon,
                  path: editing.path,
                  type: editing.type,
                  is_visible: editing.is_visible,
                  description: editing.description,
                  remark: editing.remark,
                  // 編輯子資源需要帶入 pid；若詳情沒有 pid，回退使用 parent.id
                  pid: (editing as any).pid ?? (editing as any).parent?.id ?? undefined,
                }
              : null
          }
          parentResource={parentResource}
          onSubmit={handleSubmit}
          onCancel={closeModal}
          submitting={submitting}
        />
      </Modal>

      {/* 刪除 Modal */}
      <Modal
        title={showDeleted ? "確認永久刪除資源" : "確認刪除資源"}
        isOpen={isDeleteOpen}
        onClose={closeDeleteModal}
        className="max-w-[560px] w-full mx-4 p-6"
      >
        <ResourceDeleteForm onSubmit={handleDeleteConfirm} onCancel={closeDeleteModal} submitting={submitting} isPermanent={showDeleted} />
      </Modal>

      {/* 恢復 Modal */}
      <Modal title="還原資源" isOpen={isRestoreOpen} onClose={closeRestoreModal} className="max-w-[500px] w-full mx-4 p-6">
        <RestoreForm
          ids={restoreIds}
          entityName="資源"
          onSubmit={handleRestoreConfirm}
          onCancel={closeRestoreModal}
          submitting={submitting}
        />
      </Modal>

      {/* 查看 Modal */}
      <Modal title="資源詳細資料" isOpen={isViewOpen} onClose={closeViewModal} className="max-w-[900px] w-full mx-4 p-6">
        {editing && <ResourceDetailView resourceId={editing.id} />}
      </Modal>
    </div>
  );
}

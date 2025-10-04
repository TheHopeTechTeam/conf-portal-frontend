import type { ResourceMenuItem } from "@/api/services/resourceService";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";
import { ResourceBulkActions } from "@/components/System/ResourceBulkActions";
import { ResourceDetailsPanel } from "@/components/System/ResourceDetailsPanel";
import { ResourceTreeView } from "@/components/System/ResourceTreeView";
import Button from "@/components/ui/button/Button";
import { useResourceManagement } from "@/hooks/useResourceManagement";
import { useResourcePermissions } from "@/hooks/useResourcePermissions";
import type { ResourceFormData } from "@/types/resource";
import { useEffect } from "react";
import { MdAdd, MdRefresh } from "react-icons/md";

export default function ResourceManagement() {
  const {
    resources,
    treeData,
    selectedResource,
    isLoading,
    error,
    isEditing,
    selectedIds,
    selectResource,
    startEdit,
    cancelEdit,
    saveResource,
    deleteResource,
    reorderResources,
    refreshResources,
    toggleSelection,
    selectAll,
    clearSelection,
    bulkDelete,
  } = useResourceManagement();

  const permissions = useResourcePermissions();

  // 初始化時載入資源
  useEffect(() => {
    refreshResources();
  }, [refreshResources]);

  // 處理保存資源
  const handleSaveResource = async (data: ResourceFormData) => {
    await saveResource(data);
  };

  // 處理編輯資源
  const handleEditResource = (resource: ResourceMenuItem) => {
    selectResource(resource);
    startEdit();
  };

  // 處理刪除資源
  const handleDeleteResource = async (id: string) => {
    await deleteResource(id);
  };

  // 處理重新排序
  const handleReorderResources = async (dragId: string, dropId: string) => {
    await reorderResources(dragId, dropId);
  };

  // 處理批量刪除
  const handleBulkDelete = async (ids: string[]) => {
    await bulkDelete(ids);
  };

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
          <Button onClick={refreshResources} className="mt-4 flex items-center gap-2">
            <MdRefresh className="h-4 w-4" />
            重新載入
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageMeta title="資源管理" description="管理系統資源和權限" />
      <PageBreadcrumb pageTitle="資源管理" />

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {/* 頁面操作區（左：新增；右：刷新） */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex gap-2">
            {permissions.canCreate && (
              <Button
                onClick={() => {
                  selectResource(null);
                  startEdit();
                }}
                className="flex items-center gap-2"
              >
                <MdAdd className="h-4 w-4" />
                新增資源
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={refreshResources} disabled={isLoading} className="flex items-center gap-2">
              <MdRefresh className="h-4 w-4" />
              刷新
            </Button>
          </div>
        </div>

        {/* 統計資訊 */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">總資源數</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{resources.length}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <MdAdd className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">系統資源</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {resources.filter((r: ResourceMenuItem) => r.type === 0).length}
                </p>
              </div>
              <div className="h-8 w-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <MdAdd className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">業務資源</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {resources.filter((r: ResourceMenuItem) => r.type === 1).length}
                </p>
              </div>
              <div className="h-8 w-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <MdAdd className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </div>

        {/* 批量操作 */}
        {selectedIds.length > 0 && (
          <div className="mb-6">
            <ResourceBulkActions
              selectedIds={selectedIds}
              totalCount={resources.length}
              onBulkDelete={handleBulkDelete}
              onSelectAll={selectAll}
              onClearSelection={clearSelection}
            />
          </div>
        )}

        {/* 主要內容區域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 資源樹狀結構 */}
          <div className="lg:col-span-2">
            <ResourceTreeView
              treeData={treeData}
              selectedResource={selectedResource}
              selectedIds={selectedIds}
              onSelect={selectResource}
              onReorder={permissions.canModify ? handleReorderResources : undefined}
              onDelete={permissions.canDelete ? handleDeleteResource : undefined}
              onEdit={handleEditResource}
              onToggleSelection={toggleSelection}
              canReorder={permissions.canModify}
              canDelete={permissions.canDelete}
              canModify={permissions.canModify}
            />
          </div>

          {/* 資源詳情面板 */}
          <div className="lg:col-span-1">
            <ResourceDetailsPanel
              selectedResource={selectedResource}
              isEditing={isEditing}
              isLoading={isLoading}
              onStartEdit={startEdit}
              onCancelEdit={cancelEdit}
              onSave={handleSaveResource}
              canModify={permissions.canModify}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

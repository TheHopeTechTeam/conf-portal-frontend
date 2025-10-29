import type { ResourceMenuItem } from "@/api/services/resourceService";
import { ResourceDetailsPanel } from "@/components/Resource/Old/ResourceDetailsPanel";
import { ResourceTreeView } from "@/components/Resource/Old/ResourceTreeView";
import Button from "@/components/ui/button";
import { useResourceManagement } from "@/hooks/useResourceManagement";
import { useResourcePermissions } from "@/hooks/useResourcePermissions";
import type { ResourceFormData } from "@/types/resource";
import { useEffect, useMemo } from "react";
import { MdAdd, MdRefresh } from "react-icons/md";

export default function ResourcePage() {
  const {
    resources,
    treeData,
    selectedResource,
    isLoading,
    error,
    isEditing,
    selectResource,
    startEdit,
    cancelEdit,
    saveResource,
    deleteResource,
    moveUp,
    moveDown,
    refreshResources,
    canMoveUp,
    canMoveDown,
  } = useResourceManagement();

  const permissions = useResourcePermissions();
  // 計算葉子節點數量（沒有子節點的資源）
  const leafNodeCounts = useMemo(() => {
    const systemLeafNodes = resources.filter((r: ResourceMenuItem) => {
      if (r.type !== 0) return false; // 只計算系統資源
      // 檢查是否有子節點
      const hasChildren = resources.some((child) => child.pid === r.id);
      return !hasChildren; // 沒有子節點的是葉子節點
    });

    const generalLeafNodes = resources.filter((r: ResourceMenuItem) => {
      if (r.type !== 1) return false; // 只計算業務資源
      // 檢查是否有子節點
      const hasChildren = resources.some((child) => child.pid === r.id);
      return !hasChildren; // 沒有子節點的是葉子節點
    });

    return {
      system: systemLeafNodes.length,
      general: generalLeafNodes.length,
    };
  }, [resources]);

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
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{leafNodeCounts.system + leafNodeCounts.general}</p>
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
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{leafNodeCounts.system}</p>
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
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{leafNodeCounts.general}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <MdAdd className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* 主要內容區域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
        {/* Loading 覆蓋層 - 只覆蓋主要內容區域 */}
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-80 dark:bg-gray-800 dark:bg-opacity-80 flex items-center justify-center z-10 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="text-gray-600 dark:text-gray-400">載入中...</p>
            </div>
          </div>
        )}

        {/* 資源樹狀結構 */}
        <div className="lg:col-span-2">
          <ResourceTreeView
            treeData={treeData}
            selectedResource={selectedResource}
            onSelect={selectResource}
            onDelete={permissions.canDelete ? handleDeleteResource : undefined}
            onEdit={handleEditResource}
            onMoveUp={permissions.canModify ? moveUp : undefined}
            onMoveDown={permissions.canModify ? moveDown : undefined}
            canDelete={permissions.canDelete}
            canModify={permissions.canModify}
            canMoveUp={permissions.canModify ? canMoveUp : undefined}
            canMoveDown={permissions.canModify ? canMoveDown : undefined}
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
  );
}

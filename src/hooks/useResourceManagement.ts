import { resourceService } from "@/api";
import type {
  DeleteResourceData,
  ResourceChangeSequenceData,
  ResourceCreateData,
  ResourceUpdateData,
} from "@/api/services/resourceService";
import type { ResourceFormData, ResourceMenuItem, ResourceTreeNode } from "@/types/resource";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export const useResourceManagement = () => {
  // 核心狀態
  const [resources, setResources] = useState<ResourceMenuItem[]>([]);
  const [selectedResource, setSelectedResource] = useState<ResourceMenuItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showDeleted, setShowDeleted] = useState<boolean>(false);

  // 使用 useRef 避免不必要的重新創建
  const fetchResourcesRef = useRef({
    showDeleted,
  });

  // 更新 ref 當依賴項改變時
  fetchResourcesRef.current = {
    showDeleted,
  };

  const treeData: ResourceTreeNode[] = useMemo(() => {
    const idToNode = new Map<string, ResourceTreeNode>();
    const roots: ResourceTreeNode[] = [];
    resources.forEach((r) => {
      idToNode.set(r.id, {
        id: r.id,
        pid: r.pid,
        name: r.name,
        key: r.key,
        icon: r.icon,
        path: r.path,
        type: r.type,
        description: r.description,
        sequence: r.sequence ?? 0,
        is_deleted: r.is_deleted,
        children: [],
        level: 1,
        is_group: false,
        group_type: null,
      });
    });
    idToNode.forEach((node) => {
      if (node.pid && idToNode.has(node.pid)) {
        const parent = idToNode.get(node.pid)!;
        node.level = (parent.level || 1) + 1;
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    });
    return roots.sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
  }, [resources]);

  // 統一的 API 調用函數
  const fetchResources = useCallback(async () => {
    const { showDeleted } = fetchResourcesRef.current;

    setIsLoading(true);
    setError(null);

    try {
      const res = await resourceService.getResources(showDeleted);

      if (res.success) {
        setResources(res.data.items);
      } else {
        setError(res.message || "載入資源失敗");
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, []); // 無依賴項，使用 ref 獲取最新狀態

  // 回收桶模式切換
  const toggleTrashMode = useCallback(() => {
    setShowDeleted((prev) => !prev);
  }, []);

  // 初始化載入資源和當 showDeleted 變化時自動刷新
  useEffect(() => {
    fetchResources();
  }, [showDeleted, fetchResources]);

  const selectResource = useCallback((r: ResourceMenuItem | null) => {
    setSelectedResource(r);
  }, []);

  const startEdit = useCallback(() => setIsEditing(true), []);
  const cancelEdit = useCallback(() => setIsEditing(false), []);

  const saveResource = useCallback(
    async (data: ResourceFormData) => {
      try {
        if (selectedResource) {
          // 編輯資源
          const updateData: ResourceUpdateData = {
            name: data.name,
            key: data.key,
            code: data.code,
            path: data.path,
            icon: data.icon,
            type: data.type,
            is_visible: data.is_visible,
            description: data.description,
            remark: data.remark,
            pid: data.pid,
          };
          await resourceService.updateResource(selectedResource.id, updateData);
        } else {
          // 新增資源（後端會自動處理排序）
          const createData: ResourceCreateData = {
            name: data.name,
            key: data.key,
            code: data.code,
            path: data.path,
            icon: data.icon,
            type: data.type,
            is_visible: data.is_visible,
            description: data.description,
            remark: data.remark,
            pid: data.pid,
          };
          await resourceService.createResource(createData);
        }
        await fetchResources();
        setIsEditing(false);
      } catch (e) {
        console.error("儲存資源失敗:", e);
        throw e; // 讓調用者處理錯誤
      }
    },
    [selectedResource, fetchResources]
  );

  const deleteResource = useCallback(
    async (id: string, reason?: string, permanent?: boolean) => {
      try {
        const deleteData: DeleteResourceData | undefined =
          reason !== undefined || permanent !== undefined ? { reason, permanent } : undefined;
        await resourceService.deleteResource(id, deleteData);
        await fetchResources();
      } catch (e) {
        console.error("刪除資源失敗:", e);
        throw e; // 讓調用者處理錯誤
      }
    },
    [fetchResources]
  );

  const restoreResource = useCallback(
    async (id: string) => {
      try {
        await resourceService.restoreResource(id);
        await fetchResources();
      } catch (e) {
        console.error("恢復資源失敗:", e);
        throw e; // 讓調用者處理錯誤
      }
    },
    [fetchResources]
  );

  // 上移一位（分開處理 Menu 和 System 根節點）
  const moveUp = useCallback(
    async (id: string) => {
      try {
        const resource = resources.find((r) => r.id === id);
        if (!resource) return;

        let siblings: ResourceMenuItem[];

        // 如果是根節點（pid 為 null），需要分開處理 Menu 和 System
        if (!resource.pid) {
          siblings = resources.filter((r) => !r.pid && r.type === resource.type);
        } else {
          siblings = resources.filter((r) => r.pid === resource.pid);
        }

        const sortedSiblings = siblings.sort((a, b) => a.sequence - b.sequence);
        const currentIndex = sortedSiblings.findIndex((r) => r.id === id);

        if (currentIndex > 0) {
          const prevResource = sortedSiblings[currentIndex - 1];
          const changeData: ResourceChangeSequenceData = {
            id: id,
            sequence: resource.sequence,
            another_id: prevResource.id,
            another_sequence: prevResource.sequence,
          };
          await resourceService.changeSequence(changeData);
          await fetchResources();
        }
      } catch (e) {
        console.error("上移資源失敗:", e);
        throw e; // 讓調用者處理錯誤
      }
    },
    [resources, fetchResources]
  );

  // 下移一位（分開處理 Menu 和 System 根節點）
  const moveDown = useCallback(
    async (id: string) => {
      try {
        const resource = resources.find((r) => r.id === id);
        if (!resource) return;

        let siblings: ResourceMenuItem[];

        // 如果是根節點（pid 為 null），需要分開處理 Menu 和 System
        if (!resource.pid) {
          siblings = resources.filter((r) => !r.pid && r.type === resource.type);
        } else {
          siblings = resources.filter((r) => r.pid === resource.pid);
        }

        const sortedSiblings = siblings.sort((a, b) => a.sequence - b.sequence);
        const currentIndex = sortedSiblings.findIndex((r) => r.id === id);

        if (currentIndex < sortedSiblings.length - 1) {
          const nextResource = sortedSiblings[currentIndex + 1];
          const changeData: ResourceChangeSequenceData = {
            id: id,
            sequence: resource.sequence,
            another_id: nextResource.id,
            another_sequence: nextResource.sequence,
          };
          await resourceService.changeSequence(changeData);
          await fetchResources();
        }
      } catch (e) {
        console.error("下移資源失敗:", e);
        throw e; // 讓調用者處理錯誤
      }
    },
    [resources, fetchResources]
  );

  // 檢查資源是否可以移動（分開判斷 Menu 和 System 根節點）
  const canMoveUp = useCallback(
    (id: string) => {
      const resource = resources.find((r) => r.id === id);
      if (!resource) return false;

      // 如果是根節點（pid 為 null），需要分開判斷 Menu 和 System
      if (!resource.pid) {
        const sameTypeRoots = resources.filter((r) => !r.pid && r.type === resource.type);
        const sortedRoots = sameTypeRoots.sort((a, b) => a.sequence - b.sequence);
        const currentIndex = sortedRoots.findIndex((r) => r.id === id);
        return currentIndex > 0;
      }

      // 非根節點按原邏輯處理
      const siblings = resources.filter((r) => r.pid === resource.pid);
      const sortedSiblings = siblings.sort((a, b) => a.sequence - b.sequence);
      const currentIndex = sortedSiblings.findIndex((r) => r.id === id);
      return currentIndex > 0;
    },
    [resources]
  );

  const canMoveDown = useCallback(
    (id: string) => {
      const resource = resources.find((r) => r.id === id);
      if (!resource) return false;

      // 如果是根節點（pid 為 null），需要分開判斷 Menu 和 System
      if (!resource.pid) {
        const sameTypeRoots = resources.filter((r) => !r.pid && r.type === resource.type);
        const sortedRoots = sameTypeRoots.sort((a, b) => a.sequence - b.sequence);
        const currentIndex = sortedRoots.findIndex((r) => r.id === id);
        return currentIndex < sortedRoots.length - 1;
      }

      // 非根節點按原邏輯處理
      const siblings = resources.filter((r) => r.pid === resource.pid);
      const sortedSiblings = siblings.sort((a, b) => a.sequence - b.sequence);
      const currentIndex = sortedSiblings.findIndex((r) => r.id === id);
      return currentIndex < sortedSiblings.length - 1;
    },
    [resources]
  );

  return {
    // 狀態
    resources,
    treeData,
    selectedResource,
    isLoading,
    error,
    isEditing,
    showDeleted,

    // 基本操作
    selectResource,
    startEdit,
    cancelEdit,

    // CRUD 操作
    saveResource,
    deleteResource,
    restoreResource,

    // 排序操作
    moveUp,
    moveDown,
    canMoveUp,
    canMoveDown,

    // 模式控制
    toggleTrashMode,

    // API 調用
    fetchResources,
  } as const;
};

import { resourceService } from "@/api";
import type { ResourceFormData, ResourceMenuItem, ResourceTreeNode } from "@/types/resource";
import { useCallback, useMemo, useState } from "react";

export const useResourceManagement = () => {
  const [resources, setResources] = useState<ResourceMenuItem[]>([]);
  const [selectedResource, setSelectedResource] = useState<ResourceMenuItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const treeData: ResourceTreeNode[] = useMemo(() => {
    const idToNode = new Map<string, ResourceTreeNode>();
    const roots: ResourceTreeNode[] = [];
    resources.forEach((r) => {
      idToNode.set(r.id, {
        id: r.id,
        pid: r.pid,
        name: r.name,
        key: r.key,
        code: r.code,
        icon: r.icon,
        path: r.path,
        type: r.type,
        description: r.description,
        remark: r.remark,
        sequence: r.sequence ?? 0,
        children: [],
        level: 1,
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

  const refreshResources = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await resourceService.getAdminMenus();
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
  }, []);

  const selectResource = useCallback((r: ResourceMenuItem | null) => {
    setSelectedResource(r);
  }, []);

  const startEdit = useCallback(() => setIsEditing(true), []);
  const cancelEdit = useCallback(() => setIsEditing(false), []);

  const saveResource = useCallback(
    async (data: ResourceFormData) => {
      if (selectedResource) {
        await resourceService.updateResource(selectedResource.id, data as any);
      } else {
        await resourceService.createResource(data as any);
      }
      await refreshResources();
      setIsEditing(false);
    },
    [refreshResources, selectedResource]
  );

  const deleteResource = useCallback(
    async (id: string) => {
      await resourceService.deleteResource(id);
      await refreshResources();
    },
    [refreshResources]
  );

  const reorderResources = useCallback(
    async (_dragId: string, _dropId: string) => {
      // 可在此調用 resourceService.changeSequence
      await refreshResources();
    },
    [refreshResources]
  );

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);
  const selectAll = useCallback(() => {
    setSelectedIds(resources.map((r) => r.id));
  }, [resources]);
  const clearSelection = useCallback(() => setSelectedIds([]), []);

  const bulkDelete = useCallback(
    async (ids: string[]) => {
      await Promise.all(ids.map((id) => resourceService.deleteResource(id)));
      await refreshResources();
      setSelectedIds([]);
    },
    [refreshResources]
  );

  return {
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
  } as const;
};

export default useResourceManagement;

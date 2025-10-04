import { ResourceActions } from "@/components/System/ResourceActions";
import React, { useCallback, useState } from "react";
import { MdChevronRight, MdDragIndicator, MdExpandMore } from "react-icons/md";
import type { ResourceMenuItem } from "../../api/services/resourceService";
import { AdminResourceType } from "../../api/services/resourceService";
import type { ResourceTreeNode } from "../../types/resource";
import { resolveIcon } from "../../utils/icon-resolver";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";

interface ResourceTreeViewProps {
  treeData: ResourceTreeNode[];
  selectedResource: ResourceMenuItem | null;
  selectedIds: string[];
  onSelect: (resource: ResourceMenuItem) => void;
  onReorder?: (dragId: string, dropId: string) => void;
  onDelete?: (id: string) => void;
  onEdit: (resource: ResourceMenuItem) => void;
  onToggleSelection: (id: string) => void;
  canReorder?: boolean;
  canDelete?: boolean;
  canModify?: boolean;
}

export const ResourceTreeView: React.FC<ResourceTreeViewProps> = ({
  treeData,
  selectedResource,
  selectedIds,
  onSelect,
  onReorder,
  onDelete,
  onEdit,
  onToggleSelection,
  canReorder = false,
  canDelete = false,
  canModify = false,
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

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
        if (node.children.length > 0) {
          collectIds(node.children);
        }
      });
    };
    collectIds(treeData);
    setExpandedNodes(allNodeIds);
  }, [treeData]);

  // 收合全部
  const collapseAll = useCallback(() => {
    setExpandedNodes(new Set());
  }, []);

  // 拖拽開始
  const handleDragStart = useCallback(
    (e: React.DragEvent, nodeId: string) => {
      if (!canReorder) return;

      setDraggedItem(nodeId);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", nodeId);
    },
    [canReorder]
  );

  // 拖拽結束
  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
  }, []);

  // 拖拽懸停
  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      if (!canReorder) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    },
    [canReorder]
  );

  // 放置
  const handleDrop = useCallback(
    (e: React.DragEvent, dropNodeId: string) => {
      if (!canReorder || !onReorder) return;

      e.preventDefault();
      const dragNodeId = e.dataTransfer.getData("text/plain");

      if (dragNodeId && dragNodeId !== dropNodeId) {
        onReorder(dragNodeId, dropNodeId);
      }
    },
    [canReorder, onReorder]
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">資源結構</h3>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={expandAll}>
              展開全部
            </Button>
            <Button size="sm" variant="outline" onClick={collapseAll}>
              收合全部
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4">
        {treeData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">暫無資源數據</div>
        ) : (
          <div className="space-y-1">
            {treeData.map((node) => (
              <ResourceTreeNode
                key={node.id}
                node={node}
                level={0}
                expandedNodes={expandedNodes}
                selectedResource={selectedResource}
                selectedIds={selectedIds}
                onToggleExpand={toggleExpand}
                onSelect={onSelect}
                onReorder={onReorder}
                onDelete={onDelete}
                onEdit={onEdit}
                onToggleSelection={onToggleSelection}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                draggedItem={draggedItem}
                canReorder={canReorder}
                canDelete={canDelete}
                canModify={canModify}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface ResourceTreeNodeProps {
  node: ResourceTreeNode;
  level: number;
  expandedNodes: Set<string>;
  selectedResource: ResourceMenuItem | null;
  selectedIds: string[];
  onToggleExpand: (nodeId: string) => void;
  onSelect: (resource: ResourceMenuItem) => void;
  onReorder?: (dragId: string, dropId: string) => void;
  onDelete?: (id: string) => void;
  onEdit: (resource: ResourceMenuItem) => void;
  onToggleSelection: (id: string) => void;
  onDragStart: (e: React.DragEvent, nodeId: string) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, nodeId: string) => void;
  draggedItem: string | null;
  canReorder: boolean;
  canDelete: boolean;
  canModify: boolean;
}

const ResourceTreeNode: React.FC<ResourceTreeNodeProps> = ({
  node,
  level,
  expandedNodes,
  selectedResource,
  selectedIds,
  onToggleExpand,
  onSelect,
  onReorder,
  onDelete,
  onEdit,
  onToggleSelection,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  draggedItem,
  canReorder,
  canDelete,
  canModify,
}) => {
  const isExpanded = expandedNodes.has(node.id);
  const isSelected = selectedResource?.id === node.id;
  const isChecked = selectedIds.includes(node.id);
  const isDragging = draggedItem === node.id;
  const hasChildren = node.children.length > 0;

  const handleNodeClick = () => {
    onSelect(node);
  };

  const handleCheckboxChange = () => {
    onToggleSelection(node.id);
  };

  return (
    <div>
      <div
        draggable={canReorder}
        onDragStart={(e) => onDragStart(e, node.id)}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, node.id)}
        className={`
          flex items-center gap-2 p-2 rounded cursor-pointer transition-colors
          hover:bg-gray-50
          ${isSelected ? "bg-blue-50 border border-blue-200" : ""}
          ${isDragging ? "opacity-50" : ""}
          ${canReorder ? "cursor-move" : ""}
        `}
        style={{ paddingLeft: `${level * 20 + 8}px` }}
      >
        {/* 拖拽指示器 */}
        {canReorder && <MdDragIndicator className="text-gray-400 flex-shrink-0" />}

        {/* 選擇框 */}
        <Checkbox checked={isChecked} onChange={handleCheckboxChange} className="flex-shrink-0" />

        {/* 展開/收合按鈕 */}
        {hasChildren ? (
          <button onClick={() => onToggleExpand(node.id)} className="flex-shrink-0 p-1 hover:bg-gray-200 rounded">
            {isExpanded ? <MdExpandMore className="h-4 w-4" /> : <MdChevronRight className="h-4 w-4" />}
          </button>
        ) : (
          <div className="w-6 flex-shrink-0" />
        )}

        {/* 節點內容 */}
        <div className="flex-1 flex items-center gap-2 cursor-pointer" onClick={handleNodeClick}>
          {/* 圖示 */}
          <div className="flex-shrink-0">{resolveIcon(node.icon)}</div>

          {/* 節點資訊 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 truncate">{node.name}</span>
              <ResourceTypeBadge type={node.type} />
            </div>
            <div className="text-sm text-gray-500 truncate">
              {node.key} • {node.path}
            </div>
          </div>
        </div>

        {/* 操作按鈕 */}
        <ResourceActions resource={node} onEdit={onEdit} onDelete={onDelete} canEdit={canModify} canDelete={canDelete} />
      </div>

      {/* 子節點 */}
      {hasChildren && isExpanded && (
        <div className="ml-4">
          {node.children.map((child) => (
            <ResourceTreeNode
              key={child.id}
              node={child}
              level={level + 1}
              expandedNodes={expandedNodes}
              selectedResource={selectedResource}
              selectedIds={selectedIds}
              onToggleExpand={onToggleExpand}
              onSelect={onSelect}
              onReorder={onReorder}
              onDelete={onDelete}
              onEdit={onEdit}
              onToggleSelection={onToggleSelection}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onDragOver={onDragOver}
              onDrop={onDrop}
              draggedItem={draggedItem}
              canReorder={canReorder}
              canDelete={canDelete}
              canModify={canModify}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// 資源類型標籤
const ResourceTypeBadge: React.FC<{ type: AdminResourceType }> = ({ type }) => {
  const isSystem = type === AdminResourceType.SYSTEM;

  return (
    <span
      className={`
        inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
        ${isSystem ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}
      `}
    >
      {isSystem ? "系統" : "業務"}
    </span>
  );
};

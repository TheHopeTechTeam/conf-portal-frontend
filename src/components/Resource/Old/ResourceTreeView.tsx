import type { ResourceMenuItem } from "@/api/services/resourceService";
import { AdminResourceType } from "@/api/services/resourceService";
import { ResourceActions } from "@/components/Resource/Old/ResourceActions";
import { ResourceSortActions } from "@/components/Resource/Old/ResourceSortActions";
import Button from "@/components/ui/button";
import type { ResourceTreeNode } from "@/types/resource";
import { resolveIcon } from "@/utils/icon-resolver";
import React, { useCallback, useMemo, useState } from "react";
import { MdChevronRight, MdExpandMore } from "react-icons/md";

interface ResourceTreeViewProps {
  treeData: ResourceTreeNode[];
  selectedResource: ResourceMenuItem | null;
  onSelect: (resource: ResourceMenuItem) => void;
  onDelete?: (id: string) => void;
  onEdit: (resource: ResourceMenuItem) => void;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
  canDelete?: boolean;
  canModify?: boolean;
  canMoveUp?: (id: string) => boolean;
  canMoveDown?: (id: string) => boolean;
}

export const ResourceTreeView: React.FC<ResourceTreeViewProps> = ({
  treeData,
  selectedResource,
  onSelect,
  onDelete,
  onEdit,
  onMoveUp,
  onMoveDown,
  canDelete = false,
  canModify = false,
  canMoveUp,
  canMoveDown,
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

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

  // 將樹狀數據分組為 MENU 和 SYSTEM
  const groupedData = useMemo(() => {
    const menuItems: ResourceTreeNode[] = [];
    const systemItems: ResourceTreeNode[] = [];

    treeData.forEach((node) => {
      if (node.group_type === "MENU" || (!node.group_type && node.type === AdminResourceType.GENERAL)) {
        menuItems.push(node);
      } else if (node.group_type === "SYSTEM" || (!node.group_type && node.type === AdminResourceType.SYSTEM)) {
        systemItems.push(node);
      }
    });

    return { menuItems, systemItems };
  }, [treeData]);

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
          <div className="space-y-6">
            {/* MENU 分組 */}
            {groupedData.menuItems.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wide">MENU</h4>
                <div className="space-y-1">
                  {groupedData.menuItems.map((node) => (
                    <ResourceTreeNode
                      key={node.id}
                      node={node}
                      level={0}
                      expandedNodes={expandedNodes}
                      selectedResource={selectedResource}
                      onToggleExpand={toggleExpand}
                      onSelect={onSelect}
                      onDelete={onDelete}
                      onEdit={onEdit}
                      onMoveUp={onMoveUp}
                      onMoveDown={onMoveDown}
                      canDelete={canDelete}
                      canModify={canModify}
                      canMoveUp={canMoveUp}
                      canMoveDown={canMoveDown}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* SYSTEM 分組 */}
            {groupedData.systemItems.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wide">SYSTEM</h4>
                <div className="space-y-1">
                  {groupedData.systemItems.map((node) => (
                    <ResourceTreeNode
                      key={node.id}
                      node={node}
                      level={0}
                      expandedNodes={expandedNodes}
                      selectedResource={selectedResource}
                      onToggleExpand={toggleExpand}
                      onSelect={onSelect}
                      onDelete={onDelete}
                      onEdit={onEdit}
                      onMoveUp={onMoveUp}
                      onMoveDown={onMoveDown}
                      canDelete={canDelete}
                      canModify={canModify}
                      canMoveUp={canMoveUp}
                      canMoveDown={canMoveDown}
                    />
                  ))}
                </div>
              </div>
            )}
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
  onToggleExpand: (nodeId: string) => void;
  onSelect: (resource: ResourceMenuItem) => void;
  onDelete?: (id: string) => void;
  onEdit: (resource: ResourceMenuItem) => void;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
  canDelete: boolean;
  canModify: boolean;
  canMoveUp?: (id: string) => boolean;
  canMoveDown?: (id: string) => boolean;
}

const ResourceTreeNode: React.FC<ResourceTreeNodeProps> = ({
  node,
  level,
  expandedNodes,
  selectedResource,
  onToggleExpand,
  onSelect,
  onDelete,
  onEdit,
  onMoveUp,
  onMoveDown,
  canDelete,
  canModify,
  canMoveUp,
  canMoveDown,
}) => {
  const isExpanded = expandedNodes.has(node.id);
  const isSelected = selectedResource?.id === node.id;
  const hasChildren = node.children.length > 0;

  const handleNodeClick = () => {
    onSelect(node);
  };

  return (
    <div>
      <div
        className={`
          flex items-center gap-2 p-2 rounded cursor-pointer transition-colors
          hover:bg-gray-50
          ${isSelected ? "bg-blue-50 border border-blue-200" : ""}
        `}
        style={{ paddingLeft: `${level * 20 + 8}px` }}
      >
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
          <div className="flex-shrink-0">{resolveIcon(node.icon).icon}</div>

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

        {/* 操作按鈕區域 */}
        <div className="flex items-center gap-2">
          {/* 排序操作 */}
          {(onMoveUp || onMoveDown) && (
            <ResourceSortActions
              resourceId={node.id}
              onMoveUp={onMoveUp || (() => {})}
              onMoveDown={onMoveDown || (() => {})}
              disabled={!canModify}
              canMoveUp={canMoveUp ? canMoveUp(node.id) : true}
              canMoveDown={canMoveDown ? canMoveDown(node.id) : true}
            />
          )}

          {/* 其他操作 */}
          <ResourceActions resource={node} onEdit={onEdit} onDelete={onDelete} canEdit={canModify} canDelete={canDelete} />
        </div>
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
              onToggleExpand={onToggleExpand}
              onSelect={onSelect}
              onDelete={onDelete}
              onEdit={onEdit}
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
              canDelete={canDelete}
              canModify={canModify}
              canMoveUp={canMoveUp}
              canMoveDown={canMoveDown}
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

  const getBadgeInfo = () => {
    if (isSystem) return { text: "系統", className: "bg-red-100 text-red-800" };
    return { text: "業務", className: "bg-green-100 text-green-800" };
  };

  const { text, className } = getBadgeInfo();

  return <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${className}`}>{text}</span>;
};

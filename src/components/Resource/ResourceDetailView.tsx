import { resourceService } from "@/api";
import type { ResourceMenuItem } from "@/api/services/resourceService";
import { AdminResourceType } from "@/api/services/resourceService";
import Checkbox from "@/components/ui/checkbox";
import Input from "@/components/ui/input";
import TextArea from "@/components/ui/textarea";
import { useEffect, useState } from "react";

interface ResourceDetailViewProps {
  resourceId: string;
}

const ResourceDetailView: React.FC<ResourceDetailViewProps> = ({ resourceId }) => {
  const [resource, setResource] = useState<ResourceMenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResource = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await resourceService.getResource(resourceId);
        if (response.success) {
          setResource(response.data);
        } else {
          setError(response.message || "載入資源詳情失敗");
        }
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    };

    if (resourceId) {
      fetchResource();
    }
  }, [resourceId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">載入中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">資源不存在</p>
      </div>
    );
  }

  const getTypeText = (type: AdminResourceType) => {
    return type === AdminResourceType.SYSTEM ? "系統功能" : "業務功能";
  };

  const getTypeColor = (type: AdminResourceType) => {
    return type === AdminResourceType.SYSTEM ? "text-blue-600 dark:text-blue-400" : "text-green-600 dark:text-green-400";
  };

  return (
    <div className="space-y-8">
      {/* 基本資訊與狀態 Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">資源資訊</h3>

        {/* 基本資訊 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">名稱</label>
            <Input id="name" type="text" value={resource.name} disabled />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Key</label>
            <Input id="key" type="text" value={resource.key} disabled />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">代碼</label>
            <Input id="code" type="text" value={resource.code} disabled />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">路徑</label>
            <Input id="path" type="text" value={resource.path || ""} disabled />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">類型</label>
            <Input id="type" type="text" value={getTypeText(resource.type)} disabled />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">圖示</label>
            <Input id="icon" type="text" value={resource.icon || ""} disabled />
          </div>
        </div>

        {/* 狀態資訊 */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">狀態</div>
          <div className="flex items-center">
            <Checkbox id="is_visible" checked={!!resource.is_visible} disabled label="資源可見" />
          </div>
        </div>
      </div>

      {/* 父資源資訊 Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">父資源資訊</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">名稱</label>
            <Input id="parent_name" type="text" value={resource.parent?.name || "無（根資源）"} disabled />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Key</label>
            <Input id="parent_key" type="text" value={resource.parent?.key || "無（根資源）"} disabled />
          </div>
        </div>
      </div>

      {/* 備註 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">備註</label>
        <Input id="remark" type="text" value={resource.remark || ""} disabled />
      </div>

      {/* 描述 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">描述</label>
        <TextArea id="description" value={resource.description || ""} disabled rows={3} />
      </div>
    </div>
  );
};

export default ResourceDetailView;

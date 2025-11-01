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

  return (
    <div className="space-y-8">
      {/* 基本資訊與狀態 Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">資源資訊</h3>

        {/* 基本資訊 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <Input id="name" label="名稱" type="text" value={resource.name} disabled />
          </div>

          <div>
            <Input id="key" label="Key" type="text" value={resource.key} disabled />
          </div>

          <div>
            <Input id="code" label="代碼" type="text" value={resource.code} disabled />
          </div>

          <div>
            <Input id="path" label="路徑" type="text" value={resource.path || ""} disabled />
          </div>

          <div>
            <Input id="type" label="類型" type="text" value={getTypeText(resource.type)} disabled />
          </div>

          <div>
            <Input id="icon" label="圖示" type="text" value={resource.icon || ""} disabled />
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
            <Input id="parent_name" label="名稱" type="text" value={resource.parent?.name || "無（根資源）"} disabled />
          </div>
          <div>
            <Input id="parent_key" label="Key" type="text" value={resource.parent?.key || "無（根資源）"} disabled />
          </div>
        </div>
      </div>

      {/* 備註 */}
      <div>
        <Input id="remark" label="備註" type="text" value={resource.remark || ""} disabled />
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

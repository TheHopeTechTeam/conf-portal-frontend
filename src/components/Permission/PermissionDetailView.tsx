import { permissionService } from "@/api";
import Checkbox from "@/components/ui/checkbox";
import Input from "@/components/ui/input";
import TextArea from "@/components/ui/textarea";
import { useEffect, useState } from "react";

interface PermissionDetailViewProps {
  permissionId: string;
}

interface PermissionDetailData {
  id: string;
  displayName: string;
  code: string;
  resource: {
    id: string;
    name: string;
    key: string;
    code: string;
  };
  verb: {
    id: string;
    displayName: string;
    action: string;
  };
  isActive: boolean;
  description?: string;
  remark?: string;
}

const PermissionDetailView: React.FC<PermissionDetailViewProps> = ({ permissionId }) => {
  const [permissionData, setPermissionData] = useState<PermissionDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPermissionDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await permissionService.getById(permissionId);
        if (response.success) {
          setPermissionData(response.data as PermissionDetailData);
        } else {
          setError(response.message || "載入失敗");
        }
      } catch (e) {
        console.error("Error fetching permission detail:", e);
        setError("載入權限詳情失敗");
      } finally {
        setLoading(false);
      }
    };

    if (permissionId) {
      fetchPermissionDetail();
    }
  }, [permissionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500 dark:text-gray-400">載入中...</div>
      </div>
    );
  }

  if (error || !permissionData) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-red-500 dark:text-red-400">{error || "載入失敗"}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 基本資訊 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">顯示名稱</label>
          <Input id="displayName" type="text" value={permissionData.displayName} disabled />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">代碼</label>
          <Input id="code" type="text" value={permissionData.code} disabled />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">資源</label>
          <Input id="resource" type="text" value={permissionData.resource.name} disabled />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">動作</label>
          <Input id="verb" type="text" value={permissionData.verb.displayName} disabled />
        </div>
      </div>

      {/* 狀態資訊 */}
      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">狀態</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Checkbox id="isActive" checked={permissionData.isActive} disabled label="啟用狀態" />
        </div>
      </div>

      {/* 詳細資訊 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">資源詳情</label>
          <div className="space-y-2">
            <Input id="resourceKey" type="text" value={permissionData.resource.key} disabled />
            <Input id="resourceCode" type="text" value={permissionData.resource.code} disabled />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">動作詳情</label>
          <div className="space-y-2">
            <Input id="verbAction" type="text" value={permissionData.verb.action} disabled />
          </div>
        </div>
      </div>

      {/* 描述 */}
      {permissionData.description && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">描述</label>
          <TextArea id="description" placeholder="" value={permissionData.description} disabled rows={3} />
        </div>
      )}

      {/* 備註 */}
      {permissionData.remark && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">備註</label>
          <TextArea id="remark" placeholder="" value={permissionData.remark} disabled rows={3} />
        </div>
      )}

      {/* 權限 ID */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">權限 ID</label>
        <Input id="permissionId" type="text" value={permissionData.id} disabled />
      </div>
    </div>
  );
};

export default PermissionDetailView;

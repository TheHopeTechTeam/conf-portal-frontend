import { roleService, type RoleBase } from "@/api/services/roleService";
import { userService } from "@/api/services/userService";
import Button from "@/components/ui/button";
import Checkbox from "@/components/ui/checkbox";
import { useEffect, useState } from "react";

interface UserBindRoleFormProps {
  userId: string;
  initialRoleIds?: string[];
  onSubmit: (roleIds: string[]) => Promise<void> | void;
  onCancel: () => void;
  submitting?: boolean;
}

const UserBindRoleForm: React.FC<UserBindRoleFormProps> = ({ userId, initialRoleIds = [], onSubmit, onCancel, submitting = false }) => {
  const [roles, setRoles] = useState<RoleBase[]>([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>(initialRoleIds);
  const [loading, setLoading] = useState(false);

  // 獲取角色列表和用戶當前角色（僅在 userId 改變時）
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 並行獲取角色列表和用戶當前角色
        const [rolesResponse, userRolesResponse] = await Promise.all([roleService.getList(), userService.getUserRoles(userId)]);

        if (rolesResponse.data?.items) {
          setRoles(rolesResponse.data.items);
        }

        // 確定要使用的初始角色 ID
        // 優先使用傳入的 initialRoleIds，如果為空則從 API 獲取
        const roleIdsToUse = initialRoleIds.length > 0 ? initialRoleIds : userRolesResponse.data?.role_ids || [];
        setSelectedRoleIds(roleIdsToUse);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        alert("載入資料失敗，請稍後重試");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // 當 initialRoleIds 改變時更新選中狀態（僅在非空時）
  useEffect(() => {
    if (initialRoleIds.length > 0) {
      setSelectedRoleIds(initialRoleIds);
    }
  }, [initialRoleIds]);

  const handleRoleToggle = (roleId: string, checked: boolean) => {
    if (checked) {
      setSelectedRoleIds((prev) => [...prev, roleId]);
    } else {
      setSelectedRoleIds((prev) => prev.filter((id) => id !== roleId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRoleIds(roles.map((role) => role.id));
    } else {
      setSelectedRoleIds([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(selectedRoleIds);
  };

  const allSelected = roles.length > 0 && selectedRoleIds.length === roles.length;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
          <Checkbox
            id="select-all"
            label="全選"
            checked={allSelected}
            onChange={handleSelectAll}
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            已選擇 {selectedRoleIds.length} / {roles.length} 個角色
          </span>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">載入中...</div>
        ) : roles.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">暫無可用角色</div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto space-y-2">
            {roles.map((role) => (
              <Checkbox
                key={role.id}
                id={`role-${role.id}`}
                label={role.name ? `${role.name} (${role.code})` : role.code}
                checked={selectedRoleIds.includes(role.id)}
                onChange={(checked) => handleRoleToggle(role.id, checked)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
        <Button onClick={onCancel} size="sm" variant="outline" disabled={submitting || loading}>
          取消
        </Button>
        <Button btnType="submit" size="sm" variant="primary" disabled={submitting || loading}>
          {submitting ? "綁定中..." : "確認綁定"}
        </Button>
      </div>
    </form>
  );
};

export default UserBindRoleForm;

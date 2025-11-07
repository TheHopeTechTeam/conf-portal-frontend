import ManagementPage from "@/components/common/ManagementPage";
import PermissionDataPage from "@/pages/System/Permission/PermissionDataPage";

export default function PermissionManagement() {
  return (
    <ManagementPage title="權限管理" description="管理系統權限">
      <PermissionDataPage />
    </ManagementPage>
  );
}

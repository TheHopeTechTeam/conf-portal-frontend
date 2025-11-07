import ManagementPage from "@/components/common/ManagementPage";
import RoleDataPage from "@/pages/System/Role/RoleDataPage";

export default function RoleManagement() {
  return (
    <ManagementPage title="角色管理" description="管理系統角色">
      <RoleDataPage />
    </ManagementPage>
  );
}

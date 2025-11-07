import ManagementPage from "@/components/common/ManagementPage";
import UserDataPage from "@/pages/System/User/UserDataPage";

export default function UserManagement() {
  return (
    <ManagementPage title="使用者管理" description="管理系統使用者">
      <UserDataPage />
    </ManagementPage>
  );
}

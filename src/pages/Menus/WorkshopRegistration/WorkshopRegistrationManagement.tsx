import ManagementPage from "@/components/common/ManagementPage";
import WorkshopRegistrationDataPage from "@/pages/Menus/WorkshopRegistration/WorkshopRegistrationDataPage";

export default function WorkshopRegistrationManagement() {
  return (
    <ManagementPage title="工作坊註冊管理" description="管理系統工作坊註冊記錄">
      <WorkshopRegistrationDataPage />
    </ManagementPage>
  );
}

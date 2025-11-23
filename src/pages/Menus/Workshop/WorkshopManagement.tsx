import ManagementPage from "@/components/common/ManagementPage";
import WorkshopDataPage from "@/pages/Menus/Workshop/WorkshopDataPage";

export default function WorkshopManagement() {
  return (
    <ManagementPage title="工作坊管理" description="管理系統工作坊">
      <WorkshopDataPage />
    </ManagementPage>
  );
}

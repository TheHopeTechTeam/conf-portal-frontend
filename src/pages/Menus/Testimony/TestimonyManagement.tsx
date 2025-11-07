import ManagementPage from "@/components/common/ManagementPage";
import TestimonyDataPage from "@/pages/Menus/Testimony/TestimonyDataPage";

export default function TestimonyManagement() {
  return (
    <ManagementPage title="見證管理" description="管理系統見證">
      <TestimonyDataPage />
    </ManagementPage>
  );
}


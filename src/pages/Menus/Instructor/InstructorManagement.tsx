import ManagementPage from "@/components/common/ManagementPage";
import InstructorDataPage from "@/pages/Menus/Instructor/InstructorDataPage";

export default function InstructorManagement() {
  return (
    <ManagementPage title="講者管理" description="管理系統講者">
      <InstructorDataPage />
    </ManagementPage>
  );
}


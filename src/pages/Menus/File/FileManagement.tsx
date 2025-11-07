import ManagementPage from "@/components/common/ManagementPage";
import FilePage from "@/pages/Menus/File/FilePage";

export default function FileManagement() {
  return (
    <ManagementPage title="檔案管理" description="管理系統檔案">
      <FilePage />
    </ManagementPage>
  );
}

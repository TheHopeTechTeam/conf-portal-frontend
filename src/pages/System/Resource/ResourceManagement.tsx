import ManagementPage from "@/components/common/ManagementPage";
import ResourcePage from "@/pages/System/Resource/ResourcePage";

export default function ResourceManagement() {
  return (
    <ManagementPage title="資源管理" description="管理系統資源和權限">
      <ResourcePage />
    </ManagementPage>
  );
}

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";
import ResourcePage from "@/pages/System/Resource/ResourcePage";

export default function ResourceManagement() {
  return (
    <div className="flex flex-col h-[calc(100vh-120px)] gap-3">
      <PageMeta title="資源管理" description="管理系統資源和權限" />
      <PageBreadcrumb pageTitle="資源管理" />
      <div className="flex-1 min-h-0">
        <ResourcePage />
      </div>
    </div>
  );
}

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";
import PermissionDataPage from "@/pages/System/Permission/PermissionDataPage";

export default function PermissionManagement() {
  return (
    <div className="flex flex-col h-[calc(100vh-120px)] gap-3">
      <PageMeta title="權限管理" description="管理系統權限" />
      <PageBreadcrumb pageTitle="權限管理" />
      <div className="flex-1 min-h-0">
        <PermissionDataPage />
      </div>
    </div>
  );
}

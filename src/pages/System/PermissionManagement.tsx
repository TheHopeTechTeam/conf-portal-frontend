import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";
import PermissionDataPage from "@/components/Permission/PermissionDataPage";

export default function PermissionManagement() {
  return (
    <div className="flex flex-col h-[calc(100vh-140px)] gap-3">
      <PageMeta title="權限管理" description="管理系統權限" />
      <PageBreadcrumb pageTitle="權限管理" />
      <PermissionDataPage />
    </div>
  );
}

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";
import RoleDataPage from "@/pages/System/Role/RoleDataPage";

export default function RoleManagement() {
  return (
    <div className="flex flex-col h-[calc(100vh-120px)] gap-3">
      <PageMeta title="角色管理" description="管理系統角色" />
      <PageBreadcrumb pageTitle="角色管理" />
      <div className="flex-1 min-h-0">
        <RoleDataPage />
      </div>
    </div>
  );
}

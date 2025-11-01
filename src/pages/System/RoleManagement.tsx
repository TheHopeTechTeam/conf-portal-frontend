import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";
import RoleDataPage from "@/components/Role/RoleDataPage";

export default function RoleManagement() {
  return (
    <div className="flex flex-col h-[calc(100vh-140px)] gap-3">
      <PageMeta title="角色管理" description="管理系統角色" />
      <PageBreadcrumb pageTitle="角色管理" />
      <RoleDataPage />
    </div>
  );
}

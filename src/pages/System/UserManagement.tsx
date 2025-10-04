import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";

export default function UserManagement() {
  return (
    <div>
      <PageMeta title="使用者管理" description="管理系統使用者" />
      <PageBreadcrumb pageTitle="使用者管理" />
    </div>
  );
}

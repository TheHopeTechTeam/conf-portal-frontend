import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";
import UserDataPage from "@/components/User/UserDataPage";

export default function UserManagement() {
  return (
    <div className="flex flex-col h-[calc(100vh-140px)] gap-3">
      <PageMeta title="使用者管理" description="管理系統使用者" />
      <PageBreadcrumb pageTitle="使用者管理" />
      <UserDataPage />
    </div>
  );
}

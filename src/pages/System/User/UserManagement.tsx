import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";
import UserDataPage from "@/pages/System/User/UserDataPage";

export default function UserManagement() {
  return (
    <div className="flex flex-col h-[calc(100vh-120px)] gap-3">
      <PageMeta title="使用者管理" description="管理系統使用者" />
      <PageBreadcrumb pageTitle="使用者管理" />
      <div className="flex-1 min-h-0">
        <UserDataPage />
      </div>
    </div>
  );
}

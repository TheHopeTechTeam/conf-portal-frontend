import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";
import InstructorDataPage from "@/pages/Menus/Instructor/InstructorDataPage";

export default function InstructorManagement() {
  return (
    <div className="flex flex-col h-[calc(100vh-120px)] gap-3">
      <PageMeta title="講者管理" description="管理系統講者" />
      <PageBreadcrumb pageTitle="講者管理" />
      <div className="flex-1 min-h-0">
        <InstructorDataPage />
      </div>
    </div>
  );
}


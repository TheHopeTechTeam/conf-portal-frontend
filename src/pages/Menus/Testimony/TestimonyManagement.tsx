import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";
import TestimonyDataPage from "@/pages/Menus/Testimony/TestimonyDataPage";

export default function TestimonyManagement() {
  return (
    <div className="flex flex-col h-[calc(100vh-120px)] gap-3">
      <PageMeta title="見證管理" description="管理系統見證" />
      <PageBreadcrumb pageTitle="見證管理" />
      <div className="flex-1 min-h-0">
        <TestimonyDataPage />
      </div>
    </div>
  );
}


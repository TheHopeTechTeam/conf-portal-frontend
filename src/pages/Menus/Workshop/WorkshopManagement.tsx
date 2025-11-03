import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";

export default function WorkshopManagement() {
  return (
    <div className="flex flex-col h-[calc(100vh-140px)] gap-3">
      <PageMeta title="工作坊管理" description="管理系統工作坊" />
      <PageBreadcrumb pageTitle="工作坊管理" />
    </div>
  );
}

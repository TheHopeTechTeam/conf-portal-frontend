import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";

export default function ConferenceManagement() {
  return (
    <div className="flex flex-col h-[calc(100vh-140px)] gap-3">
      <PageMeta title="會議管理" description="管理系統會議" />
      <PageBreadcrumb pageTitle="會議管理" />
    </div>
  );
}

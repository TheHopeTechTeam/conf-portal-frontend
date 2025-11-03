import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";
import FilePage from "@/pages/Menus/File/FilePage";

export default function FileManagement() {
  return (
    <div className="flex flex-col h-[calc(100vh-120px)] gap-3">
      <PageMeta title="檔案管理" description="管理系統檔案" />
      <PageBreadcrumb pageTitle="檔案管理" />
      <div className="flex-1 min-h-0">
        <FilePage />
      </div>
    </div>
  );
}

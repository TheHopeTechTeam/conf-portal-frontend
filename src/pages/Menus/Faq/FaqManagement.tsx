import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";
import FaqDataPage from "@/pages/Menus/Faq/FaqDataPage";

export default function FaqManagement() {
  return (
    <div className="flex flex-col h-[calc(100vh-120px)] gap-3">
      <PageMeta title="常見問題管理" description="管理系統常見問題" />
      <PageBreadcrumb pageTitle="常見問題管理" />
      <div className="flex-1 min-h-0">
        <FaqDataPage />
      </div>
    </div>
  );
}

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";
import FeedbackDataPage from "@/pages/Menus/Feedback/FeedbackDataPage";

export default function FeedbackManagement() {
  return (
    <div className="flex flex-col h-[calc(100vh-120px)] gap-3">
      <PageMeta title="意見回饋管理" description="管理系統意見回饋" />
      <PageBreadcrumb pageTitle="意見回饋管理" />
      <div className="flex-1 min-h-0">
        <FeedbackDataPage />
      </div>
    </div>
  );
}

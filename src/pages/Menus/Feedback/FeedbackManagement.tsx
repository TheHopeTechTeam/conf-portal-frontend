import ManagementPage from "@/components/common/ManagementPage";
import FeedbackDataPage from "@/pages/Menus/Feedback/FeedbackDataPage";

export default function FeedbackManagement() {
  return (
    <ManagementPage title="意見回饋管理" description="管理系統意見回饋">
      <FeedbackDataPage />
    </ManagementPage>
  );
}

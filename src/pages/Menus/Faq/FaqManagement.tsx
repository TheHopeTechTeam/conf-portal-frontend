import ManagementPage from "@/components/common/ManagementPage";
import FaqDataPage from "@/pages/Menus/Faq/FaqDataPage";

export default function FaqManagement() {
  return (
    <ManagementPage title="常見問題管理" description="管理系統常見問題">
      <FaqDataPage />
    </ManagementPage>
  );
}

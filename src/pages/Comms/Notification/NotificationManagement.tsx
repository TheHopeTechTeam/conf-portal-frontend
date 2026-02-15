import ManagementPage from "@/components/common/ManagementPage";
import NotificationDataPage from "@/pages/Comms/Notification/NotificationDataPage";

export default function NotificationManagement() {
  return (
    <ManagementPage title="通知管理" description="管理與發送推播及郵件通知">
      <NotificationDataPage />
    </ManagementPage>
  );
}

import ManagementPage from "@/components/common/ManagementPage";
import NotificationHistoryDataPage from "@/pages/Comms/NotificationHistory/NotificationHistoryDataPage";

export default function NotificationHistoryManagement() {
  return (
    <ManagementPage title="通知歷史" description="檢視通知發送歷史與用戶送達狀態">
      <NotificationHistoryDataPage />
    </ManagementPage>
  );
}

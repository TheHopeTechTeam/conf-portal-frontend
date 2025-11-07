import ManagementPage from "@/components/common/ManagementPage";
import ConferenceDataPage from "@/pages/Menus/Conference/ConferenceDataPage";

export default function ConferenceManagement() {
  return (
    <ManagementPage title="會議管理" description="管理系統會議">
      <ConferenceDataPage />
    </ManagementPage>
  );
}

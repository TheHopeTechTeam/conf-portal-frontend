import ManagementPage from "@/components/common/ManagementPage";
import LocationDataPage from "@/pages/Menus/Location/LocationDataPage";

export default function LocationManagement() {
  return (
    <ManagementPage title="地點管理" description="管理系統地點">
      <LocationDataPage />
    </ManagementPage>
  );
}


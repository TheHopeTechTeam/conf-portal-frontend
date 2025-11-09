import EvenScheduleCalendar from "./EvenScheduleCalendar";
import ManagementPage from "@/components/common/ManagementPage";

export default function EventScheduleManagement() {
  return (
    <ManagementPage title="活動時程管理" description="管理活動時程">
      <EvenScheduleCalendar />
    </ManagementPage>
  );
}

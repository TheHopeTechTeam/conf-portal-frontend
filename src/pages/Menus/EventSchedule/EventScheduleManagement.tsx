import { ConferenceItem, conferenceService } from "@/api/services/conferenceService";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ManagementPage from "@/components/common/ManagementPage";
import { useEffect, useState } from "react";
import EvenScheduleCalendar from "./EvenScheduleCalendar";

export default function EventScheduleManagement() {
  const [conference, setConference] = useState<ConferenceItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActiveConference = async () => {
      try {
        setLoading(true);
        const response = await conferenceService.getActive();
        if (response.success && response.data) {
          setConference(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch active conference:", error);
        // 如果获取失败，保持 conference 为 null，使用默认标题
      } finally {
        setLoading(false);
      }
    };

    fetchActiveConference();
  }, []);

  // 动态生成 title
  const title = conference ? `活動時程管理 - ${conference.title}(${conference.startDate}-${conference.endDate})` : "活動時程管理";

  // 动态生成 description
  const description = conference ? `管理「${conference.title}」的活動時程` : "管理活動時程";

  return (
    <ManagementPage title={title} description={description}>
      {loading ? (
        <LoadingSpinner size="lg" text="載入會議資訊中..." />
      ) : conference ? (
        <EvenScheduleCalendar conference={conference} />
      ) : (
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500 dark:text-gray-400">目前沒有活動中的會議</div>
        </div>
      )}
    </ManagementPage>
  );
}

import { workshopService, type WorkshopDetail } from "@/api/services/workshopService";
import Input from "@/components/ui/input";
import TextArea from "@/components/ui/textarea";
import { DateUtil } from "@/utils/dateUtil";
import { useEffect, useState } from "react";

interface WorkshopDetailViewProps {
  workshopId: string;
}

const WorkshopDetailView: React.FC<WorkshopDetailViewProps> = ({ workshopId }) => {
  const [workshopData, setWorkshopData] = useState<WorkshopDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkshopDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await workshopService.getById(workshopId);
        setWorkshopData(response.data);
      } catch (e) {
        console.error("Error fetching workshop detail:", e);
        setError("載入工作坊詳情失敗");
      } finally {
        setLoading(false);
      }
    };

    if (workshopId) {
      fetchWorkshopDetail();
    }
  }, [workshopId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500 dark:text-gray-400">載入中...</div>
      </div>
    );
  }

  if (error || !workshopData) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-red-500 dark:text-red-400">{error || "載入失敗"}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 基本資訊 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Input id="title" label="工作坊標題" type="text" value={workshopData.title} disabled />
        </div>

        <div>
          <Input id="timezone" label="時區" type="text" value={workshopData.timezone} disabled />
        </div>

        <div>
          <Input
            id="startTime"
            label="開始時間"
            type="text"
            value={workshopData.startTime ? DateUtil.format(workshopData.startTime, "YYYY-MM-DD HH:mm") : "未知"}
            disabled
          />
        </div>

        <div>
          <Input
            id="endTime"
            label="結束時間"
            type="text"
            value={workshopData.endTime ? DateUtil.format(workshopData.endTime, "YYYY-MM-DD HH:mm") : "未知"}
            disabled
          />
        </div>

        <div>
          <Input
            id="location"
            label="地點"
            type="text"
            value={workshopData.location?.name || "未設置"}
            disabled
          />
        </div>

        <div>
          <Input
            id="conference"
            label="會議"
            type="text"
            value={workshopData.conference?.title || "未設置"}
            disabled
          />
        </div>

        <div>
          <Input
            id="participantLimit"
            label="參與者人數限制"
            type="text"
            value={workshopData.participantLimit !== undefined ? String(workshopData.participantLimit) : "無限制"}
            disabled
          />
        </div>

        <div>
          <Input id="sequence" label="顯示順序" type="text" value={String(workshopData.sequence)} disabled />
        </div>
      </div>

      {/* 描述 */}
      {workshopData.description && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">描述</label>
          <TextArea id="description" placeholder="" value={workshopData.description || ""} disabled rows={3} />
        </div>
      )}

      {/* 備註 */}
      {workshopData.remark && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">備註</label>
          <TextArea id="remark" placeholder="" value={workshopData.remark || ""} disabled rows={3} />
        </div>
      )}
    </div>
  );
};

export default WorkshopDetailView;


import { conferenceService, type ConferenceDetail } from "@/api/services/conferenceService";
import Input from "@/components/ui/input";
import TextArea from "@/components/ui/textarea";
import Checkbox from "@/components/ui/checkbox";
import { DateUtil } from "@/utils/dateUtil";
import { useEffect, useState } from "react";

interface ConferenceDetailViewProps {
  conferenceId: string;
}

const ConferenceDetailView: React.FC<ConferenceDetailViewProps> = ({ conferenceId }) => {
  const [conferenceData, setConferenceData] = useState<ConferenceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConferenceDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await conferenceService.getById(conferenceId);
        setConferenceData(response.data);
      } catch (e) {
        console.error("Error fetching conference detail:", e);
        setError("載入會議詳情失敗");
      } finally {
        setLoading(false);
      }
    };

    if (conferenceId) {
      fetchConferenceDetail();
    }
  }, [conferenceId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500 dark:text-gray-400">載入中...</div>
      </div>
    );
  }

  if (error || !conferenceData) {
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
          <Input id="title" label="會議標題" type="text" value={conferenceData.title} disabled />
        </div>

        <div>
          <Input
            id="location"
            label="地點"
            type="text"
            value={conferenceData.location?.name || "未設置"}
            disabled
          />
        </div>

        <div>
          <Input
            id="startDate"
            label="開始日期"
            type="text"
            value={conferenceData.startDate ? DateUtil.format(conferenceData.startDate, "YYYY-MM-DD") : "未知"}
            disabled
          />
        </div>

        <div>
          <Input
            id="endDate"
            label="結束日期"
            type="text"
            value={conferenceData.endDate ? DateUtil.format(conferenceData.endDate, "YYYY-MM-DD") : "未知"}
            disabled
          />
        </div>
      </div>

      {/* 啟用狀態 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">啟用狀態</label>
        <div className="mt-2">
          <Checkbox
            id="isActive"
            checked={conferenceData.isActive !== undefined ? conferenceData.isActive : true}
            disabled
            label={conferenceData.isActive !== undefined && conferenceData.isActive ? "已啟用" : "未啟用"}
          />
        </div>
      </div>

      {/* 描述 */}
      {conferenceData.description && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">描述</label>
          <TextArea id="description" placeholder="" value={conferenceData.description || ""} disabled rows={3} />
        </div>
      )}

      {/* 時間資訊 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Input
            id="createdAt"
            label="建立時間"
            type="text"
            value={conferenceData.createdAt ? DateUtil.format(conferenceData.createdAt) : "未知"}
            disabled
          />
        </div>

        <div>
          <Input
            id="updatedAt"
            label="更新時間"
            type="text"
            value={conferenceData.updatedAt ? DateUtil.format(conferenceData.updatedAt) : "未知"}
            disabled
          />
        </div>
      </div>

      {/* 備註 */}
      {conferenceData.remark && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">備註</label>
          <TextArea id="remark" placeholder="" value={conferenceData.remark || ""} disabled rows={3} />
        </div>
      )}
    </div>
  );
};

export default ConferenceDetailView;


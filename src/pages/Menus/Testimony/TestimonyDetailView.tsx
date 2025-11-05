import { testimonyService } from "@/api/services/testimonyService";
import Checkbox from "@/components/ui/checkbox";
import Input from "@/components/ui/input";
import TextArea from "@/components/ui/textarea";
import { DateUtil } from "@/utils/dateUtil";
import { useEffect, useState } from "react";

interface TestimonyDetailViewProps {
  testimonyId: string;
}

interface TestimonyDetailData {
  id: string;
  name: string;
  phoneNumber?: string;
  share: boolean;
  message?: string;
  description?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

const TestimonyDetailView: React.FC<TestimonyDetailViewProps> = ({ testimonyId }) => {
  const [testimonyData, setTestimonyData] = useState<TestimonyDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTestimonyDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await testimonyService.getById(testimonyId);
        setTestimonyData(response.data);
      } catch (e) {
        console.error("Error fetching testimony detail:", e);
        setError("載入見證詳情失敗");
      } finally {
        setLoading(false);
      }
    };

    if (testimonyId) {
      fetchTestimonyDetail();
    }
  }, [testimonyId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500 dark:text-gray-400">載入中...</div>
      </div>
    );
  }

  if (error || !testimonyData) {
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
          <Input id="name" label="姓名" type="text" value={testimonyData.name} disabled />
        </div>

        <div>
          <Input
            id="phoneNumber"
            label="電話號碼"
            type="text"
            value={testimonyData.phoneNumber || "未提供"}
            disabled
          />
        </div>

        <div className="md:col-span-2">
          <Checkbox id="share" checked={testimonyData.share} disabled label="允許分享" />
        </div>
      </div>

      {/* 見證訊息 */}
      {testimonyData.message && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            見證訊息內容
          </label>
          <TextArea id="message" placeholder="" value={testimonyData.message || ""} disabled rows={5} />
        </div>
      )}

      {/* 描述 */}
      {testimonyData.description && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">描述</label>
          <TextArea
            id="description"
            placeholder=""
            value={testimonyData.description || ""}
            disabled
            rows={3}
          />
        </div>
      )}

      {/* 時間資訊 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Input
            id="createdAt"
            label="建立時間"
            type="text"
            value={testimonyData.createdAt ? DateUtil.format(testimonyData.createdAt) : "未知"}
            disabled
          />
        </div>

        <div>
          <Input
            id="updatedAt"
            label="更新時間"
            type="text"
            value={testimonyData.updatedAt ? DateUtil.format(testimonyData.updatedAt) : "未知"}
            disabled
          />
        </div>
      </div>

      {/* 備註 */}
      {testimonyData.remark && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">備註</label>
          <TextArea id="remark" placeholder="" value={testimonyData.remark || ""} disabled rows={3} />
        </div>
      )}
    </div>
  );
};

export default TestimonyDetailView;


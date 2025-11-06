import { faqService } from "@/api/services/faqService";
import Input from "@/components/ui/input";
import TextArea from "@/components/ui/textarea";
import { DateUtil } from "@/utils/dateUtil";
import { useEffect, useState } from "react";

interface FaqDetailViewProps {
  faqId: string;
}

interface FaqDetailData {
  id: string;
  question: string;
  answer: string;
  relatedLink?: string;
  remark?: string;
  description?: string;
  category?: {
    id: string;
    name: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

const FaqDetailView: React.FC<FaqDetailViewProps> = ({ faqId }) => {
  const [faqData, setFaqData] = useState<FaqDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFaqDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await faqService.getById(faqId);
        setFaqData(response.data);
      } catch (e) {
        console.error("Error fetching faq detail:", e);
        setError("載入常見問題詳情失敗");
      } finally {
        setLoading(false);
      }
    };

    if (faqId) {
      fetchFaqDetail();
    }
  }, [faqId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500 dark:text-gray-400">載入中...</div>
      </div>
    );
  }

  if (error || !faqData) {
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
          <Input id="category" label="分類" type="text" value={faqData.category?.name || "未分類"} disabled />
        </div>

        {faqData.relatedLink && (
          <div>
            <Input id="relatedLink" label="相關連結" type="text" value={faqData.relatedLink} disabled />
          </div>
        )}
      </div>

      {/* 問題 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">問題</label>
        <TextArea id="question" placeholder="" value={faqData.question || ""} disabled rows={3} />
      </div>

      {/* 答案 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">答案</label>
        <TextArea id="answer" placeholder="" value={faqData.answer || ""} disabled rows={5} />
      </div>

      {/* 描述 */}
      {faqData.description && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">描述</label>
          <TextArea id="description" placeholder="" value={faqData.description || ""} disabled rows={3} />
        </div>
      )}

      {/* 時間資訊 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Input
            id="createdAt"
            label="建立時間"
            type="text"
            value={faqData.createdAt ? DateUtil.format(faqData.createdAt) : "未知"}
            disabled
          />
        </div>

        <div>
          <Input
            id="updatedAt"
            label="更新時間"
            type="text"
            value={faqData.updatedAt ? DateUtil.format(faqData.updatedAt) : "未知"}
            disabled
          />
        </div>
      </div>

      {/* 備註 */}
      {faqData.remark && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">備註</label>
          <TextArea id="remark" placeholder="" value={faqData.remark || ""} disabled rows={3} />
        </div>
      )}
    </div>
  );
};

export default FaqDetailView;


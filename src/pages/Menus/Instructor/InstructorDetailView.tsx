import { instructorService, type InstructorDetail } from "@/api/services/instructorService";
import Input from "@/components/ui/input";
import TextArea from "@/components/ui/textarea";
import ImagePreviewCard from "@/pages/Menus/File/ImagePreviewCard";
import { DateUtil } from "@/utils/dateUtil";
import { useEffect, useState } from "react";

// 格式化檔案大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

interface InstructorDetailViewProps {
  instructorId: string;
}

const InstructorDetailView: React.FC<InstructorDetailViewProps> = ({ instructorId }) => {
  const [instructorData, setInstructorData] = useState<InstructorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInstructorDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await instructorService.getById(instructorId);
        setInstructorData(response.data);
      } catch (e) {
        console.error("Error fetching instructor detail:", e);
        setError("載入講者詳情失敗");
      } finally {
        setLoading(false);
      }
    };

    if (instructorId) {
      fetchInstructorDetail();
    }
  }, [instructorId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500 dark:text-gray-400">載入中...</div>
      </div>
    );
  }

  if (error || !instructorData) {
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
          <Input id="name" label="姓名" type="text" value={instructorData.name} disabled />
        </div>

        <div>
          <Input id="title" label="職稱" type="text" value={instructorData.title || "未提供"} disabled />
        </div>
      </div>

      {/* 簡介 */}
      {instructorData.bio && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">簡介</label>
          <TextArea id="bio" placeholder="" value={instructorData.bio || ""} disabled rows={3} />
        </div>
      )}

      {/* 描述 */}
      {instructorData.description && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">描述</label>
          <TextArea id="description" placeholder="" value={instructorData.description || ""} disabled rows={3} />
        </div>
      )}

      {/* 圖片 */}
      {instructorData.files && instructorData.files.length > 0 ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">圖片</label>
          <div className="grid grid-cols-5 gap-2">
            {instructorData.files.map((file, index) => (
              <ImagePreviewCard
                key={file.id || index}
                imageUrl={file.url || ""}
                alt={file.originalName || `講者圖片 ${index + 1}`}
                fileInfo={{
                  name: file.originalName,
                  size: file.sizeBytes,
                  type: file.contentType,
                }}
                formatFileSize={formatFileSize}
              />
            ))}
          </div>
        </div>
      ) : instructorData.imageUrl && instructorData.imageUrl.length > 0 ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">圖片</label>
          <div className="grid grid-cols-5 gap-2">
            {instructorData.imageUrl.map((url, index) => (
              <ImagePreviewCard
                key={index}
                imageUrl={url}
                alt={`講者圖片 ${index + 1}`}
                fileInfo={{
                  name: `圖片 ${index + 1}`,
                }}
              />
            ))}
          </div>
        </div>
      ) : null}

      {/* 時間資訊 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Input
            id="createdAt"
            label="建立時間"
            type="text"
            value={instructorData.createdAt ? DateUtil.format(instructorData.createdAt) : "未知"}
            disabled
          />
        </div>

        <div>
          <Input
            id="updatedAt"
            label="更新時間"
            type="text"
            value={instructorData.updatedAt ? DateUtil.format(instructorData.updatedAt) : "未知"}
            disabled
          />
        </div>
      </div>

      {/* 備註 */}
      {instructorData.remark && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">備註</label>
          <TextArea id="remark" placeholder="" value={instructorData.remark || ""} disabled rows={3} />
        </div>
      )}
    </div>
  );
};

export default InstructorDetailView;


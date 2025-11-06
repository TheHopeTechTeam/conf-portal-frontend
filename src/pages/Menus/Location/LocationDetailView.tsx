import { locationService, type LocationDetail } from "@/api/services/locationService";
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

interface LocationDetailViewProps {
  locationId: string;
}

const LocationDetailView: React.FC<LocationDetailViewProps> = ({ locationId }) => {
  const [locationData, setLocationData] = useState<LocationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocationDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await locationService.getById(locationId);
        setLocationData(response.data);
      } catch (e) {
        console.error("Error fetching location detail:", e);
        setError("載入地點詳情失敗");
      } finally {
        setLoading(false);
      }
    };

    if (locationId) {
      fetchLocationDetail();
    }
  }, [locationId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500 dark:text-gray-400">載入中...</div>
      </div>
    );
  }

  if (error || !locationData) {
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
          <Input id="name" label="地點名稱" type="text" value={locationData.name} disabled />
        </div>

        <div>
          <Input id="room_number" label="房間號碼" type="text" value={locationData.room_number || "未提供"} disabled />
        </div>

        <div>
          <Input id="floor" label="樓層" type="text" value={locationData.floor || "未提供"} disabled />
        </div>

        <div>
          <Input id="address" label="地址" type="text" value={locationData.address || "未提供"} disabled />
        </div>

        <div>
          <Input
            id="latitude"
            label="緯度"
            type="text"
            value={locationData.latitude != null ? String(locationData.latitude) : "未提供"}
            disabled
          />
        </div>

        <div>
          <Input
            id="longitude"
            label="經度"
            type="text"
            value={locationData.longitude != null ? String(locationData.longitude) : "未提供"}
            disabled
          />
        </div>
      </div>

      {/* 描述 */}
      {locationData.description && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">描述</label>
          <TextArea id="description" placeholder="" value={locationData.description || ""} disabled rows={3} />
        </div>
      )}

      {/* 圖片 */}
      {locationData.files && locationData.files.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">圖片</label>
          <div className="grid grid-cols-5 gap-2">
            {locationData.files.map((file, index) => (
              <ImagePreviewCard
                key={file.id || index}
                imageUrl={file.url || ""}
                alt={file.originalName || `地點圖片 ${index + 1}`}
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
      )}

      {/* 時間資訊 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Input
            id="createdAt"
            label="建立時間"
            type="text"
            value={locationData.createdAt ? DateUtil.format(locationData.createdAt) : "未知"}
            disabled
          />
        </div>

        <div>
          <Input
            id="updatedAt"
            label="更新時間"
            type="text"
            value={locationData.updatedAt ? DateUtil.format(locationData.updatedAt) : "未知"}
            disabled
          />
        </div>
      </div>

      {/* 備註 */}
      {locationData.remark && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">備註</label>
          <TextArea id="remark" placeholder="" value={locationData.remark || ""} disabled rows={3} />
        </div>
      )}
    </div>
  );
};

export default LocationDetailView;

import { locationService, type LocationItem } from "@/api/services/locationService";
import Button from "@/components/ui/button";
import Checkbox from "@/components/ui/checkbox";
import Input from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import TextArea from "@/components/ui/textarea";
import { useEffect, useState } from "react";

export interface ConferenceFormValues {
  id?: string;
  title: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  isActive?: boolean;
  locationId?: string;
  remark?: string;
  description?: string;
}

interface ConferenceDataFormProps {
  mode: "create" | "edit";
  defaultValues?: ConferenceFormValues | null;
  onSubmit: (values: ConferenceFormValues) => Promise<void> | void;
  onCancel: () => void;
  submitting?: boolean;
}

const ConferenceDataForm: React.FC<ConferenceDataFormProps> = ({ mode, defaultValues, onSubmit, onCancel, submitting }) => {
  const [values, setValues] = useState<ConferenceFormValues>({
    title: "",
    startDate: "",
    endDate: "",
    isActive: true,
    locationId: undefined,
    remark: "",
    description: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  // 加载地点列表
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoadingLocations(true);
        const response = await locationService.getPages({ page: 0, pageSize: 1000, deleted: false });
        setLocations(response.data.items || []);
      } catch (e) {
        console.error("Error fetching locations:", e);
      } finally {
        setLoadingLocations(false);
      }
    };

    fetchLocations();
  }, []);

  useEffect(() => {
    if (defaultValues) {
      setValues({
        id: defaultValues.id,
        title: defaultValues.title || "",
        startDate: defaultValues.startDate || "",
        endDate: defaultValues.endDate || "",
        isActive: defaultValues.isActive !== undefined ? defaultValues.isActive : true,
        locationId: defaultValues.locationId,
        remark: defaultValues.remark || "",
        description: defaultValues.description || "",
      });
    } else {
      setValues({
        title: "",
        startDate: "",
        endDate: "",
        isActive: true,
        locationId: undefined,
        remark: "",
        description: "",
      });
    }
  }, [defaultValues]);

  const validate = (): boolean => {
    const next: Record<string, string> = {};

    if (!values.title || values.title.trim().length === 0) {
      next.title = "請輸入會議標題";
    } else if (values.title.length > 255) {
      next.title = "會議標題不能超過 255 個字符";
    }

    if (!values.startDate) {
      next.startDate = "請選擇開始日期";
    }

    if (!values.endDate) {
      next.endDate = "請選擇結束日期";
    }

    if (values.startDate && values.endDate) {
      const start = new Date(values.startDate);
      const end = new Date(values.endDate);
      if (end < start) {
        next.endDate = "結束日期不能早於開始日期";
      }
    }

    if (values.remark && values.remark.length > 256) {
      next.remark = "備註不能超過 256 個字符";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit(values);
  };

  const locationOptions = locations.map((location) => ({
    value: location.id,
    label: location.name,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          id="title"
          label="會議標題"
          type="text"
          placeholder="請輸入會議標題"
          value={values.title}
          onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
          error={errors.title || undefined}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input
            id="startDate"
            label="開始日期"
            type="date"
            value={values.startDate}
            onChange={(e) => setValues((v) => ({ ...v, startDate: e.target.value }))}
            error={errors.startDate || undefined}
            required
          />
        </div>

        <div>
          <Input
            id="endDate"
            label="結束日期"
            type="date"
            value={values.endDate}
            min={values.startDate || undefined}
            onChange={(e) => setValues((v) => ({ ...v, endDate: e.target.value }))}
            error={errors.endDate || undefined}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Select
            id="locationId"
            label="地點"
            options={locationOptions}
            value={values.locationId || ""}
            onChange={(value) => setValues((v) => ({ ...v, locationId: value ? String(value) : undefined }))}
            placeholder="請選擇地點"
            clearable
            disabled={loadingLocations}
          />
        </div>

        <div className="flex items-end">
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              啟用狀態 <span className="text-red-500">*</span>
            </label>
            <Checkbox
              id="isActive"
              checked={values.isActive !== undefined ? values.isActive : true}
              onChange={(checked) => setValues((v) => ({ ...v, isActive: checked }))}
              label={values.isActive ? "已啟用" : "未啟用"}
            />
          </div>
        </div>
      </div>

      <div>
        <TextArea
          id="description"
          label="描述"
          rows={3}
          placeholder="請輸入描述"
          value={values.description || ""}
          onChange={(value) => setValues((v) => ({ ...v, description: value }))}
          error={errors.description || undefined}
        />
      </div>

      <div>
        <TextArea
          id="remark"
          label="備註"
          rows={3}
          placeholder="請輸入備註"
          value={values.remark || ""}
          onChange={(value) => setValues((v) => ({ ...v, remark: value }))}
          error={errors.remark || undefined}
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button onClick={onCancel} size="sm" variant="outline" disabled={!!submitting}>
          取消
        </Button>
        <Button btnType="submit" size="sm" variant="primary" disabled={!!submitting}>
          {submitting ? "儲存中..." : mode === "create" ? "新增" : "儲存"}
        </Button>
      </div>
    </form>
  );
};

export default ConferenceDataForm;

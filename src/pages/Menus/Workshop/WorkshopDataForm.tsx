import { conferenceService } from "@/api/services/conferenceService";
import { locationService, type LocationBase } from "@/api/services/locationService";
import Button from "@/components/ui/button";
import DatePicker from "@/components/ui/date-picker";
import Input from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import TextArea from "@/components/ui/textarea";
import TimePicker from "@/components/ui/time-picker";
import { COMMON_TIMEZONES, convertDateTimeLocalToISO } from "@/utils/timezone";
import moment from "moment-timezone";
import { useEffect, useState } from "react";

export interface WorkshopFormValues {
  id?: string;
  title: string;
  timezone: string;
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endDate: string; // YYYY-MM-DD
  endTime: string; // HH:mm
  locationId?: string;
  conferenceId?: string;
  participantsLimit?: number;
  remark?: string;
  description?: string;
}

interface WorkshopDataFormProps {
  mode: "create" | "edit";
  defaultValues?: WorkshopFormValues | null;
  onSubmit: (values: WorkshopFormValues) => Promise<void> | void;
  onCancel: () => void;
  submitting?: boolean;
}

const WorkshopDataForm: React.FC<WorkshopDataFormProps> = ({ mode, defaultValues, onSubmit, onCancel, submitting }) => {
  const [values, setValues] = useState<WorkshopFormValues>({
    title: "",
    timezone: "Asia/Taipei",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    locationId: undefined,
    conferenceId: undefined,
    participantsLimit: undefined,
    remark: "",
    description: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [locations, setLocations] = useState<LocationBase[]>([]);
  const [conferences, setConferences] = useState<Array<{ id: string; title: string }>>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [loadingConferences, setLoadingConferences] = useState(false);

  // 載入地點列表
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoadingLocations(true);
        const response = await locationService.getList();
        const locationItems = response.data.items || [];
        setLocations(
          locationItems.map((item) => ({
            id: item.id,
            name: item.name,
          }))
        );
      } catch (e) {
        console.error("Error fetching locations:", e);
      } finally {
        setLoadingLocations(false);
      }
    };

    fetchLocations();
  }, []);

  // 載入會議列表
  useEffect(() => {
    const fetchConferences = async () => {
      try {
        setLoadingConferences(true);
        const response = await conferenceService.getList();
        const conferenceItems = response.data.items || [];
        setConferences(
          conferenceItems.map((item) => ({
            id: item.id,
            title: item.title,
          }))
        );
      } catch (e) {
        console.error("Error fetching conferences:", e);
      } finally {
        setLoadingConferences(false);
      }
    };

    fetchConferences();
  }, []);

  useEffect(() => {
    if (defaultValues) {
      // defaultValues already contains startDate, startTime, endDate, endTime as separate fields
      // (converted from ISO format in WorkshopDataPage.tsx)
      setValues({
        id: defaultValues.id,
        title: defaultValues.title || "",
        timezone: defaultValues.timezone || "Asia/Taipei",
        startDate: defaultValues.startDate || "",
        startTime: defaultValues.startTime || "",
        endDate: defaultValues.endDate || "",
        endTime: defaultValues.endTime || "",
        locationId: defaultValues.locationId,
        conferenceId: defaultValues.conferenceId,
        participantsLimit: defaultValues.participantsLimit,
        remark: defaultValues.remark || "",
        description: defaultValues.description || "",
      });
    } else {
      setValues({
        title: "",
        timezone: "Asia/Taipei",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
        locationId: undefined,
        conferenceId: undefined,
        participantsLimit: undefined,
        remark: "",
        description: "",
      });
    }
  }, [defaultValues]);

  const validate = (): boolean => {
    const next: Record<string, string> = {};

    if (!values.title || values.title.trim().length === 0) {
      next.title = "請輸入工作坊標題";
    } else if (values.title.length > 255) {
      next.title = "工作坊標題不能超過 255 個字符";
    }

    if (!values.timezone || values.timezone.trim().length === 0) {
      next.timezone = "請選擇時區";
    }

    if (!values.startDate) {
      next.startDate = "請選擇開始日期";
    }

    if (!values.startTime) {
      next.startTime = "請選擇開始時間";
    }

    if (!values.endDate) {
      next.endDate = "請選擇結束日期";
    }

    if (!values.endTime) {
      next.endTime = "請選擇結束時間";
    }

    if (values.startDate && values.endDate && values.startTime && values.endTime) {
      try {
        const startDateTime = convertDateTimeLocalToISO(`${values.startDate}T${values.startTime}`, values.timezone);
        const endDateTime = convertDateTimeLocalToISO(`${values.endDate}T${values.endTime}`, values.timezone);
        const startMoment = moment.tz(startDateTime, "YYYY-MM-DDTHH:mm:ss", values.timezone);
        const endMoment = moment.tz(endDateTime, "YYYY-MM-DDTHH:mm:ss", values.timezone);

        // Check if end datetime is before or equal to start datetime
        if (endMoment.isBefore(startMoment) || endMoment.isSame(startMoment)) {
          next.endTime = "結束時間必須晚於開始時間";
        }
      } catch (error) {
        console.error("Error validating datetime:", error);
        next.endTime = "時間格式錯誤";
      }
    }

    if (!values.locationId) {
      next.locationId = "請選擇地點";
    }

    if (!values.conferenceId) {
      next.conferenceId = "請選擇會議";
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

    try {
      // 組合日期和時間，並轉換為 ISO 8601 格式
      const startTime = convertDateTimeLocalToISO(`${values.startDate}T${values.startTime}`, values.timezone);
      const endTime = convertDateTimeLocalToISO(`${values.endDate}T${values.endTime}`, values.timezone);

      const submitValues: WorkshopFormValues = {
        ...values,
        startTime,
        endTime,
      };

      await onSubmit(submitValues);
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrors({ submit: "提交失敗，請稍後重試" });
    }
  };

  const locationOptions = locations.map((location) => ({
    value: location.id,
    label: location.name,
  }));

  const conferenceOptions = conferences.map((conference) => ({
    value: conference.id,
    label: conference.title,
  }));

  const timezoneOptions = COMMON_TIMEZONES.map((tz) => ({
    value: tz.value,
    label: tz.label,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          id="title"
          label="工作坊標題"
          type="text"
          placeholder="請輸入工作坊標題"
          value={values.title}
          onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
          error={errors.title || undefined}
          required
        />
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
            error={errors.locationId || undefined}
            clearable
            disabled={loadingLocations}
            required
          />
        </div>

        <div>
          <Select
            id="conferenceId"
            label="會議"
            options={conferenceOptions}
            value={values.conferenceId || ""}
            onChange={(value) => setValues((v) => ({ ...v, conferenceId: value ? String(value) : undefined }))}
            placeholder="請選擇會議"
            error={errors.conferenceId || undefined}
            clearable
            disabled={loadingConferences}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Select
            id="timezone"
            label="時區"
            options={timezoneOptions}
            value={values.timezone}
            onChange={(value) => setValues((v) => ({ ...v, timezone: value ? String(value) : "Asia/Taipei" }))}
            error={errors.timezone || undefined}
            required
          />
        </div>

        <div>
          <Input
            id="participantLimit"
            label="參與者人數限制"
            type="number"
            placeholder="留空表示無限制"
            value={values.participantsLimit?.toString() || ""}
            onChange={(e) => {
              const value = e.target.value;
              setValues((v) => ({
                ...v,
                participantsLimit: value === "" ? undefined : parseInt(value, 10),
              }));
            }}
            error={errors.participantLimit || undefined}
            min={1}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <DatePicker
            id="startDate"
            label="開始日期"
            value={values.startDate}
            onChange={(_selectedDates, dateStr) => {
              setValues((v) => ({ ...v, startDate: dateStr }));
            }}
            error={errors.startDate}
            required
            placeholder="請選擇開始日期"
          />
        </div>

        <div>
          <TimePicker
            id="startTime"
            label="開始時間"
            step={300}
            value={values.startTime}
            onChange={(e) => setValues((v) => ({ ...v, startTime: e.target.value }))}
            error={errors.startTime}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <DatePicker
            id="endDate"
            label="結束日期"
            value={values.endDate}
            minDate={values.startDate || undefined}
            onChange={(_selectedDates, dateStr) => {
              setValues((v) => ({ ...v, endDate: dateStr }));
            }}
            error={errors.endDate}
            required
            placeholder="請選擇結束日期"
          />
        </div>

        <div>
          <TimePicker
            id="endTime"
            label="結束時間"
            step={300}
            value={values.endTime}
            onChange={(e) => setValues((v) => ({ ...v, endTime: e.target.value }))}
            error={errors.endTime}
            required
          />
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

      {errors.submit && <p className="text-sm text-red-500 dark:text-red-400">{errors.submit}</p>}

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

export default WorkshopDataForm;

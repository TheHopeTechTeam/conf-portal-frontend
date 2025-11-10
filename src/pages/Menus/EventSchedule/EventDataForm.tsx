import { EventInfoCreate, EventInfoDetail } from "@/api/services/eventInfoService";
import Button from "@/components/ui/button";
import DatePicker from "@/components/ui/date-picker";
import Input from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import TextArea from "@/components/ui/textarea";
import TimePicker from "@/components/ui/time-picker";
import { COMMON_TIMEZONES, convertDateTimeLocalToISO, formatDateTimeLocal, getLocalTimezone } from "@/utils/timezone";
import moment from "moment-timezone";
import { useEffect, useState } from "react";

export interface EventFormValues {
  title: string;
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endDate: string; // YYYY-MM-DD
  endTime: string; // HH:mm
  timezone: string;
  textColor: string;
  backgroundColor: string;
  remark?: string;
  description?: string;
}

interface EventDataFormProps {
  mode: "create" | "edit";
  conferenceId: string;
  defaultValues?: EventInfoDetail | null;
  defaultStartDate?: string; // YYYY-MM-DD for create mode
  defaultStartTime?: string; // HH:mm for create mode
  defaultEndTime?: string; // HH:mm for create mode
  defaultTimezone?: string; // Default timezone for create mode
  onSubmit: (values: EventInfoCreate) => Promise<void> | void;
  onCancel: () => void;
  submitting?: boolean;
}

const EventDataForm: React.FC<EventDataFormProps> = ({
  mode,
  conferenceId,
  defaultValues,
  defaultStartDate,
  defaultStartTime,
  defaultEndTime,
  defaultTimezone,
  onSubmit,
  onCancel,
  submitting,
}) => {
  const [values, setValues] = useState<EventFormValues>({
    title: "",
    startDate: "",
    startTime: "09:00",
    endDate: "",
    endTime: "10:00",
    timezone: defaultTimezone || getLocalTimezone(),
    textColor: "#000000",
    backgroundColor: "#ffffff",
    remark: "",
    description: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (defaultValues) {
      // Parse startTime and endTime from defaultValues
      const startDateTime = formatDateTimeLocal(defaultValues.startTime, defaultValues.timezone);
      const endDateTime = formatDateTimeLocal(defaultValues.endTime, defaultValues.timezone);
      const [startDate, startTime] = startDateTime.split("T");
      const [endDate, endTime] = endDateTime.split("T");

      setValues({
        title: defaultValues.title || "",
        startDate: startDate || "",
        startTime: startTime || "09:00",
        endDate: endDate || "",
        endTime: endTime || "10:00",
        timezone: defaultValues.timezone || "Asia/Taipei",
        textColor: defaultValues.textColor || "#000000",
        backgroundColor: defaultValues.backgroundColor || "#ffffff",
        remark: defaultValues.remark || "",
        description: defaultValues.description || "",
      });
    } else {
      // Create mode: use defaults or provided defaults
      const startDate = defaultStartDate || moment().format("YYYY-MM-DD");
      const startTime = defaultStartTime || "09:00";
      const endTime = defaultEndTime || moment(startTime, "HH:mm").add(1, "hour").format("HH:mm");

      // Check if endTime is earlier than startTime (e.g., 23:30 -> 00:00), meaning it spans to next day
      let endDate = startDate;
      if (endTime && startTime) {
        const [startHour, startMinute] = startTime.split(":").map(Number);
        const [endHour, endMinute] = endTime.split(":").map(Number);
        const startTotalMinutes = startHour * 60 + startMinute;
        const endTotalMinutes = endHour * 60 + endMinute;

        // If end time is earlier than start time, it means the event spans to next day
        if (endTotalMinutes <= startTotalMinutes) {
          endDate = moment(startDate).add(1, "day").format("YYYY-MM-DD");
        }
      }

      setValues({
        title: "",
        startDate: startDate,
        startTime: startTime,
        endDate: endDate,
        endTime: endTime,
        timezone: defaultTimezone || getLocalTimezone(),
        textColor: "#000000",
        backgroundColor: "#ffffff",
        remark: "",
        description: "",
      });
    }
  }, [defaultValues, defaultStartDate, defaultStartTime, defaultEndTime, defaultTimezone]);

  const validate = (): boolean => {
    const next: Record<string, string> = {};

    if (!values.title || values.title.trim().length === 0) {
      next.title = "請輸入活動標題";
    } else if (values.title.length > 255) {
      next.title = "活動標題不能超過 255 個字符";
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
        const startDateTime = convertDateTimeLocalToISO(`${values.startDate}T${values.startTime}`);
        const endDateTime = convertDateTimeLocalToISO(`${values.endDate}T${values.endTime}`);
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

    // Validate color format
    const colorPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (values.textColor && !colorPattern.test(values.textColor)) {
      next.textColor = "請輸入有效的顏色格式（例如：#000000）";
    }
    if (values.backgroundColor && !colorPattern.test(values.backgroundColor)) {
      next.backgroundColor = "請輸入有效的顏色格式（例如：#ffffff）";
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
      const startTime = convertDateTimeLocalToISO(`${values.startDate}T${values.startTime}`);
      const endTime = convertDateTimeLocalToISO(`${values.endDate}T${values.endTime}`);

      const payload: EventInfoCreate = {
        title: values.title.trim(),
        start_datetime: startTime,
        end_datetime: endTime,
        timezone: values.timezone,
        text_color: values.textColor.trim(),
        background_color: values.backgroundColor.trim(),
        conference_id: conferenceId,
        remark: values.remark?.trim() || undefined,
        description: values.description?.trim() || undefined,
      };

      await onSubmit(payload);
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrors({ submit: "提交失敗，請稍後重試" });
    }
  };

  const timezoneOptions = COMMON_TIMEZONES.map((tz) => ({
    value: tz.value,
    label: tz.label,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          id="title"
          label="活動標題"
          type="text"
          placeholder="請輸入活動標題"
          value={values.title}
          onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
          error={errors.title || undefined}
          required
        />
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
            value={values.endTime}
            onChange={(e) => setValues((v) => ({ ...v, endTime: e.target.value }))}
            error={errors.endTime}
            required
          />
        </div>
      </div>

      <div>
        <Select
          id="timezone"
          label="時區"
          options={timezoneOptions}
          value={values.timezone}
          onChange={(value) => setValues((v) => ({ ...v, timezone: value as string }))}
          placeholder="請選擇時區"
          required
        />
      </div>

      <div>
        <div className="flex items-center gap-3">
          <Input
            id="backgroundColor"
            label="背景顏色"
            type="color"
            value={values.backgroundColor}
            onChange={(e) => setValues((v) => ({ ...v, backgroundColor: e.target.value }))}
            error={errors.backgroundColor || undefined}
            className="w-20 h-11"
            required
          />
          <Input
            id="backgroundColorText"
            type="text"
            placeholder="#ffffff"
            value={values.backgroundColor}
            onChange={(e) => setValues((v) => ({ ...v, backgroundColor: e.target.value }))}
            error={errors.backgroundColor || undefined}
            className="flex-1"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3">
          <Input
            id="textColor"
            label="文字顏色"
            type="color"
            value={values.textColor}
            onChange={(e) => setValues((v) => ({ ...v, textColor: e.target.value }))}
            error={errors.textColor || undefined}
            className="w-20 h-11"
            required
          />
          <Input
            id="textColorText"
            type="text"
            placeholder="#000000"
            value={values.textColor}
            onChange={(e) => setValues((v) => ({ ...v, textColor: e.target.value }))}
            error={errors.textColor || undefined}
            className="flex-1"
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

export default EventDataForm;

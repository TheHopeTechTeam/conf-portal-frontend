import moment from "moment-timezone";

/**
 * Common timezones list
 * Format: { value: timezone_name, label: display_name }
 */
export const COMMON_TIMEZONES = [
  { value: "Asia/Taipei", label: "台北 (UTC+8)" },
  { value: "Asia/Tokyo", label: "東京 (UTC+9)" },
  { value: "Asia/Shanghai", label: "上海 (UTC+8)" },
  { value: "Asia/Hong_Kong", label: "香港 (UTC+8)" },
  { value: "Asia/Singapore", label: "新加坡 (UTC+8)" },
  { value: "Asia/Seoul", label: "首爾 (UTC+9)" },
  { value: "Asia/Bangkok", label: "曼谷 (UTC+7)" },
  { value: "Asia/Kuala_Lumpur", label: "吉隆坡 (UTC+8)" },
  { value: "Asia/Jakarta", label: "雅加達 (UTC+7)" },
  { value: "Asia/Manila", label: "馬尼拉 (UTC+8)" },
  { value: "Asia/Kolkata", label: "新德里 (UTC+5:30)" },
  { value: "Asia/Dubai", label: "杜拜 (UTC+4)" },
  { value: "Europe/London", label: "倫敦 (UTC+0/+1)" },
  { value: "Europe/Paris", label: "巴黎 (UTC+1/+2)" },
  { value: "Europe/Berlin", label: "柏林 (UTC+1/+2)" },
  { value: "Europe/Rome", label: "羅馬 (UTC+1/+2)" },
  { value: "Europe/Madrid", label: "馬德里 (UTC+1/+2)" },
  { value: "Europe/Amsterdam", label: "阿姆斯特丹 (UTC+1/+2)" },
  { value: "America/New_York", label: "紐約 (UTC-5/-4)" },
  { value: "America/Chicago", label: "芝加哥 (UTC-6/-5)" },
  { value: "America/Denver", label: "丹佛 (UTC-7/-6)" },
  { value: "America/Los_Angeles", label: "洛杉磯 (UTC-8/-7)" },
  { value: "America/Toronto", label: "多倫多 (UTC-5/-4)" },
  { value: "America/Vancouver", label: "溫哥華 (UTC-8/-7)" },
  { value: "America/Sao_Paulo", label: "聖保羅 (UTC-3)" },
  { value: "America/Mexico_City", label: "墨西哥城 (UTC-6/-5)" },
  { value: "Australia/Sydney", label: "雪梨 (UTC+10/+11)" },
  { value: "Australia/Melbourne", label: "墨爾本 (UTC+10/+11)" },
  { value: "Pacific/Auckland", label: "奧克蘭 (UTC+12/+13)" },
];

/**
 * Get browser's local timezone
 * Returns IANA timezone name (e.g., "Asia/Taipei", "America/New_York")
 */
export const getLocalTimezone = (): string => {
  try {
    // Use Intl.DateTimeFormat to get the timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return timezone || "UTC";
  } catch (error) {
    console.error("Error getting local timezone:", error);
    return "UTC";
  }
};

/**
 * Get timezone offset string for display
 */
export const getTimezoneOffset = (timezone: string): string => {
  try {
    const offset = moment.tz(timezone).utcOffset();
    const hours = Math.floor(Math.abs(offset) / 60);
    const minutes = Math.abs(offset) % 60;
    const sign = offset >= 0 ? "+" : "-";
    return `UTC${sign}${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  } catch {
    return "";
  }
};

/**
 * Strip UTC Z / numeric offset / ms so the remaining string is treated as naive wall-clock,
 * then interpreted in the given IANA timezone (legacy API without Z/offset).
 */
export const stripIsoDateTimeToNaiveWallClock = (dateTimeString: string): string => {
  let s = dateTimeString.trim();
  if (s.endsWith("Z")) {
    s = s.slice(0, -1);
  }
  let changed = true;
  while (changed) {
    changed = false;
    if (/\.\d{1,3}$/.test(s)) {
      s = s.replace(/\.\d{1,3}$/, "");
      changed = true;
      continue;
    }
    if (/([+-]\d{2}):(\d{2})$/.test(s)) {
      s = s.replace(/([+-]\d{2}):(\d{2})$/, "");
      changed = true;
      continue;
    }
    if (/([+-]\d{4})$/.test(s)) {
      s = s.replace(/([+-]\d{4})$/, "");
      changed = true;
    }
  }
  return s;
};

const hasIsoUtcOrOffsetSuffix = (trimmed: string): boolean => {
  return (
    /Z$/i.test(trimmed) ||
    /([+-]\d{2}):(\d{2})$/.test(trimmed) ||
    /([+-]\d{4})$/.test(trimmed)
  );
};

/**
 * Parse API datetime to a JS Date (UTC instant). If the string has no Z/offset, treat digits as wall time in `eventTimezone` (legacy).
 */
export const parseApiDateTimeToDate = (dateTimeString: string, eventTimezone: string): Date => {
  const trimmed = dateTimeString.trim();

  if (hasIsoUtcOrOffsetSuffix(trimmed)) {
    const parsed = moment.parseZone(trimmed);
    if (parsed.isValid()) {
      return parsed.toDate();
    }
  }

  const clean = stripIsoDateTimeToNaiveWallClock(trimmed);
  let legacy = moment.tz(clean, ["YYYY-MM-DDTHH:mm:ss", "YYYY-MM-DDTHH:mm"], true, eventTimezone);
  if (legacy.isValid()) {
    return legacy.toDate();
  }

  const utcNaive = moment.utc(clean, ["YYYY-MM-DDTHH:mm:ss", "YYYY-MM-DDTHH:mm"], true);
  if (utcNaive.isValid()) {
    return utcNaive.toDate();
  }

  console.warn("parseApiDateTimeToDate: could not parse", dateTimeString);
  return new Date();
};

/**
 * Format API datetime for datetime-local fields: show wall clock in `timezone` (event zone).
 * If the API string includes Z or an offset, it is parsed as an instant then converted to that IANA zone.
 * Naive strings (no Z/offset) are treated as wall time already in `timezone` (legacy).
 */
export const formatDateTimeLocal = (dateTimeString: string, timezone: string): string => {
  try {
    if (!timezone || typeof timezone !== "string") {
      console.error("formatDateTimeLocal: invalid timezone");
      return dateTimeString;
    }
    const trimmed = dateTimeString.trim();

    if (hasIsoUtcOrOffsetSuffix(trimmed)) {
      const parsed = moment.parseZone(trimmed);
      if (parsed.isValid()) {
        return parsed.clone().tz(timezone).format("YYYY-MM-DDTHH:mm");
      }
    }

    const clean = stripIsoDateTimeToNaiveWallClock(trimmed);
    const legacy = moment.tz(clean, ["YYYY-MM-DDTHH:mm:ss", "YYYY-MM-DDTHH:mm"], true, timezone);
    if (legacy.isValid()) {
      return legacy.format("YYYY-MM-DDTHH:mm");
    }

    console.warn("formatDateTimeLocal: could not parse", dateTimeString);
    return dateTimeString;
  } catch (error) {
    console.error("Error formatting datetime:", error);
    return dateTimeString;
  }
};

/**
 * Parse form values as wall time in `timezone` and return a real UTC instant (e.g. for APIs that store true UTC).
 */
export const convertDateTimeLocalToISO = (dateTimeLocalString: string, timezone: string = "UTC"): string => {
  try {
    const momentDate = moment.tz(dateTimeLocalString, ["YYYY-MM-DDTHH:mm:ss", "YYYY-MM-DDTHH:mm"], true, timezone);
    if (!momentDate.isValid()) {
      throw new Error("Invalid datetime string");
    }
    return momentDate.toISOString();
  } catch (error) {
    console.error("Error converting datetime:", error);
    throw error;
  }
};

/**
 * Event schedule API: form date/time are naive wall clock in `timezone` (e.g. 2026-05-01 08:00 Asia/Taipei).
 * Serializes to ISO-8601 with that zone's offset (e.g. 2026-05-01T08:00:00+0800) so the instant is unambiguous for the backend.
 */
export const formatWallDateTimeInZoneAsOffsetIso = (
  dateTimeLocalString: string,
  timezone: string,
): string => {
  const momentDate = moment.tz(dateTimeLocalString, ["YYYY-MM-DDTHH:mm:ss", "YYYY-MM-DDTHH:mm"], true, timezone);
  if (!momentDate.isValid()) {
    throw new Error("Invalid datetime string");
  }
  return momentDate.format("YYYY-MM-DDTHH:mm:ssZZ");
};

/** @deprecated Use formatWallDateTimeInZoneAsOffsetIso */
export const formatZonedWallDateTimeForEventScheduleApi = formatWallDateTimeInZoneAsOffsetIso;

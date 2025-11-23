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
 * Format datetime string to local display format
 */
export const formatDateTimeLocal = (dateTimeString: string, timezone: string): string => {
  try {
    // 先解析 ISO 字符串（可能是 UTC 或帶時區的格式）
    let momentDate = moment(dateTimeString);
    if (!momentDate.isValid()) {
      return dateTimeString;
    }

    // 轉換到指定時區
    momentDate = momentDate.tz(timezone);

    // Format as datetime-local input format: YYYY-MM-DDTHH:mm
    return momentDate.format("YYYY-MM-DDTHH:mm");
  } catch (error) {
    console.error("Error formatting datetime:", error);
    return dateTimeString;
  }
};

/**
 * Convert datetime-local string to ISO format without timezone
 */
export const convertDateTimeLocalToISO = (dateTimeLocalString: string, timezone: string = "UTC"): string => {
  try {
    // Parse as local time in the specified timezone
    const momentDate = moment.tz(dateTimeLocalString, "YYYY-MM-DDTHH:mm", timezone);
    if (!momentDate.isValid()) {
      throw new Error("Invalid datetime string");
    }
    // Format as ISO without timezone
    return momentDate.toISOString();
  } catch (error) {
    console.error("Error converting datetime:", error);
    throw error;
  }
};

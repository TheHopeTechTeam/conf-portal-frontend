import moment from "moment";

// 設定 moment 的本地化語言為繁體中文
moment.locale("zh-tw");

/**
 * 日期時間工具類 - 使用 moment.js
 */
export class DateUtil {
  /**
   * 解析日期
   * @param date 日期值
   * @returns moment 物件
   */
  static parseDate(date: unknown): moment.Moment | null {
    if (!date) {
      return null;
    }

    const momentDate = moment(date);
    return momentDate.isValid() ? momentDate : null;
  }

  /**
   * 格式化日期
   * @param date 日期值
   * @param format 格式字串，預設 'YYYY年MM月DD日 HH:mm'
   * @returns 格式化後的日期字串
   */
  static format(date: unknown, format: string = "YYYY年MM月DD日 HH:mm"): string | undefined {
    const momentDate = this.parseDate(date);
    return momentDate ? momentDate.format(format) : undefined;
  }

  /**
   * 取得當前時間
   * @param format 格式字串，預設 'YYYY-MM-DD'
   * @returns 格式化後的當前時間字串
   */
  static now(format: string = "YYYY-MM-DD"): string {
    return moment().format(format);
  }

  /**
   * 友善時間顯示（相對時間）
   * @param dateTime 日期時間
   * @returns 友善時間字串
   */
  static friendlyDate(dateTime: unknown): string {
    if (!dateTime) {
      return "";
    }

    const momentDate = this.parseDate(dateTime);
    if (!momentDate) return "";

    const now = moment();
    const diff = momentDate.diff(now);

    // 如果是未來時間
    if (diff > 0) {
      const duration = moment.duration(diff);
      const minutes = Math.floor(duration.asMinutes());
      const hours = Math.floor(duration.asHours());
      const days = Math.floor(duration.asDays());
      const months = Math.floor(duration.asMonths());

      if (minutes < 1) return "立即";
      if (minutes < 60) return `${minutes}分鐘後`;
      if (hours < 24) return `${hours}小時後`;
      if (days < 30) return `${days}天後`;
      if (months < 12) return `${months}個月後`;
      return "很久後";
    }

    // 過去時間
    const duration = moment.duration(-diff);
    const minutes = Math.floor(duration.asMinutes());
    const hours = Math.floor(duration.asHours());
    const days = Math.floor(duration.asDays());
    const months = Math.floor(duration.asMonths());

    if (minutes < 1) return "剛剛";
    if (minutes < 60) return `${minutes}分鐘前`;
    if (hours < 24) return `${hours}小時前`;
    if (days < 30) return `${days}天前`;
    if (months < 12) return `${months}個月前`;
    return "很久前";
  }

  /**
   * 計算剩餘天數
   * @param datetime 目標日期時間
   * @returns 剩餘天數
   */
  static leftDays(datetime: unknown): number | null {
    if (!datetime) {
      return null;
    }

    const momentDate = this.parseDate(datetime);
    if (!momentDate) return null;

    return momentDate.diff(moment(), "days");
  }

  /**
   * 檢查日期是否有效
   * @param date 日期值
   * @returns 是否為有效日期
   */
  static isValid(date: unknown): boolean {
    return moment(date).isValid();
  }

  /**
   * 取得相對時間（使用 moment 的 fromNow）
   * @param dateTime 日期時間
   * @returns 相對時間字串
   */
  static fromNow(dateTime: unknown): string {
    if (!dateTime) return "";

    const momentDate = this.parseDate(dateTime);
    return momentDate ? momentDate.fromNow() : "";
  }

  /**
   * 格式化為台灣本地時間格式
   * @param date 日期值
   * @param format 格式字串，預設 'YYYY/MM/DD HH:mm'
   * @returns 格式化後的台灣本地時間字串
   */
  static formatTaiwan(date: unknown, format: string = "YYYY/MM/DD HH:mm"): string | null {
    const momentDate = this.parseDate(date);
    return momentDate ? momentDate.format(format) : null;
  }
}

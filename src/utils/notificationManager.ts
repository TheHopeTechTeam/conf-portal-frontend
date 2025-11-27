import type { NotificationItem } from "@/context/NotificationContext";

type ShowNotificationFn = (notification: Omit<NotificationItem, "id">) => string;

// 全局通知管理器 - 用於非 React 組件中顯示通知
class NotificationManager {
  private showNotificationFn: ShowNotificationFn | null = null;

  // 註冊通知函數（由 NotificationProvider 調用）
  register(showNotification: ShowNotificationFn): void {
    this.showNotificationFn = showNotification;
  }

  // 取消註冊
  unregister(): void {
    this.showNotificationFn = null;
  }

  // 顯示通知（可在任何地方調用）
  show(notification: Omit<NotificationItem, "id">): string | null {
    if (!this.showNotificationFn) {
      console.warn("NotificationManager: showNotification function not registered");
      return null;
    }
    return this.showNotificationFn(notification);
  }
}

// 導出單例
export const notificationManager = new NotificationManager();


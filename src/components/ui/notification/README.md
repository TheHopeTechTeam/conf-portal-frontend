# Notification 通知系統使用指南

## 概述

Notification 系統提供了一個全局的通知管理機制，可以在應用的任何地方顯示通知訊息。系統支持多種通知類型、位置選擇、自動消失等功能。

## 架構設計

### 1. NotificationContext

全局狀態管理，負責管理通知隊列和提供操作方法。

### 2. useNotification Hook

方便使用的 Hook，提供 `showNotification`、`removeNotification`、`clearAllNotifications` 方法。

### 3. NotificationContainer

渲染通知列表的容器組件，自動處理位置分組和動畫效果。

### 4. Notification 組件

單個通知的 UI 組件，支持多種變體和樣式。

## 使用方式

### 基本使用

```tsx
import { useNotification } from "@/context/NotificationContext";

function MyComponent() {
  const { showNotification } = useNotification();

  const handleSuccess = () => {
    showNotification({
      variant: "success",
      title: "操作成功",
      description: "您的操作已成功完成",
    });
  };

  const handleError = () => {
    showNotification({
      variant: "error",
      title: "操作失敗",
      description: "請檢查您的輸入",
      position: "top-right",
      hideDuration: 5000,
    });
  };

  return (
    <div>
      <button onClick={handleSuccess}>成功通知</button>
      <button onClick={handleError}>錯誤通知</button>
    </div>
  );
}
```

### 通知類型

- `success`: 成功通知（綠色）
- `info`: 信息通知（藍色）
- `warning`: 警告通知（黃色）
- `error`: 錯誤通知（紅色）

### 位置選項

- `top-left`: 左上角
- `top-center`: 頂部居中
- `top-right`: 右上角
- `bottom-left`: 左下角
- `bottom-center`: 底部居中
- `bottom-right`: 右下角（默認）

### 配置選項

```tsx
showNotification({
  variant: "success",           // 通知類型
  title: "標題",                // 必填：通知標題
  description: "描述",          // 可選：通知描述
  position: "bottom-right",      // 可選：位置（默認 bottom-right）
  hideDuration: 3000,           // 可選：自動消失時間（毫秒，默認 3000）
  autoClose: true,              // 可選：是否自動關閉（默認 true）
  action: {                      // 可選：操作按鈕
    label: "撤銷",
    onClick: () => handleUndo(),
    variant: "primary",         // 可選：按鈕樣式（primary/secondary/danger，默認 primary）
  },
});
```

### Action 操作按鈕

Notification 支持可選的操作按鈕，允許用戶在通知中執行快速操作。

#### Action 配置

```tsx
action: {
  label: string;              // 必填：按鈕文字
  onClick: () => void;        // 必填：點擊回調函數
  variant?: "primary" | "secondary" | "danger"; // 可選：按鈕樣式（默認 "primary"）
}
```

#### Action 按鈕樣式

- `primary`: 藍色主按鈕（默認）
- `secondary`: 灰色次要按鈕
- `danger`: 紅色危險按鈕

#### 使用示例

```tsx
// 帶有撤銷操作的刪除通知
const handleDelete = async (id: string) => {
  const deletedItem = await deleteItem(id);
  
  showNotification({
    variant: "success",
    title: "刪除成功",
    description: "項目已從列表中移除",
    action: {
      label: "撤銷",
      onClick: () => {
        restoreItem(deletedItem);
        showNotification({
          variant: "info",
          title: "已撤銷",
        });
      },
      variant: "secondary",
    },
  });
};

// 帶有確認操作的警告通知
showNotification({
  variant: "warning",
  title: "未保存的更改",
  description: "您有未保存的更改，確定要離開嗎？",
  action: {
    label: "保存",
    onClick: () => {
      saveChanges();
      showNotification({
        variant: "success",
        title: "已保存",
      });
    },
    variant: "primary",
  },
  autoClose: false, // 重要通知不自動關閉
});

// 帶有危險操作的錯誤通知
showNotification({
  variant: "error",
  title: "操作失敗",
  description: "無法完成此操作",
  action: {
    label: "重試",
    onClick: () => retryOperation(),
    variant: "danger",
  },
});
```

### 手動關閉通知

```tsx
const { showNotification, removeNotification } = useNotification();

const notificationId = showNotification({
  variant: "info",
  title: "處理中",
  autoClose: false, // 不自動關閉
});

// 稍後手動關閉
setTimeout(() => {
  removeNotification(notificationId);
}, 5000);
```

### 清除所有通知

```tsx
const { clearAllNotifications } = useNotification();

// 清除所有通知
clearAllNotifications();
```

## 出現時機設計建議

### 1. API 請求成功/失敗

```tsx
try {
  const result = await apiCall();
  showNotification({
    variant: "success",
    title: "操作成功",
    description: "數據已成功保存",
  });
} catch (error) {
  showNotification({
    variant: "error",
    title: "操作失敗",
    description: error.message,
  });
}
```

### 2. 表單驗證

```tsx
const handleSubmit = (data: FormData) => {
  if (!validateForm(data)) {
    showNotification({
      variant: "warning",
      title: "驗證失敗",
      description: "請檢查表單輸入",
      position: "top-center",
    });
    return;
  }
  // 提交表單...
};
```

### 3. 用戶操作反饋

```tsx
const handleDelete = async (id: string) => {
  try {
    await deleteItem(id);
    showNotification({
      variant: "success",
      title: "刪除成功",
      hideDuration: 2000,
    });
  } catch (error) {
    showNotification({
      variant: "error",
      title: "刪除失敗",
      description: "請稍後再試",
    });
  }
};
```

### 4. 系統狀態通知

```tsx
// 網絡連接狀態
if (!navigator.onLine) {
  showNotification({
    variant: "warning",
    title: "網絡連接中斷",
    description: "請檢查您的網絡連接",
    autoClose: false,
  });
}
```

## 最佳實踐

1. **時機選擇**：
   - 成功操作：立即顯示，3秒後自動消失
   - 錯誤操作：立即顯示，5秒後自動消失
   - 重要警告：不自動消失，需要用戶手動關閉

2. **位置選擇**：
   - 一般通知：使用 `bottom-right`（默認）
   - 重要通知：使用 `top-center` 更醒目
   - 錯誤通知：使用 `top-right` 避免遮擋內容

3. **訊息內容**：
   - 標題簡潔明確（10字以內）
   - 描述提供具體信息（可選）
   - 避免過於技術性的錯誤訊息

4. **Action 按鈕使用**：
   - 只在需要立即操作時使用（如撤銷、重試、確認）
   - 按鈕文字簡短明確（2-4字）
   - 危險操作使用 `danger` 樣式
   - 次要操作使用 `secondary` 樣式
   - 主要操作使用 `primary` 樣式（默認）

5. **性能考量**：
   - 同時顯示的通知數量建議不超過 5 個
   - 長時間運行的通知應設置 `autoClose: false`
   - 定期清理過期通知

## 注意事項

- NotificationProvider 必須包裹在應用的最外層（已在 App.tsx 中配置）
- NotificationContainer 會自動渲染所有通知，無需手動添加
- 通知 ID 由系統自動生成，用於追蹤和管理
- 相同位置的多個通知會自動堆疊顯示

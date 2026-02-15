import { NotificationMethod, NotificationType, type AdminNotificationCreate } from "@/api/services/notificationService";
import { userService, type UserBase } from "@/api/services/userService";
import Button from "@/components/ui/button";
import Checkbox from "@/components/ui/checkbox";
import type { ComboBoxOption } from "@/components/ui/combobox";
import { ComboBox } from "@/components/ui/combobox";
import Input from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import TextArea from "@/components/ui/textarea";
import { useCallback, useEffect, useRef, useState } from "react";

export type NotificationFormValues = AdminNotificationCreate;

interface NotificationDataFormProps {
  onSubmit: (values: NotificationFormValues) => Promise<void> | void;
  onCancel: () => void;
  submitting?: boolean;
}

const methodOptions = [
  { value: NotificationMethod.PUSH.toString(), label: "推播 (PUSH)" },
  { value: NotificationMethod.EMAIL.toString(), label: "電子郵件 (EMAIL)" },
];

/** 通知類型選項（群組類型後端已保留，前端之後再實現） */
const typeOptions = [
  { value: NotificationType.SYSTEM.toString(), label: "系統群發" },
  { value: NotificationType.INDIVIDUAL.toString(), label: "單一用戶" },
];

const USER_SEARCH_DEBOUNCE_MS = 300;

function userToOption(user: UserBase & { display_name?: string; phone_number?: string }): ComboBoxOption<string> {
  const label =
    user.displayName?.trim() ||
    user.display_name?.trim() ||
    user.email?.trim() ||
    user.phoneNumber?.trim() ||
    user.phone_number?.trim() ||
    user.id;
  return { value: user.id, label };
}

const NotificationDataForm: React.FC<NotificationDataFormProps> = ({ onSubmit, onCancel, submitting }) => {
  const [values, setValues] = useState<NotificationFormValues>({
    title: "",
    message: "",
    url: "",
    method: NotificationMethod.PUSH,
    type: NotificationType.SYSTEM,
    dry_run: false,
    user_ids: undefined,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userOptions, setUserOptions] = useState<ComboBoxOption<string>[]>([]);
  const [userOptionsLoading, setUserOptionsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchUserOptions = useCallback(async (keyword: string) => {
    setUserOptionsLoading(true);
    try {
      const res = await userService.getList({ keyword: keyword.trim() || undefined });
      const items = res.data?.items ?? [];
      setUserOptions(items.map(userToOption));
    } catch {
      setUserOptions([]);
    } finally {
      setUserOptionsLoading(false);
    }
  }, []);

  // 初次打開或關鍵字變化時拉取用戶列表（debounce）
  const handleUserQueryChange = useCallback(
    (query: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        fetchUserOptions(query);
        debounceRef.current = null;
      }, USER_SEARCH_DEBOUNCE_MS);
    },
    [fetchUserOptions],
  );

  useEffect(() => {
    if (values.type === NotificationType.INDIVIDUAL) {
      fetchUserOptions("");
    }
  }, [values.type, fetchUserOptions]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!values.title?.trim()) next.title = "請輸入通知標題";
    if (!values.message?.trim()) next.message = "請輸入通知內容";
    if (values.type === NotificationType.INDIVIDUAL) {
      if (!selectedUserId) next.user_ids = "請選擇一位用戶";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    let user_ids: string[] | undefined;
    if (values.type === NotificationType.INDIVIDUAL && selectedUserId) {
      user_ids = [selectedUserId];
    } else if (values.type === NotificationType.SYSTEM) {
      user_ids = undefined;
    }
    await onSubmit({ ...values, user_ids });
  };

  const isIndividual = values.type === NotificationType.INDIVIDUAL;
  const isSystem = values.type === NotificationType.SYSTEM;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="title"
        label="通知標題"
        type="text"
        value={values.title}
        onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
        placeholder="請輸入標題"
        error={errors.title}
        required
      />
      <TextArea
        id="message"
        label="通知內容"
        value={values.message}
        onChange={(value) => setValues((v) => ({ ...v, message: value }))}
        placeholder="請輸入內容"
        error={errors.message}
        required
        rows={4}
      />
      <Input
        id="url"
        label="連結 URL（選填）"
        type="text"
        value={values.url ?? ""}
        onChange={(e) => setValues((v) => ({ ...v, url: e.target.value || undefined }))}
        placeholder="https://..."
      />
      <Select
        id="method"
        label="發送方式"
        options={methodOptions}
        value={values.method.toString()}
        onChange={(value) => setValues((v) => ({ ...v, method: Number(value) as NotificationMethod }))}
        required
        size="md"
      />
      <Select
        id="notification-type"
        label="通知類型"
        options={typeOptions}
        value={values.type.toString()}
        onChange={(value) => setValues((v) => ({ ...v, type: Number(value) as NotificationType }))}
        placeholder="請選擇通知類型"
        required
        size="md"
      />
      {isSystem && (
        <p className="text-sm text-gray-500 dark:text-gray-400">將發送給所有在 DB 中已註冊的 FCM 裝置（含已登入與未登入裝置）。</p>
      )}
      {isIndividual && (
        <div>
          <ComboBox
            id="user_id"
            label="選擇用戶"
            placeholder={userOptionsLoading ? "載入中..." : "搜尋用戶（姓名、Email、電話）"}
            options={userOptions}
            value={selectedUserId}
            onChange={(v) => setSelectedUserId(v)}
            onQueryChange={handleUserQueryChange}
            filterFunction={() => true}
            clearable
            required
            error={errors.user_ids}
            hint="以關鍵字搜尋並選擇一位用戶"
          />
        </div>
      )}
      <Checkbox
        id="dry_run"
        label="試跑（不實際發送，僅解析目標並標記為試跑）"
        checked={values.dry_run ?? false}
        onChange={(checked) => setValues((v) => ({ ...v, dry_run: checked }))}
      />
      <div className="flex justify-end gap-2 pt-4">
        <Button btnType="button" variant="outline" onClick={onCancel} disabled={submitting}>
          取消
        </Button>
        <Button btnType="submit" variant="primary" disabled={submitting}>
          發送通知
        </Button>
      </div>
    </form>
  );
};

export default NotificationDataForm;

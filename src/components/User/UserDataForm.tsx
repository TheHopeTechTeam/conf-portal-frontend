import { useEffect, useState } from "react";
import Button from "../ui/button/Button";

export interface UserFormValues {
  id?: string;
  phone_number: string;
  email: string;
  verified: boolean;
  is_active: boolean;
  is_superuser: boolean;
  is_admin: boolean;
  display_name?: string;
  gender?: number; // 0: 未知, 1: 男性, 2: 女性, 3: 其他
  is_ministry: boolean;
  remark?: string;
}

interface UserDataFormProps {
  mode: "create" | "edit";
  defaultValues?: UserFormValues | null;
  onSubmit: (values: UserFormValues) => Promise<void> | void;
  onCancel: () => void;
  submitting?: boolean;
}

const UserDataForm: React.FC<UserDataFormProps> = ({ mode, defaultValues, onSubmit, onCancel, submitting }) => {
  const [values, setValues] = useState<UserFormValues>({
    phone_number: "",
    email: "",
    verified: false,
    is_active: true,
    is_superuser: false,
    is_admin: false,
    display_name: "",
    gender: 0,
    is_ministry: false,
    remark: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (defaultValues) {
      setValues({
        id: defaultValues.id,
        phone_number: defaultValues.phone_number || "",
        email: defaultValues.email || "",
        verified: defaultValues.verified ?? false,
        is_active: defaultValues.is_active ?? true,
        is_superuser: defaultValues.is_superuser ?? false,
        is_admin: defaultValues.is_admin ?? false,
        display_name: defaultValues.display_name || "",
        gender: defaultValues.gender ?? 0,
        is_ministry: defaultValues.is_ministry ?? false,
        remark: defaultValues.remark || "",
      });
    } else {
      setValues({
        phone_number: "",
        email: "",
        verified: false,
        is_active: true,
        is_superuser: false,
        is_admin: false,
        display_name: "",
        gender: 0,
        is_ministry: false,
        remark: "",
      });
    }
  }, [defaultValues]);

  const validate = (): boolean => {
    const next: Record<string, string> = {};

    if (!values.phone_number || values.phone_number.trim().length === 0) {
      next.phone_number = "請輸入手機號碼";
    }

    if (!values.email || values.email.trim().length === 0) {
      next.email = "請輸入電子郵件";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      next.email = "請輸入有效的電子郵件格式";
    }

    if (values.display_name && values.display_name.length > 64) {
      next.display_name = "顯示名稱不能超過 64 個字符";
    }

    if (values.remark && values.remark.length > 500) {
      next.remark = "備註不能超過 500 個字符";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            手機號碼 <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
            placeholder="+886912345678"
            value={values.phone_number}
            onChange={(e) => setValues((v) => ({ ...v, phone_number: e.target.value }))}
          />
          {errors.phone_number && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.phone_number}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            電子郵件 <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
            placeholder="user@example.com"
            value={values.email}
            onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
          />
          {errors.email && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.email}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">顯示名稱</label>
          <input
            type="text"
            className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
            placeholder="用戶顯示名稱"
            value={values.display_name || ""}
            onChange={(e) => setValues((v) => ({ ...v, display_name: e.target.value }))}
          />
          {errors.display_name && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.display_name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">性別</label>
          <select
            className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            value={values.gender ?? 0}
            onChange={(e) => setValues((v) => ({ ...v, gender: Number(e.target.value) }))}
          >
            <option value={0}>未知</option>
            <option value={1}>男性</option>
            <option value={2}>女性</option>
            <option value={3}>其他</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">狀態設定</label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                checked={values.verified}
                onChange={(e) => setValues((v) => ({ ...v, verified: e.target.checked }))}
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">已驗證</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                checked={values.is_active}
                onChange={(e) => setValues((v) => ({ ...v, is_active: e.target.checked }))}
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">啟用</span>
            </label>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">權限設定</label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                checked={values.is_superuser}
                onChange={(e) => setValues((v) => ({ ...v, is_superuser: e.target.checked }))}
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">超級用戶</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                checked={values.is_admin}
                onChange={(e) => setValues((v) => ({ ...v, is_admin: e.target.checked }))}
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">管理員</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                checked={values.is_ministry}
                onChange={(e) => setValues((v) => ({ ...v, is_ministry: e.target.checked }))}
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">事工</span>
            </label>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">備註</label>
        <textarea
          className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
          rows={3}
          placeholder="備註資訊"
          value={values.remark || ""}
          onChange={(e) => setValues((v) => ({ ...v, remark: e.target.value }))}
        />
        {errors.remark && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.remark}</p>}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button onClick={onCancel} size="sm" variant="outline" disabled={!!submitting}>
          取消
        </Button>
        <Button btnType="submit" size="sm" variant="primary" disabled={!!submitting}>
          {mode === "create" ? "新增" : "儲存"}
        </Button>
      </div>
    </form>
  );
};

export default UserDataForm;

import Button from "@/components/ui/button";
import Checkbox from "@/components/ui/checkbox";
import Input from "@/components/ui/input";
import PhoneInput from "@/components/ui/phone-input";
import { Select } from "@/components/ui/select";
import TextArea from "@/components/ui/textarea";
import { CountryCodes } from "@/const/enums";
import { usePermissions } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";

export interface UserFormValues {
  id?: string;
  phone_number: string;
  email: string;
  password?: string;
  password_confirm?: string;
  verified: boolean;
  is_active: boolean;
  is_superuser: boolean;
  is_admin: boolean;
  display_name?: string;
  gender?: number; // 0: 未知, 1: 男性, 2: 女性
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
  const [showPassword, setShowPassword] = useState(false);
  const { isSuperAdmin } = usePermissions();

  // 檢查當前用戶是否為 superadmin
  const [values, setValues] = useState<UserFormValues>({
    phone_number: "",
    email: "",
    password: "",
    password_confirm: "",
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
        password: "",
        password_confirm: "",
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
        password: "",
        password_confirm: "",
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

    if ((values.phone_number.length > 1 && !/^[1-9]\d*$/.test(values.phone_number.slice(1))) || !values.phone_number.startsWith("+")) {
      next.phone_number = "請輸入有效的手機號碼";
    }

    if (!values.email || values.email.trim().length === 0) {
      next.email = "請輸入電子郵件";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      next.email = "請輸入有效的電子郵件格式";
    }

    // 創建模式下驗證密碼
    if (mode === "create") {
      if (!values.password || values.password.trim().length === 0) {
        next.password = "請輸入密碼";
      } else if (values.password.length < 8) {
        next.password = "密碼長度至少需要 8 個字符";
      }

      if (!values.password_confirm || values.password_confirm.trim().length === 0) {
        next.password_confirm = "請確認密碼";
      } else if (values.password !== values.password_confirm) {
        next.password_confirm = "密碼與確認密碼不一致";
      }
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

    // 編輯模式下不發送密碼字段
    const submitValues = mode === "edit" ? { ...values, password: undefined, password_confirm: undefined } : values;

    await onSubmit(submitValues);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <PhoneInput
            countries={CountryCodes}
            id="phone_number"
            label="手機號碼"
            placeholder="請輸入手機號碼"
            value={values.phone_number}
            onChange={(phoneNumber) => setValues((v) => ({ ...v, phone_number: phoneNumber }))}
            error={errors.phone_number || undefined}
            hint="例如: +886912345678"
            selectPosition="start"
            required
          />
        </div>

        <div>
          <Input
            id="email"
            label="電子郵件"
            placeholder="請輸入電子郵件"
            value={values.email}
            onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
            error={errors.email || undefined}
            hint="例如: user@example.com"
            required
            clearable
          />
        </div>
      </div>

      {mode === "create" && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              label="密碼"
              icon={
                showPassword ? (
                  <MdVisibility className="fill-gray-500 dark:fill-gray-400 size-5" />
                ) : (
                  <MdVisibilityOff className="fill-gray-500 dark:fill-gray-400 size-5" />
                )
              }
              iconPosition="right"
              iconClick={() => setShowPassword(!showPassword)}
              placeholder="請輸入密碼"
              value={values.password || ""}
              onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))}
              error={errors.password || undefined}
              hint="至少 8 個字符"
              required
            />
          </div>

          <div>
            <Input
              id="password_confirm"
              type={showPassword ? "text" : "password"}
              label="確認密碼"
              icon={
                showPassword ? (
                  <MdVisibility className="fill-gray-500 dark:fill-gray-400 size-5" />
                ) : (
                  <MdVisibilityOff className="fill-gray-500 dark:fill-gray-400 size-5" />
                )
              }
              iconPosition="right"
              iconClick={() => setShowPassword(!showPassword)}
              placeholder="請再次輸入密碼"
              value={values.password_confirm || ""}
              onChange={(e) => setValues((v) => ({ ...v, password_confirm: e.target.value }))}
              error={errors.password_confirm || undefined}
              hint="必須與密碼相同"
              required
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Input
            id="display_name"
            label="顯示名稱"
            type="text"
            placeholder="用戶顯示名稱"
            value={values.display_name || ""}
            onChange={(e) => setValues((v) => ({ ...v, display_name: e.target.value }))}
            error={errors.display_name || undefined}
          />
          {errors.display_name && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.display_name}</p>}
        </div>

        <div>
          <Select
            id="gender"
            label="性別"
            placeholder="請選擇性別"
            options={[
              { value: 0, label: "未知" },
              { value: 1, label: "男性" },
              { value: 2, label: "女性" },
            ]}
            value={values.gender ?? 0}
            onChange={(value) => setValues((v) => ({ ...v, gender: Number(value) }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">狀態設定</label>
          <div className="space-y-2">
            <Checkbox checked={values.verified} onChange={(checked) => setValues((v) => ({ ...v, verified: checked }))} label="已驗證" />
            <Checkbox checked={values.is_active} onChange={(checked) => setValues((v) => ({ ...v, is_active: checked }))} label="啟用" />
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">權限設定</label>
          <div className="space-y-2">
            <Checkbox
              checked={values.is_superuser}
              onChange={(checked) => setValues((v) => ({ ...v, is_superuser: checked }))}
              label="超級用戶"
              disabled={!isSuperAdmin}
            />
            <Checkbox checked={values.is_admin} onChange={(checked) => setValues((v) => ({ ...v, is_admin: checked }))} label="管理員" />
            <Checkbox
              checked={values.is_ministry}
              onChange={(checked) => setValues((v) => ({ ...v, is_ministry: checked }))}
              label="事工"
            />
          </div>
        </div>
      </div>

      <div>
        <TextArea
          id="remark"
          label="備註"
          rows={3}
          placeholder="備註資訊"
          value={values.remark || ""}
          onChange={(value) => setValues((v) => ({ ...v, remark: value }))}
          error={errors.remark || undefined}
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

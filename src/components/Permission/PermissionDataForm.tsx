import { useEffect, useState } from "react";
import Button from "../ui/button/Button";

export interface PermissionFormValues {
  id?: string;
  displayName: string;
  code: string;
  resourceId: string;
  verbId: string;
  isActive: boolean;
  description?: string;
  remark?: string;
}

interface PermissionDataFormProps {
  mode: "create" | "edit";
  defaultValues?: PermissionFormValues | null;
  onSubmit: (values: PermissionFormValues) => Promise<void> | void;
  onCancel: () => void;
  submitting?: boolean;
}

const PermissionDataForm: React.FC<PermissionDataFormProps> = ({ mode, defaultValues, onSubmit, onCancel, submitting }) => {
  const [values, setValues] = useState<PermissionFormValues>({
    displayName: "",
    code: "",
    resourceId: "",
    verbId: "",
    isActive: true,
    description: "",
    remark: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (defaultValues) {
      setValues({
        id: defaultValues.id,
        displayName: defaultValues.displayName || "",
        code: defaultValues.code || "",
        resourceId: defaultValues.resourceId || "",
        verbId: defaultValues.verbId || "",
        isActive: defaultValues.isActive ?? true,
        description: defaultValues.description || "",
        remark: defaultValues.remark || "",
      });
    } else {
      setValues({
        displayName: "",
        code: "",
        resourceId: "",
        verbId: "",
        isActive: true,
        description: "",
        remark: "",
      });
    }
  }, [defaultValues]);

  const validate = (): boolean => {
    const next: Record<string, string> = {};

    if (!values.displayName || values.displayName.trim().length === 0) {
      next.displayName = "請輸入顯示名稱";
    }

    if (!values.code || values.code.trim().length === 0) {
      next.code = "請輸入代碼";
    }

    if (!values.resourceId) {
      next.resourceId = "請選擇資源";
    }

    if (!values.verbId) {
      next.verbId = "請選擇動作";
    }

    if (values.description && values.description.length > 500) {
      next.description = "描述不能超過 500 個字符";
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
            顯示名稱 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
            placeholder="權限顯示名稱"
            value={values.displayName}
            onChange={(e) => setValues((v) => ({ ...v, displayName: e.target.value }))}
          />
          {errors.displayName && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.displayName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            代碼 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
            placeholder="user:create"
            value={values.code}
            onChange={(e) => setValues((v) => ({ ...v, code: e.target.value }))}
          />
          {errors.code && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.code}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            資源 <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            value={values.resourceId}
            onChange={(e) => setValues((v) => ({ ...v, resourceId: e.target.value }))}
          >
            <option value="">請選擇資源</option>
            {/* TODO: Load resources from API */}
            <option value="user">用戶管理</option>
            <option value="role">角色管理</option>
            <option value="permission">權限管理</option>
          </select>
          {errors.resourceId && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.resourceId}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            動作 <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            value={values.verbId}
            onChange={(e) => setValues((v) => ({ ...v, verbId: e.target.value }))}
          >
            <option value="">請選擇動作</option>
            {/* TODO: Load verbs from API */}
            <option value="create">創建</option>
            <option value="read">讀取</option>
            <option value="update">更新</option>
            <option value="delete">刪除</option>
          </select>
          {errors.verbId && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.verbId}</p>}
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
                checked={values.isActive}
                onChange={(e) => setValues((v) => ({ ...v, isActive: e.target.checked }))}
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">啟用</span>
            </label>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">描述</label>
        <textarea
          className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
          rows={3}
          placeholder="權限描述"
          value={values.description || ""}
          onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
        />
        {errors.description && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.description}</p>}
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

export default PermissionDataForm;

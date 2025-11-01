import { AdminResourceType } from "@/api/services/resourceService";
import { getCommonIconNames, useIconResolver } from "@/utils/icon-resolver";
import { useEffect, useState } from "react";
import Button from "../ui/button";
import Checkbox from "../ui/checkbox";
import Input, { IconInput } from "../ui/input";
import { Select } from "../ui/select";
import TextArea from "../ui/textarea";

export interface ResourceFormValues {
  id?: string;
  name: string;
  key: string;
  code: string;
  icon: string;
  path: string;
  type: AdminResourceType;
  is_visible?: boolean;
  description?: string;
  remark?: string;
  pid?: string;
}

interface ResourceDataFormProps {
  mode: "create" | "edit";
  defaultValues?: ResourceFormValues | null;
  parentResource?: { id: string; name: string } | null; // 父資源信息，用於新增子資源
  onSubmit: (values: ResourceFormValues) => Promise<void> | void;
  onCancel: () => void;
  submitting?: boolean;
}

const ResourceDataForm: React.FC<ResourceDataFormProps> = ({ mode, defaultValues, parentResource, onSubmit, onCancel, submitting }) => {
  const [values, setValues] = useState<ResourceFormValues>({
    name: "",
    key: "",
    code: "",
    icon: "",
    path: "",
    type: AdminResourceType.GENERAL,
    is_visible: true,
    description: "",
    remark: "",
    pid: undefined,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (defaultValues) {
      setValues({
        id: defaultValues.id,
        name: defaultValues.name || "",
        key: defaultValues.key || "",
        code: defaultValues.code || "",
        icon: defaultValues.icon || "",
        path: defaultValues.path || "",
        type: defaultValues.type ?? AdminResourceType.GENERAL,
        is_visible: defaultValues.is_visible ?? true,
        description: defaultValues.description || "",
        remark: defaultValues.remark || "",
        pid: defaultValues.pid ?? undefined,
      });
    } else if (parentResource) {
      // 新增子資源時，自動設置父資源 ID
      setValues((prev) => ({
        ...prev,
        pid: parentResource.id,
      }));
    }
  }, [defaultValues, parentResource]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!values.name.trim()) {
      newErrors.name = "資源名稱不能為空";
    }

    if (!values.key.trim()) {
      newErrors.key = "資源 Key 不能為空";
    } else if (!/^[a-zA-Z0-9_]+$/.test(values.key)) {
      newErrors.key = "資源 Key 只能包含字母、數字和下劃線";
    }

    if (!values.code.trim()) {
      newErrors.code = "資源代碼不能為空";
    } else {
      const rootPattern = /^[a-zA-Z0-9_]+$/; // 根資源：僅 resource（無冒號）
      const childPattern = /^[a-zA-Z0-9_]+:[a-zA-Z0-9_]+$/; // 子資源：{resource}:{subResource}

      if (values.pid) {
        // 子資源必須包含冒號
        if (!childPattern.test(values.code)) {
          newErrors.code = "子資源代碼格式需為 {resource}:{subResource}，例如 user:create";
        }
      } else {
        // 根資源不得包含冒號
        if (!rootPattern.test(values.code)) {
          newErrors.code = "根資源代碼不得包含冒號，格式為 {resource}，例如 user";
        }
      }
    }

    if (!values.path?.trim()) {
      newErrors.path = "資源路徑不能為空";
    }

    if (!values.icon?.trim()) {
      newErrors.icon = "資源圖示不能為空";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && isIconValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const submitValues: ResourceFormValues = {
        ...values,
        // 若沒有父資源，避免傳空字串
        pid: values.pid ? values.pid : undefined,
      };
      await onSubmit(submitValues);
    }
  };

  // 使用圖示解析器
  const iconResult = useIconResolver(values.icon, {
    library: "md",
    className: "size-5",
  });

  const { icon: dynamicIcon, error: iconError, isValid: isIconValid } = iconResult;

  const handleChange = (field: keyof ResourceFormValues, value: string | number | boolean | undefined) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    // 清除該字段的錯誤
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 父資源提示（置頂） */}
      {parentResource && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                正在為 <strong className="font-medium">{parentResource.name}</strong> 新增子資源
              </p>
            </div>
          </div>
        </div>
      )}
      {/* 基本資訊 Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">資源資訊</h3>

        {/* 基本資訊 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              名稱 <span className="text-red-500">*</span>
            </label>
            <Input
              id="name"
              type="text"
              value={values.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="請輸入資源名稱"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Key <span className="text-red-500">*</span>
            </label>
            <Input
              id="key"
              type="text"
              value={values.key}
              onChange={(e) => handleChange("key", e.target.value)}
              placeholder="請輸入資源 Key"
              className={errors.key ? "border-red-500" : ""}
            />
            {errors.key && <p className="text-red-500 text-sm mt-1">{errors.key}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              代碼 <span className="text-red-500">*</span>
            </label>
            <Input
              id="code"
              type="text"
              value={values.code}
              onChange={(e) => handleChange("code", e.target.value)}
              placeholder="請輸入資源代碼"
              className={errors.code ? "border-red-500" : ""}
            />
            {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              路徑 <span className="text-red-500">*</span>
            </label>
            <Input
              id="path"
              type="text"
              value={values.path}
              onChange={(e) => handleChange("path", e.target.value)}
              placeholder="請輸入資源路徑"
              className={errors.path ? "border-red-500" : ""}
            />
            {errors.path && <p className="text-red-500 text-sm mt-1">{errors.path}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              類型 <span className="text-red-500">*</span>
            </label>
            <Select
              options={[
                { value: AdminResourceType.GENERAL, label: "業務功能 (GENERAL)" },
                { value: AdminResourceType.SYSTEM, label: "系統功能 (SYSTEM)" },
              ]}
              value={values.type}
              onChange={(value) => handleChange("type", Number(value))}
              placeholder="請選擇類型"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              圖示 <span className="text-red-500">*</span>
            </label>
            <IconInput
              id="icon"
              type="text"
              value={values.icon}
              onChange={(e) => handleChange("icon", e.target.value)}
              placeholder={`請輸入圖示名稱 (如: ${getCommonIconNames("md").slice(0, 3).join(", ")})`}
              icon={dynamicIcon}
              iconPosition="left"
              error={!!errors.icon || !isIconValid}
              hint={iconError || `輸入 Material Design 圖示名稱，如: ${getCommonIconNames("md").slice(0, 5).join(", ")}`}
            />
            {errors.icon && <p className="text-red-500 text-sm mt-1">{errors.icon}</p>}
            {iconError && <p className="text-red-500 text-sm mt-1">{iconError}</p>}
          </div>
        </div>

        {/* 狀態資訊 */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">狀態</div>
          <div className="flex items-center">
            <Checkbox
              id="is_visible"
              checked={!!values.is_visible}
              onChange={(checked) => handleChange("is_visible", checked)}
              label="資源可見"
            />
          </div>
        </div>
      </div>

      {/* 備註 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">備註</label>
        <Input
          id="remark"
          type="text"
          value={values.remark}
          onChange={(e) => handleChange("remark", e.target.value)}
          placeholder="請輸入備註"
        />
      </div>

      {/* 描述 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">描述</label>
        <TextArea
          id="description"
          value={values.description}
          onChange={(value) => handleChange("description", value)}
          placeholder="請輸入資源描述"
          rows={3}
        />
      </div>

      {/* 按鈕 */}
      <div className="flex justify-end space-x-3 pt-4">
        <Button btnType="button" variant="outline" onClick={onCancel} disabled={submitting}>
          取消
        </Button>
        <Button btnType="submit" variant="primary" disabled={submitting}>
          {submitting ? "儲存中..." : mode === "create" ? "新增" : "更新"}
        </Button>
      </div>
    </form>
  );
};

export default ResourceDataForm;

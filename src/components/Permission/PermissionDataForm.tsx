import { resourceService, type ResourceMenuItem } from "@/api/services/resourceService";
import { verbService, type VerbItem } from "@/api/services/verbService";
import { resolveIcon } from "@/utils/icon-resolver";
import { useEffect, useState } from "react";
import Button from "../ui/button";
import Checkbox from "../ui/checkbox";
import ComboBox from "../ui/combobox";
import Input from "../ui/input";
import { Select } from "../ui/select";
import TextArea from "../ui/textarea";

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
  const [resources, setResources] = useState<ResourceMenuItem[]>([]);
  const [verbs, setVerbs] = useState<VerbItem[]>([]);
  const [loading, setLoading] = useState(false);

  // 載入資源和動詞清單
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [rr, vr] = await Promise.all([resourceService.getResources(false), verbService.list()]);
        if (rr.success) {
          setResources(rr.data.items || []);
        }
        if (vr.success) {
          setVerbs(vr.data.items || []);
        }
      } catch (e) {
        console.error("Error loading resources/verbs:", e);
      } finally {
        setLoading(false);
      }
    };
    void loadData();
  }, []);

  // 更新表單值
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
          <Input
            id="displayName"
            label="顯示名稱"
            type="text"
            placeholder="請輸入顯示名稱"
            value={values.displayName}
            onChange={(e) => setValues((v) => ({ ...v, displayName: e.target.value }))}
            error={errors.displayName}
            hint="例如：建立使用者"
            required
            clearable
          />
        </div>

        <div>
          <Input
            id="code"
            label="代碼"
            type="text"
            placeholder="請輸入代碼"
            value={values.code}
            onChange={(e) => setValues((v) => ({ ...v, code: e.target.value }))}
            error={errors.code}
            hint="例如：user:create"
            required
            clearable
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <ComboBox<string>
            id="resourceId"
            label="資源"
            options={
              loading
                ? []
                : resources
                    .filter((r) => r.pid != null)
                    .map((r) => ({
                      value: r.id,
                      label: r.name,
                      icon: r.icon ? resolveIcon(r.icon, { className: "size-4" }).icon : undefined,
                    }))
            }
            value={values.resourceId || null}
            onChange={(value) => setValues((v) => ({ ...v, resourceId: value || "" }))}
            placeholder={loading ? "載入中..." : "請選擇或搜尋資源"}
            disabled={loading}
            error={errors.resourceId}
            required
            clearable
          />
        </div>

        <div>
          <Select
            id="verbId"
            label="動作"
            options={
              loading
                ? [{ value: "", label: "載入中..." }]
                : [
                    { value: null, label: "請選擇動作", disabled: true },
                    ...verbs.map((v) => ({
                      value: v.id,
                      label: v.displayName || v.action,
                    })),
                  ]
            }
            value={values.verbId}
            onChange={(value) => setValues((v) => ({ ...v, verbId: value as string }))}
            error={errors.verbId}
            placeholder="請選擇動作"
            disabled={loading}
            required
            clearable
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">狀態設定</label>
          <div className="space-y-2">
            <Checkbox checked={values.isActive} onChange={(checked) => setValues((v) => ({ ...v, isActive: checked }))} label="啟用" />
          </div>
        </div>
      </div>

      <div>
        <TextArea
          id="description"
          label="描述"
          rows={3}
          placeholder="權限描述"
          value={values.description || ""}
          onChange={(value) => setValues((v) => ({ ...v, description: value }))}
          error={!!errors.description}
          hint={errors.description || ""}
        />
      </div>

      <div>
        <TextArea
          id="remark"
          label="備註"
          rows={3}
          placeholder="備註資訊"
          value={values.remark || ""}
          onChange={(value) => setValues((v) => ({ ...v, remark: value }))}
          error={!!errors.remark}
          hint={errors.remark || ""}
        />
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

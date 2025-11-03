import Checkbox from "@/components/ui/checkbox";
import Input from "@/components/ui/input";
import Label from "@/components/ui/label";
import TextArea from "@/components/ui/textarea";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import RolePermissionMatrix from "./RolePermissionMatrix";

export interface RoleFormValues {
  code: string;
  name?: string;
  isActive?: boolean;
  description?: string;
  remark?: string;
  permissions?: string[];
}

export interface RoleDataFormHandle {
  validate: () => boolean;
  getValues: () => RoleFormValues;
}

const RoleDataForm = forwardRef<
  RoleDataFormHandle,
  {
    mode: "create" | "edit";
    defaultValues?: Partial<RoleFormValues> | null;
  }
>(function RoleDataForm({ mode, defaultValues }, ref) {
  const [code, setCode] = useState<string>(defaultValues?.code || "");
  const [name, setName] = useState<string>(defaultValues?.name || "");
  const [isActive, setIsActive] = useState<boolean>(defaultValues?.isActive ?? true);
  const [description, setDescription] = useState<string>(defaultValues?.description || "");
  const [remark, setRemark] = useState<string>(defaultValues?.remark || "");
  const [permissions, setPermissions] = useState<string[]>(defaultValues?.permissions ? defaultValues.permissions : []);
  const [errors, setErrors] = useState<{ code?: string; name?: string; permissions?: string }>({});

  useEffect(() => {
    setCode(defaultValues?.code || "");
    setName(defaultValues?.name || "");
    setIsActive(defaultValues?.isActive ?? true);
    setDescription(defaultValues?.description || "");
    setRemark(defaultValues?.remark || "");
    setPermissions(defaultValues?.permissions || []);
  }, [defaultValues]);

  const validate = (): boolean => {
    const nextErrors: { code?: string; name?: string; permissions?: string } = {};
    if (!code || code.trim() === "") nextErrors.code = "請輸入代碼";
    if (!name || name.trim() === "") nextErrors.name = "請輸入名稱";
    if (!permissions || permissions.length === 0) nextErrors.permissions = "請選擇權限";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const getValues = (): RoleFormValues => {
    return {
      code: code.trim(),
      name,
      isActive,
      description,
      remark,
      permissions,
    };
  };

  useImperativeHandle(ref, () => ({
    validate,
    getValues,
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input
            id="code"
            label="代碼"
            type="text"
            placeholder="請輸入代碼"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={mode === "edit"}
            error={errors.code ?? undefined}
            hint="例如：content_manager"
            required
            clearable
          />
        </div>
        <div>
          <Input
            id="name"
            label="名稱"
            type="text"
            placeholder="請輸入名稱"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name ?? undefined}
            hint="例如：內容管理員"
            required
            clearable
          />
        </div>
      </div>

      <div>
        <Checkbox id="isActive" label="啟用" checked={isActive} onChange={setIsActive} />
      </div>

      <div>
        <TextArea id="description" label="描述" rows={3} value={description} onChange={setDescription} />
      </div>

      <div>
        <TextArea id="remark" label="備註" rows={2} value={remark} onChange={setRemark} />
      </div>

      <div>
        <Label>
          權限 <span className="text-red-500">*</span>
        </Label>
        {errors.permissions && <p className="mt-1.5 text-xs text-error-500 dark:text-error-400">{errors.permissions}</p>}
        <RolePermissionMatrix
          value={permissions}
          onChange={setPermissions}
          className={
            errors.permissions
              ? "border rounded-lg border-error-500 focus:border-error-300 focus:ring-error-500/20 dark:text-error-400 dark:border-error-500 dark:focus:border-error-800"
              : ""
          }
        />
      </div>
    </div>
  );
});

export default RoleDataForm;

import { Gender } from "@/const/enums";
import { useEffect, useState } from "react";
import Button from "../ui/button";
import Input from "../ui/input";
import { Select } from "../ui/select";
import TextArea from "../ui/textarea";

export interface DemoFormValues {
  id?: string;
  name: string;
  remark?: string;
  age?: number;
  gender?: Gender;
}

interface DemoDataFormProps {
  mode: "create" | "edit";
  defaultValues?: DemoFormValues | null;
  onSubmit: (values: DemoFormValues) => Promise<void> | void;
  onCancel: () => void;
  submitting?: boolean;
}

const DemoDataForm: React.FC<DemoDataFormProps> = ({ mode, defaultValues, onSubmit, onCancel, submitting }) => {
  const [values, setValues] = useState<DemoFormValues>({ name: "", remark: "", age: undefined, gender: Gender.Unknown });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (defaultValues) {
      setValues({
        id: defaultValues.id,
        name: defaultValues.name || "",
        remark: defaultValues.remark || "",
        age: defaultValues.age,
        gender: defaultValues.gender ?? Gender.Unknown,
      });
    } else {
      setValues({ name: "", remark: "", age: undefined, gender: Gender.Unknown });
    }
  }, [defaultValues]);

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!values.name || values.name.trim().length === 0) next.name = "請輸入名稱";
    if (values.age !== undefined && (values.age < 0 || values.age > 150)) next.age = "年齡需介於 0-150";
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
      <div>
        <Input
          id="demo-name"
          label="名稱"
          type="text"
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
          error={errors.name}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Input
            id="demo-age"
            type="number"
            value={values.age ?? ""}
            label="年齡"
            onChange={(e) => setValues((v) => ({ ...v, age: e.target.value === "" ? undefined : Number(e.target.value) }))}
            error={errors.age}
          />
        </div>
        <div>
          <Select
            id="demo-gender"
            label="性別"
            options={[
              { value: Gender.Unknown, label: "未知" },
              { value: Gender.Male, label: "男性" },
              { value: Gender.Female, label: "女性" },
            ]}
            value={values.gender ?? Gender.Unknown}
            onChange={(value) => setValues((v) => ({ ...v, gender: Number(value) as Gender }))}
            placeholder="請選擇性別"
          />
        </div>
      </div>

      <div>
        <TextArea id="demo-remark" rows={3} label="備註" value={values.remark || ""} onChange={(value) => setValues((v) => ({ ...v, remark: value }))} />
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

export default DemoDataForm;

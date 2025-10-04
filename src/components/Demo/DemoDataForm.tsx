import { Gender } from "@/const/enums";
import { useEffect, useState } from "react";
import Button from "../ui/button/Button";

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
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">名稱</label>
        <input
          type="text"
          className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
        />
        {errors.name && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.name}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">年齡</label>
          <input
            type="number"
            className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
            value={values.age ?? ""}
            onChange={(e) => setValues((v) => ({ ...v, age: e.target.value === "" ? undefined : Number(e.target.value) }))}
          />
          {errors.age && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.age}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">性別</label>
          <select
            className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            value={values.gender ?? Gender.Unknown}
            onChange={(e) => setValues((v) => ({ ...v, gender: Number(e.target.value) as Gender }))}
          >
            <option value={Gender.Unknown}>未知</option>
            <option value={Gender.Male}>男性</option>
            <option value={Gender.Female}>女性</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">備註</label>
        <textarea
          className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
          rows={3}
          value={values.remark || ""}
          onChange={(e) => setValues((v) => ({ ...v, remark: e.target.value }))}
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

export default DemoDataForm;

import { faqCategoryService, type FaqCategoryBase } from "@/api/services/faqService";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import TextArea from "@/components/ui/textarea";
import { useEffect, useState } from "react";

export interface FaqFormValues {
  id?: string;
  categoryId: string;
  question: string;
  answer: string;
  relatedLink?: string;
  remark?: string;
  description?: string;
}

interface FaqDataFormProps {
  mode: "create" | "edit";
  defaultValues?: FaqFormValues | null;
  onSubmit: (values: FaqFormValues) => Promise<void> | void;
  onCancel: () => void;
  submitting?: boolean;
}

const FaqDataForm: React.FC<FaqDataFormProps> = ({ mode, defaultValues, onSubmit, onCancel, submitting }) => {
  const [values, setValues] = useState<FaqFormValues>({
    categoryId: "",
    question: "",
    answer: "",
    relatedLink: "",
    remark: "",
    description: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<FaqCategoryBase[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await faqCategoryService.getList();
        setCategories(response.data.categories || []);
      } catch (e) {
        console.error("Error fetching categories:", e);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (defaultValues) {
      setValues({
        id: defaultValues.id,
        categoryId: defaultValues.categoryId || "",
        question: defaultValues.question || "",
        answer: defaultValues.answer || "",
        relatedLink: defaultValues.relatedLink || "",
        remark: defaultValues.remark || "",
        description: defaultValues.description || "",
      });
    } else {
      setValues({
        categoryId: "",
        question: "",
        answer: "",
        relatedLink: "",
        remark: "",
        description: "",
      });
    }
  }, [defaultValues]);

  const validate = (): boolean => {
    const next: Record<string, string> = {};

    if (!values.categoryId || values.categoryId.trim().length === 0) {
      next.categoryId = "請選擇分類";
    }

    if (!values.question || values.question.trim().length === 0) {
      next.question = "請輸入問題";
    } else if (values.question.length > 255) {
      next.question = "問題不能超過 255 個字符";
    }

    if (!values.answer || values.answer.trim().length === 0) {
      next.answer = "請輸入答案";
    }

    if (values.relatedLink && values.relatedLink.trim().length > 0) {
      try {
        new URL(values.relatedLink);
      } catch {
        next.relatedLink = "請輸入有效的 URL 格式";
      }
    }

    if (values.remark && values.remark.length > 256) {
      next.remark = "備註不能超過 256 個字符";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(values);
  };

  const categoryOptions = categories.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Select
          id="categoryId"
          label="分類"
          placeholder="請選擇分類"
          options={categoryOptions}
          value={values.categoryId}
          onChange={(value) => setValues((v) => ({ ...v, categoryId: typeof value === "string" ? value : Array.isArray(value) ? String(value[0] || "") : String(value || "") }))}
          error={errors.categoryId || undefined}
          required
          disabled={loadingCategories}
        />
        {errors.categoryId && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.categoryId}</p>}
      </div>

      <div>
        <TextArea
          id="question"
          label="問題"
          rows={3}
          placeholder="請輸入問題"
          value={values.question}
          onChange={(value) => setValues((v) => ({ ...v, question: value }))}
          error={errors.question || undefined}
          required
        />
        {errors.question && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.question}</p>}
      </div>

      <div>
        <TextArea
          id="answer"
          label="答案"
          rows={5}
          placeholder="請輸入答案"
          value={values.answer}
          onChange={(value) => setValues((v) => ({ ...v, answer: value }))}
          error={errors.answer || undefined}
          required
        />
        {errors.answer && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.answer}</p>}
      </div>

      <div>
        <Input
          id="relatedLink"
          label="相關連結"
          type="text"
          placeholder="https://example.com"
          value={values.relatedLink || ""}
          onChange={(e) => setValues((v) => ({ ...v, relatedLink: e.target.value }))}
          error={errors.relatedLink || undefined}
          hint="例如: https://example.com"
        />
        {errors.relatedLink && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.relatedLink}</p>}
      </div>

      <div>
        <TextArea
          id="description"
          label="描述"
          rows={3}
          placeholder="請輸入描述"
          value={values.description || ""}
          onChange={(value) => setValues((v) => ({ ...v, description: value }))}
        />
      </div>

      <div>
        <TextArea
          id="remark"
          label="備註"
          rows={3}
          placeholder="請輸入備註"
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

export default FaqDataForm;


import { workshopRegistrationService, workshopService, userService } from "@/api/services/workshopRegistrationService";
import Button from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useEffect, useState } from "react";

export interface WorkshopRegistrationFormValues {
  id?: string;
  workshopId?: string;
  userId?: string;
}

interface WorkshopRegistrationDataFormProps {
  mode: "create" | "edit";
  defaultValues?: WorkshopRegistrationFormValues | null;
  onSubmit: (values: WorkshopRegistrationFormValues) => Promise<void> | void;
  onCancel: () => void;
  submitting?: boolean;
}

const WorkshopRegistrationDataForm: React.FC<WorkshopRegistrationDataFormProps> = ({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
  submitting,
}) => {
  const [values, setValues] = useState<WorkshopRegistrationFormValues>({
    workshopId: undefined,
    userId: undefined,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [workshops, setWorkshops] = useState<Array<{ id: string; title: string }>>([]);
  const [users, setUsers] = useState<Array<{ id: string; email?: string; displayName?: string }>>([]);
  const [loadingWorkshops, setLoadingWorkshops] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // 載入工作坊列表
  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        setLoadingWorkshops(true);
        const response = await workshopService.getPages({
          page: 0,
          page_size: 1000, // 獲取所有工作坊
          is_active: true,
          deleted: false,
        });
        const workshopItems = response.data.items || [];
        setWorkshops(
          workshopItems.map((item) => ({
            id: item.id,
            title: item.title,
          }))
        );
      } catch (e) {
        console.error("Error fetching workshops:", e);
      } finally {
        setLoadingWorkshops(false);
      }
    };

    fetchWorkshops();
  }, []);

  // 載入用戶列表
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const response = await userService.getPages({
          page: 0,
          pageSize: 1000, // 獲取所有用戶
          deleted: false,
        });
        const userItems = response.data.items || [];
        setUsers(
          userItems.map((item) => ({
            id: item.id,
            email: item.email,
            displayName: item.display_name,
          }))
        );
      } catch (e) {
        console.error("Error fetching users:", e);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (defaultValues) {
      setValues(defaultValues);
    } else {
      setValues({
        workshopId: undefined,
        userId: undefined,
      });
    }
    setErrors({});
  }, [defaultValues]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!values.workshopId) {
      newErrors.workshopId = "請選擇工作坊";
    }

    if (!values.userId) {
      newErrors.userId = "請選擇用戶";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    await onSubmit(values);
  };

  const workshopOptions = workshops.map((workshop) => ({
    value: workshop.id,
    label: workshop.title,
  }));

  const userOptions = users.map((user) => {
    const label = user.displayName || user.email || user.id;
    return {
      value: user.id,
      label: label,
    };
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Select
          id="workshopId"
          label="工作坊"
          options={workshopOptions}
          value={values.workshopId || ""}
          onChange={(value) => setValues((v) => ({ ...v, workshopId: value ? String(value) : undefined }))}
          placeholder="請選擇工作坊"
          error={errors.workshopId || undefined}
          clearable
          disabled={loadingWorkshops}
          required
        />
      </div>

      <div>
        <Select
          id="userId"
          label="用戶"
          options={userOptions}
          value={values.userId || ""}
          onChange={(value) => setValues((v) => ({ ...v, userId: value ? String(value) : undefined }))}
          placeholder="請選擇用戶"
          error={errors.userId || undefined}
          clearable
          disabled={loadingUsers}
          required
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          取消
        </Button>
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? "儲存中..." : "儲存"}
        </Button>
      </div>
    </form>
  );
};

export default WorkshopRegistrationDataForm;


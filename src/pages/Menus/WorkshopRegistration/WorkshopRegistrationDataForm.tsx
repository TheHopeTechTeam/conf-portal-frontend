import { userService, workshopService } from "@/api/services/workshopRegistrationService";
import Button from "@/components/ui/button";
import { ComboBox, type ComboBoxOption } from "@/components/ui/combobox";
import { Select } from "@/components/ui/select";
import { useCallback, useEffect, useRef, useState } from "react";

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
  mode: _mode,
  defaultValues,
  onSubmit,
  onCancel,
  submitting,
}) => {
  void _mode; // mode is not used currently but kept for future use
  const [values, setValues] = useState<WorkshopRegistrationFormValues>({
    workshopId: undefined,
    userId: undefined,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [workshops, setWorkshops] = useState<Array<{ id: string; title: string }>>([]);
  const [userOptions, setUserOptions] = useState<ComboBoxOption<string>[]>([]);
  const [loadingWorkshops, setLoadingWorkshops] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const userSearchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // 將 API 回傳的用戶轉為 ComboBox 選項（支援 camelCase 與 snake_case）
  const userToOption = useCallback(
    (
      item: {
        id: string;
        displayName?: string;
        display_name?: string;
        email?: string;
        phoneNumber?: string;
        phone_number?: string;
      }
    ) => {
      const name = item.displayName ?? item.display_name;
      const email = item.email;
      const phone = item.phoneNumber ?? item.phone_number;
      const label = name || email || phone || item.id;
      if (name) {
        return { value: item.id, label: `${name} (${email || phone || ""})` };
      }
      return { value: item.id, label };
    },
    []
  );

  const USER_SEARCH_DEBOUNCE_MS = 300;

  // 根據關鍵字搜尋用戶列表
  const searchUsers = useCallback(async (keyword: string) => {
    try {
      setLoadingUsers(true);
      const response = await userService.getList({
        keyword: keyword.trim() || undefined,
      });
      const userItems = response.data.items || [];
      setUserOptions(userItems.map(userToOption));
    } catch (e) {
      console.error("Error fetching users:", e);
      setUserOptions([]);
    } finally {
      setLoadingUsers(false);
    }
  }, [userToOption]);

  // 初次打開或關鍵字變化時拉取用戶列表（debounce）
  const handleUserQueryChange = useCallback(
    (query: string) => {
      if (userSearchDebounceRef.current) clearTimeout(userSearchDebounceRef.current);
      userSearchDebounceRef.current = setTimeout(() => {
        searchUsers(query);
        userSearchDebounceRef.current = null;
      }, USER_SEARCH_DEBOUNCE_MS);
    },
    [searchUsers]
  );

  useEffect(() => {
    return () => {
      if (userSearchDebounceRef.current) clearTimeout(userSearchDebounceRef.current);
    };
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

  // 當已選用戶不在 userOptions 時（例如 edit 模式載入 defaultValues），取得該用戶並加入選項以正確顯示
  useEffect(() => {
    const userId = values.userId;
    if (!userId) return;
    const exists = userOptions.some((opt) => opt.value === userId);
    if (exists) return;

    const fetchAndAddSelectedUser = async () => {
      try {
        const res = await userService.getById(userId);
        const data = res.data as { id: string; displayName?: string; display_name?: string; email?: string; phoneNumber?: string; phone_number?: string };
        const option = userToOption(data);
        setUserOptions((prev) => [option, ...prev.filter((o) => o.value !== userId)]);
      } catch {
        setUserOptions((prev) => [{ value: userId, label: userId }, ...prev.filter((o) => o.value !== userId)]);
      }
    };

    fetchAndAddSelectedUser();
  }, [values.userId, userOptions, userToOption]);

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

  // 禁用本地過濾（因為已經通過 API 過濾）
  const userFilterFunction = useCallback((_option: ComboBoxOption<string>, _query: string) => {
    void _option;
    void _query;
    // 返回 true 以顯示所有選項（因為已經通過 API 過濾）
    return true;
  }, []);

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
        <ComboBox
          id="userId"
          label="用戶"
          options={userOptions}
          value={values.userId || null}
          onChange={(value) => setValues((v) => ({ ...v, userId: value ? String(value) : undefined }))}
          placeholder="搜尋用戶（姓名、Email、電話）"
          error={errors.userId || undefined}
          clearable
          disabled={submitting}
          required
          filterFunction={userFilterFunction}
          onOpen={() => searchUsers("")}
          onQueryChange={handleUserQueryChange}
          loading={loadingUsers}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button btnType="button" variant="outline" onClick={onCancel} disabled={submitting}>
          取消
        </Button>
        <Button btnType="submit" variant="primary" disabled={submitting}>
          {submitting ? "儲存中..." : "儲存"}
        </Button>
      </div>
    </form>
  );
};

export default WorkshopRegistrationDataForm;

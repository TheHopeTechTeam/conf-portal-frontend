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
  const userSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSearchKeywordRef = useRef<string>("");
  const userComboBoxInputRef = useRef<HTMLInputElement>(null);
  const wasInputFocusedRef = useRef<boolean>(false);

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

  // 根據關鍵字搜尋用戶列表
  const searchUsers = useCallback(async (keyword: string) => {
    const trimmedKeyword = keyword.trim();

    // 立即更新 lastSearchKeywordRef，避免在 API 調用期間重複觸發
    // 注意：重複檢查已經在 handleUserQueryChange 中做過了
    lastSearchKeywordRef.current = trimmedKeyword;

    try {
      setLoadingUsers(true);
      const response = await userService.getList({
        keyword: trimmedKeyword || undefined,
      });
      const userItems = response.data.items || [];
      const options: ComboBoxOption<string>[] = userItems.map((item) => {
        let label = item.displayName || item.email || item.phoneNumber || item.id;
        if (item.displayName) {
          label = `${item.displayName} (${item.email || item.phoneNumber})`;
        }
        return {
          value: item.id,
          label: label,
        };
      });
      setUserOptions(options);
    } catch (e) {
      console.error("Error fetching users:", e);
      setUserOptions([]);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  // 初始載入用戶列表（無關鍵字）
  useEffect(() => {
    searchUsers("");
  }, [searchUsers]);

  // 當 userOptions 更新後，如果之前 input 有焦點，則恢復焦點
  useEffect(() => {
    if (wasInputFocusedRef.current && userComboBoxInputRef.current) {
      // 使用 requestAnimationFrame 確保在 DOM 更新後執行
      requestAnimationFrame(() => {
        if (userComboBoxInputRef.current && document.activeElement !== userComboBoxInputRef.current) {
          userComboBoxInputRef.current.focus();
        }
      });
    }
  }, [userOptions]);

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

  // 處理 input 獲得焦點
  const handleUserInputFocus = useCallback(() => {
    wasInputFocusedRef.current = true;
  }, []);

  // 處理 input 失去焦點
  const handleUserInputBlur = useCallback(() => {
    wasInputFocusedRef.current = false;
    // 清除之前的 timeout
    if (userSearchTimeoutRef.current) {
      clearTimeout(userSearchTimeoutRef.current);
      userSearchTimeoutRef.current = null;
    }
    // 重置 lastSearchKeywordRef，以便下次可以重新搜尋
    lastSearchKeywordRef.current = "";
    // 重新獲取沒有 keyword 的 API
    searchUsers("").catch((error) => {
      console.error("Error in searchUsers:", error);
    });
  }, [searchUsers]);

  // 處理 ComboBox 的 query 變化，觸發 API 搜尋（使用防抖）
  const handleUserQueryChange = useCallback(
    (query: string) => {
      // 清除之前的 timeout
      if (userSearchTimeoutRef.current) {
        clearTimeout(userSearchTimeoutRef.current);
        userSearchTimeoutRef.current = null;
      }

      const trimmedQuery = query.trim();
      // 如果關鍵字與上次相同，不重複搜尋
      if (trimmedQuery === lastSearchKeywordRef.current) {
        return;
      }

      // 設置新的 timeout，300ms 後執行搜尋
      userSearchTimeoutRef.current = setTimeout(() => {
        // 在執行 API 前再次檢查焦點狀態
        wasInputFocusedRef.current = document.activeElement === userComboBoxInputRef.current;
        // 注意：不要在 timeout 中更新 lastSearchKeywordRef，讓 searchUsers 來更新
        searchUsers(trimmedQuery).catch((error) => {
          console.error("Error in searchUsers:", error);
        });
      }, 300);
    },
    [searchUsers]
  );

  // 自定義過濾函數，禁用本地過濾（因為已經通過 API 過濾）
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
          placeholder="請輸入關鍵字搜尋用戶..."
          error={errors.userId || undefined}
          clearable
          disabled={loadingUsers || submitting}
          required
          filterFunction={userFilterFunction}
          onQueryChange={handleUserQueryChange}
          onFocus={handleUserInputFocus}
          onBlur={handleUserInputBlur}
          inputRef={userComboBoxInputRef}
          displayValue={(option) => {
            if (!option) return "";
            return option.label;
          }}
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

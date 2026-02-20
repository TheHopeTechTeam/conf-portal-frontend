import { userService, type UserUpdate } from "@/api/services/userService";
import Button from "@/components/ui/button";
import Checkbox from "@/components/ui/checkbox";
import Input from "@/components/ui/input";
import { Select } from "@/components/ui/select/Select";
import TextArea from "@/components/ui/textarea";
import { Gender } from "@/const/enums";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

interface UserDetailData {
  id: string;
  phone_number: string;
  email: string;
  verified: boolean;
  is_active: boolean;
  is_superuser: boolean;
  is_admin: boolean;
  last_login_at?: string;
  display_name?: string;
  gender?: Gender;
  is_ministry: boolean;
  created_at?: string;
  updated_at?: string;
  remark?: string;
}

interface UserProfileDetailViewProps {
  isEditing: boolean;
  onEditChange?: (editing: boolean) => void;
}

const UserProfileDetailView: React.FC<UserProfileDetailViewProps> = ({ isEditing, onEditChange }) => {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserDetailData | null>(null);
  const [formData, setFormData] = useState<UserUpdate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await userService.getCurrentUser();
        if (response.success && response.data) {
          setUserData(response.data);
          // 初始化表單數據
          setFormData({
            phone_number: response.data.phone_number,
            email: response.data.email,
            display_name: response.data.display_name || "",
            gender: response.data.gender ?? Gender.Unknown,
            remark: response.data.remark || "",
          });
        } else {
          setError("載入用戶詳情失敗");
        }
      } catch (e) {
        console.error("Error fetching user detail:", e);
        setError("載入用戶詳情失敗");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetail();
  }, []);

  // 當取消編輯時，重置表單數據
  useEffect(() => {
    if (!isEditing && userData) {
      setFormData({
        phone_number: userData.phone_number,
        email: userData.email,
        display_name: userData.display_name || "",
        gender: userData.gender ?? Gender.Unknown,
        remark: userData.remark || "",
      });
      setError(null);
    }
  }, [isEditing, userData]);

  const handleSave = async () => {
    if (!user?.id || !formData) {
      setError("無法獲取用戶資訊");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await userService.updateCurrentUser(formData);
      // 重新載入數據
      const response = await userService.getCurrentUser();
      if (response.success && response.data) {
        setUserData(response.data);
        onEditChange?.(false);
      }
    } catch (e) {
      console.error("Error updating user:", e);
      setError("更新失敗，請稍後再試");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (userData) {
      setFormData({
        phone_number: userData.phone_number,
        email: userData.email,
        display_name: userData.display_name || "",
        gender: userData.gender ?? Gender.Unknown,
        remark: userData.remark || "",
      });
    }
    setError(null);
    onEditChange?.(false);
  };

  const getGenderText = (gender?: number) => {
    switch (gender) {
      case Gender.Male:
        return "男性";
      case Gender.Female:
        return "女性";
      default:
        return "未知";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500 dark:text-gray-400">載入中...</div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-red-500 dark:text-red-400">{error || "載入失敗"}</div>
      </div>
    );
  }

  if (!formData) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* 基本資訊 */}
      <div className="space-y-6">
        <div>
          <Input
            id="phone_number"
            label="手機號碼"
            type="text"
            value={isEditing ? formData.phone_number : userData.phone_number}
            onChange={(e) => isEditing && setFormData((f) => (f ? { ...f, phone_number: e.target.value } : null))}
            disabled={!isEditing}
          />
        </div>

        <div>
          <Input
            id="email"
            label="電子郵件"
            type="email"
            value={isEditing ? formData.email : userData.email}
            onChange={(e) => isEditing && setFormData((f) => (f ? { ...f, email: e.target.value } : null))}
            disabled={!isEditing}
          />
        </div>

        <div>
          <Input
            id="display_name"
            label="顯示名稱"
            type="text"
            value={isEditing ? formData.display_name || "" : userData.display_name || "未設定"}
            onChange={(e) => isEditing && setFormData((f) => (f ? { ...f, display_name: e.target.value } : null))}
            disabled={!isEditing}
          />
        </div>

        <div>
          {isEditing ? (
            <Select
              id="gender"
              label="性別"
              options={[
                { value: Gender.Unknown, label: "未知" },
                { value: Gender.Male, label: "男性" },
                { value: Gender.Female, label: "女性" },
              ]}
              value={formData.gender ?? Gender.Unknown}
              onChange={(value) => {
                if (typeof value === "number" || typeof value === "string") {
                  setFormData((f) => (f ? { ...f, gender: Number(value) } : null));
                }
              }}
              placeholder="請選擇性別"
            />
          ) : (
            <Input id="gender" label="性別" type="text" value={getGenderText(userData.gender)} disabled />
          )}
        </div>
      </div>

      {/* 狀態資訊 */}
      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">狀態/權限</div>
      <div className="space-y-4">
        <div>
          <Checkbox id="verified" checked={userData.verified} disabled label="已驗證" />
        </div>
        <div>
          <Checkbox id="is_active" checked={userData.is_active} disabled label="啟用狀態" />
        </div>
        <div>
          <Checkbox id="is_admin" checked={userData.is_admin} disabled label="後台管理員" />
        </div>
        <div>
          <Checkbox id="is_superuser" checked={userData.is_superuser} disabled label="超級管理員" />
        </div>
        <div>
          <Checkbox id="is_ministry" checked={userData.is_ministry} disabled label="服事人員" />
        </div>
      </div>

      {/* 備註 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">備註</label>
        <TextArea
          id="remark"
          placeholder=""
          value={isEditing ? formData.remark || "" : userData.remark || ""}
          onChange={(value) => isEditing && setFormData((f) => (f ? { ...f, remark: value } : null))}
          disabled={!isEditing}
          rows={3}
        />
      </div>

      {/* 錯誤訊息 */}
      {error && <div className="p-3 text-sm text-red-800 bg-red-50 rounded-md dark:bg-red-900/20 dark:text-red-400">{error}</div>}

      {/* 儲存和取消按鈕 */}
      {isEditing && (
        <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
          <Button variant="primary" size="md" onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
            {saving ? "儲存中..." : "儲存"}
          </Button>
          <Button variant="outline" size="md" onClick={handleCancel} disabled={saving} className="w-full sm:w-auto">
            取消
          </Button>
        </div>
      )}
    </div>
  );
};

export default UserProfileDetailView;

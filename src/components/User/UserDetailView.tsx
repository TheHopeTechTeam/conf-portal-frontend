import { userService } from "@/api/services/userService";
import Checkbox from "@/components/ui/checkbox";
import Input from "@/components/ui/input";
import TextArea from "@/components/ui/textarea";
import { Gender } from "@/const/enums";
import { DateUtil } from "@/utils/dateUtil";
import { useEffect, useState } from "react";

interface UserDetailViewProps {
  userId: string;
}

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

const UserDetailView: React.FC<UserDetailViewProps> = ({ userId }) => {
  const [userData, setUserData] = useState<UserDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await userService.getById(userId);
        setUserData(response.data);
      } catch (e) {
        console.error("Error fetching user detail:", e);
        setError("載入用戶詳情失敗");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserDetail();
    }
  }, [userId]);

  const getGenderText = (gender?: Gender) => {
    switch (gender) {
      case Gender.Male:
        return "男性";
      case Gender.Female:
        return "女性";
      case Gender.Other:
        return "其他";
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

  return (
    <div className="space-y-6">
      {/* 基本資訊 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">手機號碼</label>
          <Input id="phone_number" type="text" value={userData.phone_number} disabled />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">電子郵件</label>
          <Input id="email" type="email" value={userData.email} disabled />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">顯示名稱</label>
          <Input id="display_name" type="text" value={userData.display_name || "未設定"} disabled />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">性別</label>
          <Input id="gender" type="text" value={getGenderText(userData.gender)} disabled />
        </div>
      </div>

      {/* 狀態資訊 */}
      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">狀態/權限</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      {/* 時間資訊 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">最後登入</label>
          <Input
            id="last_login_at"
            type="text"
            value={userData.last_login_at ? DateUtil.format(userData.last_login_at) : "從未登入"}
            disabled
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">建立時間</label>
          <Input id="created_at" type="text" value={userData.created_at ? DateUtil.format(userData.created_at) : "未知"} disabled />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">更新時間</label>
          <Input id="updated_at" type="text" value={userData.updated_at ? DateUtil.format(userData.updated_at) : "未知"} disabled />
        </div>
      </div>

      {/* 備註 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">備註</label>
        <TextArea id="remark" placeholder="" value={userData.remark || ""} disabled rows={3} />
      </div>
    </div>
  );
};

export default UserDetailView;

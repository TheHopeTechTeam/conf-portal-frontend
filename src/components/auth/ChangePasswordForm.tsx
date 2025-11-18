import { httpClient } from "@/api";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";

export default function ChangePasswordForm() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showNewPasswordConfirm, setShowNewPasswordConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== newPasswordConfirm) {
      setError("兩次輸入的新密碼不一致");
      return;
    }

    if (newPassword.length < 8) {
      setError("新密碼長度至少需要 8 個字元");
      return;
    }

    if (oldPassword === newPassword) {
      setError("新密碼不能與舊密碼相同");
      return;
    }

    if (!user?.id) {
      setError("無法獲取用戶資訊，請重新登入");
      return;
    }

    setIsLoading(true);

    try {
      const response = await httpClient.post<{ message: string }>(`/api/v1/admin/user/${user.id}/change_password`, {
        old_password: oldPassword,
        new_password: newPassword,
        new_password_confirm: newPasswordConfirm,
      });

      if (response.success) {
        setIsSuccess(true);
        // 清空表單
        setOldPassword("");
        setNewPassword("");
        setNewPasswordConfirm("");
        // 3 秒後重置成功狀態並隱藏表單
        setTimeout(() => {
          setIsSuccess(false);
          setShowForm(false);
        }, 3000);
      } else {
        setError(response.message || "修改密碼失敗，請稍後再試");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "修改密碼失敗，請稍後再試";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">修改密碼</h3>
          {!showForm && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setShowForm(true);
                setError(null);
                setIsSuccess(false);
              }}
            >
              修改密碼
            </Button>
          )}
        </div>
        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-5 mt-4">
            <div>
              <Input
                id="oldPassword"
                label="舊密碼"
                type={showOldPassword ? "text" : "password"}
                icon={
                  showOldPassword ? (
                    <MdVisibility className="fill-gray-500 dark:fill-gray-400 size-5" />
                  ) : (
                    <MdVisibilityOff className="fill-gray-500 dark:fill-gray-400 size-5" />
                  )
                }
                iconPosition="right"
                iconClick={() => setShowOldPassword(!showOldPassword)}
                placeholder="請輸入舊密碼"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <Input
                id="newPassword"
                label="新密碼"
                type={showNewPassword ? "text" : "password"}
                icon={
                  showNewPassword ? (
                    <MdVisibility className="fill-gray-500 dark:fill-gray-400 size-5" />
                  ) : (
                    <MdVisibilityOff className="fill-gray-500 dark:fill-gray-400 size-5" />
                  )
                }
                iconPosition="right"
                iconClick={() => setShowNewPassword(!showNewPassword)}
                placeholder="至少 8 個字元"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                min={8}
              />
            </div>

            <div>
              <Input
                id="newPasswordConfirm"
                label="確認新密碼"
                type={showNewPasswordConfirm ? "text" : "password"}
                icon={
                  showNewPasswordConfirm ? (
                    <MdVisibility className="fill-gray-500 dark:fill-gray-400 size-5" />
                  ) : (
                    <MdVisibilityOff className="fill-gray-500 dark:fill-gray-400 size-5" />
                  )
                }
                iconPosition="right"
                iconClick={() => setShowNewPasswordConfirm(!showNewPasswordConfirm)}
                placeholder="再次輸入新密碼"
                value={newPasswordConfirm}
                onChange={(e) => setNewPasswordConfirm(e.target.value)}
                required
                min={8}
              />
            </div>

            {error && <div className="p-3 text-sm text-red-800 bg-red-50 rounded-md dark:bg-red-900/20 dark:text-red-400">{error}</div>}

            {isSuccess && (
              <div className="p-3 text-sm text-green-800 bg-green-50 rounded-md dark:bg-green-900/20 dark:text-green-400">
                密碼修改成功！
              </div>
            )}

            <div className="flex items-center gap-3">
              <Button variant="primary" size="md" btnType="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? "修改中..." : "確認修改"}
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  setShowForm(false);
                  setOldPassword("");
                  setNewPassword("");
                  setNewPasswordConfirm("");
                  setError(null);
                  setIsSuccess(false);
                }}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                取消
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

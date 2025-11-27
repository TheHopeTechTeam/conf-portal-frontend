import { authService } from "@/api/services/authService";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { useEffect, useState } from "react";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import { Link, useNavigate, useSearchParams } from "react-router";

interface PasswordValidationStatus {
  hasLowerCase: boolean;
  hasUpperCase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  hasMinLength: boolean;
}

const validatePasswordStrength = (password: string): { isValid: boolean; message: string } => {
  if (password.length < 8) {
    return { isValid: false, message: "密碼長度至少需要 8 個字元" };
  }

  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: "密碼至少需要包含一個小寫字母" };
  }

  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: "密碼至少需要包含一個大寫字母" };
  }

  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: "密碼至少需要包含一個數字" };
  }

  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return { isValid: false, message: "密碼至少需要包含一個特殊字元 (!@#$%^&* 等)" };
  }

  return { isValid: true, message: "" };
};

const getPasswordValidationStatus = (password: string): PasswordValidationStatus => {
  return {
    hasLowerCase: /[a-z]/.test(password),
    hasUpperCase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
    hasMinLength: password.length >= 8,
  };
};

export default function ResetPasswordForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const passwordValidationStatus = getPasswordValidationStatus(newPassword);

  useEffect(() => {
    if (!token) {
      setError("無效的重置連結，缺少 token 參數");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("無效的重置連結");
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      setError("兩次輸入的密碼不一致");
      return;
    }

    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.message);
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.resetPasswordWithToken(token, newPassword, newPasswordConfirm);
      if (response.success) {
        setIsSuccess(true);
        setTimeout(() => {
          navigate("/signin");
        }, 3000);
      } else {
        setError(response.message || "重置密碼失敗，請稍後再試");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "重置密碼失敗，請稍後再試";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col flex-1 w-full lg:w-1/2">
        <div className="w-full max-w-md pt-10 mx-auto">
          <Link
            to="/signin"
            className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <svg className="stroke-current" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12.7083 5L7.5 10.2083L12.7083 15.4167" stroke="" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to sign in
          </Link>
        </div>
        <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">密碼重置成功</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">您的密碼已成功重置。將在 3 秒後自動跳轉至登入頁面。</p>
          </div>
          <div>
            <Button variant="primary" size="md" className="w-full" onClick={() => navigate("/signin")}>
              立即登入
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 w-full lg:w-1/2">
      <div className="w-full max-w-md pt-10 mx-auto">
        <Link
          to="/signin"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <svg className="stroke-current" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.7083 5L7.5 10.2083L12.7083 15.4167" stroke="" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to sign in
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div className="mb-5 sm:mb-8">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">重置密碼</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{email ? `請為 ${email} 輸入您的新密碼` : "請輸入您的新密碼"}</p>
        </div>
        <div>
          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div>
                <Input
                  id="newPassword"
                  label="新密碼"
                  type={showPassword ? "text" : "password"}
                  icon={
                    showPassword ? (
                      <MdVisibility className="fill-gray-500 dark:fill-gray-400 size-5" />
                    ) : (
                      <MdVisibilityOff className="fill-gray-500 dark:fill-gray-400 size-5" />
                    )
                  }
                  iconPosition="right"
                  iconClick={() => setShowPassword(!showPassword)}
                  placeholder="請輸入符合強度要求的密碼"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                {newPassword && (
                  <div className="mt-2 space-y-1">
                    <div
                      className={`text-xs flex items-center ${
                        passwordValidationStatus.hasMinLength ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      <span className={`mr-2 ${passwordValidationStatus.hasMinLength ? "text-green-600 dark:text-green-400" : ""}`}>
                        {passwordValidationStatus.hasMinLength ? "✓" : "✗"}
                      </span>
                      長度大於 8 個字元
                    </div>
                    <div
                      className={`text-xs flex items-center ${
                        passwordValidationStatus.hasLowerCase ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      <span className={`mr-2 ${passwordValidationStatus.hasLowerCase ? "text-green-600 dark:text-green-400" : ""}`}>
                        {passwordValidationStatus.hasLowerCase ? "✓" : "✗"}
                      </span>
                      至少一個小寫字母
                    </div>
                    <div
                      className={`text-xs flex items-center ${
                        passwordValidationStatus.hasUpperCase ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      <span className={`mr-2 ${passwordValidationStatus.hasUpperCase ? "text-green-600 dark:text-green-400" : ""}`}>
                        {passwordValidationStatus.hasUpperCase ? "✓" : "✗"}
                      </span>
                      至少一個大寫字母
                    </div>
                    <div
                      className={`text-xs flex items-center ${
                        passwordValidationStatus.hasNumber ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      <span className={`mr-2 ${passwordValidationStatus.hasNumber ? "text-green-600 dark:text-green-400" : ""}`}>
                        {passwordValidationStatus.hasNumber ? "✓" : "✗"}
                      </span>
                      至少一個數字
                    </div>
                    <div
                      className={`text-xs flex items-center ${
                        passwordValidationStatus.hasSpecialChar ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      <span className={`mr-2 ${passwordValidationStatus.hasSpecialChar ? "text-green-600 dark:text-green-400" : ""}`}>
                        {passwordValidationStatus.hasSpecialChar ? "✓" : "✗"}
                      </span>
                      至少一個特殊字元 (!@#$%^&* 等)
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Input
                  id="newPasswordConfirm"
                  label="確認新密碼"
                  type={showPasswordConfirm ? "text" : "password"}
                  icon={
                    showPasswordConfirm ? (
                      <MdVisibility className="fill-gray-500 dark:fill-gray-400 size-5" />
                    ) : (
                      <MdVisibilityOff className="fill-gray-500 dark:fill-gray-400 size-5" />
                    )
                  }
                  iconPosition="right"
                  iconClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  placeholder="再次輸入新密碼"
                  value={newPasswordConfirm}
                  onChange={(e) => setNewPasswordConfirm(e.target.value)}
                  required
                  min={8}
                />
              </div>

              {error && <div className="p-3 text-sm text-red-800 bg-red-50 rounded-md dark:bg-red-900/20 dark:text-red-400">{error}</div>}

              <div>
                <Button variant="primary" size="md" className="w-full" btnType="submit" disabled={isLoading || !token}>
                  {isLoading ? "重置中..." : "重置密碼"}
                </Button>
              </div>
            </div>
          </form>
          <div className="mt-5">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
              Remember your password?
              <Link to="/signin" className="text-brand-500 hover:text-brand-600 dark:text-brand-400">
                Click here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

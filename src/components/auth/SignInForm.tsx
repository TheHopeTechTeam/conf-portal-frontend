import Button from "@/components/ui/button";
import Checkbox from "@/components/ui/checkbox";
import Input from "@/components/ui/input";
import { useEffect, useMemo, useState } from "react";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const navigate = useNavigate();
  const { login, isLoading, error, isAuthenticated } = useAuth();

  // 驗證表單是否有效
  const isFormValid = useMemo(() => {
    // 檢查 email 是否為空或符合 email 格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidEmail = email.trim().length > 0 && emailRegex.test(email.trim());

    // 檢查 password 是否不為空
    const isValidPassword = password.trim().length > 0;

    return isValidEmail && isValidPassword;
  }, [email, password]);

  // 如果已經登入，重導向到主頁
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password, rememberMe: isChecked });
      navigate("/");
    } catch (err) {
      // 錯誤會由 Context 狀態顯示
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <div className="flex flex-col items-center mb-6">
              <img src="/images/logo/logo.png" alt="Logo" className="mb-4 w-50 h-50 rounded-2xl" />
              <h1 className="text-gray-600 dark:text-gray-300 font-semibold text-2xl">TheHope Conference Admin Portal</h1>
            </div>
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">Sign In</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Enter your email and password to sign in!</p>
          </div>
          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Input
                    id="email"
                    label="Email"
                    type="email"
                    placeholder="info@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Input
                    id="password"
                    label="Password"
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
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Checkbox checked={isChecked} onChange={setIsChecked} label="Keep me logged in" />
                  <Link to="/forgot-password" className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400">
                    Forgot password?
                  </Link>
                </div>
                {error && <p className="text-sm text-error-500">{error}</p>}
                <div>
                  <Button btnType="submit" className="w-full" size="sm" disabled={isLoading || !isFormValid}>
                    {isLoading ? "Signing in..." : "Sign in"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

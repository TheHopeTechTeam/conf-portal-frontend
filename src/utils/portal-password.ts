/**
 * Portal password rules — keep in sync with conf-portal-api
 * portal/providers/password_provider.py PasswordProvider.validate_password
 */

export const PORTAL_PASSWORD_MIN_LENGTH = 8;

/** Same character class as backend: r"[!@#$%^&*(),.?\":{}|<>_\-\\\[\]/~`+=]" */
export const PORTAL_PASSWORD_SPECIAL_CHAR_RE = /[!@#$%^&*(),.?":{}|<>_\-\\\[\]/~`+=]/;

export const validatePortalPassword = (password: string): string | null => {
  if (password.length < PORTAL_PASSWORD_MIN_LENGTH) {
    return "密碼長度應至少為 8 個字元。";
  }
  if (!/[a-z]/.test(password)) {
    return "請至少包含一個小寫字母。";
  }
  if (!/[A-Z]/.test(password)) {
    return "請至少包含一個大寫字母。";
  }
  if (!/\d/.test(password)) {
    return "請至少包含一個數字。";
  }
  if (!PORTAL_PASSWORD_SPECIAL_CHAR_RE.test(password)) {
    return "請至少包含一個特殊字元 (如 !@#$%^&* 等)。";
  }
  return null;
};

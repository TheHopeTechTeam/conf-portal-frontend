export interface JWTPayload {
  sub: string;
  exp: number;
  aud: string;
  iat: number;
  iss: string;
  user_id: string;
  email: string;
  display_name: string;
  roles?: string[];
  scope?: string[] | string; // OAuth 2.0 scope（可能是陣列或空格分隔的字串）
  family_id: string;
}

/**
 * 解析 JWT Token（不驗證簽名，僅用於讀取 payload）
 * 注意：前端解析不驗證簽名，真正的驗證由後端完成
 */
export function parseJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid JWT format');
      return null;
    }

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to parse JWT:', error);
    return null;
  }
}

/**
 * 從 JWT Token 取得 scope（權限）
 * 處理 scope 可能是字串（空格分隔）或陣列的情況
 */
export function getScopesFromToken(token: string | null): string[] {
  if (!token) return [];

  const payload = parseJWT(token);
  if (!payload || !payload.scope) return [];

  // 處理 scope 可能是字串（空格分隔）或陣列
  if (Array.isArray(payload.scope)) {
    return payload.scope;
  } else if (typeof payload.scope === 'string') {
    return payload.scope.split(' ').filter(Boolean);
  }

  return [];
}

/**
 * 從 JWT Token 取得 roles
 */
export function getRolesFromToken(token: string | null): string[] {
  if (!token) return [];

  const payload = parseJWT(token);
  return payload?.roles || [];
}

/**
 * 檢查 JWT Token 是否過期
 */
export function isTokenExpired(token: string | null): boolean {
  if (!token) return true;

  const payload = parseJWT(token);
  if (!payload || !payload.exp) return true;

  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
}

/**
 * 檢查權限是否在 scope 列表中
 * 支援通配符匹配：如果 scope 中有 "resource:*"，則該資源的所有操作都視為有權限
 * 
 * @param permission 要檢查的權限，格式為 "resource:verb"，例如 "system:user:read"
 * @param scopes scope 列表，可能包含 "resource:*" 或具體的 "resource:verb"
 * @returns 如果有權限返回 true，否則返回 false
 * 
 * @example
 * // 精確匹配
 * hasPermissionInScopes("system:user:read", ["system:user:read"]) // true
 * 
 * // 通配符匹配
 * hasPermissionInScopes("system:user:read", ["system:user:*"]) // true
 * hasPermissionInScopes("system:user:create", ["system:user:*"]) // true
 * 
 * // 不匹配
 * hasPermissionInScopes("system:user:read", ["system:role:read"]) // false
 */
export function hasPermissionInScopes(permission: string, scopes: string[]): boolean {
  // 先檢查精確匹配
  if (scopes.includes(permission)) {
    return true;
  }

  // 檢查通配符匹配
  // permission 格式應該是 "resource:verb"，例如 "system:user:read"
  const parts = permission.split(':');
  if (parts.length >= 2) {
    // 提取 resource 部分（除了最後一個部分，其他都是 resource）
    const resource = parts.slice(0, -1).join(':');
    const wildcardScope = `${resource}:*`;
    
    // 如果 scope 中有 "resource:*"，則該資源的所有操作都有權限
    if (scopes.includes(wildcardScope)) {
      return true;
    }
  }

  return false;
}


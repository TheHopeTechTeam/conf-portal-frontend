import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { resourceService, type ResourceMenuItem } from "../api/services/resourceService";
import { useAuth } from "./AuthContext";

interface MenuContextType {
  menus: ResourceMenuItem[] | null;
  isLoading: boolean;
  error: string | null;
  refreshMenus: () => Promise<void>;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

interface MenuProviderProps {
  children: ReactNode;
}

export function MenuProvider({ children }: MenuProviderProps) {
  const [menus, setMenus] = useState<ResourceMenuItem[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // 初始設為 true
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const loadMenus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // 未登入時不呼叫 API
      if (!isAuthenticated) {
        setMenus(null);
        return;
      }

      const res = await resourceService.getAdminMenus();

      if (res.success && res.data?.items) {
        setMenus(res.data.items);
      } else {
        setMenus([]);
        setError(res.message || "Failed to load menus");
      }
    } catch (e: unknown) {
      setMenus([]);
      setError(e instanceof Error ? e.message : "Failed to load menus");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshMenus = async () => {
    await loadMenus();
  };

  // 根據認證狀態載入或清理菜單
  useEffect(() => {
    if (isAuthenticated) {
      loadMenus();
    } else {
      // 清理未認證狀態下的菜單
      setMenus(null);
      setIsLoading(false);
      setError(null);
    }
  }, [isAuthenticated]);

  const value: MenuContextType = {
    menus,
    isLoading,
    error,
    refreshMenus,
  };

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}
export function useMenuData(): MenuContextType {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error("useMenuData must be used within a MenuProvider");
  }
  return context;
}

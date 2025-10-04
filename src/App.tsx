import { useEffect, useState } from "react";
import { RouterProvider } from "react-router";
import DevModeIndicator from "./components/common/DevModeIndicator";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { MenuProvider, useMenuData } from "./context/MenuContext";
import { routeFilterManager } from "./utils/route-filter-manager";

export default function App() {
  return (
    <AuthProvider>
      <MenuProvider>
        <AppContent />
      </MenuProvider>
    </AuthProvider>
  );
}

function AppContent() {
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const { menus, isLoading: menuLoading } = useMenuData();
  const [router, setRouter] = useState<ReturnType<typeof routeFilterManager.createRouteConfig> | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // 統一的路由初始化邏輯
  useEffect(() => {
    const initializeRouteFilter = async () => {
      try {
        // 等待認證和菜單載入完成
        if (authLoading || menuLoading) {
          return;
        }

        // 初始化路由過濾，傳入菜單資料
        await routeFilterManager.initializeRoutes({
          isAuthenticated,
          user,
          permissions: [],
          roles: [],
          menus,
        });

        // 創建路由配置
        const newRouter = routeFilterManager.createRouteConfig();
        setRouter(newRouter);
        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to initialize route filter:", error);
        setIsInitialized(true); // 即使失敗也要停止載入
      }
    };

    initializeRouteFilter();
  }, [isAuthenticated, user, authLoading, menus, menuLoading]);

  // 顯示載入畫面直到所有初始化完成
  if (!isInitialized || !router) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <DevModeIndicator />
      <RouterProvider router={router} />
    </>
  );
}

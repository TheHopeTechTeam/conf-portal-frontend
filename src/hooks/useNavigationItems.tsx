import { DEMO_NAV } from "@/const/demo";
import { useMemo } from "react";
import { AdminResourceType, type ResourceMenuItem } from "../api/services/resourceService";
import { useMenuData } from "../context/MenuContext";
import { resolveIcon } from "../utils/icon-resolver";

export interface NavigationItem {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; icon?: React.ReactNode }[];
  order?: number;
}

export interface NavigationGroup {
  title: string;
  items: NavigationItem[];
}

export function useNavigationItems(): {
  mainNavItems: NavigationItem[];
  systemNavItems: NavigationItem[];
  isLoading: boolean;
  error: string | null;
} {
  const { menus, isLoading, error } = useMenuData();

  const { mainNavItems, systemNavItems } = useMemo(() => {
    const main: NavigationItem[] = [];
    const system: NavigationItem[] = [];

    if (!menus) return { mainNavItems: main, systemNavItems: system };

    // 建立父子關係的樹狀結構
    const buildHierarchy = (items: ResourceMenuItem[]): NavigationItem[] => {
      // 創建所有項目的映射
      const itemMap = new Map<string, NavigationItem>();
      const rootItems: NavigationItem[] = [];
      const childrenMap = new Map<string, NavigationItem[]>();

      // 先創建所有項目
      items.forEach((it) => {
        if (!it.path) return; // 跳過沒有路徑的項目

        const item: NavigationItem = {
          name: it.name,
          icon: resolveIcon(it.icon || undefined).icon,
          path: it.path,
          order: it.sequence ? Math.floor(it.sequence) : 999,
        };

        itemMap.set(it.id, item);

        // 如果有父項目，加入 children 映射
        if (it.pid) {
          if (!childrenMap.has(it.pid)) {
            childrenMap.set(it.pid, []);
          }
          childrenMap.get(it.pid)!.push(item);
        } else {
          // 沒有父項目，是根項目
          rootItems.push(item);
        }
      });

      // 建立子項目關係
      childrenMap.forEach((children, parentId) => {
        const parent = itemMap.get(parentId);
        if (parent) {
          parent.subItems = children
            .map((child) => ({
              name: child.name,
              path: child.path!,
              icon: child.icon,
            }))
            .sort((a, b) => {
              const aItem = Array.from(itemMap.values()).find((item) => item.path === a.path);
              const bItem = Array.from(itemMap.values()).find((item) => item.path === b.path);
              return (aItem?.order || 999) - (bItem?.order || 999);
            });
        }
      });

      // 排序根項目
      return rootItems.sort((a, b) => (a.order || 999) - (b.order || 999));
    };

    // 分別處理系統和一般項目
    const systemItems = menus.filter((it) => it.type === AdminResourceType.SYSTEM);
    const generalItems = menus.filter((it) => it.type === AdminResourceType.GENERAL);

    const systemHierarchy = buildHierarchy(systemItems);
    const generalHierarchy = buildHierarchy(generalItems);

    system.push(...systemHierarchy);
    main.push(...generalHierarchy);

    // 開發環境下加入 Demo 選項到主選單
    if (process.env.NODE_ENV === "development" && DEMO_NAV.length > 0) {
      // 將所有 Demo 導航包成父級（放在 System 區塊）
      const parentOrder = Math.min(...DEMO_NAV.map((n) => n.order ?? 999));
      system.push({
        name: "Demo",
        icon: resolveIcon("MdScience").icon,
        order: parentOrder,
        subItems: DEMO_NAV.map((n) => ({ name: n.name, path: n.path, icon: resolveIcon(n.icon).icon })),
      });
    }

    return { mainNavItems: main, systemNavItems: system };
  }, [menus]);

  return { mainNavItems, systemNavItems, isLoading, error };
}

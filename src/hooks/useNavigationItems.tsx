import { IS_DEV } from "@/config/env";
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

    if (!menus) {
      return { mainNavItems: main, systemNavItems: system };
    }

    // 建立父子關係的樹狀結構
    const buildHierarchy = (items: ResourceMenuItem[]): NavigationItem[] => {
      // 創建所有項目的映射（包括有 path 和沒有 path 的）
      const itemMap = new Map<string, NavigationItem>();
      const itemDataMap = new Map<string, ResourceMenuItem>(); // 保存原始數據以便獲取父項信息
      const rootItems: NavigationItem[] = [];
      const childrenMap = new Map<string, NavigationItem[]>();

      // 第一步：處理所有項目（包括有 path 和沒有 path 的）
      items.forEach((it) => {
        // 保存原始數據
        itemDataMap.set(it.id, it);

        // 創建 NavigationItem（不管是否有 path）
        const item: NavigationItem = {
          name: it.name,
          icon: resolveIcon(it.icon || "").icon,
          order: it.sequence ? Math.floor(it.sequence) : 999,
        };

        // 如果有 path，設置 path
        if (it.path) {
          item.path = it.path;
        }

        itemMap.set(it.id, item);

        // 如果有父項目，加入 children 映射
        if (it.pid) {
          if (!childrenMap.has(it.pid)) {
            childrenMap.set(it.pid, []);
          }
          // 只將有 path 的項目添加到 children（因為只有有 path 的項目才能被點擊）
          if (it.path) {
            childrenMap.get(it.pid)!.push(item);
          }
          // 有 pid 的項目不添加到 rootItems（即使沒有 path，因為它們是子項，不是根項）
        } else {
          // 沒有父項目，是根項目（不管是否有 path）
          rootItems.push(item);
        }
      });

      // 第二步：識別缺失的父項，並從子項的 parent 字段創建虛擬父項
      childrenMap.forEach((children, parentId) => {
        if (!itemMap.has(parentId)) {
          // 嘗試從子項的原始數據中獲取父項信息
          // 查找所有屬於這個父項的子項數據
          const childDataList = Array.from(itemDataMap.values()).filter((it) => it.pid === parentId);

          // 從第一個有 parent 信息的子項獲取父項數據
          // 優先查找 parent.id 匹配 parentId 的，如果沒有則使用任何有 parent 的子項
          const childWithParent = childDataList.find((it) => it.parent?.id === parentId) || childDataList.find((it) => it.parent);
          const parentData = childWithParent?.parent;

          if (parentData) {
            // 從子項的 parent 字段創建父項
            // 嘗試從 items 中查找是否有父項的完整數據（可能沒有 path）
            const parentItemData = items.find((it) => it.id === parentId);

            const virtualParent: NavigationItem = {
              name: parentData.name,
              icon: resolveIcon(parentData.icon || parentItemData?.icon || "").icon,
              // 父項可能沒有 path，所以不設置 path（這樣它只能作為分組使用）
              order: parentItemData?.sequence ? Math.floor(parentItemData.sequence) : 999,
            };

            itemMap.set(parentId, virtualParent);
            rootItems.push(virtualParent);
          } else {
            // 如果沒有 parent 信息，檢查 items 中是否有父項數據（可能沒有 path）
            const parentItemData = items.find((it) => it.id === parentId);

            if (parentItemData) {
              // 如果 items 中有父項數據（即使沒有 path），使用它
              const parentFromItems: NavigationItem = {
                name: parentItemData.name,
                icon: resolveIcon(parentItemData.icon || "").icon,
                order: parentItemData.sequence ? Math.floor(parentItemData.sequence) : 999,
                // 沒有 path 也沒關係，作為分組使用
              };

              itemMap.set(parentId, parentFromItems);
              rootItems.push(parentFromItems);
            } else {
              // 如果完全沒有父項信息，創建一個占位符
              const firstChildOrder = children[0]?.order || 999;

              // 創建一個占位符父項
              const placeholderParent: NavigationItem = {
                name: `Group ${parentId.substring(0, 8)}`, // 臨時名稱，應該從後端獲取
                icon: resolveIcon("MdFolder").icon,
                order: firstChildOrder,
              };

              itemMap.set(parentId, placeholderParent);
              rootItems.push(placeholderParent);
            }
          }
        }
      });

      // 第三步：建立子項目關係
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
      const sortedRootItems = rootItems.sort((a, b) => (a.order || 999) - (b.order || 999));
      return sortedRootItems;
    };

    // 分別處理系統和一般項目
    const systemItems = menus.filter((it) => it.type === AdminResourceType.SYSTEM);
    const generalItems = menus.filter((it) => it.type === AdminResourceType.GENERAL);

    const systemHierarchy = buildHierarchy(systemItems);
    const generalHierarchy = buildHierarchy(generalItems);

    system.push(...systemHierarchy);
    main.push(...generalHierarchy);

    // 開發環境下加入 Demo 選項到主選單
    if (IS_DEV && DEMO_NAV.length > 0) {
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

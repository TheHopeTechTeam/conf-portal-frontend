import { usePermissions } from "@/context/AuthContext";
import PageButton from "./PageButton";
import { PageButtonType } from "./types";

interface PageButtonGroupProps {
  /** 按鈕列表 */
  buttons: PageButtonType[];
  /** 顯示模式 */
  mode: "toolbar" | "contextmenu";
  /** 資源名稱（用於權限檢查） */
  resource: string;
  /** 容器樣式類名 */
  className?: string;
  /** 按鈕間距 */
  gap?: "sm" | "md" | "lg";
  /** 對齊方式 */
  align?: "left" | "right" | "center";
  /** 是否顯示分隔線 */
  showDivider?: boolean;
}

export default function PageButtonGroup({
  buttons,
  mode,
  resource,
  className,
  gap = "md",
  align = "left",
  showDivider = false,
}: PageButtonGroupProps) {
  const { hasPermission } = usePermissions();

  // 检查按钮权限
  const checkButtonPermission = (button: PageButtonType): boolean => {
    // 如果没有设置权限，则允许显示
    if (!button.permission) {
      return true;
    }

    // 判斷 permission 是否為完整的權限代碼（包含冒號）
    // 如果是完整權限代碼（例如 "system:role:modify"），則直接使用
    // 如果是動詞（例如 "modify"），則與 resource 拼接為 resource:verb
    const permissionCode = button.permission.includes(":") ? button.permission : `${resource}:${button.permission}`;

    // 检查权限
    return hasPermission(permissionCode);
  };

  // 過濾可見的按鈕並排序
  const visibleButtons = buttons
    .filter((button) => {
      // 先检查 visible 属性
      if (button.visible === false) {
        return false;
      }
      // 再检查权限
      return checkButtonPermission(button);
    })
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  if (visibleButtons.length === 0) {
    return null;
  }

  // 間距樣式
  const getGapClass = () => {
    switch (gap) {
      case "sm":
        return "gap-1";
      case "lg":
        return "gap-3";
      case "md":
      default:
        return "gap-2";
    }
  };

  // 對齊樣式
  const getAlignClass = () => {
    switch (align) {
      case "right":
        return "justify-end";
      case "center":
        return "justify-center";
      case "left":
      default:
        return "justify-start";
    }
  };

  // 容器樣式
  const containerClass = `
    flex ${mode === "contextmenu" ? "flex-col items-stretch" : "items-center"}
    ${getGapClass()}
    ${mode === "toolbar" ? getAlignClass() : ""}
    ${className || ""}
  `.trim();

  return (
    <div className={containerClass}>
      {visibleButtons.map((button, index) => {
        // 如果按鈕有 render 函數，使用 render 函數創建元素
        if (button.render) {
          return (
            <div key={button.key}>
              {button.render()}
              {showDivider && index < visibleButtons.length - 1 && <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1" />}
            </div>
          );
        }

        // 否則使用 PageButton 元件渲染按鈕
        return (
          <div key={button.key}>
            <PageButton button={button} mode={mode} />
            {showDivider && index < visibleButtons.length - 1 && <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1" />}
          </div>
        );
      })}
    </div>
  );
}

// 專門用於 Toolbar 的按鈕組
export function ToolbarButtonGroup({ buttons, resource, className, ...props }: Omit<PageButtonGroupProps, "mode">) {
  return <PageButtonGroup buttons={buttons} mode="toolbar" resource={resource} className={className} {...props} />;
}

// 專門用於 ContextMenu 的按鈕組
export function ContextMenuButtonGroup({ buttons, resource, className, ...props }: Omit<PageButtonGroupProps, "mode">) {
  return <PageButtonGroup buttons={buttons} mode="contextmenu" resource={resource} className={className} {...props} />;
}

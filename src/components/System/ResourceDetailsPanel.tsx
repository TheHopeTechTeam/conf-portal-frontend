import React, { useEffect, useState } from "react";
import { MdCancel, MdEdit, MdSave } from "react-icons/md";
import type { ResourceMenuItem } from "../../api/services/resourceService";
import { AdminResourceType } from "../../api/services/resourceService";
import type { ResourceFormData, ResourceFormErrors } from "../../types/resource";
import Input from "../form/input/InputField";
import Textarea from "../form/input/TextArea";
import Label from "../form/Label";
import Button from "../ui/button/Button";

interface ResourceDetailsPanelProps {
  selectedResource: ResourceMenuItem | null;
  isEditing: boolean;
  isLoading: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: (data: ResourceFormData) => void;
  canModify?: boolean;
}

export const ResourceDetailsPanel: React.FC<ResourceDetailsPanelProps> = ({
  selectedResource,
  isEditing,
  isLoading,
  onStartEdit,
  onCancelEdit,
  onSave,
  canModify = false,
}) => {
  const [formData, setFormData] = useState<ResourceFormData>({
    name: "",
    key: "",
    code: "",
    icon: "",
    path: "",
    type: AdminResourceType.GENERAL,
    description: "",
    remark: "",
  });

  const [errors, setErrors] = useState<ResourceFormErrors>({});

  // 當選中資源改變時，更新表單數據
  useEffect(() => {
    if (selectedResource) {
      setFormData({
        name: selectedResource.name,
        key: selectedResource.key,
        code: selectedResource.code,
        icon: selectedResource.icon || "",
        path: selectedResource.path || "",
        type: selectedResource.type,
        description: selectedResource.description || "",
        remark: selectedResource.remark || "",
      });
    } else {
      // 清空表單
      setFormData({
        name: "",
        key: "",
        code: "",
        icon: "",
        path: "",
        type: AdminResourceType.GENERAL,
        description: "",
        remark: "",
      });
    }
    setErrors({});
  }, [selectedResource]);

  // 表單驗證
  const validateForm = (): boolean => {
    const newErrors: ResourceFormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "名稱不能為空";
    }

    if (!formData.key.trim()) {
      newErrors.key = "鍵值不能為空";
    } else if (!/^[A-Z_][A-Z0-9_]*$/.test(formData.key)) {
      newErrors.key = "鍵值必須為大寫字母和下劃線";
    }

    if (!formData.code.trim()) {
      newErrors.code = "代碼不能為空";
    }

    if (!formData.path.trim()) {
      newErrors.path = "路徑不能為空";
    } else if (!formData.path.startsWith("/")) {
      newErrors.path = "路徑必須以 / 開頭";
    }

    if (!formData.icon.trim()) {
      newErrors.icon = "圖示不能為空";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 處理表單提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSave(formData);
    }
  };

  // 處理輸入變化
  const handleInputChange = (field: keyof ResourceFormData, value: string | AdminResourceType) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // 清除對應欄位的錯誤
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // 資源類型選項
  const typeOptions = [
    { value: AdminResourceType.SYSTEM, label: "系統功能" },
    { value: AdminResourceType.GENERAL, label: "業務功能" },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{selectedResource ? (isEditing ? "編輯資源" : "資源詳情") : "資源詳情"}</h3>

          {selectedResource && !isEditing && canModify && (
            <Button size="sm" variant="outline" onClick={onStartEdit} className="flex items-center gap-2">
              <MdEdit className="h-4 w-4" />
              編輯
            </Button>
          )}
        </div>
      </div>

      <div className="p-4">
        {!selectedResource ? (
          <div className="text-center py-8 text-gray-500">請選擇一個資源查看詳情</div>
        ) : isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 名稱 */}
            <div>
              <Label htmlFor="name">
                名稱 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("name", e.target.value)}
                placeholder="輸入資源名稱"
                error={!!errors.name}
              />
            </div>

            {/* 鍵值 */}
            <div>
              <Label htmlFor="key">
                鍵值 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="key"
                value={formData.key}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("key", e.target.value)}
                placeholder="SYSTEM_USER"
                error={!!errors.key}
              />
            </div>

            {/* 代碼 */}
            <div>
              <Label htmlFor="code">
                代碼 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("code", e.target.value)}
                placeholder="system:user"
                error={!!errors.code}
              />
            </div>

            {/* 圖示 */}
            <div>
              <Label htmlFor="icon">
                圖示 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="icon"
                value={formData.icon}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("icon", e.target.value)}
                placeholder="users"
                error={!!errors.icon}
              />
            </div>

            {/* 路徑 */}
            <div>
              <Label htmlFor="path">
                路徑 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="path"
                value={formData.path}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("path", e.target.value)}
                placeholder="/system/users"
                error={!!errors.path}
              />
            </div>

            {/* 類型 */}
            <div>
              <Label htmlFor="type">
                類型 <span className="text-red-500">*</span>
              </Label>
              <select
                id="type"
                value={formData.type}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  handleInputChange("type", Number(e.target.value) as AdminResourceType)
                }
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {typeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
            </div>

            {/* 描述 */}
            <div>
              <Label htmlFor="description">描述</Label>
              <Textarea
                value={formData.description}
                onChange={(value: string) => handleInputChange("description", value)}
                placeholder="資源描述"
                rows={3}
                error={!!errors.description}
              />
            </div>

            {/* 備註 */}
            <div>
              <Label htmlFor="remark">備註</Label>
              <Textarea
                value={formData.remark}
                onChange={(value: string) => handleInputChange("remark", value)}
                placeholder="其他備註"
                rows={3}
                error={!!errors.remark}
              />
            </div>

            {/* 操作按鈕 */}
            <div className="flex gap-2 pt-4">
              <Button disabled={isLoading} className="flex items-center gap-2">
                <MdSave className="h-4 w-4" />
                {isLoading ? "保存中..." : "保存"}
              </Button>

              <Button variant="outline" onClick={onCancelEdit} disabled={isLoading} className="flex items-center gap-2">
                <MdCancel className="h-4 w-4" />
                取消
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            {/* 名稱 */}
            <div>
              <Label>名稱</Label>
              <div className="mt-1 p-3 bg-gray-50 rounded-md">{selectedResource.name}</div>
            </div>

            {/* 鍵值 */}
            <div>
              <Label>鍵值</Label>
              <div className="mt-1 p-3 bg-gray-50 rounded-md font-mono text-sm">{selectedResource.key}</div>
            </div>

            {/* 代碼 */}
            <div>
              <Label>代碼</Label>
              <div className="mt-1 p-3 bg-gray-50 rounded-md font-mono text-sm">{selectedResource.code}</div>
            </div>

            {/* 圖示 */}
            <div>
              <Label>圖示</Label>
              <div className="mt-1 p-3 bg-gray-50 rounded-md">{selectedResource.icon}</div>
            </div>

            {/* 路徑 */}
            <div>
              <Label>路徑</Label>
              <div className="mt-1 p-3 bg-gray-50 rounded-md font-mono text-sm">{selectedResource.path}</div>
            </div>

            {/* 類型 */}
            <div>
              <Label>類型</Label>
              <div className="mt-1 p-3 bg-gray-50 rounded-md">
                <span
                  className={`
                    inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                    ${selectedResource.type === AdminResourceType.SYSTEM ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}
                  `}
                >
                  {selectedResource.type === AdminResourceType.SYSTEM ? "系統功能" : "業務功能"}
                </span>
              </div>
            </div>

            {/* 描述 */}
            {selectedResource.description && (
              <div>
                <Label>描述</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md">{selectedResource.description}</div>
              </div>
            )}

            {/* 備註 */}
            {selectedResource.remark && (
              <div>
                <Label>備註</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md">{selectedResource.remark}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

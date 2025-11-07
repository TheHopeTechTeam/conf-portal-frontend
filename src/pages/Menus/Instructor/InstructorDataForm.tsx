import FileSelectionModal from "@/components/common/FileSelectionModal";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import TextArea from "@/components/ui/textarea";
import { useModal } from "@/hooks/useModal";
import ImagePreviewCard from "@/pages/Menus/File/ImagePreviewCard";
import type { FileGridItem, FileItem } from "@/pages/Menus/File/types";
import { useEffect, useState } from "react";
import { MdAdd } from "react-icons/md";

// 格式化檔案大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

export interface InstructorFormValues {
  id?: string;
  name: string;
  title?: string;
  bio?: string;
  remark?: string;
  description?: string;
  file_ids?: string[]; // 檔案 ID 陣列（用於圖片）
  files?: FileGridItem[]; // 编辑时使用，包含完整的文件信息（包括 URL）
}

interface InstructorDataFormProps {
  mode: "create" | "edit";
  defaultValues?: InstructorFormValues | null;
  onSubmit: (values: InstructorFormValues) => Promise<void> | void;
  onCancel: () => void;
  submitting?: boolean;
}

const InstructorDataForm: React.FC<InstructorDataFormProps> = ({ mode, defaultValues, onSubmit, onCancel, submitting }) => {
  const [values, setValues] = useState<InstructorFormValues>({
    name: "",
    title: "",
    bio: "",
    remark: "",
    description: "",
    file_ids: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([]);
  const { isOpen: isFileSelectionOpen, openModal: openFileSelectionModal, closeModal: closeFileSelectionModal } = useModal(false);

  useEffect(() => {
    if (defaultValues) {
      setValues({
        id: defaultValues.id,
        name: defaultValues.name || "",
        title: defaultValues.title || "",
        bio: defaultValues.bio || "",
        remark: defaultValues.remark || "",
        description: defaultValues.description || "",
        file_ids: defaultValues.file_ids || [],
      });
      // 如果已有 files（编辑时），使用完整的文件信息
      // 否则如果有 fileIds，转换为 FileItem 格式
      if (defaultValues.files && defaultValues.files.length > 0) {
        // 编辑模式：使用完整的文件信息（包括 URL）
        setSelectedFiles(
          defaultValues.files.map((file) => ({
            id: file.id,
            url: file.url || "",
            name: file.originalName,
            size: file.sizeBytes,
          }))
        );
      } else if (defaultValues.file_ids && defaultValues.file_ids.length > 0) {
        // 创建模式或只有 fileIds：使用占位符
        setSelectedFiles(
          defaultValues.file_ids.map((id) => ({
            id,
            url: "", // URL 會在 FileSelectionModal 中根據 file_id 加載
            name: `已選文件 ${id.substring(0, 8)}...`,
          }))
        );
      } else {
        setSelectedFiles([]);
      }
    } else {
      setValues({
        name: "",
        title: "",
        bio: "",
        remark: "",
        description: "",
        file_ids: [],
      });
      setSelectedFiles([]);
    }
  }, [defaultValues]);

  const validate = (): boolean => {
    const next: Record<string, string> = {};

    if (!values.name || values.name.trim().length === 0) {
      next.name = "請輸入講者姓名";
    } else if (values.name.length > 255) {
      next.name = "講者姓名不能超過 255 個字符";
    }

    if (values.title && values.title.length > 255) {
      next.title = "職稱不能超過 255 個字符";
    }

    if (values.remark && values.remark.length > 256) {
      next.remark = "備註不能超過 256 個字符";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // 使用選中的文件的 ID
    const file_ids = selectedFiles.map((file) => file.id);

    await onSubmit({
      ...values,
      file_ids: file_ids.length > 0 ? file_ids : undefined,
    });
  };

  const handleFileSelectionConfirm = (files: FileItem[]) => {
    setSelectedFiles(files);
    closeFileSelectionModal();
  };

  const handleRemoveFile = (fileId: string) => {
    setSelectedFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              id="name"
              label="姓名"
              type="text"
              placeholder="請輸入講者姓名"
              value={values.name}
              onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
              error={errors.name || undefined}
              required
            />
          </div>

          <div>
            <Input
              id="title"
              label="職稱"
              type="text"
              placeholder="請輸入職稱"
              value={values.title || ""}
              onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
              error={errors.title || undefined}
            />
          </div>
        </div>

        <div>
          <TextArea
            id="bio"
            label="簡介"
            rows={3}
            placeholder="請輸入簡介"
            value={values.bio || ""}
            onChange={(value) => setValues((v) => ({ ...v, bio: value }))}
            error={errors.bio || undefined}
          />
        </div>

        <div>
          <TextArea
            id="description"
            label="描述"
            rows={3}
            placeholder="請輸入描述"
            value={values.description || ""}
            onChange={(value) => setValues((v) => ({ ...v, description: value }))}
            error={errors.description || undefined}
          />
        </div>

        <div>
          <TextArea
            id="remark"
            label="備註"
            rows={3}
            placeholder="請輸入備註"
            value={values.remark || ""}
            onChange={(value) => setValues((v) => ({ ...v, remark: value }))}
            error={errors.remark || undefined}
          />
        </div>

        {/* 圖片選擇 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">圖片</label>
          <div className="space-y-3">
            <Button btnType="button" variant="outline" size="sm" onClick={openFileSelectionModal}>
              <MdAdd className="mr-2" size={16} />
              選擇圖片
            </Button>
            {/* 已選中的圖片列表 */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm text-gray-600 dark:text-gray-400">已選擇 {selectedFiles.length} 個圖片</div>
                <div className="grid grid-cols-5 gap-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                  {selectedFiles.map((file) => (
                    <ImagePreviewCard
                      key={file.id}
                      imageUrl={file.url || ""}
                      alt={file.name}
                      showDeleteButton={true}
                      onDelete={() => handleRemoveFile(file.id)}
                      fileInfo={{
                        name: file.name,
                        size: file.size,
                      }}
                      formatFileSize={formatFileSize}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button onClick={onCancel} size="sm" variant="outline" disabled={!!submitting}>
            取消
          </Button>
          <Button btnType="submit" size="sm" variant="primary" disabled={!!submitting}>
            {submitting ? "儲存中..." : mode === "create" ? "新增" : "儲存"}
          </Button>
        </div>
      </form>

      {/* 文件選擇 Modal - 移到 form 外部以避免 form 嵌套 */}
      <FileSelectionModal
        isOpen={isFileSelectionOpen}
        onClose={closeFileSelectionModal}
        onConfirm={handleFileSelectionConfirm}
        multiple={true}
        initialSelectedIds={selectedFiles.map((file) => file.id)}
      />
    </>
  );
};

export default InstructorDataForm;

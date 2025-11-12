import { useApi } from "@/api";
import fileService from "@/api/services/fileService";
import DataTableFooter from "@/components/DataPage/DataTableFooter";
import DataTableToolbar from "@/components/DataPage/DataTableToolbar";
import { CommonPageButton } from "@/components/DataPage/PageButtonTypes";
import type { PageButtonType } from "@/components/DataPage/types";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Button from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ModalForm, type ModalFormHandle } from "@/components/ui/modal/modal-form";
import { Select } from "@/components/ui/select";
import { useModal } from "@/hooks/useModal";
import FileGrid from "@/pages/Menus/File/FileGrid";
import FileUploadForm, { type FileUploadFormHandle } from "@/pages/Menus/File/FileUploadForm";
import type { FileGridItem, FileItem, SortOrder } from "@/pages/Menus/File/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MdUpload } from "react-icons/md";

// 將 FileGridItem 轉換為 FileItem
const convertFileGridItemToFileItem = (item: FileGridItem): FileItem => {
  return {
    id: item.id,
    url: item.url || "",
    name: item.originalName,
    size: item.sizeBytes,
  };
};

// 將 SortOrder 轉換為 API 參數
const convertSortOrderToApiParams = (sortOrder: SortOrder): { order_by: string; descending: boolean } => {
  switch (sortOrder) {
    case "name_asc":
      return { order_by: "original_name", descending: false };
    case "name_desc":
      return { order_by: "original_name", descending: true };
    case "date_asc":
      return { order_by: "created_at", descending: false };
    case "date_desc":
      return { order_by: "created_at", descending: true };
    case "size_asc":
      return { order_by: "size_bytes", descending: false };
    case "size_desc":
      return { order_by: "size_bytes", descending: true };
    default:
      return { order_by: "created_at", descending: true };
  }
};

export interface FileSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedFiles: FileItem[]) => void;
  multiple?: boolean; // 是否多選，默認 true
  initialSelectedIds?: string[]; // 初始選中的文件 ID 列表
}

const FileSelectionModal: React.FC<FileSelectionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  multiple = true,
  initialSelectedIds = [],
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [selectedKeys, setSelectedKeys] = useState<string[]>(initialSelectedIds);
  const [sortOrder, setSortOrder] = useState<SortOrder>("date_desc");
  const itemsPerPageOptions = [25, 50, 75, 100];

  // 當 initialSelectedIds 或 isOpen 改變時，更新 selectedKeys
  useEffect(() => {
    if (isOpen) {
      setSelectedKeys(initialSelectedIds);
    }
  }, [initialSelectedIds, isOpen]);

  // 上傳 Modal 狀態
  const { isOpen: isUploadModalOpen, openModal: openUploadModal, closeModal: closeUploadModal } = useModal();
  const [uploading, setUploading] = useState(false);

  // Form refs
  const fileUploadFormRef = useRef<FileUploadFormHandle>(null);
  const fileUploadModalFormRef = useRef<ModalFormHandle>(null);

  // 獲取分頁參數
  const apiParams = useMemo(() => {
    const sortParams = convertSortOrderToApiParams(sortOrder);
    return {
      page: currentPage - 1, // 後端從 0 開始
      page_size: itemsPerPage,
      ...sortParams,
    };
  }, [currentPage, itemsPerPage, sortOrder]);

  // 使用 API 獲取檔案列表
  const {
    data: filesData,
    isLoading: loading,
    execute: refetchFiles,
  } = useApi(() => fileService.getPages(apiParams), {
    enableCache: false,
    autoExecute: isOpen, // 只在 Modal 打開時執行
    dependencies: [apiParams],
  });

  // 關閉上傳 Modal 後再刷新列表
  const handleCloseUploadModal = useCallback(async () => {
    closeUploadModal();
    await refetchFiles();
  }, [closeUploadModal, refetchFiles]);

  // 轉換檔案列表
  const files = useMemo(() => {
    if (!filesData?.items) return [];
    return filesData.items.map(convertFileGridItemToFileItem);
  }, [filesData]);

  const totalPages = filesData?.total ? Math.ceil(filesData.total / itemsPerPage) : 0;
  const totalEntries = filesData?.total || 0;

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleItemsPerPageChange = useCallback((newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  }, []);

  // 處理檔案選取
  const handleFileSelect = (fileId: string, checked: boolean) => {
    if (multiple) {
      // 多選模式
      if (checked) {
        setSelectedKeys((prev) => [...prev, fileId]);
      } else {
        setSelectedKeys((prev) => prev.filter((id) => id !== fileId));
      }
    } else {
      // 單選模式
      if (checked) {
        setSelectedKeys([fileId]);
      } else {
        setSelectedKeys([]);
      }
    }
  };

  // 處理確認選擇
  const handleConfirm = useCallback(() => {
    const selectedFiles = files.filter((file) => selectedKeys.includes(file.id));
    onConfirm(selectedFiles);
    onClose();
  }, [files, selectedKeys, onConfirm, onClose]);

  // 處理檔案上傳
  const handleFileUpload = useCallback(async () => {
    if (!fileUploadFormRef.current?.validate()) {
      console.log("請先選擇要上傳的檔案");
      return;
    }

    const files = fileUploadFormRef.current.getFiles();
    if (files.length === 0) return;

    try {
      setUploading(true);
      const CONCURRENCY = 3;
      let nextIndex = 0;
      const uploadedFileIds: string[] = [];

      const uploadOneAtIndex = async (index: number) => {
        const file = files[index];
        fileUploadFormRef.current?.setUploadStatus(index, "uploading");
        try {
          const res = await fileService.uploadOne(file, (p) => fileUploadFormRef.current?.setUploadProgress(index, p));
          console.log("上傳響應:", res); // 調試用
          if (res.success) {
            const fileId = res.data?.id;
            if (fileId) {
              const duplicate = res.data?.duplicate === true;
              const message = duplicate ? "檔案已存在，已引用現有檔案" : "上傳完成";
              fileUploadFormRef.current?.setUploadStatus(index, "success", undefined, message);
              uploadedFileIds.push(fileId);
            } else {
              console.error("上傳響應缺少文件 ID:", res);
              fileUploadFormRef.current?.setUploadStatus(index, "error", "上傳響應缺少文件 ID");
            }
          } else {
            console.error("上傳失敗:", res);
            fileUploadFormRef.current?.setUploadStatus(index, "error", res.message || "上傳失敗");
          }
        } catch (err: unknown) {
          console.error("單檔上傳失敗:", err);
          const message = err instanceof Error ? err.message : "上傳失敗";
          fileUploadFormRef.current?.setUploadStatus(index, "error", message);
        }
      };

      const worker = async () => {
        while (true) {
          const current = nextIndex;
          if (current >= files.length) return;
          nextIndex++;
          await uploadOneAtIndex(current);
        }
      };

      const workers = Array.from({ length: Math.min(CONCURRENCY, files.length) }, () => worker());
      await Promise.all(workers);

      // 上傳完成後，刷新文件列表並自動選中新上傳的文件
      if (uploadedFileIds.length > 0) {
        await refetchFiles();
        // 自動選中新上傳的文件
        setSelectedKeys((prev) => {
          const newKeys = [...prev];
          uploadedFileIds.forEach((id) => {
            if (!newKeys.includes(id)) {
              newKeys.push(id);
            }
          });
          return newKeys;
        });
        // 不關閉上傳 Modal，讓用戶可以繼續上傳
      }
    } catch (error) {
      console.error("上傳失敗:", error);
    } finally {
      setUploading(false);
    }
  }, [refetchFiles]);

  // Toolbar 按鈕
  const toolbarButtons: PageButtonType[] = useMemo(() => {
    // 排序選項
    const sortOptions = [
      { value: "date_desc", label: "日期 (最新)" },
      { value: "date_asc", label: "日期 (最舊)" },
      { value: "name_asc", label: "名稱 (A-Z)" },
      { value: "name_desc", label: "名稱 (Z-A)" },
      { value: "size_desc", label: "大小 (大到小)" },
      { value: "size_asc", label: "大小 (小到大)" },
    ];

    const buttons: PageButtonType[] = [
      {
        key: "upload",
        text: "上傳檔案",
        icon: <MdUpload className="size-4" />,
        align: "left",
        variant: "primary",
        size: "md",
        onClick: openUploadModal,
        permission: "create",
      },
    ];

    buttons.push(
      CommonPageButton.REFRESH(() => {
        refetchFiles();
      }),
      {
        key: "sort",
        text: "排序方式",
        align: "right",
        size: "md",
        onClick: () => {},
        render: () => (
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">排序方式：</label>
            <Select
              id="file-sort-select"
              options={sortOptions}
              value={sortOrder}
              onChange={(value) => {
                setSortOrder(value as SortOrder);
                setCurrentPage(1);
              }}
              placeholder="選擇排序方式"
              size="sm"
              variant="ghost"
              className="w-48"
            />
          </div>
        ),
        permission: "read",
      },
    );

    return buttons;
  }, [sortOrder, openUploadModal, refetchFiles]);

  // 當 Modal 關閉時重置選中狀態
  const handleClose = useCallback(() => {
    setSelectedKeys(initialSelectedIds);
    onClose();
  }, [initialSelectedIds, onClose]);

  return (
    <>
      <Modal
        title="選擇圖片"
        isOpen={isOpen}
        onClose={handleClose}
        className="max-w-[90vw] w-full max-h-[90vh] mx-4 p-6 bg-white dark:bg-gray-900 flex flex-col"
      >
        <div className="flex flex-col flex-1 min-h-0 max-h-[calc(90vh-120px)]">
          {/* Toolbar - 固定 */}
          <div className="shrink-0">
            <DataTableToolbar buttons={toolbarButtons} resource="content:file" />
          </div>

          {/* 內容區域 - 可滾動 */}
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-full rounded-xl bg-white dark:bg-white/[0.03]">
                <LoadingSpinner />
              </div>
            ) : (
              <>
                {/* FileGrid 容器 - 可滾動 */}
                <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto custom-scrollbar border-x border-b border-gray-100 dark:border-white/[0.05] bg-white dark:bg-gray-900">
                  <FileGrid files={files} selectedKeys={selectedKeys} onSelect={handleFileSelect} />
                </div>

                {/* 分頁元件 - 固定 */}
                <div className="shrink-0">
                  <DataTableFooter
                    currentPage={currentPage}
                    totalPages={totalPages}
                    rowsPerPage={itemsPerPage}
                    totalEntries={totalEntries}
                    pageSizeOptions={itemsPerPageOptions}
                    onPageChange={handlePageChange}
                    onRowsPerPageChange={handleItemsPerPageChange}
                  />
                </div>
              </>
            )}
          </div>

          {/* Footer - 固定 */}
          <div className="shrink-0 flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
            <Button variant="outline" onClick={handleClose}>
              取消
            </Button>
            <Button variant="primary" onClick={handleConfirm} disabled={selectedKeys.length === 0}>
              確認選擇 ({selectedKeys.length})
            </Button>
          </div>
        </div>
      </Modal>

      {/* 上傳檔案 Modal */}
      <ModalForm
        ref={fileUploadModalFormRef}
        title="上傳檔案"
        isOpen={isUploadModalOpen}
        onClose={handleCloseUploadModal}
        className="w-full p-4 max-h-80vh"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={handleCloseUploadModal} disabled={uploading}>
              取消
            </Button>
            <Button variant="primary" size="sm" onClick={() => fileUploadModalFormRef.current?.submit()} disabled={uploading}>
              {uploading ? "上傳中..." : "上傳"}
            </Button>
          </>
        }
        onSubmit={async (e) => {
          e.preventDefault();
          await handleFileUpload();
        }}
        isFullscreen
      >
        <FileUploadForm ref={fileUploadFormRef} />
      </ModalForm>
    </>
  );
};

export default FileSelectionModal;

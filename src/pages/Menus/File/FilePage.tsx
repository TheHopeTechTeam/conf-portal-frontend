import { useApi } from "@/api";
import fileService from "@/api/services/fileService";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import DataTableFooter from "@/components/DataPage/DataTableFooter";
import DataTableToolbar from "@/components/DataPage/DataTableToolbar";
import { CommonPageButton } from "@/components/DataPage/PageButtonTypes";
import type { PageButtonType } from "@/components/DataPage/types";
import Button from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ModalForm, type ModalFormHandle } from "@/components/ui/modal/modal-form";
import { Select } from "@/components/ui/select";
import { useModal } from "@/hooks/useModal";
import { useCallback, useMemo, useRef, useState } from "react";
import { MdCheckBox, MdCheckBoxOutlineBlank, MdUpload } from "react-icons/md";
import FileDeleteForm from "./FileDeleteForm";
import FileGrid from "./FileGrid";
import FileUploadForm, { type FileUploadFormHandle } from "./FileUploadForm";
import type { FileGridItem, FileItem, SortOrder } from "./types";

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

const FilePage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<SortOrder>("date_desc");
  // const [keyword, setKeyword] = useState<string>(""); // 保留用於未來搜尋功能
  const itemsPerPageOptions = [25, 50, 75, 100];

  // 上傳 Modal 狀態
  const { isOpen: isUploadModalOpen, openModal: openUploadModal, closeModal: closeUploadModal } = useModal();
  const [uploading, setUploading] = useState(false);

  // 刪除 Modal 狀態
  const { isOpen: isDeleteModalOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal();
  const [deleting, setDeleting] = useState(false);

  // Form refs
  const fileUploadFormRef = useRef<FileUploadFormHandle>(null);
  const fileUploadModalFormRef = useRef<ModalFormHandle>(null);

  // 獲取分頁參數
  const apiParams = useMemo(() => {
    const sortParams = convertSortOrderToApiParams(sortOrder);
    return {
      page: currentPage - 1, // 後端從 0 開始
      page_size: itemsPerPage,
      // keyword: keyword || undefined, // 保留用於未來搜尋功能
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
    autoExecute: true,
    dependencies: [apiParams],
  });

  // 關閉上傳 Modal 後再刷新列表，避免初始化順序問題
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
    // 滾動到頂部
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleItemsPerPageChange = useCallback((newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  }, []);

  // 處理檔案選取
  const handleFileSelect = (fileId: string, checked: boolean) => {
    if (checked) {
      setSelectedKeys((prev) => [...prev, fileId]);
    } else {
      setSelectedKeys((prev) => prev.filter((id) => id !== fileId));
    }
  };

  // 檢查當前頁面是否全選
  const isAllSelected = useMemo(() => {
    if (files.length === 0) return false;
    return files.every((file) => selectedKeys.includes(file.id));
  }, [files, selectedKeys]);

  // 處理全選/取消全選
  const handleSelectAll = useCallback(() => {
    if (isAllSelected) {
      // 取消全選（只取消當前頁面的選取）
      const currentPageIds = files.map((file) => file.id);
      setSelectedKeys((prev) => prev.filter((id) => !currentPageIds.includes(id)));
    } else {
      // 全選當前頁面
      const currentPageIds = files.map((file) => file.id);
      setSelectedKeys((prev) => {
        const newKeys = [...prev];
        currentPageIds.forEach((id) => {
          if (!newKeys.includes(id)) {
            newKeys.push(id);
          }
        });
        return newKeys;
      });
    }
  }, [isAllSelected, files]);

  // 處理批量刪除（打開 Modal）
  const handleBatchDelete = useCallback(() => {
    if (selectedKeys.length === 0) {
      // TODO: 顯示提示訊息
      console.log("請先選擇要刪除的檔案");
      return;
    }
    openDeleteModal();
  }, [selectedKeys.length, openDeleteModal]);

  // 執行批量刪除
  const handleDeleteConfirm = useCallback(async () => {
    if (selectedKeys.length === 0) return;

    try {
      setDeleting(true);
      const response = await fileService.bulkDelete({ ids: selectedKeys });
      if (response.success) {
        console.log(`成功刪除 ${response.data.success_count} 個檔案`);
        if (response.data.failed_items && response.data.failed_items.length > 0) {
          console.warn("部分檔案刪除失敗:", response.data.failed_items);
          // TODO: 顯示失敗的檔案資訊
        }
        setSelectedKeys([]);
        closeDeleteModal();
        // 重新載入檔案列表
        await refetchFiles();
      }
    } catch (error) {
      console.error("刪除檔案失敗:", error);
      // TODO: 顯示錯誤訊息
    } finally {
      setDeleting(false);
    }
  }, [selectedKeys, refetchFiles, closeDeleteModal]);

  // 處理檔案上傳（併發 3 個，顯示單檔進度）
  const handleFileUpload = useCallback(async () => {
    if (!fileUploadFormRef.current?.validate()) {
      // TODO: 顯示提示訊息
      console.log("請先選擇要上傳的檔案");
      return;
    }

    const files = fileUploadFormRef.current.getFiles();
    if (files.length === 0) return;

    try {
      setUploading(true);
      const CONCURRENCY = 3;
      let nextIndex = 0;

      const uploadOneAtIndex = async (index: number) => {
        const file = files[index];
        fileUploadFormRef.current?.setUploadStatus(index, "uploading");
        try {
          const res = await fileService.uploadOne(file, (p) => fileUploadFormRef.current?.setUploadProgress(index, p));
          if (res.success) {
            const duplicate = res.data?.duplicate === true;
            const message = duplicate ? "檔案已存在，已引用現有檔案" : "上傳完成";
            fileUploadFormRef.current?.setUploadStatus(index, "success", undefined, message);
          } else {
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
    } catch (error) {
      console.error("上傳失敗:", error);
      // TODO: 顯示錯誤訊息
    } finally {
      setUploading(false);
    }
  }, [closeUploadModal, refetchFiles]);

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

    return [
      {
        key: "upload",
        text: "上傳檔案",
        icon: <MdUpload className="size-4" />,
        align: "left",
        variant: "primary",
        size: "md",
        onClick: openUploadModal,
      },
      {
        key: "selectAll",
        text: isAllSelected ? "取消全選" : "全選",
        icon: isAllSelected ? <MdCheckBox className="size-4" /> : <MdCheckBoxOutlineBlank className="size-4" />,
        align: "left",
        disabled: files.length === 0,
        size: "md",
        onClick: handleSelectAll,
      },
      CommonPageButton.BULK_DELETE(handleBatchDelete, {
        align: "left",
        tooltip: "批量刪除",
        size: "md",
        disabled: selectedKeys.length === 0,
      }),
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
      },
    ];
  }, [selectedKeys.length, handleBatchDelete, sortOrder, openUploadModal, refetchFiles, isAllSelected, handleSelectAll, files.length]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px] rounded-xl bg-white dark:bg-white/[0.03]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col rounded-xl bg-white dark:bg-white/[0.03] h-full">
        {/* Toolbar */}
        <DataTableToolbar buttons={toolbarButtons} />
        <div className="flex-1 min-h-0">
          <div className="h-full flex flex-col">
            <div className="grow max-w-full overflow-x-auto overflow-y-auto custom-scrollbar border-x border-b border-gray-100 dark:border-white/[0.05]">
              {/* 圖片網格 */}
              <FileGrid files={files} selectedKeys={selectedKeys} onSelect={handleFileSelect} />
            </div>

            {/* 分頁元件 */}
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
        </div>
      </div>

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
              關閉
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

      {/* 刪除檔案 Modal */}
      <Modal title="確認刪除檔案" isOpen={isDeleteModalOpen} onClose={closeDeleteModal} className="max-w-[560px] w-full mx-4 p-6">
        <FileDeleteForm fileCount={selectedKeys.length} onSubmit={handleDeleteConfirm} onCancel={closeDeleteModal} submitting={deleting} />
      </Modal>
    </>
  );
};

export default FilePage;

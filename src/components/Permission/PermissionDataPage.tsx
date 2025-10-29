import { permissionService } from "@/api";
import type { DataTableColumn, DataTableRowAction, PopoverType } from "@/components/DataPage";
import { CommonPageButton, DataPage } from "@/components/DataPage";
import { getRecycleButtonClassName } from "@/components/DataPage/PageButtonTypes";
import RestoreForm from "@/components/DataPage/RestoreForm";
import { Modal } from "@/components/ui/modal";
import { PopoverPosition } from "@/const/enums";
import { useModal } from "@/hooks/useModal";
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MdCheck, MdClose, MdDelete, MdEdit, MdRestore, MdVisibility } from "react-icons/md";
import PermissionDataForm, { type PermissionFormValues } from "./PermissionDataForm";
import PermissionDeleteForm from "./PermissionDeleteForm";
import PermissionDetailView from "./PermissionDetailView";
import PermissionSearchPopover, { type PermissionSearchFilters } from "./PermissionSearchPopover";

type PermissionDetail = {
  id: string;
  displayName: string;
  code: string;
  isActive: boolean;
  description?: string;
  remark?: string;
  resourceName: string;
  verbName: string;
};

interface PermissionPagesResponse {
  page: number; // 0-based from backend
  page_size: number; // API 可能返回 pageSize
  total: number;
  items?: PermissionDetail[];
}

export default function PermissionDataPage() {
  const [currentPage, setCurrentPage] = useState(1); // 1-based for UI
  const [pageSize, setPageSize] = useState(10);
  const [searchFilters, setSearchFilters] = useState<PermissionSearchFilters>({});
  const [appliedFilters, setAppliedFilters] = useState<PermissionSearchFilters>({});
  const [showDeleted, setShowDeleted] = useState(false);
  const [orderBy, setOrderBy] = useState<string>();
  const [descending, setDescending] = useState<boolean>();

  const [items, setItems] = useState<PermissionDetail[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  // Modal state
  const { isOpen, openModal, closeModal } = useModal(false);
  const { isOpen: isDeleteOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal(false);
  const { isOpen: isViewOpen, openModal: openViewModal, closeModal: closeViewModal } = useModal(false);
  const { isOpen: isRestoreOpen, openModal: openRestoreModal, closeModal: closeRestoreModal } = useModal(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<PermissionDetail | null>(null);
  const [viewing, setViewing] = useState<PermissionDetail | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [restoreIds, setRestoreIds] = useState<string[]>([]);

  const clearSelectionRef = useRef<(() => void) | null>(null);

  // Fetch function - 使用 useRef 避免不必要的重新創建
  const fetchPagesRef = useRef({
    currentPage,
    pageSize,
    orderBy,
    descending,
    appliedFilters,
    showDeleted,
  });

  // 更新 ref 當依賴項改變時
  fetchPagesRef.current = {
    currentPage,
    pageSize,
    orderBy,
    descending,
    appliedFilters,
    showDeleted,
  };

  const fetchPages = useCallback(async () => {
    // 在 fetchPages 之前清除選中狀態
    clearSelectionRef.current?.();

    const { currentPage, pageSize, orderBy, descending, appliedFilters, showDeleted } = fetchPagesRef.current;

    setLoading(true);
    try {
      const params = {
        page: Math.max(0, currentPage - 1),
        page_size: pageSize,
        order_by: orderBy && orderBy.trim() !== "" ? orderBy : undefined,
        descending: orderBy && orderBy.trim() !== "" ? descending : undefined,
        keyword: appliedFilters.keyword || undefined,
        is_active: appliedFilters.isActive,
        deleted: showDeleted || undefined,
      } as Record<string, unknown>;

      const response = await permissionService.pages(params);
      if (response.success) {
        const data = response.data;
        console.log("API Response:", data);
        setItems(data.items || []);
        setTotal(data.total);
        // Backend page is 0-based; map back to 1-based UI if changed externally
        setCurrentPage(data.page + 1);
        // 處理 API 可能返回 pageSize 或 page_size 的情況
        const responsePageSize = data.page_size || 10;
        console.log("pageSize from API:", responsePageSize);
        setPageSize(responsePageSize);
      } else {
        console.error("Failed to fetch permissions:", response.message);
        setItems([]);
        setTotal(0);
      }
    } catch (e) {
      console.error("Error fetching permission pages:", e);
      // Simplified error surfacing for demo
      alert("載入失敗，請稍後重試");
    } finally {
      setLoading(false);
    }
  }, []); // 移除 clearSelection 依賴

  // Columns definition
  const columns: DataTableColumn<PermissionDetail>[] = useMemo(
    () => [
      {
        key: "displayName",
        label: "顯示名稱",
        width: "200px",
        tooltip: (row) => row.displayName,
      },
      {
        key: "code",
        label: "代碼",
        sortable: true,
        width: "200px",
        tooltip: (row) => row.code,
        render: (value: unknown, row: PermissionDetail) => (
          <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono">{row.code}</code>
        ),
      },
      {
        key: "isActive",
        label: "狀態",
        sortable: true,
        width: "80px",
        render: (value: unknown, row: PermissionDetail) => {
          return (
            <span
              className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
                row.isActive
                  ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
                  : "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400"
              }`}
            >
              {row.isActive ? <MdCheck size={16} /> : <MdClose size={16} />}
            </span>
          );
        },
      },
      {
        key: "resourceName",
        label: "資源",
        width: "150px",
        tooltip: (row) => row.resourceName,
      },
      {
        key: "verbName",
        label: "動作",
        width: "100px",
        tooltip: (row) => row.verbName,
      },
      {
        key: "description",
        label: "描述",
        width: "300px",
        render: (value: unknown, row: PermissionDetail) => (
          <span className="text-gray-600 dark:text-gray-400 truncate max-w-xs">{row.description || "-"}</span>
        ),
      },
    ],
    []
  );

  // Toolbar buttons

  // Trigger fetch on dependencies change
  useEffect(() => {
    fetchPages();
  }, [currentPage, pageSize, orderBy, descending, appliedFilters, showDeleted, fetchPages]);

  // Event handlers wired to DataPage
  const handleSort = (columnKey: string | null, newDescending: boolean) => {
    if (columnKey === null) {
      // 取消排序
      setOrderBy("");
      setDescending(false);
    } else {
      setOrderBy(columnKey);
      setDescending(newDescending);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const handleRowSelect = (selectedRows: PermissionDetail[], selectedKeys: string[]) => {
    setSelectedKeys(selectedKeys);
  };

  const handleBulkRestore = useCallback(async () => {
    setRestoreIds(selectedKeys);
    openRestoreModal();
  }, [selectedKeys, openRestoreModal]);

  const handleSingleRestore = async (row: PermissionDetail) => {
    setRestoreIds([row.id]);
    openRestoreModal();
  };

  const handleRestoreConfirm = async (ids: string[]) => {
    try {
      setSubmitting(true);
      await permissionService.restore(ids);
      await fetchPages();
      closeRestoreModal();
    } catch (e) {
      console.error(e);
      alert("批量還原失敗，請稍後再試");
    } finally {
      setSubmitting(false);
    }
  };

  // Toolbar buttons
  const toolbarButtons = useMemo(() => {
    // 使用 popoverCallback 模式，使用統一的 trigger 樣式
    const searchPopoverCallback = ({
      isOpen,
      onOpenChange,
      trigger,
      popover,
    }: {
      isOpen: boolean;
      onOpenChange: (open: boolean) => void;
      trigger: ReactNode;
      popover: PopoverType;
    }) => (
      <PermissionSearchPopover
        filters={searchFilters}
        onFiltersChange={setSearchFilters}
        onSearch={(filters) => {
          setAppliedFilters(filters);
          setCurrentPage(1);
          onOpenChange(false); // 搜尋完成後關閉 Popover
        }}
        onClear={() => {
          setSearchFilters({});
          setAppliedFilters({});
          setCurrentPage(1);
          onOpenChange(false); // 清除完成後關閉 Popover
        }}
        trigger={trigger}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        popover={popover}
      />
    );

    const buttons = [
      CommonPageButton.SEARCH(searchPopoverCallback, {
        popover: { title: "搜尋權限", position: PopoverPosition.BottomLeft, width: "400px" },
      }),
      CommonPageButton.ADD(
        () => {
          setFormMode("create");
          setEditing(null);
          openModal();
        },
        {
          visible: !showDeleted,
        }
      ),
      CommonPageButton.RESTORE(handleBulkRestore, {
        visible: showDeleted,
        disabled: selectedKeys.length === 0,
      }),
      CommonPageButton.REFRESH(() => {
        fetchPages();
      }),
      CommonPageButton.RECYCLE(
        () => {
          setShowDeleted(!showDeleted);
          setCurrentPage(1);
        },
        { className: getRecycleButtonClassName(showDeleted) }
      ),
    ];

    return buttons;
  }, [openModal, fetchPages, searchFilters, showDeleted, selectedKeys, handleBulkRestore]);

  // Row actions
  const rowActions: DataTableRowAction<PermissionDetail>[] = useMemo(
    () => [
      {
        key: "view",
        label: "檢視",
        icon: <MdVisibility />,
        onClick: (row: PermissionDetail) => {
          setViewing(row);
          openViewModal();
        },
      },
      {
        key: "edit",
        label: "編輯",
        icon: <MdEdit />,
        onClick: (row: PermissionDetail) => {
          setFormMode("edit");
          setEditing(row);
          openModal();
        },
        visible: !showDeleted, // 僅在正常模式下顯示
      },
      {
        key: "restore",
        label: "還原",
        icon: <MdRestore />,
        variant: "primary",
        onClick: async (row: PermissionDetail) => {
          handleSingleRestore(row);
        },
        visible: showDeleted, // 僅在回收桶模式下顯示
      },
      {
        key: "delete",
        label: showDeleted ? "永久刪除" : "刪除",
        icon: <MdDelete />,
        variant: "danger",
        onClick: (row: PermissionDetail) => {
          setEditing(row);
          openDeleteModal();
        },
      },
    ],
    [openModal, openDeleteModal, openViewModal, showDeleted, fetchPages]
  );

  // Submit handlers
  const handleSubmit = async (values: PermissionFormValues) => {
    try {
      setSubmitting(true);
      if (formMode === "create") {
        await permissionService.create(values);
      } else if (formMode === "edit" && editing?.id) {
        await permissionService.update(editing.id, values);
      }
      closeModal();
      // Refresh list by calling fetchPages directly
      await fetchPages();
    } catch (e) {
      console.error(e);
      alert("儲存失敗，請稍後再試");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async ({ reason, permanent }: { reason?: string; permanent?: boolean }) => {
    try {
      setSubmitting(true);
      if (!editing?.id) return;
      await permissionService.remove(editing.id, { reason, permanent: !!permanent });
      closeDeleteModal();
      // Refresh list by calling fetchPages directly
      await fetchPages();
    } catch (e) {
      console.error(e);
      alert("刪除失敗，請稍後再試");
    } finally {
      setSubmitting(false);
    }
  };

  const pagedData = useMemo(() => {
    const data = {
      page: currentPage,
      pageSize,
      total,
      items,
    };
    console.log("pagedData:", data);
    return data;
  }, [currentPage, pageSize, total, items]);

  return (
    <>
      <DataPage<PermissionDetail>
        data={pagedData}
        columns={columns}
        loading={loading}
        orderBy={orderBy}
        descending={descending}
        buttons={toolbarButtons}
        rowActions={rowActions}
        onSort={handleSort}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        onRowSelect={handleRowSelect}
        onClearSelectionRef={(clearFn) => {
          clearSelectionRef.current = clearFn;
        }}
      />

      <Modal
        title={formMode === "create" ? "新增權限" : "編輯權限"}
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[800px] w-full mx-4 p-6"
      >
        <PermissionDataForm mode={formMode} defaultValues={editing} onSubmit={handleSubmit} onCancel={closeModal} submitting={submitting} />
      </Modal>

      <Modal
        title={showDeleted ? "確認永久刪除權限" : "確認刪除權限"}
        isOpen={isDeleteOpen}
        onClose={closeDeleteModal}
        className="max-w-[560px] w-full mx-4 p-6"
      >
        <PermissionDeleteForm onSubmit={handleDelete} onCancel={closeDeleteModal} submitting={submitting} isPermanent={showDeleted} />
      </Modal>

      <Modal title="還原權限" isOpen={isRestoreOpen} onClose={closeRestoreModal} className="max-w-[500px] w-full mx-4 p-6">
        <RestoreForm
          ids={restoreIds}
          entityName="權限"
          onSubmit={handleRestoreConfirm}
          onCancel={closeRestoreModal}
          submitting={submitting}
        />
      </Modal>

      <Modal title="權限詳細資料" isOpen={isViewOpen} onClose={closeViewModal} className="max-w-[800px] w-full mx-4 p-6">
        {viewing && <PermissionDetailView permissionId={viewing.id} />}
      </Modal>
    </>
  );
}

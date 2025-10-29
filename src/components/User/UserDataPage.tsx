import { httpClient } from "@/api";
import { userService } from "@/api/services/userService";
import type { DataTableColumn, DataTableRowAction, PopoverType } from "@/components/DataPage";
import { CommonPageButton, DataPage } from "@/components/DataPage";
import { getRecycleButtonClassName } from "@/components/DataPage/PageButtonTypes";
import { Modal } from "@/components/ui/modal";
import Tooltip from "@/components/ui/tooltip";
import { Gender, PopoverPosition } from "@/const/enums";
import { useModal } from "@/hooks/useModal";
import { DateUtil } from "@/utils/dateUtil";
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MdCheck, MdClose, MdDelete, MdEdit, MdRestore, MdVisibility } from "react-icons/md";
import { TbCircleLetterSFilled } from "react-icons/tb";
import RestoreForm from "../DataPage/RestoreForm";
import UserDataForm, { type UserFormValues } from "./UserDataForm";
import UserDeleteForm from "./UserDeleteForm";
import UserDetailView from "./UserDetailView";
import UserSearchPopover, { type UserSearchFilters } from "./UserSearchPopover";

type UserDetail = {
  id: string;
  phone_number: string;
  email: string;
  verified: boolean;
  is_active: boolean;
  is_superuser: boolean;
  is_admin: boolean;
  last_login_at?: string;
  display_name?: string;
  gender?: Gender;
  is_ministry: boolean;
  created_at?: string;
  updated_at?: string;
  remark?: string;
};

interface UserPagesResponse {
  page: number; // 0-based from backend
  pageSize?: number; // API 可能返回 pageSize
  total: number;
  items?: UserDetail[];
}

export default function UserDataPage() {
  const [currentPage, setCurrentPage] = useState(1); // 1-based for UI
  const [pageSize, setPageSize] = useState(10);
  const [searchFilters, setSearchFilters] = useState<UserSearchFilters>({});
  const [appliedFilters, setAppliedFilters] = useState<UserSearchFilters>({});
  const [showDeleted, setShowDeleted] = useState(false);
  const [orderBy, setOrderBy] = useState<string>();
  const [descending, setDescending] = useState<boolean>();

  const [items, setItems] = useState<UserDetail[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  // Modal state
  const { isOpen, openModal, closeModal } = useModal(false);
  const { isOpen: isDeleteOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal(false);
  const { isOpen: isViewOpen, openModal: openViewModal, closeModal: closeViewModal } = useModal(false);
  const { isOpen: isRestoreOpen, openModal: openRestoreModal, closeModal: closeRestoreModal } = useModal(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<UserDetail | null>(null);
  const [viewing, setViewing] = useState<UserDetail | null>(null);
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
        verified: appliedFilters.verified,
        is_active: appliedFilters.is_active,
        is_admin: appliedFilters.is_admin,
        is_superuser: appliedFilters.is_superuser,
        is_ministry: appliedFilters.is_ministry,
        gender: appliedFilters.gender,
        deleted: showDeleted || undefined,
      } as Record<string, unknown>;

      const res = await httpClient.get<UserPagesResponse>("/api/v1/admin/user/pages", params);
      const data = res.data as UserPagesResponse;
      setItems(data.items || []);
      setTotal(data.total);
      // Backend page is 0-based; map back to 1-based UI if changed externally
      setCurrentPage(data.page + 1);
      // 處理 API 可能返回 pageSize 或 page_size 的情況
      const responsePageSize = data.pageSize || 10;
      setPageSize(responsePageSize);
    } catch (e) {
      console.error("Error fetching user pages:", e);
      // Simplified error surfacing for demo
      alert("載入失敗，請稍後重試");
    } finally {
      setLoading(false);
    }
  }, []); // 移除 clearSelection 依賴

  // Columns definition
  const columns: DataTableColumn<UserDetail>[] = useMemo(
    () => [
      {
        key: "phone_number",
        label: "手機號碼",
        sortable: true,
        width: "150px",
        tooltip: (row) => row.phone_number,
      },
      {
        key: "email",
        label: "電子郵件",
        sortable: true,
        width: "250px",
        tooltip: (row) => row.email,
      },
      {
        key: "display_name",
        label: "顯示名稱",
        sortable: true,
        width: "150px",
        tooltip: (row) => row.display_name || "",
      },
      {
        key: "gender",
        label: "性別",
        sortable: true,
        width: "80px",
        valueEnum: {
          item: (value: unknown) => {
            const v = value as Gender | undefined;
            if (v === Gender.Male) return { text: "男性", color: "text-blue-600" };
            if (v === Gender.Female) return { text: "女性", color: "text-pink-600" };
            if (v === Gender.Other) return { text: "其他", color: "text-purple-600" };
            return { text: "未知", color: "text-gray-500" };
          },
        },
      },
      {
        key: "is_verified",
        label: "已驗證",
        sortable: true,
        width: "70px",
        render: (value: unknown, row: UserDetail) => {
          return (
            <span
              className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
                row.verified
                  ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
                  : "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400"
              }`}
            >
              {row.verified ? <MdCheck size={16} /> : <MdClose size={16} />}
            </span>
          );
        },
      },
      {
        key: "is_active",
        label: "啟用",
        sortable: true,
        width: "70px",
        render: (value: unknown, row: UserDetail) => {
          return (
            <span
              className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
                row.is_active
                  ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
                  : "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400"
              }`}
            >
              {row.is_active ? <MdCheck size={16} /> : <MdClose size={16} />}
            </span>
          );
        },
      },
      {
        key: "is_admin",
        label: "管理員",
        sortable: true,
        width: "100px",
        render: (value: unknown, row: UserDetail) => {
          return (
            <div className="flex items-center gap-1">
              <span
                className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
                  row.is_admin
                    ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
                    : "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400"
                }`}
              >
                {row.is_admin ? <MdCheck size={16} /> : <MdClose size={16} />}
              </span>
              {row.is_admin && row.is_superuser && (
                <Tooltip content="超級管理員">
                  <TbCircleLetterSFilled size={24} className="text-blue-600 dark:text-blue-400" />
                </Tooltip>
              )}
            </div>
          );
        },
      },
      {
        key: "is_ministry",
        label: "服事",
        sortable: true,
        width: "70px",
        render: (value: unknown, row: UserDetail) => {
          return (
            <span
              className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
                row.is_ministry
                  ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
                  : "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400"
              }`}
            >
              {row.is_ministry ? <MdCheck size={16} /> : <MdClose size={16} />}
            </span>
          );
        },
      },
      {
        key: "last_login_at",
        label: "最後登入",
        sortable: true,
        width: "120px",
        render: (value: unknown) => {
          if (!value) return <span className="text-gray-400">從未登入</span>;
          const friendlyTime = DateUtil.friendlyDate(value);
          const shortTime = DateUtil.format(value);
          return (
            <Tooltip content={shortTime}>
              <span className="text-sm text-gray-600 dark:text-gray-400 cursor-help">{friendlyTime}</span>
            </Tooltip>
          );
        },
      },
      {
        key: "created_at",
        label: "建立時間",
        sortable: true,
        width: "120px",
        render: (value: unknown) => {
          if (!value) return null;
          const friendlyTime = DateUtil.friendlyDate(value);
          const shortTime = DateUtil.format(value);
          return (
            <Tooltip content={shortTime}>
              <span className="text-sm text-gray-600 dark:text-gray-400 cursor-help">{friendlyTime}</span>
            </Tooltip>
          );
        },
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

  const handleRowSelect = (selectedRows: UserDetail[], selectedKeys: string[]) => {
    setSelectedKeys(selectedKeys);
  };

  const handleBulkRestore = useCallback(async () => {
    setRestoreIds(selectedKeys);
    openRestoreModal();
  }, [selectedKeys, openRestoreModal]);

  const handleRestoreConfirm = async (ids: string[]) => {
    try {
      setSubmitting(true);
      await userService.restore(ids);
      await fetchPages();
      closeRestoreModal();
    } catch (e) {
      console.error(e);
      alert("批量還原失敗，請稍後再試");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSingleRestore = async (row: UserDetail) => {
    setRestoreIds([row.id]);
    openRestoreModal();
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
      <UserSearchPopover
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
        popover: { title: "搜尋用戶", position: PopoverPosition.BottomLeft, width: "500px" },
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
  const rowActions: DataTableRowAction<UserDetail>[] = useMemo(
    () => [
      {
        key: "view",
        label: "檢視",
        icon: <MdVisibility />,
        onClick: (row: UserDetail) => {
          setViewing(row);
          openViewModal();
        },
      },
      {
        key: "edit",
        label: "編輯",
        icon: <MdEdit />,
        onClick: (row: UserDetail) => {
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
        onClick: async (row: UserDetail) => {
          handleSingleRestore(row);
        },
        visible: showDeleted, // 僅在回收桶模式下顯示
      },
      {
        key: "delete",
        label: showDeleted ? "永久刪除" : "刪除",
        icon: <MdDelete />,
        variant: "danger",
        onClick: (row: UserDetail) => {
          setEditing(row);
          openDeleteModal();
        },
      },
    ],
    [openModal, openDeleteModal, openViewModal, showDeleted, fetchPages]
  );

  // Submit handlers
  const handleSubmit = async (values: UserFormValues) => {
    try {
      setSubmitting(true);
      if (formMode === "create") {
        await userService.create(values);
      } else if (formMode === "edit" && editing?.id) {
        await userService.update(editing.id, values);
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
      await userService.remove(editing.id, { reason, permanent: !!permanent });
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
    return data;
  }, [currentPage, pageSize, total, items]);

  return (
    <>
      <DataPage<UserDetail>
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
        title={formMode === "create" ? "新增用戶" : "編輯用戶"}
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[800px] w-full mx-4 p-6"
      >
        <UserDataForm mode={formMode} defaultValues={editing} onSubmit={handleSubmit} onCancel={closeModal} submitting={submitting} />
      </Modal>

      <Modal
        title={showDeleted ? "確認永久刪除用戶" : "確認刪除用戶"}
        isOpen={isDeleteOpen}
        onClose={closeDeleteModal}
        className="max-w-[560px] w-full mx-4 p-6"
      >
        <UserDeleteForm onSubmit={handleDelete} onCancel={closeDeleteModal} submitting={submitting} isPermanent={showDeleted} />
      </Modal>

      <Modal title="還原用戶" isOpen={isRestoreOpen} onClose={closeRestoreModal} className="max-w-[500px] w-full mx-4 p-6">
        <RestoreForm
          ids={restoreIds}
          entityName="用戶"
          onSubmit={handleRestoreConfirm}
          onCancel={closeRestoreModal}
          submitting={submitting}
        />
      </Modal>

      <Modal title="用戶詳細資料" isOpen={isViewOpen} onClose={closeViewModal} className="max-w-[900px] w-full mx-4 p-6">
        {viewing && <UserDetailView userId={viewing.id} />}
      </Modal>
    </>
  );
}

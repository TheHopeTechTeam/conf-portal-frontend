import {
  workshopRegistrationService,
  type WorkshopRegistrationDetail,
  type WorkshopRegistrationPageItem,
  type WorkshopRegistrationPagesResponse,
} from "@/api/services/workshopRegistrationService";
import type { DataTableColumn, MenuButtonType, PopoverType } from "@/components/DataPage";
import { CommonPageButton, CommonRowAction, DataPage } from "@/components/DataPage";
import DeleteForm from "@/components/DataPage/DeleteForm";
import { getRecycleButtonClassName } from "@/components/DataPage/PageButtonTypes";
import SearchPopoverContent from "@/components/DataPage/SearchPopoverContent";
import { Modal } from "@/components/ui/modal";
import Tooltip from "@/components/ui/tooltip";
import { PopoverPosition, Resource } from "@/const/enums";
import { useModal } from "@/hooks/useModal";
import moment from "moment";
import React, { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import WorkshopRegistrationDataForm, { type WorkshopRegistrationFormValues } from "./WorkshopRegistrationDataForm";

// 將 camelCase 轉換為 snake_case
const camelToSnakeCase = (str: string): string => {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};

const WorkshopRegistrationDataPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1); // 1-based for UI
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState("");
  const [searchDraft, setSearchDraft] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [orderBy, setOrderBy] = useState<string>();
  const [descending, setDescending] = useState<boolean>();

  const [items, setItems] = useState<WorkshopRegistrationPageItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Modal state
  const { isOpen, openModal, closeModal } = useModal(false);
  const { isOpen: isDeleteOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal(false);
  const { isOpen: isViewOpen, openModal: openViewModal, closeModal: closeViewModal } = useModal(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<WorkshopRegistrationDetail | null>(null);
  const [deleting, setDeleting] = useState<WorkshopRegistrationPageItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const clearSelectionRef = useRef<(() => void) | null>(null);

  // Fetch function - 使用 useRef 避免不必要的重新創建
  const fetchPagesRef = useRef({
    currentPage,
    pageSize,
    orderBy,
    descending,
    keyword,
    showDeleted,
  });

  // 更新 ref 當依賴項改變時
  fetchPagesRef.current = {
    currentPage,
    pageSize,
    orderBy,
    descending,
    keyword,
    showDeleted,
  };

  const fetchPages = useCallback(async () => {
    // 在 fetchPages 之前清除選中狀態
    clearSelectionRef.current?.();

    const { currentPage, pageSize, orderBy, descending, keyword, showDeleted } = fetchPagesRef.current;

    setLoading(true);
    try {
      const params = {
        page: Math.max(0, currentPage - 1),
        page_size: pageSize,
        order_by: orderBy && orderBy.trim() !== "" ? camelToSnakeCase(orderBy) : undefined,
        descending: orderBy && orderBy.trim() !== "" ? descending : undefined,
        keyword: keyword || undefined,
        is_registered: !showDeleted ? true : undefined,
        deleted: showDeleted || undefined,
      } as Record<string, unknown>;

      const res = await workshopRegistrationService.getPages(params);
      const data = res.data as WorkshopRegistrationPagesResponse;
      setItems(data.items || []);
      setTotal(data.total);
      // Backend page is 0-based; map back to 1-based UI if changed externally
      setCurrentPage(data.page + 1);
    } catch (e) {
      console.error("Error fetching workshop registration pages:", e);
      alert("載入失敗，請稍後重試");
    } finally {
      setLoading(false);
    }
  }, []);

  // Columns definition
  const columns: DataTableColumn<WorkshopRegistrationPageItem>[] = useMemo(
    () => [
      {
        key: "workshopTitle",
        label: "工作坊",
        sortable: false,
        width: "w-40 max-w-60",
        tooltip: true,
        tooltipWrapContent: false,
        render: (value: unknown) => {
          const title = value as string | undefined;
          return title || <span className="text-gray-400">未設置</span>;
        },
      },
      {
        key: "userDisplayName",
        label: "用戶名稱",
        sortable: false,
        width: "w-30 max-w-40",
        tooltip: true,
        tooltipWrapContent: false,
        render: (value: unknown) => {
          const name = value as string | undefined;
          return name || <span className="text-gray-400">未設置</span>;
        },
      },
      {
        key: "userEmail",
        label: "用戶郵箱",
        sortable: false,
        width: "w-40 max-w-60",
        tooltip: true,
        tooltipWrapContent: false,
        render: (value: unknown) => {
          const email = value as string | undefined;
          return email || <span className="text-gray-400">未設置</span>;
        },
      },
      {
        key: "registeredAt",
        label: "註冊時間",
        sortable: true,
        width: "w-40",
        render: (value: unknown) => {
          if (!value) return null;
          const dateStr = value as string;
          try {
            const formattedDate = moment(dateStr).format("YYYY-MM-DD HH:mm");
            return (
              <Tooltip content={dateStr} wrapContent={false}>
                <span className="text-sm text-gray-600 dark:text-gray-400 cursor-help">{formattedDate}</span>
              </Tooltip>
            );
          } catch (error) {
            console.error("Error formatting datetime:", error);
            return <span className="text-sm text-gray-600 dark:text-gray-400">{dateStr}</span>;
          }
        },
      },
      {
        key: "unregisteredAt",
        label: "取消註冊時間",
        sortable: false,
        width: "w-40",
        render: (value: unknown) => {
          if (!value) return <span className="text-green-600 dark:text-green-400">未取消註冊</span>;
          const dateStr = value as string;
          try {
            const formattedDate = moment(dateStr).format("YYYY-MM-DD HH:mm");
            return (
              <Tooltip content={dateStr} wrapContent={false}>
                <span className="text-sm text-red-600 dark:text-red-400 cursor-help">{formattedDate}</span>
              </Tooltip>
            );
          } catch (error) {
            console.error("Error formatting datetime:", error);
            return <span className="text-sm text-red-600 dark:text-red-400">{dateStr}</span>;
          }
        },
      },
    ],
    []
  );

  // Trigger fetch on dependencies change
  useEffect(() => {
    fetchPages();
  }, [currentPage, pageSize, orderBy, descending, keyword, showDeleted, fetchPages]);

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

  const handleRowSelect = (_selectedRows: WorkshopRegistrationPageItem[], _selectedKeys: string[]) => {
    // Handle row selection if needed in the future
    void _selectedRows;
    void _selectedKeys;
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
      <SearchPopoverContent
        value={searchDraft}
        onChange={setSearchDraft}
        onSearch={() => {
          setKeyword(searchDraft);
          setCurrentPage(1);
          onOpenChange(false); // 搜尋完成後關閉 Popover
        }}
        onClear={() => {
          setSearchDraft("");
          setKeyword("");
          setCurrentPage(1);
          onOpenChange(false); // 清除完成後關閉 Popover
        }}
        placeholder="輸入關鍵字"
        trigger={trigger}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        popover={popover}
      />
    );

    const buttons = [
      CommonPageButton.SEARCH(searchPopoverCallback, {
        popover: { title: "搜尋註冊記錄", position: PopoverPosition.BottomLeft, width: "300px" },
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
  }, [openModal, fetchPages, searchDraft, showDeleted]);

  // Row actions
  const rowActions: MenuButtonType<WorkshopRegistrationPageItem>[] = useMemo(
    () => [
      CommonRowAction.VIEW(async (row: WorkshopRegistrationPageItem) => {
        try {
          const response = await workshopRegistrationService.getById(row.id);
          setEditing(response.data);
          openViewModal();
        } catch (e) {
          console.error("Error fetching workshop registration detail:", e);
          alert("載入註冊詳情失敗，請稍後重試");
        }
      }),
      {
        key: "unregister",
        text: "取消註冊",
        onClick: async (row: WorkshopRegistrationPageItem) => {
          if (!row.unregisteredAt) {
            if (confirm("確定要取消此註冊嗎？")) {
              try {
                setSubmitting(true);
                await workshopRegistrationService.unregister(row.id);
                await fetchPages();
              } catch (e) {
                console.error("Error unregistering workshop registration:", e);
                alert("取消註冊失敗，請稍後重試");
              } finally {
                setSubmitting(false);
              }
            }
          } else {
            alert("此註冊已經被取消");
          }
        },
        visible: (row: WorkshopRegistrationPageItem) => !showDeleted && !row.unregisteredAt,
      },
      CommonRowAction.DELETE(
        async (row: WorkshopRegistrationPageItem) => {
          setDeleting(row);
          openDeleteModal();
        },
        {
          text: showDeleted ? "永久刪除" : "刪除",
        }
      ),
    ],
    [openDeleteModal, openViewModal, showDeleted, fetchPages]
  );

  // Submit handlers
  const handleSubmit = async (values: WorkshopRegistrationFormValues) => {
    try {
      setSubmitting(true);
      // 轉換為 API 格式 (snake_case)
      const apiPayload = {
        workshop_id: values.workshopId!,
        user_id: values.userId!,
      };

      if (formMode === "create") {
        await workshopRegistrationService.create(apiPayload);
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
      if (!deleting?.id) return;
      await workshopRegistrationService.remove(deleting.id, { reason, permanent: !!permanent });
      closeDeleteModal();
      setDeleting(null);
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
      <DataPage<WorkshopRegistrationPageItem>
        data={pagedData}
        columns={columns}
        loading={loading}
        singleSelect={!showDeleted}
        orderBy={orderBy}
        descending={descending}
        resource={Resource.WorkshopRegistration}
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
        title={formMode === "create" ? "新增工作坊註冊" : "編輯工作坊註冊"}
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[600px] w-full mx-4 p-6"
      >
        <WorkshopRegistrationDataForm
          mode={formMode}
          defaultValues={null}
          onSubmit={handleSubmit}
          onCancel={closeModal}
          submitting={submitting}
        />
      </Modal>

      <Modal
        title={showDeleted ? "確認永久刪除註冊記錄" : "確認刪除註冊記錄"}
        isOpen={isDeleteOpen}
        onClose={closeDeleteModal}
        className="max-w-[560px] w-full mx-4 p-6"
      >
        <DeleteForm
          onSubmit={handleDelete}
          onCancel={closeDeleteModal}
          submitting={submitting}
          entityName="註冊記錄"
          isPermanent={showDeleted}
        />
      </Modal>

      <Modal title="註冊記錄詳細資料" isOpen={isViewOpen} onClose={closeViewModal} className="max-w-[600px] w-full mx-4 p-6">
        {editing && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">工作坊</label>
              <p className="text-sm text-gray-900 dark:text-gray-100">{editing.workshop.title}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">用戶</label>
              <div className="space-y-1">
                {editing.user.displayName && <p className="text-sm text-gray-900 dark:text-gray-100">名稱: {editing.user.displayName}</p>}
                {editing.user.email && <p className="text-sm text-gray-900 dark:text-gray-100">郵箱: {editing.user.email}</p>}
                {editing.user.phoneNumber && <p className="text-sm text-gray-900 dark:text-gray-100">電話: {editing.user.phoneNumber}</p>}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default WorkshopRegistrationDataPage;

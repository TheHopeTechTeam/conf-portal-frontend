import { faqService, type FaqDetail, type FaqItem } from "@/api/services/faqService";
import type { DataTableColumn, MenuButtonType, PageButtonType, PopoverType } from "@/components/DataPage";
import { CommonPageButton, CommonRowAction, DataPage } from "@/components/DataPage";
import { getRecycleButtonClassName } from "@/components/DataPage/PageButtonTypes";
import RestoreForm from "@/components/DataPage/RestoreForm";
import { Modal } from "@/components/ui/modal";
import Tooltip from "@/components/ui/tooltip";
import { PopoverPosition, Resource, Verb } from "@/const/enums";
import { useNotification } from "@/context/NotificationContext";
import { useModal } from "@/hooks/useModal";
import { DateUtil } from "@/utils/dateUtil";
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MdCategory } from "react-icons/md";
import FaqCategoryManagementModal from "./FaqCategoryManagementModal";
import FaqDataForm, { type FaqFormValues } from "./FaqDataForm";
import FaqDeleteForm from "./FaqDeleteForm";
import FaqDetailView from "./FaqDetailView";
import FaqSearchPopover, { type FaqSearchFilters } from "./FaqSearchPopover";

interface FaqPagesResponse {
  page: number; // 0-based from backend
  pageSize?: number;
  total: number;
  items?: FaqItem[];
}

export default function FaqDataPage() {
  const [currentPage, setCurrentPage] = useState(1); // 1-based for UI
  const [pageSize, setPageSize] = useState(10);
  const [searchFilters, setSearchFilters] = useState<FaqSearchFilters>({});
  const [appliedFilters, setAppliedFilters] = useState<FaqSearchFilters>({});
  const [showDeleted, setShowDeleted] = useState(false);
  const [orderBy, setOrderBy] = useState<string>();
  const [descending, setDescending] = useState<boolean>();

  const [items, setItems] = useState<FaqItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  // Notification
  const { showNotification } = useNotification();

  // Modal state
  const { isOpen, openModal, closeModal } = useModal(false);
  const { isOpen: isDeleteOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal(false);
  const { isOpen: isViewOpen, openModal: openViewModal, closeModal: closeViewModal } = useModal(false);
  const { isOpen: isRestoreOpen, openModal: openRestoreModal, closeModal: closeRestoreModal } = useModal(false);
  const { isOpen: isCategoryModalOpen, openModal: openCategoryModal, closeModal: closeCategoryModal } = useModal(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<FaqDetail | null>(null);
  const [viewing, setViewing] = useState<FaqItem | null>(null);
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
        category_id: appliedFilters.categoryId,
        deleted: showDeleted || undefined,
      } as Record<string, unknown>;

      const res = await faqService.getPages(params);
      const data = res.data as FaqPagesResponse;
      setItems(data.items || []);
      setTotal(data.total);
      // Backend page is 0-based; map back to 1-based UI if changed externally
      setCurrentPage(data.page + 1);
    } catch (e) {
      console.error("Error fetching faq pages:", e);
      showNotification({
        variant: "error",
        title: "載入失敗",
        description: "無法載入常見問題資料，請稍後重試",
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  // Columns definition
  const columns: DataTableColumn<FaqItem>[] = useMemo(
    () => [
      {
        key: "question",
        label: "問題",
        sortable: true,
        width: "w-72",
        tooltip: true,
        render: (value: unknown) => {
          const question = value as string;
          return <span className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{question}</span>;
        },
      },
      {
        key: "categoryName",
        label: "分類",
        sortable: false,
        width: "w-36",
        render: (value: unknown) => {
          const categoryName = value as string | undefined;
          return categoryName || <span className="text-gray-400">未分類</span>;
        },
      },
      {
        key: "relatedLink",
        label: "相關連結",
        sortable: false,
        width: "w-48",
        render: (value: unknown) => {
          const relatedLink = value as string | undefined;
          if (!relatedLink) return <span className="text-gray-400">無</span>;
          return (
            <Tooltip content={relatedLink} wrapContent={false}>
              <a
                href={relatedLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline line-clamp-1"
              >
                {relatedLink}
              </a>
            </Tooltip>
          );
        },
      },
      {
        key: "remark",
        label: "備註",
        sortable: false,
        width: "w-48",
        tooltip: true,
        render: (value: unknown) => {
          const remark = value as string | undefined;
          return remark || <span className="text-gray-400">無</span>;
        },
      },
      {
        key: "createdAt",
        label: "建立時間",
        sortable: true,
        width: "w-32",
        render: (value: unknown) => {
          if (!value) return null;
          const friendlyTime = DateUtil.friendlyDate(value);
          const shortTime = DateUtil.format(value);
          return (
            <Tooltip content={shortTime} wrapContent={false}>
              <span className="text-sm text-gray-600 dark:text-gray-400 cursor-help">{friendlyTime}</span>
            </Tooltip>
          );
        },
      },
      {
        key: "updatedAt",
        label: "更新時間",
        sortable: true,
        width: "w-32",
        render: (value: unknown) => {
          if (!value) return null;
          const friendlyTime = DateUtil.friendlyDate(value);
          const shortTime = DateUtil.format(value);
          return (
            <Tooltip content={shortTime} wrapContent={false}>
              <span className="text-sm text-gray-600 dark:text-gray-400 cursor-help">{friendlyTime}</span>
            </Tooltip>
          );
        },
      },
    ],
    []
  );

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

  const handleRowSelect = (_selectedRows: FaqItem[], selectedKeys: string[]) => {
    setSelectedKeys(selectedKeys);
  };

  const handleBulkRestore = useCallback(async () => {
    setRestoreIds(selectedKeys);
    openRestoreModal();
  }, [selectedKeys, openRestoreModal]);

  const handleRestoreConfirm = async (ids: string[]) => {
    try {
      setSubmitting(true);
      await faqService.restore(ids);
      showNotification({
        variant: "success",
        title: "還原成功",
        description: `已成功還原 ${ids.length} 個常見問題`,
      });
      await fetchPages();
      closeRestoreModal();
      setSelectedKeys([]);
    } catch (e) {
      console.error(e);
      showNotification({
        variant: "error",
        title: "還原失敗",
        description: "無法還原常見問題，請稍後再試",
        position: "top-right",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSingleRestore = async (row: FaqItem) => {
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
      <FaqSearchPopover
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

    const buttons: PageButtonType[] = [
      CommonPageButton.SEARCH(searchPopoverCallback, {
        popover: { title: "搜尋常見問題", position: PopoverPosition.BottomLeft, width: "500px" },
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
      {
        key: "category",
        text: "分類管理",
        icon: <MdCategory className="size-4" />,
        onClick: openCategoryModal,
        align: "left",
        variant: "info",
        tooltip: "管理常見問題分類",
        size: "md",
        permission: Verb.Modify,
      },
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
  }, [openModal, fetchPages, searchFilters, showDeleted, selectedKeys, handleBulkRestore, openCategoryModal]);

  // Row actions
  const rowActions: MenuButtonType<FaqItem>[] = useMemo(
    () => [
      CommonRowAction.VIEW((row: FaqItem) => {
        setViewing(row);
        openViewModal();
      }),
      CommonRowAction.EDIT(
        async (row: FaqItem) => {
          try {
            const response = await faqService.getById(row.id);
            setEditing(response.data);
            setFormMode("edit");
            openModal();
          } catch (e) {
            console.error("Error fetching faq detail:", e);
            showNotification({
              variant: "error",
              title: "載入失敗",
              description: "無法載入常見問題詳情，請稍後重試",
              position: "top-right",
            });
          }
        },
        {
          visible: !showDeleted, // 僅在正常模式下顯示
        }
      ),
      CommonRowAction.RESTORE(
        async (row: FaqItem) => {
          handleSingleRestore(row);
        },
        {
          visible: showDeleted, // 僅在回收桶模式下顯示
        }
      ),
      CommonRowAction.DELETE(
        async (row: FaqItem) => {
          try {
            const response = await faqService.getById(row.id);
            setEditing(response.data);
            openDeleteModal();
          } catch (e) {
            console.error("Error fetching faq detail:", e);
            showNotification({
              variant: "error",
              title: "載入失敗",
              description: "無法載入常見問題詳情，請稍後重試",
              position: "top-right",
            });
          }
        },
        {
          text: showDeleted ? "永久刪除" : "刪除",
        }
      ),
    ],
    [openModal, openDeleteModal, openViewModal, showDeleted, fetchPages, handleSingleRestore]
  );

  // Submit handlers
  const handleSubmit = async (values: FaqFormValues) => {
    try {
      setSubmitting(true);
      if (formMode === "create") {
        await faqService.create(values);
        showNotification({
          variant: "success",
          title: "新增成功",
          description: `已成功新增常見問題「${values.question}」`,
        });
      } else if (formMode === "edit" && editing?.id) {
        await faqService.update(editing.id, values);
        showNotification({
          variant: "success",
          title: "更新成功",
          description: `已成功更新常見問題「${values.question}」`,
        });
      }
      closeModal();
      // Refresh list by calling fetchPages directly
      await fetchPages();
    } catch (e) {
      console.error(e);
      showNotification({
        variant: "error",
        title: "儲存失敗",
        description: "無法儲存常見問題資料，請稍後再試",
        position: "top-right",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async ({ reason, permanent }: { reason?: string; permanent?: boolean }) => {
    try {
      setSubmitting(true);
      if (!editing?.id) return;
      const deletedFaq = editing;
      await faqService.remove(editing.id, { reason, permanent: !!permanent });
      showNotification({
        variant: "success",
        title: permanent ? "永久刪除成功" : "刪除成功",
        description: `已成功${permanent ? "永久刪除" : "刪除"}常見問題「${deletedFaq.question}」`,
      });
      closeDeleteModal();
      // Refresh list by calling fetchPages directly
      await fetchPages();
    } catch (e) {
      console.error(e);
      showNotification({
        variant: "error",
        title: "刪除失敗",
        description: "無法刪除常見問題，請稍後再試",
        position: "top-right",
      });
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

  // Convert FaqDetail to FaqFormValues
  const editingFormValues = useMemo<FaqFormValues | null>(() => {
    if (!editing) return null;
    return {
      id: editing.id,
      categoryId: editing.category?.id || "",
      question: editing.question,
      answer: editing.answer,
      relatedLink: editing.relatedLink,
      remark: editing.remark,
      description: editing.description,
    };
  }, [editing]);

  return (
    <>
      <DataPage<FaqItem>
        data={pagedData}
        columns={columns}
        loading={loading}
        singleSelect
        orderBy={orderBy}
        descending={descending}
        resource={Resource.SupportFaq}
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
        title={formMode === "create" ? "新增常見問題" : "編輯常見問題"}
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[800px] w-full mx-4 p-6"
      >
        <FaqDataForm
          mode={formMode}
          defaultValues={editingFormValues}
          onSubmit={handleSubmit}
          onCancel={closeModal}
          submitting={submitting}
        />
      </Modal>

      <Modal
        title={showDeleted ? "確認永久刪除常見問題" : "確認刪除常見問題"}
        isOpen={isDeleteOpen}
        onClose={closeDeleteModal}
        className="max-w-[560px] w-full mx-4 p-6"
      >
        <FaqDeleteForm onSubmit={handleDelete} onCancel={closeDeleteModal} submitting={submitting} isPermanent={showDeleted} />
      </Modal>

      <Modal title="還原常見問題" isOpen={isRestoreOpen} onClose={closeRestoreModal} className="max-w-[500px] w-full mx-4 p-6">
        <RestoreForm
          ids={restoreIds}
          entityName="常見問題"
          onSubmit={handleRestoreConfirm}
          onCancel={closeRestoreModal}
          submitting={submitting}
        />
      </Modal>

      <Modal title="常見問題詳細資料" isOpen={isViewOpen} onClose={closeViewModal} className="max-w-[900px] w-full mx-4 p-6">
        {viewing && <FaqDetailView faqId={viewing.id} />}
      </Modal>

      <FaqCategoryManagementModal isOpen={isCategoryModalOpen} onClose={closeCategoryModal} />
    </>
  );
}

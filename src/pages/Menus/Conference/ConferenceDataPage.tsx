import { conferenceService, type ConferenceDetail, type ConferenceItem } from "@/api/services/conferenceService";
import type { DataTableColumn, DataTableRowAction, PopoverType } from "@/components/DataPage";
import { CommonPageButton, CommonRowAction, DataPage } from "@/components/DataPage";
import { getRecycleButtonClassName } from "@/components/DataPage/PageButtonTypes";
import RestoreForm from "@/components/DataPage/RestoreForm";
import { Modal } from "@/components/ui/modal";
import Tooltip from "@/components/ui/tooltip";
import { PopoverPosition } from "@/const/enums";
import { useModal } from "@/hooks/useModal";
import { DateUtil } from "@/utils/dateUtil";
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import ConferenceDataForm, { type ConferenceFormValues } from "./ConferenceDataForm";
import ConferenceDeleteForm from "./ConferenceDeleteForm";
import ConferenceDetailView from "./ConferenceDetailView";
import ConferenceSearchPopover, { type ConferenceSearchFilters } from "./ConferenceSearchPopover";

interface ConferencePagesResponse {
  page: number; // 0-based from backend
  pageSize?: number;
  total: number;
  items?: ConferenceItem[];
}

export default function ConferenceDataPage() {
  const [currentPage, setCurrentPage] = useState(1); // 1-based for UI
  const [pageSize, setPageSize] = useState(10);
  const [searchFilters, setSearchFilters] = useState<ConferenceSearchFilters>({});
  const [appliedFilters, setAppliedFilters] = useState<ConferenceSearchFilters>({});
  const [showDeleted, setShowDeleted] = useState(false);
  const [orderBy, setOrderBy] = useState<string>();
  const [descending, setDescending] = useState<boolean>();

  const [items, setItems] = useState<ConferenceItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  // Modal state
  const { isOpen, openModal, closeModal } = useModal(false);
  const { isOpen: isDeleteOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal(false);
  const { isOpen: isViewOpen, openModal: openViewModal, closeModal: closeViewModal } = useModal(false);
  const { isOpen: isRestoreOpen, openModal: openRestoreModal, closeModal: closeRestoreModal } = useModal(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<ConferenceDetail | null>(null);
  const [viewing, setViewing] = useState<ConferenceItem | null>(null);
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

      const res = await conferenceService.getPages(params);
      const data = res.data as ConferencePagesResponse;
      setItems(data.items || []);
      setTotal(data.total);
      // Backend page is 0-based; map back to 1-based UI if changed externally
      setCurrentPage(data.page + 1);
      // 處理 API 可能返回 pageSize 的情況
      const responsePageSize = data.pageSize || 10;
      setPageSize(responsePageSize);
    } catch (e) {
      console.error("Error fetching conference pages:", e);
      // Simplified error surfacing for demo
      alert("載入失敗，請稍後重試");
    } finally {
      setLoading(false);
    }
  }, []);

  // Columns definition
  const columns: DataTableColumn<ConferenceItem>[] = useMemo(
    () => [
      {
        key: "title",
        label: "會議標題",
        sortable: false,
        width: "w-40 max-w-60",
        tooltip: true,
        tooltipWrapContent: false,
      },
      {
        key: "startDate",
        label: "開始日期",
        sortable: true,
        width: "w-32",
        render: (value: unknown) => {
          if (!value) return null;
          const dateStr = value as string;
          const formattedDate = DateUtil.format(dateStr, "YYYY-MM-DD");
          return (
            <Tooltip content={formattedDate || dateStr} wrapContent={false}>
              <span className="text-sm text-gray-600 dark:text-gray-400 cursor-help">{dateStr}</span>
            </Tooltip>
          );
        },
      },
      {
        key: "endDate",
        label: "結束日期",
        sortable: true,
        width: "w-32",
        render: (value: unknown) => {
          if (!value) return null;
          const dateStr = value as string;
          const formattedDate = DateUtil.format(dateStr, "YYYY-MM-DD");
          return (
            <Tooltip content={formattedDate || dateStr} wrapContent={false}>
              <span className="text-sm text-gray-600 dark:text-gray-400 cursor-help">{dateStr}</span>
            </Tooltip>
          );
        },
      },
      {
        key: "locationName",
        label: "地點",
        sortable: false,
        width: "w-30 max-w-40",
        tooltip: true,
        tooltipWrapContent: false,
        render: (value: unknown) => {
          const locationName = value as string | undefined;
          return locationName || <span className="text-gray-400">未設置</span>;
        },
      },
      {
        key: "isActive",
        label: "狀態",
        sortable: true,
        width: "w-24",
        render: (value: unknown) => {
          const isActive = value as boolean | undefined;
          const active = isActive !== undefined ? isActive : true;
          return (
            <span className={active ? "text-green-600 dark:text-green-400" : "text-gray-600 dark:text-gray-400"}>
              {active ? "已啟用" : "未啟用"}
            </span>
          );
        },
      },
      {
        key: "remark",
        label: "備註",
        sortable: false,
        width: "w-48",
        tooltip: true,
        tooltipWidth: "max-w-48",
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

  const handleRowSelect = (_selectedRows: ConferenceItem[], selectedKeys: string[]) => {
    setSelectedKeys(selectedKeys);
  };

  const handleBulkRestore = useCallback(async () => {
    setRestoreIds(selectedKeys);
    openRestoreModal();
  }, [selectedKeys, openRestoreModal]);

  const handleRestoreConfirm = async (ids: string[]) => {
    try {
      setSubmitting(true);
      await conferenceService.restore(ids);
      await fetchPages();
      closeRestoreModal();
    } catch (e) {
      console.error(e);
      alert("批量還原失敗，請稍後再試");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSingleRestore = async (row: ConferenceItem) => {
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
      <ConferenceSearchPopover
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
        popover: { title: "搜尋會議", position: PopoverPosition.BottomLeft, width: "500px" },
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
  const rowActions: DataTableRowAction<ConferenceItem>[] = useMemo(
    () => [
      CommonRowAction.VIEW((row: ConferenceItem) => {
        setViewing(row);
        openViewModal();
      }),
      CommonRowAction.EDIT(
        async (row: ConferenceItem) => {
          try {
            const response = await conferenceService.getById(row.id);
            setEditing(response.data);
            setFormMode("edit");
            openModal();
          } catch (e) {
            console.error("Error fetching conference detail:", e);
            alert("載入會議詳情失敗，請稍後重試");
          }
        },
        {
          visible: !showDeleted, // 僅在正常模式下顯示
        }
      ),
      CommonRowAction.RESTORE(
        async (row: ConferenceItem) => {
          handleSingleRestore(row);
        },
        {
          visible: showDeleted, // 僅在回收桶模式下顯示
        }
      ),
      CommonRowAction.DELETE(
        async (row: ConferenceItem) => {
          try {
            const response = await conferenceService.getById(row.id);
            setEditing(response.data);
            openDeleteModal();
          } catch (e) {
            console.error("Error fetching conference detail:", e);
            alert("載入會議詳情失敗，請稍後重試");
          }
        },
        {
          label: showDeleted ? "永久刪除" : "刪除",
        }
      ),
    ],
    [openModal, openDeleteModal, openViewModal, showDeleted, fetchPages, handleSingleRestore]
  );

  // Submit handlers
  const handleSubmit = async (values: ConferenceFormValues) => {
    try {
      setSubmitting(true);
      if (formMode === "create") {
        await conferenceService.create(values);
      } else if (formMode === "edit" && editing?.id) {
        await conferenceService.update(editing.id, values);
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
      await conferenceService.remove(editing.id, { reason, permanent: !!permanent });
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

  // Convert ConferenceDetail to ConferenceFormValues
  const editingFormValues = useMemo<ConferenceFormValues | null>(() => {
    if (!editing) return null;

    return {
      id: editing.id,
      title: editing.title,
      startDate: editing.startDate,
      endDate: editing.endDate,
      isActive: editing.isActive,
      locationId: editing.location?.id,
      remark: editing.remark,
      description: editing.description,
    };
  }, [editing]);

  return (
    <>
      <DataPage<ConferenceItem>
        data={pagedData}
        columns={columns}
        loading={loading}
        orderBy={orderBy}
        descending={descending}
        resource="conference:conferences"
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
        title={formMode === "create" ? "新增會議" : "編輯會議"}
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[900px] w-full mx-4 p-6"
      >
        <ConferenceDataForm
          mode={formMode}
          defaultValues={editingFormValues}
          onSubmit={handleSubmit}
          onCancel={closeModal}
          submitting={submitting}
        />
      </Modal>

      <Modal
        title={showDeleted ? "確認永久刪除會議" : "確認刪除會議"}
        isOpen={isDeleteOpen}
        onClose={closeDeleteModal}
        className="max-w-[560px] w-full mx-4 p-6"
      >
        <ConferenceDeleteForm onSubmit={handleDelete} onCancel={closeDeleteModal} submitting={submitting} isPermanent={showDeleted} />
      </Modal>

      <Modal title="還原會議" isOpen={isRestoreOpen} onClose={closeRestoreModal} className="max-w-[500px] w-full mx-4 p-6">
        <RestoreForm
          ids={restoreIds}
          entityName="會議"
          onSubmit={handleRestoreConfirm}
          onCancel={closeRestoreModal}
          submitting={submitting}
        />
      </Modal>

      <Modal title="會議詳細資料" isOpen={isViewOpen} onClose={closeViewModal} className="max-w-[900px] w-full mx-4 p-6">
        {viewing && <ConferenceDetailView conferenceId={viewing.id} />}
      </Modal>
    </>
  );
}

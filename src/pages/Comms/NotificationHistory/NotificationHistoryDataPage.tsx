import { NotificationHistoryStatus, notificationService, type AdminNotificationHistoryItem } from "@/api/services/notificationService";
import type { DataTableColumn, MenuButtonType, PageButtonType, PopoverType } from "@/components/DataPage";
import { CommonPageButton, CommonRowAction, DataPage } from "@/components/DataPage";
import { getRecycleButtonClassName } from "@/components/DataPage/PageButtonTypes";
import { Modal } from "@/components/ui/modal";
import Tooltip from "@/components/ui/tooltip";
import { PopoverPosition, Resource } from "@/const/enums";
import { useNotification } from "@/context/NotificationContext";
import { useModal } from "@/hooks/useModal";
import { DateUtil } from "@/utils/dateUtil";
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import NotificationHistoryDetailView from "./NotificationHistoryDetailView";
import NotificationHistorySearchPopover, { type NotificationHistorySearchFilters } from "./NotificationHistorySearchPopover";

interface NotificationHistoryPagesResponse {
  page: number;
  page_size: number;
  total: number;
  items: AdminNotificationHistoryItem[];
}

const getStatusText = (status: number) => {
  switch (status) {
    case NotificationHistoryStatus.PENDING:
      return "待處理";
    case NotificationHistoryStatus.SUCCESS:
      return "成功";
    case NotificationHistoryStatus.FAILED:
      return "失敗";
    case NotificationHistoryStatus.DRY_RUN:
      return "試跑";
    default:
      return "未知";
  }
};

const getStatusColor = (status: number) => {
  switch (status) {
    case NotificationHistoryStatus.PENDING:
      return "text-amber-600 dark:text-amber-400";
    case NotificationHistoryStatus.SUCCESS:
      return "text-green-600 dark:text-green-400";
    case NotificationHistoryStatus.FAILED:
      return "text-red-600 dark:text-red-400";
    case NotificationHistoryStatus.DRY_RUN:
      return "text-gray-600 dark:text-gray-400";
    default:
      return "text-gray-500 dark:text-gray-400";
  }
};

export default function NotificationHistoryDataPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchFilters, setSearchFilters] = useState<NotificationHistorySearchFilters>({});
  const [appliedFilters, setAppliedFilters] = useState<NotificationHistorySearchFilters>({});
  const [showDeleted, setShowDeleted] = useState(false);
  const [orderBy, setOrderBy] = useState<string>();
  const [descending, setDescending] = useState<boolean>();

  const [items, setItems] = useState<AdminNotificationHistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const { showNotification } = useNotification();
  const { isOpen: isViewOpen, openModal: openViewModal, closeModal: closeViewModal } = useModal(false);
  const [viewing, setViewing] = useState<AdminNotificationHistoryItem | null>(null);

  const clearSelectionRef = useRef<(() => void) | null>(null);

  const fetchPagesRef = useRef({
    currentPage,
    pageSize,
    orderBy,
    descending,
    appliedFilters,
    showDeleted,
  });
  fetchPagesRef.current = {
    currentPage,
    pageSize,
    orderBy,
    descending,
    appliedFilters,
    showDeleted,
  };

  const fetchPages = useCallback(async () => {
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
        notification_id: appliedFilters.notification_id || undefined,
        user_id: appliedFilters.user_id || undefined,
        status: appliedFilters.status,
        deleted: showDeleted || undefined,
      } as Record<string, unknown>;

      const res = await notificationService.getHistoryPages(params);
      const data = res.data as NotificationHistoryPagesResponse;
      setItems(data.items ?? []);
      setTotal(data.total);
      setCurrentPage(data.page + 1);
    } catch (e) {
      console.error("Error fetching notification history pages:", e);
      showNotification({
        variant: "error",
        title: "載入失敗",
        description: "無法載入通知歷史，請稍後重試",
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  const columns: DataTableColumn<AdminNotificationHistoryItem>[] = useMemo(
    () => [
      {
        key: "notification_id",
        label: "通知 ID",
        width: "w-56",
        tooltip: (row) => row.notification_id,
        render: (_, row) => (
          <span className="font-mono text-xs truncate block max-w-48" title={row.notification_id}>
            {row.notification_id}
          </span>
        ),
      },
      {
        key: "user_display_name",
        label: "用戶",
        width: "w-36",
        tooltip: (row) => row.user_display_name || row.user_email || row.user_phone_number || "—",
      },
      {
        key: "user_email",
        label: "電子郵件",
        width: "w-48",
        tooltip: (row) => row.user_email ?? "",
      },
      {
        key: "status",
        label: "狀態",
        sortable: true,
        width: "w-24",
        render: (value: unknown) => {
          const v = value as number;
          return <span className={getStatusColor(v)}>{getStatusText(v)}</span>;
        },
      },
      {
        key: "is_read",
        label: "已讀",
        width: "w-18",
        render: (value: unknown) => (
          <span className={value ? "text-green-600 dark:text-green-400" : "text-gray-400 dark:text-gray-500"}>{value ? "是" : "否"}</span>
        ),
      },
      {
        key: "exception",
        label: "異常",
        width: "w-40",
        tooltip: (row) => row.exception ?? "",
        render: (value: unknown) => (
          <span className="text-red-600 dark:text-red-400 truncate block max-w-40" title={String(value ?? "")}>
            {value ? "有" : "—"}
          </span>
        ),
      },
      {
        key: "created_at",
        label: "建立時間",
        sortable: true,
        width: "w-32",
        render: (value: unknown) => {
          if (!value) return null;
          const friendlyTime = DateUtil.friendlyDate(value as string);
          const shortTime = DateUtil.format(value as string);
          return (
            <Tooltip content={shortTime}>
              <span className="text-sm text-gray-600 dark:text-gray-400 cursor-help">{friendlyTime}</span>
            </Tooltip>
          );
        },
      },
    ],
    [],
  );

  useEffect(() => {
    fetchPages();
  }, [currentPage, pageSize, orderBy, descending, appliedFilters, showDeleted, fetchPages]);

  const handleSort = (columnKey: string | null, newDescending: boolean) => {
    if (columnKey === null) {
      setOrderBy("");
      setDescending(false);
    } else {
      setOrderBy(columnKey);
      setDescending(newDescending);
    }
  };

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handleItemsPerPageChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };
  const handleRowSelect = (_selectedRows: AdminNotificationHistoryItem[], keys: string[]) => {
    // no bulk actions for history
  };

  const toolbarButtons = useMemo(() => {
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
      <NotificationHistorySearchPopover
        filters={searchFilters}
        onFiltersChange={setSearchFilters}
        onSearch={(filters) => {
          setAppliedFilters(filters);
          setCurrentPage(1);
          onOpenChange(false);
        }}
        onClear={() => {
          setSearchFilters({});
          setAppliedFilters({});
          setCurrentPage(1);
          onOpenChange(false);
        }}
        trigger={trigger}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        popover={popover}
      />
    );

    const buttons: PageButtonType[] = [
      CommonPageButton.SEARCH(searchPopoverCallback, {
        popover: { title: "搜尋通知歷史", position: PopoverPosition.BottomLeft, width: "400px" },
      }),
      CommonPageButton.REFRESH(() => fetchPages()),
      CommonPageButton.RECYCLE(
        () => {
          setShowDeleted(!showDeleted);
          setCurrentPage(1);
        },
        { className: getRecycleButtonClassName(showDeleted) },
      ),
    ];
    return buttons;
  }, [fetchPages, searchFilters, showDeleted]);

  const rowActions: MenuButtonType<AdminNotificationHistoryItem>[] = useMemo(
    () => [
      CommonRowAction.VIEW((row: AdminNotificationHistoryItem) => {
        setViewing(row);
        openViewModal();
      }),
    ],
    [openViewModal],
  );

  const pagedData = useMemo(() => ({ page: currentPage, pageSize, total, items }), [currentPage, pageSize, total, items]);

  return (
    <>
      <DataPage<AdminNotificationHistoryItem>
        data={pagedData}
        columns={columns}
        loading={loading}
        singleSelect
        orderBy={orderBy}
        descending={descending}
        resource={Resource.CommsNotificationHistory}
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

      <Modal title="通知歷史詳情" isOpen={isViewOpen} onClose={closeViewModal} className="max-w-[560px] w-full mx-4 p-6">
        {viewing && <NotificationHistoryDetailView item={viewing} />}
      </Modal>
    </>
  );
}

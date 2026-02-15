import { notificationService, type AdminNotificationItem } from "@/api/services/notificationService";
import {
  NotificationMethod,
  NotificationStatus,
  NotificationType,
} from "@/api/services/notificationService";
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
import NotificationDataForm, { type NotificationFormValues } from "./NotificationDataForm";
import NotificationDetailView from "./NotificationDetailView";
import NotificationSearchPopover, { type NotificationSearchFilters } from "./NotificationSearchPopover";

interface NotificationPagesResponse {
  page: number;
  page_size: number;
  total: number;
  items?: AdminNotificationItem[];
}

const getStatusText = (status: number) => {
  switch (status) {
    case NotificationStatus.PENDING:
      return "待處理";
    case NotificationStatus.SENT:
      return "已發送";
    case NotificationStatus.FAILED:
      return "失敗";
    case NotificationStatus.DRY_RUN:
      return "試跑";
    default:
      return "未知";
  }
};

const getStatusColor = (status: number) => {
  switch (status) {
    case NotificationStatus.PENDING:
      return "text-amber-600 dark:text-amber-400";
    case NotificationStatus.SENT:
      return "text-green-600 dark:text-green-400";
    case NotificationStatus.FAILED:
      return "text-red-600 dark:text-red-400";
    case NotificationStatus.DRY_RUN:
      return "text-gray-600 dark:text-gray-400";
    default:
      return "text-gray-500 dark:text-gray-400";
  }
};

export default function NotificationDataPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchFilters, setSearchFilters] = useState<NotificationSearchFilters>({});
  const [appliedFilters, setAppliedFilters] = useState<NotificationSearchFilters>({});
  const [showDeleted, setShowDeleted] = useState(false);
  const [orderBy, setOrderBy] = useState<string>();
  const [descending, setDescending] = useState<boolean>();

  const [items, setItems] = useState<AdminNotificationItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  const { showNotification } = useNotification();
  const { isOpen, openModal, closeModal } = useModal(false);
  const { isOpen: isViewOpen, openModal: openViewModal, closeModal: closeViewModal } = useModal(false);
  const [viewing, setViewing] = useState<AdminNotificationItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
        method: appliedFilters.method,
        type: appliedFilters.type,
        status: appliedFilters.status,
        deleted: showDeleted || undefined,
      } as Record<string, unknown>;

      const res = await notificationService.getPages(params);
      const data = res.data as NotificationPagesResponse;
      setItems(data.items ?? []);
      setTotal(data.total);
      setCurrentPage(data.page + 1);
    } catch (e) {
      console.error("Error fetching notification pages:", e);
      showNotification({
        variant: "error",
        title: "載入失敗",
        description: "無法載入通知資料，請稍後重試",
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  const columns: DataTableColumn<AdminNotificationItem>[] = useMemo(
    () => [
      {
        key: "title",
        label: "標題",
        sortable: true,
        width: "w-48",
        tooltip: (row) => row.title,
      },
      {
        key: "message",
        label: "內容",
        width: "w-64",
        tooltip: (row) => row.message,
      },
      {
        key: "method",
        label: "方式",
        sortable: true,
        width: "w-24",
        valueEnum: {
          item: (value: unknown) => {
            const v = value as number;
            return v === NotificationMethod.PUSH
              ? { text: "推播", color: "text-blue-600 dark:text-blue-400" }
              : { text: "郵件", color: "text-purple-600 dark:text-purple-400" };
          },
        },
      },
      {
        key: "type",
        label: "類型",
        sortable: true,
        width: "w-24",
        valueEnum: {
          item: (value: unknown) => {
            const v = value as number;
            if (v === NotificationType.INDIVIDUAL)
              return { text: "單一", color: "text-gray-600 dark:text-gray-400" };
            if (v === NotificationType.MULTIPLE)
              return { text: "群組", color: "text-gray-700 dark:text-gray-300" };
            if (v === NotificationType.SYSTEM)
              return { text: "系統群發", color: "text-blue-600 dark:text-blue-400" };
            return { text: "—", color: "text-gray-500 dark:text-gray-400" };
          },
        },
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
        key: "success_count",
        label: "成功",
        sortable: true,
        width: "w-20",
      },
      {
        key: "failure_count",
        label: "失敗",
        sortable: true,
        width: "w-20",
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
    []
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
  const handleRowSelect = (_selectedRows: AdminNotificationItem[], keys: string[]) => setSelectedKeys(keys);

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
      <NotificationSearchPopover
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
        popover: { title: "搜尋通知", position: PopoverPosition.BottomLeft, width: "400px" },
      }),
      CommonPageButton.ADD(
        () => openModal(),
        { visible: !showDeleted }
      ),
      CommonPageButton.REFRESH(() => fetchPages()),
    ];
    return buttons;
  }, [openModal, fetchPages, searchFilters, showDeleted]);

  const rowActions: MenuButtonType<AdminNotificationItem>[] = useMemo(
    () => [
      CommonRowAction.VIEW((row: AdminNotificationItem) => {
        setViewing(row);
        openViewModal();
      }),
    ],
    [openViewModal]
  );

  const handleSubmit = async (values: NotificationFormValues) => {
    try {
      setSubmitting(true);
      await notificationService.create(values);
      showNotification({
        variant: "success",
        title: "發送成功",
        description: "通知已建立並發送",
      });
      closeModal();
      await fetchPages();
    } catch (e) {
      console.error(e);
      showNotification({
        variant: "error",
        title: "發送失敗",
        description: "無法發送通知，請稍後再試",
        position: "top-right",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const pagedData = useMemo(
    () => ({ page: currentPage, pageSize, total, items }),
    [currentPage, pageSize, total, items]
  );

  return (
    <>
      <DataPage<AdminNotificationItem>
        data={pagedData}
        columns={columns}
        loading={loading}
        singleSelect={!showDeleted}
        orderBy={orderBy}
        descending={descending}
        resource={Resource.CommsNotification}
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
        title="發送通知"
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[600px] w-full mx-4 p-6"
      >
        <NotificationDataForm onSubmit={handleSubmit} onCancel={closeModal} submitting={submitting} />
      </Modal>

      <Modal
        title="通知詳情"
        isOpen={isViewOpen}
        onClose={closeViewModal}
        className="max-w-[640px] w-full mx-4 p-6"
      >
        {viewing && <NotificationDetailView item={viewing} />}
      </Modal>
    </>
  );
}

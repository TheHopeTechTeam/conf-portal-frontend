import { feedbackService, FeedbackStatus, type FeedbackDetail } from "@/api/services/feedbackService";
import type { DataTableColumn, DataTableRowAction, PopoverType } from "@/components/DataPage";
import { CommonPageButton, DataPage } from "@/components/DataPage";
import { getRecycleButtonClassName } from "@/components/DataPage/PageButtonTypes";
import { Modal } from "@/components/ui/modal";
import Tooltip from "@/components/ui/tooltip";
import { PopoverPosition } from "@/const/enums";
import { useModal } from "@/hooks/useModal";
import { DateUtil } from "@/utils/dateUtil";
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MdEdit, MdVisibility } from "react-icons/md";
import FeedbackDetailView from "./FeedbackDetailView";
import FeedbackSearchPopover, { type FeedbackSearchFilters } from "./FeedbackSearchPopover";
import FeedbackStatusUpdateForm from "./FeedbackStatusUpdateForm";

interface FeedbackPagesResponse {
  page: number; // 0-based from backend
  pageSize?: number;
  total: number;
  items?: FeedbackDetail[];
}

const getStatusText = (status: FeedbackStatus) => {
  switch (status) {
    case FeedbackStatus.PENDING:
      return "待處理";
    case FeedbackStatus.REVIEW:
      return "審查中";
    case FeedbackStatus.DISCUSSION:
      return "討論中";
    case FeedbackStatus.ACCEPTED:
      return "已接受";
    case FeedbackStatus.DONE:
      return "已完成";
    case FeedbackStatus.REJECTED:
      return "已拒絕";
    case FeedbackStatus.ARCHIVED:
      return "已歸檔";
    default:
      return "未知";
  }
};

const getStatusColor = (status: FeedbackStatus) => {
  switch (status) {
    case FeedbackStatus.PENDING:
      return "text-yellow-600 dark:text-yellow-400";
    case FeedbackStatus.REVIEW:
      return "text-blue-600 dark:text-blue-400";
    case FeedbackStatus.DISCUSSION:
      return "text-purple-600 dark:text-purple-400";
    case FeedbackStatus.ACCEPTED:
      return "text-green-600 dark:text-green-400";
    case FeedbackStatus.DONE:
      return "text-green-700 dark:text-green-300";
    case FeedbackStatus.REJECTED:
      return "text-red-600 dark:text-red-400";
    case FeedbackStatus.ARCHIVED:
      return "text-gray-600 dark:text-gray-400";
    default:
      return "text-gray-500 dark:text-gray-400";
  }
};

export default function FeedbackDataPage() {
  const [currentPage, setCurrentPage] = useState(1); // 1-based for UI
  const [pageSize, setPageSize] = useState(10);
  const [searchFilters, setSearchFilters] = useState<FeedbackSearchFilters>({});
  const [appliedFilters, setAppliedFilters] = useState<FeedbackSearchFilters>({});
  const [showDeleted, setShowDeleted] = useState(false);
  const [orderBy, setOrderBy] = useState<string>();
  const [descending, setDescending] = useState<boolean>();

  const [items, setItems] = useState<FeedbackDetail[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Modal state
  const { isOpen: isViewOpen, openModal: openViewModal, closeModal: closeViewModal } = useModal(false);
  const { isOpen: isStatusUpdateOpen, openModal: openStatusUpdateModal, closeModal: closeStatusUpdateModal } = useModal(false);
  const [viewing, setViewing] = useState<FeedbackDetail | null>(null);
  const [statusUpdating, setStatusUpdating] = useState<FeedbackDetail | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
    const { currentPage, pageSize, orderBy, descending, appliedFilters, showDeleted } = fetchPagesRef.current;

    setLoading(true);
    try {
      const params = {
        page: Math.max(0, currentPage - 1),
        pageSize: pageSize,
        orderBy: orderBy && orderBy.trim() !== "" ? orderBy : undefined,
        descending: orderBy && orderBy.trim() !== "" ? descending : undefined,
        keyword: appliedFilters.keyword || undefined,
        status: appliedFilters.status,
        deleted: showDeleted || undefined,
      } as Record<string, unknown>;

      const res = await feedbackService.getPages(params);
      const data = res.data as FeedbackPagesResponse;
      setItems(data.items || []);
      setTotal(data.total);
      // Backend page is 0-based; map back to 1-based UI if changed externally
      setCurrentPage(data.page + 1);
      // 處理 API 可能返回 pageSize 的情況
      const responsePageSize = data.pageSize || 10;
      setPageSize(responsePageSize);
    } catch (e) {
      console.error("Error fetching feedback pages:", e);
      // Simplified error surfacing for demo
      alert("載入失敗，請稍後重試");
    } finally {
      setLoading(false);
    }
  }, []);

  // Columns definition
  const columns: DataTableColumn<FeedbackDetail>[] = useMemo(
    () => [
      {
        key: "name",
        label: "姓名",
        sortable: true,
        width: "w-40",
        tooltip: (row) => row.name,
      },
      {
        key: "email",
        label: "電子郵件",
        sortable: true,
        width: "w-60",
        overflow: true,
        tooltip: (row) => row.email || "",
        render: (value: unknown) => {
          const email = value as string | undefined;
          return email || <span className="text-gray-400">未提供</span>;
        },
      },
      {
        key: "message",
        label: "訊息",
        sortable: false,
        width: "w-auto",
        overflow: true,
        tooltip: true,
        tooltipWidth: "w-auto max-w-[500px]",
      },
      {
        key: "status",
        label: "狀態",
        sortable: true,
        width: "w-24",
        render: (value: unknown) => {
          const status = value as FeedbackStatus;
          return <span className={getStatusColor(status)}>{getStatusText(status)}</span>;
        },
      },
      {
        key: "remark",
        label: "備註",
        sortable: false,
        width: "w-36",
        overflow: true,
        tooltip: true,
        tooltipWidth: "w-36",
        render: (value: unknown) => {
          const remark = value as string | undefined;
          return remark || <span className="text-gray-400">無</span>;
        },
      },
      {
        key: "createdAt",
        label: "建立時間",
        sortable: true,
        width: "w-36",
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
      {
        key: "updatedAt",
        label: "更新時間",
        sortable: true,
        width: "w-36",
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
      <FeedbackSearchPopover
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
        popover: { title: "搜尋意見回饋", position: PopoverPosition.BottomLeft, width: "500px" },
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
  }, [fetchPages, searchFilters, showDeleted]);

  // Row actions
  const rowActions: DataTableRowAction<FeedbackDetail>[] = useMemo(
    () => [
      {
        key: "view",
        label: "檢視",
        icon: <MdVisibility />,
        onClick: (row: FeedbackDetail) => {
          setViewing(row);
          openViewModal();
        },
      },
      {
        key: "update",
        label: "更新",
        icon: <MdEdit />,
        onClick: (row: FeedbackDetail) => {
          setStatusUpdating(row);
          openStatusUpdateModal();
        },
        visible: !showDeleted, // 僅在正常模式下顯示
      },
    ],
    [openViewModal, openStatusUpdateModal, showDeleted]
  );

  // Status update handler
  const handleStatusUpdate = async (data: { status: FeedbackStatus; description?: string; remark?: string }) => {
    if (!statusUpdating?.id) return;
    try {
      setSubmitting(true);
      await feedbackService.update(statusUpdating.id, data);
      closeStatusUpdateModal();
      // Refresh list by calling fetchPages directly
      await fetchPages();
    } catch (e) {
      console.error(e);
      alert("更新失敗，請稍後再試");
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
      <DataPage<FeedbackDetail>
        data={pagedData}
        columns={columns}
        loading={loading}
        singleSelect
        orderBy={orderBy}
        descending={descending}
        buttons={toolbarButtons}
        rowActions={rowActions}
        onSort={handleSort}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />

      <Modal title="意見回饋詳細資料" isOpen={isViewOpen} onClose={closeViewModal} className="max-w-[900px] w-full mx-4 p-6">
        {viewing && <FeedbackDetailView feedbackId={viewing.id} />}
      </Modal>

      <Modal title="更新意見回饋" isOpen={isStatusUpdateOpen} onClose={closeStatusUpdateModal} className="max-w-[600px] w-full mx-4 p-6">
        {statusUpdating && (
          <FeedbackStatusUpdateForm
            currentStatus={statusUpdating.status}
            currentDescription={statusUpdating.description}
            currentRemark={statusUpdating.remark}
            onSubmit={handleStatusUpdate}
            onCancel={closeStatusUpdateModal}
            submitting={submitting}
          />
        )}
      </Modal>
    </>
  );
}

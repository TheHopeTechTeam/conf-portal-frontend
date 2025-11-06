import { testimonyService, type TestimonyDetail } from "@/api/services/testimonyService";
import type { DataTableColumn, DataTableRowAction, PopoverType } from "@/components/DataPage";
import { CommonPageButton, DataPage } from "@/components/DataPage";
import { getRecycleButtonClassName } from "@/components/DataPage/PageButtonTypes";
import { Modal } from "@/components/ui/modal";
import Tooltip from "@/components/ui/tooltip";
import { PopoverPosition } from "@/const/enums";
import { useModal } from "@/hooks/useModal";
import { DateUtil } from "@/utils/dateUtil";
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MdCheck, MdClose, MdVisibility } from "react-icons/md";
import TestimonyDetailView from "./TestimonyDetailView";
import TestimonySearchPopover, { type TestimonySearchFilters } from "./TestimonySearchPopover";

interface TestimonyPagesResponse {
  page: number; // 0-based from backend
  pageSize?: number;
  total: number;
  items?: TestimonyDetail[];
}

export default function TestimonyDataPage() {
  const [currentPage, setCurrentPage] = useState(1); // 1-based for UI
  const [pageSize, setPageSize] = useState(10);
  const [searchFilters, setSearchFilters] = useState<TestimonySearchFilters>({});
  const [appliedFilters, setAppliedFilters] = useState<TestimonySearchFilters>({});
  const [showDeleted, setShowDeleted] = useState(false);
  const [orderBy, setOrderBy] = useState<string>();
  const [descending, setDescending] = useState<boolean>();

  const [items, setItems] = useState<TestimonyDetail[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  // Modal state
  const { isOpen: isViewOpen, openModal: openViewModal, closeModal: closeViewModal } = useModal(false);
  const [viewing, setViewing] = useState<TestimonyDetail | null>(null);

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
        pageSize: pageSize,
        orderBy: orderBy && orderBy.trim() !== "" ? orderBy : undefined,
        descending: orderBy && orderBy.trim() !== "" ? descending : undefined,
        keyword: appliedFilters.keyword || undefined,
        share: appliedFilters.share,
        deleted: showDeleted || undefined,
      } as Record<string, unknown>;

      const res = await testimonyService.getPages(params);
      const data = res.data as TestimonyPagesResponse;
      setItems(data.items || []);
      setTotal(data.total);
      // Backend page is 0-based; map back to 1-based UI if changed externally
      setCurrentPage(data.page + 1);
      // 處理 API 可能返回 pageSize 的情況
      const responsePageSize = data.pageSize || 10;
      setPageSize(responsePageSize);
    } catch (e) {
      console.error("Error fetching testimony pages:", e);
      // Simplified error surfacing for demo
      alert("載入失敗，請稍後重試");
    } finally {
      setLoading(false);
    }
  }, []);

  // Columns definition
  const columns: DataTableColumn<TestimonyDetail>[] = useMemo(
    () => [
      {
        key: "name",
        label: "姓名",
        sortable: true,
        width: "150px",
        tooltip: (row) => row.name,
      },
      {
        key: "phoneNumber",
        label: "電話號碼",
        sortable: true,
        width: "150px",
        tooltip: (row) => row.phoneNumber || "",
        render: (value: unknown) => {
          const phoneNumber = value as string | undefined;
          return phoneNumber || <span className="text-gray-400">未提供</span>;
        },
      },
      {
        key: "share",
        label: "允許分享",
        sortable: true,
        width: "100px",
        render: (value: unknown) => {
          const share = value as boolean;
          return (
            <span
              className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
                share
                  ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
                  : "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400"
              }`}
            >
              {share ? <MdCheck size={16} /> : <MdClose size={16} />}
            </span>
          );
        },
      },
      {
        key: "remark",
        label: "備註",
        sortable: false,
        width: "200px",
        render: (value: unknown) => {
          const remark = value as string | undefined;
          if (!remark) return <span className="text-gray-400">無</span>;
          return (
            <Tooltip content={remark}>
              <span className="text-sm text-gray-600 dark:text-gray-400 cursor-help line-clamp-2">{remark}</span>
            </Tooltip>
          );
        },
      },
      {
        key: "createdAt",
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
      {
        key: "updatedAt",
        label: "更新時間",
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

  const handleRowSelect = (selectedRows: TestimonyDetail[], selectedKeys: string[]) => {
    setSelectedKeys(selectedKeys);
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
      <TestimonySearchPopover
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
        popover: { title: "搜尋見證", position: PopoverPosition.BottomLeft, width: "500px" },
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

  // Row actions - 只有查看功能，不支持更新或删除
  const rowActions: DataTableRowAction<TestimonyDetail>[] = useMemo(
    () => [
      {
        key: "view",
        label: "檢視",
        icon: <MdVisibility />,
        onClick: (row: TestimonyDetail) => {
          setViewing(row);
          openViewModal();
        },
      },
    ],
    [openViewModal]
  );

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
      <DataPage<TestimonyDetail>
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
        onRowSelect={handleRowSelect}
        onClearSelectionRef={(clearFn) => {
          clearSelectionRef.current = clearFn;
        }}
      />

      <Modal title="見證詳細資料" isOpen={isViewOpen} onClose={closeViewModal} className="max-w-[900px] w-full mx-4 p-6">
        {viewing && <TestimonyDetailView testimonyId={viewing.id} />}
      </Modal>
    </>
  );
}

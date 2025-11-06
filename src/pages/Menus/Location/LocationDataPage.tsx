import { locationService, type LocationDetail, type LocationItem } from "@/api/services/locationService";
import type { DataTableColumn, DataTableRowAction, PopoverType } from "@/components/DataPage";
import { CommonPageButton, DataPage } from "@/components/DataPage";
import { getRecycleButtonClassName } from "@/components/DataPage/PageButtonTypes";
import RestoreForm from "@/components/DataPage/RestoreForm";
import { Modal } from "@/components/ui/modal";
import Tooltip from "@/components/ui/tooltip";
import { PopoverPosition } from "@/const/enums";
import { useModal } from "@/hooks/useModal";
import { DateUtil } from "@/utils/dateUtil";
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MdDelete, MdEdit, MdRestore, MdVisibility } from "react-icons/md";
import LocationDataForm, { type LocationFormValues } from "./LocationDataForm";
import LocationDeleteForm from "./LocationDeleteForm";
import LocationDetailView from "./LocationDetailView";
import LocationSearchPopover, { type LocationSearchFilters } from "./LocationSearchPopover";

interface LocationPagesResponse {
  page: number; // 0-based from backend
  pageSize?: number;
  total: number;
  items?: LocationItem[];
}

export default function LocationDataPage() {
  const [currentPage, setCurrentPage] = useState(1); // 1-based for UI
  const [pageSize, setPageSize] = useState(10);
  const [searchFilters, setSearchFilters] = useState<LocationSearchFilters>({});
  const [appliedFilters, setAppliedFilters] = useState<LocationSearchFilters>({});
  const [showDeleted, setShowDeleted] = useState(false);
  const [orderBy, setOrderBy] = useState<string>();
  const [descending, setDescending] = useState<boolean>();

  const [items, setItems] = useState<LocationItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  // Modal state
  const { isOpen, openModal, closeModal } = useModal(false);
  const { isOpen: isDeleteOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal(false);
  const { isOpen: isViewOpen, openModal: openViewModal, closeModal: closeViewModal } = useModal(false);
  const { isOpen: isRestoreOpen, openModal: openRestoreModal, closeModal: closeRestoreModal } = useModal(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<LocationDetail | null>(null);
  const [viewing, setViewing] = useState<LocationItem | null>(null);
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
        pageSize: pageSize,
        orderBy: orderBy && orderBy.trim() !== "" ? orderBy : undefined,
        descending: orderBy && orderBy.trim() !== "" ? descending : undefined,
        keyword: appliedFilters.keyword || undefined,
        roomNumber: appliedFilters.roomNumber,
        deleted: showDeleted || undefined,
      } as Record<string, unknown>;

      const res = await locationService.getPages(params);
      const data = res.data as LocationPagesResponse;
      setItems(data.items || []);
      setTotal(data.total);
      // Backend page is 0-based; map back to 1-based UI if changed externally
      setCurrentPage(data.page + 1);
      // 處理 API 可能返回 pageSize 的情況
      const responsePageSize = data.pageSize || 10;
      setPageSize(responsePageSize);
    } catch (e) {
      console.error("Error fetching location pages:", e);
      // Simplified error surfacing for demo
      alert("載入失敗，請稍後重試");
    } finally {
      setLoading(false);
    }
  }, []);

  // Columns definition
  const columns: DataTableColumn<LocationItem>[] = useMemo(
    () => [
      {
        key: "name",
        label: "地點名稱",
        sortable: false,
        width: "200px",
        tooltip: (row) => row.name,
      },
      {
        key: "roomNumber",
        label: "房間號碼",
        sortable: false,
        width: "120px",
        render: (value: unknown) => {
          const roomNumber = value as string | undefined;
          return roomNumber || <span className="text-gray-400">無</span>;
        },
      },
      {
        key: "floor",
        label: "樓層",
        sortable: false,
        width: "100px",
        render: (value: unknown) => {
          const floor = value as string | undefined;
          return floor || <span className="text-gray-400">無</span>;
        },
      },
      {
        key: "address",
        label: "地址",
        sortable: false,
        width: "250px",
        render: (value: unknown) => {
          const address = value as string | undefined;
          if (!address) return <span className="text-gray-400">無</span>;
          return (
            <Tooltip content={address}>
              <span className="text-sm text-gray-600 dark:text-gray-400 cursor-help line-clamp-2">{address}</span>
            </Tooltip>
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

  const handleRowSelect = (_selectedRows: LocationItem[], selectedKeys: string[]) => {
    setSelectedKeys(selectedKeys);
  };

  const handleBulkRestore = useCallback(async () => {
    setRestoreIds(selectedKeys);
    openRestoreModal();
  }, [selectedKeys, openRestoreModal]);

  const handleRestoreConfirm = async (ids: string[]) => {
    try {
      setSubmitting(true);
      await locationService.restore(ids);
      await fetchPages();
      closeRestoreModal();
    } catch (e) {
      console.error(e);
      alert("批量還原失敗，請稍後再試");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSingleRestore = async (row: LocationItem) => {
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
      <LocationSearchPopover
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
        popover: { title: "搜尋地點", position: PopoverPosition.BottomLeft, width: "500px" },
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
  const rowActions: DataTableRowAction<LocationItem>[] = useMemo(
    () => [
      {
        key: "view",
        label: "檢視",
        icon: <MdVisibility />,
        onClick: (row: LocationItem) => {
          setViewing(row);
          openViewModal();
        },
      },
      {
        key: "edit",
        label: "編輯",
        icon: <MdEdit />,
        onClick: async (row: LocationItem) => {
          try {
            const response = await locationService.getById(row.id);
            setEditing(response.data);
            setFormMode("edit");
            openModal();
          } catch (e) {
            console.error("Error fetching location detail:", e);
            alert("載入地點詳情失敗，請稍後重試");
          }
        },
        visible: !showDeleted, // 僅在正常模式下顯示
      },
      {
        key: "restore",
        label: "還原",
        icon: <MdRestore />,
        variant: "primary",
        onClick: async (row: LocationItem) => {
          handleSingleRestore(row);
        },
        visible: showDeleted, // 僅在回收桶模式下顯示
      },
      {
        key: "delete",
        label: showDeleted ? "永久刪除" : "刪除",
        icon: <MdDelete />,
        variant: "danger",
        onClick: async (row: LocationItem) => {
          try {
            const response = await locationService.getById(row.id);
            setEditing(response.data);
            openDeleteModal();
          } catch (e) {
            console.error("Error fetching location detail:", e);
            alert("載入地點詳情失敗，請稍後重試");
          }
        },
      },
    ],
    [openModal, openDeleteModal, openViewModal, showDeleted, fetchPages, handleSingleRestore]
  );

  // Submit handlers
  const handleSubmit = async (values: LocationFormValues) => {
    try {
      setSubmitting(true);
      if (formMode === "create") {
        await locationService.create(values);
      } else if (formMode === "edit" && editing?.id) {
        await locationService.update(editing.id, values);
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
      await locationService.remove(editing.id, { reason, permanent: !!permanent });
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

  // Convert LocationDetail to LocationFormValues
  const editingFormValues = useMemo<LocationFormValues | null>(() => {
    if (!editing) return null;

    // 从 files 中提取 file_ids
    const file_ids = editing.files?.map((file) => file.id) || [];

    return {
      id: editing.id,
      name: editing.name,
      address: editing.address,
      floor: editing.floor,
      room_number: editing.room_number,
      latitude: editing.latitude,
      longitude: editing.longitude,
      remark: editing.remark,
      description: editing.description,
      file_ids: file_ids,
      files: editing.files, // 传递完整的文件信息，以便在编辑表单中显示图片
    };
  }, [editing]);

  return (
    <>
      <DataPage<LocationItem>
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
        title={formMode === "create" ? "新增地點" : "編輯地點"}
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[900px] w-full mx-4 p-6"
      >
        <LocationDataForm
          mode={formMode}
          defaultValues={editingFormValues}
          onSubmit={handleSubmit}
          onCancel={closeModal}
          submitting={submitting}
        />
      </Modal>

      <Modal
        title={showDeleted ? "確認永久刪除地點" : "確認刪除地點"}
        isOpen={isDeleteOpen}
        onClose={closeDeleteModal}
        className="max-w-[560px] w-full mx-4 p-6"
      >
        <LocationDeleteForm onSubmit={handleDelete} onCancel={closeDeleteModal} submitting={submitting} isPermanent={showDeleted} />
      </Modal>

      <Modal title="還原地點" isOpen={isRestoreOpen} onClose={closeRestoreModal} className="max-w-[500px] w-full mx-4 p-6">
        <RestoreForm
          ids={restoreIds}
          entityName="地點"
          onSubmit={handleRestoreConfirm}
          onCancel={closeRestoreModal}
          submitting={submitting}
        />
      </Modal>

      <Modal title="地點詳細資料" isOpen={isViewOpen} onClose={closeViewModal} className="max-w-[900px] w-full mx-4 p-6">
        {viewing && <LocationDetailView locationId={viewing.id} />}
      </Modal>
    </>
  );
}

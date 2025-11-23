import { WorkshopPagesResponse, workshopService, type WorkshopDetail, type WorkshopPageItem } from "@/api/services/workshopService";
import type { DataTableColumn, MenuButtonType, PopoverType } from "@/components/DataPage";
import { CommonPageButton, CommonRowAction, DataPage } from "@/components/DataPage";
import { getRecycleButtonClassName } from "@/components/DataPage/PageButtonTypes";
import RestoreForm from "@/components/DataPage/RestoreForm";
import InstructorSelectionModal, { type SelectedInstructor } from "@/components/common/InstructorSelectionModal";
import { Modal } from "@/components/ui/modal";
import Tooltip from "@/components/ui/tooltip";
import { PopoverPosition } from "@/const/enums";
import { useModal } from "@/hooks/useModal";
import { formatDateTimeLocal } from "@/utils/timezone";
import moment from "moment-timezone";
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MdCoPresent } from "react-icons/md";
import WorkshopDataForm, { type WorkshopFormValues } from "./WorkshopDataForm";
import WorkshopDeleteForm from "./WorkshopDeleteForm";
import WorkshopDetailView from "./WorkshopDetailView";
import WorkshopSearchPopover, { type WorkshopSearchFilters } from "./WorkshopSearchPopover";

export default function WorkshopDataPage() {
  const [currentPage, setCurrentPage] = useState(1); // 1-based for UI
  const [pageSize, setPageSize] = useState(10);
  const [searchFilters, setSearchFilters] = useState<WorkshopSearchFilters>({});
  const [appliedFilters, setAppliedFilters] = useState<WorkshopSearchFilters>({});
  const [showDeleted, setShowDeleted] = useState(false);
  const [orderBy, setOrderBy] = useState<string>();
  const [descending, setDescending] = useState<boolean>();

  const [items, setItems] = useState<WorkshopPageItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [prevItem, setPrevItem] = useState<{ id: string; sequence: number } | undefined>(undefined);
  const [nextItem, setNextItem] = useState<{ id: string; sequence: number } | undefined>(undefined);

  // Modal state
  const { isOpen, openModal, closeModal } = useModal(false);
  const { isOpen: isDeleteOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal(false);
  const { isOpen: isViewOpen, openModal: openViewModal, closeModal: closeViewModal } = useModal(false);
  const { isOpen: isRestoreOpen, openModal: openRestoreModal, closeModal: closeRestoreModal } = useModal(false);
  const { isOpen: isInstructorOpen, openModal: openInstructorModal, closeModal: closeInstructorModal } = useModal(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<WorkshopDetail | null>(null);
  const [viewing, setViewing] = useState<WorkshopPageItem | null>(null);
  const [editingWorkshopId, setEditingWorkshopId] = useState<string | null>(null);
  const [initialInstructors, setInitialInstructors] = useState<SelectedInstructor[]>([]);
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
        location_id: appliedFilters.locationId,
        conference_id: appliedFilters.conferenceId,
        start_datatime: appliedFilters.startTime,
        end_datatime: appliedFilters.endTime,
        deleted: showDeleted || undefined,
      } as Record<string, unknown>;

      const res = await workshopService.getPages(params);
      const data = res.data as WorkshopPagesResponse;
      setItems(data.items || []);
      setTotal(data.total);
      // Backend page is 0-based; map back to 1-based UI if changed externally
      setCurrentPage(data.page + 1);
      // pageSize 完全由前端控制，不根據後端返回的值改變
      // 保存 prevItem 和 nextItem
      setPrevItem(data.prevItem);
      setNextItem(data.nextItem);
    } catch (e) {
      console.error("Error fetching workshop pages:", e);
      // Simplified error surfacing for demo
      alert("載入失敗，請稍後重試");
    } finally {
      setLoading(false);
    }
  }, []);

  // Columns definition
  const columns: DataTableColumn<WorkshopPageItem>[] = useMemo(
    () => [
      {
        key: "title",
        label: "工作坊標題",
        sortable: false,
        width: "w-40 max-w-60",
        tooltip: true,
        tooltipWrapContent: false,
      },
      {
        key: "startTime",
        label: "開始時間",
        sortable: true,
        width: "w-40",
        render: (value: unknown, row: WorkshopPageItem) => {
          if (!value) return null;
          const dateStr = value as string;
          const timezone = row.timezone || "UTC";

          try {
            // 先解析 ISO 時間（可能是 UTC 或帶時區的格式）
            let momentDate = moment(dateStr);
            if (!momentDate.isValid()) {
              return <span className="text-sm text-gray-600 dark:text-gray-400">{dateStr}</span>;
            }

            // 轉換到指定時區
            momentDate = momentDate.tz(timezone);
            const formattedDate = momentDate.format("YYYY-MM-DD HH:mm");
            // 獲取 UTC offset 並格式化為 UTC+8 或 UTC-5 格式
            const offset = momentDate.utcOffset();
            const hours = Math.floor(Math.abs(offset) / 60);
            const sign = offset >= 0 ? "+" : "-";
            const utcOffset = `UTC${sign}${hours}`;
            const displayText = `${formattedDate} (${utcOffset})`;

            return (
              <Tooltip content={`${formattedDate} (${timezone})`} wrapContent={false}>
                <span className="text-sm text-gray-600 dark:text-gray-400 cursor-help">{displayText}</span>
              </Tooltip>
            );
          } catch (error) {
            console.error("Error formatting datetime with timezone:", error);
            return <span className="text-sm text-gray-600 dark:text-gray-400">{dateStr}</span>;
          }
        },
      },
      {
        key: "endTime",
        label: "結束時間",
        sortable: true,
        width: "w-40",
        render: (value: unknown, row: WorkshopPageItem) => {
          if (!value) return null;
          const dateStr = value as string;
          const timezone = row.timezone || "UTC";

          try {
            // 先解析 ISO 時間（可能是 UTC 或帶時區的格式）
            let momentDate = moment(dateStr);
            if (!momentDate.isValid()) {
              return <span className="text-sm text-gray-600 dark:text-gray-400">{dateStr}</span>;
            }

            // 轉換到指定時區
            momentDate = momentDate.tz(timezone);
            const formattedDate = momentDate.format("YYYY-MM-DD HH:mm");
            // 獲取 UTC offset 並格式化為 UTC+8 或 UTC-5 格式
            const offset = momentDate.utcOffset();
            const hours = Math.floor(Math.abs(offset) / 60);
            const sign = offset >= 0 ? "+" : "-";
            const utcOffset = `UTC${sign}${hours}`;
            const displayText = `${formattedDate} (${utcOffset})`;

            return (
              <Tooltip content={`${formattedDate} ${timezone}`} wrapContent={false}>
                <span className="text-sm text-gray-600 dark:text-gray-400 cursor-help">{displayText}</span>
              </Tooltip>
            );
          } catch (error) {
            console.error("Error formatting datetime with timezone:", error);
            return <span className="text-sm text-gray-600 dark:text-gray-400">{dateStr}</span>;
          }
        },
      },
      {
        key: "conferenceTitle",
        label: "會議",
        sortable: false,
        width: "w-30 max-w-40",
        tooltip: true,
        tooltipWrapContent: false,
        render: (value: unknown) => {
          const conferenceTitle = value as string | undefined;
          return conferenceTitle || <span className="text-gray-400">未設置</span>;
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
        key: "participantsLimit",
        label: "人數限制",
        sortable: false,
        width: "w-24",
        render: (value: unknown) => {
          const limit = value as number | undefined;
          return limit === undefined || limit === null ? <span className="text-gray-400">無限制</span> : <span>{limit}</span>;
        },
      },
      {
        key: "registeredCount",
        label: "已註冊",
        sortable: false,
        width: "w-20",
        render: (value: unknown) => {
          const count = value as number | undefined;
          return <span>{count ?? 0}</span>;
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

  const handleRowSelect = (_selectedRows: WorkshopPageItem[], selectedKeys: string[]) => {
    setSelectedKeys(selectedKeys);
  };

  // 獲取重新排序資訊
  const getReorderInfo = useCallback(
    (_row: WorkshopPageItem, index: number) => {
      // 邊界檢查
      if (!items || items.length === 0 || index < 0 || index >= items.length) {
        return {
          canMoveUp: false,
          canMoveDown: false,
          prevItem: undefined,
          nextItem: undefined,
        };
      }

      const isFirstItem = index === 0;
      const isLastItem = index === items.length - 1;

      let canMoveUp = false;
      let canMoveDown = false;
      let prevItemInfo: { id: string; sequence: number } | undefined = undefined;
      let nextItemInfo: { id: string; sequence: number } | undefined = undefined;

      if (isFirstItem) {
        // 第一筆：如果有 prevItem（上一頁的最後一筆），可以向上移動
        if (prevItem) {
          canMoveUp = true;
          prevItemInfo = prevItem;
        }
        // 第一筆：如果有下一筆（當前頁的第二筆），可以向下移動
        if (items.length > 1 && items[1] && items[1].sequence !== undefined) {
          canMoveDown = true;
          nextItemInfo = {
            id: items[1].id,
            sequence: items[1].sequence,
          };
        }
      } else if (isLastItem) {
        // 最後一筆：如果有上一筆（當前頁的倒數第二筆），可以向上移動
        if (items.length > 1 && items[index - 1] && items[index - 1].sequence !== undefined) {
          canMoveUp = true;
          prevItemInfo = {
            id: items[index - 1].id,
            sequence: items[index - 1].sequence,
          };
        }
        // 最後一筆：如果有 nextItem（下一頁的第一筆），可以向下移動
        if (nextItem) {
          canMoveDown = true;
          nextItemInfo = nextItem;
        }
      } else {
        // 中間的 item：可以與前後相鄰的 item 交換
        if (items[index - 1] && items[index - 1].sequence !== undefined) {
          canMoveUp = true;
          prevItemInfo = {
            id: items[index - 1].id,
            sequence: items[index - 1].sequence,
          };
        }
        if (items[index + 1] && items[index + 1].sequence !== undefined) {
          canMoveDown = true;
          nextItemInfo = {
            id: items[index + 1].id,
            sequence: items[index + 1].sequence,
          };
        }
      }

      return {
        canMoveUp,
        canMoveDown,
        prevItem: prevItemInfo,
        nextItem: nextItemInfo,
      };
    },
    [items, prevItem, nextItem]
  );

  // 處理重新排序
  const handleReorder = useCallback(
    async (currentId: string, currentSequence: number, targetId: string, targetSequence: number) => {
      try {
        setSubmitting(true);
        await workshopService.changeSequence({
          id: currentId,
          sequence: currentSequence,
          another_id: targetId,
          another_sequence: targetSequence,
        });
        // 交換後重新載入資料
        await fetchPages();
      } catch (e) {
        console.error("Error reordering workshop:", e);
        alert("交換順序失敗，請稍後重試");
      } finally {
        setSubmitting(false);
      }
    },
    [fetchPages]
  );

  const handleBulkRestore = useCallback(async () => {
    setRestoreIds(selectedKeys);
    openRestoreModal();
  }, [selectedKeys, openRestoreModal]);

  const handleRestoreConfirm = async (ids: string[]) => {
    try {
      setSubmitting(true);
      await workshopService.restore(ids);
      await fetchPages();
      closeRestoreModal();
    } catch (e) {
      console.error(e);
      alert("批量還原失敗，請稍後再試");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSingleRestore = useCallback(
    async (row: WorkshopPageItem) => {
      setRestoreIds([row.id]);
      openRestoreModal();
    },
    [openRestoreModal]
  );

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
      <WorkshopSearchPopover
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
        popover: { title: "搜尋工作坊", position: PopoverPosition.BottomLeft, width: "500px" },
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
  const rowActions: MenuButtonType<WorkshopPageItem>[] = useMemo(
    () => [
      CommonRowAction.VIEW((row: WorkshopPageItem) => {
        setViewing(row);
        openViewModal();
      }),
      CommonRowAction.EDIT(
        async (row: WorkshopPageItem) => {
          try {
            const response = await workshopService.getById(row.id);
            setEditing(response.data);
            setFormMode("edit");
            openModal();
          } catch (e) {
            console.error("Error fetching workshop detail:", e);
            alert("載入工作坊詳情失敗，請稍後重試");
          }
        },
        {
          visible: !showDeleted, // 僅在正常模式下顯示
        }
      ),
      {
        key: "editInstructors",
        text: "編輯講者",
        icon: <MdCoPresent />,
        onClick: async (row: WorkshopPageItem) => {
          try {
            setEditingWorkshopId(row.id);
            // 獲取當前的講者列表
            const response = await workshopService.getInstructors(row.id);
            const instructors: SelectedInstructor[] =
              response.data.items?.map((item) => ({
                instructorId: item.instructor_id,
                name: item.name,
                isPrimary: item.is_primary,
                sequence: item.sequence,
              })) || [];
            setInitialInstructors(instructors);
            openInstructorModal();
          } catch (e) {
            console.error("Error fetching workshop instructors:", e);
            alert("載入講者列表失敗，請稍後重試");
          }
        },
        visible: !showDeleted,
      },
      CommonRowAction.RESTORE(
        async (row: WorkshopPageItem) => {
          handleSingleRestore(row);
        },
        {
          visible: showDeleted, // 僅在回收桶模式下顯示
        }
      ),
      CommonRowAction.DELETE(
        async (row: WorkshopPageItem) => {
          try {
            const response = await workshopService.getById(row.id);
            setEditing(response.data);
            openDeleteModal();
          } catch (e) {
            console.error("Error fetching workshop detail:", e);
            alert("載入工作坊詳情失敗，請稍後重試");
          }
        },
        {
          text: showDeleted ? "永久刪除" : "刪除",
        }
      ),
    ],
    [openModal, openDeleteModal, openViewModal, showDeleted, handleSingleRestore]
  );

  // Submit handlers
  const handleSubmit = async (values: WorkshopFormValues) => {
    try {
      setSubmitting(true);
      // 轉換為 API 格式 (snake_case)
      const apiPayload = {
        title: values.title,
        timezone: values.timezone,
        start_datetime: values.startTime,
        end_datetime: values.endTime,
        location_id: values.locationId!,
        conference_id: values.conferenceId!,
        participants_limit: values.participantsLimit,
        remark: values.remark || undefined,
        description: values.description || undefined,
      };

      if (formMode === "create") {
        await workshopService.create(apiPayload);
      } else if (formMode === "edit" && editing?.id) {
        await workshopService.update(editing.id, apiPayload);
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
      await workshopService.remove(editing.id, { reason, permanent: !!permanent });
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

  // 處理講者選擇確認
  const handleInstructorConfirm = async (instructors: SelectedInstructor[]) => {
    if (!editingWorkshopId) return;

    try {
      setSubmitting(true);
      // 轉換為 API 格式 (snake_case)
      const payload = {
        instructors: instructors.map((instructor) => ({
          instructor_id: instructor.instructorId,
          is_primary: instructor.isPrimary,
          sequence: instructor.sequence,
        })),
      };
      await workshopService.updateInstructors(editingWorkshopId, payload);
      closeInstructorModal();
      await fetchPages();
    } catch (e) {
      console.error("Error updating workshop instructors:", e);
      alert("更新講者列表失敗，請稍後重試");
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

  // Convert WorkshopDetail to WorkshopFormValues
  const editingFormValues = useMemo<WorkshopFormValues | null>(() => {
    if (!editing) return null;

    // Parse startTime and endTime from ISO format to date and time parts
    const timezone = editing.timezone || "Asia/Taipei";
    const startDateTime = editing.startTime ? formatDateTimeLocal(editing.startTime, timezone) : "";
    const endDateTime = editing.endTime ? formatDateTimeLocal(editing.endTime, timezone) : "";
    const [startDate, startTime] = startDateTime ? startDateTime.split("T") : ["", ""];
    const [endDate, endTime] = endDateTime ? endDateTime.split("T") : ["", ""];

    return {
      id: editing.id,
      title: editing.title,
      timezone: editing.timezone,
      startDate: startDate || "",
      startTime: startTime || "",
      endDate: endDate || "",
      endTime: endTime || "",
      locationId: editing.location?.id,
      conferenceId: editing.conference?.id,
      participantsLimit: editing.participantsLimit as number | undefined,
      remark: editing.remark,
      description: editing.description,
    };
  }, [editing]);

  return (
    <>
      <DataPage<WorkshopPageItem>
        data={pagedData}
        columns={columns}
        loading={loading}
        orderBy={orderBy}
        descending={descending}
        resource="workshop:workshops"
        buttons={toolbarButtons}
        rowActions={rowActions}
        onSort={handleSort}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        onRowSelect={handleRowSelect}
        onClearSelectionRef={(clearFn) => {
          clearSelectionRef.current = clearFn;
        }}
        getReorderInfo={getReorderInfo}
        onReorder={handleReorder}
      />

      <Modal
        title={formMode === "create" ? "新增工作坊" : "編輯工作坊"}
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[900px] w-full mx-4 p-6"
      >
        <WorkshopDataForm
          mode={formMode}
          defaultValues={editingFormValues}
          onSubmit={handleSubmit}
          onCancel={closeModal}
          submitting={submitting}
        />
      </Modal>

      <Modal
        title={showDeleted ? "確認永久刪除工作坊" : "確認刪除工作坊"}
        isOpen={isDeleteOpen}
        onClose={closeDeleteModal}
        className="max-w-[560px] w-full mx-4 p-6"
      >
        <WorkshopDeleteForm onSubmit={handleDelete} onCancel={closeDeleteModal} submitting={submitting} isPermanent={showDeleted} />
      </Modal>

      <Modal title="還原工作坊" isOpen={isRestoreOpen} onClose={closeRestoreModal} className="max-w-[500px] w-full mx-4 p-6">
        <RestoreForm
          ids={restoreIds}
          entityName="工作坊"
          onSubmit={handleRestoreConfirm}
          onCancel={closeRestoreModal}
          submitting={submitting}
        />
      </Modal>

      <Modal title="工作坊詳細資料" isOpen={isViewOpen} onClose={closeViewModal} className="max-w-[900px] w-full mx-4 p-6">
        {viewing && <WorkshopDetailView workshopId={viewing.id} />}
      </Modal>

      <InstructorSelectionModal
        isOpen={isInstructorOpen}
        onClose={closeInstructorModal}
        onConfirm={handleInstructorConfirm}
        initialSelectedInstructors={initialInstructors}
        title="編輯工作坊講者"
      />
    </>
  );
}

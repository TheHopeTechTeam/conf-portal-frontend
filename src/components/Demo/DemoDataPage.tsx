import { httpClient } from "@/api";
import { demoService } from "@/api/services/demoService";
import type { DataTableColumn, DataTableRowAction, PopoverType } from "@/components/DataPage";
import { CommonPageButton, DataPage, SearchPopoverContent } from "@/components/DataPage";
import { getRecycleButtonClassName } from "@/components/DataPage/PageButtonTypes";
import { Modal } from "@/components/ui/modal";
import Tooltip from "@/components/ui/tooltip";
import { Gender, PopoverPosition } from "@/const/enums";
import { useModal } from "@/hooks/useModal";
import { DateUtil } from "@/utils/dateUtil";
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MdDelete, MdEdit } from "react-icons/md";
import DemoDataForm, { type DemoFormValues } from "./DemoDataForm";
import DemoDeleteForm from "./DemoDeleteForm";

type DemoDetail = {
  id: string;
  name: string;
  remark?: string;
  age?: number;
  gender?: Gender;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
};

interface DemoPagesResponse {
  page: number; // 0-based from backend
  page_size: number;
  total: number;
  items?: DemoDetail[];
}

export default function DemoDataPage() {
  const [currentPage, setCurrentPage] = useState(1); // 1-based for UI
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState("");
  const [searchDraft, setSearchDraft] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [orderBy, setOrderBy] = useState<string>();
  const [descending, setDescending] = useState<boolean>();

  const [items, setItems] = useState<DemoDetail[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Modal state
  const { isOpen, openModal, closeModal } = useModal(false);
  const { isOpen: isDeleteOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<DemoDetail | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
    const { currentPage, pageSize, orderBy, descending, keyword, showDeleted } = fetchPagesRef.current;

    setLoading(true);
    try {
      const params = {
        page: Math.max(0, currentPage - 1),
        page_size: pageSize,
        order_by: orderBy && orderBy.trim() !== "" ? orderBy : undefined,
        descending: orderBy && orderBy.trim() !== "" ? descending : undefined,
        keyword: keyword || undefined,
        deleted: showDeleted || undefined,
      } as Record<string, unknown>;

      const res = await httpClient.get<DemoPagesResponse>("/api/v1/admin/demo/pages", params);
      const data = res.data as DemoPagesResponse;
      setItems(data.items || []);
      setTotal(data.total);
      // Backend page is 0-based; map back to 1-based UI if changed externally
      setCurrentPage(data.page + 1);
      setPageSize(data.page_size);
    } catch (e) {
      console.error("Error fetching pages:", e);
      // Simplified error surfacing for demo
      alert("載入失敗，請稍後重試");
    } finally {
      setLoading(false);
    }
  }, []); // 空依賴項，避免重新創建

  // Columns definition
  const columns: DataTableColumn<DemoDetail>[] = useMemo(
    () => [
      {
        key: "name",
        label: "名稱",
        sortable: true,
        width: "w-72",
        tooltip: (row) => row.name,
      },
      {
        key: "remark",
        label: "備註",
        sortable: false,
        overflow: true,
        tooltip: (row) => row.remark || "",
      },
      {
        key: "age",
        label: "年齡",
        sortable: true,
        width: "w-48",
      },
      {
        key: "gender",
        label: "性別",
        sortable: true,
        width: "w-48",
        valueEnum: {
          item: (value: unknown) => {
            const v = value as Gender | undefined;
            if (v === Gender.Male) return { text: "男性", color: "text-blue-600" };
            if (v === Gender.Female) return { text: "女性", color: "text-pink-600" };
            return { text: "未知", color: "text-gray-500" };
          },
        },
      },
      {
        key: "created_at",
        label: "建立時間",
        sortable: true,
        width: "w-32",
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
        key: "updated_at",
        label: "更新時間",
        sortable: true,
        width: "w-32",
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
        key: "created_by",
        label: "建立者",
        sortable: true,
        width: "w-32",
      },
      {
        key: "updated_by",
        label: "更新者",
        sortable: true,
        width: "w-32",
      },
    ],
    []
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

    return [
      CommonPageButton.SEARCH(searchPopoverCallback, { popover: { title: "搜尋", position: PopoverPosition.BottomLeft, width: "300px" } }),
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
  }, [openModal, fetchPages, showDeleted, searchDraft]);

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

  // Row actions
  const rowActions: DataTableRowAction<DemoDetail>[] = useMemo(
    () => [
      {
        key: "edit",
        label: "編輯",
        icon: <MdEdit />,
        onClick: (row: DemoDetail) => {
          setFormMode("edit");
          setEditing(row);
          openModal();
        },
      },
      {
        key: "delete",
        label: "刪除",
        icon: <MdDelete />,
        variant: "danger",
        onClick: (row: DemoDetail) => {
          setEditing(row);
          openDeleteModal();
        },
      },
    ],
    [openModal, openDeleteModal]
  );

  // Submit handlers
  const handleSubmit = async (values: DemoFormValues) => {
    try {
      setSubmitting(true);
      if (formMode === "create") {
        await demoService.create(values);
      } else if (formMode === "edit" && editing?.id) {
        await demoService.update(editing.id, values);
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
      await demoService.remove(editing.id, { reason, permanent: !!permanent });
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

  const pagedData = useMemo(
    () => ({
      page: currentPage,
      pageSize,
      total,
      items,
    }),
    [currentPage, pageSize, total, items]
  );

  return (
    <>
      <DataPage<DemoDetail>
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
      />

      <Modal
        title={formMode === "create" ? "新增 Demo" : "編輯 Demo"}
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[600px] w-full mx-4 p-6"
      >
        <DemoDataForm mode={formMode} defaultValues={editing} onSubmit={handleSubmit} onCancel={closeModal} submitting={submitting} />
      </Modal>

      <Modal title="確認刪除" isOpen={isDeleteOpen} onClose={closeDeleteModal} className="max-w-[560px] w-full mx-4 p-6">
        <DemoDeleteForm onSubmit={handleDelete} onCancel={closeDeleteModal} submitting={submitting} />
      </Modal>
    </>
  );
}

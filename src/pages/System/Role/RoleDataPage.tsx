import { roleService, type RoleCreate, type RolePageItem, type RolePagesResponse, type RoleUpdate } from "@/api/services/roleService";
import type { DataTableColumn, DataTableRowAction, PopoverType } from "@/components/DataPage";
import { CommonPageButton, DataPage } from "@/components/DataPage";
import { getRecycleButtonClassName } from "@/components/DataPage/PageButtonTypes";
import Button from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ModalForm, type ModalFormHandle } from "@/components/ui/modal/modal-form";
import Tooltip from "@/components/ui/tooltip";
import { PopoverPosition } from "@/const/enums";
import { useModal } from "@/hooks/useModal";
import { DateUtil } from "@/utils/dateUtil";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MdDelete, MdEdit, MdRestore, MdVisibility } from "react-icons/md";
import RoleDataForm, { type RoleDataFormHandle, type RoleFormValues } from "./RoleDataForm";
import RoleDeleteForm from "./RoleDeleteForm";
import RoleDetailView from "./RoleDetailView";
import RoleSearchPopover, { type RoleSearchFilters } from "./RoleSearchPopover";

export default function RoleDataPage() {
  const [items, setItems] = useState<RolePageItem[]>([]);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [orderBy, setOrderBy] = useState<string | undefined>(undefined);
  const [descending, setDescending] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_selectedKeys, setSelectedKeys] = useState<string[]>([]);

  // Modal state
  const { isOpen, openModal, closeModal } = useModal(false);
  const { isOpen: isDeleteOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal(false);
  const { isOpen: isViewOpen, openModal: openViewModal, closeModal: closeViewModal } = useModal(false);

  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<RolePageItem | null>(null);
  const [editingFormValues, setEditingFormValues] = useState<RoleFormValues | null>(null);
  const [viewing, setViewing] = useState<RolePageItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchFilters, setSearchFilters] = useState<RoleSearchFilters>({});
  const [appliedFilters, setAppliedFilters] = useState<RoleSearchFilters>({});

  const clearSelectionRef = useRef<() => void>(() => {});
  const roleFormRef = useRef<RoleDataFormHandle>(null);
  const roleModalFormRef = useRef<ModalFormHandle>(null);

  const fetchPages = useCallback(async () => {
    try {
      setLoading(true);
      const res = await roleService.getPages({
        page: currentPage - 1,
        page_size: pageSize,
        order_by: orderBy,
        descending,
        deleted: showDeleted,
        keyword: appliedFilters.keyword,
      });
      if (res.success) {
        const data: RolePagesResponse = res.data;
        setItems(data.items || []);
        setTotal(data.total);
        setCurrentPage((data.page ?? 0) + 1);
        setPageSize(data.page_size || pageSize);
      } else {
        setItems([]);
        setTotal(0);
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, orderBy, descending, showDeleted, appliedFilters.keyword]);

  useEffect(() => {
    void fetchPages();
  }, [fetchPages]);

  const columns: DataTableColumn<RolePageItem>[] = useMemo(
    () => [
      { key: "code", label: "代碼", sortable: true, width: 160 },
      { key: "name", label: "名稱", sortable: true, width: 200 },
      {
        key: "isActive",
        label: "啟用",
        sortable: true,
        width: 100,
        render: (val) => (val ? "是" : "否"),
      },
      { key: "description", label: "描述" },
      { key: "remark", label: "備註" },
      {
        key: "permissions",
        label: "權限數",
        width: 100,
        render: (_, row) => (row.permissions ? row.permissions.length : 0),
      },
      {
        key: "createAt",
        label: "建立時間",
        width: 180,
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
      {
        key: "updateAt",
        label: "更新時間",
        width: 180,
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

  const toolbarButtons = useMemo(() => {
    const searchPopoverCallback = ({
      isOpen,
      onOpenChange,
      trigger,
      popover,
    }: {
      isOpen: boolean;
      onOpenChange: (open: boolean) => void;
      trigger: React.ReactNode;
      popover: PopoverType;
    }) => (
      <RoleSearchPopover
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

    return [
      CommonPageButton.SEARCH(searchPopoverCallback, {
        popover: { title: "搜尋角色", position: PopoverPosition.BottomLeft, width: "420px" },
      }),
      CommonPageButton.ADD(
        () => {
          setFormMode("create");
          setEditing(null);
          setEditingFormValues(null);
          openModal();
        },
        { visible: !showDeleted }
      ),
      CommonPageButton.REFRESH(() => {
        clearSelectionRef.current?.();
        fetchPages();
      }),
      CommonPageButton.RECYCLE(
        () => {
          setShowDeleted((v) => !v);
          setCurrentPage(1);
        },
        { className: getRecycleButtonClassName(showDeleted) }
      ),
    ];
  }, [fetchPages, searchFilters, showDeleted, openModal, setFormMode, setEditing, setEditingFormValues, clearSelectionRef]);

  const rowActions: DataTableRowAction<RolePageItem>[] = useMemo(
    () => [
      {
        key: "view",
        label: "檢視",
        icon: <MdVisibility />,
        onClick: async (row) => {
          try {
            setSubmitting(true);
            // 獲取完整的角色詳情（包含權限列表）
            const response = await roleService.getById(row.id);
            if (response.success) {
              setViewing(response.data);
              openViewModal();
            } else {
              alert("載入角色詳情失敗，請稍後再試");
            }
          } catch (e) {
            console.error("Error fetching role detail:", e);
            alert("載入角色詳情失敗，請稍後再試");
          } finally {
            setSubmitting(false);
          }
        },
      },
      {
        key: "edit",
        label: "編輯",
        icon: <MdEdit />,
        onClick: async (row) => {
          try {
            setSubmitting(true);
            // 獲取完整的角色詳情（包含權限列表）
            const response = await roleService.getById(row.id);
            if (response.success) {
              const detail = response.data;
              setFormMode("edit");
              setEditing(row);
              // 轉換為表單值格式
              setEditingFormValues({
                code: detail.code,
                name: detail.name || "",
                isActive: detail.isActive,
                description: detail.description || "",
                remark: detail.remark || "",
                permissions: detail.permissions.map((p) => p.id),
              });
              openModal();
            } else {
              alert("載入角色詳情失敗，請稍後再試");
            }
          } catch (e) {
            console.error("Error fetching role detail:", e);
            alert("載入角色詳情失敗，請稍後再試");
          } finally {
            setSubmitting(false);
          }
        },
        visible: !showDeleted,
      },
      {
        key: "restore",
        label: "還原",
        icon: <MdRestore />,
        variant: "primary",
        onClick: async (row) => {
          try {
            setSubmitting(true);
            await roleService.restore(row.id);
            await fetchPages();
          } finally {
            setSubmitting(false);
          }
        },
        visible: showDeleted,
      },
      {
        key: "delete",
        label: showDeleted ? "永久刪除" : "刪除",
        icon: <MdDelete />,
        variant: "danger",
        onClick: (row) => {
          setEditing(row);
          openDeleteModal();
        },
      },
    ],
    [openModal, openDeleteModal, openViewModal, showDeleted, fetchPages, setSubmitting]
  );

  const handleSort = (key?: string | null, desc?: boolean) => {
    if (!key) {
      setOrderBy(undefined);
      setDescending(false);
    } else {
      setOrderBy(key);
      setDescending(!!desc);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const pagedData = useMemo(() => {
    return {
      page: currentPage,
      pageSize,
      total,
      items,
    };
  }, [currentPage, pageSize, total, items]);

  return (
    <>
      <DataPage<RolePageItem>
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
        onRowSelect={(_rows, keys) => setSelectedKeys(keys)}
        onClearSelectionRef={(clearFn) => {
          clearSelectionRef.current = clearFn;
        }}
      />

      <ModalForm
        ref={roleModalFormRef}
        title={formMode === "create" ? "新增角色" : "編輯角色"}
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-7xl w-full mx-4 p-6"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={closeModal} disabled={submitting}>
              取消
            </Button>
            <Button variant="primary" size="sm" onClick={() => roleModalFormRef.current?.submit()} disabled={submitting}>
              {formMode === "create" ? "新增角色" : "儲存變更"}
            </Button>
          </>
        }
        onSubmit={async (e) => {
          e.preventDefault();
          if (!roleFormRef.current?.validate()) return;
          const values = roleFormRef.current.getValues();
          try {
            setSubmitting(true);
            if (formMode === "create") {
              await roleService.create(values as RoleCreate);
            } else if (formMode === "edit" && editing?.id) {
              await roleService.update(editing.id, values as RoleUpdate);
            }
            closeModal();
            await fetchPages();
          } finally {
            setSubmitting(false);
          }
        }}
      >
        <RoleDataForm ref={roleFormRef} mode={formMode} defaultValues={editingFormValues} />
      </ModalForm>

      <Modal
        title={showDeleted ? "確認永久刪除角色" : "確認刪除角色"}
        isOpen={isDeleteOpen}
        onClose={closeDeleteModal}
        className="max-w-[560px] w-full mx-4 p-6"
      >
        <RoleDeleteForm
          onSubmit={async ({ reason, permanent }) => {
            try {
              setSubmitting(true);
              if (!editing?.id) return;
              await roleService.remove(editing.id, { reason, permanent });
              closeDeleteModal();
              await fetchPages();
            } catch (e) {
              console.error(e);
              alert("刪除失敗，請稍後再試");
            } finally {
              setSubmitting(false);
            }
          }}
          onCancel={closeDeleteModal}
          submitting={submitting}
          isPermanent={showDeleted}
        />
      </Modal>

      <Modal
        title="角色詳細資料"
        isOpen={isViewOpen}
        onClose={closeViewModal}
        className="max-w-7xl w-full max-h-9/10 mx-4 p-6 overflow-y-auto"
      >
        {viewing && <RoleDetailView role={viewing} />}
      </Modal>
    </>
  );
}

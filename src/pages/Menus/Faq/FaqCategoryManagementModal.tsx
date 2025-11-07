import { faqCategoryService, type FaqCategoryBase, type FaqCategoryCreate, type FaqCategoryDetail } from "@/api/services/faqService";
import type { DataTableColumn, DataTableRowAction } from "@/components/DataPage";
import { CommonPageButton } from "@/components/DataPage";
import DataTable from "@/components/DataPage/DataTable";
import DataTableToolbar from "@/components/DataPage/DataTableToolbar";
import DeleteForm from "@/components/DataPage/DeleteForm";
import { getRecycleButtonClassName } from "@/components/DataPage/PageButtonTypes";
import RestoreForm from "@/components/DataPage/RestoreForm";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import TextArea from "@/components/ui/textarea";
import Tooltip from "@/components/ui/tooltip";
import { DateUtil } from "@/utils/dateUtil";
import { useEffect, useMemo, useState } from "react";
import { MdDelete, MdEdit, MdRestore, MdVisibility } from "react-icons/md";

interface FaqCategoryManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FaqCategoryManagementModal: React.FC<FaqCategoryManagementModalProps> = ({ isOpen, onClose }) => {
  const [categories, setCategories] = useState<FaqCategoryBase[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<FaqCategoryDetail | null>(null);
  const [viewing, setViewing] = useState<FaqCategoryDetail | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isRestoreOpen, setIsRestoreOpen] = useState(false);

  // Form values
  const [formValues, setFormValues] = useState<FaqCategoryCreate>({
    name: "",
    remark: "",
    description: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await faqCategoryService.getList({ deleted: showDeleted });
      setCategories(response.data.categories || []);
    } catch (e) {
      console.error("Error fetching categories:", e);
      alert("載入分類列表失敗，請稍後重試");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen, showDeleted]);

  const handleAdd = () => {
    setFormMode("create");
    setEditing(null);
    setFormValues({ name: "", remark: "", description: "" });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleEdit = async (category: FaqCategoryBase) => {
    try {
      const response = await faqCategoryService.getById(category.id);
      setEditing(response.data);
      setFormMode("edit");
      setFormValues({
        name: response.data.name || "",
        remark: response.data.remark || "",
        description: response.data.description || "",
      });
      setFormErrors({});
      setIsFormOpen(true);
    } catch (e) {
      console.error("Error fetching category detail:", e);
      alert("載入分類詳情失敗，請稍後重試");
    }
  };

  const handleView = async (category: FaqCategoryBase) => {
    try {
      const response = await faqCategoryService.getById(category.id);
      setViewing(response.data);
      setIsViewOpen(true);
    } catch (e) {
      console.error("Error fetching category detail:", e);
      alert("載入分類詳情失敗，請稍後重試");
    }
  };

  const handleDelete = (category: FaqCategoryBase) => {
    setEditing({ id: category.id, name: category.name } as FaqCategoryDetail);
    setIsDeleteOpen(true);
  };

  const handleSingleRestore = (category: FaqCategoryBase) => {
    setSelectedKeys([category.id]);
    setIsRestoreOpen(true);
  };

  const handleBulkRestore = () => {
    setIsRestoreOpen(true);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formValues.name || formValues.name.trim().length === 0) {
      errors.name = "請輸入分類名稱";
    } else if (formValues.name.length > 255) {
      errors.name = "分類名稱不能超過 255 個字符";
    }

    if (formValues.remark && formValues.remark.length > 256) {
      errors.remark = "備註不能超過 256 個字符";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      if (formMode === "create") {
        await faqCategoryService.create(formValues);
      } else if (formMode === "edit" && editing?.id) {
        await faqCategoryService.update(editing.id, formValues);
      }
      setIsFormOpen(false);
      await fetchCategories();
    } catch (e) {
      console.error(e);
      alert("儲存失敗，請稍後再試");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubmit = async ({ reason, permanent }: { reason?: string; permanent?: boolean }) => {
    if (!editing?.id) return;

    try {
      setSubmitting(true);
      await faqCategoryService.remove(editing.id, { reason, permanent: !!permanent });
      setIsDeleteOpen(false);
      await fetchCategories();
    } catch (e) {
      console.error(e);
      alert("刪除失敗，請稍後再試");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRestoreSubmit = async (ids: string[]) => {
    try {
      setSubmitting(true);
      await faqCategoryService.restore(ids);
      setIsRestoreOpen(false);
      setSelectedKeys([]);
      await fetchCategories();
    } catch (e) {
      console.error(e);
      alert("還原失敗，請稍後再試");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRowSelect = (_selectedRows: FaqCategoryBase[], selectedKeys: string[]) => {
    setSelectedKeys(selectedKeys);
  };

  // Columns definition
  const columns: DataTableColumn<FaqCategoryBase>[] = useMemo(
    () => [
      {
        key: "name",
        label: "分類名稱",
        sortable: false,
        width: "w-48",
        tooltip: (row) => row.name,
      },
      {
        key: "remark",
        label: "備註",
        sortable: false,
        width: "w-48",
        tooltip: (row) => row.remark || "",
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
        key: "sequence",
        label: "排序",
        sortable: false,
        width: "w-24",
        render: (value: unknown) => {
          const sequence = value as number | undefined;
          return sequence !== undefined ? sequence.toFixed(1) : <span className="text-gray-400">-</span>;
        },
      },
      {
        key: "createdAt",
        label: "建立時間",
        sortable: false,
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
        sortable: false,
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

  // Row actions - 使用 ContextMenu
  const rowActions: DataTableRowAction<FaqCategoryBase>[] = useMemo(
    () => [
      {
        key: "view",
        label: "檢視",
        icon: <MdVisibility />,
        onClick: (row: FaqCategoryBase) => {
          handleView(row);
        },
      },
      {
        key: "edit",
        label: "編輯",
        icon: <MdEdit />,
        onClick: (row: FaqCategoryBase) => {
          handleEdit(row);
        },
        visible: !showDeleted,
      },
      {
        key: "restore",
        label: "還原",
        icon: <MdRestore />,
        variant: "primary",
        onClick: (row: FaqCategoryBase) => {
          handleSingleRestore(row);
        },
        visible: showDeleted,
      },
      {
        key: "delete",
        label: showDeleted ? "永久刪除" : "刪除",
        icon: <MdDelete />,
        variant: "danger",
        onClick: (row: FaqCategoryBase) => {
          handleDelete(row);
        },
      },
    ],
    [showDeleted]
  );

  // Toolbar buttons
  const toolbarButtons = useMemo(() => {
    const buttons = [
      CommonPageButton.ADD(handleAdd, {
        visible: !showDeleted,
      }),
      CommonPageButton.RESTORE(handleBulkRestore, {
        visible: showDeleted,
        disabled: selectedKeys.length === 0,
      }),
      CommonPageButton.REFRESH(() => {
        fetchCategories();
      }),
      CommonPageButton.RECYCLE(
        () => {
          setShowDeleted(!showDeleted);
          setSelectedKeys([]);
        },
        { className: getRecycleButtonClassName(showDeleted) }
      ),
    ];

    return buttons;
  }, [showDeleted, selectedKeys, handleAdd, handleBulkRestore]);

  return (
    <>
      <Modal title="分類管理" isOpen={isOpen} onClose={onClose} className="max-w-[900px] w-full mx-4 p-6">
        <div className="space-y-4 h-[calc(100vh-300px)] flex flex-col">
          <DataTableToolbar buttons={toolbarButtons} />
          <div className="flex-1 min-h-0 overflow-hidden">
            <DataTable<FaqCategoryBase>
              data={categories}
              columns={columns}
              loading={loading}
              rowActions={rowActions}
              onRowSelect={handleRowSelect}
              emptyMessage="暫無分類資料"
            />
          </div>
        </div>
      </Modal>

      {/* Form Modal */}
      <Modal
        title={formMode === "create" ? "新增分類" : "編輯分類"}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        className="max-w-[600px] w-full mx-4 p-6"
      >
        <div className="space-y-4">
          <div>
            <Input
              id="name"
              label="分類名稱"
              type="text"
              placeholder="請輸入分類名稱"
              value={formValues.name}
              onChange={(e) => setFormValues((v) => ({ ...v, name: e.target.value }))}
              error={formErrors.name || undefined}
              required
            />
            {formErrors.name && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{formErrors.name}</p>}
          </div>

          <div>
            <TextArea
              id="description"
              label="描述"
              rows={3}
              placeholder="請輸入描述"
              value={formValues.description || ""}
              onChange={(value) => setFormValues((v) => ({ ...v, description: value }))}
            />
          </div>

          <div>
            <TextArea
              id="remark"
              label="備註"
              rows={3}
              placeholder="請輸入備註"
              value={formValues.remark || ""}
              onChange={(value) => setFormValues((v) => ({ ...v, remark: value }))}
              error={formErrors.remark || undefined}
            />
            {formErrors.remark && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{formErrors.remark}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button onClick={() => setIsFormOpen(false)} variant="outline" disabled={submitting}>
              取消
            </Button>
            <Button onClick={handleFormSubmit} variant="primary" disabled={submitting}>
              {submitting ? "儲存中..." : "儲存"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        title={showDeleted ? "確認永久刪除分類" : "確認刪除分類"}
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        className="max-w-[560px] w-full mx-4 p-6"
      >
        <DeleteForm
          onSubmit={handleDeleteSubmit}
          onCancel={() => setIsDeleteOpen(false)}
          submitting={submitting}
          entityName="分類"
          isPermanent={showDeleted}
        />
      </Modal>

      {/* View Modal */}
      <Modal title="分類詳細資料" isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} className="max-w-[600px] w-full mx-4 p-6">
        {viewing && (
          <div className="space-y-4">
            <Input id="name" label="分類名稱" type="text" value={viewing.name} disabled />
            {viewing.description && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">描述</label>
                <TextArea id="description" placeholder="" value={viewing.description || ""} disabled rows={3} />
              </div>
            )}
            {viewing.remark && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">備註</label>
                <TextArea id="remark" placeholder="" value={viewing.remark || ""} disabled rows={3} />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="createdAt"
                label="建立時間"
                type="text"
                value={viewing.createdAt ? DateUtil.format(viewing.createdAt) : "未知"}
                disabled
              />
              <Input
                id="updatedAt"
                label="更新時間"
                type="text"
                value={viewing.updatedAt ? DateUtil.format(viewing.updatedAt) : "未知"}
                disabled
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Restore Modal */}
      <Modal title="還原分類" isOpen={isRestoreOpen} onClose={() => setIsRestoreOpen(false)} className="max-w-[500px] w-full mx-4 p-6">
        <RestoreForm
          ids={selectedKeys}
          entityName="分類"
          onSubmit={handleRestoreSubmit}
          onCancel={() => setIsRestoreOpen(false)}
          submitting={submitting}
        />
      </Modal>
    </>
  );
};

export default FaqCategoryManagementModal;

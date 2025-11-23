import { useApi } from "@/api";
import instructorService, { type InstructorItem } from "@/api/services/instructorService";
import type { DataTableColumn } from "@/components/DataPage";
import DataTableBody from "@/components/DataPage/DataTableBody";
import DataTableHeader from "@/components/DataPage/DataTableHeader";
import Button from "@/components/ui/button";
import Checkbox from "@/components/ui/checkbox";
import Input from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Table } from "@/components/ui/table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MdArrowDownward, MdArrowUpward, MdDelete } from "react-icons/md";

export interface SelectedInstructor extends Record<string, unknown> {
  instructorId: string;
  name: string;
  isPrimary: boolean;
  sequence: number;
}

export interface InstructorSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (instructors: SelectedInstructor[]) => void;
  initialSelectedInstructors?: SelectedInstructor[]; // 初始選中的講者列表
  title?: string; // Modal 標題，默認 "選擇講者"
}

const InstructorSelectionModal: React.FC<InstructorSelectionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialSelectedInstructors = [],
  title = "選擇講者",
}) => {
  const [keyword, setKeyword] = useState("");
  const [selectedInstructors, setSelectedInstructors] = useState<SelectedInstructor[]>(initialSelectedInstructors);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [selectedRows, setSelectedRows] = useState<InstructorItem[]>([]);

  // 當 initialSelectedInstructors 或 isOpen 改變時，更新 selectedInstructors
  useEffect(() => {
    if (isOpen) {
      setSelectedInstructors(initialSelectedInstructors);
      // 初始化選中的 keys（但需要等待 instructors 數據加載完成後再設置）
      const initialKeys = initialSelectedInstructors.map((instructor) => instructor.instructorId);
      setSelectedKeys(initialKeys);
      setSelectedRows([]); // 清空選中的行，等待數據加載後再設置
    } else {
      // Modal 關閉時重置
      setSelectedKeys([]);
      setSelectedRows([]);
    }
  }, [initialSelectedInstructors, isOpen]);

  // 使用 API 獲取講者列表（不分頁）
  const {
    data: instructorsData,
    isLoading: loading,
    execute: refetchInstructors,
  } = useApi(() => instructorService.getList(), {
    enableCache: false,
    autoExecute: isOpen, // 只在 Modal 打開時執行
  });

  // 轉換講者列表並根據關鍵字過濾
  const instructors = useMemo(() => {
    const allInstructors = instructorsData?.items || [];
    if (!keyword.trim()) {
      return allInstructors;
    }
    const lowerKeyword = keyword.toLowerCase();
    return allInstructors.filter(
      (instructor) =>
        instructor.name.toLowerCase().includes(lowerKeyword) || (instructor.title && instructor.title.toLowerCase().includes(lowerKeyword))
    );
  }, [instructorsData, keyword]);

  // Columns definition for available instructors
  const columns: DataTableColumn<InstructorItem>[] = useMemo(
    () => [
      {
        key: "name",
        label: "姓名",
        sortable: false,
        width: "max-w-8",
        tooltip: true,
      },
      {
        key: "title",
        label: "職稱",
        sortable: false,
        width: "max-w-16",
        tooltip: true,
        tooltipWrapContent: false,
        render: (value: unknown) => {
          const title = value as string | undefined;
          return title || <span className="text-gray-400">無</span>;
        },
      },
    ],
    []
  );

  // 處理講者選取（從 DataTable 的 onRowSelect 觸發）
  const handleRowSelect = useCallback(
    (row: InstructorItem, checked: boolean) => {
      const instructorId = row.id;
      let newSelectedKeys: string[];
      let newSelectedRows: InstructorItem[];

      if (checked) {
        // 選中
        if (!selectedKeys.includes(instructorId)) {
          newSelectedKeys = [...selectedKeys, instructorId];
          newSelectedRows = [...selectedRows, row];
        } else {
          return; // 已經選中，不需要更新
        }
      } else {
        // 取消選中
        newSelectedKeys = selectedKeys.filter((key) => key !== instructorId);
        newSelectedRows = selectedRows.filter((r) => r.id !== instructorId);
      }

      setSelectedKeys(newSelectedKeys);
      setSelectedRows(newSelectedRows);

      // 更新 selectedInstructors
      const instructorMap = new Map(instructors.map((i) => [i.id, i]));
      const newSelectedInstructors: SelectedInstructor[] = [];

      newSelectedKeys.forEach((id) => {
        const instructor = instructorMap.get(id);
        if (instructor) {
          // 檢查是否已經在 selectedInstructors 中（保留原有的 isPrimary 和 sequence）
          const existing = selectedInstructors.find((i) => i.instructorId === id);
          if (existing) {
            newSelectedInstructors.push(existing);
          } else {
            // 新增的講者
            newSelectedInstructors.push({
              instructorId: id,
              name: instructor.name,
              isPrimary: newSelectedInstructors.length === 0 && selectedInstructors.length === 0, // 第一個自動設為主講者
              sequence: newSelectedInstructors.length,
            });
          }
        }
      });

      // 重新分配 sequence，保持順序
      const finalInstructors = newSelectedInstructors.map((item, idx) => ({
        ...item,
        sequence: idx,
      }));

      // 確保至少有一個主講者
      const hasPrimary = finalInstructors.some((item) => item.isPrimary);
      if (finalInstructors.length > 0 && !hasPrimary) {
        finalInstructors[0].isPrimary = true;
      }

      setSelectedInstructors(finalInstructors);
    },
    [instructors, selectedKeys, selectedRows, selectedInstructors]
  );

  // 處理全選
  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        // 全選當前可見的講者
        const allVisibleKeys = instructors.map((i) => i.id);
        const newKeys = Array.from(new Set([...selectedKeys, ...allVisibleKeys]));
        const newRows = [...selectedRows, ...instructors.filter((i) => !selectedRows.some((r) => r.id === i.id))];

        setSelectedKeys(newKeys);
        setSelectedRows(newRows);

        // 更新 selectedInstructors
        const instructorMap = new Map(instructors.map((i) => [i.id, i]));
        const newSelectedInstructors: SelectedInstructor[] = [];

        newKeys.forEach((id) => {
          const instructor = instructorMap.get(id) || selectedRows.find((r) => r.id === id);
          if (instructor) {
            const existing = selectedInstructors.find((i) => i.instructorId === id);
            if (existing) {
              newSelectedInstructors.push(existing);
            } else {
              newSelectedInstructors.push({
                instructorId: id,
                name: instructor.name,
                isPrimary: newSelectedInstructors.length === 0,
                sequence: newSelectedInstructors.length,
              });
            }
          }
        });

        const finalInstructors = newSelectedInstructors.map((item, idx) => ({
          ...item,
          sequence: idx,
        }));

        const hasPrimary = finalInstructors.some((item) => item.isPrimary);
        if (finalInstructors.length > 0 && !hasPrimary) {
          finalInstructors[0].isPrimary = true;
        }

        setSelectedInstructors(finalInstructors);
      } else {
        // 取消全選（只取消當前可見的講者）
        const visibleIds = new Set(instructors.map((i) => i.id));
        const newKeys = selectedKeys.filter((key) => !visibleIds.has(key));
        const newRows = selectedRows.filter((r) => !visibleIds.has(r.id));

        setSelectedKeys(newKeys);
        setSelectedRows(newRows);

        // 更新 selectedInstructors
        setSelectedInstructors((prev) => prev.filter((i) => !visibleIds.has(i.instructorId)));
      }
    },
    [instructors, selectedKeys, selectedRows, selectedInstructors]
  );

  // 處理順序調整
  const handleMoveUp = useCallback((index: number) => {
    if (index === 0) return;
    setSelectedInstructors((prev) => {
      const newList = [...prev];
      [newList[index - 1], newList[index]] = [newList[index], newList[index - 1]];
      // 重新分配 sequence
      return newList.map((item, idx) => ({
        ...item,
        sequence: idx,
      }));
    });
  }, []);

  const handleMoveDown = useCallback((index: number) => {
    setSelectedInstructors((prev) => {
      if (index >= prev.length - 1) return prev;
      const newList = [...prev];
      [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
      // 重新分配 sequence
      return newList.map((item, idx) => ({
        ...item,
        sequence: idx,
      }));
    });
  }, []);

  // 處理移除
  const handleRemove = useCallback((index: number) => {
    setSelectedInstructors((prev) => {
      const newList = prev.filter((_, idx) => idx !== index);
      // 重新分配 sequence
      return newList.map((item, idx) => ({
        ...item,
        sequence: idx,
      }));
    });
  }, []);

  // 處理主講者切換
  const handleTogglePrimary = useCallback((index: number, checked: boolean) => {
    setSelectedInstructors((prev) => {
      const newList = [...prev];

      if (!checked) {
        // 如果取消主講者，檢查是否還有其他主講者
        const otherPrimaryCount = newList.filter((item, idx) => idx !== index && item.isPrimary).length;
        if (otherPrimaryCount === 0 && newList.length > 1) {
          // 如果沒有其他主講者且還有其他講者，不允許取消（至少需要一個主講者）
          return prev;
        }
        // 允許取消主講者
        newList[index].isPrimary = false;
      } else {
        // 設置新的主講者，取消其他主講者
        newList.forEach((item, idx) => {
          item.isPrimary = idx === index;
        });
      }

      return newList;
    });
  }, []);

  // Columns definition for selected instructors
  const selectedColumns: DataTableColumn<SelectedInstructor>[] = useMemo(
    () => [
      {
        key: "isPrimary",
        label: "主講者",
        sortable: false,
        width: "w-24",
        align: "center",
        render: (_value: unknown, row: SelectedInstructor) => {
          const index = selectedInstructors.findIndex((i) => i.instructorId === row.instructorId);
          if (index === -1) return null; // 如果找不到對應的項，不渲染

          return (
            <Checkbox
              id={`primary-${row.instructorId}`}
              checked={row.isPrimary}
              onChange={(checked) => {
                handleTogglePrimary(index, checked);
              }}
            />
          );
        },
      },
      {
        key: "sequence",
        label: "順序",
        sortable: false,
        width: "w-16",
        render: (_value: unknown, row: SelectedInstructor) => {
          const index = selectedInstructors.findIndex((i) => i.instructorId === row.instructorId);
          return <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{index + 1}</span>;
        },
      },
      {
        key: "name",
        label: "姓名",
        sortable: false,
        width: "max-w-48",
        tooltip: true,
        render: (_value: unknown, row: SelectedInstructor) => {
          return <span className="text-sm font-medium text-gray-900 dark:text-white">{row.name}</span>;
        },
      },
      {
        key: "actions",
        label: "操作",
        sortable: false,
        width: "w-32",
        align: "center",
        render: (_value: unknown, row: SelectedInstructor) => {
          const index = selectedInstructors.findIndex((i) => i.instructorId === row.instructorId);
          return (
            <div className="flex items-center justify-center gap-1">
              <Button variant="outline" size="xs" onClick={() => handleMoveUp(index)} disabled={index === 0} className="p-1">
                <MdArrowUpward className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="xs"
                onClick={() => handleMoveDown(index)}
                disabled={index === selectedInstructors.length - 1}
                className="p-1"
              >
                <MdArrowDownward className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="xs"
                onClick={() => handleRemove(index)}
                className="p-1 text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-600"
              >
                <MdDelete className="size-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    [selectedInstructors, handleTogglePrimary, handleMoveUp, handleMoveDown, handleRemove]
  );

  // 處理確認選擇
  const handleConfirm = useCallback(() => {
    onConfirm(selectedInstructors);
    onClose();
  }, [selectedInstructors, onConfirm, onClose]);

  // 計算預設選中的 keys（從 selectedInstructors 中提取 instructorId）
  const defaultSelectedKeys = useMemo(() => {
    return selectedInstructors.map((instructor) => instructor.instructorId);
  }, [selectedInstructors]);

  // 同步 defaultSelectedKeys 到 selectedKeys（當 instructors 數據加載完成後）
  useEffect(() => {
    if (defaultSelectedKeys.length > 0 && instructors.length > 0) {
      // 找出對應的行數據
      const rowsToSelect = instructors.filter((instructor) => defaultSelectedKeys.includes(instructor.id));
      const keysToSelect = rowsToSelect.map((r) => r.id);

      // 檢查是否需要更新
      const currentKeysSet = new Set(selectedKeys);
      const keysToSelectSet = new Set(keysToSelect);
      const needsUpdate =
        keysToSelect.length !== selectedKeys.length ||
        !keysToSelect.every((key) => currentKeysSet.has(key)) ||
        !selectedKeys.every((key) => keysToSelectSet.has(key) || !defaultSelectedKeys.includes(key));

      if (needsUpdate) {
        // 合併現有的選中狀態（保留不在當前過濾結果中的已選項）
        const allKeys = Array.from(
          new Set([...selectedKeys.filter((key) => !defaultSelectedKeys.includes(key) || keysToSelect.includes(key)), ...keysToSelect])
        );
        const allRows = [
          ...selectedRows.filter((r) => !defaultSelectedKeys.includes(r.id) || keysToSelect.includes(r.id)),
          ...rowsToSelect.filter((r) => !selectedRows.some((sr) => sr.id === r.id)),
        ];

        setSelectedKeys(allKeys);
        setSelectedRows(allRows);
      }
    } else if (defaultSelectedKeys.length === 0 && selectedKeys.length > 0) {
      // 如果 defaultSelectedKeys 為空，清除選中狀態
      setSelectedKeys([]);
      setSelectedRows([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultSelectedKeys.join(","), instructors.map((i) => i.id).join(",")]);

  // 當 Modal 關閉時重置狀態
  const handleClose = useCallback(() => {
    setSelectedInstructors(initialSelectedInstructors);
    setKeyword("");
    setSelectedKeys([]);
    setSelectedRows([]);
    onClose();
  }, [initialSelectedInstructors, onClose]);

  return (
    <Modal
      title={title}
      isOpen={isOpen}
      onClose={handleClose}
      className="max-w-[90vw] w-full max-h-[90vh] mx-4 p-6 bg-white dark:bg-gray-900 flex flex-col"
    >
      <div className="flex flex-col flex-1 min-h-0 max-h-[calc(90vh-120px)]">
        <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
          {/* 左側：可選講者列表 */}
          <div className="flex flex-col min-h-0">
            <div className="shrink-0 mb-2 h-12 flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">可選講者</h3>
              <div className="flex items-center gap-2">
                <Input
                  id="instructor-search"
                  type="text"
                  placeholder="搜尋講者姓名、職稱..."
                  value={keyword}
                  onChange={(e) => {
                    setKeyword(e.target.value);
                  }}
                  className="w-64"
                />
                <Button variant="outline" size="sm" onClick={() => refetchInstructors()}>
                  刷新
                </Button>
              </div>
            </div>
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex-auto min-h-0 max-w-full overflow-x-auto overflow-y-auto custom-scrollbar">
                <Table className="w-full">
                  <DataTableHeader<InstructorItem>
                    columns={columns}
                    singleSelect={false}
                    onSelectAll={handleSelectAll}
                    selectedCount={selectedKeys.filter((key) => instructors.some((i) => i.id === key)).length}
                    totalCount={instructors.length}
                  />
                  <DataTableBody<InstructorItem>
                    data={instructors}
                    columns={columns}
                    singleSelect={false}
                    selectedRows={selectedRows.filter((r) => instructors.some((i) => i.id === r.id))}
                    selectedKeys={selectedKeys.filter((key) => instructors.some((i) => i.id === key))}
                    onRowSelect={handleRowSelect}
                    rowKey="id"
                    loading={loading}
                    emptyMessage="暫無講者資料"
                  />
                </Table>
              </div>
            </div>
          </div>

          {/* 右側：已選講者列表 */}
          <div className="flex flex-col min-h-0">
            <div className="shrink-0 mb-2 h-12 flex items-center">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">已選講者 ({selectedInstructors.length})</h3>
            </div>
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700 rounded-lg">
              {selectedInstructors.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">尚未選擇講者</div>
              ) : (
                <div className="flex-auto min-h-0 max-w-full overflow-x-auto overflow-y-auto custom-scrollbar">
                  <Table className="w-full">
                    <DataTableHeader<SelectedInstructor> columns={selectedColumns} singleSelect={true} />
                    <DataTableBody<SelectedInstructor>
                      data={selectedInstructors}
                      columns={selectedColumns}
                      singleSelect={true}
                      selectedRows={[]}
                      selectedKeys={[]}
                      onRowSelect={() => {}}
                      rowKey="instructorId"
                      emptyMessage="暫無已選講者"
                    />
                  </Table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
          <Button variant="outline" onClick={handleClose}>
            取消
          </Button>
          <Button variant="primary" onClick={handleConfirm}>
            確認選擇 ({selectedInstructors.length})
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default InstructorSelectionModal;

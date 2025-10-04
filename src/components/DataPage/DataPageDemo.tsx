import { useState } from "react";
import DataPage from "./DataPage";
import { createCommonButtons, createPageButton, PAGE_BUTTON_TYPES } from "./PageButtonTypes";
import { DataTableColumn, DataTableRowAction } from "./types";

// 使用 DataTablePageExample 的 generateMockData 函數
function generateMockData(total: number) {
  const list = [];
  for (let i = 1; i <= total; i++) {
    const isDeleted = i % 7 === 0;
    list.push({
      id: String(i),
      name: `Item ${i}`,
      status: i % 3 === 0 ? "inactive" : "active",
      createdAt: new Date(Date.now() - i * 86400000).toISOString(),
      deleted: isDeleted,
    });
  }
  return list;
}

type Row = {
  id: string;
  name: string;
  status: "active" | "inactive";
  createdAt: string;
  deleted?: boolean;
};

export default function DataPageDemo() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [orderBy, setOrderBy] = useState<string>("createdAt");
  const [descending, setDescending] = useState<boolean>(true);

  const allData = generateMockData(50) as Row[];

  // 模擬分頁資料
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = allData.slice(startIndex, endIndex);

  // 分頁資料格式
  const pagedData = {
    page: currentPage,
    pageSize: pageSize,
    total: allData.length,
    items: currentData,
  };

  const columns: DataTableColumn<Row>[] = [
    {
      key: "id",
      label: "ID",
      width: 80,
      sortable: true,
    },
    {
      key: "name",
      label: "名稱",
      sortable: true,
      copyable: true,
      tooltip: (row) => row.name,
      renderExpand: (row) => (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">詳細資訊</h4>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <strong>ID:</strong> {row.id}
            </div>
            <div>
              <strong>狀態:</strong> {row.status === "active" ? "啟用" : "停用"}
            </div>
            <div>
              <strong>建立時間:</strong> {new Date(row.createdAt).toLocaleString()}
            </div>
            <div>
              <strong>已刪除:</strong> {row.deleted ? "是" : "否"}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "狀態",
      sortable: true,
      valueEnum: {
        item: (value: unknown) => {
          if (value === "active") return { text: "啟用", color: "text-green-600" };
          if (value === "inactive") return { text: "停用", color: "text-gray-500" };
          return null;
        },
      },
    },
    {
      key: "createdAt",
      label: "建立時間",
      sortable: true,
      tooltip: (row) => new Date(row.createdAt).toLocaleString(),
      render: (value: unknown) => new Date(value as string).toLocaleDateString(),
    },
  ];

  // 右鍵選單動作
  const rowActions: DataTableRowAction<Row>[] = [
    {
      key: "view",
      label: "檢視詳情",
      icon: createPageButton(PAGE_BUTTON_TYPES.VIEW, () => {}).icon,
      onClick: (row) => {
        alert(`檢視 ${row.name} 的詳情`);
      },
    },
    {
      key: "edit",
      label: "編輯",
      icon: createPageButton(PAGE_BUTTON_TYPES.EDIT, () => {}).icon,
      onClick: (row) => {
        alert(`編輯 ${row.name}`);
      },
    },
    {
      key: "copy",
      label: "複製",
      icon: createPageButton(PAGE_BUTTON_TYPES.COPY, () => {}).icon,
      onClick: (row) => {
        navigator.clipboard.writeText(JSON.stringify(row));
        alert(`已複製 ${row.name} 的資料`);
      },
    },
    {
      key: "delete",
      label: "刪除",
      icon: createPageButton(PAGE_BUTTON_TYPES.DELETE, () => {}).icon,
      onClick: (row) => {
        if (confirm(`確定要刪除 ${row.name} 嗎？`)) {
          alert(`已刪除 ${row.name}`);
        }
      },
      disabled: (row) => row.status === "inactive", // 停用狀態不能刪除
    },
  ];

  // 事件處理函數
  const handleSort = (columnKey: string, newDescending: boolean) => {
    console.log("排序變更:", columnKey, newDescending);
    setOrderBy(columnKey);
    setDescending(newDescending);
  };

  const handleSearch = (searchKeyword: string) => {
    console.log("執行搜尋:", searchKeyword);
    setKeyword(searchKeyword);
    setCurrentPage(1); // 搜尋時重置到第一頁
  };

  const handleRecycleToggle = (newShowDeleted: boolean) => {
    console.log("回收站切換:", newShowDeleted);
    setShowDeleted(newShowDeleted);
    setCurrentPage(1); // 切換回收站時重置到第一頁
  };

  const handlePageChange = (page: number) => {
    console.log("頁面變更:", page);
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newPageSize: number) => {
    console.log("每頁項目數變更:", newPageSize);
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const handleRowSelect = (selectedRows: Row[], selectedKeys: string[]) => {
    console.log("選中的行:", selectedRows, "Keys:", selectedKeys);
  };

  // 建立 Toolbar 按鈕
  const toolbarButtons = createCommonButtons({
    onAdd: () => alert("新增功能"),
    onRefresh: () => {
      console.log("刷新資料");
      setCurrentPage(1);
    },
    onDownload: () => alert("下載功能"),
  });

  return (
    <>
      {/* 主要 DataPage 組件 */}
      <DataPage<Row>
        data={pagedData}
        columns={columns}
        initialOrderBy="createdAt"
        initialDescending={true}
        initialKeyword=""
        initialShowDeleted={false}
        searchable={true}
        searchPlaceholder="搜尋項目..."
        buttons={toolbarButtons}
        showRecycleToggle={true}
        rowActions={rowActions}
        onSort={handleSort}
        onSearch={handleSearch}
        onRecycleToggle={handleRecycleToggle}
        onRowSelect={handleRowSelect}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />
    </>
  );
}

import { usePermissions } from "@/api/hooks/usePermissions";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";

export default function PermissionManagement() {
  const { permissions, isLoading, error, refresh } = usePermissions();

  return (
    <div>
      <PageMeta title="權限管理" description="管理系統權限" />
      <PageBreadcrumb pageTitle="權限管理" />

      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        {isLoading && <p className="text-gray-600 dark:text-gray-400">載入中...</p>}
        {error && (
          <div className="text-red-600 dark:text-red-400">
            <p>{error}</p>
            <button className="underline" onClick={refresh}>
              重試
            </button>
          </div>
        )}
        <ul className="list-disc pl-6">
          {permissions.map((p) => (
            <li key={p.id}>
              {p.name} ({p.code})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

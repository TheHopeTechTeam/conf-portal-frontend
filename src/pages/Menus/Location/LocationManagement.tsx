import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";
import LocationDataPage from "@/pages/Menus/Location/LocationDataPage";

export default function LocationManagement() {
  return (
    <div className="flex flex-col h-[calc(100vh-120px)] gap-3">
      <PageMeta title="地點管理" description="管理系統地點" />
      <PageBreadcrumb pageTitle="地點管理" />
      <div className="flex-1 min-h-0">
        <LocationDataPage />
      </div>
    </div>
  );
}


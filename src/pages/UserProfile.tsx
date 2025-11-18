import ChangePasswordForm from "@/components/auth/ChangePasswordForm";
import UserProfileDetailView from "@/components/auth/UserProfileDetailView";
import PageMeta from "@/components/common/PageMeta";
import Button from "@/components/ui/button";
import { useState } from "react";
import { MdEdit } from "react-icons/md";

export default function UserProfile() {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <>
      <PageMeta
        title="User Profile | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js User Profile page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* 個人資訊 */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
          <div className="flex items-center justify-between mb-5 lg:mb-7">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">個人資訊</h3>
            {!isEditing && (
              <Button variant="primary" size="sm" onClick={() => setIsEditing(true)} className="flex items-center gap-2">
                <MdEdit size={18} />
                修改資料
              </Button>
            )}
          </div>
          <UserProfileDetailView isEditing={isEditing} onEditChange={setIsEditing} />
        </div>

        {/* 修改密碼 */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
          <ChangePasswordForm />
        </div>
      </div>
    </>
  );
}

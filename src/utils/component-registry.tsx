import Blank from "@/pages/Blank";
import Dashboard from "@/pages/Dashboard";
import ConferenceManagement from "@/pages/Menus/Conference/ConferenceManagement";
import FaqManagement from "@/pages/Menus/Faq/FaqManagement";
import FeedbackManagement from "@/pages/Menus/Feedback/FeedbackManagement";
import FileManagement from "@/pages/Menus/File/FileManagement";
import InstructorManagement from "@/pages/Menus/Instructor/InstructorManagement";
import LocationManagement from "@/pages/Menus/Location/LocationManagement";
import TestimonyManagement from "@/pages/Menus/Testimony/TestimonyManagement";
import WorkshopManagement from "@/pages/Menus/Workshop/WorkshopManagement";
import PermissionManagement from "@/pages/System/Permission/PermissionManagement";
import ResourceManagement from "@/pages/System/Resource/ResourceManagement";
import RoleManagement from "@/pages/System/Role/RoleManagement";
import UserManagement from "@/pages/System/User/UserManagement";
import React from "react";

// 註冊可路由的元件，鍵值對應後端資源的 key
const componentRegistry: Record<string, React.ComponentType> = {
  // Dashboard - 主要首頁
  DASHBOARD: Dashboard,
  // Menus
  // CONFERENCE	/conference
  CONFERENCE_BASIC: ConferenceManagement,
  CONFERENCE_EVENT_SCHEDULE: Blank,
  // WORKSHOP /workshop
  WORKSHOP_BASIC: WorkshopManagement,
  WORKSHOP_REGISTRATION: Blank,
  // CONTENT /content
  CONTENT_FILE: FileManagement,
  CONTENT_INSTRUCTOR: InstructorManagement,
  CONTENT_LOCATION: LocationManagement,
  CONTENT_TESTIMONY: TestimonyManagement,
  // SUPPORT /support
  SUPPORT_FAQ: FaqManagement,
  SUPPORT_FEEDBACK: FeedbackManagement,
  // System
  SYSTEM_USER: UserManagement,
  SYSTEM_RESOURCE: ResourceManagement,
  SYSTEM_PERMISSION: PermissionManagement,
  SYSTEM_ROLE: RoleManagement,
  SYSTEM_FCM_DEVICE: Blank,
  SYSTEM_LOG: Blank,
  // COMMS /comms
  COMMS_NOTIFICATION: Blank,
  COMMS_NOTIFICATION_HISTORY: Blank,
};

function normalizeKey(key: string): string {
  return key?.trim();
}

export function resolveRouteElementByKey(key: string): React.ReactElement {
  const normalizedKey = normalizeKey(key);
  const Component = componentRegistry[normalizedKey];

  if (Component) {
    return React.createElement(Component);
  }

  // 如果找不到對應的組件，返回預設的 Blank 組件
  // console.warn(`Component not found for key: "${key}", using Blank component`);
  return React.createElement(Blank);
}

export type {};

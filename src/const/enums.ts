// Shared project enums

import { CountryCode } from "@/types/common";

// Demo domain
export enum Gender {
  Unknown = 0,
  Male = 1,
  Female = 2,
  Other = 3,
}

export enum PopoverPosition {
  Top = "top",
  TopLeft = "top_left",
  TopRight = "top_right",
  Right = "right",
  RightTop = "right_top",
  RightBottom = "right_bottom",
  Bottom = "bottom",
  BottomLeft = "bottom_left",
  BottomRight = "bottom_right",
  Left = "left",
  LeftTop = "left_top",
  LeftBottom = "left_bottom",
}

export const CountryCodes: CountryCode[] = [
  { name: "USA", code: "+1" }, // 美國（United States）
  { name: "CAN", code: "+1" }, // 加拿大（Canada）
  { name: "MEX", code: "+52" }, // 墨西哥（Mexico）
  { name: "PER", code: "+51" }, // 秘魯（Peru）
  { name: "ARG", code: "+54" }, // 阿根廷（Argentina）
  { name: "BRA", code: "+55" }, // 巴西（Brazil）
  { name: "CHL", code: "+56" }, // 智利（Chile）
  { name: "COL", code: "+57" }, // 哥倫比亞（Colombia）
  { name: "VEN", code: "+58" }, // 委內瑞拉（Venezuela）
  { name: "NLD", code: "+31" }, // 荷蘭（Netherlands）
  { name: "ESP", code: "+34" }, // 西班牙（Spain）
  { name: "ITA", code: "+39" }, // 義大利（Italy）
  { name: "AUT", code: "+43" }, // 奧地利（Austria）
  { name: "SWE", code: "+46" }, // 瑞典（Sweden）
  { name: "POL", code: "+48" }, // 波蘭（Poland）
  { name: "FRA", code: "+33" }, // 法國（France）
  { name: "GBR", code: "+44" }, // 英國（United Kingdom）
  { name: "DEU", code: "+49" }, // 德國（Germany）
  { name: "MYS", code: "+60" }, // 馬來西亞（Malaysia）
  { name: "IDN", code: "+62" }, // 印尼（Indonesia）
  { name: "PHL", code: "+63" }, // 菲律賓（Philippines）
  { name: "THA", code: "+66" }, // 泰國（Thailand）
  { name: "SGP", code: "+65" }, // 新加坡（Singapore）
  { name: "JPN", code: "+81" }, // 日本（Japan）
  { name: "VNM", code: "+84" }, // 越南（Vietnam）
  { name: "KOR", code: "+82" }, // 韓國（South Korea）
  { name: "IND", code: "+91" }, // 印度（India）
  { name: "LKA", code: "+94" }, // 斯里蘭卡（Sri Lanka）
  { name: "CHN", code: "+86" }, // 中國（China）
  { name: "HKG", code: "+852" }, // 香港（Hong Kong）
  { name: "TWN", code: "+886" }, // 台灣（Taiwan）
  { name: "BGD", code: "+880" }, // 孟加拉（Bangladesh）
];

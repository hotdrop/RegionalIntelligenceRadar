import type { Importance, SignalCategory } from "@/types/signal";

export const categoryLabels: Record<SignalCategory, string> = {
  "Regional Mobility": "地域交通",
  "Digital Currency": "デジタル地域通貨",
  Tourism: "観光",
  GovTech: "行政DX",
  AI: "AI",
  "Disaster Prevention": "防災",
  Childcare: "子育て",
  "Aging Society": "高齢社会",
  Healthcare: "医療・健康",
  "Smart City": "スマートシティ",
  "Local Commerce": "地域商業",
  "Population Decline": "人口減少",
};

export const importanceLabels: Record<Importance, string> = {
  LOW: "低",
  MEDIUM: "中",
  HIGH: "高",
  CRITICAL: "最重要",
};

const topicLabels: Record<string, string> = {
  GovTech: "行政DX",
  RAG: "検索拡張生成",
  "Citizen Support": "住民支援",
  MaaS: "移動サービス",
  "Aging Society": "高齢社会",
  "Public Transport": "公共交通",
  Healthcare: "医療・健康",
  "Local Commerce": "地域商業",
  "Well-being": "ウェルビーイング",
  Inbound: "訪日観光",
  "Data Analytics": "データ分析",
  UX: "利用体験",
  "Digital Identity": "デジタル本人確認",
  Resilience: "地域レジリエンス",
  "Data Fusion": "データ統合",
  "Emergency Ops": "災害対応",
  Telemedicine: "遠隔医療",
  Mobility: "移動支援",
  "Digital Twin": "デジタルツイン",
  "Urban Planning": "都市計画",
  Migration: "移住",
  Community: "地域コミュニティ",
  "Case Management": "ケース管理",
  "Civic Tech": "市民協働技術",
  Infrastructure: "インフラ",
  "Computer Vision": "画像認識",
  "Vacant Property": "空き家",
  Startup: "創業支援",
  Retail: "小売",
  Agriculture: "農業",
  "Knowledge Management": "ナレッジ管理",
  "Community Care": "地域ケア",
  Volunteering: "地域活動",
  "Family Support": "家族支援",
  "Service Design": "サービス設計",
};

export function topicLabel(topic: string) {
  return topicLabels[topic] ?? topic;
}

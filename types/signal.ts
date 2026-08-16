export const SIGNAL_CATEGORIES = [
  "Regional Mobility",
  "Digital Currency",
  "Tourism",
  "GovTech",
  "AI",
  "Disaster Prevention",
  "Childcare",
  "Aging Society",
  "Healthcare",
  "Smart City",
  "Local Commerce",
  "Population Decline",
] as const;

export type SignalCategory = (typeof SIGNAL_CATEGORIES)[number];
export type SignalImportance = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type RegionalSignal = {
  id: string;
  prefecture: string;
  municipality: string;
  title: string;
  summary: string;
  category: SignalCategory;
  importance: SignalImportance;
  publishedAt: string;
  whyItMatters: string;
  opportunity: string;
  relatedTopics: string[];
  sourceUrl: string;
};

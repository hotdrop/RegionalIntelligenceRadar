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
export const IMPORTANCE_LEVELS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export type Importance = (typeof IMPORTANCE_LEVELS)[number];

export type Signal = {
  id: string;
  prefecture: string;
  municipality: string;
  title: string;
  summary: string;
  category: SignalCategory;
  importance: Importance;
  publishedAt: string;
  whyItMatters: string;
  opportunity: string;
  relatedTopics: string[];
  sourceUrl: string;
};

export type WeeklySignalData = {
  week: string;
  generatedAt: string;
  signals: Signal[];
};

export type ArchivedSignal = Signal & {
  reportWeek: string;
};

export type SignalArchive = {
  reports: WeeklySignalData[];
  latestWeek: string | null;
  allSignals: ArchivedSignal[];
};

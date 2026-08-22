import type { ArchivedSignal, SignalCategory } from "@/types/signal";

export const ALL_WEEKS = "ALL" as const;
export type WeekFilter = string | typeof ALL_WEEKS;

export type SignalFilters = {
  week: WeekFilter;
  prefecture: string | null;
  municipality: string | null;
  category: SignalCategory | null;
};

export function filterSignals(signals: ArchivedSignal[], filters: SignalFilters) {
  return signals.filter(
    (signal) =>
      (filters.week === ALL_WEEKS || signal.reportWeek === filters.week) &&
      (!filters.prefecture || signal.prefecture === filters.prefecture) &&
      (!filters.municipality || signal.municipality === filters.municipality) &&
      (!filters.category || signal.category === filters.category),
  );
}

export function firstSignalId(signals: ArchivedSignal[], filters: SignalFilters) {
  return filterSignals(signals, filters)[0]?.id ?? null;
}

import type { RegionalSignal, SignalCategory } from "@/types/signal";

export type SignalFilters = {
  prefecture: string | null;
  category: SignalCategory | null;
};

export function filterSignals(signals: RegionalSignal[], filters: SignalFilters) {
  return signals.filter(
    (signal) =>
      (!filters.prefecture || signal.prefecture === filters.prefecture) &&
      (!filters.category || signal.category === filters.category),
  );
}

export function firstSignalId(signals: RegionalSignal[], filters: SignalFilters) {
  return filterSignals(signals, filters)[0]?.id ?? null;
}

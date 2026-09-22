import type { ArchivedSignal } from "@/types/signal";

export type SignalFilters = { prefecture: string | null };

export function filterSignals(signals: ArchivedSignal[], filters: SignalFilters) {
  return signals.filter((signal) => !filters.prefecture || signal.prefecture === filters.prefecture);
}

export function firstSignalId(signals: ArchivedSignal[], filters: SignalFilters) {
  return filterSignals(signals, filters)[0]?.id ?? null;
}

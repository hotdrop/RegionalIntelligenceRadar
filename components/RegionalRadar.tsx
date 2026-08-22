"use client";

import { useMemo, useState } from "react";
import { ALL_WEEKS, filterSignals, firstSignalId, type WeekFilter } from "@/data/filterSignals";
import type { SignalArchive, SignalCategory } from "@/types/signal";
import { ArchiveFilter, type MunicipalityOption } from "@/components/ArchiveFilter";
import { CategoryFilter } from "@/components/CategoryFilter";
import { PrefectureMap } from "@/components/PrefectureMap";
import { SignalDetail } from "@/components/SignalDetail";
import { SignalList } from "@/components/SignalList";
import { categoryLabels } from "@/data/presentationLabels";

function municipalityKey(prefecture: string, municipality: string) {
  return `${prefecture}\t${municipality}`;
}

export function RegionalRadar({ archive }: { archive: SignalArchive }) {
  const defaultWeek = archive.latestWeek ?? ALL_WEEKS;
  const [selectedWeek, setSelectedWeek] = useState<WeekFilter>(defaultWeek);
  const [selectedPrefecture, setSelectedPrefecture] = useState<string | null>(null);
  const [selectedMunicipality, setSelectedMunicipality] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<SignalCategory | null>(null);
  const [selectedSignalId, setSelectedSignalId] = useState<string | null>(() =>
    firstSignalId(archive.allSignals, { week: defaultWeek, prefecture: null, municipality: null, category: null }),
  );

  const municipalities = useMemo<MunicipalityOption[]>(() => {
    const options = new Map<string, MunicipalityOption>();
    for (const signal of archive.allSignals) {
      const key = municipalityKey(signal.prefecture, signal.municipality);
      options.set(key, { key, prefecture: signal.prefecture, municipality: signal.municipality });
    }
    return [...options.values()].sort((a, b) =>
      a.prefecture.localeCompare(b.prefecture, "ja") || a.municipality.localeCompare(b.municipality, "ja"),
    );
  }, [archive.allSignals]);

  const filters = useMemo(() => ({
    week: selectedWeek,
    prefecture: selectedPrefecture,
    municipality: selectedMunicipality,
    category: selectedCategory,
  }), [selectedCategory, selectedMunicipality, selectedPrefecture, selectedWeek]);

  const filteredSignals = useMemo(
    () => filterSignals(archive.allSignals, filters),
    [archive.allSignals, filters],
  );
  const periodSignals = useMemo(
    () => filterSignals(archive.allSignals, { week: selectedWeek, prefecture: null, municipality: null, category: null }),
    [archive.allSignals, selectedWeek],
  );
  const selectedSignal = filteredSignals.find((signal) => signal.id === selectedSignalId) ?? filteredSignals[0] ?? null;
  const latestReport = archive.reports[0] ?? null;

  function selectFirst(nextFilters: typeof filters) {
    setSelectedSignalId(firstSignalId(archive.allSignals, nextFilters));
  }

  function chooseWeek(week: WeekFilter) {
    setSelectedWeek(week);
    selectFirst({ ...filters, week });
  }

  function choosePrefecture(prefecture: string | null) {
    const municipalityIsValid = prefecture && municipalities.some(
      (option) => option.prefecture === prefecture && option.municipality === selectedMunicipality,
    );
    const municipality = municipalityIsValid ? selectedMunicipality : null;
    setSelectedPrefecture(prefecture);
    setSelectedMunicipality(municipality);
    selectFirst({ ...filters, prefecture, municipality });
  }

  function chooseMunicipality(option: MunicipalityOption | null) {
    const prefecture = option?.prefecture ?? selectedPrefecture;
    const municipality = option?.municipality ?? null;
    setSelectedPrefecture(prefecture);
    setSelectedMunicipality(municipality);
    selectFirst({ ...filters, prefecture, municipality });
  }

  function chooseCategory(category: SignalCategory | null) {
    setSelectedCategory(category);
    selectFirst({ ...filters, category });
  }

  function clearFilters() {
    setSelectedWeek(defaultWeek);
    setSelectedPrefecture(null);
    setSelectedMunicipality(null);
    setSelectedCategory(null);
    selectFirst({ week: defaultWeek, prefecture: null, municipality: null, category: null });
  }

  const selectedMunicipalityKey = selectedPrefecture && selectedMunicipality
    ? municipalityKey(selectedPrefecture, selectedMunicipality)
    : "";
  const hasFilters = selectedWeek !== defaultWeek || Boolean(selectedPrefecture || selectedMunicipality || selectedCategory);

  return (
    <main className="console-shell">
      <header className="topbar">
        <div className="brand-lockup"><span className="brand-mark">RIR</span><div><h1>地域インテリジェンス・レーダー</h1><p>地域シグナル / 公共政策 / 地域イノベーション</p></div></div>
        <div className="system-stats">
          <span><b>LATEST REPORT</b>{latestReport?.week ?? "—"}</span>
          <span><b>SIGNALS</b>{latestReport?.signals.length ?? 0}</span>
          <span><b>ARCHIVE</b>{archive.reports.length} WEEKS</span>
        </div>
      </header>

      <ArchiveFilter
        weeks={archive.reports.map((report) => report.week)}
        latestWeek={archive.latestWeek}
        selectedWeek={selectedWeek}
        municipalities={municipalities}
        selectedMunicipalityKey={selectedMunicipalityKey}
        onSelectWeek={chooseWeek}
        onSelectMunicipality={chooseMunicipality}
      />
      <CategoryFilter selectedCategory={selectedCategory} onSelectCategory={chooseCategory} />

      <div className="active-filter-bar" data-visible={hasFilters}>
        <span>絞り込み条件</span>
        {selectedWeek !== defaultWeek && <button type="button" onClick={() => chooseWeek(defaultWeek)}>期間：{selectedWeek === ALL_WEEKS ? "All" : selectedWeek} ×</button>}
        {selectedPrefecture && <button type="button" onClick={() => choosePrefecture(null)}>地域：{selectedPrefecture} ×</button>}
        {selectedMunicipality && <button type="button" onClick={() => chooseMunicipality(null)}>自治体：{selectedMunicipality} ×</button>}
        {selectedCategory && <button type="button" onClick={() => chooseCategory(null)}>カテゴリ：{categoryLabels[selectedCategory]} ×</button>}
        {hasFilters && <button type="button" className="clear-all" onClick={clearFilters}>すべて解除</button>}
      </div>

      <section className="workspace">
        <PrefectureMap signals={periodSignals} selectedPrefecture={selectedPrefecture} onSelectPrefecture={choosePrefecture} />
        <section className="right-column">
          <SignalList signals={filteredSignals} totalSignals={periodSignals.length} selectedSignalId={selectedSignal?.id ?? null} onSelectSignal={setSelectedSignalId} />
          <SignalDetail signal={selectedSignal} />
        </section>
      </section>
    </main>
  );
}

"use client";

import { useMemo, useState } from "react";
import { mockSignals } from "@/data/mockSignals";
import { filterSignals, firstSignalId } from "@/data/filterSignals";
import type { SignalCategory } from "@/types/signal";
import { CategoryFilter } from "@/components/CategoryFilter";
import { PrefectureMap } from "@/components/PrefectureMap";
import { SignalDetail } from "@/components/SignalDetail";
import { SignalList } from "@/components/SignalList";
import { categoryLabels } from "@/data/presentationLabels";

export function RegionalRadar() {
  const [selectedPrefecture, setSelectedPrefecture] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<SignalCategory | null>(null);
  const [selectedSignalId, setSelectedSignalId] = useState<string | null>(mockSignals[0].id);

  const filteredSignals = useMemo(
    () => filterSignals(mockSignals, { prefecture: selectedPrefecture, category: selectedCategory }),
    [selectedCategory, selectedPrefecture],
  );
  const selectedSignal = filteredSignals.find((signal) => signal.id === selectedSignalId) ?? filteredSignals[0] ?? null;
  const activePrefectures = new Set(mockSignals.map((signal) => signal.prefecture)).size;

  function choosePrefecture(prefecture: string | null) {
    setSelectedPrefecture(prefecture);
    setSelectedSignalId(firstSignalId(mockSignals, { prefecture, category: selectedCategory }));
  }

  function chooseCategory(category: SignalCategory | null) {
    setSelectedCategory(category);
    setSelectedSignalId(firstSignalId(mockSignals, { prefecture: selectedPrefecture, category }));
  }

  function clearFilters() {
    setSelectedPrefecture(null);
    setSelectedCategory(null);
    setSelectedSignalId(mockSignals[0].id);
  }

  const hasFilters = Boolean(selectedPrefecture || selectedCategory);

  return (
    <main className="console-shell">
      <header className="topbar">
        <div className="brand-lockup"><span className="brand-mark">RIR</span><div><h1>地域インテリジェンス・レーダー</h1><p>地域シグナル / 公共政策 / 地域イノベーション</p></div></div>
        <div className="system-stats"><span className="online"><i /> システム稼働中</span><span>最終更新 08:30 JST</span><span>シグナル {mockSignals.length}件</span><span>対象地域 {activePrefectures}都道府県</span></div>
      </header>

      <CategoryFilter selectedCategory={selectedCategory} onSelectCategory={chooseCategory} />

      <div className="active-filter-bar" data-visible={hasFilters}>
        <span>絞り込み条件</span>
        {selectedPrefecture && <button type="button" onClick={() => choosePrefecture(null)}>地域：{selectedPrefecture} ×</button>}
        {selectedCategory && <button type="button" onClick={() => chooseCategory(null)}>カテゴリ：{categoryLabels[selectedCategory]} ×</button>}
        {hasFilters && <button type="button" className="clear-all" onClick={clearFilters}>すべて解除</button>}
      </div>

      <section className="workspace">
        <PrefectureMap signals={mockSignals} selectedPrefecture={selectedPrefecture} onSelectPrefecture={choosePrefecture} />
        <section className="right-column">
          <SignalList signals={filteredSignals} totalSignals={mockSignals.length} selectedSignalId={selectedSignal?.id ?? null} onSelectSignal={setSelectedSignalId} />
          <SignalDetail signal={selectedSignal} />
        </section>
      </section>
    </main>
  );
}

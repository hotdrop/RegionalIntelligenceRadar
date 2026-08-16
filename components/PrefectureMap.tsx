import { prefecturePositions } from "@/data/prefectures";
import type { RegionalSignal } from "@/types/signal";

type PrefectureMapProps = {
  signals: RegionalSignal[];
  selectedPrefecture: string | null;
  onSelectPrefecture: (prefecture: string | null) => void;
};

const importanceWeight = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 } as const;

export function PrefectureMap({ signals, selectedPrefecture, onSelectPrefecture }: PrefectureMapProps) {
  const stats = new Map<string, { count: number; peak: keyof typeof importanceWeight }>();
  for (const signal of signals) {
    const current = stats.get(signal.prefecture);
    const peak = current && importanceWeight[current.peak] > importanceWeight[signal.importance] ? current.peak : signal.importance;
    stats.set(signal.prefecture, { count: (current?.count ?? 0) + 1, peak });
  }

  return (
    <section className="panel map-panel">
      <div className="panel-heading">
        <div><span className="eyebrow">GEOSPATIAL INDEX / 47 PREFECTURES</span><h2>JAPAN SIGNAL MAP</h2></div>
        <span className="panel-code">MAP_01</span>
      </div>
      <div className="map-stage">
        <div className="map-orbit orbit-one" /><div className="map-orbit orbit-two" />
        <div className="prefecture-map" aria-label="都道府県シグナルマップ">
          {prefecturePositions.map(({ name, x, y }) => {
            const signal = stats.get(name);
            const selected = selectedPrefecture === name;
            return (
              <button
                key={name}
                type="button"
                aria-label={`${name}${signal ? `、シグナル${signal.count}件` : "、シグナルなし"}`}
                aria-pressed={selected}
                className={`prefecture-cell ${signal ? `active ${signal.peak.toLowerCase()}` : ""} ${selected ? "selected" : ""}`}
                style={{ left: `${x}%`, top: `${y}%` }}
                onClick={() => onSelectPrefecture(selected ? null : name)}
              >
                <span>{name.replace(/[都府県]/g, "")}</span>
                {signal && <i className="cell-pulse" />}
              </button>
            );
          })}
        </div>
        <div className="map-readout">
          <span>ACTIVE REGION</span>
          <strong>{selectedPrefecture ? selectedPrefecture.toUpperCase() : "ALL PREFECTURES"}</strong>
          <small>{selectedPrefecture ? `${stats.get(selectedPrefecture)?.count ?? 0} signals detected` : `${stats.size} regions reporting signals`}</small>
        </div>
        <div className="map-axis axis-x"><span>WEST</span><span>EAST</span></div>
      </div>
      <div className="map-legend">
        <span><i className="legend-dot critical" /> CRITICAL</span><span><i className="legend-dot high" /> HIGH</span><span><i className="legend-dot medium" /> MEDIUM</span>
        <button type="button" className="text-action" onClick={() => onSelectPrefecture(null)} disabled={!selectedPrefecture}>CLEAR REGION</button>
      </div>
    </section>
  );
}

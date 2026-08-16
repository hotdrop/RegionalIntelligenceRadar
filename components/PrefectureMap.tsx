import japan from "@svg-maps/japan";
import { prefectureNamesById, signalMarkerPositions } from "@/data/prefectures";
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
        <svg className="japan-map" viewBox={japan.viewBox} role="img" aria-labelledby="japan-map-title">
          <title id="japan-map-title">都道府県別の地域シグナルを表示する日本地図</title>
          <g className="prefecture-shapes">
            {japan.locations.map((location) => {
              const prefecture = prefectureNamesById[location.id];
              const signal = stats.get(prefecture);
              const selected = selectedPrefecture === prefecture;
              return (
                <path
                  key={location.id}
                  d={location.path}
                  role="button"
                  tabIndex={0}
                  aria-label={`${prefecture}${signal ? `、シグナル${signal.count}件` : "、シグナルなし"}`}
                  aria-pressed={selected}
                  className={`prefecture-shape ${signal ? `active ${signal.peak.toLowerCase()}` : ""} ${selected ? "selected" : ""}`}
                  onClick={() => onSelectPrefecture(selected ? null : prefecture)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onSelectPrefecture(selected ? null : prefecture);
                    }
                  }}
                >
                  <title>{`${prefecture}${signal ? ` — ${signal.count} SIGNALS / ${signal.peak}` : " — NO SIGNAL"}`}</title>
                </path>
              );
            })}
          </g>
          <g className="signal-markers" aria-hidden="true">
            {japan.locations.flatMap((location) => {
              const prefecture = prefectureNamesById[location.id];
              const signal = stats.get(prefecture);
              const marker = signalMarkerPositions[location.id];
              if (!signal || !marker) return [];
              return [
                <g key={location.id} className={`map-signal-marker ${signal.peak.toLowerCase()} ${selectedPrefecture === prefecture ? "selected" : ""}`}>
                  <circle className="marker-ring" cx={marker.x} cy={marker.y} r="8" />
                  <circle className="marker-core" cx={marker.x} cy={marker.y} r={signal.count > 1 ? "3.5" : "2.8"} />
                </g>,
              ];
            })}
          </g>
        </svg>
        <div className="map-scanline" aria-hidden="true" />
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

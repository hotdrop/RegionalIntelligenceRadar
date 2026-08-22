import japan from "@svg-maps/japan";
import { prefectureNamesById, signalMarkerPositions } from "@/data/prefectures";
import type { ArchivedSignal } from "@/types/signal";
import { importanceLabels } from "@/data/presentationLabels";

type PrefectureMapProps = {
  signals: ArchivedSignal[];
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
        <div><span className="eyebrow">地域インデックス / 47都道府県</span><h2>日本シグナルマップ</h2></div>
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
                  <title>{`${prefecture}${signal ? ` — シグナル${signal.count}件 / 重要度${importanceLabels[signal.peak]}` : " — シグナルなし"}`}</title>
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
          <span>選択地域</span>
          <strong>{selectedPrefecture ?? "全国"}</strong>
          <small>{selectedPrefecture ? `シグナル ${stats.get(selectedPrefecture)?.count ?? 0}件` : `${stats.size}都道府県にシグナルあり`}</small>
        </div>
        <div className="map-axis axis-x"><span>西</span><span>東</span></div>
      </div>
      <div className="map-legend">
        <span><i className="legend-dot critical" /> 最重要</span><span><i className="legend-dot high" /> 高</span><span><i className="legend-dot medium" /> 中</span>
        <button type="button" className="text-action" onClick={() => onSelectPrefecture(null)} disabled={!selectedPrefecture}>地域選択を解除</button>
      </div>
    </section>
  );
}

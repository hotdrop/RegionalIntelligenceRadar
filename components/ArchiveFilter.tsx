import { ALL_WEEKS, type WeekFilter } from "@/data/filterSignals";

export type MunicipalityOption = {
  key: string;
  prefecture: string;
  municipality: string;
};

type ArchiveFilterProps = {
  weeks: string[];
  latestWeek: string | null;
  selectedWeek: WeekFilter;
  municipalities: MunicipalityOption[];
  selectedMunicipalityKey: string;
  onSelectWeek: (week: WeekFilter) => void;
  onSelectMunicipality: (option: MunicipalityOption | null) => void;
};

function formatWeek(week: string) {
  return week.replaceAll("-", ".");
}

export function ArchiveFilter({
  weeks,
  latestWeek,
  selectedWeek,
  municipalities,
  selectedMunicipalityKey,
  onSelectWeek,
  onSelectMunicipality,
}: ArchiveFilterProps) {
  return (
    <div className="archive-filter" aria-label="レポート期間と自治体の絞り込み">
      <label>
        <span className="sr-only">レポート期間</span>
        <select value={selectedWeek} onChange={(event) => onSelectWeek(event.target.value)}>
          {latestWeek && <option value={latestWeek}>Latest — {formatWeek(latestWeek)}</option>}
          {weeks.filter((week) => week !== latestWeek).map((week) => (
            <option key={week} value={week}>{formatWeek(week)}</option>
          ))}
          <option value={ALL_WEEKS}>All</option>
        </select>
      </label>
      <label>
        <span className="sr-only">自治体</span>
        <select
          value={selectedMunicipalityKey}
          onChange={(event) => {
            const option = municipalities.find((item) => item.key === event.target.value) ?? null;
            onSelectMunicipality(option);
          }}
        >
          <option value="">すべての自治体</option>
          {municipalities.map((option) => (
            <option key={option.key} value={option.key}>{option.prefecture} / {option.municipality}</option>
          ))}
        </select>
      </label>
    </div>
  );
}

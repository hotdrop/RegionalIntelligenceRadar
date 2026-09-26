import { useRef } from "react";
import { defaultFilters, type SignalFilters } from "@/lib/filterSignals";

type Props = {
  filters: SignalFilters;
  queryInput: string;
  onQueryInput: (value: string) => void;
  onChange: (filters: SignalFilters) => void;
};

export function SignalSearch({ filters, queryInput, onQueryInput, onChange }: Props) {
  const composing = useRef(false);
  const update = (patch: Partial<SignalFilters>) => onChange({ ...filters, ...patch });
  const clearQuery = () => { onQueryInput(""); update({ query: "" }); };
  const hasConditions = Boolean(queryInput || filters.prefecture);

  return (
    <div className="signal-search" role="search" aria-label="全期間のシグナル検索">
      <label className="search-label" htmlFor="signal-query">キーワード検索</label>
      <input id="signal-query" type="search" placeholder="例：マイナンバー 子育て" value={queryInput} aria-describedby="search-hint"
        onCompositionStart={() => { composing.current = true; }}
        onCompositionEnd={event => { composing.current = false; update({ query: event.currentTarget.value }); }}
        onChange={event => {
          onQueryInput(event.target.value);
          if (!composing.current) update({ query: event.target.value });
        }} />
      <p id="search-hint" className="search-hint">全週から検索 · 空白で区切ったすべての言葉に一致</p>
      {hasConditions && <div className="active-filters" aria-label="適用中の検索条件">
        {filters.query && <button type="button" onClick={clearQuery} aria-label="キーワードを解除">検索：{filters.query} ×</button>}
        {filters.prefecture && <button type="button" onClick={() => update({ prefecture: null })} aria-label="都道府県の条件を解除">{filters.prefecture} ×</button>}
        <button type="button" disabled={!hasConditions} onClick={() => { onQueryInput(""); onChange({ ...defaultFilters }); }}>すべての条件を解除</button>
      </div>}
    </div>
  );
}

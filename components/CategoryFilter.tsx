import { SIGNAL_CATEGORIES, type SignalCategory } from "@/types/signal";
import { categoryLabels } from "@/lib/presentationLabels";

type CategoryFilterProps = {
  selectedCategory: SignalCategory | null;
  hasFilters: boolean;
  onSelectCategory: (category: SignalCategory | null) => void;
  onClearAll: () => void;
};

export function CategoryFilter({ selectedCategory, hasFilters, onSelectCategory, onClearAll }: CategoryFilterProps) {
  return (
    <div className="filter-strip">
      <span className="filter-label">カテゴリ</span>
      <div className="filter-scroller">
        <button type="button" className={!selectedCategory ? "active" : ""} onClick={() => onSelectCategory(null)}>すべて</button>
        {SIGNAL_CATEGORIES.map((category) => (
          <button key={category} type="button" className={selectedCategory === category ? "active" : ""} onClick={() => onSelectCategory(selectedCategory === category ? null : category)}>{categoryLabels[category]}</button>
        ))}
      </div>
      <button type="button" className="filter-reset" onClick={onClearAll} disabled={!hasFilters}>すべて解除</button>
    </div>
  );
}

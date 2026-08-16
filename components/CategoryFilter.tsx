import { SIGNAL_CATEGORIES, type SignalCategory } from "@/types/signal";

type CategoryFilterProps = {
  selectedCategory: SignalCategory | null;
  onSelectCategory: (category: SignalCategory | null) => void;
};

export function CategoryFilter({ selectedCategory, onSelectCategory }: CategoryFilterProps) {
  return (
    <div className="filter-strip">
      <span className="filter-label">CATEGORY FILTER</span>
      <div className="filter-scroller">
        <button type="button" className={!selectedCategory ? "active" : ""} onClick={() => onSelectCategory(null)}>ALL</button>
        {SIGNAL_CATEGORIES.map((category) => (
          <button key={category} type="button" className={selectedCategory === category ? "active" : ""} onClick={() => onSelectCategory(selectedCategory === category ? null : category)}>{category}</button>
        ))}
      </div>
    </div>
  );
}

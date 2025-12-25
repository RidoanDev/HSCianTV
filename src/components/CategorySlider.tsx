import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { categories } from '@/data/videos';

interface CategorySliderProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategorySlider = ({ activeCategory, onCategoryChange }: CategorySliderProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative flex items-center gap-2 py-3 px-4 bg-background border-b border-border">
      <button
        onClick={() => scroll('left')}
        className="nav-button hidden sm:flex shrink-0"
        aria-label="Scroll left"
      >
        <ChevronLeft size={20} />
      </button>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto hide-scrollbar"
      >
        <button
          onClick={() => onCategoryChange('All')}
          className={`category-chip ${activeCategory === 'All' ? 'category-chip-active' : ''}`}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`category-chip ${activeCategory === category ? 'category-chip-active' : ''}`}
          >
            {category}
          </button>
        ))}
      </div>

      <button
        onClick={() => scroll('right')}
        className="nav-button hidden sm:flex shrink-0"
        aria-label="Scroll right"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default CategorySlider;

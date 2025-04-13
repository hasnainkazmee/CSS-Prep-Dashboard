// NavigationBar.tsx
import { Subject } from '../types';

interface NavigationBarProps {
  sortedCategories: string[];
  subjects: Subject[];
  onCategoryClick: (category: string) => void;
  onReset: () => void;
}

export default function NavigationBar({ sortedCategories, subjects, onCategoryClick, onReset }: NavigationBarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md shadow-sm z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <h1 className="text-xl font-semibold text-gray-900">CSS Exam Prep</h1>
          <div className="flex space-x-2 overflow-x-auto py-2">
            {sortedCategories.map((category) => (
              <button
                key={category}
                onClick={() => onCategoryClick(category)}
                className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {category}
              </button>
            ))}
            <button
              onClick={onReset}
              className="px-3 py-1 text-sm font-medium text-red-600 bg-red-50 rounded-full hover:bg-red-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
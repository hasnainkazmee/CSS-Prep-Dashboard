// SearchBox.tsx
interface SearchBoxProps {
    search: string;
    onSearchChange: (value: string) => void;
  }
  
  export default function SearchBox({ search, onSearchChange }: SearchBoxProps) {
    return (
      <div className="mb-8">
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search subjects, topics, or notes..."
          className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
        />
      </div>
    );
  }
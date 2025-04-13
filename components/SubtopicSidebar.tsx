import { Subtopic } from '../types';

interface SubtopicSidebarProps {
  subtopics: Subtopic[];
  currentSubtopicIndex: number;
  handleSubtopicChange: (index: number) => void;
}

export default function SubtopicSidebar({
  subtopics,
  currentSubtopicIndex,
  handleSubtopicChange,
}: SubtopicSidebarProps) {
  return (
    <div className="w-1/4 bg-gray-50 p-4 border-r border-gray-200 hidden md:block">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Subtopics</h2>
      <div className="space-y-2">
        {subtopics.map((subtopic, index) => (
          <button
            key={subtopic.id}
            onClick={() => handleSubtopicChange(index)}
            className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
              index === currentSubtopicIndex
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {subtopic.title}
          </button>
        ))}
      </div>
    </div>
  );
}
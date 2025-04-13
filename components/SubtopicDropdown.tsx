import { Subtopic } from '../types';

interface SubtopicDropdownProps {
  subtopics: Subtopic[];
  currentSubtopicIndex: number;
  handleSubtopicChange: (index: number) => void;
}

export default function SubtopicDropdown({
  subtopics,
  currentSubtopicIndex,
  handleSubtopicChange,
}: SubtopicDropdownProps) {
  return (
    <select
      value={currentSubtopicIndex}
      onChange={(e) => handleSubtopicChange(Number(e.target.value))}
      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {subtopics.map((subtopic, index) => (
        <option key={subtopic.id} value={index}>
          {subtopic.title}
        </option>
      ))}
    </select>
  );
}
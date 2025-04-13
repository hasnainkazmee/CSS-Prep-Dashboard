// CategorySection.tsx
import { useRef } from 'react';
import { Subject, Topic } from '../types';
import TopicCard from './TopicCard';

interface CategorySectionProps {
  category: string;
  topics: Topic[];
  subjects: Subject[];
  calculateTopicProgress: (subtopics: Topic['subtopics']) => number;
  toggleCategoryInput: (topicId: string) => void;
  categoryInputVisible: Record<string, boolean>;
  categoryInput: Record<string, string>;
  handleCategoryInputChange: (topicId: string, value: string) => void;
  assignCategory: (topicId: string) => void;
  updateNotes: (subjectId: string, topicId: string, subtopicId: string, newNotes: string) => void;
  updateProgress: (subjectId: string, topicId: string, subtopicId: string, newProgress: 'Not Started' | 'In Progress' | 'Completed') => void;
  updateTargetTime: (subjectId: string, topicId: string, subtopicId: string, newTargetTime: number) => void;
  expandedSubtopics: Record<string, Set<string>>;
  handleReadMore: (topicId: string, subtopicId: string) => void;
}

export default function CategorySection({
  category,
  topics,
  subjects,
  calculateTopicProgress,
  toggleCategoryInput,
  categoryInputVisible,
  categoryInput,
  handleCategoryInputChange,
  assignCategory,
  updateNotes,
  updateProgress,
  updateTargetTime,
  expandedSubtopics,
  handleReadMore,
}: CategorySectionProps) {
  const categoryRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={categoryRef} className="mb-12">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">{category}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {topics.map((topic) => (
          <TopicCard
            key={topic.id}
            topic={topic}
            subjects={subjects}
            calculateTopicProgress={calculateTopicProgress}
            toggleCategoryInput={toggleCategoryInput}
            categoryInputVisible={categoryInputVisible}
            categoryInput={categoryInput}
            handleCategoryInputChange={handleCategoryInputChange}
            assignCategory={assignCategory}
            updateNotes={updateNotes}
            updateProgress={updateProgress}
            updateTargetTime={updateTargetTime}
            expandedSubtopics={expandedSubtopics}
            handleReadMore={handleReadMore}
          />
        ))}
      </div>
    </div>
  );
}
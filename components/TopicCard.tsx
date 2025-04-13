// TopicCard.tsx
import { Subject, Topic } from '../types';

interface TopicCardProps {
  topic: Topic;
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

export default function TopicCard({
  topic,
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
}: TopicCardProps) {
  const progress = calculateTopicProgress(topic.subtopics);
  const isCategoryInputVisible = categoryInputVisible[topic.id] || false;
  const currentCategoryInput = categoryInput[topic.id] || '';

  const subject = subjects.find((s) => s.subject === topic.subject);
  const subjectId = subject ? subject.id : topic.subject;

  return (
    <div className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">{topic.title}</h3>
        <div className="w-1/3 bg-gray-100 rounded-full h-2">
          <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-4">{progress}% Complete</p>

      {topic.subtopics.map((subtopic) => {
        const isExpanded = expandedSubtopics[topic.id]?.has(subtopic.id);

        return (
          <div key={subtopic.id} className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <h4 className="text-md font-medium text-gray-900">{subtopic.title}</h4>
              <button
                onClick={() => handleReadMore(topic.id, subtopic.id)}
                className="text-blue-500 hover:underline focus:outline-none"
              >
                {isExpanded ? 'Read Less' : 'Read More'}
              </button>
            </div>

            {isExpanded && (
              <div className="mt-4">
                <textarea
                  value={subtopic.notes}
                  onChange={(e) => updateNotes(subjectId, topic.id, subtopic.id, e.target.value)}
                  placeholder="Add your notes here..."
                  className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
                <select
                  value={subtopic.progress}
                  onChange={(e) =>
                    updateProgress(
                      subjectId,
                      topic.id,
                      subtopic.id,
                      e.target.value as 'Not Started' | 'In Progress' | 'Completed'
                    )
                  }
                  className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
                <div className="flex items-center space-x-2 mt-2">
                  <input
                    type="number"
                    value={subtopic.targetTime}
                    onChange={(e) => updateTargetTime(subjectId, topic.id, subtopic.id, parseInt(e.target.value) || 0)}
                    placeholder="Set target time (minutes)"
                    className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-sm text-gray-500">Minutes remaining: {subtopic.remainingTime}</p>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <div className="mt-4">
        {isCategoryInputVisible ? (
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={currentCategoryInput}
              onChange={(e) => handleCategoryInputChange(topic.id, e.target.value)}
              placeholder="Enter category name"
              className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => assignCategory(topic.id)}
              className="px-3 py-1 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Assign
            </button>
            <button
              onClick={() => toggleCategoryInput(topic.id)}
              className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => toggleCategoryInput(topic.id)}
            className="text-blue-500 hover:underline focus:outline-none"
          >
            Assign to Category
          </button>
        )}
      </div>
    </div>
  );
}
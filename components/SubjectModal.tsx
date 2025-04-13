'use client';

import Modal from 'react-modal';
import { Subject, Topic } from '@/types';

interface SubjectModalProps {
  isOpen: boolean;
  subject: Subject | null;
  onClose: () => void;
  onTopicSelect: (topic: Topic, updateSubject: (updatedSubject: Subject) => void) => void;
  calculateTopicProgress: (subtopics: Topic['subtopics']) => number;
  updateSubject: (updatedSubject: Subject) => void;
}

export default function SubjectModal({
  isOpen,
  subject,
  onClose,
  onTopicSelect,
  calculateTopicProgress,
  updateSubject,
}: SubjectModalProps) {
  if (!subject) return null;

  // Calculate subject progress
  const calculateSubjectProgress = (subject: Subject): number => {
    const totalSubtopics = subject.topics.reduce((sum, topic) => sum + topic.subtopics.length, 0);
    const completedSubtopics = subject.topics.reduce(
      (sum, topic) =>
        sum + topic.subtopics.filter((sub) => sub.progress === 'Completed').length,
      0
    );
    return totalSubtopics > 0 ? (completedSubtopics / totalSubtopics) * 100 : 0;
  };

  const subjectProgress = calculateSubjectProgress(subject);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="bg-white rounded-2xl p-6 w-full max-w-4xl mx-auto my-8"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      ariaHideApp={false}
    >
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">{subject.subject}</h2>
            <span
              className={`mt-2 inline-block px-2 py-1 text-sm font-medium rounded-full ${
                subjectProgress === 100
                  ? 'bg-green-100 text-green-800'
                  : subjectProgress > 0
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {subjectProgress.toFixed(0)}% Complete
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subject.topics.map((topic) => (
            <div
              key={topic.id}
              className="bg-white rounded-xl p-4 hover:bg-gray-50 cursor-pointer transition-all duration-200"
              onClick={() => onTopicSelect(topic, updateSubject)}
            >
              <h3 className="text-lg font-medium text-gray-900 mb-2">{topic.title}</h3>
              <span
                className={`px-2 py-1 text-sm font-medium rounded-full ${
                  calculateTopicProgress(topic.subtopics) === 100
                    ? 'bg-green-100 text-green-800'
                    : calculateTopicProgress(topic.subtopics) > 0
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {calculateTopicProgress(topic.subtopics).toFixed(0)}% Complete
              </span>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
// PrioritySubjects.tsx
import { Subject } from '../types';

interface PrioritySubjectsProps {
  prioritySubjects: string[];
  subjects: Subject[];
  onSubjectSelect: (subject: Subject) => void;
  calculateTopicProgress: (subtopics: Subject['topics'][0]['subtopics']) => number;
}

export default function PrioritySubjects({ prioritySubjects, subjects, onSubjectSelect, calculateTopicProgress }: PrioritySubjectsProps) {
  return (
    <div className="mb-10">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Priority Subjects</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {prioritySubjects.map((subjectName) => {
          const subject = subjects.find((s) => s.subject === subjectName);
          if (!subject) return null;
          const progress = subject.topics.reduce((acc, topic) => acc + calculateTopicProgress(topic.subtopics), 0) / subject.topics.length || 0;

          return (
            <div
              key={subject.id}
              onClick={() => onSubjectSelect(subject)}
              className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
            >
              <h3 className="text-lg font-medium text-gray-900">{subject.subject}</h3>
              <div className="mt-2">
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-1">{Math.round(progress)}% Complete</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
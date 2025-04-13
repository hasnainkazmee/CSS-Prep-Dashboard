'use client';

import { useState } from 'react';
import Modal from 'react-modal';
import { Subject } from '@/types';

interface OnboardingModalProps {
  isOpen: boolean;
  allSubjects: Subject[];
  error: string | null;
  onComplete: (prioritySubjects: string[], completionMonths: number) => void;
}

export default function OnboardingModal({ isOpen, allSubjects, error, onComplete }: OnboardingModalProps) {
  const compulsorySubjects = [
    'English Essay',
    'English (Precis & Composition)',
    'Pakistan Affairs',
    'Current Affairs',
    'Islamic Studies',
    'General Science & Ability',
  ];

  const [prioritySubjects, setPrioritySubjects] = useState<string[]>([]);
  const [completionMonths, setCompletionMonths] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handlePriorityToggle = (subject: string) => {
    setPrioritySubjects((prev) => {
      if (prev.includes(subject)) {
        return prev.filter((s) => s !== subject);
      }
      if (prev.length < 3) {
        return [...prev, subject];
      }
      return prev;
    });
  };

  const handleSubmit = () => {
    if (prioritySubjects.length !== 3) {
      setLocalError('Please select exactly 3 priority subjects.');
      return;
    }
    const months = parseInt(completionMonths);
    if (!months || months < 1 || months > 12) {
      setLocalError('Please enter a valid duration (1–12 months).');
      return;
    }
    setLocalError(null);
    onComplete(prioritySubjects, months);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => {}}
      className="bg-white rounded-2xl p-6 w-full max-w-lg mx-auto my-8"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      ariaHideApp={false}
    >
      <div className="flex flex-col space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Welcome to Focused Study By Kazmee</h2>
        <p className="text-gray-600">
          All CSS compulsory subjects are included. Please select <strong>3 priority subjects</strong> and your desired completion duration.
        </p>

        {error || localError ? (
          <div className="text-red-600 text-sm">{error || localError}</div>
        ) : null}

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Priority Subjects (Select 3)</h3>
          <div className="grid grid-cols-1 gap-2">
            {compulsorySubjects.map((subject) => (
              <button
                key={subject}
                onClick={() => handlePriorityToggle(subject)}
                disabled={prioritySubjects.length >= 3 && !prioritySubjects.includes(subject)}
                className={`w-full px-4 py-2 text-left rounded-lg border transition-colors duration-200 ${
                  prioritySubjects.includes(subject)
                    ? 'bg-blue-100 border-blue-500 text-blue-900'
                    : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                } ${prioritySubjects.length >= 3 && !prioritySubjects.includes(subject) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Completion Duration (Months)</h3>
          <input
            type="number"
            min="1"
            max="12"
            value={completionMonths}
            onChange={(e) => setCompletionMonths(e.target.value)}
            placeholder="e.g., 6"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        <button
          onClick={handleSubmit}
          className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Start Studying
        </button>
      </div>
    </Modal>
  );
}
'use client';

import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import SubtopicSidebar from './SubtopicSidebar';
import SubtopicDropdown from './SubtopicDropdown';
import NoteEditor from './NoteEditor';
import useEditorLogic from '../hooks/useEditorLogic';
import { Subject, Topic } from '../types';

interface NoteTakingModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: Subject | null;
  topic: Topic | null;
  updateNotes: (subjectId: string, topicId: string, subtopicId: string, newNotes: string) => Promise<void>;
  updateProgress: (subjectId: string, topicId: string, subtopicId: string, newProgress: 'Pending' | 'Completed') => Promise<void>;
  updateTargetTime: (subjectId: string, topicId: string, subtopicId: string, newTargetTime: number) => Promise<void>;
}

export default function NoteTakingModal({
  isOpen,
  onClose,
  subject,
  topic,
  updateNotes,
  updateProgress,
  updateTargetTime,
}: NoteTakingModalProps) {
  const [currentSubtopicIndex, setCurrentSubtopicIndex] = useState(0);

  const subtopicsArray = topic && subject
    ? topic.subtopics
      ? Object.values(topic.subtopics).sort((a, b) => a.id.localeCompare(b.id))
      : []
    : [];

  const editorState = useEditorLogic({
    subjectId: subject?.id ?? '',
    topicId: topic?.id ?? '',
    subtopics: subtopicsArray,
    currentSubtopicIndex,
  });

  useEffect(() => {
    if (!topic || !subject) {
      if (typeof onClose === 'function') {
        onClose();
      } else {
        console.error('onClose is not a function:', onClose);
      }
    }
  }, [topic, subject, onClose]);

  // Cleanup on unmount to mitigate React-Modal warning
  useEffect(() => {
    return () => {
      Modal.setAppElement('body');
    };
  }, []);

  useEffect(() => {
    if (topic) {
      setCurrentSubtopicIndex(0);
    }
  }, [topic]);

  if (!topic || !subject) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="fixed inset-0 bg-white w-[1920px] max-w-full h-screen mx-auto shadow-xl overflow-hidden z-[9999]"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-[9999]"
      shouldCloseOnOverlayClick={true} // Allow closing by clicking overlay
      ariaHideApp={false}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{topic.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar for Subtopics (visible on medium screens and up) */}
          <SubtopicSidebar
            subtopics={subtopicsArray}
            currentSubtopicIndex={currentSubtopicIndex}
            handleSubtopicChange={setCurrentSubtopicIndex}
          />

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Subtopic Dropdown (visible on small screens) */}
            <div className="p-4 md:hidden">
              <SubtopicDropdown
                subtopics={subtopicsArray}
                currentSubtopicIndex={currentSubtopicIndex}
                handleSubtopicChange={setCurrentSubtopicIndex}
              />
            </div>

            {/* Subtopic Heading */}
            {subtopicsArray.length > 0 && (
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-800">
                  {subtopicsArray[currentSubtopicIndex].title}
                </h3>
              </div>
            )}

            {/* Note Editor */}
            {subtopicsArray.length > 0 ? (
              <NoteEditor
                subject={subject}
                topic={topic}
                subtopics={subtopicsArray}
                currentSubtopicIndex={currentSubtopicIndex}
                updateNotes={updateNotes}
                updateProgress={updateProgress}
                updateTargetTime={updateTargetTime}
              />
            ) : (
              <div className="p-4 text-gray-500">No subtopics available.</div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
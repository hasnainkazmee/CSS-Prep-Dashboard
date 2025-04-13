'use client';

import Modal from 'react-modal';
import { useMemo } from 'react';
import SubtopicSidebar from './SubtopicSidebar';
import SubtopicDropdown from './SubtopicDropdown';
import NoteEditor from './NoteEditor';
import { NoteTakingModalProps, Subtopic } from '../types/noteTaking';
import useSubtopicLogic from '../hooks/useSubtopicLogic';
import useEditorLogic from '../hooks/useEditorLogic';

const DEFAULT_SUBTOPIC: Subtopic = {
  id: 'default',
  title: 'Notes',
  notes: '',
  progress: 'Pending',
  targetTime: 0,
  remainingTime: 0,
  priority: false,
  toStudy: false,
};

export default function NoteTakingModal({
  isOpen,
  subject,
  topic,
  onClose,
  updateNotes,
  updateProgress,
  updateTargetTime,
}: NoteTakingModalProps) {
  const effectiveTopic = useMemo(() => {
    if (!topic || !topic.id || !topic.title) {
      return { id: 'default', title: 'Untitled', subtopics: [DEFAULT_SUBTOPIC] };
    }
    return topic;
  }, [topic]);

  const subtopics = useMemo(() => {
    if (!effectiveTopic.subtopics || effectiveTopic.subtopics.length === 0) {
      return [DEFAULT_SUBTOPIC];
    }
    return effectiveTopic.subtopics;
  }, [effectiveTopic]);

  const { currentSubtopicIndex, handleSubtopicChange, handleModalClose } = useSubtopicLogic({
    subtopics,
    onClose,
    updateNotes,
    subject,
    effectiveTopic,
  });

  const editorState = useEditorLogic({
    subtopics,
    currentSubtopicIndex,
    updateNotes,
    updateProgress,
    subject,
    effectiveTopic,
  });

  if (!subtopics.length) {
    return (
      <Modal
        isOpen={isOpen}
        onRequestClose={handleModalClose}
        className="fixed inset-4 bg-white rounded-2xl shadow-xl max-w-7xl mx-auto z-50"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-40"
        ariaHideApp={false}
      >
        <div className="flex w-full p-6" style={{ direction: 'ltr', textAlign: 'left' }}>
          <div className="flex-1 text-center text-gray-700">
            <h3 className="text-lg font-semibold mb-4">No Subtopics Available</h3>
            <p>Please select a topic with subtopics to take notes.</p>
            <button
              onClick={handleModalClose}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleModalClose}
      className="fixed inset-4 bg-white rounded-2xl shadow-xl max-w-7xl mx-auto z-50"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-40"
      ariaHideApp={false}
    >
      <div className="flex w-full h-full" style={{ direction: 'ltr', textAlign: 'left' }}>
        <SubtopicSidebar
          subtopics={subtopics}
          currentSubtopicIndex={currentSubtopicIndex}
          localProgress={editorState.localProgress}
          handleSubtopicChange={handleSubtopicChange}
          effectiveTopic={effectiveTopic}
        />
        <SubtopicDropdown
          subtopics={subtopics}
          currentSubtopicIndex={currentSubtopicIndex}
          localProgress={editorState.localProgress}
          handleSubtopicChange={handleSubtopicChange}
        />
        <NoteEditor
          subtopics={subtopics}
          currentSubtopicIndex={currentSubtopicIndex}
          editorState={editorState}
          handleModalClose={handleModalClose}
        />
      </div>
    </Modal>
  );
}
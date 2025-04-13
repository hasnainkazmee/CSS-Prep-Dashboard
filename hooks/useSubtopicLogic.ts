import { useState, useCallback, useEffect } from 'react'; // Added useEffect
import { Subtopic } from '../types/noteTaking';

interface UseSubtopicLogicProps {
  subtopics: Subtopic[];
  onClose: () => void;
  updateNotes: (subjectId: string, topicId: string, subtopicId: string, newNotes: string) => void;
  subject: Subject | null;
  effectiveTopic: { id: string; title: string; subtopics: Subtopic[] };
}

export default function useSubtopicLogic({
  subtopics,
  onClose,
  updateNotes,
  subject,
  effectiveTopic,
}: UseSubtopicLogicProps) {
  const [currentSubtopicIndex, setCurrentSubtopicIndex] = useState(0);
  const [localNotes, setLocalNotes] = useState<Record<string, string>>({});
  const [savedNotes, setSavedNotes] = useState<Record<string, string>>({});

  const handleSaveNotes = useCallback(
    (subtopicId: string, content: string) => {
      updateNotes(subject?.id || 'default', effectiveTopic.id, subtopicId, content);
      setSavedNotes((prev) => ({ ...prev, [subtopicId]: content }));
    },
    [subject?.id, effectiveTopic.id, updateNotes]
  );

  const handleSubtopicChange = useCallback(
    (index: number) => {
      const currentSubtopicId = subtopics[currentSubtopicIndex]?.id;
      if (currentSubtopicId && localNotes[currentSubtopicId] !== savedNotes[currentSubtopicId]) {
        const shouldSave = window.confirm(
          'You have unsaved notes. Do you want to save them before switching?'
        );
        if (shouldSave) {
          handleSaveNotes(currentSubtopicId, localNotes[currentSubtopicId]);
        }
      }
      setCurrentSubtopicIndex(index);
    },
    [subtopics, currentSubtopicIndex, localNotes, savedNotes, handleSaveNotes]
  );

  const handleModalClose = useCallback(() => {
    const currentSubtopicId = subtopics[currentSubtopicIndex]?.id;
    if (currentSubtopicId && localNotes[currentSubtopicId] !== savedNotes[currentSubtopicId]) {
      const shouldSave = window.confirm('You have unsaved notes. Do you want to save them before closing?');
      if (shouldSave) {
        handleSaveNotes(currentSubtopicId, localNotes[currentSubtopicId]);
      }
    }
    onClose();
  }, [subtopics, currentSubtopicIndex, localNotes, savedNotes, handleSaveNotes, onClose]);

  useEffect(() => {
    setLocalNotes(
      Object.fromEntries(subtopics.map((subtopic) => [subtopic.id, subtopic.notes || '']))
    );
    setSavedNotes(
      Object.fromEntries(subtopics.map((subtopic) => [subtopic.id, subtopic.notes || '']))
    );
  }, [subtopics]);

  return {
    currentSubtopicIndex,
    setCurrentSubtopicIndex,
    handleSubtopicChange,
    handleModalClose,
    localNotes,
    setLocalNotes,
    savedNotes,
  };
}
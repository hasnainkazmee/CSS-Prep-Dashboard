import { useEffect, useRef, useState } from 'react';
import { Subtopic } from '../types';

interface EditorState {
  wordCount: number;
  handleInput: (text: string) => void;
  handleSave: () => Promise<void>;
  handleToggleProgress: () => void;
}

interface UseEditorLogicProps {
  subjectId: string;
  topicId: string;
  subtopics: Subtopic[];
  currentSubtopicIndex: number;
}

export default function useEditorLogic({
  subjectId,
  topicId,
  subtopics,
  currentSubtopicIndex,
}: UseEditorLogicProps): EditorState {
  const [wordCount, setWordCount] = useState(0);
  const [progress, setProgress] = useState(subtopics[currentSubtopicIndex]?.progress || 'Pending');
  const localNotesRef = useRef<string[]>(subtopics.map((subtopic) => subtopic.notes || ''));
  const localProgressRef = useRef<(Subtopic['progress'])[]>(subtopics.map((subtopic) => subtopic.progress));

  useEffect(() => {
    setProgress(subtopics[currentSubtopicIndex]?.progress || 'Pending');
    const rawText = subtopics[currentSubtopicIndex]?.notes || '';
    setWordCount(rawText.split(/\s+/).filter(Boolean).length);
  }, [currentSubtopicIndex, subtopics]);

  const handleInput = (text: string) => {
    localNotesRef.current[currentSubtopicIndex] = text;
    setWordCount(text.split(/\s+/).filter(Boolean).length);
  };

  const handleSave = async () => {
    if (!subtopics[currentSubtopicIndex]) return;
    await fetch('/api/subjects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subjectId,
        topicId,
        subtopicId: subtopics[currentSubtopicIndex].id,
        notes: localNotesRef.current[currentSubtopicIndex],
        progress: localProgressRef.current[currentSubtopicIndex],
      }),
    });
  };

  const handleToggleProgress = () => {
    const newProgress = progress === 'Completed' ? 'Pending' : 'Completed';
    localProgressRef.current[currentSubtopicIndex] = newProgress;
    setProgress(newProgress);
  };

  return {
    wordCount,
    handleInput,
    handleSave,
    handleToggleProgress,
  };
}
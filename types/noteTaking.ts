export interface Subtopic {
  id: string;
  title: string;
  notes?: string;
  progress?: 'Pending' | 'Completed';
  targetTime?: number;
  remainingTime?: number;
  priority?: boolean;
  toStudy?: boolean;
}

export interface Topic {
  id: string;
  title: string;
  subtopics: Subtopic[];
}

export interface Subject {
  id: string;
  title: string;
  topics: Topic[];
}

export interface EditorState {
  localNotes: Record<string, string>;
  savedNotes: Record<string, string>;
  localProgress: Record<string, 'Pending' | 'Completed'>;
  wordCount: Record<string, number>;
  isSaved: boolean;
}

export interface NoteTakingModalProps {
  isOpen: boolean;
  subject: Subject | null;
  topic: Topic | null;
  onClose: () => void;
  updateNotes: (subjectId: string, topicId: string, subtopicId: string, newNotes: string) => void;
  updateProgress: (
    subjectId: string,
    topicId: string,
    subtopicId: string,
    newProgress: 'Pending' | 'Completed'
  ) => void;
  updateTargetTime: (
    subjectId: string,
    topicId: string,
    subtopicId: string,
    newTargetTime: number
  ) => void;
}
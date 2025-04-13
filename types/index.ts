export interface Subtopic {
  id: string;
  title: string;
  notes: string;
  progress: 'Not Started' | 'In Progress' | 'Completed';
  targetTime: number;
  remainingTime: number;
}

export interface Topic {
  id: string;
  title: string;
  subtopics: Subtopic[];
}

export interface Subject {
  id: string;
  subject: string;
  marks: number;
  code: string;
  topics: Topic[];
}
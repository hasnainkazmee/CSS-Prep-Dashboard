'use client';

import { useEffect, useRef, useState } from 'react';
import { Subtopic, Subject, Topic } from '../types';

interface NoteEditorProps {
  subject: Subject;
  topic: Topic;
  subtopics: Subtopic[];
  currentSubtopicIndex: number;
  updateNotes: (subjectId: string, topicId: string, subtopicId: string, newNotes: string) => Promise<void>;
  updateProgress: (subjectId: string, topicId: string, subtopicId: string, newProgress: 'Pending' | 'Completed') => Promise<void>;
  updateTargetTime: (subjectId: string, topicId: string, subtopicId: string, newTargetTime: number) => Promise<void>;
}

const INDENT_STYLE = 'padding-left: 1.5rem;';


export default function NoteEditor({
  subject,
  topic,
  subtopics,
  currentSubtopicIndex,
  updateNotes,
  updateProgress,
}: NoteEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const rawContentRef = useRef<string>('');
  const [wordCount, setWordCount] = useState(0);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [isCompleted, setIsCompleted] = useState(
    subtopics[currentSubtopicIndex]?.progress === 'Completed' || false
  );

  // Handle empty or invalid subtopics
  if (!subtopics || subtopics.length === 0 || currentSubtopicIndex < 0 || currentSubtopicIndex >= subtopics.length) {
    return <div className="p-4 text-gray-500">No subtopics available.</div>;
  }

  // Helper to convert HTML to plain text
  const htmlToText = (html: string): string => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent?.replace(/\s+/g, ' ').trim() || '';
  };

  // Helper to convert plain text to HTML (preserving line breaks)
  const textToHtml = (text: string): string => {
    return text
      .split('\n')
      .map((line) => `<div>${line || '<br>'}</div>`)
      .join('');
  };

  // Calculate word count
  const calculateWordCount = (text: string): number => {
    if (!text) return 0;
    const words = text.trim().split(/\s+/).filter((word) => word.length > 0);
    return words.length;
  };

  const placeCaretAtEnd = (el: HTMLElement) => {
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(el);
    range.collapse(false);
    sel?.removeAllRanges();
    sel?.addRange(range);
  };
  
  const insertNewLineWithPrefix = (prefix: string, style: string = '') => {
    const newBlock = document.createElement('div');
    newBlock.innerHTML = prefix || '<br>';
    newBlock.setAttribute('style', style); // Always apply fresh style
    newBlock.className = ''; // Clear inherited classes
    const range = window.getSelection()?.getRangeAt(0);
    if (range) {
      range.deleteContents();
      range.insertNode(newBlock);
      placeCaretAtEnd(newBlock);
    }
  };
  
  
  

  // Handle editor input
  const handleEditorInput = () => {
    if (!editorRef.current) return;
    const rawHtml = editorRef.current.innerHTML;
    const rawText = htmlToText(rawHtml);
    rawContentRef.current = rawText;
    setWordCount(calculateWordCount(rawText));
  };

  // Handle key presses for shortcuts and list formatting
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
  
    const range = sel.getRangeAt(0);
    const node = range.startContainer;
    const block = node.nodeType === 3 ? node.parentElement : node as HTMLElement;
    const text = block?.textContent || '';
  
    // === Font Size Increase: Ctrl + Alt + ArrowUp ===
    if (e.ctrlKey && e.altKey && e.key === 'ArrowUp') {
      e.preventDefault();
      if (block instanceof HTMLElement) {
        const current = block.style.fontSize || '1rem';
        let newSize = '1.25rem';
        if (current === '1.25rem') newSize = '1.5rem';
        else if (current === '1.5rem') newSize = '1rem';
        block.style.fontSize = newSize;
      }
    }
  
    // === Font Size Decrease: Ctrl + Alt + ArrowDown ===
    if (e.ctrlKey && e.altKey && e.key === 'ArrowDown') {
      e.preventDefault();
      if (block instanceof HTMLElement) {
        const current = block.style.fontSize || '1.5rem';
        let newSize = '1.25rem';
        if (current === '1.25rem') newSize = '1rem';
        else if (current === '1rem') newSize = '1.5rem';
        block.style.fontSize = newSize;
      }
    }
  
    // === Auto Bullet Conversion ===
    if (e.key === ' ' && /^[-•]$/.test(text.trim())) {
      e.preventDefault();
      block.textContent = '• ';
      block.setAttribute('style', INDENT_STYLE);
      if (block) {
        if (block) {
          placeCaretAtEnd(block);
        }
      }
    }
  
    // === Auto Numbered Conversion ===
    if (e.key === ' ' && /^1\.$/.test(text.trim())) {
      e.preventDefault();
      block.textContent = '1) ';
      block.setAttribute('style', INDENT_STYLE);
      placeCaretAtEnd(block);
    }
  
    // === Continue bullet or number on Enter ===
    if (e.key === 'Enter') {
      if (block?.textContent?.startsWith('• ')) {
        e.preventDefault();
        insertNewLineWithPrefix('• ', INDENT_STYLE);
      } else if (/^(\d+)\)\s/.test(text)) {
        e.preventDefault();
        const match = text.match(/^(\d+)\)/);
        if (match) {
          const nextNum = parseInt(match[1]) + 1;
          insertNewLineWithPrefix(`${nextNum}) `, INDENT_STYLE);
        }
      }
    }
  };
  
  

  // Save notes with feedback
  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      const subtopicId = subtopics[currentSubtopicIndex].id;
      await updateNotes(subject.id, topic.id, subtopicId, rawContentRef.current);
      setSaveStatus('success');
    } catch (error) {
      console.error('Failed to save notes:', error);
      setSaveStatus('error');
    }
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  // Toggle completion status
  const handleToggleComplete = async () => {
    const subtopicId = subtopics[currentSubtopicIndex].id;
    const newProgress = isCompleted ? 'Pending' : 'Completed';
    setIsCompleted(!isCompleted);
    await updateProgress(subject.id, topic.id, subtopicId, newProgress);
  };

  // Initialize editor content
  useEffect(() => {
    if (!editorRef.current) return;
    const rawText = subtopics[currentSubtopicIndex].notes || '';
    rawContentRef.current = rawText;
    editorRef.current.innerHTML = rawText ? textToHtml(rawText) : '';
    setWordCount(calculateWordCount(rawText));
  }, [currentSubtopicIndex, subtopics]);

  // Update isCompleted only when currentSubtopicIndex changes
  useEffect(() => {
    setIsCompleted(subtopics[currentSubtopicIndex].progress === 'Completed');
  }, [currentSubtopicIndex]);

  return (
    <div className="flex-1 flex flex-col p-4">
      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleEditorInput}
        onKeyDown={handleKeyDown}
        className="flex-1 w-full p-4 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[200px] max-h-[calc(90vh-300px)] overflow-y-auto"
        role="textbox"
        aria-label="Note editor"
      />

      {/* Editor Footer */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        {/* Word Count */}
        <div className="text-sm text-gray-600">Word Count: {wordCount}</div>

        {/* Save and Toggle */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              aria-label="Save notes"
            >
              {saveStatus === 'saving' ? 'Saving...' : 'Save'}
            </button>
            {saveStatus === 'success' && <span className="text-green-500 text-sm">Saved!</span>}
            {saveStatus === 'error' && <span className="text-red-500 text-sm">Save failed!</span>}
          </div>
          <button
            onClick={handleToggleComplete}
            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
              isCompleted
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-300 text-gray-800 hover:bg-gray-400'
            }`}
            aria-label={isCompleted ? 'Mark as not completed' : 'Mark as completed'}
          >
            Completed
          </button>
        </div>
      </div>
    </div>
  );
}
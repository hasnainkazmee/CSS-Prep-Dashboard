import { useRef, useEffect, useState } from 'react';
import { Subtopic, EditorState } from '../types/noteTaking';

interface NoteEditorProps {
  subtopics: Subtopic[];
  currentSubtopicIndex: number;
  editorState: {
    localNotes: Record<string, string>;
    localProgress: Record<string, 'Pending' | 'Completed'>;
    wordCount: Record<string, number>;
    isSaved: boolean;
    handleInput: (content: string) => void;
    handleProgressChange: () => void;
    isProgressDisabled: () => boolean;
  };
  handleModalClose: () => void;
}

export default function NoteEditor({
  subtopics,
  currentSubtopicIndex,
  editorState,
  handleModalClose,
}: NoteEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const rawContentRef = useRef<string>('');
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);

  // Save cursor position
  const saveCursorPosition = () => {
    const selection = window.getSelection();
    if (!selection || !editorRef.current || !selection.rangeCount) return null;

    const range = selection.getRangeAt(0);
    const preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(editorRef.current);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    return preSelectionRange.toString().length;
  };

  // Restore cursor position
  const restoreCursorPosition = (position: number | null) => {
    if (position === null || !editorRef.current) return;

    const selection = window.getSelection();
    if (!selection) return;

    let charIndex = 0;
    const range = document.createRange();
    range.setStart(editorRef.current, 0);
    range.collapse(true);

    const nodeStack: Node[] = [editorRef.current];
    let found = false;

    while (nodeStack.length && !found) {
      const node = nodeStack.pop()!;
      if (node.nodeType === Node.TEXT_NODE) {
        const textLength = node.textContent?.length || 0;
        if (charIndex + textLength >= position) {
          range.setStart(node, position - charIndex);
          found = true;
        }
        charIndex += textLength;
      } else {
        for (let i = node.childNodes.length - 1; i >= 0; i--) {
          nodeStack.push(node.childNodes[i]);
        }
      }
    }

    if (!found) {
      range.setStart(editorRef.current, editorRef.current.childNodes.length);
    }

    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  };

  // Convert HTML to plain text (for state)
  const htmlToText = (html: string) => {
    if (html.includes('Start typing')) return '';
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/div><div>/gi, '\n')
      .replace(/<\/p><p>/gi, '\n')
      .replace(/<(div|p)[^>]*>/gi, '')
      .replace(/<\/(div|p)>/gi, '')
      .replace(/ /g, ' ') // Replace non-breaking spaces with regular spaces
      .replace(/<[^>]+>/g, '')
      .trim();
  };

  // Convert plain text to HTML (for rendering in editor)
  const textToHtml = (text: string) => {
    if (!text) return '<p style="color: #6B7280;">Start typing...</p>';
    return text
      .split('\n')
      .map((line) => (line.trim() ? `<div>${line}</div>` : '<br>'))
      .join('');
  };

  // Initialize editor content
  useEffect(() => {
    if (!editorRef.current || !subtopics[currentSubtopicIndex]) return;

    const cursor = saveCursorPosition();
    const subtopicId = subtopics[currentSubtopicIndex].id;
    rawContentRef.current = editorState.localNotes[subtopicId] || '';
    editorRef.current.innerHTML = textToHtml(rawContentRef.current);
    setCursorPosition(cursor);
  }, [editorState.localNotes, currentSubtopicIndex, subtopics]);

  // Restore cursor position after render
  useEffect(() => {
    restoreCursorPosition(cursorPosition);
  }, [cursorPosition, editorState.localNotes, currentSubtopicIndex, subtopics]);

  const handleEditorInput = () => {
    if (!editorRef.current) return;

    const cursor = saveCursorPosition();
    const rawHtml = editorRef.current.innerHTML;
    const rawText = htmlToText(rawHtml);
    rawContentRef.current = rawText;
    editorState.handleInput(rawText);

    editorRef.current.style.direction = 'ltr';
    editorRef.current.style.textAlign = 'left';
    setCursorPosition(cursor);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (editorRef.current) {
      editorRef.current.style.direction = 'ltr';
      editorRef.current.style.textAlign = 'left';

      if (e.key === 'Enter') {
        e.preventDefault();
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          range.deleteContents();
          const br = document.createElement('br');
          range.insertNode(br);
          range.setStartAfter(br);
          range.setEndAfter(br);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      } else if (e.key === ' ') {
        // Prevent non-breaking spaces by manually inserting a regular space
        e.preventDefault();
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          range.deleteContents();
          const space = document.createTextNode(' ');
          range.insertNode(space);
          range.setStartAfter(space);
          range.setEndAfter(space);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    }
  };

  return (
    <div className="flex-1 p-10 bg-gray-50 overflow-auto">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-semibold text-gray-900">
          {subtopics[currentSubtopicIndex]?.title || 'Notes'}
        </h3>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleModalClose}
            className="text-gray-500 hover:text-gray-700 transition-all duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
      <div className="mb-8 flex items-center space-x-4">
        <button
          onClick={editorState.handleProgressChange}
          disabled={editorState.isProgressDisabled()}
          className={`px-6 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
            editorState.localProgress[subtopics[currentSubtopicIndex]?.id] === 'Completed'
              ? 'bg-green-600 text-white hover:bg-green-700'
              : editorState.isProgressDisabled()
              ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          }`}
        >
          {editorState.localProgress[subtopics[currentSubtopicIndex]?.id] === 'Completed'
            ? 'Mark as Pending'
            : 'Mark as Completed'}
        </button>
        <div
          className={`px-4 py-1 text-sm font-medium rounded-lg transition-all duration-200 ${
            editorState.isSaved ? 'bg-green-600 text-white' : 'bg-yellow-500 text-white'
          } animate-pulse`}
        >
          {editorState.isSaved ? 'Saved' : 'Unsaved'}
        </div>
      </div>
      <div
        ref={editorRef}
        contentEditable={true}
        onInput={handleEditorInput}
        onKeyDown={handleKeyDown}
        className="w-full min-h-[700px] p-8 bg-gray-100 rounded-xl border border-gray-200 shadow-sm text-gray-900 text-lg leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 cursor-text"
        style={{ direction: 'ltr', textAlign: 'left', unicodeBidi: 'embed' }}
        dir="ltr"
      />
      <div className="mt-6 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Words: {editorState.wordCount[subtopics[currentSubtopicIndex]?.id] || 0}
        </div>
      </div>
    </div>
  );
}
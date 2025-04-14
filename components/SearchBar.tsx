'use client';

import { useState, useEffect } from 'react';
import { Subject, Topic, Subtopic } from '../types';

interface SearchBarProps {
  subjects: Subject[];
  onSubjectSelect: (subject: Subject) => void;
  onTopicSelect: (subject: Subject, topic: Topic) => void;
}

interface SearchResult {
  type: 'subject' | 'topic' | 'subtopic';
  subject: Subject;
  topic?: Topic;
  subtopic?: Subtopic;
}

export default function SearchBar({ subjects, onSubjectSelect, onTopicSelect }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    subjects: SearchResult[];
    topics: SearchResult[];
    subtopics: SearchResult[];
  }>({ subjects: [], topics: [], subtopics: [] });
  const [isFocused, setIsFocused] = useState(false);

  // Debounce the search to improve performance
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (!query.trim()) {
        setResults({ subjects: [], topics: [], subtopics: [] });
        return;
      }

      const lowerQuery = query.trim().toLowerCase();
      const newResults: SearchResult[] = [];

      subjects.forEach((subject) => {
        // Handle edge case: missing subject title
        if (!subject.subject) return;

        // Search for subjects
        if (subject.subject.toLowerCase().includes(lowerQuery)) {
          newResults.push({ type: 'subject', subject });
        }

        // Search for topics and subtopics
        subject.topics.forEach((topic) => {
          // Handle edge case: missing topic title
          if (!topic.title) return;

          if (topic.title.toLowerCase().includes(lowerQuery)) {
            newResults.push({ type: 'topic', subject, topic });
          }

          topic.subtopics.forEach((subtopic) => {
            // Handle edge case: missing subtopic title or id
            if (!subtopic.title || !subtopic.id) return;

            // Search by both title and id
            const matchesTitle = subtopic.title.toLowerCase().includes(lowerQuery);
            const matchesId = subtopic.id.toLowerCase().includes(lowerQuery);
            if (matchesTitle || matchesId) {
              newResults.push({ type: 'subtopic', subject, topic, subtopic });
            }
          });
        });
      });

      // Group results by type with a limit per category
      const groupedResults = {
        subjects: newResults.filter((r) => r.type === 'subject').slice(0, 5),
        topics: newResults.filter((r) => r.type === 'topic').slice(0, 5),
        subtopics: newResults.filter((r) => r.type === 'subtopic').slice(0, 10),
      };

      setResults(groupedResults);
    }, 300); // 300ms debounce delay

    return () => clearTimeout(debounceTimeout);
  }, [query, subjects]);

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'subject') {
      onSubjectSelect(result.subject);
    } else if (result.type === 'topic' || result.type === 'subtopic') {
      onTopicSelect(result.subject, result.topic!);
    }
    setQuery('');
    setResults({ subjects: [], topics: [], subtopics: [] });
    setIsFocused(false);
  };

  const hasResults =
    results.subjects.length > 0 || results.topics.length > 0 || results.subtopics.length > 0;

  return (
    <div className="relative w-full max-w-md">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        placeholder="Search subjects, topics, or subtopics..."
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
      />
      {isFocused && hasResults && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
          {/* Subjects Section */}
          {results.subjects.length > 0 && (
            <div className="border-b border-gray-200">
              <p className="px-4 py-2 text-sm font-semibold text-gray-700">Subjects</p>
              {results.subjects.map((result, index) => (
                <div
                  key={`subject-${result.subject.id}-${index}`}
                  onMouseDown={() => handleResultClick(result)}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  <p className="text-sm font-medium text-gray-900">{result.subject.subject}</p>
                  <p className="text-xs text-gray-500 capitalize">{result.type}</p>
                </div>
              ))}
            </div>
          )}

          {/* Topics Section */}
          {results.topics.length > 0 && (
            <div className="border-b border-gray-200">
              <p className="px-4 py-2 text-sm font-semibold text-gray-700">Topics</p>
              {results.topics.map((result, index) => (
                <div
                  key={`topic-${result.subject.id}-${result.topic?.id}-${index}`}
                  onMouseDown={() => handleResultClick(result)}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  <p className="text-sm font-medium text-gray-900">
                    {result.subject.subject} &gt; {result.topic?.title}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{result.type}</p>
                </div>
              ))}
            </div>
          )}

          {/* Subtopics Section */}
          {results.subtopics.length > 0 && (
            <div>
              <p className="px-4 py-2 text-sm font-semibold text-gray-700">Subtopics</p>
              {results.subtopics.map((result, index) => (
                <div
                  key={`subtopic-${result.subject.id}-${result.topic?.id}-${result.subtopic?.id}-${index}`}
                  onMouseDown={() => handleResultClick(result)}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  <p className="text-sm font-medium text-gray-900">
                    {result.subject.subject} &gt; {result.topic?.title} &gt; {result.subtopic?.title} (ID: {result.subtopic?.id})
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{result.type}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
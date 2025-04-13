"use client";

import { useState, useEffect, useCallback } from 'react';
import Modal from 'react-modal';
import OnboardingModal from '@/components/OnboardingModal';
import SubjectModal from '@/components/SubjectModal';
import NoteTakingModal from '@/components/NoteTakingModal';
import { Subject, Topic } from '@/types';

export default function Home() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [prioritySubjects, setPrioritySubjects] = useState<string[]>([]);
  const [completionMonths, setCompletionMonths] = useState<number>(0);
  const [isOnboarding, setIsOnboarding] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);

  // Mapping for legacy subject names in localStorage
  const subjectNameMapping: { [key: string]: string } = {
    'Essay': 'English Essay',
    'Precis & Composition': 'English (Precis & Composition)',
    'Pakistan Affairs': 'Pakistan Affairs',
    'Current Affairs': 'Current Affairs',
    'Islamic Studies': 'Islamic Studies',
    'General Science & Ability': 'General Science & Ability',
  };

  useEffect(() => {
    const setAppElement = () => {
      if (typeof window !== 'undefined') {
        const appElement = document.getElementById('__next');
        if (appElement) {
          Modal.setAppElement('#__next');
        } else {
          setTimeout(setAppElement, 100);
        }
      }
    };
    setAppElement();
  }, []);

  useEffect(() => {
    const hasCompletedOnboarding = typeof window !== 'undefined' && localStorage.getItem('hasCompletedOnboarding');
    const savedPrioritySubjects = typeof window !== 'undefined' && localStorage.getItem('prioritySubjects');
    const savedCompletionMonths = typeof window !== 'undefined' && localStorage.getItem('completionMonths');

    async function fetchSubjects() {
      try {
        const res = await fetch('/api/subjects');
        if (!res.ok) {
          throw new Error('Failed to fetch subjects.');
        }
        const data: Subject[] = await res.json();
        console.log('Fetched subjects:', data.map(s => ({ id: s.id, subject: s.subject })));
        setAllSubjects(data);
        setSubjects(data);
        setSelectedSubjects([
          'English Essay',
          'English (Precis & Composition)',
          'Pakistan Affairs',
          'Current Affairs',
          'Islamic Studies',
          'General Science & Ability',
        ]);

        if (hasCompletedOnboarding && savedPrioritySubjects && savedCompletionMonths) {
          let parsedPriority: string[] = JSON.parse(savedPrioritySubjects);
          // Map legacy names to new names
          parsedPriority = parsedPriority.map(p => subjectNameMapping[p] || p);
          console.log('Loaded and mapped priority subjects:', parsedPriority);
          setPrioritySubjects(parsedPriority);
          setCompletionMonths(parseInt(savedCompletionMonths));
          setIsOnboarding(false);
        } else {
          setPrioritySubjects([]);
          localStorage.removeItem('prioritySubjects');
          localStorage.removeItem('completionMonths');
        }
      } catch (error) {
        console.error('Error fetching subjects:', error);
        setError('Failed to load subjects. Please try again.');
      }
    }
    fetchSubjects();
  }, []);

  const syncSubjects = async () => {
    try {
      const res = await fetch('/api/subjects');
      if (res.ok) {
        const updatedSubjects: Subject[] = await res.json();
        setAllSubjects(updatedSubjects);
        setSubjects(updatedSubjects);
        console.log('Synced subjects:', updatedSubjects.map(s => ({ id: s.id, subject: s.subject })));
      }
    } catch (error) {
      console.error('Failed to sync subjects:', error);
      setError('Failed to sync subjects. Please try again.');
    }
  };

  const updateNotes = useCallback(
    async (subjectId: string, topicId: string, subtopicId: string, newNotes: string) => {
      try {
        const subject = allSubjects.find((s) => s.id === subjectId);
        const topic = subject?.topics.find((t) => t.id === topicId);
        const subtopic = topic?.subtopics.find((sub) => sub.id === subtopicId);
        if (!subtopic) return;

        await fetch('/api/subjects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subjectId, topicId, subtopicId, notes: newNotes, progress: subtopic.progress }),
        });

        setSubjects((prev) =>
          prev.map((subject) =>
            subject.id === subjectId
              ? {
                  ...subject,
                  topics: subject.topics.map((topic) =>
                    topic.id === topicId
                      ? {
                          ...topic,
                          subtopics: topic.subtopics.map((subtopic) =>
                            subtopic.id === subtopicId ? { ...subtopic, notes: newNotes } : subtopic
                          ),
                        }
                      : topic
                  ),
                }
              : subject
          )
        );
        await syncSubjects();
      } catch (error) {
        console.error('Failed to update notes:', error);
      }
    },
    [allSubjects]
  );
  const updateProgress = useCallback(
    async (
      subjectId: string,
      topicId: string,
      subtopicId: string,
      newProgress: 'Pending' | 'Completed'
    ) => {
      try {
        const subject = allSubjects.find((s) => s.id === subjectId);
        const topic = subject?.topics.find((t) => t.id === topicId);
        const subtopic = topic?.subtopics.find((sub) => sub.id === subtopicId);
        if (!subtopic) return;
  
        const apiProgress = newProgress === 'Completed' ? 'Completed' : 'In Progress';
        const res = await fetch('/api/subjects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subjectId, topicId, subtopicId, notes: subtopic.notes, progress: apiProgress }),
        });
        if (!res.ok) {
          throw new Error('Failed to update progress');
        }
  
        setSubjects((prev) =>
          prev.map((subject) =>
            subject.id === subjectId
              ? {
                  ...subject,
                  topics: subject.topics.map((topic) =>
                    topic.id === topicId
                      ? {
                          ...topic,
                          subtopics: topic.subtopics.map((subtopic) =>
                            subtopic.id === subtopicId ? { ...subtopic, progress: apiProgress } : subtopic
                          ),
                        }
                      : topic
                  ),
                }
              : subject
          )
        );
        await syncSubjects();
      } catch (error) {
        console.error('Failed to update progress:', error);
      }
    },
    [allSubjects]
  );

  const updateTargetTime = useCallback(
    async (subjectId: string, topicId: string, subtopicId: string, newTargetTime: number) => {
      try {
        const subject = allSubjects.find((s) => s.id === subjectId);
        const topic = subject?.topics.find((t) => t.id === topicId);
        const subtopic = topic?.subtopics.find((sub) => sub.id === subtopicId);
        if (!subtopic) return;

        await fetch('/api/subjects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subjectId, topicId, subtopicId, notes: subtopic.notes, progress: subtopic.progress }),
        });

        setSubjects((prev) =>
          prev.map((subject) =>
            subject.id === subjectId
              ? {
                  ...subject,
                  topics: subject.topics.map((topic) =>
                    topic.id === topicId
                      ? {
                          ...topic,
                          subtopics: topic.subtopics.map((subtopic) =>
                            subtopic.id === subtopicId
                              ? {
                                  ...subtopic,
                                  targetTime: newTargetTime,
                                  remainingTime: newTargetTime * 60,
                                }
                              : subtopic
                          ),
                        }
                      : topic
                  ),
                }
              : subject
          )
        );
        await syncSubjects();
      } catch (error) {
        console.error('Failed to update target time:', error);
      }
    },
    [allSubjects]
  );

  const resetSetup = useCallback(() => {
    localStorage.removeItem('hasCompletedOnboarding');
    localStorage.removeItem('prioritySubjects');
    localStorage.removeItem('completionMonths');
    setIsOnboarding(true);
    setSubjects([]);
    setSelectedSubjects([]);
    setPrioritySubjects([]);
    setCompletionMonths(0);
    console.log('Reset: Cleared localStorage and state');
  }, []);

  const handleOnboardingComplete = useCallback(
    (prioritySubjects: string[], completionMonths: number) => {
      console.log('Onboarding input:', { prioritySubjects, completionMonths });
      // Normalize priority subjects
      const normalizedPriority = prioritySubjects.map(s => s.trim());
      localStorage.setItem('hasCompletedOnboarding', 'true');
      localStorage.setItem('prioritySubjects', JSON.stringify(normalizedPriority));
      localStorage.setItem('completionMonths', completionMonths.toString());
      // Ensure subjects is set before priority
      setSubjects(allSubjects);
      setPrioritySubjects(normalizedPriority);
      setCompletionMonths(completionMonths);
      setIsOnboarding(false);
      console.log('Onboarding complete:', { normalizedPriority, subjects: allSubjects.map(s => s.subject) });
    },
    [allSubjects]
  );

  const handleSubjectSelect = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsSubjectModalOpen(true);
  };

  const handleSubjectModalClose = () => {
    setIsSubjectModalOpen(false);
    setSelectedSubject(null);
  };

  // Split subjects into priority and to-cover with normalized comparison
  const prioritySubjectsList = subjects.filter((subject) =>
    prioritySubjects.some(p => p.trim().toLowerCase() === subject.subject.trim().toLowerCase())
  );
  const toCoverSubjects = subjects.filter(
    (subject) => !prioritySubjects.some(p => p.trim().toLowerCase() === subject.subject.trim().toLowerCase())
  );
  console.log('Priority list:', prioritySubjectsList.map(s => ({ id: s.id, subject: s.subject })));
  console.log('To cover:', toCoverSubjects.map(s => ({ id: s.id, subject: s.subject })));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <OnboardingModal
        isOpen={isOnboarding}
        allSubjects={allSubjects}
        error={error}
        onComplete={handleOnboardingComplete}
      />

      <SubjectModal
        isOpen={isSubjectModalOpen}
        subject={selectedSubject}
        onClose={handleSubjectModalClose}
        onTopicSelect={(topic) => {
          setSelectedTopic(topic);
          setIsSubjectModalOpen(false);
        }}
        calculateTopicProgress={(subtopics) => {
          const completed = subtopics.filter((sub) => sub.progress === 'Completed').length;
          return subtopics.length > 0 ? (completed / subtopics.length) * 100 : 0;
        }}
        updateSubject={(updatedSubject) =>
          setAllSubjects((prev) =>
            prev.map((s) => (s.id === updatedSubject.id ? updatedSubject : s))
          )
        }
      />

      <NoteTakingModal
        isOpen={!!selectedTopic}
        subject={selectedSubject}
        topic={selectedTopic}
        onClose={() => setSelectedTopic(null)}
        updateNotes={updateNotes}
        updateProgress={updateProgress}
        updateTargetTime={updateTargetTime}
      />

      <header className="fixed top-0 left-0 right-0 p-4 flex justify-between items-center bg-white shadow-sm z-10">
        <h1 className="text-2xl font-bold text-gray-900">Focused Study By Kazmee</h1>
        <button
          onClick={resetSetup}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Reset
        </button>
      </header>

      <main className="flex-1 pt-20 p-8 max-w-7xl mx-auto w-full">
        {error ? (
          <div className="text-center text-red-600 text-lg">{error}</div>
        ) : subjects.length === 0 && !isOnboarding ? (
          <div className="text-center text-gray-900 text-lg">
            Loading subjects... Please wait.
          </div>
        ) : (
          <>
            {/* Priority Subjects */}
            {prioritySubjectsList.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Priority Subjects</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-min">
                  {prioritySubjectsList.map((subject, index) => (
                    <div
                      key={subject.id}
                      onClick={() => handleSubjectSelect(subject)}
                      className={`relative rounded-xl shadow-sm p-6 border border-blue-200 bg-blue-50 hover:shadow-md transition-shadow duration-200 cursor-pointer ${
                        index === 0 ? 'col-span-2 row-span-2' : 'col-span-1'
                      }`}
                    >
                      <h3 className="text-lg font-semibold text-gray-900">{subject.subject}</h3>
                      <span className="absolute top-2 right-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        Priority
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* To Cover */}
            {toCoverSubjects.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">To Cover</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-min">
                  {toCoverSubjects.map((subject, index) => (
                    <div
                      key={subject.id}
                      onClick={() => handleSubjectSelect(subject)}
                      className={`rounded-xl shadow-sm p-6 border border-gray-100 bg-white hover:shadow-md transition-shadow duration-200 cursor-pointer ${
                        index === 0 ? 'col-span-2' : 'col-span-1'
                      }`}
                    >
                      <h3 className="text-lg font-semibold text-gray-900">{subject.subject}</h3>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
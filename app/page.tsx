"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import Modal from 'react-modal';
import OnboardingModal from '../components/OnboardingModal';
import SubjectModal from '../components/SubjectModal';
import NoteTakingModal from '../components/NoteTakingModal';
import { Subject, Topic } from '../types';
import Link from 'next/link';
import { loadState, saveState } from '../lib/persistence';

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
  const [activeModal, setActiveModal] = useState<string | null>(null);

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

  const fetchSubjects = useCallback(async () => {
    try {
      console.log('Fetching subjects from /api/subjects...');
      const res = await fetch('/api/subjects');
      if (!res.ok) {
        throw new Error('Failed to fetch subjects from API.');
      }
      const data: Subject[] = await res.json();
      console.log('Subjects fetched successfully:', data.map(s => ({ id: s.id, subject: s.subject })));

      console.log('Loading Firebase data for subtopics...');
      const subjectsWithFirebaseData = await Promise.all(
        data.map(async (subject) => {
          console.log(`Processing subject: ${subject.subject}`);
          return {
            ...subject,
            topics: await Promise.all(
              subject.topics.map(async (topic) => {
                console.log(`Processing topic: ${topic.title}`);
                return {
                  ...topic,
                  subtopics: await Promise.all(
                    topic.subtopics.map(async (subtopic) => {
                      console.log(`Loading Firebase data for subtopic: ${subtopic.id}`);
                      const key = `subtopic_${subtopic.id}`;
                      try {
                        const firebaseData = await loadState(key);
                        if (firebaseData) {
                          console.log(`Firebase data for ${key}:`, firebaseData);
                        }
                        return {
                          ...subtopic,
                          notes: firebaseData?.notes || subtopic.notes || '',
                          progress: firebaseData?.progress || subtopic.progress || 'Pending',
                          targetTime: firebaseData?.targetTime || subtopic.targetTime || 0,
                          remainingTime: firebaseData?.remainingTime || subtopic.remainingTime || 0,
                        };
                      } catch (firebaseError) {
                        console.error(`Error loading Firebase data for ${key}:`, firebaseError);
                        return {
                          ...subtopic,
                          notes: subtopic.notes || '',
                          progress: subtopic.progress || 'Pending',
                          targetTime: subtopic.targetTime || 0,
                          remainingTime: subtopic.remainingTime || 0,
                        };
                      }
                    })
                  ),
                };
              })
            ),
          };
        })
      );

      console.log('Subjects with Firebase data:', subjectsWithFirebaseData.map(s => ({ id: s.id, subject: s.subject })));
      setAllSubjects(subjectsWithFirebaseData);
      setSubjects(subjectsWithFirebaseData);
      setSelectedSubjects([
        'English Essay',
        'English (Precis & Composition)',
        'Pakistan Affairs',
        'Current Affairs',
        'Islamic Studies',
        'General Science & Ability',
      ]);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setError('Failed to load subjects. Please try again.');
    }
  }, []);

  useEffect(() => {
    const hasCompletedOnboarding = typeof window !== 'undefined' && localStorage.getItem('hasCompletedOnboarding');
    const savedPrioritySubjects = typeof window !== 'undefined' && localStorage.getItem('prioritySubjects');
    const savedCompletionMonths = typeof window !== 'undefined' && localStorage.getItem('completionMonths');

    const initializeSubjects = async () => {
      await fetchSubjects();

      if (hasCompletedOnboarding && savedPrioritySubjects && savedCompletionMonths) {
        let parsedPriority: string[] = JSON.parse(savedPrioritySubjects);
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
    };

    initializeSubjects();
  }, [fetchSubjects]);

  useEffect(() => {
    if (isOnboarding) {
      setActiveModal('onboarding');
    } else if (isSubjectModalOpen) {
      setActiveModal('subject');
    } else if (selectedTopic) {
      setActiveModal('noteTaking');
    } else {
      setActiveModal(null);
    }
  }, [isOnboarding, isSubjectModalOpen, selectedTopic]);

  useEffect(() => {
    console.log('Modal state changed:', { isOnboarding, isSubjectModalOpen, selectedTopic, activeModal });
  }, [isOnboarding, isSubjectModalOpen, selectedTopic, activeModal]);

  const debounce = <T extends (...args: any[]) => void>(func: T, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const updateNotes = useCallback(
    debounce(
      async (subjectId: string, topicId: string, subtopicId: string, newNotes: string) => {
        try {
          const key = `subtopic_${subtopicId}`;
          const subtopicData = await loadState(key) || { progress: 'Pending', notes: '', targetTime: 0, remainingTime: 0 };
          const updatedData = { ...subtopicData, notes: newNotes };
          await saveState(key, updatedData);
          console.log(`Saved notes to Firebase for ${key}:`, updatedData);
          await fetchSubjects();
        } catch (error) {
          console.error('Failed to update notes:', error);
        }
      },
      500
    ),
    [fetchSubjects]
  );

  const updateProgress = useCallback(
    async (
      subjectId: string,
      topicId: string,
      subtopicId: string,
      newProgress: 'Pending' | 'Completed'
    ) => {
      try {
        const key = `subtopic_${subtopicId}`;
        const subtopicData = await loadState(key) || { progress: 'Pending', notes: '', targetTime: 0, remainingTime: 0 };
        const updatedData = { ...subtopicData, progress: newProgress };
        await saveState(key, updatedData);
        console.log(`Saved progress to Firebase for ${key}:`, updatedData);
        await fetchSubjects();
      } catch (error) {
        console.error('Failed to update progress:', error);
      }
    },
    [fetchSubjects]
  );

  const updateTargetTime = useCallback(
    async (subjectId: string, topicId: string, subtopicId: string, newTargetTime: number) => {
      try {
        const key = `subtopic_${subtopicId}`;
        const subtopicData = await loadState(key) || { progress: 'Pending', notes: '', targetTime: 0, remainingTime: 0 };
        const updatedData = { ...subtopicData, targetTime: newTargetTime, remainingTime: newTargetTime * 60 };
        await saveState(key, updatedData);
        console.log(`Saved target time to Firebase for ${key}:`, updatedData);
        await fetchSubjects();
      } catch (error) {
        console.error('Failed to update target time:', error);
      }
    },
    [fetchSubjects]
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
      const normalizedPriority = prioritySubjects.map(s => s.trim());
      localStorage.setItem('hasCompletedOnboarding', 'true');
      localStorage.setItem('prioritySubjects', JSON.stringify(normalizedPriority));
      localStorage.setItem('completionMonths', completionMonths.toString());
      setSubjects(allSubjects);
      setPrioritySubjects(normalizedPriority);
      setCompletionMonths(completionMonths);
      setIsOnboarding(false);
      console.log('Onboarding complete:', { normalizedPriority, subjects: allSubjects.map(s => s.subject) });
    },
    [allSubjects]
  );

  const handleSubjectSelect = (subject: Subject) => {
    console.log('handleSubjectSelect called for subject:', subject.subject);
    setSelectedSubject(subject);
    setIsSubjectModalOpen(true);
  };

  const handleSubjectModalClose = () => {
    console.log('Closing SubjectModal');
    setIsSubjectModalOpen(false);
    setSelectedSubject(null);
    setActiveModal(null);
  };

  const handleNoteTakingModalClose = () => {
    if (activeModal === 'noteTaking') {
      console.log('Closing NoteTakingModal');
      setSelectedTopic(null);
      setActiveModal(null);
    }
  };

  const prioritySubjectsList = useMemo(
    () =>
      subjects.filter((subject) =>
        prioritySubjects.some(p => p.trim().toLowerCase() === subject.subject.trim().toLowerCase())
      ),
    [subjects, prioritySubjects]
  );

  const toCoverSubjects = useMemo(
    () =>
      subjects.filter(
        (subject) => !prioritySubjects.some(p => p.trim().toLowerCase() === subject.subject.trim().toLowerCase())
      ),
    [subjects, prioritySubjects]
  );

  useEffect(() => {
    console.log('Priority list:', prioritySubjectsList.map(s => ({ id: s.id, subject: s.subject })));
    console.log('To cover:', toCoverSubjects.map(s => ({ id: s.id, subject: s.subject })));
  }, [prioritySubjectsList, toCoverSubjects]);

  // Define the modal content based on activeModal
  const ModalContent = () => {
    if (activeModal === 'onboarding') {
      return (
        <OnboardingModal
          isOpen={true}
          allSubjects={allSubjects}
          error={error}
          onComplete={(prioritySubjects, completionMonths) => {
            handleOnboardingComplete(prioritySubjects, completionMonths);
            setActiveModal(null);
          }}
        />
      );
    }
    if (activeModal === 'subject' && selectedSubject) {
      return (
        <SubjectModal
          isOpen={true}
          subject={selectedSubject}
          onClose={handleSubjectModalClose}
          onTopicSelect={(topic, updateSubject) => {
            setIsSubjectModalOpen(false);
            setSelectedTopic(topic);
            updateSubject(selectedSubject); // Use selectedSubject instead of undefined 'subject'
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
      );
    }
    if (activeModal === 'noteTaking' && selectedSubject && selectedTopic) {
      return (
        <NoteTakingModal
          isOpen={true}
          subject={selectedSubject}
          topic={selectedTopic}
          onClose={handleNoteTakingModalClose}
          updateNotes={updateNotes}
          updateProgress={updateProgress}
          updateTargetTime={updateTargetTime}
        />
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="fixed top-0 left-0 right-0 p-4 flex justify-between items-center bg-white shadow-sm z-10">
        <Link href="/" className="text-2xl font-bold text-gray-900">
          Focused Study By Kazmee
        </Link>
        <button
          onClick={resetSetup}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Reset
        </button>
      </header>

      {/* Single Modal Instance */}
      <Modal
        isOpen={activeModal !== null}
        onRequestClose={() => setActiveModal(null)}
        className="bg-white rounded-2xl w-full max-w-4xl mx-auto my-8"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        shouldCloseOnOverlayClick={true}
        ariaHideApp={false}
      >
        <ModalContent />
      </Modal>

      <main className="flex-1 pt-20 p-8 max-w-7xl mx-auto w-full">
        {error ? (
          <div className="text-center text-red-600 text-lg">{error}</div>
        ) : subjects.length === 0 && !isOnboarding ? (
          <div className="text-center text-gray-900 text-lg">
            Loading subjects... Please wait.
          </div>
        ) : (
          <>
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
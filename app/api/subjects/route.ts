import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Subject } from '@/types';

const subjectsFile = path.join(process.cwd(), 'data', 'subjects.json');

export async function GET() {
  try {
    const data = await fs.readFile(subjectsFile, 'utf-8');
    const subjects: Subject[] = JSON.parse(data);
    return NextResponse.json(subjects);
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json({ error: 'Failed to read subjects' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { subjectId, topicId, subtopicId, notes, progress } = await req.json();

    if (!subjectId || !topicId || !subtopicId || !['Not Started', 'In Progress', 'Completed'].includes(progress)) {
      console.error('Invalid payload:', { subjectId, topicId, subtopicId, progress });
      return NextResponse.json({ error: 'Invalid subjectId, topicId, subtopicId, or progress' }, { status: 400 });
    }

    const data = await fs.readFile(subjectsFile, 'utf-8');
    let subjects: Subject[] = JSON.parse(data);

    let updated = false;
    subjects = subjects.map((subject) => {
      if (subject.id !== subjectId) return subject;
      return {
        ...subject,
        topics: subject.topics.map((topic) => {
          if (topic.id !== topicId) return topic;
          return {
            ...topic,
            subtopics: topic.subtopics.map((sub) => {
              if (sub.id === subtopicId) {
                updated = true;
                return { ...sub, notes: notes || sub.notes, progress };
              }
              return sub;
            }),
          };
        }),
      };
    });

    if (!updated) {
      console.error('No subtopic found for:', { subjectId, topicId, subtopicId });
      return NextResponse.json({ error: 'Subtopic not found' }, { status: 404 });
    }

    await fs.writeFile(subjectsFile, JSON.stringify(subjects, null, 2));
    console.log('Updated subjects.json with:', { subtopicId, progress, notes });
    return NextResponse.json({ message: 'Subtopic updated' });
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json({ error: 'Failed to update subjects' }, { status: 500 });
  }
}
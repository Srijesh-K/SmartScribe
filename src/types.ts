export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface NoteSession {
  id: string;
  fileName: string;
  fileType: 'pdf' | 'audio';
  fileSize: string;
  createdAt: string;
  title: string;
  summary: string;
  notesMarkdown: string;
  keyConcepts: { term: string; definition: string }[];
  quiz?: QuizQuestion[];
}

export interface QuizAttempt {
  notesSessionId: string;
  score: number;
  total: number;
  userAnswers: { [questionId: string]: string };
  completedAt: string;
}

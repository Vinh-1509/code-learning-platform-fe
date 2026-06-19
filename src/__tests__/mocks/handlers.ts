import { http, HttpResponse } from 'msw';

// ─────────────────────────────────────────────────────────────────────────────
// Fake API routes used across the test suite (MSW intercepts axios calls).
//
// These are deliberately generic, "happy path" defaults. Individual test
// files override specific routes with `server.use(...)` when they need a
// particular shape, error status, or delayed/controlled response — see
// AuthContextProvider.test.tsx for the pattern. Treat anything here as a
// safe fallback, not a contract any single test should rely on for exact
// values unless that test owns the override.
//
// NOTE: There is intentionally no handler for
// `POST /api/learning/blocks/:blockId/complete` — that endpoint was removed
// server-side. Block completion is driven entirely by the Feynman chat pass.
// ─────────────────────────────────────────────────────────────────────────────

export const handlers = [
  // ── Auth ─────────────────────────────────────────────────────────────────

  http.post('*/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };

    if (body.email === 'test@hcmut.edu.vn' && body.password === '123456') {
      return HttpResponse.json({
        access_token: 'fake-jwt',
      });
    }

    return HttpResponse.json(
      { message: 'Invalid email or password' },
      { status: 400 }
    );
  }),

  http.post('*/api/auth/register', () => {
    return HttpResponse.json({ access_token: 'fake-jwt-register' });
  }),

  http.get('*/api/auth/me', () => {
    return HttpResponse.json({
      _id: 'user-1',
      email: 'test@hcmut.edu.vn',
      selectedLanguage: ['C++'],
      createdAt: '2024-01-01T00:00:00.000Z',
    });
  }),

  // ── Languages ────────────────────────────────────────────────────────────

  http.get('*/api/languages', () => {
    return HttpResponse.json([
      {
        _id: 'lang-cpp',
        language: 'C++',
        info: 'A fast, low-level systems language.',
        strengths: ['Performance', 'Control'],
        challenges: ['Manual memory management'],
        useCases: ['Game engines', 'Embedded systems'],
      },
      {
        _id: 'lang-java',
        language: 'Java',
        info: 'A portable, object-oriented language.',
        strengths: ['Portability', 'Large ecosystem'],
        challenges: ['Verbosity'],
        useCases: ['Enterprise backends', 'Android apps'],
      },
    ]);
  }),

  http.post('*/api/languages/select', () => {
    return HttpResponse.json({ message: 'Language updated' });
  }),

  // ── Learning: milestones & lessons ──────────────────────────────────────

  http.get('*/api/learning/milestones', () => {
    return HttpResponse.json([
      {
        _id: 'milestone-1',
        title: 'Getting Started',
        description: 'The basics.',
        order: 1,
        progress: {
          status: 'active',
          completionPercentage: 0,
        },
      },
    ]);
  }),

  http.get('*/api/learning/milestones/:milestoneId/lessons', () => {
    return HttpResponse.json([
      {
        _id: 'lesson-1',
        title: 'Variables & Types',
        order: 1,
        progress: {
          status: 'active',
          isCompleted: false,
          completionPercentage: 0,
        },
      },
    ]);
  }),

  http.get('*/api/learning/lessons/:lessonId', ({ params }) => {
    return HttpResponse.json({
      _id: String(params.lessonId),
      title: 'Variables & Types',
      order: 1,
      blocks: [
        {
          _id: 'block-1',
          title: 'Intro to Variables',
          description: 'What is a variable?',
          content: [],
          feynmanQuestion: 'Explain what a variable is in your own words.',
          status: 'active',
          isFeynmanPassed: false,
        },
      ],
      progress: {
        completionPercentage: 0,
        isCompleted: false,
        lastAccessed: '2024-01-01T00:00:00.000Z',
      },
    });
  }),

  // ── Practice / Exercises ─────────────────────────────────────────────────

  http.get('*/api/practice/exercises', () => {
    return HttpResponse.json({
      total: 0,
      page: 1,
      limit: 15,
      data: [],
    });
  }),

  // Generic single-exercise fallback. Returns a fill_blank exercise echoing
  // the requested ID. Override with server.use() when a test needs a
  // drag_drop exercise or specific data/hints.
  http.get('*/api/practice/exercises/:exerciseId', ({ params }) => {
    return HttpResponse.json({
      _id: String(params.exerciseId),
      type: 'fill_blank',
      title: 'Sample Exercise',
      instruction: 'Fill in the blank.',
      language: 'C++',
      level: 'easy',
      order: 1,
      data: {
        template: ['int ', ' = 0;'],
        placeholders: { input_1: 'x' },
      },
      hints: { '1': 'Think about the variable name.' },
    });
  }),

  http.post('*/api/practice/exercises/:exerciseId/submit', () => {
    return HttpResponse.json({
      correct: true,
      items: [],
      attemptNumber: 1,
    });
  }),

  http.post('*/api/practice/exercises/:exerciseId/hint', () => {
    return HttpResponse.json({
      hintLevel: 1,
      hint: 'Try starting with the loop keyword.',
    });
  }),

  http.get('*/api/practice/exercises/:exerciseId/history', () => {
    return HttpResponse.json([]);
  }),

  // ── Exercise AI explanation ──────────────────────────────────────────────

  http.post('*/api/exercises/:exerciseId/explain', ({ params }) => {
    return HttpResponse.json({
      exerciseId: String(params.exerciseId),
      isCorrect: false,
      feedback: 'You are close, review the concept.',
      items: [],
      suggestion: 'Double check the variable type.',
    });
  }),

  // ── Tags / weakness ───────────────────────────────────────────────────────

  http.get('*/api/tags/weakness', () => {
    return HttpResponse.json([]);
  }),

  // ── Feynman ───────────────────────────────────────────────────────────────

  http.get('*/api/feynman/block/:blockId/question', ({ params }) => {
    return HttpResponse.json({
      blockId: String(params.blockId),
      question: 'Explain this concept in your own words.',
    });
  }),

  http.get('*/api/feynman/block/:blockId/history', ({ params }) => {
    return HttpResponse.json({
      blockId: String(params.blockId),
      chatHistory: [],
    });
  }),

  http.get('*/api/feynman/block/:blockId/stats', ({ params }) => {
    return HttpResponse.json({
      blockId: String(params.blockId),
      isFeynmanPassed: false,
    });
  }),

  http.post('*/api/feynman/block/:blockId/chat', ({ params }) => {
    return HttpResponse.json({
      blockId: String(params.blockId),
      reply: 'Good explanation! You got it.',
      isPassed: true,
    });
  }),

  // ── Dashboard ─────────────────────────────────────────────────────────────

  http.get('*/api/dashboard', () => {
    return HttpResponse.json({
      user: {
        _id: 'user-1',
        email: 'test@hcmut.edu.vn',
        username: 'test',
        fullName: 'Test User',
        selectedLanguage: ['C++'],
      },
      roadmap: {
        _id: 'roadmap-1',
        title: 'C++ Roadmap',
        language: 'C++',
      },
      stats: {
        totalLearnedLessons: 0,
        totalCompletedExercises: 0,
        overallProgress: 0,
        weakTagsCount: 0,
      },
      milestones: [],
      dailyReview: {
        pendingCount: 0,
      },
    });
  }),
];

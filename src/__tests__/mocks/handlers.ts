import { http, HttpResponse } from 'msw';

// Fake API routes used by integration tests (MSW intercepts axios calls)
export const handlers = [
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

  http.get('*/api/practice/exercises/:exerciseId/history', () => {
    return HttpResponse.json([]);
  }),

  http.post('*/api/practice/exercises/:exerciseId/hint', () => {
    return HttpResponse.json({
      hintLevel: 1,
      hint: 'Try starting with the loop keyword.',
    });
  }),
];

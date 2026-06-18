// Adds DOM matchers like toBeInTheDocument(), toBeDisabled()
import '@testing-library/jest-dom';

import { beforeAll, afterEach, afterAll } from 'vitest';

import { server } from './mocks/server';

// Start MSW before tests, reset handlers after each test, close when done
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

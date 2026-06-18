import { setupServer } from 'msw/node';

import { handlers } from './handlers';

// MSW server — started once in setup.ts before all tests
export const server = setupServer(...handlers);

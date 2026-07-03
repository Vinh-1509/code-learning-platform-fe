import { createLazyFileRoute } from '@tanstack/react-router';
import { PracticePage } from '../features/practices/PracticePage';

export const Route = createLazyFileRoute('/practice')({
  component: PracticePage,
});

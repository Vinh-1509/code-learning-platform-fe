import { createFileRoute } from '@tanstack/react-router';

// Fake API request
const fetchExercises = async () => {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  return [
    'Array Exercises',
    'Linked List Exercises',
    'Stack Exercises',
    'Tree Exercises',
  ];
};

// Loading screen
function LoadingScreen() {
  return <div className="p-2">Loading exercises...</div>;
}

// Error screen
function ErrorPage() {
  return <div className="p-2 text-red-500">Failed to load exercises.</div>;
}

// Main page
function ExercisesPage() {
  const exercises = Route.useLoaderData();

  return (
    <div className="p-2">
      <h1 className="text-xl font-bold mb-2">Coding Exercises</h1>

      <ul className="list-disc pl-5">
        {exercises.map((exercise) => (
          <li key={exercise}>{exercise}</li>
        ))}
      </ul>
    </div>
  );
}

// Route
export const Route = createFileRoute('/practice')({
  loader: fetchExercises,

  pendingComponent: LoadingScreen,

  errorComponent: ErrorPage,

  component: ExercisesPage,
});

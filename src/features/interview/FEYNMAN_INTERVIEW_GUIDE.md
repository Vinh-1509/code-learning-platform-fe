# Feynman AI Interview Panel

## Overview

The Feynman Interview Panel is a conversational UI component that appears after students complete all exercises in a lesson block. It implements the Feynman Technique, where students explain concepts to an AI to demonstrate deep understanding.

## Component Structure

```
src/features/interview/
├── FeynmanInterviewPane.tsx          # Main panel component
├── MessageBubbles.tsx        # Message UI components
└── feynman.types.ts             # TypeScript interfaces
```

## Design Features & Improvements

### ✨ Key Features

1. **Conversational Flow**
   - AI initiates with a congratulation message
   - Asks conceptual questions about the completed exercises
   - Evaluates user responses and provides targeted feedback
   - Asks follow-up questions or moves to completion

2. **Visual Hierarchy**
   - AI messages in subtle gray bubbles
   - User messages in blue bubbles (right-aligned)
   - Feedback badges for correct/incorrect answers
   - Distinct styling for loading states

3. **User Experience Enhancements**
   - Auto-scrolling to latest messages
   - Copy button for code snippets
   - Smooth animations for all interactions
   - Clear progress indicator (e.g. Question X/3)
   - Disabled input during AI processing

4. **Accessibility**
   - Semantic HTML structure
   - Loading states with spinner animation
   - Clear error messaging
   - Keyboard support (Enter to send)

### 📊 Design Improvements Over Original (from feynman.png)

| Aspect                  | Original                  | Improved                                             |
| ----------------------- | ------------------------- | ---------------------------------------------------- |
| **Message Distinction** | Minimal visual difference | Clear blue bubbles for user, gray for AI             |
| **Loading State**       | Not visible               | Animated spinner with "AI is thinking..."            |
| **Long Conversations**  | May clip content          | Full scrollable container                            |
| **Code Copying**        | Not available             | Copy button on code blocks                           |
| **Input Feedback**      | Basic                     | Disabled state during processing + placeholder hints |
| **Animations**          | Static                    | Fade-in + slide animations for messages              |
| **Progress Tracking**   | Question count only       | Question X/3 indicator + visual badges               |

## Component API

### FeynmanInterviewPane Props

```typescript
interface FeynmanInterviewProps {
  lessonBlockId: string; // ID of the current lesson block
  onComplete: () => void; // Called when interview is complete
  onNextBlock: () => void; // Called when moving to next block
}
```

### Usage Example

```tsx
import { FeynmanInterviewPane } from '@/features/practice/FeynmanInterviewPane';

<FeynmanInterviewPane
  lessonBlockId={currentBlock._id}
  onComplete={() => console.log('Done!')}
  onNextBlock={() => navigateToNextBlock()}
/>;
```

## Integration Point

The panel is automatically shown in [lessonPage.tsx](../../lesson/lessonPage.tsx) when `blockCompleted` is true:

```tsx
{
  blockCompleted && activeBlockId ? (
    <FeynmanInterviewPane
      lessonBlockId={activeBlockId}
      onComplete={() => {
        /* ... */
      }}
      onNextBlock={() => {
        /* ... */
      }}
    />
  ) : (
    <PracticePanel /* existing exercises */ />
  );
}
```

## Message Types

### FeynmanMessage Interface

```typescript
interface FeynmanMessage {
  id: string;
  role: 'ai' | 'user';
  content: string;
  timestamp?: Date;
  isCorrect?: boolean; // For feedback messages
}
```

## Message Bubble Components

### AIMessage

- Used for AI-generated messages
- Supports question and feedback variants
- Includes copy button for code blocks

### UserMessage

- Right-aligned blue bubble
- Shows user responses

### FeedbackBadge

- Shows correct/incorrect status
- Displays explanation message
- Color-coded (green for correct, red for incorrect)

## State Management

Current implementation uses React hooks:

- `messages`: Array of conversation messages
- `userInput`: Current input value
- `isLoading`: AI processing state
- `currentQuestion`: Question counter
- `isBlockComplete`: Completion state
- `feedbackMessage`: Current feedback info

## Future API Integration

Replace the mock setTimeout logic with actual API calls:

```tsx
// TODO: Replace with actual API endpoint
const response = await evaluateFeynmanResponse({
  blockId: lessonBlockId,
  userResponse: userInput,
  questionNumber: currentQuestion,
});

if (response.isCorrect) {
  // Move to next question or completion
} else {
  // Show feedback and retry
}
```

## Styling

Built with Tailwind CSS using consistent design tokens:

- **Colors**: Emerald (success), Rose (error), Blue (user), Slate (AI)
- **Spacing**: 4px base unit with Tailwind scale
- **Animations**: `fade-in`, `slide-in-from-bottom-2` (200ms)
- **Borders**: 1px slate-200/300
- **Shadows**: `shadow-sm` for subtle depth

## Accessibility Considerations

✅ Semantic HTML with proper heading hierarchy
✅ Keyboard navigation (Enter to submit)
✅ Loading indicators for async operations
✅ Color contrast meets WCAG standards
✅ Clear labeling and status messages

## Next Steps for Implementation

1. **Connect to AI API**: Replace mock evaluation logic with actual backend
2. **Add Question Bank**: Create configurable question sets per concept
3. **Metrics & Analytics**: Track user performance in interviews
4. **Difficulty Levels**: Adjust question complexity based on responses
5. **Session History**: Save conversation for review
6. **Retry Logic**: Allow users to retry failed interviews

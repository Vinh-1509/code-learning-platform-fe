import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface AuthLoadingOverlayProps {
  isVisible: boolean;
  messageType?: 'login' | 'signup';
}

const loginMessages = [
  'Verifying your credentials...',
  'Preparing your custom coding space...',
  'Entering your workspace...',
];

const signupMessages = [
  'Creating your account...',
  'Setting up your learning workspace...',
  'Customizing your path...',
];

export function AuthLoadingOverlay({
  isVisible,
  messageType = 'login',
}: AuthLoadingOverlayProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const messages = messageType === 'login' ? loginMessages : signupMessages;

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev < messages.length - 1 ? prev + 1 : prev));
    }, 800);

    return () => {
      clearInterval(interval);
      setMessageIndex(0);
    };
  }, [isVisible, messages.length]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="flex flex-col items-center gap-6 max-w-sm text-center px-4">
        {/* Glow pulsing logo */}
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-xl animate-pulse" />
          <div className="relative bg-primary p-4 rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center w-16 h-16 animate-bounce">
            <span className="text-primary-foreground font-bold text-2xl tracking-tighter">
              {'<>'}
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            Please wait
          </h3>
          <div className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-500 min-h-[20px]">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span>{messages[messageIndex]}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

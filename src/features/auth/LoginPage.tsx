import Axios from 'axios';
import { LoginForm } from './LoginForm';
import { useLogin } from './hooks/useLogin';
import { ShieldCheck, Map, CheckCircle2 } from 'lucide-react';
// Assuming AuthPayload is exported from your auth types folder
import type { AuthPayload } from '@/types/auth';

export function LoginPage() {
  const { mutateAsync: login, isPending: loading, error } = useLogin();

  let errorMessage: string | null = null;
  if (error) {
    if (Axios.isAxiosError<{ message?: string }>(error)) {
      errorMessage =
        error.response?.data?.message || 'Login failed, please try again';
    } else {
      errorMessage = error.message;
    }
  }

  // ── Strongly-typed Submit Handler ─────────────────────────────────────────
  const handleLoginSubmit = async (data: AuthPayload) => {
    await login(data);
  };

  return (
    <div
      className="grid min-h-screen lg:grid-cols-2"
      style={{
        background:
          'radial-gradient(circle at bottom right, #DBEAFE 0%, rgba(219, 234, 254, 0) 60%), radial-gradient(circle at top left, #DBEAFE 0%, rgba(219, 234, 254, 0) 40%), #ffffff',
      }}
    >
      <div className="hidden lg:flex bg-bluedark p-16 flex-col justify-center items-center text-primary-foreground relative overflow-hidden select-none">
        <div className="relative flex flex-col gap-8  w-full">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg shadow-md">
              <div className="text-primary-foreground font-bold text-lg tracking-tighter">
                {'<>'}
              </div>
            </div>
            <span className="text-xl font-bold tracking-tight">CodeStep</span>
          </div>

          {/* logo */}
          <div className="space-y-3">
            <h1 className="text-5xl font-extrabold tracking-tight leading-tight">
              Learn Coding <br />
              the <span className="text-bluelight">right way</span>
            </h1>
            <p className="text-muted-foreground font-semibold text-sm leading-relaxed">
              Structured roadmaps, AI-powered explanations, and daily spaced
              repetition — so what you learn actually sticks.
            </p>
          </div>

          <div className="space-y-4 pt-2 ">
            <FeatureItem
              icon={<ShieldCheck className="text-bluelight h-4 w-4" />}
              title="AI Feynman Technique"
              desc="Explain concepts back to our AI — get instant feedback on gaps in your understanding."
            />
            <FeatureItem
              icon={<CheckCircle2 className="text-green-mint h-4 w-4" />}
              title="Spaced Repetition Reviews"
              desc="Daily review sessions timed by science to maximize long-term memory retention."
            />
            <FeatureItem
              icon={<Map className="text-yellow-medium h-4 w-4" />}
              title="Professional Roadmap"
              desc="Your learning path adjusts to your pace and performance, always keeping you in flow."
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center p-6 sm:p-10 bg-transparent lg:bg-card">
        <div className="w-full flex items-center justify-center">
          <div className="w-full max-w-md bg-transparent p-0 border-none shadow-none">
            <LoginForm
              onSubmit={handleLoginSubmit}
              loading={loading}
              error={errorMessage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex gap-4 items-start max-w-lg">
      <div className="mt-1 bg-darker-gray/90 p-2 rounded-xl border border-border shrink-0">
        {icon}
      </div>
      <div className="space-y-0.5">
        <h3 className="font-semibold text-primary-foreground text-base">
          {title}
        </h3>
        <p className="text-sm font-semibold text-darker-gray leading-normal">
          {desc}
        </p>
      </div>
    </div>
  );
}

import { LoginForm } from './LoginForm';
import { useAuth } from './useAuth';
import { ShieldCheck, Map, CheckCircle2 } from 'lucide-react';
export function LoginPage() {
  const { login, loading, error } = useAuth();

  return (
    <div className="grid min-h-screen lg:grid-cols-2 bg-white">
      <div className="hidden lg:flex bg-[#0f172a] p-16 flex-col justify-center items-center text-white relative overflow-hidden select-none">
        <div className="relative flex flex-col gap-8  w-full">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg shadow-md">
              <div className="text-white font-bold text-lg tracking-tighter">
                {'<>'}
              </div>
            </div>
            <span className="text-xl font-bold tracking-tight">CodeStep</span>
          </div>

          {/* logo */}
          <div className="space-y-3">
            <h1 className="text-5xl font-extrabold tracking-tight leading-tight">
              Learn Coding <br />
              the <span className="text-blue-400">right way</span>
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Structured roadmaps, AI-powered explanations, and daily spaced
              repetition — so what you learn actually sticks.
            </p>
          </div>

          <div className="space-y-4 pt-2 border-t border-slate-800/60">
            <FeatureItem
              icon={<ShieldCheck className="text-blue-400 h-4 w-4" />}
              title="AI Feynman Technique"
              desc="Explain concepts back to our AI — get instant feedback on gaps in your understanding."
            />
            <FeatureItem
              icon={<CheckCircle2 className="text-green-400 h-4 w-4" />}
              title="Spaced Repetition Reviews"
              desc="Daily review sessions timed by science to maximize long-term memory retention."
            />
            <FeatureItem
              icon={<Map className="text-orange-400 h-4 w-4" />}
              title="Professional Roadmap"
              desc="Your learning path adjusts to your pace and performance, always keeping you in flow."
            />
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Nơi chứa Form Đăng Nhập */}
      <div className="flex flex-col justify-center p-6 sm:p-10  bg-white">
        <div className=" w-full flex items-center justify-center">
          <LoginForm onSubmit={login} loading={loading} error={error} />
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
      <div className="mt-1 bg-slate-800/60 p-2 rounded-xl border border-slate-700/40 shrink-0">
        {icon}
      </div>
      <div className="space-y-0.5">
        <h3 className="font-semibold text-slate-100 text-base">{title}</h3>
        <p className="text-sm text-slate-400 leading-normal">{desc}</p>
      </div>
    </div>
  );
}

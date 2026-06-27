import { useState } from 'react';
import { Link } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Mail, Lock, Check, ArrowRight } from 'lucide-react';

interface LoginFormProps {
  onSubmit: (data: { email: string; password: string }) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

export function LoginForm({ onSubmit, loading, error }: LoginFormProps) {
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void onSubmit(formData);
  };

  const isFormValid =
    formData.email.trim() !== '' && formData.password.trim() !== '';

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 w-full max-w-md"
    >
      <FieldGroup className="gap-6">
        {/* Mobile-only Logo */}
        <div className="flex flex-col items-center gap-2 lg:hidden mb-4">
          <div className="bg-primary p-3 rounded-2xl shadow-md w-12 h-12 flex items-center justify-center">
            <div className="text-primary-foreground font-bold text-xl tracking-tighter">
              {'<>'}
            </div>
          </div>
          <span className="text-3xl font-extrabold tracking-tight text-slate-900">
            CodeStep
          </span>
          <p className="text-sm font-semibold text-slate-500 mt-0.5 text-center">
            Learn to think, then learn to code
          </p>
        </div>

        <div className="flex flex-col items-start gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Welcome back
          </h1>
          <p className="text-sm font-semibold text-slate-500">
            Sign in to continue your coding journey
          </p>
        </div>

        <div className="hidden lg:flex flex-wrap gap-2">
          <Badge text="AI explanations" />
          <Badge text="Spaced repetition" />
          <Badge text="Structured roadmap" />
        </div>

        <Field className="space-y-2">
          <FieldLabel
            htmlFor="email"
            className="text-xs font-bold uppercase text-slate-500 tracking-wider"
          >
            Email
          </FieldLabel>
          <div className="relative">
            <Mail className="hidden lg:block absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              onChange={handleChange}
              className="font-medium bg-[#f5f8ff] border border-slate-200/50 pl-4 lg:pl-10 h-12 focus-visible:ring-primary/20 focus-visible:border-primary rounded-2xl"
            />
          </div>
        </Field>

        <Field className="space-y-2">
          <FieldLabel
            htmlFor="password"
            className="text-xs font-bold uppercase text-slate-500 tracking-wider"
          >
            Password
          </FieldLabel>
          <div className="relative">
            <Lock className="hidden lg:block absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              onChange={handleChange}
              className="font-medium bg-[#f5f8ff] border border-slate-200/50 pl-4 lg:pl-10 h-12 focus-visible:ring-primary/20 focus-visible:border-primary rounded-2xl"
            />
          </div>
        </Field>

        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="rounded-xl border border-red-200 bg-red-50 px-3 py-2"
          >
            <p className="text-sm font-semibold text-red-700">{error}</p>
          </div>
        )}

        <Field className="pt-2">
          <Button
            type="submit"
            disabled={loading || !isFormValid}
            className={`w-full h-12 text-white font-bold text-base rounded-2xl transition-all shadow-md shadow-primary/10 flex items-center justify-center gap-2 ${
              isFormValid
                ? 'bg-primary hover:bg-primary/90 cursor-pointer'
                : 'bg-bluelight cursor-not-allowed opacity-90'
            }`}
          >
            {loading ? (
              'Signing in...'
            ) : (
              <>
                Sign in <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>

          <FieldDescription className="text-center mt-6 text-slate-500 font-semibold text-sm">
            Don&apos;t have an account?{' '}
            <Link
              to="/signup"
              className="text-primary font-bold hover:underline underline-offset-4"
            >
              Sign up
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}

function Badge({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-mint text-green-foreground text-xs font-bold rounded-full">
      <Check className="h-3 w-3 text-green-foreground" />
      {text}
    </span>
  );
}

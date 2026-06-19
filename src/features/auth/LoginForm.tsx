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
import { Mail, Lock, Check } from 'lucide-react';

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
      className={'flex flex-col gap-6 w-full max-w-md'}
    >
      <FieldGroup className="gap-6">
        <div className="flex flex-col items-start gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-card-foreground">
            Sign in your account
          </h1>
          <p className="text-sm text-darker-gray">
            Let’s continue your coding journey
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge text="AI explanations" />
          <Badge text="Spaced repetition" />
          <Badge text="Structured roadmap" />
        </div>

        <Field className="space-y-2">
          <FieldLabel
            htmlFor="email"
            className="text-xs font-bold uppercase text-darker-gray tracking-wider"
          >
            Email
          </FieldLabel>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              onChange={handleChange}
              className="bg-background pl-10 h-12 border-border focus-visible:ring-primary focus-visible:border-primary rounded-lg"
            />
          </div>
        </Field>

        <Field className="space-y-2">
          <FieldLabel
            htmlFor="password"
            className="text-xs font-bold uppercase text-darker-gray tracking-wider"
          >
            Password
          </FieldLabel>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Min. 8 characters"
              required
              onChange={handleChange}
              className="bg-background pl-10 pr-10 h-12 border-border focus-visible:ring-primary focus-visible:border-primary rounded-lg"
            />
          </div>
        </Field>

        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2"
          >
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <Field className="pt-2">
          <Button
            type="submit"
            className={`w-full h-12 text-white font-medium text-base rounded-xl transition-colors shadow-sm ${
              isFormValid
                ? 'bg-primary hover:bg-primary/90'
                : 'bg-bluelight hover:bg-bluelight/90'
            }`}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>

          <FieldDescription className="text-center mt-4 text-slate-500 text-sm">
            Don&apos;t have an account?{' '}
            <Link
              to="/signup"
              className="text-primary font-semibold hover:underline underline-offset-4"
            >
              Sign Up
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}

// Component
function Badge({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-mint   text-green-foreground text-xs font-medium rounded-full ">
      <Check className="h-3 w-3 text-green-foreground" />
      {text}
    </span>
  );
}

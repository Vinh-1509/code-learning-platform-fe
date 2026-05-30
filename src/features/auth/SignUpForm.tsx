import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Mail, Lock, Check } from 'lucide-react';

interface SignUpFormProps {
  onSubmit: (data: { email: string; password: string }) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

export function SignUpForm({ onSubmit, loading, error }: SignUpFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return;
    const payload = {
      email: formData.email,
      password: formData.password,
    };
    void onSubmit(payload);
  };

  const isFormValid =
    formData.email.trim() !== '' &&
    formData.password.trim() !== '' &&
    formData.confirmPassword.trim() !== '';

  return (
    <form
      onSubmit={handleSubmit}
      className={'flex flex-col gap-6 w-full max-w-md'}
    >
      <FieldGroup className="gap-6">
        <div className="flex flex-col items-start gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Create your account
          </h1>
          <p className="text-sm text-slate-500">
            Start your coding journey today
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
            className="text-xs font-bold uppercase text-slate-500 tracking-wider"
          >
            Email
          </FieldLabel>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              onChange={handleChange}
              className="bg-background pl-10 h-12 border-slate-200 focus-visible:ring-blue-600 focus-visible:border-blue-600 rounded-lg"
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
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Min. 8 characters"
              required
              onChange={handleChange}
              className="bg-background pl-10 h-12 border-slate-200 focus-visible:ring-blue-600 rounded-lg"
            />
          </div>
        </Field>

        <Field className="space-y-2">
          <FieldLabel
            htmlFor="confirmPassword"
            className="text-xs font-bold uppercase text-slate-500 tracking-wider"
          >
            Confirm password
          </FieldLabel>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Repeat your password"
              required
              onChange={handleChange}
              className="bg-background pl-10 h-12 border-slate-200 focus-visible:ring-blue-600 rounded-lg"
            />
          </div>
        </Field>

        <Field className="pt-2">
          <Button
            type="submit"
            disabled={loading}
            className={`w-full h-12 text-white font-medium text-base rounded-xl transition-colors shadow-sm ${
              isFormValid
                ? 'bg-primary hover:bg-primary/90'
                : 'bg-primary/40 hover:bg-primary/50'
            }`}
          >
            {loading ? 'Đang tạo tài khoản...' : 'Create account →'}
          </Button>
          {error ? <p className="text-sm text-red-600 mt-3">{error}</p> : null}

          <FieldDescription className="text-center mt-4 text-slate-500 text-sm">
            Already have an account?{' '}
            <a
              href="/login"
              className="text-blue-600 font-semibold hover:underline underline-offset-4"
            >
              Sign in
            </a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}

function Badge({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-mint text-green-foreground text-xs font-medium rounded-full border border-green-mint/30">
      <Check className="h-3 w-3 text-green-foreground" />
      {text}
    </span>
  );
}

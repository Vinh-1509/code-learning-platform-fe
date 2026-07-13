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
import {
  Mail,
  Lock,
  Check,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';
// Import the strongly-typed credential configuration from your auth architecture types
import type { AuthPayload } from '@/types/auth';
import { AuthLoadingOverlay } from './components/AuthLoadingOverlay';

interface SignUpFormProps {
  onSubmit: (data: AuthPayload) => void | Promise<unknown>;
  loading?: boolean;
  error?: string | null;
}

const PASSWORD_RULES = [
  {
    id: 'length',
    label: 'At least 8 characters',
    test: (val: string) => val.length >= 8,
  },
  {
    id: 'uppercase',
    label: 'At least 1 uppercase letter',
    test: (val: string) => /[A-Z]/.test(val),
  },
  {
    id: 'lowercase',
    label: 'At least 1 lowercase letter',
    test: (val: string) => /[a-z]/.test(val),
  },
  {
    id: 'number',
    label: 'At least 1 number',
    test: (val: string) => /[0-9]/.test(val),
  },
  {
    id: 'special',
    label: 'At least 1 special character',
    test: (val: string) => /[^A-Za-z0-9]/.test(val),
  },
];

export function SignupForm({ onSubmit, loading, error }: SignUpFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState({
    email: false,
    password: false,
    confirmPassword: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const isEmailValid =
    formData.email.trim() === '' ||
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  const isPasswordValid = PASSWORD_RULES.every((rule) =>
    rule.test(formData.password)
  );
  const isPasswordMatching = formData.password === formData.confirmPassword;

  const showEmailError =
    touched.email && formData.email.trim() !== '' && !isEmailValid;
  const showPasswordError =
    touched.password && formData.password.length > 0 && !isPasswordValid;
  const showConfirmError =
    touched.confirmPassword &&
    formData.confirmPassword.length > 0 &&
    !isPasswordMatching;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPasswordMatching || !isPasswordValid) return;

    // Constructed payload strictly matches the required RegisterPayload entity fields
    const payload: AuthPayload = {
      email: formData.email,
      password: formData.password,
    };

    void onSubmit(payload);
  };

  const isFormValid =
    formData.email.trim() !== '' &&
    formData.password.trim() !== '' &&
    formData.confirmPassword.trim() !== '' &&
    isPasswordValid &&
    isPasswordMatching;

  return (
    <>
      <AuthLoadingOverlay isVisible={!!loading} messageType="signup" />
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 w-full max-w-md"
      >
        <FieldGroup className="gap-6">
          {/* Mobile-only Logo */}
          <div className="flex flex-col items-center gap-2 lg:hidden mb-2">
            <div className="bg-primary p-3 rounded-2xl shadow-md w-12 h-12 flex items-center justify-center">
              <div className="text-primary-foreground font-bold text-xl tracking-tighter">
                {'<>'}
              </div>
            </div>
            <span className="text-3xl font-extrabold tracking-tight text-slate-900">
              CodeStep
            </span>
            <p className="text-sm font-semibold text-slate-500 mt-0.5 text-center">
              Start learning — it's free
            </p>
          </div>

          {/* Card Container for mobile, transparent on desktop */}
          <div className="bg-white lg:bg-transparent p-6 sm:p-8 lg:p-0 rounded-[32px] lg:rounded-none shadow-xl lg:shadow-none border border-slate-100/50 lg:border-none flex flex-col gap-6 w-full">
            {/* Mobile-only benefits list styled like the mockup */}
            <div className="lg:hidden p-4 bg-[#f0f5ff] border border-[#dbe5ff] rounded-2xl space-y-3">
              <div className="flex items-center gap-3 text-xs font-bold text-[#2563eb]">
                <span className="flex items-center justify-center h-5 w-5 rounded-full bg-[#2563eb] text-white shrink-0">
                  <Check className="h-3 w-3 stroke-[3.5]" />
                </span>
                <span>AI-powered Feynman explanations</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-[#2563eb]">
                <span className="flex items-center justify-center h-5 w-5 rounded-full bg-[#2563eb] text-white shrink-0">
                  <Check className="h-3 w-3 stroke-[3.5]" />
                </span>
                <span>Personalized weakness-based practice</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-[#2563eb]">
                <span className="flex items-center justify-center h-5 w-5 rounded-full bg-[#2563eb] text-white shrink-0">
                  <Check className="h-3 w-3 stroke-[3.5]" />
                </span>
                <span>Professional learning roadmap</span>
              </div>
            </div>

            <div className="flex flex-col items-start gap-1">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Create your account
              </h1>
              <p className="text-sm font-semibold text-slate-500">
                Join beginners learning C++ and Java the right way
              </p>
            </div>

            <div className="hidden lg:flex flex-wrap gap-2">
              <Badge text="AI explanations" />
              <Badge text="Weakness tracking" />
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
                  onBlur={handleBlur}
                  className={`font-medium bg-[#f5f8ff] border pl-10 h-12 focus-visible:ring-primary/20 focus-visible:border-primary rounded-2xl ${
                    showEmailError
                      ? 'border-rose-400 focus-visible:ring-rose-200 focus-visible:border-rose-400'
                      : 'border-slate-200/50'
                  }`}
                />
              </div>
              {showEmailError && (
                <p className="text-xs font-medium text-rose-500 mt-1 pl-1">
                  Please enter a valid email address
                </p>
              )}
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
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 Characters"
                  required
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`font-medium bg-[#f5f8ff] border pl-10 pr-10 h-12 focus-visible:ring-primary/20 focus-visible:border-primary rounded-2xl ${
                    showPasswordError
                      ? 'border-rose-400 focus-visible:ring-rose-200 focus-visible:border-rose-400'
                      : 'border-slate-200/50'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* Password strength and requirements checklist */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  formData.password.length > 0 && !isPasswordValid
                    ? 'max-h-60 opacity-100 mt-2.5 p-3.5 border border-slate-200/50 bg-[#f5f8ff] rounded-2xl'
                    : 'max-h-0 opacity-0 mt-0 p-0 border-none'
                }`}
              >
                <p className="text-xs font-bold text-slate-600 mb-2.5 flex items-center gap-1.5">
                  Password must meet the following requirements:
                </p>
                <ul className="flex flex-col gap-2 list-none pl-0.5">
                  {PASSWORD_RULES.map((rule) => {
                    const isMet = rule.test(formData.password);
                    return (
                      <li
                        key={rule.id}
                        className={`flex items-center gap-2 text-xs font-bold transition-all duration-300 ${
                          isMet ? 'text-emerald-600' : 'text-slate-600'
                        }`}
                      >
                        <span
                          className={`flex items-center justify-center h-4 w-4 shrink-0 transition-all duration-300 ${
                            isMet ? 'scale-100 rotate-0' : 'scale-90 rotate-45'
                          }`}
                        >
                          {isMet ? (
                            <Check className="h-3.5 w-3.5 text-emerald-600 stroke-[3.5]" />
                          ) : (
                            <span className="h-1.5 w-1.5 bg-amber-500 rounded-full shadow-sm" />
                          )}
                        </span>
                        <span>{rule.label}</span>
                      </li>
                    );
                  })}
                </ul>
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
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Repeat your password"
                  required
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`font-medium bg-[#f5f8ff] border pl-10 pr-10 h-12 focus-visible:ring-primary/20 focus-visible:border-primary rounded-2xl ${
                    showConfirmError
                      ? 'border-rose-400 focus-visible:ring-rose-200 focus-visible:border-rose-400'
                      : 'border-slate-200/50'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              {formData.confirmPassword.length > 0 && !isPasswordMatching && (
                <p className="text-xs font-medium text-rose-500 mt-1 pl-1">
                  Passwords do not match
                </p>
              )}
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
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating account…
                  </>
                ) : (
                  <>
                    Create account <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </Field>
          </div>

          <FieldDescription className="text-center mt-6 text-slate-500 font-semibold text-sm">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-primary font-bold hover:underline underline-offset-4"
            >
              Sign in
            </Link>
          </FieldDescription>
        </FieldGroup>
      </form>
    </>
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

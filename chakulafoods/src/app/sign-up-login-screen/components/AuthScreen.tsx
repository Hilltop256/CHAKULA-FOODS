'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  Copy,
  Check,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

type LoginForm = {
  email: string;
  password: string;
  remember: boolean;
};

type RegisterForm = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
  ageConfirm: boolean;
};

const demoCredentials = [
  { role: 'Customer', email: 'amara.nakato@chakulafoods.ug', password: 'Chakula@2026' },
  { role: 'Admin', email: 'admin@chakulafoods.ug', password: 'Admin@Chakula26' },
  { role: 'Delivery Rider', email: 'rider.okello@chakulafoods.ug', password: 'Rider@2026' },
];

export default function AuthScreen() {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const loginForm = useForm<LoginForm>({
    defaultValues: { email: '', password: '', remember: false },
  });

  const registerForm = useForm<RegisterForm>({
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      agreeTerms: false,
      ageConfirm: false,
    },
  });

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(key);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const handleUseDemoCredential = (cred: typeof demoCredentials[0]) => {
    loginForm.setValue('email', cred.email);
    loginForm.setValue('password', cred.password);
    setTab('login');
    toast.success(`Demo credentials for ${cred.role} loaded`);
  };

  const onLogin = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      await signIn(data.email, data.password);
      toast.success('Welcome back to Chakula Foods!');
      router.push('/');
      router.refresh();
    } catch (error: any) {
      const msg = error?.message || 'Invalid credentials';
      if (msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('credentials')) {
        loginForm.setError('email', { message: 'Invalid email or password' });
      } else {
        toast.error(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onRegister = async (data: RegisterForm) => {
    if (data.password !== data.confirmPassword) {
      registerForm.setError('confirmPassword', { message: 'Passwords do not match' });
      return;
    }
    setIsLoading(true);
    try {
      await signUp(data.email, data.password, { fullName: data.fullName, phone: data.phone });
      toast.success('Account created! Welcome to Chakula Foods.');
      router.push('/');
      router.refresh();
    } catch (error: any) {
      const msg = error?.message || 'Registration failed';
      if (msg.toLowerCase().includes('already')) {
        registerForm.setError('email', { message: 'An account with this email already exists' });
      } else {
        toast.error(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] hero-gradient relative overflow-hidden flex-col items-center justify-center p-12 text-white">
        <div className="absolute inset-0 opacity-10 text-[120px] flex items-center justify-center select-none pointer-events-none">
          🍲
        </div>
        <div className="relative z-10 max-w-md text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <AppLogo size={64} />
            <div className="text-left">
              <span className="font-extrabold text-3xl block leading-none">Chakula</span>
              <span className="text-secondary font-bold text-lg tracking-wide">Foods Naalya</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-4">
            One App. Every Flavour.
          </h2>
          <p className="text-white/75 text-lg leading-relaxed mb-8">
            Restaurant meals, custom cakes, fresh juices, fine wines, and grocery bundles — 
            order from all departments in one seamless experience.
          </p>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { emoji: '🍽️', label: 'Restaurant Meals' },
              { emoji: '🎂', label: 'Custom Cakes' },
              { emoji: '🥤', label: 'Fresh Juices' },
            ].map((feat) => (
              <div key={`feat-${feat.label}`} className="bg-white/10 rounded-xl p-4">
                <div className="text-3xl mb-2">{feat.emoji}</div>
                <div className="text-xs font-medium text-white/80">{feat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <AppLogo size={36} />
            <div>
              <span className="font-extrabold text-lg text-primary block leading-none">Chakula</span>
              <span className="text-secondary font-semibold text-xs">Foods Naalya</span>
            </div>
          </div>

          <Link href="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft size={14} />
            Back to menu
          </Link>

          {/* Tab switcher */}
          <div className="flex bg-muted rounded-xl p-1 mb-8">
            {(['login', 'register'] as const).map((t) => (
              <button
                key={`tab-${t}`}
                onClick={() => setTab(t)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  tab === t
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* LOGIN FORM */}
          {tab === 'login' && (
            <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    {...loginForm.register('email', {
                      required: 'Email is required',
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
                    })}
                    placeholder="you@example.com"
                    className="input-field pl-9"
                  />
                </div>
                {loginForm.formState.errors.email && (
                  <p className="text-xs text-accent mt-1">{loginForm.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...loginForm.register('password', {
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Password must be at least 6 characters' },
                    })}
                    placeholder="Your password"
                    className="input-field pl-9 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="text-xs text-accent mt-1">{loginForm.formState.errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...loginForm.register('remember')}
                    className="w-4 h-4 rounded border-border accent-primary"
                  />
                  <span className="text-sm text-muted-foreground">Remember me</span>
                </label>
                <button type="button" className="text-sm text-primary font-semibold hover:underline">
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full flex items-center justify-center gap-2 h-11"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          )}

          {/* REGISTER FORM */}
          {tab === 'register' && (
            <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    {...registerForm.register('fullName', {
                      required: 'Full name is required',
                      minLength: { value: 2, message: 'Name is too short' },
                    })}
                    placeholder="Amara Nakato"
                    className="input-field pl-9"
                  />
                </div>
                {registerForm.formState.errors.fullName && (
                  <p className="text-xs text-accent mt-1">{registerForm.formState.errors.fullName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    {...registerForm.register('email', {
                      required: 'Email is required',
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
                    })}
                    placeholder="you@example.com"
                    className="input-field pl-9"
                  />
                </div>
                {registerForm.formState.errors.email && (
                  <p className="text-xs text-accent mt-1">{registerForm.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="tel"
                    {...registerForm.register('phone', {
                      required: 'Phone number is required',
                      pattern: { value: /^[+]?[\d\s\-()]{7,20}$/, message: 'Enter a valid phone number' },
                    })}
                    placeholder="+256 700 000 000"
                    className="input-field pl-9"
                  />
                </div>
                {registerForm.formState.errors.phone && (
                  <p className="text-xs text-accent mt-1">{registerForm.formState.errors.phone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  Password
                </label>
                <p className="text-xs text-muted-foreground mb-1.5">
                  Minimum 8 characters with at least one number
                </p>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...registerForm.register('password', {
                      required: 'Password is required',
                      minLength: { value: 8, message: 'Minimum 8 characters' },
                    })}
                    placeholder="Create a strong password"
                    className="input-field pl-9 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {registerForm.formState.errors.password && (
                  <p className="text-xs text-accent mt-1">{registerForm.formState.errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...registerForm.register('confirmPassword', { required: 'Please confirm your password' })}
                    placeholder="Repeat your password"
                    className="input-field pl-9 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {registerForm.formState.errors.confirmPassword && (
                  <p className="text-xs text-accent mt-1">{registerForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex items-start gap-2">
                <ShieldCheck size={16} className="text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-primary">Default role: Customer</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    New accounts are created as Customer. Admin or Rider access can be granted by an existing Admin.
                  </p>
                </div>
              </div>

              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...registerForm.register('ageConfirm', { required: 'You must confirm your age' })}
                  className="w-4 h-4 rounded border-border accent-primary mt-0.5"
                />
                <span className="text-xs text-muted-foreground">
                  I confirm I am 18 years or older (required for access to Wine &amp; Liquor section)
                </span>
              </label>

              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...registerForm.register('agreeTerms', { required: 'You must agree to the terms' })}
                  className="w-4 h-4 rounded border-border accent-primary mt-0.5"
                />
                <span className="text-xs text-muted-foreground">
                  I agree to the{' '}
                  <span className="text-primary font-semibold">Terms of Service</span> and{' '}
                  <span className="text-primary font-semibold">Privacy Policy</span>
                </span>
              </label>
              {registerForm.formState.errors.agreeTerms && (
                <p className="text-xs text-accent">{registerForm.formState.errors.agreeTerms.message}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full flex items-center justify-center gap-2 h-11"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create My Account'
                )}
              </button>
            </form>
          )}

          {/* Demo credentials */}
          <div className="mt-6 border border-border rounded-xl overflow-hidden">
            <div className="bg-muted px-4 py-2.5 border-b border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Demo Accounts
              </p>
            </div>
            <div className="divide-y divide-border">
              {demoCredentials.map((cred) => (
                <div key={`demo-${cred.role}`} className="px-4 py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground">{cred.role}</p>
                    <p className="text-xs text-muted-foreground truncate">{cred.email}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopy(cred.email, `email-${cred.role}`)}
                      className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground"
                      title="Copy email"
                    >
                      {copiedField === `email-${cred.role}` ? (
                        <Check size={12} className="text-primary" />
                      ) : (
                        <Copy size={12} />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUseDemoCredential(cred)}
                      className="text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1 rounded-lg transition-colors"
                    >
                      Use
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Mail, Loader2, CheckCircle2, ShieldCheck, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const API_URL = `${BASE_URL}/api`;
const STEPS = { REQUEST: 'request', SENT: 'sent' };

const SecurityHero = () => (
  <section className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#242078] via-[#3530a0] to-indigo-600 p-7 text-white shadow-xl shadow-indigo-950/15 sm:p-9">
    <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-indigo-100">
          <KeyRound className="h-4 w-4" />
          Security Manager
        </div>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Change Password</h1>
        <p className="mt-2 max-w-xl text-sm font-medium leading-6 text-indigo-100 sm:text-base">
          Update your credentials to keep your recruiter and management profiles safe.
        </p>
      </div>
      <div className="flex w-fit items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm">
        <ShieldCheck className="h-6 w-6 text-emerald-300" />
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-100">Status</p>
          <p className="text-sm font-extrabold text-white">Verified Session</p>
        </div>
      </div>
    </div>
    <div className="absolute -right-12 -top-16 h-52 w-52 rounded-full bg-white/10" />
    <div className="absolute -bottom-24 right-28 h-48 w-48 rounded-full bg-cyan-300/10" />
  </section>
);

export default function ChangePassword() {
  const { toast } = useToast();
  const { authHeaders } = useAuth();
  const [step, setStep] = useState(STEPS.REQUEST);
  const [sending, setSending] = useState(false);

  const buildHeaders = useCallback(async () => ({
    'Content-Type': 'application/json',
    ...(await authHeaders()),
  }), [authHeaders]);

  const getUserEmail = () => {
    try {
      const session = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
      return session.email || '';
    } catch {
      return '';
    }
  };

  const handleSendLink = async () => {
    const email = getUserEmail();
    if (!email) {
      toast({ title: 'Error', description: 'Session not found. Please log in again.', variant: 'destructive' });
      return;
    }
    setSending(true);
    try {
      const res = await fetch(`${API_URL}/auth/send-otp`, {
        method: 'POST',
        headers: await buildHeaders(),
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send reset link.');
      toast({ title: 'Email sent', description: `A reset link has been sent to ${email}.` });
      setStep(STEPS.SENT);
    } catch (error) {
      toast({ title: 'Send failed', description: error.message, variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  const stepIndex = [STEPS.REQUEST, STEPS.SENT].indexOf(step);
  const stepLabels = ['Request Link', 'Link Sent'];

  return (
    <div className="min-h-screen flex-1 overflow-y-auto rounded-[2rem] bg-slate-100 p-4 text-slate-950 sm:p-6 lg:p-8 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
        <SecurityHero />

        <Card className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-lg shadow-slate-200/50 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/20">
          <CardHeader className="border-b border-slate-200 bg-slate-50 px-6 py-5 dark:border-slate-700 dark:bg-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-violet-100 p-2.5 dark:bg-violet-500/20">
                <Lock className="h-5 w-5 text-violet-800 dark:text-violet-300" />
              </div>
              <CardTitle className="text-xl font-extrabold text-slate-950 dark:text-white">Password & Credentials</CardTitle>
            </div>
            <CardDescription className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Request a secure verification link to update your password.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 sm:p-7">
            <div className="mb-6 flex items-center gap-2">
              {stepLabels.map((label, index) => {
                const done = index < stepIndex || step === STEPS.SENT;
                const active = index === stepIndex;
                return (
                  <React.Fragment key={label}>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                        done ? 'bg-emerald-600 text-white' : active
                          ? 'bg-[#3530a0] text-white'
                          : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                      }`}>
                        {done ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                      </div>
                      <span className={`hidden text-xs font-bold sm:block ${
                        active || done ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'
                      }`}>
                        {label}
                      </span>
                    </div>
                    {index < 1 && <div className={`h-0.5 flex-1 ${done ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`} />}
                  </React.Fragment>
                );
              })}
            </div>

            {step === STEPS.REQUEST && (
              <div className="space-y-5">
                <div className="flex items-start gap-3 rounded-xl border border-indigo-200 bg-indigo-50 p-5 dark:border-indigo-500/40 dark:bg-indigo-500/10">
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-indigo-800 dark:text-indigo-300" />
                  <div>
                    <p className="text-sm font-extrabold text-indigo-950 dark:text-indigo-200">Security check required</p>
                    <p className="mt-1 text-sm font-medium leading-6 text-slate-700 dark:text-slate-300">
                      A password reset link will be sent to{' '}
                      <strong className="text-slate-950 dark:text-white">{getUserEmail() || 'your email'}</strong>.
                      Click the link in the email to securely choose a new password.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={handleSendLink}
                    disabled={sending}
                    className="h-11 min-w-[180px] bg-[#3530a0] px-6 font-bold text-white shadow-md hover:bg-[#242078]"
                  >
                    {sending
                      ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</>
                      : <><Mail className="mr-2 h-4 w-4" />Send Reset Link</>}
                  </Button>
                </div>
              </div>
            )}

            {step === STEPS.SENT && (
              <div className="flex flex-col items-center gap-4 py-8 text-center">
                <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-500/20">
                  <Mail className="h-8 w-8 text-emerald-700 dark:text-emerald-300" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-950 dark:text-white">Check Your Inbox</h3>
                  <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-300">
                    A reset link has been sent to{' '}
                    <strong className="text-slate-950 dark:text-white">{getUserEmail()}</strong>.
                    Please click that link to complete your password update.
                  </p>
                </div>
                <div className="mt-4 flex w-full justify-center border-t border-slate-200 pt-5 dark:border-slate-700">
                  <Button
                    variant="outline"
                    onClick={() => setStep(STEPS.REQUEST)}
                    className="border-slate-300 bg-white font-bold text-slate-800 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                  >
                    Back to Request
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Lock, User, Mail, Loader2,
  CheckCircle2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

// ── ENV ───────────────────────────────────────────────────────────────────────
// VITE_API_URL="http://localhost:5000"  (no trailing /api in .env)
// We always append /api here so every fetch hits the correct endpoint.
const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const API_URL  = `${BASE_URL}/api`;

const STEPS = { REQUEST: 'request', SENT: 'sent' };

export default function AdminSettings() {
  const { toast }      = useToast();
  const { authHeaders } = useAuth();   // ← async token getter from AuthContext

  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);

  // Profile form
  const [formData, setFormData] = useState({ name: '', email: '', username: '' });

  // Password Link flow
  const [step,      setStep]      = useState(STEPS.REQUEST);
  const [sending,   setSending]   = useState(false);

  // ── Auth header builder ───────────────────────────────────────────────────
  // Uses AuthContext.authHeaders() which auto-refreshes the Firebase token
  // if it's within 5 minutes of expiry, and respects the 9-hour session cap.
  // MUST be awaited: const headers = await buildHeaders();
  const buildHeaders = useCallback(async () => {
    const ah = await authHeaders();    // { Authorization: 'Bearer <fresh-token>' }
    return { 'Content-Type': 'application/json', ...ah };
  }, [authHeaders]);

  // ── Read email from session ───────────────────────────────────────────────
  const getUserEmail = useCallback(() => {
    try {
      const session = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
      return session.email || formData.email || '';
    } catch { return formData.email || ''; }
  }, [formData.email]);

  // ── Fetch profile on mount ────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const headers = await buildHeaders();
        const res     = await fetch(`${API_URL}/auth/profile`, { headers });
        if (!res.ok) throw new Error('Failed to load profile');
        const data = await res.json();
        setFormData({ name: data.name || '', email: data.email || '', username: data.username || '' });
      } catch (err) {
        toast({ title: 'Error', description: 'Could not load user profile.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    })();
  }, []);    // eslint-disable-line react-hooks/exhaustive-deps

  // ── Profile save ──────────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const headers = await buildHeaders();
      const res     = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT', headers,
        body: JSON.stringify({ name: formData.name, email: formData.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update profile');

      // Sync sessionStorage so getUserEmail() stays accurate
      try {
        const session = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
        sessionStorage.setItem('currentUser', JSON.stringify({ ...session, name: data.name, email: data.email }));
      } catch {}

      toast({ title: 'Profile saved', description: 'Your profile has been updated.' });
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // ── Send Reset Link ──────────────────────────────────────────────────────
  const handleSendLink = async () => {
    const email = getUserEmail();
    if (!email) {
      toast({ title: 'Error', description: 'Session not found. Please log in again.', variant: 'destructive' });
      return;
    }
    setSending(true);
    try {
      const headers = await buildHeaders();
      const res = await fetch(`${API_URL}/auth/send-otp`, {
        method: 'POST', headers, body: JSON.stringify({ email }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Failed to send reset link.');

      toast({
        title: 'Email Sent!',
        description: `A reset link has been sent to ${email}.`,
      });
      
      setStep(STEPS.SENT);
    } catch (err) {
      toast({ title: 'Send Failed', description: err.message, variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  const resetFlow = () => {
    setStep(STEPS.REQUEST);
  };

  const stepIdx  = [STEPS.REQUEST, STEPS.SENT].indexOf(step);
  const stepMeta = ['Request Link', 'Link Sent'];

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f3f6fd] p-8">
        <Loader2 className="h-8 w-8 animate-spin text-[#283086]" />
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-[#f3f6fd] p-6 lg:p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">

        <div className="bg-white/70 p-6 rounded-[1.5rem] border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#283086] mb-2">Administration</p>
          <h1 className="text-3xl font-black text-slate-900">Settings</h1>
          <p className="text-gray-500 mt-1">Manage your account and preferences</p>
        </div>

        {/* ── Profile Card ── */}
        <Card className="rounded-[1.5rem] border border-gray-100 shadow-sm bg-white overflow-hidden">
          <CardHeader className="bg-[#f8faff] border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-[#e3f2fd] p-2">
                <User className="h-5 w-5 text-[#283086]" />
              </div>
              <CardTitle className="text-slate-900">Profile Information</CardTitle>
            </div>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={formData.name}
                onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                className="border-gray-200 focus-visible:ring-[#283086]" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input id="email" type="email" value={formData.email}
                  onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                  className="pl-10 border-gray-200 focus-visible:ring-[#283086]" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" value={formData.username} disabled className="bg-slate-100 border-gray-200" />
              <p className="text-xs text-gray-500">Username cannot be changed.</p>
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={handleSaveProfile} disabled={saving} className="bg-[#283086] hover:bg-[#1f256f]">
                {saving
                  ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
                  : 'Save Profile'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ── Password Reset Card ── */}
        <Card className="rounded-[1.5rem] border border-gray-100 shadow-sm bg-white overflow-hidden">
          <CardHeader className="bg-[#f8faff] border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-[#f3e5f5] p-2">
                <Lock className="h-5 w-5 text-[#283086]" />
              </div>
              <CardTitle className="text-slate-900">Change Password</CardTitle>
            </div>
            <CardDescription>Request a secure password reset link to be sent to your registered email address.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">

            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-6">
              {stepMeta.map((label, i) => {
                const done   = i < stepIdx || step === STEPS.SENT;
                const active = i === stepIdx;
                return (
                  <React.Fragment key={label}>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        done   ? 'bg-green-500 text-white'
                               : active ? 'bg-[#283086] text-white'
                               : 'bg-slate-100 text-slate-500'
                      }`}>
                        {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                      </div>
                      <span className={`text-xs font-medium hidden sm:block ${active || done ? 'text-slate-900' : 'text-slate-500'}`}>
                        {label}
                      </span>
                    </div>
                    {i < 1 && <div className={`flex-1 h-px ${done ? 'bg-green-400' : 'bg-gray-200'}`} />}
                  </React.Fragment>
                );
              })}
            </div>

            {/* STEP 1 — Request Link */}
            {step === STEPS.REQUEST && (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-[#f8faff] rounded-xl border border-blue-100">
                  <Mail className="h-5 w-5 text-[#283086] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-[#283086]">Identity Verification Required</p>
                    <p className="text-sm text-slate-600 mt-0.5">
                      A password reset link will be sent to <strong>{getUserEmail()}</strong>. Click the link in the email to securely update your password.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSendLink} disabled={sending} className="min-w-[160px] bg-[#283086] hover:bg-[#1f256f]">
                    {sending
                      ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</>
                      : <><Mail className="mr-2 h-4 w-4" />Send Reset Link</>}
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2 — Link Sent UI */}
            {step === STEPS.SENT && (
              <div className="py-8 flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-2">
                  <Mail className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">Check Your Inbox!</h3>
                  <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
                    A reset link has been successfully sent to <strong className="text-slate-900">{getUserEmail()}</strong>.
                    Please check your email and click the link to reset your password.
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 w-full flex justify-center">
                  <Button variant="outline" onClick={resetFlow}>Back to Request</Button>
                </div>
              </div>
            )}

          </CardContent>
        </Card>

      </div>
    </div>
  );
}

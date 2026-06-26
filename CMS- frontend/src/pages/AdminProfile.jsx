import React, { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, User, ShieldCheck, ContactRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const API_URL = `${BASE_URL}/api`;

const ProfileHero = ({ name }) => (
  <section className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#242078] via-[#3530a0] to-indigo-600 p-7 text-white shadow-xl shadow-indigo-950/15 sm:p-9">
    <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-indigo-100">
          <ContactRound className="h-4 w-4" />
          User Profile
        </div>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{name || 'Administrator'}</h1>
        <p className="mt-2 max-w-xl text-sm font-medium leading-6 text-indigo-100 sm:text-base">
          Update the profile credentials and personal contact details connected to your administration account.
        </p>
      </div>
      <div className="flex w-fit items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm">
        <ShieldCheck className="h-6 w-6 text-emerald-300" />
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-100">Role</p>
          <p className="text-sm font-extrabold text-white">Administrator</p>
        </div>
      </div>
    </div>
    <div className="absolute -right-12 -top-16 h-52 w-52 rounded-full bg-white/10" />
    <div className="absolute -bottom-24 right-28 h-48 w-48 rounded-full bg-cyan-300/10" />
  </section>
);

export default function AdminProfile() {
  const { toast } = useToast();
  const { authHeaders } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', username: '' });

  const buildHeaders = useCallback(async () => ({
    'Content-Type': 'application/json',
    ...(await authHeaders()),
  }), [authHeaders]);

  useEffect(() => {
    let cancelled = false;
    const loadProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/profile`, { headers: await buildHeaders() });
        if (!res.ok) throw new Error('Failed to load profile');
        const data = await res.json();
        if (!cancelled) {
          setFormData({
            name: data.name || '',
            email: data.email || '',
            username: data.username || '',
          });
        }
      } catch {
        if (!cancelled) {
          toast({ title: 'Error', description: 'Could not load user profile.', variant: 'destructive' });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadProfile();
    return () => { cancelled = true; };
  }, [buildHeaders, toast]);

  const handleSaveProfile = async () => {
    // Basic validation
    if (!formData.name.trim()) {
      toast({ title: 'Validation error', description: 'Full Name is required', variant: 'destructive' });
      return;
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formData.email.trim())) {
      toast({ title: 'Validation error', description: 'Enter a valid email address', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: await buildHeaders(),
        body: JSON.stringify({ name: formData.name, email: formData.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update profile');

      try {
        const session = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
        sessionStorage.setItem('currentUser', JSON.stringify({
          ...session,
          name: data.name,
          email: data.email,
        }));
        // Dispatch storage event to update sidebar username immediately
        window.dispatchEvent(new Event('storage'));
      } catch {
        // Safe fallback
      }
      toast({ title: 'Profile saved', description: 'Your profile has been updated successfully.' });
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center rounded-3xl bg-slate-100 p-8 dark:bg-slate-950">
        <Loader2 className="h-9 w-9 animate-spin text-indigo-700 dark:text-indigo-300" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex-1 overflow-y-auto rounded-[2rem] bg-slate-100 p-4 text-slate-950 sm:p-6 lg:p-8 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
        <ProfileHero name={formData.name} />

        <Card className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-lg shadow-slate-200/50 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/20">
          <CardHeader className="border-b border-slate-200 bg-slate-50 px-6 py-5 dark:border-slate-700 dark:bg-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-indigo-100 p-2.5 dark:bg-indigo-500/20">
                <User className="h-5 w-5 text-indigo-800 dark:text-indigo-300" />
              </div>
              <CardTitle className="text-xl font-extrabold text-slate-950 dark:text-white">Profile Details</CardTitle>
            </div>
            <CardDescription className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Update the name and email address connected to your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 p-6 sm:p-7">
            <div className="space-y-2.5">
              <Label htmlFor="name" className="text-sm font-bold text-slate-800 dark:text-slate-100">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(event) => setFormData((previous) => ({ ...previous, name: event.target.value }))}
                className="h-12 border-slate-300 bg-white px-4 text-base font-medium text-slate-950 shadow-sm focus-visible:border-indigo-600 focus-visible:ring-indigo-600 dark:border-slate-600 dark:bg-slate-950 dark:text-white"
              />
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="email" className="text-sm font-bold text-slate-800 dark:text-slate-100">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(event) => setFormData((previous) => ({ ...previous, email: event.target.value }))}
                  className="h-12 border-slate-300 bg-white pl-11 text-base font-medium text-slate-950 shadow-sm focus-visible:border-indigo-600 focus-visible:ring-indigo-600 dark:border-slate-600 dark:bg-slate-950 dark:text-white"
                />
              </div>
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="username" className="text-sm font-bold text-slate-800 dark:text-slate-100">Username</Label>
              <Input
                id="username"
                value={formData.username}
                disabled
                className="h-12 border-slate-300 bg-slate-200 px-4 text-base font-semibold text-slate-700 opacity-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              />
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Username is fixed and cannot be modified.</p>
            </div>
            <div className="flex justify-end border-t border-slate-200 pt-5 dark:border-slate-700">
              <Button
                onClick={handleSaveProfile}
                disabled={saving}
                className="h-11 min-w-36 bg-[#3530a0] px-6 font-bold text-white shadow-md hover:bg-[#242078]"
              >
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : 'Save Profile'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

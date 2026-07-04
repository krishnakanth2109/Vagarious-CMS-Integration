import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Mail, Phone, User, MessageSquare, Calendar, Loader2 } from 'lucide-react';

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');
const API_URL = `${BASE_URL}/api`;

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function ExternalContacts() {
  const { authHeaders } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadContacts = async () => {
      setLoading(true);
      setError(null);

      try {
        const headers = await authHeaders();
        const params = new URLSearchParams({ importType: 'external_contacts' });
        const response = await fetch(`${API_URL}/externalcontacts?${params.toString()}`, { headers });
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body.message || 'Failed to load external contacts');
        }

        const data = await response.json();
        setContacts(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || 'Unable to fetch external contacts.');
      } finally {
        setLoading(false);
      }
    };

    loadContacts();
  }, [authHeaders]);

  const filteredContacts = useMemo(() => {
    if (!searchTerm) return contacts;
    const term = searchTerm.toLowerCase();

    return contacts.filter((contact) => {
      const combined = [
        contact.name,
        contact.email,
        contact.phone,
        contact.subject,
        contact.message,
        contact.source,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return combined.includes(term);
    });
  }, [contacts, searchTerm]);

  return (
    <div className="flex-1 p-6 lg:p-8 bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
              External Contacts
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
              General contact form submissions received from the Vagarious website
            </p>
          </div>
          <div className="text-xs font-bold text-slate-450 dark:text-slate-500 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
            Source: Website Form
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors max-w-sm">
          <div>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider">Total Submissions</p>
            <h3 className="text-3xl font-black text-slate-955 dark:text-white mt-1.5">{contacts.length}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-500 flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>

        {/* Search controls */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by name, email, phone or subject..."
              className="pl-10 h-10 bg-slate-50 dark:bg-slate-950/50 border-slate-250 dark:border-slate-850 focus:bg-white focus:ring-blue-500 focus:border-blue-500 rounded-xl transition-all"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin h-12 w-12 text-indigo-600" />
            <p className="text-sm font-medium text-slate-400 animate-pulse">Loading external contacts...</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 dark:border-red-950/30 bg-red-50 dark:bg-red-950/10 p-8 text-center text-red-700 dark:text-red-400 shadow-sm font-semibold">
            {error}
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 text-slate-300 dark:text-slate-700 animate-bounce" />
            <p className="text-lg font-bold text-slate-900 dark:text-white">No external contacts found</p>
            <p className="text-sm text-slate-400 dark:text-slate-550 mt-1">Try adjusting your search query.</p>
          </div>
        ) : (
          <div className="overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-5 py-4 font-semibold uppercase tracking-wide text-xs">Name</th>
                    <th className="px-5 py-4 font-semibold uppercase tracking-wide text-xs">Email</th>
                    <th className="px-5 py-4 font-semibold uppercase tracking-wide text-xs">Phone</th>
                    <th className="px-5 py-4 font-semibold uppercase tracking-wide text-xs">Subject</th>
                    <th className="px-5 py-4 font-semibold uppercase tracking-wide text-xs">Message</th>
                    <th className="px-5 py-4 font-semibold uppercase tracking-wide text-xs">Submitted Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                  {filteredContacts.map((contact, index) => {
                    const initials = (contact.name || '').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                    return (
                      <tr key={contact._id || index} className="hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors">
                        <td className="px-5 py-4 align-top text-slate-800 dark:text-slate-200">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-inner">
                              {initials || <User className="w-4 h-4" />}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white leading-tight">{contact.name || '-'}</div>
                              <div className="mt-1 text-[10px] bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded text-slate-500 font-semibold inline-block">{contact.source || 'Vagarious Website'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 align-top text-slate-750 dark:text-slate-300">
                          {contact.email ? (
                            <a className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:underline text-xs" href={`mailto:${contact.email}`}>
                              <Mail className="h-3.5 w-3.5 text-blue-500" />
                              {contact.email}
                            </a>
                          ) : '-'}
                        </td>
                        <td className="px-5 py-4 align-top text-slate-750 dark:text-slate-300">
                          {contact.phone ? (
                            <a className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-350 font-medium hover:underline text-xs" href={`tel:${contact.phone}`}>
                              <Phone className="h-3.5 w-3.5 text-green-500" />
                              {contact.phone}
                            </a>
                          ) : '-'}
                        </td>
                        <td className="px-5 py-4 align-top text-slate-700 dark:text-slate-300">
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {contact.subject || '-'}
                          </span>
                        </td>
                        <td className="max-w-[360px] px-5 py-4 align-top text-slate-700 dark:text-slate-300">
                          <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 rounded-xl p-3 text-xs leading-relaxed max-h-24 overflow-y-auto whitespace-pre-wrap">
                            {contact.message || '-'}
                          </div>
                        </td>
                        <td className="px-5 py-4 align-top text-slate-500 dark:text-slate-400 whitespace-nowrap text-xs font-semibold">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {formatDate(contact.createdAt)}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

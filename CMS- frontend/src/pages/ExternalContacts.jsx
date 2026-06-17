import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Mail, Phone } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">External Contacts</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Contact form submissions received from the Vagarious website.
          </p>
        </div>
        <div className="w-full max-w-sm">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by name, email, phone or subject"
              className="pl-11"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-500">Total external contacts</p>
              <p className="text-3xl font-semibold text-slate-900">{contacts.length}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-slate-100 text-slate-700">Imported from Vagarious</Badge>
              <Badge className="bg-slate-100 text-slate-700">Latest first</Badge>
            </div>
          </div>
        </div>

        {loading && (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
            Loading external contacts...
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center text-red-700 shadow-sm">
            {error}
          </div>
        )}

        {!loading && !error && filteredContacts.length === 0 && (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
            No external contacts match your search.
          </div>
        )}

        {!loading && !error && filteredContacts.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="px-4 py-3 font-medium uppercase tracking-wide">Name</th>
                  <th className="px-4 py-3 font-medium uppercase tracking-wide">Email</th>
                  <th className="px-4 py-3 font-medium uppercase tracking-wide">Phone</th>
                  <th className="px-4 py-3 font-medium uppercase tracking-wide">Subject</th>
                  <th className="px-4 py-3 font-medium uppercase tracking-wide">Message</th>
                  <th className="px-4 py-3 font-medium uppercase tracking-wide">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredContacts.map((contact, index) => (
                  <tr key={contact._id || index} className="hover:bg-slate-50">
                    <td className="px-4 py-4 align-top text-slate-800">
                      <div className="font-semibold">{contact.name || '-'}</div>
                      <div className="mt-1 text-xs text-slate-500">{contact.source || 'Vagarious'}</div>
                    </td>
                    <td className="px-4 py-4 align-top text-slate-700">
                      {contact.email ? (
                        <a className="inline-flex items-center gap-2 text-blue-700 hover:underline" href={`mailto:${contact.email}`}>
                          <Mail className="h-4 w-4" />
                          {contact.email}
                        </a>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-4 align-top text-slate-700">
                      {contact.phone ? (
                        <a className="inline-flex items-center gap-2 text-slate-700 hover:text-blue-700" href={`tel:${contact.phone}`}>
                          <Phone className="h-4 w-4" />
                          {contact.phone}
                        </a>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-4 align-top text-slate-700">{contact.subject || '-'}</td>
                    <td className="max-w-[360px] whitespace-pre-wrap break-words px-4 py-4 align-top text-slate-700">
                      {contact.message || '-'}
                    </td>
                    <td className="px-4 py-4 align-top text-slate-700">{formatDate(contact.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

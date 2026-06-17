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

export default function ExternalClients() {
  const { authHeaders } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadClients = async () => {
      setLoading(true);
      setError(null);

      try {
        const headers = await authHeaders();
        const response = await fetch(`${API_URL}/externalclients`, { headers });
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body.message || 'Failed to load external clients');
        }

        const data = await response.json();
        setClients(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || 'Unable to fetch external clients.');
      } finally {
        setLoading(false);
      }
    };

    loadClients();
  }, [authHeaders]);
  

  const filteredClients = useMemo(() => {
    if (!searchTerm) return clients;
    const term = searchTerm.toLowerCase();

    return clients.filter((client) => {
      const combined = [
        client.companyName,
        client.contactPerson,
        client.email,
        client.phone,
        client.positions,
        client.location,
        client.requirements,
        client.source,
        client.status,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return combined.includes(term);
    });
  }, [clients, searchTerm]);

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">External Clients</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Employer requirement submissions received from the Vagarious website.
          </p>
        </div>
        <div className="w-full max-w-sm">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by company, person, email or location"
              className="pl-11"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-500">Total external clients</p>
              <p className="text-3xl font-semibold text-slate-900">{clients.length}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-slate-100 text-slate-700">Imported from Vagarious</Badge>
              <Badge className="bg-slate-100 text-slate-700">Latest first</Badge>
            </div>
          </div>
        </div>

        {loading && (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
            Loading external clients...
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center text-red-700 shadow-sm">
            {error}
          </div>
        )}

        {!loading && !error && filteredClients.length === 0 && (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
            No external clients match your search.
          </div>
        )}

        {!loading && !error && filteredClients.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="px-4 py-3 font-medium uppercase tracking-wide">Company</th>
                  <th className="px-4 py-3 font-medium uppercase tracking-wide">Contact</th>
                  <th className="px-4 py-3 font-medium uppercase tracking-wide">Phone</th>
                  <th className="px-4 py-3 font-medium uppercase tracking-wide">Positions</th>
                  <th className="px-4 py-3 font-medium uppercase tracking-wide">Location</th>
                  <th className="px-4 py-3 font-medium uppercase tracking-wide">Requirements</th>
                  <th className="px-4 py-3 font-medium uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 font-medium uppercase tracking-wide">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredClients.map((client, index) => (
                  <tr key={client._id || index} className="hover:bg-slate-50">
                    <td className="px-4 py-4 align-top text-slate-800">
                      <div className="font-semibold">{client.companyName || '-'}</div>
                      <div className="mt-1 text-xs text-slate-500">{client.source || 'Vagarious'}</div>
                    </td>
                    <td className="px-4 py-4 align-top text-slate-700">
                      <div className="font-medium">{client.contactPerson || '-'}</div>
                      {client.email ? (
                        <a className="mt-1 inline-flex items-center gap-2 text-blue-700 hover:underline" href={`mailto:${client.email}`}>
                          <Mail className="h-4 w-4" />
                          {client.email}
                        </a>
                      ) : null}
                    </td>
                    <td className="px-4 py-4 align-top text-slate-700">
                      {client.phone ? (
                        <a className="inline-flex items-center gap-2 text-slate-700 hover:text-blue-700" href={`tel:${client.phone}`}>
                          <Phone className="h-4 w-4" />
                          {client.phone}
                        </a>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-4 align-top text-slate-700">{client.positions || '-'}</td>
                    <td className="px-4 py-4 align-top text-slate-700">{client.location || '-'}</td>
                    <td className="max-w-[360px] whitespace-pre-wrap break-words px-4 py-4 align-top text-slate-700">
                      {client.requirements || '-'}
                    </td>
                    <td className="px-4 py-4 align-top text-slate-700">
                      <Badge className="bg-slate-100 text-slate-700">{client.status || 'Pending'}</Badge>
                    </td>
                    <td className="px-4 py-4 align-top text-slate-700">{formatDate(client.createdAt)}</td>
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

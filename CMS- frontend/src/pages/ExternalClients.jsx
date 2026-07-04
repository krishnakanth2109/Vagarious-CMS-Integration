import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Mail, Phone, Building, User, MapPin, Briefcase, Calendar, Loader2 } from 'lucide-react';

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

  // Dynamic statistics
  const stats = useMemo(() => {
    const total = clients.length;
    const pending = clients.filter(c => (c.status || 'Pending').toLowerCase() === 'pending').length;
    const active = clients.filter(c => (c.status || '').toLowerCase() === 'active').length;
    return { total, pending, active };
  }, [clients]);

  return (
    <div className="flex-1 p-6 lg:p-8 bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
              External Clients
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
              Employer requirement submissions received from the Vagarious website
            </p>
          </div>
          <div className="text-xs font-bold text-slate-450 dark:text-slate-500 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
            Source: Website Form
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-880 shadow-sm flex items-center justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
            <div>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider">Total Submissions</p>
              <h3 className="text-3xl font-black text-slate-955 dark:text-white mt-1.5">{stats.total}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-500 flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
            <div>
              <p className="text-xs font-bold text-amber-500 uppercase tracking-wider">Pending Action</p>
              <h3 className="text-3xl font-black text-slate-950 dark:text-white mt-1.5">{stats.pending}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-500 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
            <div>
              <p className="text-xs font-bold text-green-500 uppercase tracking-wider">Active Leads</p>
              <h3 className="text-3xl font-black text-slate-950 dark:text-white mt-1.5">{stats.active}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-950/20 text-green-500 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Search Controls */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by company, person, email or location..."
              className="pl-10 h-10 bg-slate-50 dark:bg-slate-950/50 border-slate-250 dark:border-slate-850 focus:bg-white focus:ring-blue-500 focus:border-blue-500 rounded-xl transition-all"
            />
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin h-12 w-12 text-indigo-600" />
            <p className="text-sm font-medium text-slate-400 animate-pulse">Loading external clients...</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 dark:border-red-950/30 bg-red-50 dark:bg-red-950/10 p-8 text-center text-red-700 dark:text-red-400 shadow-sm font-semibold">
            {error}
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
            <Building className="h-12 w-12 mx-auto mb-3 text-slate-300 dark:text-slate-700 animate-bounce" />
            <p className="text-lg font-bold text-slate-900 dark:text-white">No external clients found</p>
            <p className="text-sm text-slate-400 dark:text-slate-550 mt-1">Try adjusting your search query.</p>
          </div>
        ) : (
          <div className="overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-5 py-4 font-semibold uppercase tracking-wide text-xs">Company</th>
                    <th className="px-5 py-4 font-semibold uppercase tracking-wide text-xs">Contact Person</th>
                    <th className="px-5 py-4 font-semibold uppercase tracking-wide text-xs">Contact Info</th>
                    <th className="px-5 py-4 font-semibold uppercase tracking-wide text-xs">Positions Needed</th>
                    <th className="px-5 py-4 font-semibold uppercase tracking-wide text-xs">Location</th>
                    <th className="px-5 py-4 font-semibold uppercase tracking-wide text-xs">Requirements</th>
                    <th className="px-5 py-4 font-semibold uppercase tracking-wide text-xs">Status</th>
                    <th className="px-5 py-4 font-semibold uppercase tracking-wide text-xs">Submitted Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                  {filteredClients.map((client, index) => {
                    const initials = (client.companyName || '').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                    const status = client.status || 'Pending';
                    return (
                      <tr key={client._id || index} className="hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors">
                        <td className="px-5 py-4 align-top text-slate-800 dark:text-slate-200">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-inner">
                              {initials || <Building className="w-4 h-4" />}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white leading-tight">{client.companyName || '-'}</div>
                              <div className="mt-1 text-[10px] bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded text-slate-500 font-semibold inline-block">{client.source || 'Vagarious Website'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 align-top text-slate-700 dark:text-slate-300">
                          <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            {client.contactPerson || '-'}
                          </div>
                        </td>
                        <td className="px-5 py-4 align-top text-slate-700 dark:text-slate-300 space-y-1.5">
                          {client.email && (
                            <div>
                              <a className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:underline text-xs" href={`mailto:${client.email}`}>
                                <Mail className="h-3.5 w-3.5 text-blue-500" />
                                {client.email}
                              </a>
                            </div>
                          )}
                          {client.phone && (
                            <div>
                              <a className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-350 font-medium hover:underline text-xs" href={`tel:${client.phone}`}>
                                <Phone className="h-3.5 w-3.5 text-green-500" />
                                {client.phone}
                              </a>
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4 align-top text-slate-700 dark:text-slate-300">
                          <span className="font-medium text-xs bg-slate-50 dark:bg-slate-950 px-2 py-1 rounded-md border border-slate-100 dark:border-slate-850 inline-block">
                            {client.positions || '-'}
                          </span>
                        </td>
                        <td className="px-5 py-4 align-top text-slate-700 dark:text-slate-300">
                          <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span>{client.location || '-'}</span>
                          </div>
                        </td>
                        <td className="max-w-[300px] px-5 py-4 align-top text-slate-700 dark:text-slate-300">
                          <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 rounded-xl p-3 text-xs leading-relaxed max-h-24 overflow-y-auto whitespace-pre-wrap">
                            {client.requirements || '-'}
                          </div>
                        </td>
                        <td className="px-5 py-4 align-top text-slate-700 dark:text-slate-300">
                          <Badge className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold select-none ${
                            status.toLowerCase() === 'active' ? 'bg-green-50 dark:bg-green-950/20 text-green-600 border border-green-200 dark:border-green-900/30' :
                            status.toLowerCase() === 'pending' ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 border border-amber-200 dark:border-amber-900/30' :
                            'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400'
                          }`}>
                            {status}
                          </Badge>
                        </td>
                        <td className="px-5 py-4 align-top text-slate-500 dark:text-slate-400 whitespace-nowrap text-xs font-semibold">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {formatDate(client.createdAt)}
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

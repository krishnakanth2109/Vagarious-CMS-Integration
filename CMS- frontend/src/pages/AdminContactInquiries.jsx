import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Mail, Phone, Calendar, Trash2, CheckCircle2, MessageSquare, List, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const API_URL = `${BASE_URL}/api`;

export default function AdminContactInquiries() {
  const { authHeaders } = useAuth();
  const [inquiries, setInquiries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchInquiries = async () => {
    setIsLoading(true);
    try {
      const headers = await authHeaders();
      const res = await fetch(`${API_URL}/contact`, {
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        }
      });
      if (!res.ok) throw new Error("Failed to fetch contact inquiries");
      const data = await res.json();
      setInquiries(data);
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this inquiry?")) return;
    try {
      const headers = await authHeaders();
      const res = await fetch(`${API_URL}/contact/${id}`, {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        }
      });
      if (!res.ok) throw new Error("Failed to delete inquiry");
      setInquiries((prev) => prev.filter((item) => item._id !== id));
      toast({ title: "Success", description: "Inquiry deleted successfully." });
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      const headers = await authHeaders();
      const res = await fetch(`${API_URL}/contact/${id}`, {
        method: "PATCH",
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error("Failed to update status");
      setInquiries((prev) => prev.map((item) => item._id === id ? { ...item, status } : item));
      toast({ title: "Success", description: `Status updated to ${status}.` });
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // Compute analytics statistics
  const stats = useMemo(() => {
    const total = inquiries.length;
    const newCount = inquiries.filter(i => (i.status || 'New') === 'New').length;
    const inProgress = inquiries.filter(i => i.status === 'In Progress').length;
    const resolved = inquiries.filter(i => i.status === 'Resolved').length;
    return { total, newCount, inProgress, resolved };
  }, [inquiries]);

  // Combined search and status filter
  const filteredInquiries = useMemo(() => {
    return inquiries.filter((inquiry) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch = (
        (inquiry.name || "").toLowerCase().includes(q) ||
        (inquiry.email || "").toLowerCase().includes(q) ||
        (inquiry.subject || "").toLowerCase().includes(q) ||
        (inquiry.message || "").toLowerCase().includes(q)
      );
      
      const status = inquiry.status || 'New';
      const matchesStatus = statusFilter === "All" || status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [inquiries, searchTerm, statusFilter]);

  return (
    <div className="flex-1 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
              Contact Inquiries
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
              Manage and track submissions from the public website contact form
            </p>
          </div>
          <div className="text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
            Synced in real-time
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Inquiries */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors duration-250">
            <div>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Received</p>
              <h3 className="text-3xl font-black text-slate-950 dark:text-white mt-1.5">{stats.total}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          {/* New */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors duration-250">
            <div>
              <p className="text-xs font-bold text-amber-500 uppercase tracking-wider">New Inquiries</p>
              <h3 className="text-3xl font-black text-slate-950 dark:text-white mt-1.5">{stats.newCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-500 flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            </div>
          </div>
          {/* In Progress */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors duration-250">
            <div>
              <p className="text-xs font-bold text-blue-500 uppercase tracking-wider">In Progress</p>
              <h3 className="text-3xl font-black text-slate-950 dark:text-white mt-1.5">{stats.inProgress}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-500 flex items-center justify-center">
              <List className="w-5 h-5" />
            </div>
          </div>
          {/* Resolved */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors duration-250">
            <div>
              <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Resolved</p>
              <h3 className="text-3xl font-black text-slate-950 dark:text-white mt-1.5">{stats.resolved}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Controls Panel */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <Input
              placeholder="Search by name, email, subject, message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 bg-slate-50 dark:bg-slate-950/50 border-slate-250 dark:border-slate-800 focus:bg-white focus:ring-blue-500 focus:border-blue-500 rounded-xl transition-all"
            />
          </div>
          
          {/* Status Filters Switcher */}
          <div className="flex bg-slate-100 dark:bg-slate-950/80 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800/80 overflow-x-auto self-start md:self-auto scrollbar-none">
            {['All', 'New', 'In Progress', 'Resolved'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  statusFilter === status
                    ? 'bg-white dark:bg-slate-850 text-slate-950 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* List of Inquiries */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="animate-spin h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full" />
            <p className="text-sm font-medium text-slate-400 animate-pulse">Loading inquiries...</p>
          </div>
        ) : filteredInquiries.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 text-slate-300 dark:text-slate-700 animate-bounce" />
            <p className="text-lg font-bold text-slate-900 dark:text-white">No inquiries found</p>
            <p className="text-sm text-slate-400 dark:text-slate-550 mt-1">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="grid gap-5">
            {filteredInquiries.map((inq) => {
              const status = inq.status || 'New';
              const initials = (inq.name || '').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
              
              return (
                <div 
                  key={inq._id} 
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md dark:hover:border-slate-700 transition-all duration-300 overflow-hidden"
                >
                  <div className="flex flex-col lg:flex-row">
                    
                    {/* Left Content */}
                    <div className="p-6 flex-1 space-y-4">
                      
                      {/* Header row */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-inner">
                            {initials || <User className="w-4 h-4" />}
                          </div>
                          <div>
                            <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                              {inq.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold">{new Date(inq.createdAt).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        <Badge 
                          variant="outline" 
                          className={`px-3 py-1 text-xs font-bold rounded-full select-none ${
                            status === 'Resolved' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border-emerald-200 dark:border-emerald-900/30' :
                            status === 'In Progress' ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 border-blue-200 dark:border-blue-900/30' :
                            'bg-amber-50 dark:bg-amber-950/20 text-amber-600 border-amber-200 dark:border-amber-900/30'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 inline-block ${
                            status === 'Resolved' ? 'bg-emerald-500' :
                            status === 'In Progress' ? 'bg-blue-500 animate-pulse' :
                            'bg-amber-500 animate-ping'
                          }`} />
                          {status}
                        </Badge>
                      </div>

                      {/* Message Content */}
                      <div className="space-y-2">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950/30 px-3 py-1 rounded-lg inline-block">
                          {inq.subject}
                        </p>
                        <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 rounded-xl p-4 text-slate-700 dark:text-slate-300 text-sm whitespace-pre-wrap leading-relaxed shadow-inner">
                          {inq.message}
                        </div>
                      </div>

                      {/* Contact Channels */}
                      <div className="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-450 border-t border-slate-100 dark:border-slate-850 pt-3">
                        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950/25 px-2.5 py-1 rounded-md">
                          <Mail className="w-3.5 h-3.5 text-blue-500" />
                          <a href={`mailto:${inq.email}`} className="hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">{inq.email}</a>
                        </div>
                        {inq.phone && (
                          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950/25 px-2.5 py-1 rounded-md">
                            <Phone className="w-3.5 h-3.5 text-green-500" />
                            <a href={`tel:${inq.phone}`} className="hover:text-green-600 dark:hover:text-green-400 font-medium transition-colors">{inq.phone}</a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Actions Pane */}
                    <div className="px-6 py-5 lg:py-0 lg:w-52 bg-slate-50/50 dark:bg-slate-950/20 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-850 flex flex-row lg:flex-col items-center justify-center gap-2.5">
                      {status !== 'Resolved' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-600 hover:text-emerald-700 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/30 rounded-xl font-bold transition-all shadow-sm"
                          onClick={() => handleStatusUpdate(inq._id, 'Resolved')}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" /> Resolve Inquiry
                        </Button>
                      )}
                      {status === 'New' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 dark:bg-blue-950/30 dark:hover:bg-blue-950/50 dark:text-blue-400 border-blue-200/50 dark:border-blue-900/30 rounded-xl font-bold transition-all shadow-sm"
                          onClick={() => handleStatusUpdate(inq._id, 'In Progress')}
                        >
                          <List className="w-4 h-4 mr-2" /> Mark In Progress
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/15 hover:text-rose-700 rounded-xl font-bold transition-colors"
                        onClick={() => handleDelete(inq._id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </Button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}

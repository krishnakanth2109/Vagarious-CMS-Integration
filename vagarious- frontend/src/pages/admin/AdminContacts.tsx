import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import AdminLayout from "@/components/admin/AdminLayout";
import { Mail, Phone, Calendar, MessageSquare, User } from "lucide-react";

// --- TYPES ---
interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: string;
  submittedAt: string;
}

const AdminContacts = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      setError("");
      try {
        // 1. Get Base URL
        let baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        
        // 2. Clean URL formatting
        if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);
        if (!baseUrl.endsWith('/api')) baseUrl = `${baseUrl}/api`;

        // 3. Construct Final URL
        const endpoint = `${baseUrl}/contact`;
        
        // 🚨 DEBUG: This will show up in your F12 Browser Console
        console.log("🚀 Attempting to fetch from:", endpoint); 

        const response = await fetch(endpoint, {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });
        
        if (!response.ok) {
          throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Sort messages: Newest first
        const sortedData = data.sort((a: ContactMessage, b: ContactMessage) => 
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
        );
        
        setMessages(sortedData);
      } catch (err: any) {
        console.error("Fetch error details:", err);
        setError(`Connection failed: ${err.message}. Note: Render free servers sleep after 15 mins of inactivity. Please wait 1 minute and refresh the page.`);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <AdminLayout title="Contact Inquiries">
      <div className="space-y-6">
        {/* Top Stats Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Contact Messages</h2>
            <p className="text-slate-500">Manage and respond to user inquiries from the website.</p>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl border border-blue-100 shadow-sm">
            <MessageSquare size={18} />
            <span className="font-bold">Total Inquiries: {messages.length}</span>
          </div>
        </div>

        <Card className="shadow-xl border-slate-200 overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <CardTitle className="text-lg flex items-center gap-2">
              <User size={20} className="text-blue-600" />
              Recent Submissions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 space-y-4">
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            ) : error ? (
              <div className="m-8 p-6 text-red-600 bg-red-50 rounded-xl border border-red-200 flex items-center gap-3">
                <div className="bg-red-100 p-2 rounded-full">⚠️</div>
                <p className="font-medium text-sm">{error}</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-20">
                <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="text-slate-300" size={32} />
                </div>
                <p className="text-slate-500 font-medium text-lg">No contact messages yet.</p>
                <p className="text-slate-400 text-sm">When users fill out the contact form, they will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="font-bold text-slate-700">Date</TableHead>
                      <TableHead className="font-bold text-slate-700">User Information</TableHead>
                      <TableHead className="font-bold text-slate-700">Subject</TableHead>
                      <TableHead className="font-bold text-slate-700 w-[35%]">Message Content</TableHead>
                      <TableHead className="font-bold text-slate-700">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {messages.map((msg) => (
                      <TableRow key={msg._id} className="hover:bg-blue-50/30 transition-colors">
                        <TableCell className="align-top pt-5">
                          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(msg.submittedAt)}
                          </div>
                        </TableCell>
                        <TableCell className="align-top pt-5">
                          <div className="flex flex-col space-y-1">
                            <span className="font-bold text-slate-900 text-sm uppercase tracking-tight">{msg.name}</span>
                            <a href={`mailto:${msg.email}`} className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 transition-colors">
                              <Mail className="w-3.5 h-3.5" /> {msg.email}
                            </a>
                            <a href={`tel:${msg.phone}`} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700">
                              <Phone className="w-3.5 h-3.5" /> {msg.phone}
                            </a>
                          </div>
                        </TableCell>
                        <TableCell className="align-top pt-5 font-semibold text-slate-700 italic">
                          "{msg.subject}"
                        </TableCell>
                        <TableCell className="align-top pt-5">
                          <div className="text-sm text-slate-600 leading-relaxed bg-white/50 p-3 rounded-lg border border-slate-100 shadow-sm max-h-32 overflow-y-auto">
                            {msg.message}
                          </div>
                        </TableCell>
                        <TableCell className="align-top pt-5">
                          <Badge
                            className={`px-3 py-1 rounded-full border shadow-sm font-bold uppercase text-[10px] tracking-widest ${
                              msg.status === "New" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                          >
                            {msg.status || "New"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminContacts;
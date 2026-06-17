import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Mail, Phone, Calendar, Trash2, CheckCircle2, MessageSquare, List } from "lucide-react";
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

  const filteredInquiries = inquiries.filter((inquiry) => {
    const q = searchTerm.toLowerCase();
    return (
      (inquiry.name || "").toLowerCase().includes(q) ||
      (inquiry.email || "").toLowerCase().includes(q) ||
      (inquiry.subject || "").toLowerCase().includes(q) ||
      (inquiry.message || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex-1 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Contact Inquiries
            </h1>
            <p className="text-gray-500 mt-1">Manage messages received from the public website</p>
          </div>
        </div>

        {/* Controls */}
        <Card>
          <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="text-sm text-gray-500 font-medium">
              Total Inquiries: {filteredInquiries.length}
            </div>
          </CardContent>
        </Card>

        {/* List */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent" />
          </div>
        ) : filteredInquiries.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium">No inquiries found</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredInquiries.map((inq) => (
              <Card key={inq._id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row border-b lg:border-b-0">
                  
                  {/* Left Column: Details */}
                  <div className="p-6 flex-1 border-b lg:border-b-0 lg:border-r border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                          {inq.name}
                        </h3>
                        <p className="text-sm font-semibold text-blue-600 mt-1">{inq.subject}</p>
                      </div>
                      <Badge variant="outline" className={
                        inq.status === 'Resolved' ? 'bg-green-50 text-green-700 border-green-200' :
                        inq.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-orange-50 text-orange-700 border-orange-200'
                      }>
                        {inq.status || 'New'}
                      </Badge>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-4 text-gray-700 text-sm whitespace-pre-wrap">
                      "{inq.message}"
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        <a href={`mailto:${inq.email}`} className="hover:text-blue-600 transition-colors">{inq.email}</a>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        <a href={`tel:${inq.phone}`} className="hover:text-blue-600 transition-colors">{inq.phone}</a>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(inq.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="p-6 w-full lg:w-48 bg-gray-50/50 flex flex-row lg:flex-col items-center justify-center gap-3">
                    {inq.status !== 'Resolved' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 border-green-200"
                        onClick={() => handleStatusUpdate(inq._id, 'Resolved')}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" /> Resolve
                      </Button>
                    )}
                    {inq.status === 'New' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 border-blue-200"
                        onClick={() => handleStatusUpdate(inq._id, 'In Progress')}
                      >
                        <List className="w-4 h-4 mr-2" /> Mark In Progress
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => handleDelete(inq._id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </Button>
                  </div>

                </div>
              </Card>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

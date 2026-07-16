import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Briefcase, FileText, CheckCircle2, AlertTriangle, Loader2,
  Mail, User, Phone, GraduationCap, CalendarDays, UserCheck, HelpCircle, Image, UploadCloud
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, '');
const API_URL = `${BASE_URL}/api`;

const inputCls = "w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-zinc-900 dark:text-zinc-100 transition-all placeholder-zinc-400";
const labelCls = "block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-450 mb-1.5";

export default function VisitorsQRApply() {
  const { token } = useParams();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [campaign, setCampaign] = useState(null);
  const [campaignError, setCampaignError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    qualification: '',
    yearOfPassOut: '',
    reference: '',
    position: '',
    purpose: ''
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [photoCopyFile, setPhotoCopyFile] = useState(null);
  const [photoUploadError, setPhotoUploadError] = useState('');

  useEffect(() => {
    fetchCampaignDetails();
  }, [token]);

  const fetchCampaignDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/public/visitors-qr/${token}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Invalid or expired application link.');
      }

      setCampaign(data);
    } catch (err) {
      setCampaignError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setPhotoUploadError('');
    if (!file) return;

    // Validate size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setPhotoUploadError('File size exceeds the 10MB limit. Please upload a smaller image.');
      setPhotoCopyFile(null);
      return;
    }

    setPhotoCopyFile(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setUploadError('');
    if (!file) return;

    // Validate type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];
    const fileExt = file.name.split('.').pop().toLowerCase();
    const isAllowedExt = ['pdf', 'doc', 'docx'].includes(fileExt);

    if (!allowedTypes.includes(file.type) && !isAllowedExt) {
      setUploadError('Invalid file type. Only PDF, DOC, and DOCX are allowed.');
      setResumeFile(null);
      return;
    }

    // Validate size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size exceeds the 10MB limit. Please upload a smaller file.');
      setResumeFile(null);
      return;
    }

    setResumeFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.phone || !formData.qualification || !formData.reference || !formData.position || !resumeFile) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields and upload your resume.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSubmitting(true);
      const payload = new FormData();
      Object.keys(formData).forEach(key => {
        payload.append(key, formData[key]);
      });
      payload.append('resume', resumeFile);
      if (photoCopyFile) {
        payload.append('photoCopy', photoCopyFile);
      }

      const res = await fetch(`${API_URL}/public/visitors-qr/${token}/apply`, {
        method: 'POST',
        body: payload
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Submission failed.');
      }

      setSubmitted(true);
      toast({
        title: 'Application Submitted',
        description: data.message || 'Your application has been received successfully.'
      });
    } catch (err) {
      toast({
        title: 'Submission Error',
        description: err.message || 'Unable to upload resume. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-zinc-600 dark:text-zinc-400 font-medium">Loading form details...</p>
      </div>
    );
  }

  if (campaignError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6">
        <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-2xl text-center">
          <div className="h-16 w-16 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Link Invalid or Expired</h2>
          <p className="text-zinc-500 dark:text-zinc-400 mb-6 text-sm leading-relaxed">
            {campaignError || 'This application link is invalid or has expired. Please request a new QR code or link from the recruitment team.'}
          </p>
          <div className="text-xs text-zinc-450 dark:text-zinc-650">VTS Application Portal</div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6">
        <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-2xl text-center animate-in fade-in zoom-in-95 duration-300">
          <div className="h-16 w-16 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Application Submitted!</h2>
          <p className="text-zinc-600 dark:text-zinc-300 font-medium mb-1">
            Thank you, {formData.fullName}.
          </p>
          <p className="text-zinc-500 dark:text-zinc-400 mb-6 text-sm leading-relaxed">
            Your application has been received successfully. Our recruitment team will review your profile and contact you soon.
          </p>
          <div className="text-xs text-zinc-450 dark:text-zinc-650 border-t border-zinc-150 dark:border-zinc-850 pt-4">
            Position applied: <span className="font-semibold text-zinc-800 dark:text-zinc-200">{campaign.jobTitle}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-zinc-50 to-blue-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950/40 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center font-sans">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-[2.5rem] shadow-[0_20px_50px_rgba(91,54,244,0.05)] overflow-hidden transition-all duration-300">
        
        {/* Top Accent Line */}
        <div className="h-3 bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 w-full"></div>

        {/* Branding Header */}
        <div className="p-8 sm:p-10 border-b border-zinc-100 dark:border-zinc-800 bg-gradient-to-b from-slate-50/50 to-transparent dark:from-zinc-900/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-md shadow-indigo-500/10">
              <span className="text-white font-black text-lg">V</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
              Vagarious Solutions Pvt Ltd
            </h1>
          </div>
          <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-ping"></span>
            Visitor Registration & Candidate Portal
          </p>
        </div>

        {/* Application Form */}
        <form onSubmit={handleSubmit} className="p-8 sm:p-10 space-y-6">
          <div className="space-y-6">
            
            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-550 dark:text-zinc-400">
                <Mail className="w-4 h-4 text-indigo-500" />
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm bg-zinc-50/50 dark:bg-zinc-950 focus:bg-white dark:focus:bg-zinc-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-zinc-100 placeholder-zinc-400"
                placeholder="Enter your email address"
              />
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <label htmlFor="fullName" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-555 dark:text-zinc-400">
                <User className="w-4 h-4 text-indigo-500" />
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm bg-zinc-50/50 dark:bg-zinc-950 focus:bg-white dark:focus:bg-zinc-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-zinc-100 placeholder-zinc-400"
                placeholder="Enter your full name"
              />
            </div>

            {/* Contact (Phone) */}
            <div className="space-y-2">
              <label htmlFor="phone" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-555 dark:text-zinc-400">
                <Phone className="w-4 h-4 text-indigo-500" />
                Contact Number <span className="text-red-500">*</span>
              </label>
              <input
                id="phone"
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm bg-zinc-50/50 dark:bg-zinc-950 focus:bg-white dark:focus:bg-zinc-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-zinc-100 placeholder-zinc-400"
                placeholder="Enter your contact number"
              />
            </div>

            {/* Qualification */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-555 dark:text-zinc-400">
                <GraduationCap className="w-4 h-4 text-indigo-500" />
                Highest Qualification <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3 mt-1">
                <label className={`flex items-center justify-center gap-3 px-4 py-3 border rounded-2xl cursor-pointer text-sm font-semibold transition-all select-none ${
                  formData.qualification === 'Post Graduate'
                    ? 'border-indigo-500 bg-indigo-50/40 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400 shadow-sm font-bold'
                    : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-950 text-zinc-650 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                }`}>
                  <input
                    type="radio"
                    name="qualification"
                    value="Post Graduate"
                    checked={formData.qualification === 'Post Graduate'}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <span>Post Graduate</span>
                </label>
                <label className={`flex items-center justify-center gap-3 px-4 py-3 border rounded-2xl cursor-pointer text-sm font-semibold transition-all select-none ${
                  formData.qualification === 'Graduate'
                    ? 'border-indigo-500 bg-indigo-50/40 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400 shadow-sm font-bold'
                    : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-950 text-zinc-655 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                }`}>
                  <input
                    type="radio"
                    name="qualification"
                    value="Graduate"
                    checked={formData.qualification === 'Graduate'}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <span>Graduate</span>
                </label>
              </div>
            </div>

            {/* Year of Pass Out */}
            <div className="space-y-2">
              <label htmlFor="yearOfPassOut" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-555 dark:text-zinc-400">
                <CalendarDays className="w-4 h-4 text-indigo-500" />
                Year of Pass Out
              </label>
              <input
                id="yearOfPassOut"
                type="text"
                name="yearOfPassOut"
                value={formData.yearOfPassOut}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm bg-zinc-50/50 dark:bg-zinc-950 focus:bg-white dark:focus:bg-zinc-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-zinc-100 placeholder-zinc-400"
                placeholder="e.g. 2024"
              />
            </div>

            {/* Reference */}
            <div className="space-y-2">
              <label htmlFor="reference" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-555 dark:text-zinc-400">
                <UserCheck className="w-4 h-4 text-indigo-500" />
                Reference / Source <span className="text-red-500">*</span>
              </label>
              <input
                id="reference"
                type="text"
                name="reference"
                required
                value={formData.reference}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm bg-zinc-50/50 dark:bg-zinc-950 focus:bg-white dark:focus:bg-zinc-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-zinc-100 placeholder-zinc-400"
                placeholder="e.g. Employee Name, Web Portal, Walk-in"
              />
            </div>

            {/* Position */}
            <div className="space-y-2">
              <label htmlFor="position" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-555 dark:text-zinc-400">
                <Briefcase className="w-4 h-4 text-indigo-500" />
                Position Applied For <span className="text-red-500">*</span>
              </label>
              <input
                id="position"
                type="text"
                name="position"
                required
                value={formData.position}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm bg-zinc-50/50 dark:bg-zinc-950 focus:bg-white dark:focus:bg-zinc-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-zinc-100 placeholder-zinc-400"
                placeholder="e.g. Node.js Developer, Hr Executive"
              />
            </div>

            {/* Purpose */}
            <div className="space-y-2">
              <label htmlFor="purpose" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-555 dark:text-zinc-400">
                <HelpCircle className="w-4 h-4 text-indigo-500" />
                Purpose of Visit
              </label>
              <input
                id="purpose"
                type="text"
                name="purpose"
                value={formData.purpose}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm bg-zinc-50/50 dark:bg-zinc-950 focus:bg-white dark:focus:bg-zinc-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-zinc-100 placeholder-zinc-400"
                placeholder="e.g. Scheduled Interview, General Walk-in"
              />
            </div>

            {/* Photo Copy & Resume Upload containers side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              
              {/* Photo Copy Upload */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-555 dark:text-zinc-400">
                  <Image className="w-4 h-4 text-indigo-500" />
                  Photo Copy / ID Proof
                </label>
                <div className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                  photoCopyFile 
                    ? 'border-emerald-500 bg-emerald-50/5 dark:bg-emerald-950/5' 
                    : photoUploadError 
                      ? 'border-red-500 bg-red-50/5 dark:bg-red-950/5' 
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-indigo-500 hover:bg-indigo-50/5 dark:hover:bg-indigo-950/5'
                }`}>
                  <input
                    type="file"
                    id="photoUpload"
                    className="hidden"
                    accept="image/*"
                    onChange={handlePhotoChange}
                  />
                  <label htmlFor="photoUpload" className="cursor-pointer block">
                    {photoCopyFile ? (
                      <div className="space-y-1">
                        <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto animate-bounce" />
                        <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate max-w-[180px]">{photoCopyFile.name}</p>
                        <p className="text-[10px] text-zinc-400">{(photoCopyFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <UploadCloud className="h-8 w-8 text-zinc-400 mx-auto" />
                        <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Add Photo</p>
                        <p className="text-[10px] text-zinc-450 dark:text-zinc-500">Image up to 10 MB</p>
                      </div>
                    )}
                  </label>
                </div>
                {photoUploadError && <p className="text-xs text-red-500 font-semibold mt-1">{photoUploadError}</p>}
              </div>

              {/* Resume Upload */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-555 dark:text-zinc-400">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  Resume / CV <span className="text-red-500">*</span>
                </label>
                <div className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                  resumeFile 
                    ? 'border-emerald-500 bg-emerald-50/5 dark:bg-emerald-950/5' 
                    : uploadError 
                      ? 'border-red-500 bg-red-50/5 dark:bg-red-950/5' 
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-indigo-500 hover:bg-indigo-50/5 dark:hover:bg-indigo-950/5'
                }`}>
                  <input
                    type="file"
                    id="resumeUpload"
                    className="hidden"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="resumeUpload" className="cursor-pointer block">
                    {resumeFile ? (
                      <div className="space-y-1">
                        <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto animate-bounce" />
                        <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate max-w-[180px]">{resumeFile.name}</p>
                        <p className="text-[10px] text-zinc-400">{(resumeFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <UploadCloud className="h-8 w-8 text-zinc-400 mx-auto" />
                        <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Add Resume</p>
                        <p className="text-[10px] text-zinc-455 dark:text-zinc-500">PDF, DOC, DOCX up to 10 Mb</p>
                      </div>
                    )}
                  </label>
                </div>
                {uploadError && <p className="text-xs text-red-500 font-semibold mt-1">{uploadError}</p>}
              </div>

            </div>

          </div>

          {/* Action Row */}
          <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => {
                setFormData({
                  fullName: '',
                  email: '',
                  phone: '',
                  qualification: '',
                  yearOfPassOut: '',
                  reference: '',
                  position: '',
                  purpose: ''
                });
                setResumeFile(null);
                setPhotoCopyFile(null);
                setUploadError('');
                setPhotoUploadError('');
              }}
              className="px-5 py-3 border border-zinc-200 dark:border-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-550 dark:text-zinc-450 font-bold rounded-2xl text-xs transition-all"
            >
              Clear form
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 disabled:opacity-50 disabled:shadow-none transition-all duration-150"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 text-white" />
                  <span>Submit Application</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

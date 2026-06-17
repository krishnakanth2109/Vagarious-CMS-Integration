import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
// import SubmitRequirement from "./pages/SubmitRequirement";

// Public Pages
import Index from "./pages/Index";
import About from "./pages/About";
import Services from "./pages/Services";
import Employers from "./pages/Employers";
import Candidates from "./pages/Candidates";
import Contact from "./pages/Contact";
import Contract from "./pages/Contract";
import NotFound from "./pages/NotFound";
import ITRecruitment from "./pages/ITRecruitment";
import NonITRecruitment from "./pages/NonITRecruitment";
import StaffingModels from "./pages/StaffingModels";
import SoftwareDevelopment from "./pages/SoftwareDevelopment"; // --- NEW IMPORT ---

// Components
import { Chatbot } from "./components/Chatbot";

// Admin Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import AdminJobs from "./pages/admin/AdminJobs";
import AdminCandidates from "./pages/admin/AdminCandidates";
import AdminITRecruitment from "./pages/admin/AdminITRecruitment";
import AdminEmployerRequirements from "./pages/admin/AdminEmployerRequirements";
import AdminNonITRoles from "./pages/admin/AdminNonITRoles";
import AdminContacts from "./pages/admin/AdminContacts";

const queryClient = new QueryClient();

// --- SCROLL TO TOP COMPONENT ---
// This ensures that whenever the URL changes, the window snaps to the top
// const ScrollToTop = () => {
//   const { pathname } = useLocation();

//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, [pathname]);

//   return null;
// };

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
};

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        {/* Ensures page scrolls to top on route change */}
        <ScrollToTop />
        <Chatbot />

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contract" element={<Contract />} />
          <Route path="/employers" element={<Employers />} />
          <Route path="/candidates" element={<Candidates />} />
          <Route path="/contact" element={<Contact />} />
          {/* <Route path="/submit-requirement" element={<SubmitRequirement />} /> */}

          {/* Specific Service Pages */}
          <Route path="/ITRecruitment" element={<ITRecruitment />} />
          <Route path="/NonITRecruitment" element={<NonITRecruitment />} />
          <Route path="/StaffingModels" element={<StaffingModels />} />
          
          {/* --- NEW ROUTE --- */}
          <Route path="/software-development" element={<SoftwareDevelopment />} />

          {/* Admin Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin-jobs" element={<AdminJobs />} />
          <Route path="/admin-candidates" element={<AdminCandidates />} />
          <Route path="/admin-it-recruitment" element={<AdminITRecruitment />} />
          <Route path="/admin-non-it-roles" element={<AdminNonITRoles />} />
          <Route path="/admin-requirements" element={<AdminEmployerRequirements />} />
          <Route path="/admin-contacts" element={<AdminContacts />} />

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
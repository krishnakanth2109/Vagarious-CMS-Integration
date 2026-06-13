import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { motion } from "framer-motion";
import {
  Users,
  Briefcase,
  TrendingUp,
  Search,
  Filter,
  ChevronDown,
  BarChart3,
} from "lucide-react";
import axios from "axios";
import { format, formatDistanceToNow, startOfWeek } from "date-fns";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// --- Types ---
interface Candidate {
  _id: string;
  name: string;
  email: string;
  phone: string;
  experience: string;
  appliedJob: string;
  skills: string[];
  submittedAt: string;
  preferredLocation?: string;
}

interface Job {
  _id: string;
  title: string;
  company: string;
  postedAt: string;
  isActive: boolean;
}

interface ActivityItem {
  id: string;
  type: 'application' | 'job' | 'message';
  title: string;
  subtitle: string;
  time: string;
  rawDate: Date;
}

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [stats, setStats] = useState({
    totalCandidates: 0,
    activeJobs: 0,
    engagement: 89,  // Mocked for now
  });
  const [chartData, setChartData] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [candidatesRes, jobsRes] = await Promise.all([
        axios.get(`${API_URL}/candidates`),
        axios.get(`${API_URL}/jobs`),
      ]);

      const candidateList = candidatesRes.data;
      const jobList = jobsRes.data;

      // 1. Set Stats
      setStats(prev => ({
        ...prev,
        totalCandidates: candidateList.length,
        activeJobs: jobList.filter((j: Job) => j.isActive).length,
      }));

      // 2. Set Candidates Table Data
      setCandidates(candidateList);

      // 3. Process Chart Data (Candidates per day of current week)
      processChartData(candidateList);

      // 4. Process Activity Feed
      processActivityFeed(candidateList, jobList);

    } catch (error) {
      console.error("Error fetching dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  const processChartData = (data: Candidate[]) => {
    const weeklyCounts = [0, 0, 0, 0, 0, 0, 0];
    const today = new Date();
    const start = startOfWeek(today, { weekStartsOn: 1 }); 

    data.forEach(c => {
      const date = new Date(c.submittedAt);
      const dayDiff = Math.floor((date.getTime() - start.getTime()) / (1000 * 3600 * 24));
      
      if (dayDiff >= 0 && dayDiff <= 6) {
        weeklyCounts[dayDiff]++;
      }
    });

    setChartData(weeklyCounts);
  };

  const processActivityFeed = (cands: Candidate[], jobs: Job[]) => {
    const activities: ActivityItem[] = [];

    // Map Candidates
    cands.forEach(c => {
      activities.push({
        id: c._id,
        type: 'application',
        title: `${c.name} applied for ${c.appliedJob}`,
        subtitle: 'Application received',
        time: formatDistanceToNow(new Date(c.submittedAt), { addSuffix: true }),
        rawDate: new Date(c.submittedAt)
      });
    });

    // Map Jobs
    jobs.forEach(j => {
      activities.push({
        id: j._id,
        type: 'job',
        title: `${j.company} posted new job ${j.title}`,
        subtitle: 'New Opening',
        time: formatDistanceToNow(new Date(j.postedAt), { addSuffix: true }),
        rawDate: new Date(j.postedAt)
      });
    });

    // Sort by newest, take top 6
    const sorted = activities.sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime()).slice(0, 6);
    setRecentActivity(sorted);
  };

  // Filter candidates for table
  const filteredCandidates = candidates.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.appliedJob.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.experience.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#F4F7FE] p-6 font-sans">
        
        {/* --- Top Header --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1B2559] font-display">Overview</h1>
            <p className="text-gray-500 text-sm mt-1">{format(new Date(), "d MMM, yyyy")}</p>
          </div>
          
          <div className="flex items-center gap-3 bg-white p-2 rounded-full shadow-sm px-4">
            {/* Notifications Removed */}
            <div className="w-8 h-8 bg-blue-600 rounded-full text-white flex items-center justify-center font-bold text-sm">
              A
            </div>
          </div>
        </div>

        {/* --- Stats Cards --- */}
        {/* Updated Grid to 3 columns since Placements was removed */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          
          {/* Card 1: Total Candidates (Dark Blue) */}
          <div className="bg-[#4318FF] rounded-2xl p-5 text-white relative overflow-hidden shadow-lg shadow-blue-500/20">
            <div className="flex justify-between items-start z-10 relative">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Candidates</p>
                <h3 className="text-3xl font-bold mt-1">{stats.totalCandidates.toLocaleString()}</h3>
                <div className="flex items-center mt-4 text-xs bg-white/10 w-fit px-2 py-1 rounded-lg">
                  <span className="text-white font-bold mr-1">+12%</span>
                  <span className="text-blue-100">vs last month</span>
                </div>
              </div>
              <div className="p-2 bg-white/20 rounded-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
            </div>
            {/* Decorative circle */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          </div>

          {/* Card 2: Active Jobs */}
          <StatsCard 
            title="Active Jobs" 
            value={stats.activeJobs} 
            percentage="+5%" 
            icon={Briefcase} 
            color="text-[#4318FF]"
            bgIcon="bg-[#F4F7FE]"
          />

          {/* Card 3: Engagement (Placements Removed) */}
          <StatsCard 
            title="Engagement" 
            value={`${stats.engagement}%`} 
            percentage="+2%" 
            icon={TrendingUp} 
            color="text-green-500"
            bgIcon="bg-green-50"
          />
        </div>

        {/* --- Middle Section: Chart & Activity --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          
          {/* Chart Section */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-bold text-[#1B2559]">Recruitment Activity</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-lg cursor-pointer">
                This Week <ChevronDown className="w-4 h-4" />
              </div>
            </div>

            <div className="h-64 flex items-end justify-between px-4 gap-4">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
                const heightPercentage = Math.min((chartData[idx] / (Math.max(...chartData) || 1)) * 100, 100);
                const isMax = chartData[idx] === Math.max(...chartData) && chartData[idx] > 0;
                
                return (
                  <div key={day} className="flex flex-col items-center gap-3 flex-1 h-full justify-end group">
                    <div className="relative w-full h-full flex items-end justify-center">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPercentage}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.1 }}
                        className={`w-3 md:w-8 rounded-t-xl transition-all duration-300 ${isMax ? 'bg-[#4318FF]' : 'bg-[#E9EDF7] group-hover:bg-[#4318FF]/50'}`}
                      >
                         {/* Tooltip */}
                         <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded pointer-events-none transition-opacity">
                            {chartData[idx]}
                         </div>
                      </motion.div>
                    </div>
                    <span className="text-xs font-medium text-gray-400">{day}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-[#1B2559]">Recent Activity</h3>
              <span className="text-sm text-blue-600 font-medium cursor-pointer">see all</span>
            </div>

            <div className="space-y-6">
              {loading ? <p>Loading activity...</p> : recentActivity.map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-blue-600 ring-4 ring-blue-50"></div>
                    {idx !== recentActivity.length - 1 && <div className="w-0.5 h-full bg-gray-100 mt-1"></div>}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1B2559] line-clamp-1">
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{item.time}</p>
                  </div>
                </div>
              ))}
              {recentActivity.length === 0 && <p className="text-gray-400 text-sm">No recent activity</p>}
            </div>
          </div>
        </div>

        {/* --- Recent Applications Table --- */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h3 className="text-lg font-bold text-[#1B2559]">Recent Applications</h3>
            
            <div className="flex gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search name, role, or experience..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#F4F7FE] rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 text-[#1B2559]"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#F4F7FE] text-gray-500 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors">
                <Filter className="w-4 h-4" /> Sort
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider pb-4 pl-4">Candidate Name</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider pb-4">Applied Role</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider pb-4">Experience / Skills</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider pb-4">Location</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider pb-4">Applied Date</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider pb-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-400">Loading candidates...</td></tr>
                ) : filteredCandidates.slice(0, 5).map((candidate) => (
                  <tr key={candidate._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="py-4 pl-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-[#1B2559] text-sm">{candidate.name}</span>
                        <span className="text-xs text-gray-400">{candidate.email}</span>
                        <span className="text-xs text-gray-400">{candidate.phone}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="text-sm font-medium text-blue-600">{candidate.appliedJob}</span>
                    </td>
                    <td className="py-4">
                      <div className="flex flex-col gap-2">
                        <span className="text-xs font-bold text-[#1B2559]">{candidate.experience}</span>
                        <div className="flex gap-1 flex-wrap">
                          {candidate.skills.slice(0, 3).map((skill, i) => (
                            <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded-sm uppercase tracking-wide">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="text-sm text-[#1B2559]">{candidate.preferredLocation || 'Remote / Hybrid'}</span>
                    </td>
                    <td className="py-4">
                      <span className="text-sm font-medium text-[#1B2559]">
                        {format(new Date(candidate.submittedAt), "dd, MMM yyyy").toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-xs font-bold border border-green-100">
                        New
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* View All Candidates Button Removed */}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

// --- Reusable Stats Card Component ---
const StatsCard = ({ title, value, percentage, icon: Icon, color, bgIcon }: any) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-gray-400 text-sm font-medium">{title}</p>
        <h3 className="text-3xl font-bold text-[#1B2559] mt-1">{value}</h3>
      </div>
      <div className={`p-3 rounded-full ${bgIcon}`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
    </div>
    <div className="flex items-center mt-4 text-xs">
      <span className="text-green-500 font-bold mr-1">{percentage}</span>
      <span className="text-gray-400">vs last month</span>
    </div>
  </div>
);

export default Dashboard;
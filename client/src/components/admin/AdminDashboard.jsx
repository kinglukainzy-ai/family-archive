import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
  Users, 
  Image as ImageIcon, 
  Lock, 
  AlertCircle,
  TrendingUp,
  Clock
} from 'lucide-react';

const AdminDashboard = ({ setActiveTab }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/admin/dashboard-stats');
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="animate-pulse">Loading dashboard...</div>;

  const cards = [
    { label: 'Total Members',   value: stats?.personsCount       || 0, icon: Users,       gradient: 'from-primary-600 to-indigo-600', shadow: 'shadow-primary-200' },
    { label: 'Pending Media',   value: stats?.pendingMediaCount  || 0, icon: ImageIcon,   gradient: 'from-primary-500 to-primary-700', shadow: 'shadow-primary-200' },
    { label: 'Locked Profiles', value: stats?.lockedProfilesCount|| 0, icon: Lock,        gradient: 'from-primary-400 to-primary-600', shadow: 'shadow-primary-200' },
    { label: 'Total Accounts',  value: stats?.accountsCount      || 0, icon: AlertCircle, gradient: 'from-indigo-500 to-primary-600',  shadow: 'shadow-indigo-200'  },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Dashboard</h2>
          <p className="mt-1 text-slate-500 font-medium">Welcome back. Monitoring the family heritage.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-2xl shadow-sm text-sm font-bold text-slate-600">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          System Active
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div key={card.label} className="group relative bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-300/50 transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex flex-col gap-6">
              <div className={`w-14 h-14 rounded-2xl text-white bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg ${card.shadow} transform group-hover:rotate-6 transition-transform`}>
                <card.icon className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{card.label}</p>
                <p className="text-4xl font-black text-slate-900 mt-1">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-8 shadow-xl shadow-slate-200/50">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Clock className="w-5 h-5 text-indigo-600" />
              </div>
              Recent Archive Activity
            </h3>
            <button className="text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors">View All</button>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-center py-12 border-2 border-dashed border-slate-100 rounded-2xl">
              <p className="text-sm font-medium text-slate-400 italic">No recent activity detected in the archive logs.</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-3xl p-8 text-slate-900 border border-slate-200 shadow-xl shadow-slate-200/50 relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-xl font-bold flex items-center gap-3 mb-8 text-primary-600">
              <TrendingUp className="w-6 h-6" />
              Quick Controls
            </h3>
            <div className="space-y-4">
              <button 
                onClick={() => setActiveTab('manage')}
                className="w-full p-5 bg-primary-50 hover:bg-primary-100 border border-primary-100 rounded-2xl text-left transition-all group"
              >
                <p className="font-bold text-primary-900 group-hover:translate-x-1 transition-transform">Archive Directory</p>
                <p className="text-xs text-primary-600 mt-1 uppercase tracking-tight font-bold">Manage & Delete Members</p>
              </button>
              <button 
                onClick={() => setActiveTab('relations')}
                className="w-full p-5 bg-primary-50 hover:bg-primary-100 border border-primary-100 rounded-2xl text-left transition-all group"
              >
                <p className="font-bold text-primary-900 group-hover:translate-x-1 transition-transform">Relationship Control</p>
                <p className="text-xs text-primary-600 mt-1 uppercase tracking-tight font-bold">Fix Unions & Child Links</p>
              </button>
              <button className="w-full p-5 bg-primary-50 hover:bg-primary-100 border border-primary-100 rounded-2xl text-left transition-all group">
                <p className="font-bold text-primary-900 group-hover:translate-x-1 transition-transform">Export Archive</p>
                <p className="text-xs text-primary-600 mt-1 uppercase tracking-tight font-bold">Generate Backup</p>
              </button>
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-primary-500/10 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

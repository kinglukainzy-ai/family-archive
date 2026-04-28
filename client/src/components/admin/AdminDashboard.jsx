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

const AdminDashboard = () => {
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
    { label: 'Total Members', value: stats?.totalPersons || 0, icon: Users, color: 'bg-blue-500' },
    { label: 'Pending Media', value: stats?.pendingMedia || 0, icon: ImageIcon, color: 'bg-yellow-500' },
    { label: 'Locked Profiles', value: stats?.lockedProfiles || 0, icon: Lock, color: 'bg-red-500' },
    { label: 'Total Accounts', value: stats?.totalAccounts || 0, icon: AlertCircle, color: 'bg-green-500' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
        <p className="text-gray-500">Welcome back. Here's what's happening with the family archive.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div key={card.label} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl text-white ${card.color}`}>
                <card.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity placeholder */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-500" />
              Recent Updates
            </h3>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-gray-500 italic">No recent activity to show.</p>
          </div>
        </div>

        {/* System Health/Stats placeholder */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Quick Actions
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 bg-gray-50 rounded-xl text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
              Manage Tree
            </button>
            <button className="p-4 bg-gray-50 rounded-xl text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
              Export PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

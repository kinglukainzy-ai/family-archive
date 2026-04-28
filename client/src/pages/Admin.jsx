import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/shared/Navbar';
import AdminDashboard from '../components/admin/AdminDashboard';
import EnrollMember from '../components/admin/EnrollMember';
import MediaApproval from '../components/admin/MediaApproval';
import AccountsManager from '../components/admin/AccountsManager';
import LinkRelationships from '../components/admin/LinkRelationships';
import { 
  UserPlus, 
  GitBranch, 
  CheckSquare, 
  Shield, 
  LayoutDashboard 
} from 'lucide-react';

const Admin = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
            <p className="text-gray-500">You must be an administrator to view this page.</p>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'enroll', label: 'Enroll Member', icon: UserPlus },
    { id: 'relationships', label: 'Relationships', icon: GitBranch },
    { id: 'media', label: 'Media Approval', icon: CheckSquare },
    { id: 'accounts', label: 'Accounts', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all
                      ${activeTab === tab.id
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                        : 'text-gray-600 hover:bg-white hover:text-indigo-600'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            {activeTab === 'dashboard' && <AdminDashboard />}
            {activeTab === 'enroll' && <EnrollMember onSuccess={() => setActiveTab('relationships')} />}
            {activeTab === 'relationships' && <LinkRelationships />}
            {activeTab === 'media' && <MediaApproval />}
            {activeTab === 'accounts' && <AccountsManager />}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Admin;

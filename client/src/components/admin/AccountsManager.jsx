import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import { 
  UserPlus, 
  Key, 
  UserX, 
  UserCheck, 
  Search
} from 'lucide-react';
import Modal from '../shared/Modal';

const AccountsManager = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [unlinkedPersons, setUnlinkedPersons] = useState([]);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    personId: '',
    role: 'MEMBER'
  });

  const fetchAccounts = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/accounts');
      setAccounts(data);
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnlinked = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/unlinked-persons');
      setUnlinkedPersons(data);
    } catch (error) {
      console.error('Failed to fetch unlinked persons:', error);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await fetchAccounts();
    };
    init();
  }, [fetchAccounts]);

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/accounts', formData);
      setIsModalOpen(false);
      setFormData({ username: '', password: '', personId: '', role: 'MEMBER' });
      fetchAccounts();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create account');
    }
  };

  const handleResetPassword = async (id) => {
    const newPassword = window.prompt('Enter new temporary password:');
    if (!newPassword) return;
    try {
      await api.patch(`/admin/accounts/${id}/reset-password`, { newPassword });
      alert('Password reset successfully');
    } catch (error) {
      console.error('Failed to reset password:', error);
      alert('Failed to reset password');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await api.patch(`/admin/accounts/${id}/status`, { isActive: !currentStatus });
      setAccounts(accounts.map(acc => acc.id === id ? { ...acc, isActive: !currentStatus } : acc));
    } catch (error) {
      console.error('Failed to update account status:', error);
      alert('Failed to update account status');
    }
  };

  const filteredAccounts = accounts.filter(acc => 
    acc.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (acc.person?.firstName + ' ' + acc.person?.lastName).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Accounts Manager</h2>
          <p className="text-gray-500">Manage family member access and credentials.</p>
        </div>
        <button
          onClick={() => {
            fetchUnlinked();
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
        >
          <UserPlus className="w-4 h-4" /> Create Account
        </button>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search by username or name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
        />
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-500 italic animate-pulse">Loading accounts...</td></tr>
              ) : filteredAccounts.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-500 italic">No accounts found.</td></tr>
              ) : filteredAccounts.map((account) => (
                <tr key={account.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                          {account.username.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-gray-900">{account.username}</div>
                        <div className="text-xs text-gray-500">
                          {account.person ? `${account.person.firstName} ${account.person.lastName}` : 'System Account'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                      account.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {account.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`flex items-center gap-1 text-xs font-bold ${
                      account.isActive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {account.isActive ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                      {account.isActive ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleResetPassword(account.id)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Reset Password"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(account.id, account.isActive)}
                        className={`p-2 rounded-lg transition-colors ${
                          account.isActive ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                        }`}
                        title={account.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {account.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Account"
      >
        <form onSubmit={handleCreateAccount} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Link to Person</label>
            <select
              value={formData.personId}
              onChange={(e) => setFormData({ ...formData, personId: e.target.value })}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            >
              <option value="">Select a person...</option>
              {unlinkedPersons.map(person => (
                <option key={person.id} value={person.id}>
                  {person.firstName} {person.lastName}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[10px] text-gray-500 italic">Only persons without an existing account are shown.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="e.g., kofimensah"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Temporary Password</label>
            <input
              type="text"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Min 8 characters"
              required
              minLength={8}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-100"
            >
              Create Account
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AccountsManager;

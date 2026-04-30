import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { changePassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      return setError('New passwords do not match');
    }

    if (newPassword.length < 8) {
      return setError('Password must be at least 8 characters long');
    }

    setIsLoading(true);

    try {
      await changePassword(currentPassword, newPassword);
      setSuccess('Password updated successfully! Redirecting...');
      setTimeout(() => navigate('/tree'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full space-y-10 p-10 bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-200 relative overflow-hidden">
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 p-2 text-slate-400 hover:text-primary-600 transition-colors"
          title="Go Back"
        >
          <ArrowLeft size={24} />
        </button>

        <div className="text-center pt-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary-50 text-primary-600 mb-6 shadow-sm">
            <Lock size={40} strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Change Password
          </h2>
          <p className="mt-2 text-slate-500 font-medium">
            For security, please update your temporary credentials.
          </p>
        </div>

        <form className="space-y-8" onSubmit={handleSubmit}>
          {error && (
            <div className="flex items-center gap-3 p-5 text-sm font-bold text-red-700 bg-red-50 border-2 border-red-100 rounded-2xl animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-3 p-5 text-sm font-bold text-green-700 bg-green-50 border-2 border-green-100 rounded-2xl animate-in fade-in slide-in-from-top-2">
              <CheckCircle size={20} />
              <span>{success}</span>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="block w-full px-4 py-4 border-2 border-slate-100 rounded-2xl bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:bg-white transition-all font-medium"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="block w-full px-4 py-4 border-2 border-slate-100 rounded-2xl bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:bg-white transition-all font-medium"
                placeholder="Min. 8 characters"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full px-4 py-4 border-2 border-slate-100 rounded-2xl bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:bg-white transition-all font-medium"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-5 px-6 rounded-2xl text-white bg-primary-600 hover:bg-primary-700 font-black text-lg shadow-xl shadow-primary-200 transition-all transform active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;

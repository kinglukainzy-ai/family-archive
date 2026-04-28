import { useState } from 'react';
import api from '../../api/axios';
import { ArrowRight } from 'lucide-react';

const EnrollMember = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: 'UNKNOWN',
    isLiving: true,
    dateOfBirth: '',
    birthPlace: '',
    isRoot: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post('/persons', formData);
      setShowSuccess(true);
      setTimeout(() => {
        onSuccess();
        setFormData({
          firstName: '',
          lastName: '',
          gender: 'UNKNOWN',
          isLiving: true,
          dateOfBirth: '',
          birthPlace: '',
          isRoot: false
        });
        setShowSuccess(false);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Enrollment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Enroll New Family Member</h2>
        <p className="text-gray-500">Add a new person to the archive. You will link relationships in the next step.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">First Name</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Last Name</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Gender</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
              <option value="UNKNOWN">Unknown</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={formData.isLiving ? 'living' : 'deceased'}
              onChange={(e) => setFormData({ ...formData, isLiving: e.target.value === 'living' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="living">Living</option>
              <option value="deceased">Deceased</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
            <input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Birth Place</label>
            <input
              type="text"
              value={formData.birthPlace}
              onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isRoot"
            checked={formData.isRoot}
            onChange={(e) => setFormData({ ...formData, isRoot: e.target.checked })}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="isRoot" className="text-sm text-gray-700">Set as Root of the Family Tree</label>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}

        <button
          type="submit"
          disabled={loading || showSuccess}
          className={`w-full flex justify-center items-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 shadow-lg transition-all duration-300 ${
            showSuccess 
              ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500 shadow-green-100' 
              : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 shadow-indigo-100'
          }`}
        >
          {loading ? 'Processing...' : showSuccess ? 'Success! Redirecting...' : 'Create Person & Continue'}
          {!loading && !showSuccess && <ArrowRight className="w-5 h-5" />}
        </button>
      </form>
    </div>
  );
};

export default EnrollMember;

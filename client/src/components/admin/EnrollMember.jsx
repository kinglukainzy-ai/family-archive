import { useState } from 'react';
import api from '../../api/axios';
import { ArrowRight, Camera } from 'lucide-react';

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
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/persons', formData);
      const newPerson = response.data;

      // Handle photo upload if exists
      if (profilePhoto) {
        const photoData = new FormData();
        photoData.append('file', profilePhoto);
        await api.patch(`/persons/${newPerson.id}/photo`, photoData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

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
        setProfilePhoto(null);
        setShowSuccess(false);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Enrollment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-4">
      <div className="mb-10 text-center sm:text-left">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Enroll New Family Member</h2>
        <p className="mt-2 text-slate-500 font-medium">Add a new person to the archive. Relationships can be linked in the next step.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-10 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/60">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">First Name</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="block w-full px-4 py-4 bg-white border-2 border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all duration-200 shadow-sm"
              placeholder="e.g. John"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Last Name</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="block w-full px-4 py-4 bg-white border-2 border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all duration-200 shadow-sm"
              placeholder="e.g. Smith"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Gender</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="block w-full px-4 py-4 bg-white border-2 border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all duration-200 shadow-sm appearance-none"
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
              <option value="UNKNOWN">Unknown</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Life Status</label>
            <select
              value={formData.isLiving ? 'living' : 'deceased'}
              onChange={(e) => setFormData({ ...formData, isLiving: e.target.value === 'living' })}
              className="block w-full px-4 py-4 bg-white border-2 border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all duration-200 shadow-sm appearance-none"
            >
              <option value="living">Living</option>
              <option value="deceased">Deceased</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Date of Birth</label>
            <input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              className="block w-full px-4 py-4 bg-white border-2 border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all duration-200 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Birth Place</label>
            <input
              type="text"
              value={formData.birthPlace}
              onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
              className="block w-full px-4 py-4 bg-white border-2 border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all duration-200 shadow-sm"
              placeholder="e.g. London, UK"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Profile Photo (Optional)</label>
            <div className="flex items-center gap-6 p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl group hover:border-primary-400 transition-all cursor-pointer relative overflow-hidden">
              <div className="w-16 h-16 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-primary-600 transition-colors">
                {profilePhoto ? (
                  <img src={URL.createObjectURL(profilePhoto)} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <Camera className="w-8 h-8" />
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700">{profilePhoto ? profilePhoto.name : 'Click to select a photo'}</p>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-tight">JPG, PNG or WEBP (Max 5MB)</p>
              </div>
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => setProfilePhoto(e.target.files[0])}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 p-6 bg-primary-50 rounded-2xl border-2 border-primary-100 transition-colors">
          <input
            type="checkbox"
            id="isRoot"
            checked={formData.isRoot}
            onChange={(e) => setFormData({ ...formData, isRoot: e.target.checked })}
            className="w-6 h-6 rounded-lg border-2 border-primary-300 text-primary-600 focus:ring-primary-500 transition-all cursor-pointer"
          />
          <label htmlFor="isRoot" className="text-base font-bold text-primary-900 cursor-pointer select-none">
            Set as Root of the Family Tree
          </label>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-5 bg-red-50 text-red-700 rounded-2xl border-2 border-red-100 animate-in fade-in slide-in-from-top-2">
            <ArrowRight className="w-5 h-5 rotate-180" />
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || showSuccess}
          className={`w-full flex justify-center items-center gap-3 px-8 py-5 border-none text-xl font-bold rounded-2xl text-white focus:outline-none focus:ring-4 focus:ring-offset-2 disabled:opacity-50 shadow-2xl transition-all duration-300 transform active:scale-[0.98] ${
            showSuccess 
              ? 'bg-green-600 focus:ring-green-500 shadow-green-200' 
              : 'bg-primary-600 focus:ring-primary-500 shadow-primary-200'
          }`}
        >
          {loading ? 'Processing...' : showSuccess ? 'Success! Redirecting...' : 'Create Person & Continue'}
          {!loading && !showSuccess && <ArrowRight className="w-6 h-6" />}
        </button>
      </form>
    </div>
  );
};

export default EnrollMember;

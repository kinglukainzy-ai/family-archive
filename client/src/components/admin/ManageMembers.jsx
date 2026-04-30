import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import Avatar from '../shared/Avatar';
import { 
  Users, 
  Trash2, 
  Crown, 
  Search, 
  AlertCircle,
  CheckCircle2,
  X,
  Camera
} from 'lucide-react';

const ManageMembers = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState(null);

  const fetchMembers = useCallback(async () => {
    try {
      const response = await api.get('/persons?limit=100');
      setMembers(response.data.persons);
    } catch (err) {
      console.error('Failed to fetch members:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const response = await api.get('/persons?limit=100');
        if (mounted) {
          setMembers(response.data.persons);
          setLoading(false);
        }
      } catch (err) {
        console.error('Initial fetch failed:', err);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const handlePhotoUpload = async (personId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      await api.patch(`/persons/${personId}/photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage({ type: 'success', text: 'Profile photo updated.' });
      fetchMembers();
      setTimeout(() => setMessage(null), 3000);
    } catch {
      setMessage({ type: 'error', text: 'Failed to upload photo.' });
    }
  };

  const handleSetRoot = async (personId) => {
    try {
      await api.patch(`/persons/${personId}`, { isRoot: true });
      setMessage({ type: 'success', text: 'New root person established.' });
      fetchMembers();
      setTimeout(() => setMessage(null), 3000);
    } catch {
      setMessage({ type: 'error', text: 'Failed to update root person.' });
    }
  };

  const handleRemoveRoot = async (personId) => {
    try {
      await api.patch(`/persons/${personId}`, { isRoot: false });
      setMessage({ type: 'success', text: 'Root designation removed.' });
      fetchMembers();
      setTimeout(() => setMessage(null), 3000);
    } catch {
      setMessage({ type: 'error', text: 'Failed to remove root designation.' });
    }
  };

  const handleDelete = async (personId, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}? This will remove all their relationships and data permanently.`)) {
      try {
        await api.delete(`/persons/${personId}`);
        setMessage({ type: 'success', text: `${name} has been removed.` });
        fetchMembers();
        setTimeout(() => setMessage(null), 3000);
      } catch {
        setMessage({ type: 'error', text: 'Failed to delete member.' });
      }
    }
  };

  const filteredMembers = members.filter(m => 
    `${m.firstName} ${m.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center p-20">
      <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-primary-600" />
            Manage Members
          </h2>
          <p className="text-slate-500 font-medium mt-1">Review, delete, or designate roots for the archive.</p>
        </div>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search archive members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium"
          />
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-bold">{message.text}</span>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-widest">Member</th>
              <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-widest">Status</th>
              <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredMembers.map((member) => (
              <tr key={member.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <Avatar 
                        name={`${member.firstName} ${member.lastName}`}
                        src={member.profilePhotoUrl}
                        size="md"
                        className={member.isRoot ? 'ring-2 ring-primary-500 ring-offset-2' : ''}
                      />
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-lg leading-tight">
                        {member.firstName} {member.lastName}
                      </p>
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-tight mt-1">
                        {member.gender} • {member.dateOfBirth ? new Date(member.dateOfBirth).getFullYear() : 'Unknown Year'}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  {member.isRoot ? (
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary-100 text-primary-700 rounded-full text-xs font-black uppercase tracking-widest">
                      <Crown className="w-3.5 h-3.5" />
                      Root Person
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-4 py-1.5 bg-slate-100 text-slate-500 rounded-full text-xs font-black uppercase tracking-widest">
                      Member
                    </span>
                  )}
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <label className="p-3 text-slate-500 hover:bg-slate-100 rounded-xl transition-all cursor-pointer" title="Upload Photo">
                      <Camera className="w-5 h-5" />
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => e.target.files[0] && handlePhotoUpload(member.id, e.target.files[0])}
                      />
                    </label>
                    {member.isRoot ? (
                      <button
                        onClick={() => handleRemoveRoot(member.id)}
                        className="p-3 text-amber-500 hover:bg-amber-50 rounded-xl transition-all"
                        title="Remove Root Designation"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSetRoot(member.id)}
                        className="p-3 text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                        title="Set as Root"
                      >
                        <Crown className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(member.id, `${member.firstName} ${member.lastName}`)}
                      className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      title="Delete Member"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredMembers.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-slate-400 font-medium italic">No members found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageMembers;

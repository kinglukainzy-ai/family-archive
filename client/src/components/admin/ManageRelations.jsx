import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import { 
  GitBranch, 
  Trash2, 
  UserMinus, 
  Heart, 
  Baby,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

const ManageRelations = () => {
  const [unions, setUnions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const fetchUnions = useCallback(async () => {
    try {
      const response = await api.get('/unions');
      setUnions(response.data);
    } catch (err) {
      console.error('Failed to fetch unions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const response = await api.get('/unions');
        if (mounted) {
          setUnions(response.data);
          setLoading(false);
        }
      } catch (err) {
        console.error('Initial fetch failed:', err);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const handleDeleteUnion = async (unionId) => {
    if (window.confirm('Are you sure you want to delete this relationship? This will not delete the people, only the link between them.')) {
      try {
        await api.delete(`/unions/${unionId}`);
        setMessage({ type: 'success', text: 'Relationship removed successfully.' });
        fetchUnions();
        setTimeout(() => setMessage(null), 3000);
      } catch {
        setMessage({ type: 'error', text: 'Failed to delete relationship.' });
      }
    }
  };

  const handleRemoveChild = async (unionId, personId, childName) => {
    if (window.confirm(`Are you sure you want to remove ${childName} from this family?`)) {
      try {
        await api.delete(`/unions/${unionId}/children/${personId}`);
        setMessage({ type: 'success', text: 'Child link removed.' });
        fetchUnions();
        setTimeout(() => setMessage(null), 3000);
      } catch {
        setMessage({ type: 'error', text: 'Failed to remove child link.' });
      }
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center p-20">
      <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <GitBranch className="w-8 h-8 text-primary-600" />
          Manage Relationships
        </h2>
        <p className="text-slate-500 font-medium mt-1">Review and correct unions and parent-child links.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-bold">{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {unions.map((union) => (
          <div key={union.id} className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden group hover:border-primary-200 transition-all">
            <div className="p-8">
              <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                {/* Partners */}
                <div className="flex items-center gap-6">
                  <div className="flex -space-x-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary-600 text-white flex items-center justify-center font-black text-xl border-4 border-white shadow-lg">
                      {union.partner1.firstName[0]}
                    </div>
                    {union.partner2 ? (
                      <div className="w-14 h-14 rounded-2xl bg-indigo-500 text-white flex items-center justify-center font-black text-xl border-4 border-white shadow-lg">
                        {union.partner2.firstName[0]}
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center font-black text-xl border-4 border-white border-dashed">
                        ?
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                      {union.partner1.firstName} 
                      <Heart className="w-4 h-4 text-primary-500 fill-primary-500" />
                      {union.partner2 ? union.partner2.firstName : 'Unknown Partner'}
                    </h3>
                    <p className="text-xs font-black text-primary-600 uppercase tracking-[0.2em] mt-1">
                      {union.unionType} Relationship
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => handleDeleteUnion(union.id)}
                  className="px-6 py-2.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Union
                </button>
              </div>

              {/* Children */}
              <div className="mt-8 pt-8 border-t border-slate-50">
                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Baby className="w-4 h-4" />
                  Children ({union.children.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {union.children.map((child) => (
                    <div key={child.person.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-200 transition-all group/child">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-xs font-black text-slate-600">
                          {child.person.firstName[0]}
                        </div>
                        <span className="font-bold text-slate-700">{child.person.firstName} {child.person.lastName}</span>
                      </div>
                      <button 
                        onClick={() => handleRemoveChild(union.id, child.person.id, child.person.firstName)}
                        className="p-2 text-slate-400 hover:text-red-500 opacity-0 group-hover/child:opacity-100 transition-all"
                        title="Remove Child Link"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {union.children.length === 0 && (
                    <p className="text-sm font-medium text-slate-400 italic">No children linked to this union.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {unions.length === 0 && (
          <div className="py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
            <GitBranch className="w-16 h-16 text-slate-100 mx-auto mb-4" />
            <p className="text-slate-400 font-bold italic text-lg">No relationships found in the archive yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageRelations;

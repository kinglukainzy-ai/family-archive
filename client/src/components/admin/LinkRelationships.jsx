import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import { Plus, Trash2, Link as LinkIcon, AlertCircle } from 'lucide-react';

const LinkRelationships = () => {
  const [persons, setPersons] = useState([]);
  const [unions, setUnions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('create-union');

  const fetchData = useCallback(async () => {
    try {
      const [personsRes, unionsRes] = await Promise.all([
        api.get('/persons'),
        api.get('/unions')
      ]);
      setPersons(personsRes.data.persons);
      setUnions(unionsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await fetchData();
    };
    init();
  }, [fetchData]);

  const [unionForm, setUnionForm] = useState({
    partner1Id: '',
    partner2Id: '',
    unionType: 'MARRIED'
  });

  const [childForm, setChildForm] = useState({
    unionId: '',
    personId: '',
    relationshipType: 'BIOLOGICAL'
  });

  const handleCreateUnion = async (e) => {
    e.preventDefault();
    try {
      await api.post('/unions', unionForm);
      setUnionForm({ partner1Id: '', partner2Id: '', unionType: 'MARRIED' });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create union');
    }
  };

  const handleAddChild = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/unions/${childForm.unionId}/children`, {
        personId: childForm.personId,
        relationshipType: childForm.relationshipType
      });
      setChildForm({ unionId: '', personId: '', relationshipType: 'BIOLOGICAL' });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add child');
    }
  };

  const handleDeleteUnion = async (id) => {
    if (!window.confirm('Delete this union? All child links will be removed.')) return;
    try {
      await api.delete(`/unions/${id}`);
      fetchData();
    } catch (error) {
      console.error('Failed to delete union:', error);
      alert('Failed to delete union');
    }
  };

  if (loading) return <div className="animate-pulse">Loading relationship manager...</div>;

  return (
    <div className="space-y-8">
      <div className="flex gap-8 border-b border-slate-100 mb-10">
        <button
          onClick={() => setActiveTab('create-union')}
          className={`pb-5 px-1 text-sm font-black uppercase tracking-widest transition-all ${
            activeTab === 'create-union' ? 'border-b-4 border-primary-600 text-primary-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Manage Unions
        </button>
        <button
          onClick={() => setActiveTab('add-children')}
          className={`pb-5 px-1 text-sm font-black uppercase tracking-widest transition-all ${
            activeTab === 'add-children' ? 'border-b-4 border-primary-600 text-primary-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Link Children
        </button>
      </div>

      {activeTab === 'create-union' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Create Union Form */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-500" />
                Create New Union
              </h3>
              <p className="text-sm text-gray-500">Establish a relationship between two persons.</p>
            </div>

            <form onSubmit={handleCreateUnion} className="space-y-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Partner 1</label>
                <select
                  value={unionForm.partner1Id}
                  onChange={(e) => setUnionForm({ ...unionForm, partner1Id: e.target.value })}
                  className="block w-full px-4 py-4 bg-white border-2 border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all duration-200 shadow-sm appearance-none"
                  required
                >
                  <option value="">Select partner 1...</option>
                  {persons.map(p => (
                    <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Partner 2 (Optional)</label>
                <select
                  value={unionForm.partner2Id}
                  onChange={(e) => setUnionForm({ ...unionForm, partner2Id: e.target.value })}
                  className="block w-full px-4 py-4 bg-white border-2 border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all duration-200 shadow-sm appearance-none"
                >
                  <option value="">Single Parent / Unknown Partner</option>
                  {persons.map(p => (
                    <option key={p.id} value={p.id} disabled={p.id === unionForm.partner1Id}>
                      {p.firstName} {p.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Union Type</label>
                <select
                  value={unionForm.unionType}
                  onChange={(e) => setUnionForm({ ...unionForm, unionType: e.target.value })}
                  className="block w-full px-4 py-4 bg-white border-2 border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all duration-200 shadow-sm appearance-none"
                >
                  <option value="MARRIED">Married</option>
                  <option value="DIVORCED">Divorced</option>
                  <option value="PARTNERSHIP">Partnership</option>
                  <option value="RELATIONSHIP">Relationship</option>
                  <option value="SINGLE_PARENT">Single Parent</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-primary-600 text-white font-bold rounded-2xl shadow-xl shadow-primary-200 hover:bg-primary-700 transform active:scale-[0.99] transition-all duration-300"
              >
                Create Union
              </button>
            </form>
          </div>

          {/* List of Unions */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Existing Unions</h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {unions.map(union => (
                <div key={union.id} className="p-4 bg-white border border-gray-100 rounded-xl flex items-center justify-between hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-indigo-700">
                        {union.partner1.firstName[0]}
                      </div>
                      {union.partner2 ? (
                        <div className="w-8 h-8 rounded-full bg-purple-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-purple-700">
                          {union.partner2.firstName[0]}
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-400">?</div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {union.partner1.firstName} {union.partner2 ? `& ${union.partner2.firstName}` : '(Single)'}
                      </p>
                      <p className="text-[10px] text-gray-500 uppercase font-medium">{union.unionType}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeleteUnion(union.id)}
                    className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Add Child Form */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-indigo-500" />
                Link Child to Union
              </h3>
              <p className="text-sm text-gray-500">Assign a person as a child of an existing union.</p>
            </div>

            <form onSubmit={handleAddChild} className="space-y-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Select Union</label>
                <select
                  value={childForm.unionId}
                  onChange={(e) => setChildForm({ ...childForm, unionId: e.target.value })}
                  className="block w-full px-4 py-4 bg-white border-2 border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all duration-200 shadow-sm appearance-none"
                  required
                >
                  <option value="">Select a union...</option>
                  {unions.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.partner1.firstName} {u.partner1.lastName} {u.partner2 ? `& ${u.partner2.firstName} ${u.partner2.lastName}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Select Child</label>
                <select
                  value={childForm.personId}
                  onChange={(e) => setChildForm({ ...childForm, personId: e.target.value })}
                  className="block w-full px-4 py-4 bg-white border-2 border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all duration-200 shadow-sm appearance-none"
                  required
                >
                  <option value="">Select person...</option>
                  {persons.map(p => (
                    <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Relationship Type</label>
                <select
                  value={childForm.relationshipType}
                  onChange={(e) => setChildForm({ ...childForm, relationshipType: e.target.value })}
                  className="block w-full px-4 py-4 bg-white border-2 border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all duration-200 shadow-sm appearance-none"
                >
                  <option value="BIOLOGICAL">Biological</option>
                  <option value="ADOPTED">Adopted</option>
                  <option value="STEP">Step</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-primary-600 text-white font-bold rounded-2xl shadow-xl shadow-primary-200 hover:bg-primary-700 transform active:scale-[0.99] transition-all duration-300"
              >
                Link Child
              </button>
            </form>
          </div>

          {/* Help/Guide */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 self-start">
            <h4 className="font-black text-primary-600 uppercase tracking-widest flex items-center gap-3 mb-6 text-sm">
              <AlertCircle className="w-5 h-5" />
              Relationship Guide
            </h4>
            <ul className="space-y-6 text-sm text-slate-600 font-medium">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-black text-xs">1</span>
                <span>Children belong to <span className="font-black text-slate-900">unions</span>, not individuals. This ensures the tree knows exactly who both parents are.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-black text-xs">2</span>
                <span>For single parents, create a union with only one partner selected.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-black text-xs">3</span>
                <span>If a person has multiple marriages, create multiple unions and assign children to the correct one.</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default LinkRelationships;

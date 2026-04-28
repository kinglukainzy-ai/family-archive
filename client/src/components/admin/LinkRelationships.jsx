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
      <div className="flex gap-4 border-b border-gray-100">
        <button
          onClick={() => setActiveTab('create-union')}
          className={`pb-4 px-2 text-sm font-bold transition-colors ${
            activeTab === 'create-union' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'
          }`}
        >
          Manage Unions
        </button>
        <button
          onClick={() => setActiveTab('add-children')}
          className={`pb-4 px-2 text-sm font-bold transition-colors ${
            activeTab === 'add-children' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'
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

            <form onSubmit={handleCreateUnion} className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <div>
                <label className="block text-sm font-medium text-gray-700">Partner 1</label>
                <select
                  value={unionForm.partner1Id}
                  onChange={(e) => setUnionForm({ ...unionForm, partner1Id: e.target.value })}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                >
                  <option value="">Select partner 1...</option>
                  {persons.map(p => (
                    <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Partner 2 (Optional)</label>
                <select
                  value={unionForm.partner2Id}
                  onChange={(e) => setUnionForm({ ...unionForm, partner2Id: e.target.value })}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                <label className="block text-sm font-medium text-gray-700">Union Type</label>
                <select
                  value={unionForm.unionType}
                  onChange={(e) => setUnionForm({ ...unionForm, unionType: e.target.value })}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
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

            <form onSubmit={handleAddChild} className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <div>
                <label className="block text-sm font-medium text-gray-700">Select Union</label>
                <select
                  value={childForm.unionId}
                  onChange={(e) => setChildForm({ ...childForm, unionId: e.target.value })}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                <label className="block text-sm font-medium text-gray-700">Select Child</label>
                <select
                  value={childForm.personId}
                  onChange={(e) => setChildForm({ ...childForm, personId: e.target.value })}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                >
                  <option value="">Select person...</option>
                  {persons.map(p => (
                    <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Relationship Type</label>
                <select
                  value={childForm.relationshipType}
                  onChange={(e) => setChildForm({ ...childForm, relationshipType: e.target.value })}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="BIOLOGICAL">Biological</option>
                  <option value="ADOPTED">Adopted</option>
                  <option value="STEP">Step</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
              >
                Link Child
              </button>
            </form>
          </div>

          {/* Help/Guide */}
          <div className="bg-indigo-50 p-8 rounded-2xl border border-indigo-100 self-start">
            <h4 className="font-bold text-indigo-900 flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5" />
              Relationship Guide
            </h4>
            <ul className="space-y-4 text-sm text-indigo-800">
              <li className="flex gap-2">
                <span className="font-bold">1.</span>
                Children belong to <span className="font-bold">unions</span>, not individuals. This ensures the tree knows exactly who both parents are.
              </li>
              <li className="flex gap-2">
                <span className="font-bold">2.</span>
                For single parents, create a union with only one partner selected.
              </li>
              <li className="flex gap-2">
                <span className="font-bold">3.</span>
                If a person has multiple marriages, create multiple unions and assign children to the correct one.
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default LinkRelationships;

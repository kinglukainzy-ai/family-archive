import { useEffect, useState } from 'react';
import api from '../api/axios';
import FamilyTree from '../components/tree/FamilyTree';
import Navbar from '../components/shared/Navbar';
import { AlertCircle } from 'lucide-react';

const Tree = () => {
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTree = async () => {
      try {
        const { data } = await api.get('/tree');
        setTreeData(data.root);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load family tree.');
      } finally {
        setLoading(false);
      }
    };

    fetchTree();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] gap-4">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-gray-600 font-medium">Building your family tree...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 overflow-hidden flex flex-col">
      <Navbar />
      
      <main className="flex-1 relative overflow-auto p-8">
        {error ? (
          <div className="max-w-md mx-auto mt-20 text-center p-8 bg-white rounded-2xl shadow-xl shadow-indigo-100 border border-indigo-50">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Oops!</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-all"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="flex justify-center min-w-max pb-20">
            {treeData && <FamilyTree person={treeData} />}
          </div>
        )}
      </main>
    </div>
  );
};

export default Tree;

import { useEffect, useState } from 'react';
import api from '../api/axios';
import FamilyTree from '../components/tree/FamilyTree';
import Navbar from '../components/shared/Navbar';
import { AlertCircle, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

const Tree = () => {
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [zoom, setZoom] = useState(1);

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

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.2));
  const handleResetZoom = () => setZoom(1);

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
      
      {/* Zoom Controls */}
      {!error && treeData && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 p-2 bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl shadow-2xl shadow-slate-200/50">
          <button 
            onClick={handleZoomOut}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <div className="w-16 text-center text-xs font-bold text-slate-500 tabular-nums">
            {Math.round(zoom * 100)}%
          </div>
          <button 
            onClick={handleZoomIn}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-slate-200 mx-1" />
          <button 
            onClick={handleResetZoom}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            title="Reset Zoom"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      )}

      <main className="flex-1 relative overflow-auto p-8 scrollbar-hide">
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
          <div 
            className="flex justify-center min-w-max pb-40 transition-transform duration-200 ease-out"
            style={{ 
              transform: `scale(${zoom})`,
              transformOrigin: 'top center'
            }}
          >
            {treeData && <FamilyTree person={treeData} />}
          </div>
        )}
      </main>
    </div>
  );
};

export default Tree;

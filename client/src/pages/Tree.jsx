import { useEffect, useState, useRef } from 'react';
import api from '../api/axios';
import FamilyTree from '../components/tree/FamilyTree';
import Navbar from '../components/shared/Navbar';
import { AlertCircle, ZoomIn, ZoomOut, RotateCcw, Crosshair } from 'lucide-react';

const Tree = () => {
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef(null);

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
  
  const centerTree = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        left: (containerRef.current.scrollWidth - containerRef.current.clientWidth) / 2,
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] gap-4">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-slate-600 font-medium animate-pulse">Assembling your heritage...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 overflow-hidden flex flex-col relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      
      <Navbar />
      
      {/* Zoom & Control Panel */}
      {!error && treeData && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 p-2 bg-white/90 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all hover:shadow-[0_20px_60px_rgba(79,70,229,0.15)]">
          <div className="flex items-center gap-1 px-1">
            <button 
              onClick={handleZoomOut}
              className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all active:scale-90"
              title="Zoom Out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <div className="w-14 text-center text-xs font-black text-slate-400 tabular-nums uppercase tracking-tighter">
              {Math.round(zoom * 100)}%
            </div>
            <button 
              onClick={handleZoomIn}
              className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all active:scale-90"
              title="Zoom In"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
          </div>
          
          <div className="w-px h-8 bg-slate-100 mx-1" />
          
          <div className="flex items-center gap-1 px-1">
            <button 
              onClick={centerTree}
              className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all active:scale-90"
              title="Center Tree"
            >
              <Crosshair className="w-5 h-5" />
            </button>
            <button 
              onClick={handleResetZoom}
              className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all active:scale-90"
              title="Reset View"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <main 
        ref={containerRef}
        className="flex-1 relative overflow-auto p-12 scroll-smooth scrollbar-hide z-10"
      >
        {error ? (
          <div className="max-w-md mx-auto mt-20 text-center p-12 bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 border border-indigo-50 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Tree Sync Failed</h2>
            <p className="text-slate-500 font-medium mb-8 leading-relaxed">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all active:scale-95"
            >
              Reconnect Archive
            </button>
          </div>
        ) : (
          <div 
            className="flex justify-center min-w-max pb-60 transition-all duration-300 ease-out"
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

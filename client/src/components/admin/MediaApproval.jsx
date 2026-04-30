import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import { Check, X, Eye, Clock, User, Download, FileText, Play } from 'lucide-react';
import Modal from '../shared/Modal';

const MediaApproval = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewItem, setPreviewItem] = useState(null);

  const fetchPending = useCallback(async () => {
    try {
      const { data } = await api.get('/media/pending');
      setItems([...data.media, ...data.documents]);
    } catch (error) {
      console.error('Failed to fetch pending media:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await fetchPending();
    };
    init();
  }, [fetchPending]);

  const handleApprove = async (id) => {
    try {
      await api.patch(`/media/${id}/approve`);
      setItems(items.filter(item => item.id !== id));
    } catch (error) {
      console.error('Failed to approve media:', error);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Reject and delete this media?')) return;
    try {
      await api.patch(`/media/${id}/reject`);
      setItems(items.filter(item => item.id !== id));
    } catch (error) {
      console.error('Failed to reject media:', error);
    }
  };

  if (loading) return <div className="animate-pulse">Loading pending media...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Media Approval</h2>
        <p className="text-gray-500">Review and approve uploads from family members.</p>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-20 text-center border-2 border-dashed border-slate-100 shadow-xl shadow-slate-200/50">
          <Clock className="w-16 h-16 text-slate-100 mx-auto mb-6" />
          <p className="text-slate-400 font-black italic text-lg tracking-tight">All caught up! No pending media items.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="aspect-video bg-gray-100 relative group">
                {item.type === 'PHOTO' ? (
                  <img 
                    src={`${import.meta.env.VITE_API_URL || ''}${item.url}`} 
                    className="w-full h-full object-cover"
                    alt={item.caption}
                  />
                ) : item.fileUrl ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-indigo-50 text-indigo-600">
                    <FileText className="w-12 h-12" />
                    <span className="text-xs mt-2">{item.fileType?.toUpperCase() || 'DOCUMENT'}</span>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
                    <Play className="w-12 h-12 opacity-50" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button 
                    onClick={() => setPreviewItem(item)}
                    className="p-3 bg-white rounded-full text-gray-900 shadow-xl transform scale-90 group-hover:scale-100 transition-transform"
                  >
                    <Eye className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-4 flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-gray-900 line-clamp-1">{item.caption || 'Untitled upload'}</p>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      For: {item.person.firstName} {item.person.lastName}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded uppercase">
                    {item.type}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex gap-3">
                <button
                  onClick={() => handleApprove(item.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-green-700 shadow-lg shadow-green-100 transition-all transform active:scale-[0.98]"
                >
                  <Check className="w-4 h-4" /> Approve
                </button>
                <button
                  onClick={() => handleReject(item.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-red-100 text-red-600 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-red-50 transition-all transform active:scale-[0.98]"
                >
                  <X className="w-4 h-4" /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewItem && (
        <Modal
          isOpen={!!previewItem}
          onClose={() => setPreviewItem(null)}
          title="Media Preview"
          maxWidth="max-w-4xl"
        >
          <div className="space-y-6">
            <div className="aspect-auto max-h-[60vh] rounded-lg overflow-hidden bg-black flex items-center justify-center">
              {previewItem.type === 'PHOTO' ? (
                <img 
                  src={`${import.meta.env.VITE_API_URL || ''}${previewItem.url}`} 
                  className="max-w-full max-h-full object-contain"
                  alt={previewItem.caption}
                />
              ) : previewItem.fileUrl ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-indigo-50 text-indigo-600">
                  <FileText className="w-24 h-24 mb-4" />
                  <span className="text-lg font-bold">{previewItem.fileType?.toUpperCase() || 'DOCUMENT'}</span>
                  <p className="mt-2 text-sm text-gray-500">Preview not available. Please download to view.</p>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
                  <Play className="w-16 h-16 opacity-50 mb-4" />
                  <p>Video preview not available in this view</p>
                </div>
              )}
            </div>
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-gray-900">{previewItem.caption || 'Untitled upload'}</h4>
                <p className="text-sm text-gray-500">Person: {previewItem.person.firstName} {previewItem.person.lastName}</p>
              </div>
              <a 
                href={`${import.meta.env.VITE_API_URL || ''}${previewItem.url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-indigo-600 font-bold text-sm hover:underline"
              >
                <Download className="w-4 h-4" /> View Full Original
              </a>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MediaApproval;

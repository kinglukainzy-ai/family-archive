import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import { Check, X, Eye, Clock, User, Download } from 'lucide-react';
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
        <div className="bg-gray-50 rounded-xl p-12 text-center border-2 border-dashed border-gray-200">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">All caught up! No pending media items.</p>
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
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
                    <span className="text-xs uppercase tracking-widest opacity-50">Video Preview Placeholder</span>
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

              <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                <button
                  onClick={() => handleApprove(item.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Check className="w-4 h-4" /> Approve
                </button>
                <button
                  onClick={() => handleReject(item.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 text-sm font-bold rounded-lg hover:bg-red-50 transition-colors"
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
              ) : (
                <p className="text-white">Video preview not available in this view</p>
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

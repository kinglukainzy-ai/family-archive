import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import { Plus, Play, Trash2, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Modal from '../shared/Modal';

const MediaGallery = ({ personId, type = 'PHOTO' }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    url: '',
    caption: '',
    file: null,
    type: type === 'PHOTO' ? 'PHOTO' : 'VIDEO_LINK'
  });

  const canEdit = user?.role === 'ADMIN' || user?.person?.id === personId;

  const fetchMedia = useCallback(async () => {
    try {
      const { data } = await api.get(`/media/persons/${personId}`);
      setItems(data.filter(item => {
        if (type === 'PHOTO') return item.type === 'PHOTO';
        return item.type === 'VIDEO_UPLOAD' || item.type === 'VIDEO_LINK';
      }));
    } catch (error) {
      console.error('Failed to fetch media:', error);
    } finally {
      setLoading(false);
    }
  }, [personId, type]);

  useEffect(() => {
    const init = async () => {
      await fetchMedia();
    };
    init();
  }, [fetchMedia]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      if (formData.type === 'PHOTO' || formData.type === 'VIDEO_UPLOAD') {
        const uploadData = new FormData();
        uploadData.append('file', formData.file);
        uploadData.append('caption', formData.caption);
        await api.post(`/media/persons/${personId}/upload`, uploadData);
      } else {
        await api.post(`/media/persons/${personId}/link-video`, {
          url: formData.url,
          caption: formData.caption
        });
      }
      setIsModalOpen(false);
      setFormData({ url: '', caption: '', file: null, type: type === 'PHOTO' ? 'PHOTO' : 'VIDEO_LINK' });
      fetchMedia();
    } catch (error) {
      console.error('Failed to upload media:', error);
      alert(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await api.delete(`/media/${id}`);
      fetchMedia();
    } catch (error) {
      console.error('Failed to delete media:', error);
    }
  };

  if (loading) return <div className="text-gray-500">Loading gallery...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          {type === 'PHOTO' ? 'Photos' : 'Videos'}
        </h3>
        {canEdit && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            <Plus className="w-4 h-4" /> Add {type === 'PHOTO' ? 'Photo' : 'Video'}
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-12 text-center border-2 border-dashed border-gray-200">
          <p className="text-gray-500 italic">No {type.toLowerCase()}s found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div key={item.id} className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {item.type === 'PHOTO' ? (
                <img 
                  src={`${import.meta.env.VITE_API_URL || ''}${item.thumbnailUrl || item.url}`} 
                  alt={item.caption}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
                  <Play className="w-12 h-12 opacity-50" />
                </div>
              )}

              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex flex-col justify-end p-3">
                <div className="flex justify-between items-end md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-xs font-medium truncate flex-1 mr-2">{item.caption || 'No caption'}</p>
                  {canEdit && (
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                {!item.isApproved && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-yellow-400 text-[10px] font-bold text-yellow-900 rounded uppercase flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Pending
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Add ${type === 'PHOTO' ? 'Photo' : 'Video'}`}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {type === 'VIDEO' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="VIDEO_LINK">External Link (YouTube/Vimeo)</option>
                <option value="VIDEO_UPLOAD">Direct Upload (MP4/MOV)</option>
              </select>
            </div>
          )}

          {(formData.type === 'PHOTO' || formData.type === 'VIDEO_UPLOAD') ? (
            <div>
              <label className="block text-sm font-medium text-gray-700">File</label>
              <input
                type="file"
                accept={formData.type === 'PHOTO' ? 'image/*' : 'video/*'}
                onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                required
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700">Video URL</label>
              <input
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Caption</label>
            <input
              type="text"
              value={formData.caption}
              onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50"
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MediaGallery;

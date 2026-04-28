import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import { Plus, FileText, Download, Trash2, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Modal from '../shared/Modal';

const DocumentsSection = ({ personId }) => {
  const { user } = useAuth();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file: null
  });

  const canEdit = user?.role === 'ADMIN' || user?.person?.id === personId;

  const fetchDocs = useCallback(async () => {
    try {
      const { data } = await api.get(`/documents/persons/${personId}`);
      setDocs(data);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  }, [personId]);

  useEffect(() => {
    const init = async () => {
      await fetchDocs();
    };
    init();
  }, [fetchDocs]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      const uploadData = new FormData();
      uploadData.append('file', formData.file);
      uploadData.append('title', formData.title);
      uploadData.append('description', formData.description);
      
      await api.post(`/documents/persons/${personId}`, uploadData);
      
      setIsModalOpen(false);
      setFormData({ title: '', description: '', file: null });
      fetchDocs();
    } catch (error) {
      console.error('Failed to upload document:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await api.delete(`/documents/${id}`);
      fetchDocs();
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  };

  if (loading) return <div className="text-gray-500">Loading documents...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Archive</h3>
        {canEdit && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            <Plus className="w-4 h-4" /> Upload Document
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {docs.length === 0 ? (
          <div className="md:col-span-2 bg-gray-50 rounded-xl p-8 text-center border-2 border-dashed border-gray-200 text-gray-500 italic">
            No documents in the archive.
          </div>
        ) : (
          docs.map((doc) => (
            <div key={doc.id} className="flex items-start gap-4 p-4 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-shadow group">
              <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
                <FileText className="w-6 h-6" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-gray-900 truncate">{doc.title}</h4>
                  {!doc.isApproved && (
                    <span className="flex-shrink-0 px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-bold rounded uppercase flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" /> Pending
                    </span>
                  )}
                </div>
                {doc.description && <p className="text-xs text-gray-500 truncate mt-0.5">{doc.description}</p>}
                <div className="mt-2 flex items-center gap-3">
                  <a 
                    href={`${import.meta.env.VITE_API_URL || ''}${doc.fileUrl}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    <Download className="w-3 h-3" /> Download
                  </a>
                  <span className="text-[10px] text-gray-300 font-mono">{(doc.fileSizeKb / 1024).toFixed(1)} MB</span>
                </div>
              </div>

              {canEdit && (
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-600 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Upload Document"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">File (PDF, JPG, PNG)</label>
            <input
              type="file"
              onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DocumentsSection;

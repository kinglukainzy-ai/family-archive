import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import { format } from 'date-fns';
import { Plus, Trash2, Edit2, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Modal from '../shared/Modal';

const LifeEvents = ({ personId }) => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    eventType: 'OTHER',
    title: '',
    description: '',
    eventDate: '',
    location: ''
  });

  const canEdit = user?.role === 'ADMIN' || user?.person?.id === personId;

  const fetchEvents = useCallback(async () => {
    try {
      const { data } = await api.get(`/events/persons/${personId}`);
      setEvents(data.sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate)));
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  }, [personId]);

  useEffect(() => {
    const init = async () => {
      await fetchEvents();
    };
    init();
  }, [fetchEvents]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await api.patch(`/events/${editingEvent.id}`, formData);
      } else {
        await api.post(`/events/persons/${personId}`, formData);
      }
      setIsModalOpen(false);
      setEditingEvent(null);
      setFormData({
        eventType: 'OTHER',
        title: '',
        description: '',
        eventDate: '',
        location: ''
      });
      fetchEvents();
    } catch (error) {
      console.error('Failed to save event:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await api.delete(`/events/${id}`);
      fetchEvents();
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  };

  const eventTypes = [
    'BIRTH', 'DEATH', 'MARRIAGE', 'DIVORCE', 'MIGRATION', 'EDUCATION', 'CAREER', 'MILITARY', 'AWARD', 'OTHER'
  ];

  if (loading) return <div className="animate-pulse text-gray-500">Loading events...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Timeline</h3>
        {canEdit && (
          <button
            onClick={() => {
              setEditingEvent(null);
              setFormData({ eventType: 'OTHER', title: '', description: '', eventDate: '', location: '' });
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            <Plus className="w-4 h-4" /> Add Event
          </button>
        )}
      </div>

      <div className="relative border-l-2 border-gray-100 ml-3 space-y-8 pb-4">
        {events.length === 0 ? (
          <p className="ml-6 text-gray-500 italic">No life events recorded.</p>
        ) : (
          events.map((event) => (
            <div key={event.id} className="relative ml-6">
              <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-white border-2 border-indigo-500"></div>
              
              <div className="flex justify-between items-start group">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-indigo-600 uppercase tracking-wider">
                      {event.eventType}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="text-sm text-gray-500">
                      {event.eventDate ? format(new Date(event.eventDate), 'MMM d, yyyy') : 'Date unknown'}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900">{event.title}</h4>
                  {event.location && (
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <MapPin className="w-3.5 h-3.5" />
                      {event.location}
                    </div>
                  )}
                  {event.description && (
                    <p className="mt-2 text-gray-600 text-sm leading-relaxed max-w-2xl">
                      {event.description}
                    </p>
                  )}
                </div>

                {canEdit && (
                  <div className="flex gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingEvent(event);
                        setFormData({
                          eventType: event.eventType,
                          title: event.title,
                          description: event.description || '',
                          eventDate: event.eventDate ? event.eventDate.split('T')[0] : '',
                          location: event.location || ''
                        });
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEvent ? 'Edit Life Event' : 'Add Life Event'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Event Type</label>
            <select
              value={formData.eventType}
              onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            >
              {eventTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                value={formData.eventDate}
                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              rows={3}
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
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
            >
              Save Event
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LifeEvents;

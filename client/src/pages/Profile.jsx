import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/shared/Navbar';
import ProfileView from '../components/profile/ProfileView';
import ProfileEdit from '../components/profile/ProfileEdit';
import { Edit3, ArrowLeft } from 'lucide-react';

const Profile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const fetchPerson = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/persons/${id}`);
      setPerson(data);
    } catch (err) {
      setError('Failed to load profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPerson(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [fetchPerson]);

  const canEdit = user?.role === 'ADMIN' || user?.person?.id === id;

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    </div>
  );

  if (error || !person) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900">{error || 'Person not found'}</h2>
        <button 
          onClick={() => window.history.back()}
          className="mt-4 text-indigo-600 hover:text-indigo-500 font-medium flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={() => window.history.back()}
            className="text-gray-600 hover:text-gray-900 font-medium flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Tree
          </button>
          
          {canEdit && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Edit3 className="w-4 h-4" /> Edit Profile
            </button>
          )}
        </div>

        {isEditing ? (
          <ProfileEdit 
            person={person} 
            onCancel={() => setIsEditing(false)} 
            onSave={() => {
              setIsEditing(false);
              fetchPerson();
            }} 
          />
        ) : (
          <ProfileView person={person} />
        )}
      </main>
    </div>
  );
};

export default Profile;

import { useState } from 'react';
import Avatar from '../shared/Avatar';
import LifeEvents from './LifeEvents';
import MediaGallery from './MediaGallery';
import DocumentsSection from './DocumentsSection';
import { Calendar, MapPin, Briefcase, Globe } from 'lucide-react';
import { format } from 'date-fns';

const ProfileView = ({ person }) => {
  const [activeTab, setActiveTab] = useState('biography');

  const tabs = [
    { id: 'biography', label: 'Biography' },
    { id: 'events', label: 'Life Events' },
    { id: 'photos', label: 'Photos' },
    { id: 'videos', label: 'Videos' },
    { id: 'documents', label: 'Documents' },
  ];

  const formatDate = (date) => {
    if (!date) return null;
    return format(new Date(date), 'MMMM d, yyyy');
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <Avatar 
              name={`${person.firstName} ${person.lastName}`} 
              src={person.profilePhotoUrl} 
              size="xl" 
              className="ring-4 ring-white"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {person.firstName} {person.lastName}
                {person.maidenName && <span className="text-gray-400 font-normal ml-2">({person.maidenName})</span>}
              </h1>
              
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {formatDate(person.dateOfBirth) || 'Unknown DOB'} 
                  {person.dateOfDeath && ` — ${formatDate(person.dateOfDeath)}`}
                  {person.isDeceased && <span className="ml-1 text-xs bg-gray-100 px-1.5 py-0.5 rounded italic">Deceased</span>}
                </div>
                {person.birthPlace && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {person.birthPlace}
                  </div>
                )}
                {person.occupation && (
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4" />
                    {person.occupation}
                  </div>
                )}
                {person.nationality && (
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-4 h-4" />
                    {person.nationality}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100">
          <nav className="flex -mb-px px-6 overflow-x-auto" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-8">
          {activeTab === 'biography' && (
            <div className="prose prose-indigo max-w-none">
              {person.biography ? (
                <div dangerouslySetInnerHTML={{ __html: person.biography }} />
              ) : (
                <p className="text-gray-500 italic">No biography available.</p>
              )}
            </div>
          )}

          {activeTab === 'events' && <LifeEvents personId={person.id} />}
          
          {activeTab === 'photos' && <MediaGallery personId={person.id} type="PHOTO" />}
          
          {activeTab === 'videos' && <MediaGallery personId={person.id} type="VIDEO" />}
          
          {activeTab === 'documents' && <DocumentsSection personId={person.id} />}
        </div>
      </div>
    </div>
  );
};

export default ProfileView;

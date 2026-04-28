import { Link } from 'react-router-dom';
import Avatar from '../shared/Avatar';
import { MapPin, Calendar } from 'lucide-react';

const PersonCard = ({ person }) => {
  const birthYear = person.dateOfBirth ? new Date(person.dateOfBirth).getFullYear() : '???';
  const deathYear = person.dateOfDeath ? new Date(person.dateOfDeath).getFullYear() : (person.isDeceased ? '???' : 'Living');

  return (
    <Link 
      to={`/profile/${person.id}`}
      className={`
        relative w-[280px] p-4 bg-white rounded-2xl shadow-sm border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group
        ${person.isDeceased ? 'border-gray-100 opacity-80 grayscale-[0.5]' : 'border-indigo-50 hover:border-indigo-200'}
      `}
    >
      <div className="flex items-center gap-4">
        <Avatar 
          name={`${person.firstName} ${person.lastName}`} 
          src={person.profilePhotoUrl} 
          size="md" 
          className="group-hover:scale-110 transition-transform duration-300"
        />
        <div className="flex-1 min-w-0">
          <h4 className={`font-bold truncate group-hover:text-indigo-600 transition-colors ${person.isDeceased ? 'text-gray-500 italic' : 'text-gray-900'}`}>
            {person.firstName} {person.lastName}
          </h4>
          <div className="flex flex-col gap-0.5 mt-1">
            <div className="flex items-center gap-1 text-[10px] font-medium text-gray-400">
              <Calendar className="w-3 h-3" />
              {birthYear} — {deathYear}
            </div>
            {person.birthPlace && (
              <div className="flex items-center gap-1 text-[10px] font-medium text-gray-400 truncate">
                <MapPin className="w-3 h-3" />
                {person.birthPlace}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Decorative indicator */}
      <div className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full ${person.isDeceased ? 'bg-gray-300' : 'bg-green-400 animate-pulse'}`} />
    </Link>
  );
};

export default PersonCard;

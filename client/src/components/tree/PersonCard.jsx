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
        relative w-[300px] p-5 bg-white rounded-[2rem] shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)] border border-slate-100 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(79,70,229,0.2)] hover:-translate-y-2 group
        ${person.isDeceased ? 'opacity-90 grayscale-[0.3]' : ''}
      `}
    >
      {/* Background Accent */}
      <div className={`absolute inset-0 rounded-[2rem] bg-gradient-to-br opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500 ${person.isDeceased ? 'from-slate-600 to-slate-900' : 'from-indigo-600 to-primary-600'}`} />

      <div className="flex items-center gap-5 relative z-10">
        <div className="relative">
          <Avatar 
            name={`${person.firstName} ${person.lastName}`} 
            src={person.profilePhotoUrl} 
            size="lg" 
            className="ring-4 ring-slate-50 group-hover:ring-indigo-50 transition-all duration-500 group-hover:scale-105"
          />
          {!person.isDeceased && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-4 border-white rounded-full animate-pulse" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className={`text-base font-black truncate tracking-tight transition-colors duration-300 ${person.isDeceased ? 'text-slate-500' : 'text-slate-900 group-hover:text-indigo-600'}`}>
            {person.firstName} {person.lastName}
          </h4>
          
          <div className="flex flex-col gap-1.5 mt-2">
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 group-hover:text-slate-500 transition-colors">
              <div className={`p-1 rounded-md ${person.isDeceased ? 'bg-slate-50' : 'bg-indigo-50 text-indigo-500'}`}>
                <Calendar className="w-3 h-3" />
              </div>
              <span className="tabular-nums">{birthYear} — {deathYear}</span>
            </div>
            
            {person.birthPlace && (
              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 group-hover:text-slate-500 transition-colors truncate">
                <div className={`p-1 rounded-md ${person.isDeceased ? 'bg-slate-50' : 'bg-indigo-50 text-indigo-500'}`}>
                  <MapPin className="w-3 h-3" />
                </div>
                {person.birthPlace}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modern Status Badge */}
      <div className="absolute top-4 right-5">
        {person.isDeceased ? (
          <div className="px-2.5 py-1 bg-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-400 rounded-full border border-slate-100">
            Deceased
          </div>
        ) : (
          <div className="px-2.5 py-1 bg-indigo-50 text-[9px] font-black uppercase tracking-widest text-indigo-600 rounded-full border border-indigo-100/50">
            Active
          </div>
        )}
      </div>
    </Link>
  );
};

export default PersonCard;

import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import Navbar from '../components/shared/Navbar';
import Avatar from '../components/shared/Avatar';
import { Link } from 'react-router-dom';
import { Search as SearchIcon, MapPin, Calendar, ArrowRight } from 'lucide-react';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    birthPlace: '',
    birthDecade: ''
  });

  const handleSearch = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: query,
        birthPlace: filters.birthPlace,
        birthDecade: filters.birthDecade
      });
      const { data } = await api.get(`/search?${params.toString()}`);
      setResults(data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  }, [query, filters]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      handleSearch();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [handleSearch]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Find Family Members</h1>
            <p className="text-lg text-gray-500">Search through the archive by name, place, or decade.</p>
          </div>

          {/* Search Box */}
          <div className="bg-white p-4 rounded-2xl shadow-xl shadow-indigo-100/50 border border-indigo-50 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Enter name, nickname, or biography text..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all text-gray-900 placeholder-gray-400"
              />
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Birthplace..."
                value={filters.birthPlace}
                onChange={(e) => setFilters({ ...filters, birthPlace: e.target.value })}
                className="w-full md:w-40 px-4 py-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
              />
              <select
                value={filters.birthDecade}
                onChange={(e) => setFilters({ ...filters, birthDecade: e.target.value })}
                className="w-full md:w-40 px-4 py-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
              >
                <option value="">Any Decade</option>
                {[1900, 1910, 1920, 1930, 1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020].map(d => (
                  <option key={d} value={d}>{d}s</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-500">No members found matching your search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {results.map((person) => (
                  <Link
                    key={person.id}
                    to={`/profile/${person.id}`}
                    className="group flex items-center gap-6 p-6 bg-white rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100/50 transition-all"
                  >
                    <Avatar 
                      name={`${person.firstName} ${person.lastName}`} 
                      src={person.profilePhotoUrl} 
                      size="lg" 
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {person.firstName} {person.lastName}
                      </h3>
                      <div className="flex flex-wrap gap-4 mt-2">
                        {person.dateOfBirth && (
                          <span className="flex items-center gap-1.5 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            Born {new Date(person.dateOfBirth).getFullYear()}
                          </span>
                        )}
                        {person.birthPlace && (
                          <span className="flex items-center gap-1.5 text-sm text-gray-500">
                            <MapPin className="w-4 h-4" />
                            {person.birthPlace}
                          </span>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-6 h-6 text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Search;

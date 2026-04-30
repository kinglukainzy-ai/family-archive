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
          <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full space-y-2">
              <label className="block text-sm font-bold text-slate-700">Search Name or Bio</label>
              <div className="relative group">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors w-5 h-5" />
                <input
                  type="text"
                  placeholder="e.g. John Smith..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-slate-900 placeholder-slate-400 shadow-sm"
                />
              </div>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <div className="flex-1 md:w-48 space-y-2">
                <label className="block text-sm font-bold text-slate-700">Birthplace</label>
                <input
                  type="text"
                  placeholder="City/Country"
                  value={filters.birthPlace}
                  onChange={(e) => setFilters({ ...filters, birthPlace: e.target.value })}
                  className="w-full px-4 py-4 bg-white border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-slate-900 text-sm shadow-sm"
                />
              </div>
              <div className="flex-1 md:w-40 space-y-2">
                <label className="block text-sm font-bold text-slate-700">Decade</label>
                <select
                  value={filters.birthDecade}
                  onChange={(e) => setFilters({ ...filters, birthDecade: e.target.value })}
                  className="w-full px-4 py-4 bg-white border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-slate-900 text-sm shadow-sm appearance-none"
                >
                  <option value="">Any Decade</option>
                  {[1900, 1910, 1920, 1930, 1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020].map(d => (
                    <option key={d} value={d}>{d}s</option>
                  ))}
                </select>
              </div>
            </div>
            <button 
              onClick={handleSearch}
              className="w-full md:w-auto px-10 py-4 bg-primary-600 text-white font-bold rounded-2xl shadow-xl shadow-primary-200 hover:bg-primary-700 transition-all active:scale-95"
            >
              Search
            </button>
          </div>

          {/* Results */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 shadow-inner">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <SearchIcon className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">No members found</h3>
                <p className="text-slate-500 mt-2 font-medium">Try adjusting your search terms or filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {results.map((person) => (
                  <Link
                    key={person.id}
                    to={`/profile/${person.id}`}
                    className="group flex items-center gap-6 p-8 bg-white rounded-3xl border border-slate-200 hover:border-primary-200 hover:shadow-2xl hover:shadow-primary-100/50 hover:-translate-y-1 transition-all duration-300"
                  >
                    <Avatar 
                      name={`${person.firstName} ${person.lastName}`} 
                      src={person.profilePhotoUrl} 
                      size="lg" 
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-2xl font-black text-slate-900 group-hover:text-primary-600 transition-colors">
                        {person.firstName} {person.lastName}
                      </h3>
                      <div className="flex flex-wrap gap-6 mt-3">
                        {person.dateOfBirth && (
                          <span className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-tight">
                            <Calendar className="w-4 h-4 text-primary-500" />
                            Born {new Date(person.dateOfBirth).getFullYear()}
                          </span>
                        )}
                        {person.birthPlace && (
                          <span className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-tight">
                            <MapPin className="w-4 h-4 text-primary-500" />
                            {person.birthPlace}
                          </span>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-8 h-8 text-slate-200 group-hover:text-primary-500 group-hover:translate-x-2 transition-all duration-300" />
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

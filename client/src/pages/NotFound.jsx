import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';
import Navbar from '../components/shared/Navbar';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center h-[calc(100vh-64px)] px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <span className="text-[12rem] font-black text-indigo-600">404</span>
            </div>
            <AlertCircle className="w-24 h-24 text-indigo-500 mx-auto relative z-10" />
          </div>
          
          <div className="space-y-2 relative z-10">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Page Not Found</h1>
            <p className="text-gray-500 text-lg">
              The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
          </div>

          <Link
            to="/tree"
            className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all"
          >
            <Home className="w-5 h-5" />
            Back to Family Tree
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

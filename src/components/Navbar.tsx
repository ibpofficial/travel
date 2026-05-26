import { Compass, Palmtree, Sun, Moon, Heart, Calendar } from "lucide-react";

interface NavbarProps {
  activeTab: 'explore' | 'planner' | 'itinerary' | 'saved';
  onNavigate: (tab: 'explore' | 'planner' | 'itinerary' | 'saved') => void;
  savedCount: number;
}

export default function Navbar({ activeTab, onNavigate, savedCount }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <button 
            onClick={() => onNavigate('explore')}
            className="flex items-center space-x-2.5 transition group cursor-pointer"
          >
            <div className="h-10 w-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-500/10 group-hover:scale-105 transition-transform duration-300">
              <Compass className="h-5 w-5 animate-spin-slow" />
            </div>
            <div className="text-left">
              <span className="block text-lg font-bold font-display text-gray-900 tracking-tight leading-none">
                AeroPlan
              </span>
              <span className="block text-xs font-mono text-brand-600 font-semibold tracking-wider uppercase">
                AI Travel Agent
              </span>
            </div>
          </button>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1 sm:space-x-4">
            <button
              id="nav-explore-btn"
              onClick={() => onNavigate('explore')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition duration-200 cursor-pointer ${
                activeTab === 'explore'
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center space-x-1.5">
                <Compass className="h-4 w-4" />
                <span>Explore Packages</span>
              </span>
            </button>

            <button
              id="nav-planner-btn"
              onClick={() => onNavigate('planner')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition duration-200 cursor-pointer ${
                activeTab === 'planner'
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center space-x-1.5">
                <Calendar className="h-4 w-4" />
                <span>AI Planner</span>
              </span>
            </button>

            <button
              id="nav-saved-btn"
              onClick={() => onNavigate('saved')}
              className={`px-3 py-2 rounded-lg text-sm font-medium relative transition duration-200 cursor-pointer ${
                activeTab === 'saved'
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center space-x-1.5">
                <Heart className="h-4 w-4 text-rose-500 fill-rose-500" />
                <span>My Trips</span>
                {savedCount > 0 && (
                  <span className="absolute -top-1.5 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                    {savedCount}
                  </span>
                )}
              </span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

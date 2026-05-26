import { useState, useEffect } from "react";
import { Itinerary, TripPreference } from "./types";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ExploreHome from "./components/ExploreHome";
import MultiStepPlanner from "./components/MultiStepPlanner";
import ItineraryViewer from "./components/ItineraryViewer";
import ChatbotPanel from "./components/ChatbotPanel";
import { Compass, Sparkles, Heart, Trash2, ArrowRight, Plane, Calendar, HelpCircle, MessageCircle } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<'explore' | 'planner' | 'itinerary' | 'saved'>('explore');
  const [selectedItinerary, setSelectedItinerary] = useState<Itinerary | null>(null);
  const [savedItineraries, setSavedItineraries] = useState<Itinerary[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved trips from LocalStorage on mount
  useEffect(() => {
    try {
      const persisted = localStorage.getItem("aeroplan_trips");
      if (persisted) {
        setSavedItineraries(JSON.parse(persisted));
      }
    } catch (e) {
      console.error("Local Storage is inaccessible in the preview sandbox:", e);
    }
  }, []);

  // Sync saved trips back
  function saveToLocalStorage(updated: Itinerary[]) {
    try {
      localStorage.setItem("aeroplan_trips", JSON.stringify(updated));
    } catch (e) {
      console.error("Failed persisting state inside iframe sandbox:", e);
    }
  }

  // Handle active generation of a custom itinerary
  async function handleGenerateItinerary(prefs: TripPreference) {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Itinerary synthesis engine timed out. Please try again.");
      }

      const data = await res.json();
      setSelectedItinerary(data);
      setActiveTab('itinerary');
      setChatOpen(true); // Proactively launch chat modifier on successful built
    } catch (err: any) {
      setError(err.message);
      alert(`Synthesis Error: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  }

  // Select pre-designed blueprint
  function handleSelectCurated(itinerary: Itinerary) {
    setSelectedItinerary(itinerary);
    setActiveTab('itinerary');
    setChatOpen(true);
  }

  // Save current trip to saved list
  function handleSaveTrip() {
    if (!selectedItinerary) return;
    const exists = savedItineraries.some(item => item.id === selectedItinerary.id);
    if (exists) return;

    const updated = [selectedItinerary, ...savedItineraries];
    setSavedItineraries(updated);
    saveToLocalStorage(updated);
  }

  function handleDeleteSaved(id: string) {
    const updated = savedItineraries.filter(item => item.id !== id);
    setSavedItineraries(updated);
    saveToLocalStorage(updated);
  }

  const isCurrentSaved = selectedItinerary 
    ? savedItineraries.some(item => item.id === selectedItinerary.id)
    : false;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar 
        activeTab={activeTab} 
        onNavigate={(tab) => {
          setError(null);
          setActiveTab(tab);
        }}
        savedCount={savedItineraries.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Active Router views */}
        {activeTab === 'explore' && (
          <ExploreHome 
            onSelectPackage={handleSelectCurated}
            onStartPlanner={() => setActiveTab('planner')}
          />
        )}

        {activeTab === 'planner' && (
          <MultiStepPlanner 
            onGenerate={handleGenerateItinerary}
            isLoading={isGenerating}
          />
        )}

        {activeTab === 'itinerary' && (
          selectedItinerary ? (
            <ItineraryViewer 
              itinerary={selectedItinerary}
              onSave={handleSaveTrip}
              isSaved={isCurrentSaved}
            />
          ) : (
            <div className="py-24 text-center max-w-md mx-auto space-y-4">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Compass className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-bold font-display text-gray-900">No active travel loaded yet</h2>
              <p className="text-xs text-slate-500 leading-normal">
                Load a pre-designed blueprint on the home exploration board or start the custom multi-step AI planner.
              </p>
              <button
                onClick={() => setActiveTab('explore')}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-semibold hover:bg-brand-500 cursor-pointer transition"
              >
                <span>Browse Blueprint Packages</span>
              </button>
            </div>
          )
        )}

        {activeTab === 'saved' && (
          <div className="space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-brand-600 uppercase tracking-widest block">My saved files</span>
              <h1 className="text-2xl font-bold font-display text-gray-900 tracking-tight">Your Saved Travel Blueprints ({savedItineraries.length})</h1>
            </div>

            {savedItineraries.length === 0 ? (
              <div className="py-20 text-center bg-white border border-gray-100 rounded-3xl p-8 max-w-md mx-auto space-y-4">
                <div className="h-12 w-12 rounded-full bg-rose-50 flex items-center justify-center mx-auto text-rose-500">
                  <Heart className="h-6 w-6" />
                </div>
                <h3 className="text-md font-bold text-gray-900 font-display">No saved trips</h3>
                <p className="text-xs text-slate-500 leading-normal">
                  Trips you customize or load on the explorer can be bookmarked here for live consulting or offline packaging anytime.
                </p>
                <button
                  onClick={() => setActiveTab('explore')}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition cursor-pointer"
                >
                  Start Exploring
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {savedItineraries.map((iti) => (
                  <div 
                    key={iti.id}
                    className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition flex flex-col justify-between"
                  >
                    <div className="p-6 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold font-display text-base text-gray-900 leading-tight">{iti.destination}</h3>
                          <span className="text-[10px] font-mono text-gray-400">Saved {new Date(iti.createdAt).toLocaleDateString()}</span>
                        </div>
                        <button 
                          onClick={() => handleDeleteSaved(iti.id)}
                          className="text-gray-400 hover:text-rose-500 cursor-pointer p-1 rounded transition"
                          title="Delete saved"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs font-mono text-gray-500 border-t border-b border-gray-50 py-3">
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{iti.duration} Days</span>
                        </span>
                        <span className="text-right font-extrabold text-gray-900">
                          ₹{iti.totalEstimatedCost.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-wider block">Hotels</span>
                        <p className="text-[11px] text-gray-600 line-clamp-1">
                          {iti.hotelRecommendations.map(h => h.name).join(' & ')}
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-50 border-t border-gray-50 p-4">
                      <button
                        onClick={() => handleSelectCurated(iti)}
                        className="w-full py-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center space-x-1 transition cursor-pointer"
                      >
                        <span>Consult Live Itinerary</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Chat Co-Pilot trigger */}
      {selectedItinerary && (
        <div className="fixed bottom-6 right-6 z-30">
          {!chatOpen && (
            <button
              id="floating-chat-trigger"
              onClick={() => setChatOpen(true)}
              className="h-14 w-14 bg-brand-600 hover:bg-brand-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-brand-500/25 transition-transform hover:scale-110 cursor-pointer border-2 border-white"
              title="Open Travel AI Assistant"
            >
              <MessageCircle className="h-6 w-6 animate-pulse" />
            </button>
          )}
        </div>
      )}

      {/* Embedded co-pilot sidebar chat */}
      <ChatbotPanel 
        currentItinerary={selectedItinerary}
        onUpdateItinerary={(iti) => setSelectedItinerary(iti)}
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
      />

      <Footer />
    </div>
  );
}

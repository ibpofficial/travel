import { useEffect, useState } from "react";
import { Itinerary } from "../types";
import { getApiUrl } from "../lib/api";
import { Compass, Sparkles, MapPin, Calendar, DollarSign, ArrowRight, Flame, Map, CloudSun } from "lucide-react";

interface ExploreHomeProps {
  onSelectPackage: (itinerary: Itinerary) => void;
  onStartPlanner: () => void;
}

export default function ExploreHome({ onSelectPackage, onStartPlanner }: ExploreHomeProps) {
  const [packages, setPackages] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPackages() {
      try {
        const res = await fetch(getApiUrl("/api/curated-packages"));
        if (!res.ok) throw new Error("Could not load curated packages");
        const data = await res.json();
        setPackages(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPackages();
  }, []);

  const seasonalDestinations = [
    { name: "Kyoto, Japan", tag: "Autumn Splendor", reason: "Enjoy beautiful crimson forests in cool 18°C temperature." },
    { name: "Svalbard, Norway", tag: "Polar Nights", reason: "Immersive dark sky gazing for high-activity aurora lights." },
    { name: "Cape Town, South Africa", tag: "Active Coastlines", reason: "Enjoy mild spring weather perfect for hiking and wine tours." }
  ];

  const hiddenGems = [
    { name: "Alberobello, Italy", type: "Fairy-tale architecture", text: "Stunning trulli limestone cabins with conical stone roofs." },
    { name: "Goreme, Turkey", type: "Cave dwellers & Hot-air balloons", text: "Volcanic landscape carved into deep cave suites looking over hot air balloons." },
    { name: "Jiuzhaigou, China", type: "Multi-colored lake terraces", text: "Spectacular travertine pools fed by pristine crystal waterfalls." }
  ];

  return (
    <div className="space-y-16 py-8">
      {/* 1. Hero Spotlight Section */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 text-white px-6 py-16 sm:px-12 sm:py-24 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(20,184,166,0.15),transparent_50%)]"></div>
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
          <div className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-teal-500 to-emerald-500 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
        </div>

        <div className="relative max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center space-x-2 bg-brand-500/10 border border-brand-500/20 px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold text-brand-400 tracking-wider uppercase">
            <Sparkles className="h-3.5 w-3.5 animate-pulse text-brand-400" />
            <span>Smart Travel Planning Assistant</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold font-display tracking-tight leading-none text-white">
            Beautiful Travel Plans, Made in Seconds!
          </h1>

          <p className="text-base sm:text-xl text-slate-300 leading-relaxed font-sans max-w-2xl mx-auto">
            Get your dream trip plan with accurate hotel prices, top local restaurants, handy packing checklists, safety tips, and fully customized hour-by-hour sightseeing tours.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              id="start-planner-btn"
              onClick={onStartPlanner}
              className="w-full sm:w-auto px-8 py-4 bg-brand-600 hover:bg-brand-500 font-medium rounded-xl text-white shadow-lg shadow-brand-500/25 transition duration-300 flex items-center justify-center space-x-2' cursor-pointer"
            >
              <span>Build My Custom Trip</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </button>
            <a
              href="#packages-section"
              className="w-full sm:w-auto px-6 py-4 bg-slate-900/80 hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-800 rounded-xl font-medium transition duration-300 text-center"
            >
              View Packages
            </a>
          </div>
        </div>
      </section>

      {/* 2. Curated & Pre-designed Packages Section */}
      <section id="packages-section" className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-600">Ready Packages</span>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-gray-900 tracking-tight">
              Top Ready-made Trip Packages
            </h2>
          </div>
          <p className="text-sm text-gray-500 max-w-md">
            Load beautiful, hand-picked trip plans instantly and modify them easily using our travel chat assistant!
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-96 bg-gray-100 rounded-2xl border border-gray-100"></div>
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-rose-50 border border-rose-100 rounded-2xl text-rose-700">
            <p className="text-sm font-semibold">Error retrieving curated packages: {error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-rose-600 text-white text-xs font-medium rounded-lg"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <div 
                key={pkg.id} 
                className="group flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl hover:border-brand-500/20 transition-all duration-300"
              >
                {/* Header Accents */}
                <div className="relative h-48 bg-slate-900 flex flex-col justify-end p-6 text-white overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent"></div>
                  {/* Subtle vector background mimicking location */}
                  <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full flex items-center space-x-1.5 text-xs text-brand-300 border border-white/10">
                    <CloudSun className="h-3.5 w-3.5" />
                    <span>{pkg.weatherForecast.temp}</span>
                  </div>

                  <div className="relative space-y-1">
                    <div className="flex items-center space-x-1 text-xs font-mono text-brand-400 font-semibold tracking-wider uppercase">
                      <MapPin className="h-3 w-3" />
                      <span>{pkg.preferences.pace} pacing</span>
                    </div>
                    <h3 className="text-xl font-bold font-display text-white">{pkg.destination}</h3>
                  </div>
                </div>

                {/* Info List */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs text-gray-500 pb-3 border-b border-gray-50">
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        <span>{pkg.duration} Days</span>
                      </span>
                      <span className="flex items-center space-x-1 font-mono font-semibold text-gray-900 text-sm">
                        <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                        <span>{pkg.totalEstimatedCost} Base</span>
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block">Highlighted Interests</span>
                      <div className="flex flex-wrap gap-1">
                        {pkg.preferences.activityInterests.map((interest) => (
                          <span key={interest} className="text-[11px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded-full capitalize">
                            #{interest}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block">Recommended Stays</span>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {pkg.hotelRecommendations.map(h => h.name).join(' & ')}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectPackage(pkg)}
                    className="w-full py-3 bg-gray-50 hover:bg-brand-600 text-gray-700 hover:text-white font-medium text-xs rounded-xl transition duration-200 flex items-center justify-center space-x-2 cursor-pointer border border-gray-100 hover:border-brand-600"
                  >
                    <span>Activate This Blueprint</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. Seasonal Weather Recommendations & Hidden Gems - Bento Row */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Seasonal Tips */}
        <div className="bg-slate-50 border border-gray-100 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                <Flame className="h-4 w-4" />
              </div>
              <h3 className="text-lg font-bold font-display text-gray-900">Seasonal Travel Guidance</h3>
            </div>
            <span className="text-[10px] font-mono bg-orange-100 text-orange-800 px-2 py-0.5 rounded">May Highlights</span>
          </div>

          <p className="text-sm text-gray-600">
            AeroPlan actively tracks current temperature projections to curate seasonal routes that dodge monsoon seasons and peak crowd surges.
          </p>

          <div className="space-y-4">
            {seasonalDestinations.map((dest, i) => (
              <div key={i} className="flex gap-4 p-4 bg-white rounded-xl border border-gray-100">
                <div className="h-8 w-8 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 text-xs font-mono font-bold shrink-0">
                  {i + 1}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-xs text-gray-900">{dest.name}</span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded font-mono font-semibold">{dest.tag}</span>
                  </div>
                  <p className="text-xs text-gray-500">{dest.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hidden Gems Column */}
        <div className="bg-slate-50 border border-gray-100 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-brand-100 rounded-lg text-brand-600">
                <Compass className="h-4 w-4" />
              </div>
              <h3 className="text-lg font-bold font-display text-gray-900">Unsolicited Offbeat Discoveries</h3>
            </div>
          </div>

          <p className="text-sm text-gray-600">
            Curious travel plans are enhanced with obscure heritage sites and locally supported, micro-businesses neglected by standard engines.
          </p>

          <div className="space-y-4">
            {hiddenGems.map((gem, i) => (
              <div key={i} className="space-y-1 p-4 bg-white rounded-xl border border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-gray-900">{gem.name}</span>
                  <span className="text-[10px] text-gray-400 italic">{gem.type}</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{gem.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

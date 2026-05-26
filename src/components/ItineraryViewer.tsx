import { useState } from "react";
import { Itinerary, CostBreakdown, DailySchedule, ActivityItem } from "../types";
import { 
  Compass, Calendar, IndianRupee, CloudSun, MapPin, 
  Bed, Utensils, Shield, Users, Clock, AlertCircle, 
  Map, Download, Layers, TrendingUp, Sparkles, AlertTriangle, 
  ChevronRight, ArrowRight, UserCheck, CheckSquare, Footprints
} from "lucide-react";
import ExpenseTracker from "./ExpenseTracker";

function ensureArray<T>(val: any): T[] {
  if (Array.isArray(val)) return val;
  if (!val) return [];
  if (typeof val === 'string') {
    return val.split(',').map((s: string) => s.trim()).filter(Boolean) as any;
  }
  return [val];
}

function formatCost(val: number): string {
  return "₹ " + Math.round(val).toLocaleString('en-IN');
}

function getHotelImage(hotel: any): string {
  if (hotel.imageUrl && hotel.imageUrl.startsWith("http")) return hotel.imageUrl;
  const name = (hotel.name || "").toLowerCase();
  if (name.includes("backpack") || name.includes("hostel") || name.includes("zostel")) {
    return "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=600&auto=format&fit=crop";
  }
  if (name.includes("resort") || name.includes("beach") || name.includes("sea") || name.includes("horizon")) {
    return "https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=600&auto=format&fit=crop";
  }
  if (name.includes("villa") || name.includes("private") || name.includes("palace") || name.includes("grand")) {
    return "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=600&auto=format&fit=crop";
  }
  return "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600&auto=format&fit=crop";
}

function getRestaurantImage(rest: any): string {
  if (rest.imageUrl && rest.imageUrl.startsWith("http")) return rest.imageUrl;
  const cuisine = (rest.cuisine || "").toLowerCase();
  const name = (rest.name || "").toLowerCase();
  if (cuisine.includes("veg") || cuisine.includes("jain") || name.includes("jain") || name.includes("pure veg") || name.includes("bhojanalaya")) {
    return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop";
  }
  if (cuisine.includes("chaat") || cuisine.includes("street") || name.includes("chaat") || name.includes("lane")) {
    return "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?q=80&w=600&auto=format&fit=crop";
  }
  if (cuisine.includes("biryani") || cuisine.includes("mughlai") || cuisine.includes("chicken") || name.includes("biryani") || name.includes("palace")) {
    return "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop";
  }
  return "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600&auto=format&fit=crop";
}

interface ItineraryViewerProps {
  itinerary: Itinerary;
  onSave: () => void;
  isSaved: boolean;
}

export default function ItineraryViewer({ itinerary, onSave, isSaved }: ItineraryViewerProps) {
  const [activeDay, setActiveDay] = useState<number>(1);
  const [costComparisonMode, setCostComparisonMode] = useState<'current' | 'budget' | 'luxury'>('current');

  // Dynamically generate comparable configurations based on core metrics
  const duration = itinerary.duration;
  const travelers = itinerary.preferences?.travelersCount || 1;

  // Generate Budget / Luxury versions for comparisons
  const originalCost = itinerary.totalEstimatedCost;
  const originalBreakdown = itinerary.costBreakdown;

  const budgetBreakdown: CostBreakdown = {
    transport: Math.round(originalBreakdown.transport * 0.5),
    accommodation: Math.round(originalBreakdown.accommodation * 0.45),
    food: Math.round(originalBreakdown.food * 0.55),
    activities: Math.round(originalBreakdown.activities * 0.6),
    misc: Math.round(originalBreakdown.misc * 0.5)
  };
  const budgetTotal = Object.values(budgetBreakdown).reduce((a, b) => a + b, 0);

  const luxuryBreakdown: CostBreakdown = {
    transport: Math.round(originalBreakdown.transport * 1.95),
    accommodation: Math.round(originalBreakdown.accommodation * 2.3),
    food: Math.round(originalBreakdown.food * 1.8),
    activities: Math.round(originalBreakdown.activities * 1.7),
    misc: Math.round(originalBreakdown.misc * 1.6)
  };
  const luxuryTotal = Object.values(luxuryBreakdown).reduce((a, b) => a + b, 0);

  // Selector mappings
  const activeBreakdown = costComparisonMode === 'current' 
    ? originalBreakdown 
    : costComparisonMode === 'budget' ? budgetBreakdown : luxuryBreakdown;

  const activeTotal = costComparisonMode === 'current' 
    ? originalCost 
    : costComparisonMode === 'budget' ? budgetTotal : luxuryTotal;

  // Activity Icon mapper
  function getActivityIcon(category: ActivityItem["category"]) {
    switch (category) {
      case "transport":
        return <Compass className="h-4 w-4 text-sky-500" />;
      case "accommodation":
        return <Bed className="h-4 w-4 text-indigo-500" />;
      case "food":
        return <Utensils className="h-4 w-4 text-orange-500" />;
      case "activity":
        return <Sparkles className="h-4 w-4 text-brand-600" />;
      default:
        return <MapPin className="h-4 w-4 text-gray-500" />;
    }
  }

  // Trigger Offline Text download
  function triggerOfflineDownload() {
    const textData = `
=========================================
AEROPLAN OFFLINE ITINERARY: ${itinerary.destination.toUpperCase()}
=========================================
Departure Point (Origin): ${itinerary.preferences?.origin || "Not Specified"}
Travel Scope & Type: ${itinerary.preferences?.tripType ? itinerary.preferences.tripType.toUpperCase() : "INTERNATIONAL"}
Duration: ${itinerary.duration} Days
Travelers: ${travelers} Traveler(s)
Total Cost Estimations: ₹ ${activeTotal.toLocaleString('en-IN')} INR

ESTIMATED COST BREAKDOWN (INR):
- Transport: ₹ ${activeBreakdown.transport.toLocaleString('en-IN')}
- Accommodation: ₹ ${activeBreakdown.accommodation.toLocaleString('en-IN')}
- Food: ₹ ${activeBreakdown.food.toLocaleString('en-IN')}
- Activities: ₹ ${activeBreakdown.activities.toLocaleString('en-IN')}
- Miscellaneous: ₹ ${activeBreakdown.misc.toLocaleString('en-IN')}

WEATHER ADVISORY:
Temperature: ${itinerary.weatherForecast.temp}
Condition: ${itinerary.weatherForecast.condition}
Detail: ${itinerary.weatherForecast.description}

PACKING GUIDELINES:
${ensureArray<string>(itinerary.packingList).map(item => `* [ ] ${item}`).join('\n')}

SAFE AREAS HIGHLIGHTS:
${ensureArray<string>(itinerary.safeAreas).join(', ')}

=========================================
DAILY PROGRAM TIMELINE
=========================================
${ensureArray<DailySchedule>(itinerary.dailySchedule).map(sched => `
-----------------------------------------
DAY ${sched.day}: ${sched.theme}
-----------------------------------------
${ensureArray<ActivityItem>(sched.activities).map(act => `
[${act.time}] - ${act.title}
Location: ${act.location}
Duration: ${act.duration} | Cost: ₹ ${act.cost.toLocaleString('en-IN')}
Description: ${act.description}
${act.tip ? `*Tip: ${act.tip}` : ''}
`).join('\n')}
`).join('\n')}

=========================================
Safe & secured travels with AeroPlan AI.
    `;

    const blob = new Blob([textData], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Aeroplan-${itinerary.destination.replace(/[\s,]+/g, '-')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const safeDailySchedule = ensureArray<DailySchedule>(itinerary.dailySchedule);
  const selectedSchedule = safeDailySchedule.find(s => s.day === activeDay) || safeDailySchedule[0] || { day: 1, theme: "Explore Day", activities: [] };

  return (
    <div className="space-y-12 py-6">
      {/* 0. API KEY WARNING RIBBON */}
      {itinerary.apiKeyExpired && (
        <div className="rounded-3xl bg-gradient-to-r from-amber-50/80 to-orange-50/80 border border-amber-200/70 p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-start gap-4 md:gap-5">
          <div className="h-10 w-10 shrink-0 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="space-y-1 md:flex-1">
            <h3 className="font-bold text-sm text-amber-950 font-display">AeroPlan Offline Synthesis Engaged (Key Expired)</h3>
            <p className="text-xs text-amber-900 leading-relaxed font-sans">
              We detected that the active model API key has expired. To keep your experience seamless, our offline-synthesis engine has dynamically generated a calibrated <strong>{itinerary.duration}-day Indian traveler itinerary</strong> matching your preferences, cuisine, and manual budget limit of <strong>{formatCost(itinerary.totalEstimatedCost)}</strong> perfectly in Indian Rupees using local templates.
            </p>
            <p className="text-xs text-amber-800/80 pt-1 font-mono">
              💡 To restore fully creative real-time Gemini AI Generation: Go to <strong>Settings &gt; Secrets</strong> in the top-right and replace of renew your <strong>GEMINI_API_KEY</strong>.
            </p>
          </div>
        </div>
      )}

      {/* 1. Header Spotlight */}
      <div className="bg-slate-50 border border-gray-100 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono font-semibold bg-brand-50 text-brand-700 px-2.5 py-0.5 rounded-full capitalize">
              {itinerary.preferences?.budgetRange || "moderate"} Strategy
            </span>
            <span className="text-xs font-mono font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
              {itravelersLabel(travelers)}
            </span>
            {itinerary.preferences?.tripType && (
              <span className="text-xs font-mono font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded uppercase">
                {itinerary.preferences.tripType} travel
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-gray-900 leading-tight">
            Your Bespoke Trip to {itinerary.destination}
          </h1>
          {itinerary.preferences?.origin && (
            <p className="text-xs sm:text-sm font-semibold text-gray-600 flex items-center gap-1.5 pt-1">
              <Compass className="h-4 w-4 text-blue-500" />
              <span>Departing From: <strong className="text-gray-900">{itinerary.preferences.origin}</strong></span>
            </p>
          )}
          <p className="text-xs text-gray-500 font-mono">
            Optimized scheduled outputs. Generated {new Date(itinerary.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <button
            onClick={triggerOfflineDownload}
            className="flex-1 md:flex-none px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white min-w-36 text-xs font-medium rounded-xl flex items-center justify-center space-x-1.5 transition cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Offline Pack</span>
          </button>

          <button
            id="save-trip-btn"
            onClick={onSave}
            className={`flex-1 md:flex-none px-5 py-2.5 text-xs font-bold rounded-xl transition min-w-36 cursor-pointer ${
              isSaved 
                ? 'bg-rose-50 border border-rose-200 text-rose-700 select-none' 
                : 'bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-500/10'
            }`}
          >
            {isSaved ? "Saved Trip ❤️" : "Save to My Trips"}
          </button>
        </div>
      </div>

      {/* 2. Micro aggregates: Budget comparisons & Weather forecasts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Dynamic Budget comparison side-by-side indicator */}
        <div className="lg:col-span-7 bg-white border border-gray-100 rounded-2xl p-6 space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-gray-50">
            <div>
              <h3 className="text-sm font-bold text-gray-900 font-display flex items-center space-x-1.5">
                <Layers className="h-4 w-4 text-brand-600" />
                <span>Tier Cost Comparison Estimator</span>
              </h3>
              <p className="text-[10px] text-gray-500 leading-none">Evaluate budget, smart or luxury indexes.</p>
            </div>

            {/* Config Selectors */}
            <div className="bg-slate-100 p-1 rounded-xl flex space-x-1 shrink-0 text-[10px] font-mono font-bold">
              <button
                onClick={() => setCostComparisonMode('budget')}
                className={`px-2.5 py-1 rounded-lg cursor-pointer ${costComparisonMode === 'budget' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
              >
                Budget
              </button>
              <button
                onClick={() => setCostComparisonMode('current')}
                className={`px-2.5 py-1 rounded-lg cursor-pointer ${costComparisonMode === 'current' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
              >
                Original
              </button>
              <button
                onClick={() => setCostComparisonMode('luxury')}
                className={`px-2.5 py-1 rounded-lg cursor-pointer ${costComparisonMode === 'luxury' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
              >
                Luxury
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">Projected Total Outflow</span>
              <p className="text-3xl font-extrabold text-indigo-600 font-mono tracking-tight flex items-center gap-1.5">
                {formatCost(activeTotal)} <span className="text-xs text-gray-400 font-medium font-sans">INR</span>
              </p>
            </div>
            
            <div className="text-[11px] text-gray-500 leading-relaxed max-w-xs sm:text-right">
              {costComparisonMode === 'budget' && "Lowest possible cost configuration utilizing hostel accommodations, public transit grids, and local street stalls."}
              {costComparisonMode === 'current' && "Your targeted pacing standard. Combines high-density boutique hotels and convenient bullet or regional trains."}
              {costComparisonMode === 'luxury' && "Premium travel experiences involving luxury villas / private suites, premium flights, and private transfers."}
            </div>
          </div>

          {/* Styledstacked percentage distribution */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block">Estimated Funds Allocation</span>
            <div className="h-5 w-full bg-gray-100 rounded-full overflow-hidden flex font-mono text-[9px] font-bold text-white text-center">
              {Object.keys(activeBreakdown).map((key) => {
                const value = (activeBreakdown as any)[key];
                const percentage = Math.round((value / activeTotal) * 100);
                if (percentage === 0) return null;
                return (
                  <div
                    key={key}
                    style={{ width: `${percentage}%` }}
                    className={`${getCategoryColor(key)} h-full flex items-center justify-center`}
                    title={`${key}: ${formatCost(value)}`}
                  >
                    <span>{percentage}%</span>
                  </div>
                );
              })}
            </div>

            {/* Cost Legends list */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
              {[
                { label: 'Transport', key: 'transport', color: 'bg-sky-500' },
                { label: 'Lodgings', key: 'accommodation', color: 'bg-indigo-500' },
                { label: 'Food', key: 'food', color: 'bg-orange-500' },
                { label: 'Activities', key: 'activities', color: 'bg-emerald-500' },
                { label: 'Misc', key: 'misc', color: 'bg-slate-500' }
              ].map((leg) => (
                <div key={leg.key} className="flex items-center space-x-1.5 text-xs text-gray-600">
                  <span className={`h-2.5 w-2.5 rounded ${leg.color}`}></span>
                  <span className="font-semibold block truncate leading-none">{leg.label}: <strong className="font-mono text-gray-900">{formatCost((activeBreakdown as any)[leg.key])}</strong></span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Weather details & Safeties column */}
        <div className="lg:col-span-5 bg-slate-50 border border-gray-100 rounded-2xl p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest">Atmospheric Check</span>
              <span className="text-[10px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded font-mono font-bold flex items-center space-x-1 animate-pulse">
                <CloudSun className="h-3 w-3" />
                <span>Live Feed</span>
              </span>
            </div>

            <div className="flex gap-4 items-center">
              <div className="h-12 w-12 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
                <CloudSun className="h-6 w-6" />
              </div>
              <div className="space-y-0.5">
                <p className="text-lg font-bold font-display text-gray-900">{itinerary.weatherForecast.temp}</p>
                <p className="text-xs text-gray-500 font-semibold">{itinerary.weatherForecast.condition}: {itinerary.weatherForecast.description}</p>
              </div>
            </div>

            {/* Custom weather packing lists */}
            <div className="space-y-1.5 pt-3 border-t border-gray-100">
              <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block">Recommended Packing Suggestions</span>
              <div className="flex flex-wrap gap-1.5">
                {ensureArray<string>(itinerary.packingList).map((item, i) => (
                  <span key={i} className="text-[10px] bg-white border border-gray-200 text-gray-600 px-2.5 py-1 rounded-lg font-medium flex items-center space-x-1">
                    <CheckSquare className="h-3 w-3 text-brand-500" />
                    <span>{item}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-[10px] text-emerald-800 space-y-1 mt-auto">
            <div className="font-bold flex items-center space-x-1.5 uppercase font-mono tracking-wider">
              <Shield className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
              <span>Safety & crowds Score</span>
            </div>
            <p className="leading-relaxed">
              <strong>Neighborhood Safeguards:</strong> {ensureArray<string>(itinerary.safeAreas).join(', ')} are marked as ultra-safe stays. <strong>Hostility Level:</strong> {itinerary.crowdLevelPredictions || "Low crowd level indices."}
            </p>
          </div>
            {/* 3. Accommodate Stays & Gastronomy boards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Lodging Hotels column */}
        <div className="space-y-4">
          <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest block">Recommended Lodging & Accommodations</span>
          <div className="grid grid-cols-1 gap-6">
            {ensureArray<any>(itinerary.hotelRecommendations).map((hotel, idx) => {
              const perNightRate = hotel.estimatedPricePerNightINR || Math.round(itinerary.costBreakdown.accommodation / Math.max(1, itinerary.duration));
              return (
                <div key={idx} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                  {/* Hotel Spotlight Image */}
                  <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                    <img 
                      src={getHotelImage(hotel)} 
                      alt={hotel.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-[10px] font-mono font-bold text-amber-600 shadow-sm flex items-center space-x-1">
                      <span>★</span>
                      <span>{hotel.rating}/5 Rating</span>
                    </div>
                    <div className="absolute top-3 right-3 bg-brand-600/90 backdrop-blur-xs px-3 py-1 rounded-full text-[10px] font-mono font-extrabold text-white shadow-sm">
                      {hotel.priceLevel || "₹₹ moderate"}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/35 to-transparent p-4 pt-10">
                      <h4 className="font-bold font-display text-base text-white drop-shadow-sm">{hotel.name}</h4>
                      <div className="flex items-center space-x-1.5 text-xs text-gray-200 mt-1">
                        <MapPin className="h-3 w-3 text-brand-300" />
                        <span className="truncate">{hotel.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      <p className="text-xs text-gray-600 leading-relaxed">{hotel.description}</p>
                      
                      {/* Price Tag Spotlight */}
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex justify-between items-center text-xs">
                        <span className="font-semibold text-gray-500">Estimated Price per Night:</span>
                        <span className="font-mono font-extrabold text-brand-700 text-sm">{formatCost(perNightRate)}</span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-wider block">Key Amenities Provided:</span>
                      <div className="flex flex-wrap gap-1">
                        {ensureArray<string>(hotel.amenities).map(a => (
                          <span key={a} className="bg-slate-100 text-slate-600 border border-slate-200/55 text-[9px] font-medium px-2 py-0.5 rounded-md">
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gastronomy Places column */}
        <div className="space-y-4">
          <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest block">Curated Gastronomy Suggestions</span>
          <div className="grid grid-cols-1 gap-6">
            {ensureArray<any>(itinerary.restaurantSuggestions).map((rest, idx) => {
              const avgCost = rest.averageCostPerPersonINR || 450;
              return (
                <div key={idx} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                  {/* Restaurant Spotlight Image */}
                  <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                    <img 
                      src={getRestaurantImage(rest)} 
                      alt={rest.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-[10px] font-mono font-bold text-brand-600 shadow-sm flex items-center space-x-1">
                      <span>★</span>
                      <span>{rest.rating || 4.6}/5 Rating</span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/35 to-transparent p-4 pt-10">
                      <h4 className="font-bold font-display text-base text-white drop-shadow-sm">{rest.name}</h4>
                      <p className="text-[11px] font-mono font-semibold text-brand-300 capitalize">{rest.cuisine}</p>
                    </div>
                  </div>

                  <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      <p className="text-xs text-gray-600 leading-relaxed">{rest.description}</p>

                      {/* Avg Dining Cost Tag */}
                      <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-3 flex justify-between items-center text-xs">
                        <span className="font-semibold text-orange-850">Average Cost per Person:</span>
                        <span className="font-mono font-extrabold text-orange-700 text-sm">{formatCost(avgCost)}</span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-wider block">Signature Must-Try Dishes:</span>
                      <div className="flex flex-wrap gap-1">
                        {ensureArray<string>(rest.recommendedDishes).map(dish => (
                          <span key={dish} className="bg-amber-50 border border-amber-100 text-amber-800 text-[10px] font-semibold px-2 py-0.5 rounded-lg">
                            {dish}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>      </div>
      </div>

      {/* 4. Daily TIMELINE schedule planner with Tabs */}
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest block">Daily Schedule Timelines</span>
            <h3 className="text-base font-bold text-gray-900 font-display">Hour-by-hour program schedule</h3>
          </div>

          <div className="p-2.5 bg-slate-50 border border-gray-100 rounded-xl flex items-center space-x-2 text-[10px] text-gray-500">
            <Footprints className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Pacing calibration: <strong>{itinerary.preferences?.pace || "moderate"}</strong>.</span>
          </div>
        </div>

        {/* Day selection Tabs */}
        <div className="flex flex-wrap gap-2 pb-3 border-b border-gray-100">
          {ensureArray<DailySchedule>(itinerary.dailySchedule).map((sched) => (
            <button
              key={sched.day}
              onClick={() => setActiveDay(sched.day)}
              className={`px-4.5 py-2.5 rounded-xl cursor-pointer text-xs font-bold transition flex flex-col items-center space-y-0.5 min-w-20 ${
                activeDay === sched.day
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'bg-slate-50 hover:bg-slate-100 text-gray-600 border border-gray-100'
              }`}
            >
              <span className="text-[9px] font-mono opacity-60 uppercase block">Day</span>
              <span>{sched.day}</span>
            </button>
          ))}
        </div>

        {/* Current Active Day Details */}
        <div className="space-y-6">
          <div className="p-4 bg-slate-50 border border-gray-100 rounded-xl">
            <span className="text-[10px] font-mono font-bold text-brand-600 uppercase tracking-widest block">Theme of the Day:</span>
            <h4 className="font-bold font-display text-sm text-gray-800">{selectedSchedule.theme}</h4>
          </div>

          <div className="relative border-l-2 border-slate-100 ml-4 pl-6 space-y-8 py-2">
            {ensureArray<ActivityItem>(selectedSchedule?.activities).map((act, i) => (
              <div key={i} className="relative group">
                {/* Timeline node icon */}
                <span className="absolute -left-[35px] top-0 h-6 w-6 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center shrink-0">
                  {getActivityIcon(act.category)}
                </span>

                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold text-brand-600 flex items-center space-x-1">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <span>{act.time}</span>
                      </span>
                      <h4 className="font-bold font-display text-sm text-gray-900 group-hover:text-brand-600 transition-colors">
                        {act.title}
                      </h4>
                    </div>

                    <div className="flex items-center space-x-3 text-[10px] font-mono text-gray-500">
                      <span>Duration: {act.duration}</span>
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 px-2 py-0.5 rounded font-bold font-mono">Cost: {formatCost(act.cost)}</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed max-w-3xl">
                    {act.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-[10px]">
                    <span className="text-gray-400">📍 Location: <strong className="font-medium text-gray-700">{act.location}</strong></span>
                    {act.tip && (
                      <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded flex items-center space-x-1">
                        <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        <span>Tip: {act.tip}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Travel fatigue optimization tip block */}
        <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start space-x-3 text-xs text-amber-800">
          <AlertTriangle className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold flex items-center text-[10px] font-mono uppercase tracking-wider text-amber-700/80">Fatigue calibrator advisory</span>
            <p className="leading-relaxed font-sans">{itinerary.travelFatigueTips}</p>
          </div>
        </div>
      </div>

      {/* 5. Cost Splitter Workspace */}
      <ExpenseTracker 
        initialBreakdown={originalBreakdown}
        travelersCount={travelers}
      />
    </div>
  );
}

// Helper mappings
function itravelersLabel(count: number): string {
  if (count === 1) return "Solo Traveler";
  if (count === 2) return "Double (Couple)";
  return `${count} Travelers`;
}

function getCategoryColor(cat: string): string {
  switch (cat) {
    case 'transport': return 'bg-sky-500';
    case 'accommodation': return 'bg-indigo-500';
    case 'food': return 'bg-orange-500';
    case 'activities': return 'bg-emerald-500';
    default: return 'bg-slate-500';
  }
}

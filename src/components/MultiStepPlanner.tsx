import { useState } from "react";
import { TripPreference } from "../types";
import { 
  Compass, MapPin, Calendar, Users, 
  ArrowLeft, ArrowRight, DollarSign, Train, 
  Car, MessageSquare, Utensils, Heart, Activity,
  Sliders, Smile, Info, Plane, Backpack
} from "lucide-react";

interface MultiStepPlannerProps {
  onGenerate: (preferences: TripPreference) => void;
  isLoading: boolean;
}

export default function MultiStepPlanner({ onGenerate, isLoading }: MultiStepPlannerProps) {
  const [step, setStep] = useState<number>(1);
  const totalSteps = 5;

  const [preferences, setPreferences] = useState<TripPreference>({
    destination: "",
    duration: 5,
    travelersCount: 2,
    budgetRange: "moderate",
    customBudgetINR: 45000, // Default custom manual rupee budget (e.g. 45K INR)
    isIndianOrigin: true, // Auto-enabled for the customized Indian travel suite
    transportPreference: "train",
    accommodationStyle: "hotel",
    foodPreferences: ["indian-veg"],
    activityInterests: ["history", "temples"],
    travelGroupType: "family",
    pace: "moderate",
    specialRequirements: "",
    origin: "Delhi (DEL)",
    tripType: "domestic",
    transitNameOrNumber: "",
    transitTimeSlot: "",
    transitClass: ""
  });

  const [useCustomBudget, setUseCustomBudget] = useState<boolean>(true);

  const availableActivities = [
    { id: "adventure", label: "Adventure & Trekking" },
    { id: "nightlife", label: "Nightlife & Lounges" },
    { id: "nature", label: "Nature & Beaches" },
    { id: "temples", label: "Temples & Pilgrimage" },
    { id: "shopping", label: "Bazaars & Souvenir Shopping" },
    { id: "photography", label: "Scenic & Heritage Photography" },
    { id: "relaxation", label: "Ayurvedic Spa & Relaxation" },
    { id: "history", label: "Forts, Palaces & Historic Ruins" },
    { id: "art", label: "Museums & Local Handlooms" }
  ];

  const availableFoods = [
    { id: "indian-veg", label: "Pure Vegetarian (North/South Indian)" },
    { id: "jain-veg", label: "Strict Jain Food (No Onion/Garlic/Roots)" },
    { id: "street-food", label: "Indian Street Food Devotee (Chaat, Chai, Local)" },
    { id: "non-veg", label: "Indian Non-Vegetarian / Mughlai / Biryani" },
    { id: "halal", label: "Halal Selections" },
    { id: "seafood", label: "Coastal Seafood Specialties" },
    { id: "gluten-free", label: "Gluten-Free Only" },
    { id: "local", label: "Standard Continental / Local Cuisine" }
  ];

  function toggleActivity(id: string) {
    setPreferences((prev) => {
      const exists = prev.activityInterests.includes(id);
      return {
        ...prev,
        activityInterests: exists 
          ? prev.activityInterests.filter(i => i !== id)
          : [...prev.activityInterests, id]
      };
    });
  }

  function toggleFood(id: string) {
    setPreferences((prev) => {
      const exists = prev.foodPreferences.includes(id);
      return {
        ...prev,
        foodPreferences: exists 
          ? prev.foodPreferences.filter(f => f !== id)
          : [...prev.foodPreferences, id]
      };
    });
  }

  function handleNext() {
    if (step === 1) {
      if (!preferences.origin?.trim()) {
        alert("Please specify a departing origin or city (where you are traveling from).");
        return;
      }
      if (!preferences.destination.trim()) {
        alert("Please specify a target destination or region.");
        return;
      }
    }
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onGenerate(preferences);
    }
  }

  function handleBack() {
    if (step > 1) {
      setStep(step - 1);
    }
  }

  // Quick select preset destinations
  const presetCities = ["Goa, India", "Srinagar, Kashmir", "Munnar, Kerala", "Jaipur / Udaipur, Rajasthan", "Bali, Indonesia", "Dubai, UAE", "Thailand", "Singapore"];

  return (
    <div className="max-w-2xl mx-auto py-8">
      {/* Step Header */}
      <div className="space-y-4 mb-8">
        <div className="flex justify-between items-center text-xs font-mono">
          <span className="text-brand-600 font-bold uppercase tracking-widest bg-brand-50 px-2 py-0.5 rounded">
            Step {step} of {totalSteps}
          </span>
          <span className="text-gray-400 font-semibold">
            {Math.round((step / totalSteps) * 100)}% Complete
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-brand-600 transition-all duration-300 rounded-full"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Main card */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-xl p-6 sm:p-10 space-y-8">
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-display tracking-tight text-gray-900">Where are you heading?</h2>
              <p className="text-xs text-gray-500">Specify details about your starting point, type of travel, and destination.</p>
            </div>

            {/* Departing From (Origin) input */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider block">Departing From (Origin)</label>
              <div className="relative">
                <Compass className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  id="origin-input"
                  type="text"
                  placeholder="e.g. New York, USA or London, UK"
                  value={preferences.origin || ""}
                  onChange={(e) => setPreferences({ ...preferences, origin: e.target.value })}
                  className="w-full bg-slate-50 border border-gray-100 rounded-xl py-3 pl-11 pr-4 text-sm font-medium focus:outline-none focus:border-brand-500 transition"
                  required
                />
              </div>

              {/* Preset origins buttons */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {["Delhi (DEL)", "Mumbai (BOM)", "Bengaluru (BLR)", "Chennai (MAA)", "Kolkata (CCU)", "Hyderabad (HYD)", "Pune"].map((orig) => (
                  <button
                    key={orig}
                    type="button"
                    onClick={() => setPreferences({ ...preferences, origin: orig })}
                    className="text-[10px] bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-gray-600 px-2.5 py-1 rounded-full border border-gray-200 cursor-pointer transition"
                  >
                    +{orig}
                  </button>
                ))}
              </div>
            </div>

            {/* Travel Scope (Type) */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider block">Travel Scope & Boundary</label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'domestic', label: 'Domestic', desc: 'Within same country' },
                  { id: 'interstate', label: 'Interstate', desc: 'Across state borders' },
                  { id: 'international', label: 'International', desc: 'Over borders & oceans' },
                ].map((scope) => (
                  <button
                    key={scope.id}
                    type="button"
                    onClick={() => setPreferences({ ...preferences, tripType: scope.id as any })}
                    className={`p-3.5 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center space-y-1 text-center cursor-pointer ${
                      preferences.tripType === scope.id
                        ? 'border-brand-600 bg-brand-50 text-brand-700 ring-2 ring-brand-100'
                        : 'border-gray-100 hover:border-gray-300 bg-slate-50 text-gray-600'
                    }`}
                  >
                    <span className="block text-xs font-bold">{scope.label}</span>
                    <span className="text-[9px] text-gray-400 font-normal leading-tight hidden sm:block">{scope.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Target Destination */}
            <div className="space-y-2 pt-2 border-t border-gray-50">
              <label className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider block">Target Destination</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  id="destination-input"
                  type="text"
                  placeholder="e.g. Kyoto, Japan or Amalfi Coast, Italy"
                  value={preferences.destination}
                  onChange={(e) => setPreferences({ ...preferences, destination: e.target.value })}
                  className="w-full bg-slate-50 border border-gray-100 rounded-xl py-3 pl-11 pr-4 text-sm font-medium focus:outline-none focus:border-brand-500 transition"
                  required
                />
              </div>

              {/* Preset quick buttons */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {presetCities.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setPreferences({ ...preferences, destination: city })}
                    className="text-[10px] bg-gray-50 hover:bg-brand-50 hover:text-brand-700 text-gray-500 px-2.5 py-1 rounded-full border border-gray-100 cursor-pointer transition"
                  >
                    +{city}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider block">Duration (Days)</label>
                <div className="flex items-center space-x-3 bg-slate-50 border border-gray-100 p-1.5 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setPreferences({ ...preferences, duration: Math.max(1, preferences.duration - 1) })}
                    className="h-8 w-8 rounded-lg bg-white border border-gray-200 text-sm font-bold flex items-center justify-center cursor-pointer"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center text-sm font-bold text-gray-800">{preferences.duration} Days</span>
                  <button
                    type="button"
                    onClick={() => setPreferences({ ...preferences, duration: Math.min(14, preferences.duration + 1) })}
                    className="h-8 w-8 rounded-lg bg-white border border-gray-200 text-sm font-bold flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider block">Travelers Count</label>
                <div className="flex items-center space-x-3 bg-slate-50 border border-gray-100 p-1.5 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setPreferences({ ...preferences, travelersCount: Math.max(1, preferences.travelersCount - 1) })}
                    className="h-8 w-8 rounded-lg bg-white border border-gray-200 text-sm font-bold flex items-center justify-center cursor-pointer"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center text-sm font-bold text-gray-800">{preferences.travelersCount} Person</span>
                  <button
                    type="button"
                    onClick={() => setPreferences({ ...preferences, travelersCount: Math.min(10, preferences.travelersCount + 1) })}
                    className="h-8 w-8 rounded-lg bg-white border border-gray-200 text-sm font-bold flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-display tracking-tight text-gray-900">Sociability, Pacing & Transport</h2>
              <p className="text-xs text-gray-500">Pick how active you would like the trip to be and preferred transit style.</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider block">Travel Group Type</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {(['solo', 'couple', 'family', 'friends'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setPreferences({ ...preferences, travelGroupType: type })}
                    className={`p-3.5 rounded-xl border text-xs font-bold capitalize cursor-pointer transition flex flex-col items-center space-y-1 ${
                      preferences.travelGroupType === type
                        ? 'border-brand-600 bg-brand-50 text-brand-700'
                        : 'border-gray-100 hover:border-gray-300 bg-slate-50 text-gray-600'
                    }`}
                  >
                    <Users className="h-4 w-4 shrink-0 mb-1" />
                    <span>{type}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider block">Pacing Speed</label>
              <div className="grid grid-cols-3 gap-2.5">
                {(['relaxed', 'moderate', 'fast-paced'] as const).map((paceVal) => (
                  <button
                    key={paceVal}
                    type="button"
                    onClick={() => setPreferences({ ...preferences, pace: paceVal })}
                    className={`p-3.5 rounded-xl border text-xs font-bold capitalize cursor-pointer transition ${
                      preferences.pace === paceVal
                        ? 'border-brand-600 bg-brand-50 text-brand-700'
                        : 'border-gray-100 hover:border-gray-300 bg-slate-50 text-gray-600'
                    }`}
                  >
                    <span>{paceVal}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider block">Transportation Preferences</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'flight', label: 'Airways', icon: Plane },
                  { id: 'train', label: 'Trains/Rail', icon: Train },
                  { id: 'car', label: 'Car Rental', icon: Car },
                  { id: 'public', label: 'Transit Bus', icon: Compass }
                ].map((trans) => (
                  <button
                    key={trans.id}
                    type="button"
                    onClick={() => setPreferences({ ...preferences, transportPreference: trans.id as any })}
                    className={`p-3 rounded-xl border text-xs font-bold cursor-pointer transition flex flex-col items-center space-y-1.5 ${
                      preferences.transportPreference === trans.id
                        ? 'border-brand-600 bg-brand-50 text-brand-700'
                        : 'border-gray-100 hover:border-gray-300 bg-slate-50 text-gray-600'
                    }`}
                  >
                    <trans.icon className="h-4 w-4 shrink-0" />
                    <span>{trans.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Transit / Train / Flight specific details */}
            <div className="pt-4 border-t border-gray-100 space-y-4">
              <div className="flex items-center space-x-2">
                <Train className="h-4 w-4 text-brand-600 animate-bounce" />
                <h4 className="text-xs font-bold text-gray-900 font-display uppercase tracking-wider">
                  Specific Train / Flight / Transit Details (Recommended)
                </h4>
              </div>
              <p className="text-[10px] text-gray-400 -mt-2 leading-relaxed">
                Provide custom details like train names/numbers (e.g., Vande Bharat Jet) or specific flight carriers. AeroPlan will customize daily schedules to fit these timings.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">Flight / Train / Vehicle</label>
                  <input
                    type="text"
                    placeholder="e.g. Vande Bharat Express 22436"
                    value={preferences.transitNameOrNumber || ""}
                    onChange={(e) => setPreferences({ ...preferences, transitNameOrNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-brand-500"
                  />
                  {preferences.transportPreference === 'train' && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {["Vande Bharat", "Shatabdi Exp", "Rajdhani Exp", "Gatimaan Exp"].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setPreferences({ ...preferences, transitNameOrNumber: t })}
                          className="text-[8px] bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-gray-500 px-1.5 py-0.5 rounded cursor-pointer border border-gray-200"
                        >
                          +{t}
                        </button>
                      ))}
                    </div>
                  )}
                  {preferences.transportPreference === 'flight' && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {["IndiGo 6E", "Air India AI", "SpiceJet SG", "Akasa Air QP"].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setPreferences({ ...preferences, transitNameOrNumber: t })}
                          className="text-[8px] bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-gray-500 px-1.5 py-0.5 rounded cursor-pointer border border-gray-200"
                        >
                          +{t}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">Departure Time slot</label>
                  <select
                    value={preferences.transitTimeSlot || ""}
                    onChange={(e) => setPreferences({ ...preferences, transitTimeSlot: e.target.value })}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-brand-500"
                  >
                    <option value="">-- Select Time Slot --</option>
                    <option value="Early Morning (04:00 AM - 08:00 AM)">Early Morning (4 AM - 8 AM)</option>
                    <option value="Morning (08:00 AM - 12:00 PM)">Morning (8 AM - 12 PM)</option>
                    <option value="Afternoon (12:00 PM - 04:00 PM)">Afternoon (12 PM - 4 PM)</option>
                    <option value="Evening (04:00 PM - 08:00 PM)">Evening (4 PM - 8 PM)</option>
                    <option value="Night (08:00 PM - 12:00 AM)">Night (8 PM - 12 AM)</option>
                    <option value="Late Night / Redeye (12:00 AM - 04:00 AM)">Late Night (12 AM - 4 AM)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">Class / Tier Seat</label>
                  <input
                    type="text"
                    placeholder="e.g. Chair Car (CC), 3AC, Economy"
                    value={preferences.transitClass || ""}
                    onChange={(e) => setPreferences({ ...preferences, transitClass: e.target.value })}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-brand-500"
                  />
                  {preferences.transportPreference === 'train' && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {["CC/Chair Car", "EC/Executive", "3AC", "2AC", "Sleeper Class"].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setPreferences({ ...preferences, transitClass: c })}
                          className="text-[8px] bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-gray-500 px-1.5 py-0.5 rounded cursor-pointer border border-gray-200"
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  )}
                  {preferences.transportPreference === 'flight' && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {["Economy Class", "Business Class", "Premium Economy"].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setPreferences({ ...preferences, transitClass: c })}
                          className="text-[8px] bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-gray-500 px-1.5 py-0.5 rounded cursor-pointer border border-gray-200"
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-display tracking-tight text-gray-900">Accommodation & Budget Index</h2>
              <p className="text-xs text-gray-500">Align lodging style and cost indexes for standard calibrations.</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider block">Lodging Accommodation Style</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {[
                  { id: 'hostel', label: 'Hostel' },
                  { id: 'hotel', label: 'Standard Hotel' },
                  { id: 'resort', label: 'Resort' },
                  { id: 'villa', label: 'Luxury Villa' },
                  { id: 'airbnb', label: 'Airbnb Flat' }
                ].map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => setPreferences({ ...preferences, accommodationStyle: acc.id as any })}
                    className={`p-3 rounded-xl border text-xs font-bold cursor-pointer transition text-center ${
                      preferences.accommodationStyle === acc.id
                        ? 'border-brand-600 bg-brand-50 text-brand-700'
                        : 'border-gray-100 hover:border-gray-300 bg-slate-50 text-gray-600'
                    }`}
                  >
                    <span className="block truncate">{acc.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Indian Rupee Manual Budget Control */}
            <div className="space-y-4 bg-gradient-to-tr from-orange-50/40 via-white to-emerald-50/40 p-5 rounded-2xl border border-gray-100">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5 font-display">
                    <span className="text-emerald-600 font-extrabold text-base">₹</span>
                    <span>Define Custom Rupee (₹) Budget Target</span>
                  </h3>
                  <p className="text-[10px] text-gray-500">Enable absolute control with manually typed or selected Rupee values.</p>
                </div>
                <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-lg shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setUseCustomBudget(true);
                      setPreferences({ ...preferences, customBudgetINR: preferences.customBudgetINR || 45000 });
                    }}
                    className={`px-2.5 py-1 text-[9px] font-bold rounded cursor-pointer transition ${useCustomBudget ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500'}`}
                  >
                    Custom ₹
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUseCustomBudget(false);
                      setPreferences({ ...preferences, customBudgetINR: undefined });
                    }}
                    className={`px-2.5 py-1 text-[9px] font-bold rounded cursor-pointer transition ${!useCustomBudget ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500'}`}
                  >
                    Tier Presets
                  </button>
                </div>
              </div>

              {useCustomBudget ? (
                <div className="space-y-4 pt-1">
                  <div className="flex items-center space-x-4">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-2.5 text-sm font-bold text-gray-400">₹</span>
                      <input
                        id="custom-budget-input"
                        type="number"
                        min={5000}
                        max={1000000}
                        step={5000}
                        value={preferences.customBudgetINR || 45000}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setPreferences({ 
                            ...preferences, 
                            customBudgetINR: val,
                            budgetRange: val < 30000 ? 'budget' : val < 100000 ? 'moderate' : 'luxury'
                          });
                        }}
                        className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2 pl-7 pr-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-brand-500 transition"
                      />
                    </div>
                    {/* Hindi equivalent denomination */}
                    <div className="bg-white border border-gray-100 px-3 py-1.5 rounded-xl text-right shrink-0 shadow-sm">
                      <span className="text-[9px] font-mono text-gray-400 uppercase block tracking-wider">Indian Format</span>
                      <span className="text-xs font-extrabold text-brand-700">
                        {preferences.customBudgetINR && preferences.customBudgetINR >= 100000 
                          ? `₹ ${(preferences.customBudgetINR / 100000).toFixed(2)} Lakh` 
                          : `₹ ${((preferences.customBudgetINR || 0) / 1000).toFixed(0)}K`}
                      </span>
                    </div>
                  </div>

                  {/* Presets */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[
                      { label: "₹15K Backpacker", value: 15000, cat: 'budget' },
                      { label: "₹45K Standard Family", value: 45000, cat: 'moderate' },
                      { label: "₹85K Deluxe Getaway", value: 85000, cat: 'moderate' },
                      { label: "₹1.5 Lakh Premium", value: 150000, cat: 'luxury' },
                      { label: "₹3 Lakh Mega Luxury", value: 300000, cat: 'luxury' }
                    ].map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setPreferences({ 
                          ...preferences, 
                          customBudgetINR: p.value,
                          budgetRange: p.cat as any
                        })}
                        className={`text-[10px] px-2.5 py-1 rounded-full border cursor-pointer font-bold transition ${
                          preferences.customBudgetINR === p.value 
                            ? 'bg-brand-600 border-brand-600 text-white shadow-sm' 
                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 rounded-xl text-[10px] text-gray-500 italic">
                  Note: Rupee cost optimizations will be mapped back to default financial profiles (Budget / Moderate / Luxury).
                </div>
              )}
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-50">
              <label className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider block">Standard Budget Strategy (Fallback)</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'budget', title: 'Budget Saver', desc: 'Hostels, local food stalls, and public transit prioritizations.', cost: '$' },
                  { id: 'moderate', title: 'Smart Balances', desc: 'Boutique hotels, mid-tier bistros, and high-speed transit combinations.', cost: '$$' },
                  { id: 'luxury', title: 'Premium Comfort', desc: 'Villas/Resorts, five-star private transfers, and fine-dining menus.', cost: '$$$' }
                ].map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setPreferences({ ...preferences, budgetRange: b.id as any })}
                    className={`p-5 rounded-2xl border text-left cursor-pointer transition flex flex-col justify-between space-y-3 ${
                      preferences.budgetRange === b.id
                        ? 'border-brand-600 bg-brand-50 ring-2 ring-brand-100'
                        : 'border-gray-100 hover:border-gray-300 bg-slate-50'
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className={`text-xs font-mono font-extrabold px-1.5 py-0.5 rounded ${preferences.budgetRange === b.id ? 'bg-brand-200 text-brand-800' : 'bg-gray-200 text-gray-600'}`}>{b.cost}</span>
                      <span className="text-gray-900 font-bold text-xs capitalize">{b.id}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-800">{b.title}</h4>
                      <p className="text-[10px] text-gray-500 mt-1 leading-relaxed leading-normal">{b.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-display tracking-tight text-gray-900">Dining & Focused Activities</h2>
              <p className="text-xs text-gray-500">Check food orientations and primary travel goals to customize scheduling.</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider block">Dining Adjustments (Multi-select)</label>
              <div className="flex flex-wrap gap-2">
                {availableFoods.map((food) => {
                  const selected = preferences.foodPreferences.includes(food.id);
                  return (
                    <button
                      key={food.id}
                      type="button"
                      onClick={() => toggleFood(food.id)}
                      className={`px-3 py-2 rounded-xl border text-xs font-medium cursor-pointer transition flex items-center space-x-1.5 ${
                        selected 
                          ? 'border-brand-600 bg-brand-50 text-brand-700' 
                          : 'border-gray-100 hover:border-gray-300 bg-slate-50 text-gray-600'
                      }`}
                    >
                      <Utensils className="h-3.5 w-3.5" />
                      <span>{food.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider block">Activity Goals (Multi-select)</label>
              <div className="flex flex-wrap gap-2">
                {availableActivities.map((activity) => {
                  const selected = preferences.activityInterests.includes(activity.id);
                  return (
                    <button
                      key={activity.id}
                      type="button"
                      onClick={() => toggleActivity(activity.id)}
                      className={`px-3 py-2 rounded-xl border text-xs font-medium cursor-pointer transition flex items-center space-x-1.5 ${
                        selected 
                          ? 'border-brand-600 bg-brand-50 text-brand-700' 
                          : 'border-gray-100 hover:border-gray-300 bg-slate-50 text-gray-600'
                      }`}
                    >
                      <Activity className="h-3.5 w-3.5" />
                      <span>{activity.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-display tracking-tight text-gray-900">Custom Constraints</h2>
              <p className="text-xs text-gray-500">Provide special physical notes, dietary warnings, or minor route guidelines.</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider block">Special Requirements / Notes</label>
              <textarea
                rows={4}
                value={preferences.specialRequirements}
                onChange={(e) => setPreferences({ ...preferences, specialRequirements: e.target.value })}
                placeholder="e.g. Traveling with elderly travelers requiring elevator access, strict halal dining preferences, or would love to schedule a snorkeling session on day 3 afternoon..."
                className="w-full bg-slate-50 border border-gray-100 rounded-xl p-3 text-sm focus:outline-none focus:border-brand-500 transition font-sans"
              />
            </div>

            {/* Live review of criteria before submitting */}
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-[11px] text-amber-800 space-y-1">
              <div className="font-bold flex items-center space-x-1">
                <Info className="h-3.5 w-3.5 text-amber-600" />
                <span>Planner Summary Review</span>
              </div>
              <p>
                You are generating a {preferences.duration}-day bespoke Indian traveler blueprint departing from <strong>{preferences.origin || "your location"}</strong> to <strong>{preferences.destination}</strong> ({preferences.tripType || "international"} travel) for {preferences.travelersCount} traveler(s). 
                {preferences.customBudgetINR ? (
                  <span> The planning is strictly calibrated under a customized manual budget cap of <strong>₹ {preferences.customBudgetINR.toLocaleString('en-IN')}</strong> ({preferences.customBudgetINR >= 100000 ? `${(preferences.customBudgetINR / 100000).toFixed(2)} Lakh` : `${(preferences.customBudgetINR / 1000).toFixed(0)}K`}).</span>
                ) : (
                  <span> The planning is calibrated on a standard <strong>{preferences.budgetRange}</strong> financial structure.</span>
                )}
                <span> Pacing is calibrated to <strong>{preferences.pace}</strong> and dietary adjustments are mapped automatically.</span>
                {preferences.transitNameOrNumber && (
                  <span> Travel is set via <strong>{preferences.transitNameOrNumber}</strong>{preferences.transitTimeSlot ? ` (${preferences.transitTimeSlot})` : ""}{preferences.transitClass ? ` in ${preferences.transitClass}` : ""}.</span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Buttons Row */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-100 gap-4">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1 || isLoading}
            className={`px-5 py-3 hover:bg-gray-100 rounded-xl border border-gray-100 text-xs font-medium transition cursor-pointer flex items-center space-x-1.5 ${
              step === 1 ? 'opacity-40 cursor-not-allowed' : ''
            }`}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Previous</span>
          </button>

          <button
            id="proceed-step-btn"
            type="button"
            onClick={handleNext}
            disabled={isLoading}
            className="flex-1 py-3 bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs rounded-xl shadow-md transition duration-200 flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center space-x-2">
                <Compass className="animate-spin h-4 w-4" />
                <span>Analysing Live Indexes...</span>
              </span>
            ) : (
              <>
                <span>{step === totalSteps ? "Generate My Custom Itinerary" : "Next Step"}</span>
                {step < totalSteps && <ArrowRight className="h-3.5 w-3.5" />}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export interface TripPreference {
  destination: string;
  duration: number;
  travelersCount: number;
  budgetRange: 'budget' | 'moderate' | 'luxury';
  customBudgetINR?: number; // Manual rupee target budget
  isIndianOrigin?: boolean; // Flag for indianized defaults
  transportPreference: 'flight' | 'train' | 'car' | 'public';
  accommodationStyle: 'hostel' | 'hotel' | 'resort' | 'villa' | 'airbnb';
  foodPreferences: string[];
  activityInterests: string[];
  travelGroupType: 'solo' | 'couple' | 'family' | 'friends';
  pace: 'relaxed' | 'moderate' | 'fast-paced';
  specialRequirements: string;
  origin?: string;
  tripType?: 'domestic' | 'interstate' | 'international';
  transitNameOrNumber?: string; // Specific Train/Flight like Vande Bharat or IndiGo
  transitTimeSlot?: string; // Preferred time like Morning, Evening
  transitClass?: string; // Tier/Class like CC, EC, 3AC, Economy
}

export interface HotelRec {
  name: string;
  description: string;
  priceLevel: string;
  rating: number;
  location: string;
  amenities: string[];
  estimatedPricePerNightINR?: number;
  imageUrl?: string;
}

export interface RestaurantRec {
  name: string;
  cuisine: string;
  priceLevel: string;
  rating: number;
  description: string;
  recommendedDishes: string[];
  averageCostPerPersonINR?: number;
  imageUrl?: string;
}

export interface ActivityItem {
  time: string;
  title: string;
  description: string;
  location: string;
  cost: number;
  category: 'transport' | 'accommodation' | 'food' | 'activity' | 'sightseeing';
  duration: string;
  tip?: string;
}

export interface DailySchedule {
  day: number;
  theme: string;
  activities: ActivityItem[];
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: 'transport' | 'accommodation' | 'food' | 'activity' | 'misc';
  paidBy: string;
  splitBetween: string[];
}

export interface CostBreakdown {
  transport: number;
  accommodation: number;
  food: number;
  activities: number;
  misc: number;
}

export interface Itinerary {
  id: string;
  destination: string;
  duration: number;
  preferences: TripPreference;
  totalEstimatedCost: number;
  costBreakdown: CostBreakdown;
  weatherForecast: {
    temp: string;
    condition: string;
    description: string;
  };
  hotelRecommendations: HotelRec[];
  restaurantSuggestions: RestaurantRec[];
  safeAreas: string[];
  crowdLevelPredictions: string;
  travelFatigueTips: string;
  dailySchedule: DailySchedule[];
  packingList: string[];
  createdAt: string;
  isCustom?: boolean;
  apiKeyExpired?: boolean;
  isFallback?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

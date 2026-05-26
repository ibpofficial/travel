import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// Enable CORS for external client access (like GitHub Pages deployments)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type,authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  next();
});

const PORT = 3000;

// Shared Gemini client with safety guards
let aiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not defined in Settings > Secrets. Please add it to compile and use the AI Features.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Curated travel packages served as templates
const CURATED_PACKAGES = [
  {
    id: "pkg-japan",
    destination: "Tokyo & Kyoto, Japan",
    duration: 7,
    totalEstimatedCost: 2450,
    costBreakdown: {
      transport: 650,
      accommodation: 900,
      food: 500,
      activities: 300,
      misc: 100
    },
    preferences: {
      destination: "Tokyo & Kyoto, Japan",
      duration: 7,
      travelersCount: 2,
      budgetRange: "moderate",
      transportPreference: "train",
      accommodationStyle: "hotel",
      foodPreferences: ["Sushi", "Ramen", "Street Food", "Teppanyaki"],
      activityInterests: ["temples", "shopping", "photography", "modern pop-culture"],
      travelGroupType: "couple",
      pace: "moderate",
      specialRequirements: "Requires pocket WiFi recommendation."
    },
    weatherForecast: {
      temp: "18°C / 64°F",
      condition: "Partly Cloudy",
      description: "Wonderful autumn weather. Ideal for walking around temples and garden photography."
    },
    hotelRecommendations: [
      {
        name: "Hotel Gracery Shinjuku",
        description: "Known for the famous Godzilla head, standard cozy rooms right in the center of Shinjuku.",
        priceLevel: "$$$",
        rating: 4.5,
        location: "Kabukicho, Tokyo",
        amenities: ["Free WiFi", "Near Subway", "English speaking staff", "Breakfast buffet"]
      },
      {
        name: "Kyoto Ryokan Sawanoya",
        description: "A traditional wooden Inn featuring cypress baths and tranquil garden settings.",
        priceLevel: "$$$",
        rating: 4.8,
        location: "Gion District, Kyoto",
        amenities: ["Traditional Futons", "Cypress Baths", "Yukata Provided", "In-room tea session"]
      }
    ],
    restaurantSuggestions: [
      {
        name: "Ichiran Ramen Shinjuku",
        cuisine: "Tonkotsu Ramen",
        priceLevel: "$",
        rating: 4.6,
        description: "World-famous single-booth dining experience serving customizable, rich pork-bone ramen.",
        recommendedDishes: ["Classic Tonkotsu Ramen", "Soft Boiled Egg", "Chashu pork"]
      },
      {
        name: "Gion Karyo",
        cuisine: "Kyoto Kaiseki Fine Dining",
        priceLevel: "$$$$",
        rating: 4.9,
        description: "Premium multi-course traditional kaiseki feast inside a preserved historic tea house.",
        recommendedDishes: ["Seasonal Sashimi", "Bamboo Shoot Tempura", "Matcha Custard Dessert"]
      }
    ],
    safeAreas: ["Shinjuku South", "Chiyoda", "Gion Higashi", "Shimogyo-ku"],
    crowdLevelPredictions: "Moderate to high at popular shrines (Kiyomizu-dera). Early mornings (7:00 AM) are highly recommended.",
    travelFatigueTips: "Plan heavy walking in Kyoto on day 3, then allocate day 4 for a slower-paced ryokan day to avoid exhaustion.",
    dailySchedule: [
      {
        day: 1,
        theme: "Arrival & Tokyo Neon Lights",
        activities: [
          {
            time: "02:00 PM",
            title: "Check-in at Shinjuku Hotel",
            description: "Arrive, unpack, and freshen up after flights.",
            location: "Shinjuku, Tokyo",
            cost: 0,
            category: "accommodation",
            duration: "1 hour"
          },
          {
            time: "04:00 PM",
            title: "Shinjuku Gyoen National Garden Walk",
            description: "Relaxing walk through gorgeous landscaped gardens to shake off travel fatigue.",
            location: "Shinjuku Gyoen",
            cost: 5,
            category: "sightseeing",
            duration: "2 hours",
            tip: "Closes at 4:30 PM, make sure to enter before 4:00 PM!"
          },
          {
            time: "07:00 PM",
            title: "Dinner at Ichiran Ramen",
            description: "Grab a delicious hot bowl of custom ramen in Shinjuku.",
            location: "Ichiran Shinjuku East",
            cost: 15,
            category: "food",
            duration: "1 hour"
          },
          {
            time: "08:30 PM",
            title: "Robot & Neon Signs Photography in Kabukicho",
            description: "Explore the bustling streets and view the iconic Godzilla head.",
            location: "Kabukicho, Tokyo",
            cost: 0,
            category: "activity",
            duration: "1.5 hours"
          }
        ]
      },
      {
        day: 2,
        theme: "Tech, Meiji Shrine & Shopping",
        activities: [
          {
            time: "09:00 AM",
            title: "Meiji Jingu Shrine Visit",
            description: "Peaceful morning forest walk in Shibuya to visit the grand wooden historical gate.",
            location: "Yoyogi Kamizonocho",
            cost: 0,
            category: "sightseeing",
            duration: "1.5 hours",
            tip: "Wash hands at the purification fountain before entering."
          },
          {
            time: "11:30 AM",
            title: "Harajuku Takeshita Street",
            description: "Discover eccentric fashion shops, giant cotton candy, and popular crepes.",
            location: "Harajuku, Tokyo",
            cost: 10,
            category: "shopping",
            duration: "2 hours"
          },
          {
            time: "03:00 PM",
            title: "Shibuya Crossing & Hachiko Statue",
            description: "Experience the world's busiest crosswalk from a high vantage point cafe.",
            location: "Shibuya Station",
            cost: 8,
            category: "activity",
            duration: "1.5 hours"
          },
          {
            time: "07:00 PM",
            title: "Izakaya Food Tour in Omoide Yokocho",
            description: "Savor grilled chicken skewers (yakitori) under cozy historic alley lights.",
            location: "Memory Lane, Shinjuku",
            cost: 45,
            category: "food",
            duration: "2.5 hours"
          }
        ]
      }
    ],
    packingList: ["Comfortable tennis shoes", "Light jacket", "Universal power adapter Type A", "Pocket WiFi or eSIM reader", "Cash (Yen) for small stalls"]
  },
  {
    id: "pkg-italy",
    destination: "Amalfi Coast & Rome, Italy",
    duration: 5,
    totalEstimatedCost: 1980,
    costBreakdown: {
      transport: 420,
      accommodation: 750,
      food: 455,
      activities: 250,
      misc: 105
    },
    preferences: {
      destination: "Amalfi Coast & Rome, Italy",
      duration: 5,
      travelersCount: 2,
      budgetRange: "luxury",
      transportPreference: "car",
      accommodationStyle: "villa",
      foodPreferences: ["Pasta", "Gelato", "Seafood", "Espresso", "Fine Wine"],
      activityInterests: ["history", "nature", "photography", "relaxation"],
      travelGroupType: "couple",
      pace: "moderate",
      specialRequirements: "Vegetarian options preferred."
    },
    weatherForecast: {
      temp: "24°C / 75°F",
      condition: "Sunny & Sea Breezes",
      description: "Glorious beach weather in Amalfi. Rome is warm, ideal for evenings near the fountains."
    },
    hotelRecommendations: [
      {
        name: "Hotel Santa Caterina Amalfi",
        description: "A gorgeous historic villa perched over the blue waters with custom sea balconies.",
        priceLevel: "$$$$$",
        rating: 4.9,
        location: "S.S. Amalfitana, Amalfi",
        amenities: ["Private Beach Club", "Saltwater Pool", "Wellness Spa", "Valet Parking"]
      }
    ],
    restaurantSuggestions: [
      {
        name: "Ristorante Marina Grande",
        cuisine: "Mediterranean Marine Cuisine",
        priceLevel: "$$$$",
        rating: 4.7,
        description: "Exquisite outdoor sea terrace serving fresh lemon-flavored local pastas.",
        recommendedDishes: ["Lemon Tagliolini with Prawns", "Grilled Seabass", "Tiramisu"]
      }
    ],
    safeAreas: ["Positano Center", "Rome Trastevere", "Amalfi Harbor District"],
    crowdLevelPredictions: "High around Positano beach; evening strolls (6:00 PM) are much calmer.",
    travelFatigueTips: "Break up the Amalfi steps with water taxi transfers to keep your legs well-rested.",
    dailySchedule: [
      {
        day: 1,
        theme: "Arrival in Rome & Trastevere Evenings",
        activities: [
          {
            time: "01:00 PM",
            title: "Arrive in Rome & Direct Transfer",
            description: "Pick up premium car transfer or rental to your cozy villa/hotel.",
            location: "Rome FCO Airport",
            cost: 80,
            category: "transport",
            duration: "1.5 hours"
          },
          {
            time: "04:00 PM",
            title: "Trastevere Cobblestone Walk & Photography",
            description: "Meander through ivy-clad narrow streets in the oldest Roman neighborhoods.",
            location: "Trastevere, Rome",
            cost: 0,
            category: "sightseeing",
            duration: "2 hours"
          },
          {
            time: "07:00 PM",
            title: "Traditional Roman Dinner",
            description: "Indulge in authentic Cacio e Pepe and slow-cooked local delicacies.",
            location: "Antica Osteria, Rome",
            cost: 65,
            category: "food",
            duration: "2 hours"
          }
        ]
      }
    ],
    packingList: ["Summer dresses / linens", "Sunscreens", "Polarized sunglasses", "Good walking leather sandals"]
  },
  {
    id: "pkg-bali",
    destination: "Seminyak & Ubud, Bali",
    duration: 6,
    totalEstimatedCost: 890,
    costBreakdown: {
      transport: 180,
      accommodation: 330,
      food: 190,
      activities: 130,
      misc: 60
    },
    preferences: {
      destination: "Seminyak & Ubud, Bali",
      duration: 6,
      travelersCount: 2,
      budgetRange: "budget",
      transportPreference: "public",
      accommodationStyle: "villla",
      foodPreferences: ["Indonesian food", "Smoothie Bowls", "Sate", "Nasi Goreng"],
      activityInterests: ["adventure", "nature", "temples", "relaxation"],
      travelGroupType: "friends",
      pace: "relaxed",
      specialRequirements: "Requires scooter rental pointers."
    },
    weatherForecast: {
      temp: "29°C / 84°F",
      condition: "Tropical sun",
      description: "Perfect dry season weather in Bali. Tropical, sunny breeze with cool jungle nights in Ubud."
    },
    hotelRecommendations: [
      {
        name: "Uma Kalai Ubud",
        description: "Breathtaking ecological bamboo treehouses looking directly onto deep jungle ravines.",
        priceLevel: "$$",
        rating: 4.8,
        location: "Ubud jungle periphery",
        amenities: ["Infinity Pool", "Yoga Shala", "Fresh daily organic breakfast", "Free scooter hire advice"]
      }
    ],
    restaurantSuggestions: [
      {
        name: "Naughty Nuri's Ubud",
        cuisine: "Balinese Street Grill",
        priceLevel: "$$",
        rating: 4.7,
        description: "Iconic roadside grill featuring sizzling Balinese ribs and legendary custom shaker martinis.",
        recommendedDishes: ["Sizzling Pork Ribs", "Balinese Sate Lilit", "Stir-fried Kangkung"]
      }
    ],
    safeAreas: ["Ubud Center", "Seminyak Main Street", "Canggu Beachfront"],
    crowdLevelPredictions: "Low at waterfall paths early in the morning, high around Tanah Lot at sunset.",
    travelFatigueTips: "Balance scooter rides with professional Balinese herbal massages key to hydration.",
    dailySchedule: [
      {
        day: 1,
        theme: "Arrive & Sacred Monkey Forest Sanctuary",
        activities: [
          {
            time: "11:00 AM",
            title: "Ubud Arrival & Oasis Check-In",
            description: "Check into a stunning jungle eco-cabin.",
            location: "Sayan, Ubud",
            cost: 0,
            category: "accommodation",
            duration: "1.5 hours"
          },
          {
            time: "02:00 PM",
            title: "Sacred Monkey Forest Exploration",
            description: "Walk amidst ancient banyan trees and watch native macaque monkeys within temple ruins.",
            location: "Padangtegal, Ubud",
            cost: 6,
            category: "sightseeing",
            duration: "2 hours",
            tip: "Do not wear hanging objects or bring food near monkeys."
          },
          {
            time: "06:30 PM",
            title: "Traditional Dinner at Warung",
            description: "Dine on authentic local rice plates with multiple spicy sides.",
            location: "Warung Bintang, Ubud",
            cost: 12,
            category: "food",
            duration: "1.5 hours"
          }
        ]
      }
    ],
    packingList: ["Mosquito repellant", "Saron (for temples)", "Swimwear", "Water shoes", "Sunscreen"]
  }
];

// 1. GET Curated packages
app.get("/api/curated-packages", (req, res) => {
  res.json(CURATED_PACKAGES);
});

// 2. POST Generate Itinerary using Gemini 3.5-flash
function generateDynamicFallbackItinerary(preferences: any): any {
  const dest = preferences.destination || "Goa, India";
  const duration = Number(preferences.duration) || 5;
  const travelers = Number(preferences.travelersCount) || 1;
  
  // Cost breakdown calculation (All in INR)
  let totalCap = preferences.customBudgetINR;
  if (!totalCap) {
    const rate = preferences.budgetRange === 'budget' ? 2500 : preferences.budgetRange === 'luxury' ? 12000 : 5500;
    totalCap = rate * duration * travelers;
  }
  
  const transport = Math.round(totalCap * 0.25);
  const accommodation = Math.round(totalCap * 0.35);
  const food = Math.round(totalCap * 0.20);
  const activities = Math.round(totalCap * 0.15);
  const misc = Math.round(totalCap * 0.05);
  const totalCost = transport + accommodation + food + activities + misc;

  // Food preferences adjustments
  const foods = preferences.foodPreferences || [];
  const isVeg = foods.includes('indian-veg') || foods.includes('jain-veg') || foods.includes('vegetarian');
  const isJain = foods.includes('jain-veg');
  const isStreet = foods.includes('street-food');
  
  // Dynamic Restaurants
  const restaurantSuggestions = [
    {
      name: isJain ? "Paras Jain Bhojanalaya" : (isVeg ? "Swaad Pure Vegetarian Feast" : "The Imperial Zaika & Biryani Palace"),
      cuisine: isJain ? "Traditional Jain Cuisine" : (isVeg ? "North & South Indian Vegetarian" : "Mughlai & Local Coastal Specialties"),
      priceLevel: preferences.budgetRange === 'budget' ? "₹ Budget" : (preferences.budgetRange === 'luxury' ? "₹₹ luxury" : "₹₹ Moderate"),
      rating: 4.7,
      description: `A highly-rated regional signature kitchen featuring fresh hygiene prep, locally sourced spices, and elegant fine-dining ambiance. Ideal for customized ${isVeg ? "Veg" : "Indian & Continental"} dining.`,
      recommendedDishes: isJain 
        ? ["Sada Special Khichdi", "Jain Paneer Butter Masala", "Tawa Rotis with Desi Ghee", "Almond Basundi"]
        : (isVeg 
          ? ["Sizzling Paneer Butter Masala", "Dal Makhani with Butter Naan", "Crispy Masala Dosa", "Kesari Kheer"]
          : ["Special Chicken Dum Biryani", "Butter Chicken", "Mutton Rogan Josh", "Garlic Butter Naan"]),
      averageCostPerPersonINR: preferences.budgetRange === 'budget' ? 250 : (preferences.budgetRange === 'luxury' ? 1800 : 650),
      imageUrl: isVeg 
        ? "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop" 
        : "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop"
    },
    {
      name: isStreet ? "Challenger Street Chaat Lane" : "Golden Saffron Multi-Cuisine Bistro",
      cuisine: isStreet ? "Indian Chaat, Street Eats & Masala Tea" : "Standard North Indian & Local Fusion",
      priceLevel: "₹ Budget",
      rating: 4.5,
      description: "Always bustling visual delight. High standard verified street snacks and hot Adrak Wali Chai loved by locals and incoming group tourists.",
      recommendedDishes: isStreet 
        ? ["Gol Gappe / Pani Puri", "Special Aloo Tikki Chaat", "Mumbai Vada Pav", "Ginger Cardamom Chai"]
        : ["Spiced Club Sandwich", "Hakki Veg Noodles", "Warm Sizzling Brownie", "Mango Lassi"],
      averageCostPerPersonINR: isStreet ? 120 : 350,
      imageUrl: isStreet 
        ? "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?q=80&w=600&auto=format&fit=crop" 
        : "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600&auto=format&fit=crop"
    }
  ];

  // Dynamic Hotels
  const hotelRecommendations = [
    {
      name: preferences.accommodationStyle === 'hostel' ? "Zostel Tourist Backpackers" 
            : preferences.accommodationStyle === 'resort' ? "The Blue Horizon Beachfront Resort" 
            : preferences.accommodationStyle === 'villa' ? "Grand Regal Luxury Private Villa" 
            : "The Royal Orchid Comfort Residency",
      description: `Comfortable, highly recommended stay choice catering perfectly to your ${preferences.travelGroupType} getaway. Offers spacious clean rooms, modern bathrooms, prompt room services, and round-the-clock staff assistance.`,
      priceLevel: preferences.budgetRange === 'budget' ? "₹ Budget" : (preferences.budgetRange === 'luxury' ? "₹₹ luxury" : "₹₹ Moderate"),
      rating: 4.8,
      location: "Centrally connected safe tourist corridor",
      amenities: ["Free High-Speed WiFi", "Air Conditioning", "24/7 Security & CCTV", "Welcome Drink", "UPI Payment support", "Doctor on call"],
      estimatedPricePerNightINR: preferences.budgetRange === 'budget' ? 1200 : (preferences.budgetRange === 'luxury' ? 14500 : 4200),
      imageUrl: preferences.accommodationStyle === 'hostel' 
        ? "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=600&auto=format&fit=crop"
        : preferences.accommodationStyle === 'resort' 
        ? "https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=600&auto=format&fit=crop"
        : preferences.accommodationStyle === 'villa' 
        ? "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=600&auto=format&fit=crop"
        : "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600&auto=format&fit=crop"
    }
  ];

  // Daily Schedule builder
  const dailySchedule: any[] = [];
  const interests = preferences.activityInterests || [];
  
  const generalActivities = [
    { title: "Bespoke Heritage Walk & Photo Diary", location: "Ancient Clock Tower & Local Bazaars", duration: "2 hours", cat: "sightseeing" as const },
    { title: "Scenic Nature Trek & Viewpoint Loop", location: "Local Valley Overlook Point", duration: "3 hours", cat: "sightseeing" as const },
    { title: "Traditional Handloom & Souvenir Hunt", location: "Regional Artisan Handicrafts Market", duration: "2 hours", cat: "activity" as const },
    { title: "Ayurvedic Herbal Treatment / Spa Day", location: "Wellness Sanctuary Center", duration: "1.5 hours", cat: "activity" as const },
    { title: "Scenic Sunset Photography Walk", location: "Panoramic Golden Hour Ridge", duration: "2 hours", cat: "sightseeing" as const },
    { title: "Architectural Fort Tour & Audioguide", location: "Preserved Historic Fort Complex", duration: "2.5 hours", cat: "sightseeing" as const }
  ];

  for (let d = 1; d <= duration; d++) {
    const theme = d === 1 ? "Arrival & Local Ground Orientation" 
                 : d === duration ? "Last-minute Shopping & Sweet Departure"
                 : `Day ${d}: Immersive Heritage Trail & Cultural Treasures`;
                 
    const dayActivities: any[] = [];
    
    // Day 1: check-in activity at hotel first (and optionally initial custom transit)
    if (d === 1) {
      if (preferences.transitNameOrNumber) {
        dayActivities.push({
          time: preferences.transitTimeSlot ? (preferences.transitTimeSlot.match(/\d+:\d+ [AP]M/)?.[0] || "08:15 AM") : "08:15 AM",
          title: `Depart via ${preferences.transitNameOrNumber} (${preferences.transitClass || "Standard Travel Tier"})`,
          description: `Boarding ${preferences.transitNameOrNumber} departing during the preferred ${preferences.transitTimeSlot || 'scheduled hours'} for a highly comfortable transit to your destination.`,
          location: preferences.origin || "Origin Transit Terminal",
          cost: Math.round(transport * 0.75),
          category: "transport",
          duration: "4.5 hours",
          tip: "Keep your tickets/IDs accessible and track platform schedules dynamically via authorized transit apps."
        });
        
        dayActivities.push({
          time: "02:30 PM",
          title: "Stay Check-In, Verification & Refreshments",
          description: "Arrive at your destination, register at the lobby, and settle in with a refreshing welcome drink.",
          location: hotelRecommendations[0].name,
          cost: 0,
          category: "accommodation",
          duration: "1.5 hours",
          tip: "Sip on fresh local refreshments served complimentary during onboarding."
        });
      } else {
        dayActivities.push({
          time: "11:30 AM",
          title: "Stay Check-In, Verification & Refreshments",
          description: "Arrive at your destination, register at the lobby, and settle in with a refreshing welcome drink.",
          location: hotelRecommendations[0].name,
          cost: 0,
          category: "accommodation",
          duration: "1.5 hours",
          tip: "Enjoy fresh Nimbu Pani or local Sweet Lassi served free at registration."
        });
      }
    } else {
      const actPool = generalActivities[d % generalActivities.length];
      dayActivities.push({
        time: "09:00 AM",
        title: actPool.title,
        description: "Embark on an outstanding morning walk guided by native highlights. Perfect to capture clear golden hour shadows.",
        location: actPool.location,
        cost: Math.round(activities * 0.1 / duration),
        category: actPool.cat,
        duration: actPool.duration,
        tip: "Wear soft walking shoes and carry a light umbrella for sudden shifts."
      });
    }

    // Lunch
    dayActivities.push({
      time: "01:00 PM",
      title: "Gastronomic Trail: Premium Lunch Feast",
      description: `Fabulous regional cooking. Fully responsive to your personalized food settings emphasizing ${isVeg ? "pure vegetarian specialty" : "multi-cuisine delicacies"}.`,
      location: restaurantSuggestions[0].name,
      cost: Math.round(food * 0.15 / duration),
      category: "food",
      duration: "1.2 hours",
      tip: isJain ? "Make sure to request no onion/garlic dishes at the service station." : undefined
    });

    // Evening explore
    const eveningAct = generalActivities[(d + 1) % generalActivities.length];
    dayActivities.push({
      time: "04:30 PM",
      title: eveningAct.title,
      description: "Wonderful leisurely exploration. Mingle with local artisans and find excellent spots for souvenirs.",
      location: eveningAct.location,
      cost: Math.round(activities * 0.08 / duration),
      category: eveningAct.cat,
      duration: eveningAct.duration,
      tip: "UPI (Google Pay/PhonePe) is universally accepted by local roadside vendors here."
    });

    // Dinner
    dayActivities.push({
      time: "08:15 PM",
      title: "Cozy Ambient Dinner Experience",
      description: "Winding down the day with a savory culinary journey. Try native cardamom-dressed desserts.",
      location: restaurantSuggestions[1].name,
      cost: Math.round(food * 0.12 / duration),
      category: "food",
      duration: "1.5 hours"
    });

    dailySchedule.push({
      day: d,
      theme: theme,
      activities: dayActivities
    });
  }

  return {
    id: `iti-fallback-${Date.now()}`,
    destination: dest,
    duration: duration,
    isFallback: true,
    apiKeyExpired: true,
    totalEstimatedCost: totalCost,
    costBreakdown: {
      transport,
      accommodation,
      food,
      activities,
      misc
    },
    weatherForecast: {
      temp: "29°C / 84°F",
      condition: "Pleasant & Clear",
      description: "Mild regional sun, breezy evenings. Perfect weather to tour landmarks."
    },
    hotelRecommendations,
    restaurantSuggestions,
    safeAreas: ["Central Heritage Square", "Civil Lines Tourist Corridor", "Main Boardwalk District"],
    crowdLevelPredictions: "Light to moderate tourist density. Slower queuing delays during mid-afternoon timings.",
    travelFatigueTips: "Stay supercharged! Sip on sweet coconut water, refreshing Lassi, or hot ginger tea frequently, and space out walking routes.",
    packingList: ["Comfortable cotton apparel", "High-protection Sunscreen (SPF 50+)", "Premium walking sandals", "A trusted umbrella / cap", "A secure UPI / Cash pocket wallet"],
    dailySchedule,
    preferences,
    createdAt: new Date().toISOString()
  };
}

app.post("/api/generate-itinerary", async (req, res) => {
  const preferences = req.body;
  try {
    const ai = getGemini();

    const systemPrompt = `You are an expert AI Travel Planner catering to Indian travelers. 
Your goal is to generate a fully customized, highly organized, and optimized travel itinerary in JSON format matching our Type schemas.
CRITICAL: Return ONLY valid, minified JSON content. Do not include any markdown fences (\`\`\`json) or additional text outside the JSON block.

CURRENCY MANDATE:
Perform all cost computations, breakdown estimates, and scheduling prices STRICTLY in Indian Rupees (₹ / INR). 
- Do NOT use USD ($). Do NOT use any other currency.
- All numbers returned in JSON (like "totalEstimatedCost", "cost" in activity items, and "costBreakdown" fields "transport", "accommodation", "food", "activities", "misc") must represent numeric values in Indian Rupees (INR). For example, a total budget of ₹ 45,000 should be returned as 45000.
${preferences.customBudgetINR ? `- The user has specified a STRICT manual budget ceiling of ₹ ${preferences.customBudgetINR} INR. You MUST optimize all choices (lodges, restaurants, activities, transits) to fit beautifully and provide the absolute maximum value and security within this ₹ ${preferences.customBudgetINR} target limit!` : `- Calibrate cost totals to a ${preferences.budgetRange} financial bracket in Indian Rupees (INR).`}

Schema format references:
- We need:
  - "destination": destination string.
  - "duration": numeric days.
  - "totalEstimatedCost": number (representing the sum of the breakdown in Indian Rupees ₹).
  - "costBreakdown": { "transport": number, "accommodation": number, "food": number, "activities": number, "misc": number }. (All numbers in INR)
  - "weatherForecast": { "temp": "e.g. 32°C", "condition": "e.g. Sunny", "description": "e.g. mild winds and clear skies" }.
  - "hotelRecommendations": array of { name, description, priceLevel (e.g., "₹ Budget", "₹₹ Moderate", "₹₹ luxury"), estimatedPricePerNightINR: number (exact numeric per-night cost in Rupees), rating (0-5), location, amenities (array of string) }.
  - "restaurantSuggestions": array of { name, cuisine, priceLevel, rating (0-5), description, recommendedDishes (array of strings), averageCostPerPersonINR: number (exact estimated meal cost per person in Rupees) }.
  - "safeAreas": array of safe neighborhood/area string names.
  - "crowdLevelPredictions": string warning about tourist crowd spikes, queuing alerts, or best time-slots.
  - "travelFatigueTips": suggestions to keep active, stay hydrated (suggesting coconut water, lassi, or chai if appropriate) and minimize fatigue.
  - "packingList": array of strings.
  - "dailySchedule": array of { day: number, theme: string, activities: array of { time: "HH:MM AM/PM", title, description, location, cost: number, category: "transport"|"accommodation"|"food"|"activity"|"sightseeing", duration, tip } }. (Cost is in Indian Rupees)

Keep the daily schedule detailed for every single day up to the specified duration (${preferences.duration} days). Since the user wants an optimized trip, ensure the route makes geographic sense. Make sure to tailor specific activities to traveler preferences and style: ${preferences.activityInterests.join(', ')}. Include special attention to requirements: ${preferences.specialRequirements || "None"}.
Also take into consideration the origin of travel: "${preferences.origin || "Delhi (DEL)"}" and travel scope/type: "${preferences.tripType || "domestic"}" (e.g., domestic, interstate, or international travel). Tailor transport recommendations, durations, budgets, tips, and guidelines according to this origin and travel scope. If domestic or interstate, avoid international flight suggestions where unnecessary - suggest local domestic air, high speed rail (e.g., Vande Bharat, Shatabdi), or highway routes. Keep distances realistic and logical from the origin location.
${preferences.transitNameOrNumber ? `CRITICAL TRANSIT INTEGRATION: The user is traveling via "${preferences.transitNameOrNumber}"${preferences.transitTimeSlot ? ` during "${preferences.transitTimeSlot}"` : ""}${preferences.transitClass ? ` under "${preferences.transitClass}" class` : ""}. You MUST integrate this specific transit service, along with its specific timing, directly as the principal transport activity on Day 1 (and/or return trip on the final Day ${preferences.duration})! Design the entire daily schedule to fit around this departure and arrival physical constraint.` : ""}`;

    const userPrompt = `Generate a fully realized travel itinerary for ${preferences.duration} days in ${preferences.destination}.
Origin Location (Starting Point): ${preferences.origin || "Delhi (DEL)"}
Travel Scope (Type): ${preferences.tripType || "domestic"} (domestic, interstate, or international)
Travelers: ${preferences.travelersCount}
Group type: ${preferences.travelGroupType}
${preferences.customBudgetINR ? `STRICT target budget: ₹ ${preferences.customBudgetINR} INR` : `Budget level: ${preferences.budgetRange}`}
Selected pacing: ${preferences.pace}
Transportation: ${preferences.transportPreference} ${preferences.transitNameOrNumber ? `(via ${preferences.transitNameOrNumber}, Time: ${preferences.transitTimeSlot || 'Not specified'}, Class: ${preferences.transitClass || 'Not specified'})` : ""}
Food: ${preferences.foodPreferences.join(', ')} (Highlight pure veg or Jain options prominently if selected)
Interests: ${preferences.activityInterests.join(', ')}
Special comments: ${preferences.specialRequirements}
Specific transit details to plan: Name: ${preferences.transitNameOrNumber || "none"}, Departure Time: ${preferences.transitTimeSlot || "none"}, Class: ${preferences.transitClass || "none"}

Make it feel extremely realistic, utilizing real landmarks, local Indian dishes if appropriate (or native specialties of destination), and cultural/religious custom instructions if required. Check safety aspects and best times. Determine if travel between origin and destination is domestic, interstate, or international, and align the travel logistics, transport costs/tips, and daily schedules with that logic. Return costs in INR.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        temperature: 0.7,
      }
    });

    const textOutput = response.text || "{}";
    let cleanedText = textOutput.trim();
    // Sometimes models still include markdown wrappers, clean them safely
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.substring(7);
    }
    if (cleanedText.endsWith("```")) {
      cleanedText = cleanedText.substring(0, cleanedText.length - 3);
    }
    cleanedText = cleanedText.trim();

    try {
      const parsedItinerary = JSON.parse(cleanedText);
      // Attach an ID & preferences
      parsedItinerary.id = `iti-${Date.now()}`;
      parsedItinerary.preferences = preferences;
      parsedItinerary.createdAt = new Date().toISOString();
      parsedItinerary.isCustom = true;
      res.json(parsedItinerary);
    } catch (parseErr) {
      console.error("Failed to parse Gemini JSON output:", cleanedText, parseErr);
      // Generate fallback inside parse error
      const offlineItinerary = generateDynamicFallbackItinerary(preferences);
      res.json(offlineItinerary);
    }

  } catch (err: any) {
    console.error("Itinerary Generation Warning (falling back gracefully):", err);
    // Graceful customized fallback with explicit warning
    const offlineItinerary = generateDynamicFallbackItinerary(preferences);
    res.json(offlineItinerary);
  }
});

// 3. POST AI Chatbot Conversation and real-time Itinerary Modifier
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history, itinerary } = req.body;
    const ai = getGemini();

    const systemPrompt = `You are a helpful and knowledgeable AI Travel Assistant. The user is currently planning or viewing a trip to ${itinerary ? itinerary.destination : "their desired destination"}.
Listen to the user query carefully. You must reply to them conversationally, answering questions about sights, packing tips, language, culture, custom costs, safety, and transportation.

CRITICAL FEATURE: If the user explicitly asks to modify, rearrange, add, remove, or swap elements of their current itinerary (e.g., 'replace Day 1 morning activity with a cooking class', 'swap the hotel to something budgeted', 'change trip duration to 3 days', 'remove temple visits'), you must perform this action and return the updated structured itinerary.
In your JSON response, you MUST provide two properties:
1. "reply": A friendly, clear, markdown-formatted text response addressing the user's questions or confirming the adjustments you made. Keep it conversational but concise.
2. "updatedItinerary": (OPTONAL) The fully revised Itinerary object representing the changes they requested. Only provide this if they asked for a physical change to the schedule, accommodation, pacing, or structure of the trip. If no change is requested, omit this field or return null.

Format your entire response as a single, valid JSON object with the active schema:
{
  "reply": "Conversational markdown text string...",
  "updatedItinerary": ItineraryJSON or null
}

Here is the user's current Itinerary data for reference:
${itinerary ? JSON.stringify(itinerary, null, 2) : "No active itinerary selected yet."}`;

    // Structure chat contents
    const contentHistory = (history || []).map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.text }]
    }));

    // Append latest prompt
    contentHistory.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contentHistory,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        temperature: 0.7,
      }
    });

    const textOutput = response.text || "{}";
    let cleanedText = textOutput.trim();
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.substring(7);
    }
    if (cleanedText.endsWith("```")) {
      cleanedText = cleanedText.substring(0, cleanedText.length - 3);
    }
    cleanedText = cleanedText.trim();

    try {
      const result = JSON.parse(cleanedText);
      res.json(result);
    } catch (parseErr) {
      console.error("Failed to parse Gemini Chat JSON:", cleanedText, parseErr);
      res.status(500).json({
        error: "Failed to process chat response.",
        rawText: cleanedText
      });
    }

  } catch (err: any) {
    console.error("AI Chatbot Warning (falling back gracefully):", err);
    res.json({
      reply: "⚠️ **Gemini API Key Expired Warning**\n\nYour active Gemini AI model returned an expired API key error. To restore real-time conversational chat, go to the **Settings > Secrets** menu and refresh your `GEMINI_API_KEY`! \n\n*In the meantime, the offline-synthesis engine has loaded your tailored Indian traveler schedule in Rupees completely offline! You may continue browsing or print the itinerary.*",
      updatedItinerary: null
    });
  }
});

// Serve frontend assets & configure Dev / Production server patterns
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Mount Vite development middlewares
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve the compiled dist static assets
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Travel Planner full-stack server running on http://localhost:${PORT}`);
  });
}

startServer();

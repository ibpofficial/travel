import { Compass, Mail, Shield, ShieldCheck, Globe } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <Compass className="h-4 w-4" />
              </div>
              <span className="text-white font-bold font-display tracking-tight text-lg">AeroPlan</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed max-w-xs">
              Next-generation travel agency using generative AI to engineer bespoke, localized, and contextually aware trip itineraries.
            </p>
          </div>

          <div>
            <h4 className="text-white text-xs font-mono font-bold tracking-wider uppercase mb-4">Core Systems</h4>
            <ul className="space-y-2 text-xs">
              <li>Gemini-3.5 Itinerary Optimizer</li>
              <li>Dual-tier Cost Estimation</li>
              <li>Real-time Weather Packager</li>
              <li>SafeStay Geocoding Engine</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-xs font-mono font-bold tracking-wider uppercase mb-4">Special Services</h4>
            <ul className="space-y-2 text-xs">
              <li>Group Expense Splitter</li>
              <li>Fatigue Pacing Calibrator</li>
              <li>Offline HTML Generation</li>
              <li>Custom Co-Pilot Interaction</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-xs font-mono font-bold tracking-wider uppercase mb-4">AeroPlan Compliance</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-xs">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>SSL Encryption Secured</span>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <Globe className="h-4 w-4 text-brand-500" />
                <span>Global Multi-Agent Grounding</span>
              </div>
              <p className="text-[10px] text-gray-600">
                All itinerary costs match standard seasonal market indices. Powered safely with Gemini models.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-600">
          <p>© {new Date().getFullYear()} AeroPlan Inc. Crafted in Google AI Studio Build.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <a href="#" className="hover:text-gray-400 transition">Terms of Use</a>
            <a href="#" className="hover:text-gray-400 transition">Privacy Policy</a>
            <a href="#" className="hover:text-gray-400 transition">Agent Schema</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

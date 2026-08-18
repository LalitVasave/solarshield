import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { apiFetch } from '../utils/api';

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};
const center = {
  lat: 34.0522, // Placeholder center for now
  lng: -118.2437
};

export default function Dashboard() {
  const [farmStatus, setFarmStatus] = useState(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  useEffect(() => {
    // Fetch live farm status
    apiFetch('/farms/FARM-001/panels/status')
      .then(data => setFarmStatus(data))
      .catch(err => console.error("Failed to fetch farm status:", err));
  }, []);

  return (
    <div className="flex flex-1 relative overflow-hidden w-full h-full">
      {/* Map Canvas */}
      <main className="flex-1 relative bg-surface-container-low w-full h-full">
        {isLoaded ? (
          <div className="absolute inset-0 w-full h-full">
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={center}
              zoom={14}
              options={{
                mapTypeId: 'satellite',
                disableDefaultUI: true,
              }}
            >
            </GoogleMap>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center font-label-md text-secondary">
            Loading Google Maps...
          </div>
        )}

        {/* Floating Search Bar */}
        <div className="absolute top-md left-md z-10 w-96 max-w-[calc(100vw-32px)]">
          <div className="relative bg-surface-container-lowest rounded-lg shadow-[0px_4px_12px_rgba(30,41,59,0.05)] border border-outline-variant flex items-center px-sm py-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary-fixed transition-all">
            <span className="material-symbols-outlined text-on-surface-variant mr-xs">search</span>
            <input className="w-full bg-transparent border-none p-0 focus:ring-0 font-body-md text-on-surface placeholder:text-on-surface-variant/50 outline-none" placeholder="Search farms, regions, or alerts..." type="text"/>
            <button className="material-symbols-outlined text-secondary hover:text-primary transition-colors ml-xs cursor-pointer">tune</button>
          </div>
        </div>

        {/* Map Controls */}
        <div className="absolute bottom-md right-md flex flex-col gap-sm z-10">
          <button className="w-10 h-10 bg-surface-container-lowest rounded-full border border-outline-variant shadow-[0px_4px_12px_rgba(30,41,59,0.05)] flex items-center justify-center text-on-surface hover:text-primary transition-colors cursor-pointer">
            <span className="material-symbols-outlined">add</span>
          </button>
          <button className="w-10 h-10 bg-surface-container-lowest rounded-full border border-outline-variant shadow-[0px_4px_12px_rgba(30,41,59,0.05)] flex items-center justify-center text-on-surface hover:text-primary transition-colors cursor-pointer">
            <span className="material-symbols-outlined">remove</span>
          </button>
          <button className="w-10 h-10 bg-surface-container-lowest rounded-full border border-outline-variant shadow-[0px_4px_12px_rgba(30,41,59,0.05)] flex items-center justify-center text-on-surface hover:text-primary transition-colors mt-xs cursor-pointer">
            <span className="material-symbols-outlined">my_location</span>
          </button>
        </div>
      </main>

      {/* Side Panel: Farm Overview */}
      <aside className="hidden lg:flex flex-col w-80 bg-surface-container-lowest border-l border-outline-variant shadow-[-4px_0_24px_rgba(30,41,59,0.02)] z-30 overflow-y-auto">
        {/* Panel Header */}
        <div className="p-md border-b border-outline-variant bg-surface-bright sticky top-0 z-10">
          <div className="flex justify-between items-start mb-sm">
            <div>
              <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Farm Alpha-1</h2>
              <p className="font-body-sm text-body-sm text-secondary mt-base">Active Monitoring</p>
            </div>
            <button className="text-secondary hover:text-on-surface transition-colors cursor-pointer">
              <span className="material-symbols-outlined">more_vert</span>
            </button>
          </div>
          <div className="flex gap-sm">
            <span className="inline-flex items-center gap-xs px-2 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm">
              <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
              Optimal
            </span>
            <span className="inline-flex items-center gap-xs px-2 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">
              24.5 MW Cap
            </span>
          </div>
        </div>

        <div className="p-md flex flex-col gap-md">
          {/* Key Metric: Total Yield Bento Box */}
          <div className="bg-surface-bright border border-outline-variant rounded-lg p-sm hover:shadow-[0px_4px_12px_rgba(30,41,59,0.05)] transition-shadow">
            <div className="flex items-center justify-between mb-sm">
              <h3 className="font-label-md text-label-md text-secondary flex items-center gap-xs">
                <span className="material-symbols-outlined text-[18px]">bolt</span>
                Total Yield Today
              </h3>
              <span className="material-symbols-outlined text-secondary text-[16px]">info</span>
            </div>
            <div className="flex items-end gap-sm">
              <span className="font-headline-lg text-headline-lg font-bold text-on-surface">18.2</span>
              <span className="font-body-sm text-body-sm text-secondary mb-1">MWh</span>
            </div>
            {/* Progress Bar */}
            <div className="mt-sm">
              <div className="flex justify-between font-label-sm text-label-sm text-secondary mb-xs">
                <span>Progress to Target</span>
                <span className="text-primary">92%</span>
              </div>
              <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>
          </div>

          {/* Active Panels & Issues Grid */}
          <div className="grid grid-cols-2 gap-sm">
            <div className="bg-surface-bright border border-outline-variant rounded-lg p-sm">
              <h3 className="font-label-md text-label-md text-secondary mb-xs">Active Panels</h3>
              <div className="font-headline-md text-headline-md font-semibold text-on-surface">
                {farmStatus ? (farmStatus.total - (farmStatus.anomalies_detected || 0)) : '12,450'}
              </div>
              <div className="font-label-sm text-label-sm text-secondary mt-base">99.8% Uptime</div>
            </div>
            <div className="bg-error-container/20 border border-error-container/50 rounded-lg p-sm">
              <h3 className="font-label-md text-label-md text-error mb-xs">Issues</h3>
              <div className="font-headline-md text-headline-md font-semibold text-on-error-container">
                {farmStatus ? farmStatus.anomalies_detected : '0'}
              </div>
              <div className="font-label-sm text-label-sm text-secondary mt-base">Requires Action</div>
            </div>
          </div>

          {/* Weather Forecast Widget */}
          <div className="bg-surface-bright border border-outline-variant rounded-lg overflow-hidden">
            <div className="bg-surface-container-low px-sm py-xs border-b border-outline-variant flex justify-between items-center">
              <h3 className="font-label-md text-label-md text-on-surface">Local Weather</h3>
              <span className="font-label-sm text-label-sm text-secondary">Next 24h</span>
            </div>
            <div className="p-sm flex items-center justify-between">
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-[32px] text-tertiary-container">wb_sunny</span>
                <div>
                  <div className="font-headline-sm text-headline-sm text-on-surface">72°F</div>
                  <div className="font-label-sm text-label-sm text-secondary">Clear skies</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-label-md text-label-md text-on-surface">Irradiance</div>
                <div className="font-label-sm text-label-sm text-primary">High</div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button className="w-full bg-primary text-on-primary font-label-md text-label-md py-sm rounded-lg hover:bg-surface-tint transition-colors mt-auto flex items-center justify-center gap-xs cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">summarize</span>
            Generate Farm Report
          </button>
        </div>
      </aside>
    </div>
  );
}

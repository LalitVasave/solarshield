import React from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

export default function LiveStream() {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });
  return (
    <div className="flex flex-col h-full bg-background text-on-background min-h-[calc(100vh-64px)] overflow-y-auto w-full">
      {/* Main Content Canvas */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-md md:py-lg grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Center/Left Column: Video Feeds */}
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-gutter">
          {/* Header for Stream */}
          <div className="flex justify-between items-end mb-2">
            <div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface mb-1">Sector 4 Aerial Survey</h1>
              <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">location_on</span>
                Mojave Solar Array Alpha
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-error-container text-on-error-container ml-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-error mr-1.5 blinking-dot"></span> Live
                </span>
              </p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-white text-on-surface border border-outline-variant rounded-md font-label-md text-label-md hover:bg-surface-container-low transition-colors flex items-center gap-2 shadow-sm cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">fullscreen</span>
                Expand
              </button>
            </div>
          </div>
          
          {/* Primary Video Feed Container */}
          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-inverse-surface shadow-sm border border-outline-variant group">
            {/* Video Feed Image Placeholder */}
            <div className="absolute inset-0 w-full h-full" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDZubVeTgdIWcETyspJBxVLe5GmTeE3fOLYrpwEoZ0MKOyrd_XWYR2b1V0AH3OBPT-1XwyWm4h9fICoAoMg62ZOuE5zCGrSFAa3eryrtvsHJbQRIqDm8K_M81uHSWgY27v758xrj7SbAoGN2r4W1VSBX_1G_BzW6AJhmkarhGhi-vUDdMeUqLfX-etrgIaVYqBsGmCisWgtGM0qB8ofT1EYTc_vVRXNtIDHhiS-bcoLjcsXiiQwSY0H')" }}></div>
            
            {/* Telemetry Overlay (Bottom) */}
            <div className="absolute bottom-0 left-0 right-0 p-md telemetry-overlay flex justify-between items-end">
              <div className="flex gap-md">
                {/* Telemetry Pill 1 */}
                <div className="bg-inverse-surface/80 backdrop-blur-md border border-outline-variant/30 px-3 py-2 rounded-lg text-white flex flex-col">
                  <span className="font-label-sm text-label-sm text-surface-variant opacity-80 uppercase tracking-wider">Altitude</span>
                  <span className="font-headline-sm text-headline-sm font-mono">124.5 m</span>
                </div>
                {/* Telemetry Pill 2 */}
                <div className="bg-inverse-surface/80 backdrop-blur-md border border-outline-variant/30 px-3 py-2 rounded-lg text-white flex flex-col">
                  <span className="font-label-sm text-label-sm text-surface-variant opacity-80 uppercase tracking-wider">Speed</span>
                  <span className="font-headline-sm text-headline-sm font-mono">15 km/h</span>
                </div>
              </div>
              <div className="flex gap-md text-white items-center">
                <div className="flex items-center gap-1 font-mono text-sm bg-inverse-surface/80 px-2 py-1 rounded">
                  <span className="material-symbols-outlined text-[16px]">battery_5_bar</span>
                  78%
                </div>
                <div className="flex items-center gap-1 font-mono text-sm bg-inverse-surface/80 px-2 py-1 rounded">
                  <span className="material-symbols-outlined text-[16px]">signal_cellular_4_bar</span>
                  98ms
                </div>
                <div className="font-mono text-xs opacity-80 text-right">
                  LAT 35.0512° N<br/>LON 118.1561° W
                </div>
              </div>
            </div>
            
            {/* Crosshair/Center Reticle UI */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-40">
              <div className="w-16 h-16 border border-white/50 rounded-full flex items-center justify-center">
                <div className="w-1 h-1 bg-error rounded-full"></div>
              </div>
              <div className="absolute w-full h-[1px] bg-white/20 top-1/2 -translate-y-1/2"></div>
              <div className="absolute h-full w-[1px] bg-white/20 left-1/2 -translate-x-1/2"></div>
            </div>
          </div>
          
          {/* Secondary Fleet Feeds Gallery */}
          <div>
            <h3 className="font-label-md text-label-md text-on-surface-variant mb-3 uppercase tracking-wider">Active Fleet (3)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Feed 1 (Active) */}
              <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-primary shadow-sm cursor-pointer">
                <div className="absolute inset-0 w-full h-full bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA6gWz4Gq-MPjHGk3TJwsWojmx5xgPqMSOUPDBqJbIo3VECAL0x1U_-XqsaiOsII1zeRYq6l-cNQ9rAvVLUfdGCmfCrieQPl2ZPgm8MlosrRJcR14rPkrTtDTJiUdr61u-jt7cSj3GmPUkmmo8r32NRqa-1ph6ZwzYD7ZBoMMUcYpEBDvPm9XY7LnUj7WlIBSuAM8yLU11X10iBcUPv6BBeV1q-_XZubiru1EW4Y1_U1P9VOy2iFX8n')" }}></div>
                <div className="absolute top-1 left-1 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">Drone 1 (Main)</div>
              </div>
              {/* Feed 2 */}
              <div className="relative aspect-video rounded-lg overflow-hidden border border-outline-variant opacity-70 hover:opacity-100 transition-opacity cursor-pointer">
                <div className="absolute inset-0 w-full h-full bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD9oRpRSD3yPZyAzJzDHNpUDFLs5wwv9rejsa-QvIkaP8vP-FcglNqjTHDoAJa5GUzSjVpXfThulUx8a4O0Us4YBdx2k_RrdfALEEycAFg78Nb7yTLxSVXUCu_JkFSF_JAcW7jV0M3lUz9izu42nq7b70pQve_TU7Otbdbr6qKdj93mc5y8D4xLbiBYcG31btUp2Uda16WLR6J8wT3hpxyIbJbOeg9gS9kGW0B6HNm2jbacGKtJnHfq')" }}></div>
                <div className="absolute top-1 left-1 bg-inverse-surface/80 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-sm">Drone 2</div>
                <div className="absolute bottom-1 right-1 text-error text-[10px] font-bold bg-white/90 px-1 rounded flex items-center gap-1">
                  <span className="material-symbols-outlined text-[10px]">warning</span> Alert
                </div>
              </div>
              {/* Feed 3: Drone Location Map */}
              <div className="relative aspect-video rounded-lg overflow-hidden border border-outline-variant opacity-70 hover:opacity-100 transition-opacity cursor-pointer">
                {isLoaded ? (
                  <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    center={{ lat: 33.738, lng: -112.186 }}
                    zoom={16}
                    options={{ mapTypeId: 'satellite', disableDefaultUI: true }}
                  >
                    <Marker position={{ lat: 33.738, lng: -112.186 }} icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' }} />
                  </GoogleMap>
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-surface-dim text-on-surface-variant font-label-sm">Map Loading...</div>
                )}
                <div className="absolute top-1 left-1 bg-inverse-surface/80 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-sm">Location Map</div>
              </div>
              {/* Add Feed Action */}
              <button className="relative aspect-video rounded-lg border border-dashed border-outline-variant flex flex-col items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary hover:bg-surface-container-low transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[24px] mb-1">add_circle</span>
                <span className="font-label-sm text-label-sm">Deploy Drone</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Events & AI Detections */}
        <div className="lg:col-span-4 xl:col-span-3 flex flex-col h-[600px] lg:h-auto">
          <div className="glass-panel rounded-xl h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-surface-container-low border-b border-outline-variant px-sm py-3 flex justify-between items-center shrink-0">
              <h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">analytics</span>
                Live AI Analysis
              </h2>
              <span className="bg-primary/10 text-primary font-label-sm text-label-sm px-2 py-0.5 rounded-full">Running</span>
            </div>
            {/* Events List */}
            <div className="flex-grow overflow-y-auto custom-scrollbar p-sm flex flex-col gap-3">
              {/* Event Item: High Severity (Anomaly) */}
              <div className="bg-white border border-error/30 rounded-lg p-3 shadow-sm relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-error"></div>
                <div className="flex justify-between items-start mb-1">
                  <span className="font-label-md text-label-md text-error flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">warning</span>
                    Thermal Anomaly
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Just now</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface mb-2">Panel hot-spot detected in Sector 4, Block B. Temp delta exceeds 15°C threshold.</p>
                <div className="flex gap-2">
                  <button className="text-xs font-medium text-primary hover:underline cursor-pointer">View Frame</button>
                  <button className="text-xs font-medium text-on-surface-variant hover:text-on-surface cursor-pointer">Log Issue</button>
                </div>
              </div>
              
              {/* Event Item: Medium Severity (Warning) */}
              <div className="bg-white border border-tertiary/30 rounded-lg p-3 shadow-sm relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-tertiary"></div>
                <div className="flex justify-between items-start mb-1">
                  <span className="font-label-md text-label-md text-tertiary flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                    Surface Soiling
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">2m ago</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface mb-2">Dust accumulation detected on panel surfaces. Estimated efficiency drop: 4%.</p>
                <div className="flex gap-2">
                  <button className="text-xs font-medium text-primary hover:underline cursor-pointer">View Frame</button>
                </div>
              </div>
              
              {/* Event Item: Low Severity (Info) */}
              <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-lg p-3 shadow-sm relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/40"></div>
                <div className="flex justify-between items-start mb-1">
                  <span className="font-label-md text-label-md text-on-surface flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-primary">check_circle</span>
                    Sector Clear
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">5m ago</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Sector 3 scan complete. No structural anomalies detected. Efficiency nominal.</p>
              </div>
              
              {/* Event Item: Low Severity (Info) */}
              <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-lg p-3 shadow-sm relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/40"></div>
                <div className="flex justify-between items-start mb-1">
                  <span className="font-label-md text-label-md text-on-surface flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-primary">flight_takeoff</span>
                    Drone 2 Deployed
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">12m ago</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Drone 2 commenced autonomous pathing for Sector 5 periphery check.</p>
              </div>
            </div>
            
            {/* Footer Action */}
            <div className="p-3 border-t border-outline-variant bg-white shrink-0">
              <button className="w-full py-2 bg-white text-primary border border-outline-variant rounded-md font-label-md text-label-md hover:bg-surface-container-low transition-colors font-medium cursor-pointer">View Full Log</button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Component */}
      <footer className="bg-surface-container-low border-t border-outline-variant full-width bottom mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-margin-desktop py-md max-w-7xl mx-auto gap-xs">
          <span className="font-headline-sm text-headline-sm text-secondary">SolarShield</span>
          <nav className="flex gap-4">
            <a className="text-on-surface-variant hover:text-primary transition-colors font-label-sm text-label-sm cursor-pointer" href="#!">System Status</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors font-label-sm text-label-sm cursor-pointer" href="#!">Terms of Service</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors font-label-sm text-label-sm cursor-pointer" href="#!">Privacy Policy</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors font-label-sm text-label-sm cursor-pointer" href="#!">Contact Support</a>
          </nav>
          <div className="font-body-sm text-body-sm text-on-surface-variant">
            © 2024 SolarShield Lumina Core. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

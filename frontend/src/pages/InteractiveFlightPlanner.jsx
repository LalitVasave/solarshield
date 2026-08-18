import React, { useEffect, useRef, useMemo, useState } from 'react';
import { GoogleMap, useJsApiLoader, Polyline, Marker } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const center = { lat: 33.738, lng: -112.186 };

export default function InteractiveFlightPlanner() {
  const [flightPathCoords, setFlightPathCoords] = useState([
    { lat: 33.738, lng: -112.186 },
    { lat: 33.739, lng: -112.184 }
  ]);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  const polylineOptions = useMemo(() => ({
    strokeColor: '#0284c7', // Primary blue
    strokeOpacity: 1.0,
    strokeWeight: 4,
  }), []);

  const threeContainerRef = useRef(null);

  const handleMapClick = (e) => {
    const newCoord = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    setFlightPathCoords(prev => [...prev, newCoord]);
  };

  const clearPath = () => {
    setFlightPathCoords([{ lat: 33.738, lng: -112.186 }]); // Keep start point
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.async = true;
    script.onload = () => {
      const container = threeContainerRef.current;
      if (!container || !window.THREE) return;
      
      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;

      const scene = new window.THREE.Scene();
      const camera = new window.THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      const renderer = new window.THREE.WebGLRenderer({ alpha: true, antialias: true });

      renderer.setSize(width, height);
      renderer.setPixelRatio(window.devicePixelRatio);
      container.appendChild(renderer.domElement);

      const curve = new window.THREE.CatmullRomCurve3([
        new window.THREE.Vector3(-5, 0, 0),
        new window.THREE.Vector3(-2, 1, -2),
        new window.THREE.Vector3(2, -1, 2),
        new window.THREE.Vector3(5, 0, 0)
      ]);

      const points = curve.getPoints(100);
      const geometry = new window.THREE.BufferGeometry().setFromPoints(points);
      const material = new window.THREE.LineBasicMaterial({ color: 0x0284c7, linewidth: 2 });
      const pathLine = new window.THREE.Line(geometry, material);
      scene.add(pathLine);

      const droneGeom = new window.THREE.SphereGeometry(0.1, 16, 16);
      const droneMat = new window.THREE.MeshPhongMaterial({ color: 0x0284c7, emissive: 0x0284c7, emissiveIntensity: 0.5 });
      const drone = new window.THREE.Mesh(droneGeom, droneMat);
      scene.add(drone);

      const ambientLight = new window.THREE.AmbientLight(0xffffff, 0.8);
      scene.add(ambientLight);
      const pointLight = new window.THREE.PointLight(0xffffff, 1);
      pointLight.position.set(10, 10, 10);
      scene.add(pointLight);

      camera.position.z = 8;
      camera.position.y = 2;
      camera.lookAt(0, 0, 0);

      let fraction = 0;
      let reqId;
      function animate() {
        reqId = requestAnimationFrame(animate);
        
        fraction = (Date.now() * 0.0001) % 1;
        const pos = curve.getPointAt(fraction);
        drone.position.copy(pos);
        
        scene.rotation.y = Math.sin(Date.now() * 0.0005) * 0.2;

        renderer.render(scene, camera);
      }

      const handleResize = () => {
        if (!container) return;
        const w = container.clientWidth || window.innerWidth;
        const h = container.clientHeight || window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      
      window.addEventListener('resize', handleResize);
      animate();

      return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(reqId);
        if (container && renderer.domElement) {
          container.removeChild(renderer.domElement);
        }
      };
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col lg:flex-row w-full max-w-7xl mx-auto overflow-hidden relative" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Map Area (Primary Context) */}
      <div className="flex-1 relative bg-surface-dim overflow-hidden flex flex-col">
        {/* Google Map Background */}
        <div className="absolute inset-0 bg-surface-dim overflow-hidden z-0">
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={center}
              zoom={16}
              options={{
                mapTypeId: 'satellite',
                disableDefaultUI: true,
                draggableCursor: 'crosshair',
              }}
              onClick={handleMapClick}
            >
              <Polyline path={flightPathCoords} options={polylineOptions} />
              
              {/* Waypoints as Markers */}
              {flightPathCoords.map((coord, idx) => (
                <Marker 
                  key={idx} 
                  position={coord} 
                  icon={{ 
                    url: idx === 0 ? 'http://maps.google.com/mapfiles/ms/icons/green-dot.png' :
                         idx === flightPathCoords.length - 1 ? 'http://maps.google.com/mapfiles/ms/icons/red-dot.png' :
                         'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                  }} 
                />
              ))}
            </GoogleMap>
          ) : (
            <div className="flex items-center justify-center w-full h-full text-on-surface-variant font-label-md">Loading Map...</div>
          )}
        </div>
        
        {/* Map Overlay Gradient for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-dim/80 via-transparent to-transparent z-0 pointer-events-none"></div>

        {/* Map Controls / HUD */}
        <div className="relative z-10 p-sm md:p-md flex justify-between items-start pointer-events-none">
          <div className="pointer-events-auto bg-surface-container-lowest/90 backdrop-blur-md rounded-lg shadow-sm border border-outline-variant p-base inline-flex flex-col gap-base">
            <button className="p-xs hover:bg-surface-container-high rounded-md transition-colors text-on-surface-variant cursor-pointer" title="Zoom In">
              <span className="material-symbols-outlined">add</span>
            </button>
            <div className="h-[1px] w-full bg-outline-variant/50"></div>
            <button className="p-xs hover:bg-surface-container-high rounded-md transition-colors text-on-surface-variant cursor-pointer" title="Zoom Out">
              <span className="material-symbols-outlined">remove</span>
            </button>
            <div className="h-[1px] w-full bg-outline-variant/50"></div>
            <button onClick={clearPath} className="p-xs hover:bg-surface-container-high rounded-md transition-colors text-on-surface-variant cursor-pointer" title="Clear Path">
              <span className="material-symbols-outlined">delete_sweep</span>
            </button>
          </div>
          
          {/* Flight Path Stats Badge */}
          <div className="pointer-events-auto bg-surface-container-lowest/90 backdrop-blur-md rounded-full shadow-sm border border-outline-variant px-sm py-xs flex items-center gap-sm">
            <div className="flex items-center gap-xs text-primary">
              <span className="material-symbols-outlined text-[18px]">route</span>
              <span className="font-label-md text-label-md">Path: ~{(flightPathCoords.length * 0.4).toFixed(1)}km</span>
            </div>
            <div className="w-[1px] h-4 bg-outline-variant"></div>
            <div className="flex items-center gap-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px]">location_on</span>
              <span className="font-label-md text-label-md">{flightPathCoords.length} Waypoints</span>
            </div>
          </div>
        </div>

        {/* Bottom floating action (Mobile Primary) */}
        <div className="mt-auto p-margin-mobile relative z-20 lg:hidden w-full flex justify-center pointer-events-none">
          <button className="pointer-events-auto w-full max-w-sm bg-primary text-on-primary font-label-md text-label-md px-md py-sm rounded-lg shadow-sm hover:bg-primary-container transition-colors flex items-center justify-center gap-xs active:opacity-80 cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">flight_takeoff</span>
            Confirm Mission Plan
          </button>
        </div>
      </div>

      {/* Right Sidebar (Mission Parameters & Fleet) */}
      <aside className="w-full lg:w-[400px] bg-surface-container-lowest border-l border-outline-variant flex flex-col h-full overflow-y-auto lg:h-[calc(100vh-64px)] z-30 shadow-[-4px_0_12px_rgba(30,41,59,0.02)]">
        {/* Sidebar Header */}
        <div className="p-md border-b border-outline-variant bg-surface-container-lowest sticky top-0 z-10">
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-xs flex items-center gap-xs">
            <span className="material-symbols-outlined text-primary">route</span>
            Mission Parameters
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Configure autonomous flight details for the selected sector.</p>
        </div>

        {/* Parameters Content */}
        <div className="p-md flex flex-col gap-lg flex-1">
          {/* Quick Sliders / Settings */}
          <div className="flex flex-col gap-sm">
            {/* Altitude */}
            <div className="flex flex-col gap-xs">
              <div className="flex justify-between items-center">
                <label className="font-label-md text-label-md text-on-surface flex items-center gap-xs">
                  <span className="material-symbols-outlined text-on-surface-variant text-[18px]">height</span>
                  Target Altitude
                </label>
                <span className="font-label-sm text-label-sm text-primary bg-primary-fixed px-2 py-0.5 rounded-full">45m</span>
              </div>
              <input className="w-full h-2 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-primary" max="120" min="10" type="range" defaultValue="45"/>
              <div className="flex justify-between font-label-sm text-label-sm text-on-surface-variant mt-1">
                <span>10m</span>
                <span>120m (Max)</span>
              </div>
            </div>

            {/* Speed */}
            <div className="flex flex-col gap-xs mt-xs">
              <div className="flex justify-between items-center">
                <label className="font-label-md text-label-md text-on-surface flex items-center gap-xs">
                  <span className="material-symbols-outlined text-on-surface-variant text-[18px]">speed</span>
                  Cruising Speed
                </label>
                <span className="font-label-sm text-label-sm text-primary bg-primary-fixed px-2 py-0.5 rounded-full">12 m/s</span>
              </div>
              <input className="w-full h-2 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-primary" max="25" min="5" type="range" defaultValue="12"/>
            </div>

            {/* Battery Reserve */}
            <div className="flex flex-col gap-xs mt-xs">
              <div className="flex justify-between items-center">
                <label className="font-label-md text-label-md text-on-surface flex items-center gap-xs">
                  <span className="material-symbols-outlined text-on-surface-variant text-[18px]">battery_alert</span>
                  Min. Battery Reserve
                </label>
                <span className="font-label-sm text-label-sm text-secondary bg-secondary-fixed px-2 py-0.5 rounded-full">20%</span>
              </div>
              <div className="grid grid-cols-3 gap-xs mt-1">
                <button className="py-1.5 px-2 border border-outline-variant rounded-md font-label-sm text-label-sm text-on-surface hover:bg-surface-container-high transition-colors text-center cursor-pointer">10%</button>
                <button className="py-1.5 px-2 border-2 border-primary bg-primary-fixed/20 rounded-md font-label-sm text-label-sm text-primary transition-colors text-center font-bold cursor-pointer">20%</button>
                <button className="py-1.5 px-2 border border-outline-variant rounded-md font-label-sm text-label-sm text-on-surface hover:bg-surface-container-high transition-colors text-center cursor-pointer">30%</button>
              </div>
            </div>
          </div>

          {/* 3D Trajectory Preview */}
          <div className="flex flex-col gap-xs">
            <h4 className="font-label-md text-label-md text-on-surface flex items-center gap-xs">
              <span className="material-symbols-outlined text-on-surface-variant text-[18px]">3d_rotation</span>
              Trajectory Preview
            </h4>
            <div ref={threeContainerRef} className="w-full h-40 bg-surface-container-low border border-outline-variant rounded-lg overflow-hidden relative cursor-crosshair"></div>
            
            {/* Live Telemetry Readouts */}
            <div className="mt-2 border border-outline-variant rounded-lg bg-surface-container-lowest overflow-hidden">
              <div className="flex justify-between items-center p-xs border-b border-outline-variant bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">
                <span className="w-12">WP</span><span className="flex-1">ALT</span><span className="flex-1">SPD</span><span className="w-20 text-right">STATUS</span>
              </div>
              <div className="flex justify-between items-center p-xs border-b border-outline-variant text-on-surface font-label-sm text-label-sm bg-primary-fixed/10">
                <span className="w-12 font-bold text-primary">01</span><span className="flex-1">45m</span><span className="flex-1">12m/s</span>
                <span className="w-20 text-right text-primary flex items-center justify-end gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>Active
                </span>
              </div>
              <div className="flex justify-between items-center p-xs text-on-surface-variant font-label-sm text-label-sm opacity-60">
                <span className="w-12">02</span><span className="flex-1">45m</span><span className="flex-1">12m/s</span><span className="w-20 text-right">Pending</span>
              </div>
            </div>
          </div>

          {/* Estimated Duration Card */}
          <div className="bg-surface-container-low border border-outline-variant rounded-lg p-sm flex items-start gap-sm">
            <div className="p-xs bg-surface-container-highest rounded-full text-on-surface-variant flex-shrink-0">
              <span className="material-symbols-outlined">schedule</span>
            </div>
            <div className="flex-1">
              <h4 className="font-label-md text-label-md text-on-surface">Estimated Duration</h4>
              <div className="flex items-baseline gap-xs mt-1">
                <span className="font-headline-md text-headline-md text-on-surface">24</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">minutes</span>
              </div>
              <div className="w-full bg-surface-variant rounded-full h-1.5 mt-2">
                <div className="bg-primary h-1.5 rounded-full" style={{ width: '45%' }}></div>
              </div>
              <p className="font-label-sm text-label-sm text-on-surface-variant mt-1 text-right">Uses ~45% battery</p>
            </div>
          </div>

          <hr className="border-outline-variant/50 border-t"/>

          {/* Active Drones Fleet */}
          <div className="flex flex-col gap-sm">
            <div className="flex justify-between items-end">
              <h3 className="font-headline-sm text-[16px] font-semibold text-on-surface">Available Fleet</h3>
              <span className="font-label-sm text-label-sm text-primary cursor-pointer hover:underline">Manage</span>
            </div>
            
            {/* Drone Item 1 (Selected) */}
            <div className="border-2 border-primary bg-primary-fixed/10 rounded-lg p-sm cursor-pointer relative overflow-hidden group">
              <div className="absolute right-0 top-0 h-full w-1 bg-primary"></div>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-sm">
                  <div className="w-10 h-10 bg-surface-container-highest rounded-md flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>flight</span>
                  </div>
                  <div>
                    <h4 className="font-label-md text-label-md text-on-surface">Scout Alpha-1</h4>
                    <div className="flex items-center gap-1 mt-0.5 text-on-surface-variant font-label-sm text-label-sm">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      Ready
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-label-md text-label-md text-on-surface flex items-center gap-0.5">
                    98% <span className="material-symbols-outlined text-[16px] text-green-600">battery_full</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Drone Item 2 (In Use) */}
            <div className="border border-outline-variant bg-surface-container-lowest rounded-lg p-sm opacity-60 cursor-not-allowed">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-sm">
                  <div className="w-10 h-10 bg-surface-container-low rounded-md flex items-center justify-center text-on-surface-variant">
                    <span className="material-symbols-outlined">flight</span>
                  </div>
                  <div>
                    <h4 className="font-label-md text-label-md text-on-surface">Scout Beta-2</h4>
                    <div className="flex items-center gap-1 mt-0.5 text-on-surface-variant font-label-sm text-label-sm">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      In Flight (Sector 4)
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-label-md text-label-md text-on-surface flex items-center gap-0.5">
                    42% <span className="material-symbols-outlined text-[16px]">battery_5_bar</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Footer Actions (Desktop Primary) */}
        <div className="p-md border-t border-outline-variant bg-surface-container-lowest sticky bottom-0 z-10 hidden lg:block">
          <button className="w-full bg-primary text-on-primary font-label-md text-label-md px-md py-sm rounded-lg shadow-sm hover:bg-primary-container transition-colors flex items-center justify-center gap-xs active:opacity-80 cursor-pointer">
            <span className="material-symbols-outlined text-[20px]">flight_takeoff</span>
            Confirm Mission Plan
          </button>
        </div>
      </aside>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const ThreeJSPanelInspection = ({ onClose }) => {
  const threeContainerRef = useRef(null);

  useEffect(() => {
    const container = threeContainerRef.current;
    if (!container) return;
    
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf1f5f9);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.0;

    const panelGroup = new THREE.Group();

    const panelGeom = new THREE.BoxGeometry(4, 0.1, 2);
    const panelMat = new THREE.MeshPhongMaterial({ 
      color: 0x0f172a, specular: 0x334155, shininess: 80 
    });
    const panel = new THREE.Mesh(panelGeom, panelMat);
    
    const gridHelper = new THREE.GridHelper(4, 8, 0x334155, 0x334155);
    gridHelper.position.y = 0.06;
    gridHelper.scale.set(1, 1, 0.5);
    panelGroup.add(panel);
    panelGroup.add(gridHelper);

    const poleGeom = new THREE.CylinderGeometry(0.1, 0.1, 2);
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 });
    const pole = new THREE.Mesh(poleGeom, metalMat);
    pole.position.set(0, -1, 0);
    panelGroup.add(pole);

    const hotspotGeom = new THREE.CircleGeometry(0.3, 32);
    const hotspotMat = new THREE.MeshBasicMaterial({ 
      color: 0xef4444, side: THREE.DoubleSide, transparent: true, opacity: 0.8
    });
    const hotspot = new THREE.Mesh(hotspotGeom, hotspotMat);
    hotspot.rotation.x = -Math.PI / 2;
    hotspot.position.set(-1.2, 0.07, 0.5);
    panelGroup.add(hotspot);

    panelGroup.rotation.x = Math.PI / 6; 
    scene.add(panelGroup);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directLight.position.set(5, 10, 5);
    scene.add(directLight);

    const anomalyLight = new THREE.PointLight(0xef4444, 2, 3);
    anomalyLight.position.set(-1.2, 0.5, 0.5);
    panelGroup.add(anomalyLight);

    camera.position.set(0, 4, 6);
    controls.target.set(0, 0, 0);
    controls.update();

    let reqId;
    function animate() {
      reqId = requestAnimationFrame(animate);
      const time = Date.now() * 0.005;
      hotspot.material.opacity = 0.5 + Math.sin(time) * 0.3;
      controls.update();
      renderer.render(scene, camera);
    }

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
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
      
      // Dispose Three.js resources to prevent memory leaks
      renderer.dispose();
      panelGeom.dispose();
      panelMat.dispose();
      poleGeom.dispose();
      metalMat.dispose();
      hotspotGeom.dispose();
      hotspotMat.dispose();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-8">
      <div className="bg-surface rounded-2xl overflow-hidden w-full max-w-5xl h-full max-h-[80vh] flex flex-col shadow-2xl relative">
        <div className="p-md border-b border-outline-variant bg-surface-container-lowest flex justify-between items-center z-10 shrink-0">
          <div>
            <span className="font-label-sm text-label-sm text-error font-bold flex items-center gap-xs mb-1">
              <span className="w-2 h-2 rounded-full bg-error pulse-marker"></span>
              Anomaly Detected
            </span>
            <h3 className="font-headline-md text-headline-md text-on-surface">3D Panel Inspection: B7 (Row 42)</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Thermal hotspot, 15°C delta</p>
          </div>
          <button onClick={onClose} className="text-secondary hover:bg-surface-container-low p-2 rounded-full transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>
        <div className="flex-1 relative bg-surface-dim" ref={threeContainerRef}>
          {/* 3D Canvas mounts here */}
        </div>
        <div className="p-md border-t border-outline-variant bg-surface flex justify-between items-center shrink-0">
          <div className="font-label-sm text-label-sm text-secondary">Click and drag to rotate</div>
          <div className="flex gap-sm">
            <button className="px-md py-sm border border-outline-variant rounded-md font-label-md text-label-md hover:bg-surface-container-low transition-colors cursor-pointer">Log Maintenance Request</button>
            <button className="px-md py-sm bg-primary text-on-primary rounded-md font-label-md text-label-md hover:opacity-90 transition-opacity cursor-pointer">Dispatch Drone Re-scan</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const center = { lat: 33.738, lng: -112.186 };

export default function GlobalMap() {
  const [is3DViewOpen, setIs3DViewOpen] = useState(false);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });
  return (
    <div className="flex flex-1 overflow-hidden relative w-full h-[calc(100vh-64px)] text-on-background font-body-md text-body-md">
      {/* SideNavBar Component */}
      <aside className="bg-surface-container-lowest dark:bg-on-background h-full w-64 border-r border-outline-variant dark:border-outline fixed left-0 top-16 z-40 hidden md:flex flex-col py-md px-sm shrink-0 shadow-sm">
        <div className="mb-lg px-sm">
          <h2 className="font-headline-sm text-headline-sm font-bold text-primary">Operations Center</h2>
          <p className="font-label-md text-label-md text-secondary mt-xs">Site: Phoenix North</p>
        </div>
        <nav className="flex-1 flex flex-col gap-xs overflow-y-auto hide-scroll">
          <a className="text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors cursor-pointer flex items-center gap-xs p-sm font-label-md text-label-md hover:bg-secondary-container dark:hover:bg-secondary transition-all" href="#!">
            <span className="material-symbols-outlined">dashboard</span>
            Dashboard
          </a>
          <a className="bg-primary-container text-on-primary-container font-bold rounded-lg cursor-pointer flex items-center gap-xs p-sm font-label-md text-label-md" href="#!">
            <span className="material-symbols-outlined">solar_power</span>
            Assets
          </a>
          <a className="text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors cursor-pointer flex items-center gap-xs p-sm font-label-md text-label-md hover:bg-secondary-container dark:hover:bg-secondary transition-all" href="#!">
            <span className="material-symbols-outlined">flight_takeoff</span>
            Drones
          </a>
          <a className="text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors cursor-pointer flex items-center gap-xs p-sm font-label-md text-label-md hover:bg-secondary-container dark:hover:bg-secondary transition-all" href="#!">
            <span className="material-symbols-outlined">assessment</span>
            Reports
          </a>
          <a className="text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors cursor-pointer flex items-center gap-xs p-sm font-label-md text-label-md hover:bg-secondary-container dark:hover:bg-secondary transition-all" href="#!">
            <span className="material-symbols-outlined">settings</span>
            Settings
          </a>
        </nav>
        <div className="mt-auto flex flex-col gap-sm pt-md border-t border-outline-variant">
          <button className="bg-primary text-on-primary font-label-md text-label-md py-sm px-md rounded-lg hover:opacity-90 transition-opacity w-full font-bold flex justify-center items-center gap-xs shadow-[0px_4px_12px_rgba(30,41,59,0.15)] cursor-pointer">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
            Launch Mission
          </button>
          <div className="flex gap-xs">
            <a className="flex-1 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-xs p-sm font-label-sm text-label-sm" href="#!">
              <span className="material-symbols-outlined text-[18px]">help</span>
              Support
            </a>
            <a className="flex-1 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-xs p-sm font-label-sm text-label-sm" href="#!">
              <span className="material-symbols-outlined text-[18px]">history</span>
              Logs
            </a>
          </div>
        </div>
      </aside>

      {/* Main Map Viewport */}
      <main className="flex-1 relative md:ml-64 bg-surface-container-low overflow-hidden">
        {/* Google Map Background */}
        <div className="absolute inset-0 w-full h-full bg-surface-dim overflow-hidden z-0">
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={center}
              zoom={13}
              options={{
                mapTypeId: 'satellite',
                disableDefaultUI: true,
              }}
            >
              {/* Overlay pattern for 'terrain' feel (CSS on top of map) */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#006194 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
              {/* Simulated 3D Elements positioned at a specific LatLng using OverlayView or just CSS center for demo */}
              <div className="absolute top-[40%] left-[30%] w-64 h-32 border border-primary/30 bg-primary/5 transform -skew-x-12 rounded-sm shadow-[0px_4px_12px_rgba(30,41,59,0.05)] pulse-marker flex items-center justify-center backdrop-blur-sm pointer-events-none">
                <span className="font-label-md text-label-md text-primary font-bold">Sector 4</span>
              </div>
            </GoogleMap>
          ) : (
            <div className="flex items-center justify-center w-full h-full text-on-surface-variant font-label-md">Loading Map...</div>
          )}
        </div>

        {/* Floating Data Cards (Top Left) */}
        <div className="absolute top-md left-md flex gap-sm z-20 pointer-events-none">
          {/* Real-time Yield */}
          <div className="glass-panel rounded-lg p-sm min-w-[160px] pointer-events-auto">
            <div className="flex items-center gap-xs text-secondary mb-xs">
              <span className="material-symbols-outlined text-[18px]">bolt</span>
              <span className="font-label-sm text-label-sm uppercase tracking-wider">Real-time Yield</span>
            </div>
            <div className="flex items-end gap-base">
              <span className="font-headline-lg text-headline-lg text-primary">18.2</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant mb-1">MWh</span>
            </div>
            <div className="mt-xs text-secondary font-label-sm text-label-sm flex items-center gap-base">
              <span className="material-symbols-outlined text-[14px] text-primary">trending_up</span>
              +2.4% vs avg
            </div>
          </div>

          {/* Active Drones */}
          <div className="glass-panel rounded-lg p-sm min-w-[140px] pointer-events-auto">
            <div className="flex items-center gap-xs text-secondary mb-xs">
              <span className="material-symbols-outlined text-[18px]">flight</span>
              <span className="font-label-sm text-label-sm uppercase tracking-wider">Active Drones</span>
            </div>
            <div className="flex items-center gap-sm">
              <span className="font-headline-lg text-headline-lg text-on-surface">3</span>
              <div className="flex gap-base">
                <span className="w-2 h-2 rounded-full bg-primary pulse-marker"></span>
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                <span className="w-2 h-2 rounded-full bg-primary"></span>
              </div>
            </div>
            <div className="mt-xs text-secondary font-label-sm text-label-sm">
              In flight
            </div>
          </div>

          {/* Weather */}
          <div className="glass-panel rounded-lg p-sm min-w-[140px] pointer-events-auto">
            <div className="flex items-center gap-xs text-secondary mb-xs">
              <span className="material-symbols-outlined text-[18px]">wb_sunny</span>
              <span className="font-label-sm text-label-sm uppercase tracking-wider">Weather</span>
            </div>
            <div className="flex items-end gap-base">
              <span className="font-headline-lg text-headline-lg text-on-surface">72°</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant mb-1">F</span>
            </div>
            <div className="mt-xs text-secondary font-label-sm text-label-sm">
              Clear conditions
            </div>
          </div>
        </div>

        {/* Map Controls (Bottom Left) */}
        <div className="absolute bottom-md left-md flex gap-sm z-20">
          <div className="glass-panel rounded-lg flex overflow-hidden border border-outline-variant">
            <button className="px-sm py-xs bg-primary-container text-on-primary-container font-label-md text-label-md font-medium border-r border-outline-variant hover:bg-surface-container-high transition-colors cursor-pointer">3D</button>
            <button className="px-sm py-xs bg-surface text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-high transition-colors cursor-pointer">2D</button>
          </div>
          <div className="glass-panel rounded-lg flex gap-xs p-xs border border-outline-variant">
            <button className="p-1 hover:bg-surface-container-high rounded text-secondary hover:text-primary transition-colors cursor-pointer">
              <span className="material-symbols-outlined">add</span>
            </button>
            <div className="w-[1px] h-full bg-outline-variant mx-1"></div>
            <button className="p-1 hover:bg-surface-container-high rounded text-secondary hover:text-primary transition-colors cursor-pointer">
              <span className="material-symbols-outlined">remove</span>
            </button>
          </div>
        </div>

        {/* Right Side Panel: Sector Analysis */}
        <div className="absolute top-0 right-0 h-full w-80 bg-surface border-l border-outline-variant shadow-[-8px_0_24px_rgba(30,41,59,0.05)] z-30 flex flex-col transform transition-transform duration-300">
          {/* Panel Header */}
          <div className="p-md border-b border-outline-variant bg-surface-container-lowest">
            <div className="flex justify-between items-start">
              <div>
                <span className="inline-block px-xs py-base bg-primary-container text-on-primary-container font-label-sm text-label-sm rounded mb-sm">Active Focus</span>
                <h3 className="font-headline-md text-headline-md text-on-surface">Sector 4</h3>
                <p className="font-body-sm text-body-sm text-secondary mt-1">North Field Array</p>
              </div>
              <button className="text-secondary hover:bg-surface-container-low p-1 rounded transition-colors cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          </div>

          {/* Panel Content (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-md flex flex-col gap-md hide-scroll">
            {/* Health Score Card */}
            <div className="bg-surface-container-low rounded-lg p-sm border border-outline-variant">
              <div className="flex justify-between items-center mb-sm">
                <span className="font-label-md text-label-md text-on-surface font-semibold">Overall Health</span>
                <span className="material-symbols-outlined text-primary">health_and_safety</span>
              </div>
              <div className="flex items-end gap-sm mb-sm">
                <span className="font-headline-lg text-headline-lg text-primary">94%</span>
                <span className="font-body-sm text-body-sm text-secondary mb-1">Optimal</span>
              </div>
              {/* Progress Bar */}
              <div className="w-full h-2 bg-surface-variant rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: '94%' }}></div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-sm">
              <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-sm">
                <span className="font-label-sm text-label-sm text-secondary block mb-1">Efficiency</span>
                <span className="font-headline-sm text-headline-sm text-on-surface block">98.2%</span>
              </div>
              <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-sm">
                <span className="font-label-sm text-label-sm text-secondary block mb-1">Temp (Avg)</span>
                <span className="font-headline-sm text-headline-sm text-on-surface block">112°F</span>
              </div>
              <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-sm">
                <span className="font-label-sm text-label-sm text-secondary block mb-1">Panels</span>
                <span className="font-headline-sm text-headline-sm text-on-surface block">4,200</span>
              </div>
              <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-sm">
                <span className="font-label-sm text-label-sm text-secondary block mb-1">Anomalies</span>
                <span className="font-headline-sm text-headline-sm text-error block">2</span>
              </div>
            </div>

            {/* Recent Anomalies List */}
            <div>
              <h4 className="font-label-md text-label-md text-on-surface font-semibold mb-sm">Detected Anomalies</h4>
              <div className="flex flex-col gap-xs">
                <div className="bg-surface-container-lowest border border-error-container rounded-lg p-sm flex items-start gap-sm">
                  <span className="material-symbols-outlined text-error mt-1" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                  <div>
                    <span className="font-label-md text-label-md text-on-surface block">Hotspot Detected</span>
                    <span className="font-body-sm text-body-sm text-secondary block">Row 42, Panel B7</span>
                  </div>
                </div>
                <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-sm flex items-start gap-sm">
                  <span className="material-symbols-outlined text-tertiary mt-1" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
                  <div>
                    <span className="font-label-md text-label-md text-on-surface block">Soiling Accumulation</span>
                    <span className="font-body-sm text-body-sm text-secondary block">Row 18-20</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Panel Footer Action */}
          <div className="p-md border-t border-outline-variant bg-surface">
            <button onClick={() => setIs3DViewOpen(true)} className="w-full bg-primary text-on-primary font-label-md text-label-md py-sm rounded-lg hover:opacity-90 shadow-sm transition-opacity flex justify-center items-center gap-xs cursor-pointer">
              <span className="material-symbols-outlined text-[18px]">view_in_ar</span>
              Inspect 3D Model
            </button>
          </div>
        </div>
      </main>

      {/* 3D Modal Overlay */}
      {is3DViewOpen && <ThreeJSPanelInspection onClose={() => setIs3DViewOpen(false)} />}
    </div>
  );
}

import React, { useEffect, useRef } from 'react';

export default function DroneDiagnostics() {
  const shaderCanvasRef = useRef(null);
  const threeContainerRef = useRef(null);

  useEffect(() => {
    // --- STITCH_SHADER_START:ANIMATION_34 ---
    const canvas = shaderCanvasRef.current;
    if (canvas) {
      const syncSize = () => {
        const w = canvas.clientWidth || 1280;
        const h = canvas.clientHeight || 720;
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
        }
      };
      if (typeof ResizeObserver !== 'undefined') {
        new ResizeObserver(syncSize).observe(canvas);
      }
      syncSize();

      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        const vs = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;
        const fs = `precision highp float;
varying vec2 v_texCoord;
uniform float u_time;
uniform vec2 u_resolution;

float noise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    vec2 uv = v_texCoord;
    vec3 color = vec3(0.97, 0.98, 0.99); // Surface container lowest
    
    // Subtle moving atmosphere
    float n = noise(uv + u_time * 0.05);
    float pulse = sin(u_time * 0.5) * 0.5 + 0.5;
    
    // Soft blue tint for 'Intelligence'
    vec3 accent = vec3(0.01, 0.52, 0.78); // Intelligence Blue
    float dist = distance(uv, vec4(0.5 + 0.2 * cos(u_time), 0.5 + 0.2 * sin(u_time), 0.0, 0.0).xy);
    
    color = mix(color, accent, (1.0 - dist) * 0.05 * pulse);
    
    // Particle-like noise
    if (noise(uv * 100.0 + u_time * 0.1) > 0.998) {
        color += 0.1;
    }

    gl_FragColor = vec4(color, 1.0);
}`;
        const cs = (type, src) => {
          const s = gl.createShader(type);
          gl.shaderSource(s, src);
          gl.compileShader(s);
          return s;
        };
        const prog = gl.createProgram();
        gl.attachShader(prog, cs(gl.VERTEX_SHADER, vs));
        gl.attachShader(prog, cs(gl.FRAGMENT_SHADER, fs));
        gl.linkProgram(prog);
        gl.useProgram(prog);
        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
        const pos = gl.getAttribLocation(prog, 'a_position');
        gl.enableVertexAttribArray(pos);
        gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
        const uTime = gl.getUniformLocation(prog, 'u_time');
        const uRes = gl.getUniformLocation(prog, 'u_resolution');
        
        let reqId;
        const render = (t) => {
          if (typeof ResizeObserver === 'undefined') syncSize();
          gl.viewport(0, 0, canvas.width, canvas.height);
          if (uTime) gl.uniform1f(uTime, t * 0.001);
          if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
          reqId = requestAnimationFrame(render);
        };
        reqId = requestAnimationFrame(render);
        
        return () => cancelAnimationFrame(reqId);
      }
    }
  }, []);

  useEffect(() => {
    // Dynamically load THREE.js since it's used in the prototype via script tag
    const script = document.createElement('script');
    script.src = 'https://ajax.googleapis.com/ajax/libs/threejs/r125/three.min.js';
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

      const droneGroup = new window.THREE.Group();

      const bodyGeom = new window.THREE.BoxGeometry(1, 0.2, 1);
      const bodyMat = new window.THREE.MeshPhongMaterial({ color: 0x0284c7 });
      const body = new window.THREE.Mesh(bodyGeom, bodyMat);
      droneGroup.add(body);

      const armMat = new window.THREE.MeshPhongMaterial({ color: 0x334155 });
      for (let i = 0; i < 4; i++) {
          const arm = new window.THREE.Mesh(new window.THREE.CylinderGeometry(0.05, 0.05, 1.5), armMat);
          arm.rotation.z = Math.PI / 2;
          arm.rotation.y = (Math.PI / 2) * i + Math.PI / 4;
          droneGroup.add(arm);
          
          const rotor = new window.THREE.Mesh(new window.THREE.CylinderGeometry(0.4, 0.4, 0.02, 32), new window.THREE.MeshPhongMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 }));
          rotor.position.set(Math.cos(arm.rotation.y) * 0.75, 0.1, Math.sin(arm.rotation.y) * 0.75);
          rotor.name = `rotor_${i}`;
          droneGroup.add(rotor);
      }

      scene.add(droneGroup);

      const ambientLight = new window.THREE.AmbientLight(0xffffff, 0.7);
      scene.add(ambientLight);

      const pointLight = new window.THREE.PointLight(0xffffff, 1);
      pointLight.position.set(5, 5, 5);
      scene.add(pointLight);

      camera.position.z = 3;
      camera.position.y = 1;
      camera.lookAt(0, 0, 0);

      let reqId;
      function animate() {
          reqId = requestAnimationFrame(animate);
          
          droneGroup.rotation.y += 0.01;
          droneGroup.position.y = Math.sin(Date.now() * 0.002) * 0.1;
          
          droneGroup.children.forEach(child => {
              if (child.name && child.name.startsWith('rotor')) {
                  child.rotation.y += 0.5;
              }
          });

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
    <div className="flex-1 text-on-background font-body-md min-h-[calc(100vh-64px)] flex flex-col md:flex-row w-full">
      {/* SideNavBar */}
      <nav className="fixed left-0 top-16 h-[calc(100vh-64px)] z-40 hidden md:flex flex-col py-md px-sm bg-surface-container-lowest dark:bg-on-background border-r border-outline-variant dark:border-outline flat no shadows w-64">
        <div className="mb-lg">
          <h2 className="font-headline-sm text-headline-sm font-bold text-primary mb-xs">Operations Center</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Site: Phoenix North</p>
        </div>
        <ul className="flex flex-col gap-xs flex-grow">
          <li>
            <a className="cursor-pointer flex items-center gap-xs p-sm text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors hover:bg-secondary-container dark:hover:bg-secondary transition-all" href="#!">
              <span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
              <span className="font-label-md text-label-md">Dashboard</span>
            </a>
          </li>
          <li>
            <a className="cursor-pointer flex items-center gap-xs p-sm text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors hover:bg-secondary-container dark:hover:bg-secondary transition-all" href="#!">
              <span className="material-symbols-outlined" data-icon="solar_power">solar_power</span>
              <span className="font-label-md text-label-md">Assets</span>
            </a>
          </li>
          <li>
            <a className="cursor-pointer flex items-center gap-xs p-sm bg-primary-container text-on-primary-container font-bold rounded-lg hover:bg-secondary-container dark:hover:bg-secondary transition-all" href="#!">
              <span className="material-symbols-outlined" data-icon="flight_takeoff">flight_takeoff</span>
              <span className="font-label-md text-label-md">Drones</span>
            </a>
          </li>
          <li>
            <a className="cursor-pointer flex items-center gap-xs p-sm text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors hover:bg-secondary-container dark:hover:bg-secondary transition-all" href="#!">
              <span className="material-symbols-outlined" data-icon="assessment">assessment</span>
              <span className="font-label-md text-label-md">Reports</span>
            </a>
          </li>
          <li>
            <a className="cursor-pointer flex items-center gap-xs p-sm text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors hover:bg-secondary-container dark:hover:bg-secondary transition-all" href="#!">
              <span className="material-symbols-outlined" data-icon="settings">settings</span>
              <span className="font-label-md text-label-md">Settings</span>
            </a>
          </li>
        </ul>
        <div className="mt-auto">
          <button className="w-full bg-[#0284C7] text-[#FFFFFF] py-sm px-md rounded-DEFAULT font-label-md text-label-md mb-md cursor-pointer hover:bg-[#0284C7]/80">Launch Mission</button>
          <ul className="flex flex-col gap-xs border-t border-outline-variant pt-sm">
            <li>
              <a className="cursor-pointer flex items-center gap-xs p-sm text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors" href="#!">
                <span className="material-symbols-outlined" data-icon="help">help</span>
                <span className="font-label-md text-label-md">Support</span>
              </a>
            </li>
            <li>
              <a className="cursor-pointer flex items-center gap-xs p-sm text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors" href="#!">
                <span className="material-symbols-outlined" data-icon="history">history</span>
                <span className="font-label-md text-label-md">Logs</span>
              </a>
            </li>
          </ul>
        </div>
      </nav>
      
      {/* Main Content Canvas */}
      <div className="flex-1 md:ml-64 flex flex-col h-[calc(100vh-64px)] overflow-hidden">
        {/* Main Dashboard Area */}
        <main className="flex-1 overflow-y-auto p-margin-mobile md:p-margin-desktop bg-[#F8FAFC]">
          <div className="mb-md flex justify-between items-end">
            <div>
              <div className="flex items-center gap-xs mb-base">
                <span className="font-label-sm text-label-sm text-secondary bg-surface-container px-xs py-base rounded-full">UNIT DIAGNOSTICS</span>
                <span className="font-label-sm text-label-sm text-[#0284C7] bg-[#E0F2FE] px-xs py-base rounded-full">ACTIVE</span>
              </div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface">AQ-77X-Alpha</h2>
            </div>
            <div className="flex gap-sm">
              <button className="bg-[#FFFFFF] text-[#1E293B] border border-[#E2E8F0] px-sm py-xs rounded-DEFAULT font-label-md text-label-md flex items-center gap-xs hover:bg-surface-container-lowest ambient-shadow cursor-pointer">
                <span className="material-symbols-outlined" data-icon="download">download</span>
                Export Report
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter h-[calc(100vh-200px)] min-h-[800px]">
            {/* Left Column: Immersive 3D Viewer (Bento Span 8) */}
            <div className="lg:col-span-8 bg-[#FFFFFF] rounded-xl border border-[#E2E8F0] overflow-hidden relative ambient-shadow flex flex-col">
              {/* 3D Canvas Area */}
              <div className="flex-1 relative bg-surface-dim overflow-hidden">
                {/* Background Shader */}
                <div className="absolute inset-0 w-full h-full opacity-60" style={{ display: 'block' }}>
                  <canvas ref={shaderCanvasRef} style={{ display: 'block', width: '100%', height: '100%' }}></canvas>
                </div>
                
                {/* 3D Drone Model */}
                <div className="absolute inset-0 w-full h-full z-10" style={{ display: 'block' }}>
                  <div ref={threeContainerRef} style={{ width: '100%', height: '100%' }}></div>
                </div>
                
                {/* Telemetry Overlay - Top Left */}
                <div className="absolute top-md left-md z-20 glass-panel p-sm rounded-lg w-48">
                  <h3 className="font-label-sm text-label-sm text-secondary mb-xs">LIVE TELEMETRY</h3>
                  <div className="flex justify-between items-center mb-base">
                    <span className="font-body-sm text-body-sm text-on-surface">Battery</span>
                    <span className="font-label-md text-label-md text-[#0284C7] font-bold">92%</span>
                  </div>
                  <div className="w-full bg-[#E2E8F0] rounded-full h-1.5 mb-sm">
                    <div className="bg-[#0284C7] h-1.5 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                  <div className="flex justify-between items-center mb-xs">
                    <span className="font-body-sm text-body-sm text-on-surface">Signal</span>
                    <span className="font-label-md text-label-md text-primary font-bold flex items-center gap-base">
                      <span className="material-symbols-outlined text-[16px]" data-icon="signal_cellular_alt">signal_cellular_alt</span>
                      Strong
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-body-sm text-body-sm text-on-surface">Core Temp</span>
                    <span className="font-label-md text-label-md text-on-surface font-bold">34°C</span>
                  </div>
                </div>
                
                {/* Action Overlay - Bottom Right */}
                <div className="absolute bottom-md right-md z-20 flex gap-sm">
                  <button className="bg-[#FFFFFF] text-[#1E293B] p-xs rounded-full border border-[#E2E8F0] ambient-shadow hover:bg-surface-container-low transition-colors cursor-pointer" title="Reset View">
                    <span className="material-symbols-outlined" data-icon="center_focus_strong">center_focus_strong</span>
                  </button>
                  <button className="bg-[#FFFFFF] text-[#1E293B] p-xs rounded-full border border-[#E2E8F0] ambient-shadow hover:bg-surface-container-low transition-colors cursor-pointer" title="Wireframe Toggle">
                    <span className="material-symbols-outlined" data-icon="view_in_ar">view_in_ar</span>
                  </button>
                </div>
              </div>
              
              {/* Lower Toolbar: Maintenance Actions */}
              <div className="h-20 bg-[#FFFFFF] border-t border-[#E2E8F0] px-md flex items-center justify-between">
                <span className="font-label-md text-label-md text-secondary">Maintenance Actions</span>
                <div className="flex gap-sm">
                  <button className="text-[#0284C7] font-bold font-label-md text-label-md hover:underline px-sm py-xs cursor-pointer">Initiate Self-Test</button>
                  <button className="bg-[#FFFFFF] text-[#1E293B] border border-[#E2E8F0] px-sm py-xs rounded-DEFAULT font-label-md text-label-md hover:bg-surface-container-low cursor-pointer">Firmware Update</button>
                  <button className="bg-[#0284C7] text-[#FFFFFF] px-sm py-xs rounded-DEFAULT font-label-md text-label-md hover:bg-[#0284C7]/80 cursor-pointer">Schedule Service</button>
                </div>
              </div>
            </div>
            
            {/* Right Column: Diagnostics & Data (Bento Span 4) */}
            <div className="lg:col-span-4 flex flex-col gap-gutter">
              {/* Component Status Card */}
              <div className="bg-[#FFFFFF] rounded-xl border border-[#E2E8F0] ambient-shadow flex-1">
                <div className="p-sm border-b border-[#E2E8F0] bg-[#F8FAFC] rounded-t-xl">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">Component Status</h3>
                </div>
                <div className="p-sm">
                  <ul className="flex flex-col gap-sm">
                    <li className="flex justify-between items-center p-sm border border-[#E2E8F0] rounded-lg">
                      <div className="flex items-center gap-sm">
                        <div className="bg-[#E0F2FE] p-xs rounded-full text-[#0284C7]">
                          <span className="material-symbols-outlined" data-icon="toys">toys</span>
                        </div>
                        <div>
                          <p className="font-label-md text-label-md text-on-surface">Rotor Assembly</p>
                          <p className="font-body-sm text-body-sm text-secondary">Nominal wear</p>
                        </div>
                      </div>
                      <span className="font-label-sm text-label-sm text-[#166534] bg-[#DCFCE7] px-xs py-base rounded-full border border-[#BBF7D0]">OPTIMAL</span>
                    </li>
                    <li className="flex justify-between items-center p-sm border border-[#E2E8F0] rounded-lg">
                      <div className="flex items-center gap-sm">
                        <div className="bg-surface-container p-xs rounded-full text-primary">
                          <span className="material-symbols-outlined" data-icon="sensors">sensors</span>
                        </div>
                        <div>
                          <p className="font-label-md text-label-md text-on-surface">Optical Sensors</p>
                          <p className="font-body-sm text-body-sm text-secondary">Calibration required soon</p>
                        </div>
                      </div>
                      <span className="font-label-sm text-label-sm text-[#854D0E] bg-[#FEF08A] px-xs py-base rounded-full border border-[#FDE047]">FAIR</span>
                    </li>
                    <li className="flex justify-between items-center p-sm border border-[#E2E8F0] rounded-lg">
                      <div className="flex items-center gap-sm">
                        <div className="bg-[#E0F2FE] p-xs rounded-full text-[#0284C7]">
                          <span className="material-symbols-outlined" data-icon="battery_charging_full">battery_charging_full</span>
                        </div>
                        <div>
                          <p className="font-label-md text-label-md text-on-surface">Power Cell</p>
                          <p className="font-body-sm text-body-sm text-secondary">98% health capacity</p>
                        </div>
                      </div>
                      <span className="font-label-sm text-label-sm text-[#166534] bg-[#DCFCE7] px-xs py-base rounded-full border border-[#BBF7D0]">OPTIMAL</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              {/* Lifecycle Timeline Card */}
              <div className="bg-[#FFFFFF] rounded-xl border border-[#E2E8F0] ambient-shadow">
                <div className="p-sm border-b border-[#E2E8F0] bg-[#F8FAFC] rounded-t-xl">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">Lifecycle</h3>
                </div>
                <div className="p-sm">
                  <div className="relative border-l-2 border-[#E2E8F0] ml-sm py-sm flex flex-col gap-md">
                    <div className="relative pl-md">
                      <div className="absolute w-3 h-3 bg-[#0284C7] rounded-full -left-[7px] top-1"></div>
                      <p className="font-label-md text-label-md text-on-surface">Manufactured</p>
                      <p className="font-body-sm text-body-sm text-secondary">Oct 12, 2023 - Facility Delta</p>
                    </div>
                    <div className="relative pl-md">
                      <div className="absolute w-3 h-3 bg-[#0284C7] rounded-full -left-[7px] top-1"></div>
                      <p className="font-label-md text-label-md text-on-surface">Deployed</p>
                      <p className="font-body-sm text-body-sm text-secondary">Nov 01, 2023 - Phoenix North</p>
                    </div>
                    <div className="relative pl-md">
                      <div className="absolute w-3 h-3 bg-surface-container-high border-2 border-[#0284C7] rounded-full -left-[7px] top-1"></div>
                      <p className="font-label-md text-label-md text-on-surface">Operational History</p>
                      <p className="font-body-sm text-body-sm text-secondary">14 Missions Completed</p>
                      <p className="font-body-sm text-body-sm text-secondary">2 Maintenance Events</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Recent Flight Logs Table (Full Width Bottom) */}
          <div className="mt-gutter bg-[#FFFFFF] rounded-xl border border-[#E2E8F0] ambient-shadow mb-lg">
            <div className="p-sm border-b border-[#E2E8F0] bg-[#F8FAFC] rounded-t-xl flex justify-between items-center">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Recent Flight Logs</h3>
              <button className="text-[#0284C7] font-label-sm text-label-sm hover:underline cursor-pointer">View All Logs</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-surface-bright">
                    <th className="p-sm font-label-md text-label-md text-secondary font-medium">Mission ID</th>
                    <th className="p-sm font-label-md text-label-md text-secondary font-medium">Date</th>
                    <th className="p-sm font-label-md text-label-md text-secondary font-medium">Duration</th>
                    <th className="p-sm font-label-md text-label-md text-secondary font-medium">Status</th>
                    <th className="p-sm font-label-md text-label-md text-secondary font-medium">Pilot</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[#E2E8F0] hover:bg-surface-container-lowest transition-colors">
                    <td className="p-sm font-body-sm text-body-sm text-on-surface">MSN-8821</td>
                    <td className="p-sm font-body-sm text-body-sm text-on-surface">Today, 09:14 AM</td>
                    <td className="p-sm font-body-sm text-body-sm text-on-surface">42 mins</td>
                    <td className="p-sm"><span className="font-label-sm text-label-sm text-[#166534] bg-[#DCFCE7] px-xs py-base rounded-full">SUCCESS</span></td>
                    <td className="p-sm font-body-sm text-body-sm text-on-surface">Auto-Pilot</td>
                  </tr>
                  <tr className="border-b border-[#E2E8F0] hover:bg-surface-container-lowest transition-colors">
                    <td className="p-sm font-body-sm text-body-sm text-on-surface">MSN-8805</td>
                    <td className="p-sm font-body-sm text-body-sm text-on-surface">Yesterday, 14:30 PM</td>
                    <td className="p-sm font-body-sm text-body-sm text-on-surface">1h 15m</td>
                    <td className="p-sm"><span className="font-label-sm text-label-sm text-[#166534] bg-[#DCFCE7] px-xs py-base rounded-full">SUCCESS</span></td>
                    <td className="p-sm font-body-sm text-body-sm text-on-surface">J. Miller</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>
        
        {/* Footer */}
        <footer className="bg-surface-container-low dark:bg-on-background border-t border-outline-variant dark:border-outline flat no shadows w-full py-sm flex justify-between items-center px-margin-desktop text-on-secondary-fixed-variant mt-auto">
          <span className="font-label-md text-label-md font-semibold text-secondary">© 2024 SolarShield Intelligence. All systems operational.</span>
          <div className="flex gap-md font-body-sm text-body-sm">
            <a className="hover:text-primary transition-colors cursor-pointer" href="#!">Privacy Policy</a>
            <a className="hover:text-primary transition-colors cursor-pointer" href="#!">Terms of Service</a>
            <a className="hover:text-primary transition-colors cursor-pointer" href="#!">API Status</a>
          </div>
        </footer>
      </div>
    </div>
  );
}

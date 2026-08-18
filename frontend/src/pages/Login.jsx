import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [operatorId, setOperatorId] = useState('');
  const [accessKey, setAccessKey] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: operatorId,
          password: accessKey,
        }),
      });

      if (!res.ok) throw new Error('Invalid credentials');
      const data = await res.json();
      localStorage.setItem('token', data.access_token);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="font-sans text-on-surface antialiased overflow-hidden relative min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      {/* Decorative subtle background */}
      <div className="bg-pattern"></div>
      
      {/* Abstract ambient glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-fixed-dim rounded-full blur-[120px] opacity-20 z-[-1] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-tertiary-fixed-dim rounded-full blur-[150px] opacity-10 z-[-1] pointer-events-none"></div>
      
      {/* Main Login Container */}
      <main className="w-full max-w-[420px] px-margin-mobile md:px-0">
        {/* Brand Header Context */}
        <div className="text-center mb-md">
          <div className="flex items-center justify-center gap-xs mb-xs">
            <span className="material-symbols-outlined text-primary text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>wb_sunny</span>
            <h1 className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight">SolarShield</h1>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Intelligence Operations</p>
        </div>
        
        {/* Login Card */}
        <div className="login-card rounded-lg p-margin-desktop md:p-lg w-full relative overflow-hidden">
          {/* Minimalist top border accent */}
          <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-md">Secure Access</h2>
          
          <form onSubmit={handleLogin} className="flex flex-col gap-md">
            {error && <div className="text-error font-label-md p-sm bg-error-container/20 rounded">{error}</div>}
            
            {/* Operator ID Field */}
            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant mb-base" htmlFor="operator-id">Operator ID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-sm flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline-variant text-[20px]">badge</span>
                </div>
                <input 
                  className="ss-input w-full rounded-md font-body-md text-body-md text-on-surface pl-[44px] py-sm" 
                  id="operator-id" 
                  name="operator-id" 
                  placeholder="OP-XXXX" 
                  required 
                  type="text"
                  value={operatorId}
                  onChange={(e) => setOperatorId(e.target.value)}
                />
              </div>
            </div>
            
            {/* Access Key Field */}
            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant mb-base" htmlFor="access-key">Access Key</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-sm flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline-variant text-[20px]">key</span>
                </div>
                <input 
                  className="ss-input w-full rounded-md font-body-md text-body-md text-on-surface pl-[44px] py-sm" 
                  id="access-key" 
                  name="access-key" 
                  placeholder="••••••••" 
                  required 
                  type="password"
                  value={accessKey}
                  onChange={(e) => setAccessKey(e.target.value)}
                />
              </div>
            </div>
            
            {/* System Status Indicator (Simulated) */}
            <div className="flex items-center gap-xs py-xs">
              <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Uplink Status: Nominal</span>
            </div>
            
            {/* Action Buttons */}
            <div className="mt-sm">
              <button className="w-full bg-[#0284C7] hover:bg-primary-container text-[#FFFFFF] font-label-md text-label-md py-sm rounded-md transition-colors flex items-center justify-center gap-xs group cursor-pointer" type="submit">
                  Initialize Uplink
                  <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            </div>
          </form>
          
          {/* Auxiliary Links */}
          <div className="mt-lg pt-md border-t border-outline-variant flex flex-col gap-sm text-center">
            <a className="font-label-sm text-label-sm text-[#0284C7] hover:underline" href="#!">Forgot access key?</a>
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#!">Request access authorization</a>
          </div>
        </div>
        
        {/* Footer Info */}
        <div className="text-center mt-md">
          <p className="font-label-sm text-label-sm text-on-surface-variant">© 2024 SolarShield Intelligence. All rights reserved.</p>
        </div>
      </main>
    </div>
  );
}

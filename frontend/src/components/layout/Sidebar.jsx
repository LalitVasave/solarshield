import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: 'bar_chart' },
    { name: 'Inspections', path: '/inspections', icon: 'search' },
    { name: 'Live Stream', path: '/live', icon: 'videocam' },
    { name: 'Digital Twin', path: '/twin', icon: 'public' }
  ];

  return (
    <aside className="w-80 bg-surface-container-lowest border-r border-outline-variant shadow-sm flex flex-col hidden lg:flex">
      <div className="p-md border-b border-outline-variant flex items-center justify-between">
        <div className="flex items-center gap-xs">
          <span className="text-primary text-[24px]">☀</span>
          <span className="font-headline-sm font-bold text-primary">SolarShield</span>
        </div>
        <span className="text-xs bg-surface-container-high px-2 py-1 rounded-full text-on-surface-variant">v0.5.0</span>
      </div>

      <nav className="flex flex-col gap-2 p-sm flex-1">
        {navItems.map(item => (
          <NavLink 
            key={item.name} 
            to={item.path}
            className={({isActive}) => `flex items-center gap-sm px-sm py-2 rounded-lg font-label-md transition-colors ${isActive ? 'bg-primary-container text-on-primary-container' : 'text-on-surface hover:bg-surface-container-high'}`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            {item.name}
          </NavLink>
        ))}
      </nav>
      
      <div className="p-sm border-t border-outline-variant">
        <div className="text-xs text-on-surface-variant mb-2">SESSION</div>
        <div className="flex items-center gap-sm">
          <span className="material-symbols-outlined text-secondary">account_circle</span>
          <span className="font-label-sm">Admin User</span>
        </div>
      </div>
    </aside>
  );
}

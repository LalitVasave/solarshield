import React from 'react';
import { NavLink } from 'react-router-dom';

export default function TopNavBar() {
  return (
    <header className="hidden md:flex justify-between items-center w-full px-margin-desktop h-16 bg-surface-container-lowest dark:bg-surface-container-low border-b border-outline-variant dark:border-outline shadow-sm dark:shadow-none z-50">
      <div className="flex items-center gap-xl">
        <span className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed-dim">SolarShield</span>
        <nav className="flex gap-md overflow-x-auto hide-scroll">
          <NavLink to="/" className={({isActive}) => `font-body-md text-body-md transition-colors cursor-pointer active:opacity-70 pb-1 whitespace-nowrap ${isActive ? 'text-primary dark:text-primary-fixed-dim border-b-2 border-primary dark:border-primary-fixed-dim' : 'text-secondary dark:text-secondary-fixed-dim hover:text-primary dark:hover:text-primary-fixed-dim'}`}>Map</NavLink>
          <NavLink to="/inspections" className={({isActive}) => `font-body-md text-body-md transition-colors cursor-pointer active:opacity-70 pb-1 whitespace-nowrap ${isActive ? 'text-primary dark:text-primary-fixed-dim border-b-2 border-primary dark:border-primary-fixed-dim' : 'text-secondary dark:text-secondary-fixed-dim hover:text-primary dark:hover:text-primary-fixed-dim'}`}>Inspections</NavLink>
          <NavLink to="/flight-planner" className={({isActive}) => `font-body-md text-body-md transition-colors cursor-pointer active:opacity-70 pb-1 whitespace-nowrap ${isActive ? 'text-primary dark:text-primary-fixed-dim border-b-2 border-primary dark:border-primary-fixed-dim' : 'text-secondary dark:text-secondary-fixed-dim hover:text-primary dark:hover:text-primary-fixed-dim'}`}>Flight Planner</NavLink>
          <NavLink to="/live" className={({isActive}) => `font-body-md text-body-md transition-colors cursor-pointer active:opacity-70 pb-1 whitespace-nowrap ${isActive ? 'text-primary dark:text-primary-fixed-dim border-b-2 border-primary dark:border-primary-fixed-dim' : 'text-secondary dark:text-secondary-fixed-dim hover:text-primary dark:hover:text-primary-fixed-dim'}`}>Live Stream</NavLink>
          <NavLink to="/diagnostics" className={({isActive}) => `font-body-md text-body-md transition-colors cursor-pointer active:opacity-70 pb-1 whitespace-nowrap ${isActive ? 'text-primary dark:text-primary-fixed-dim border-b-2 border-primary dark:border-primary-fixed-dim' : 'text-secondary dark:text-secondary-fixed-dim hover:text-primary dark:hover:text-primary-fixed-dim'}`}>Diagnostics</NavLink>
          <NavLink to="/flight-planner-interactive" className={({isActive}) => `font-body-md text-body-md transition-colors cursor-pointer active:opacity-70 pb-1 whitespace-nowrap ${isActive ? 'text-primary dark:text-primary-fixed-dim border-b-2 border-primary dark:border-primary-fixed-dim' : 'text-secondary dark:text-secondary-fixed-dim hover:text-primary dark:hover:text-primary-fixed-dim'}`}>Flight (Interactive)</NavLink>
          <NavLink to="/global-map" className={({isActive}) => `font-body-md text-body-md transition-colors cursor-pointer active:opacity-70 pb-1 whitespace-nowrap ${isActive ? 'text-primary dark:text-primary-fixed-dim border-b-2 border-primary dark:border-primary-fixed-dim' : 'text-secondary dark:text-secondary-fixed-dim hover:text-primary dark:hover:text-primary-fixed-dim'}`}>Global Map</NavLink>
          <NavLink to="/settings" className={({isActive}) => `font-body-md text-body-md transition-colors cursor-pointer active:opacity-70 pb-1 whitespace-nowrap ${isActive ? 'text-primary dark:text-primary-fixed-dim border-b-2 border-primary dark:border-primary-fixed-dim' : 'text-secondary dark:text-secondary-fixed-dim hover:text-primary dark:hover:text-primary-fixed-dim'}`}>Settings</NavLink>
        </nav>
      </div>
      <div className="flex items-center gap-md">
        <button className="text-secondary dark:text-secondary-fixed-dim hover:text-primary transition-colors cursor-pointer active:opacity-70">
          <span className="material-symbols-outlined" data-icon="notifications">notifications</span>
        </button>
        <button className="text-secondary dark:text-secondary-fixed-dim hover:text-primary transition-colors cursor-pointer active:opacity-70">
          <span className="material-symbols-outlined" data-icon="settings">settings</span>
        </button>
        <img alt="User profile" className="w-8 h-8 rounded-full object-cover border border-outline-variant" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDXgZYCzUNPpuCgwidvsnOQPybfz9ueQt2LW3jcgLAltm5OdKxleg3IrwZB5RKRAfW9hj9cvIvMx7oGMj-nJqY81YlxWQsCcLxT6sB0iCd_DJhrmmxbwWbqz3QjwTk9Jg4kDpgjv0XlHx6SM-UVFAlZNOMfZYdvPSfNkEEt4VnzDpTQdJrGOnQkfus2usuyE5bJF8wskmVn7CV7egjS2Juc_Vcjm_5T5Np2dccsqKi-0fKpBlQ9XLol"/>
      </div>
    </header>
  );
}

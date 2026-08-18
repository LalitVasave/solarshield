import React from 'react';
import { Outlet } from 'react-router-dom';
import TopNavBar from './TopNavBar';

export default function AppLayout() {
  return (
    <div className="h-full flex flex-col font-body-md text-on-surface bg-surface overflow-hidden">
      <TopNavBar />
      <div className="flex flex-1 relative overflow-hidden">
        <main className="flex-1 relative w-full h-full overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

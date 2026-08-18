import React from 'react';

export default function Settings() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] w-full bg-background text-on-background font-body-md text-body-md">
      {/* Main Content Canvas */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-lg grid grid-cols-1 md:grid-cols-12 gap-gutter">
        {/* Settings Sidebar Navigation */}
        <aside className="md:col-span-3 flex flex-col gap-sm">
          <h1 className="font-headline-sm text-headline-sm text-on-background mb-sm">Settings</h1>
          <nav className="flex flex-col gap-base">
            <a className="flex items-center gap-xs px-sm py-xs rounded-DEFAULT text-on-surface-variant hover:bg-surface-container-low transition-colors font-label-md text-label-md cursor-pointer" href="#!">
              <span className="material-symbols-outlined text-[20px]">person</span>
              General
            </a>
            {/* Active State for Fleet Management */}
            <a className="flex items-center gap-xs px-sm py-xs rounded-DEFAULT bg-primary-container text-on-primary-container font-label-md text-label-md cursor-pointer" href="#!">
              <span className="material-symbols-outlined text-[20px]">flight</span>
              Fleet Management
            </a>
            <a className="flex items-center gap-xs px-sm py-xs rounded-DEFAULT text-on-surface-variant hover:bg-surface-container-low transition-colors font-label-md text-label-md cursor-pointer" href="#!">
              <span className="material-symbols-outlined text-[20px]">shield_person</span>
              User Access
            </a>
            <a className="flex items-center gap-xs px-sm py-xs rounded-DEFAULT text-on-surface-variant hover:bg-surface-container-low transition-colors font-label-md text-label-md cursor-pointer" href="#!">
              <span className="material-symbols-outlined text-[20px]">integration_instructions</span>
              API/Integrations
            </a>
          </nav>
        </aside>

        {/* Main Content Area: Fleet Management */}
        <section className="md:col-span-9 flex flex-col gap-md">
          {/* Section Header & Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-sm">
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface">Active Fleet Overview</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-base">Manage drone diagnostics, firmware deployments, and maintenance schedules.</p>
            </div>
            <div className="flex items-center gap-sm w-full sm:w-auto">
              <button className="flex-1 sm:flex-none flex items-center justify-center gap-xs px-sm py-xs bg-surface-container-lowest text-on-surface border border-outline-variant rounded-DEFAULT font-label-md text-label-md hover:bg-surface-container-low transition-colors shadow-ambient cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">build</span>
                Schedule Maintenance
              </button>
              <button className="flex-1 sm:flex-none flex items-center justify-center gap-xs px-sm py-xs bg-primary text-on-primary rounded-DEFAULT font-label-md text-label-md hover:opacity-90 transition-opacity shadow-ambient cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">add</span>
                Add New Drone
              </button>
            </div>
          </div>

          {/* Fleet Stats Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-sm">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-sm flex items-center gap-sm shadow-ambient">
              <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">flight_takeoff</span>
              </div>
              <div>
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Total Drones</p>
                <p className="font-headline-sm text-headline-sm text-on-surface">24</p>
              </div>
            </div>
            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-sm flex items-center gap-sm shadow-ambient">
              <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container">
                <span className="material-symbols-outlined">check_circle</span>
              </div>
              <div>
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Active Status</p>
                <p className="font-headline-sm text-headline-sm text-on-surface">21</p>
              </div>
            </div>
            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-sm flex items-center gap-sm shadow-ambient">
              <div className="w-10 h-10 rounded-full bg-error-container flex items-center justify-center text-on-error-container">
                <span className="material-symbols-outlined">home_repair_service</span>
              </div>
              <div>
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">In Maintenance</p>
                <p className="font-headline-sm text-headline-sm text-on-surface">3</p>
              </div>
            </div>
          </div>

          {/* Fleet Data Table */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg shadow-ambient overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant">
                    <th className="py-sm px-sm font-label-md text-label-md text-on-surface-variant font-semibold">Drone ID / Model</th>
                    <th className="py-sm px-sm font-label-md text-label-md text-on-surface-variant font-semibold">Status</th>
                    <th className="py-sm px-sm font-label-md text-label-md text-on-surface-variant font-semibold">Firmware</th>
                    <th className="py-sm px-sm font-label-md text-label-md text-on-surface-variant font-semibold">Last Maintenance</th>
                    <th className="py-sm px-sm font-label-md text-label-md text-on-surface-variant font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="font-body-sm text-body-sm text-on-surface divide-y divide-outline-variant">
                  {/* Row 1 */}
                  <tr className="hover:bg-surface-bright transition-colors group">
                    <td className="py-sm px-sm">
                      <div className="flex items-center gap-xs">
                        <div className="w-8 h-8 rounded bg-surface-variant flex items-center justify-center text-primary shrink-0">
                          <span className="material-symbols-outlined text-[18px]">flight</span>
                        </div>
                        <div>
                          <p className="font-label-md text-label-md text-on-surface">AQ-77X-Alpha</p>
                          <p className="text-on-surface-variant text-[12px]">Lumina Scout V2</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-sm px-sm">
                      <span className="inline-flex items-center gap-base px-2 py-1 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        Operational
                      </span>
                    </td>
                    <td className="py-sm px-sm text-on-surface-variant">v4.12.0</td>
                    <td className="py-sm px-sm text-on-surface-variant">Oct 12, 2024</td>
                    <td className="py-sm px-sm text-right">
                      <button className="text-on-surface-variant hover:text-primary transition-colors p-1 rounded hover:bg-surface-variant cursor-pointer">
                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                      </button>
                    </td>
                  </tr>
                  {/* Row 2 */}
                  <tr className="hover:bg-surface-bright transition-colors group">
                    <td className="py-sm px-sm">
                      <div className="flex items-center gap-xs">
                        <div className="w-8 h-8 rounded bg-surface-variant flex items-center justify-center text-primary shrink-0">
                          <span className="material-symbols-outlined text-[18px]">flight</span>
                        </div>
                        <div>
                          <p className="font-label-md text-label-md text-on-surface">AQ-77X-Beta</p>
                          <p className="text-on-surface-variant text-[12px]">Lumina Scout V2</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-sm px-sm">
                      <span className="inline-flex items-center gap-base px-2 py-1 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        Operational
                      </span>
                    </td>
                    <td className="py-sm px-sm text-on-surface-variant">v4.12.0</td>
                    <td className="py-sm px-sm text-on-surface-variant">Oct 05, 2024</td>
                    <td className="py-sm px-sm text-right">
                      <button className="text-on-surface-variant hover:text-primary transition-colors p-1 rounded hover:bg-surface-variant cursor-pointer">
                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                      </button>
                    </td>
                  </tr>
                  {/* Row 3 (Maintenance) */}
                  <tr className="hover:bg-surface-bright transition-colors group">
                    <td className="py-sm px-sm">
                      <div className="flex items-center gap-xs">
                        <div className="w-8 h-8 rounded bg-error-container flex items-center justify-center text-error shrink-0">
                          <span className="material-symbols-outlined text-[18px]">build</span>
                        </div>
                        <div>
                          <p className="font-label-md text-label-md text-on-surface">AQ-77X-Gamma</p>
                          <p className="text-on-surface-variant text-[12px]">Lumina Scout V1</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-sm px-sm">
                      <span className="inline-flex items-center gap-base px-2 py-1 rounded-full bg-error-container text-on-error-container font-label-sm text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                        In Maintenance
                      </span>
                    </td>
                    <td className="py-sm px-sm text-on-surface-variant">
                      v4.11.2 <span className="text-error material-symbols-outlined text-[14px] align-middle ml-1" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                    </td>
                    <td className="py-sm px-sm text-on-surface-variant">Sep 28, 2024</td>
                    <td className="py-sm px-sm text-right">
                      <button className="text-on-surface-variant hover:text-primary transition-colors p-1 rounded hover:bg-surface-variant cursor-pointer">
                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                      </button>
                    </td>
                  </tr>
                  {/* Row 4 */}
                  <tr className="hover:bg-surface-bright transition-colors group">
                    <td className="py-sm px-sm">
                      <div className="flex items-center gap-xs">
                        <div className="w-8 h-8 rounded bg-surface-variant flex items-center justify-center text-primary shrink-0">
                          <span className="material-symbols-outlined text-[18px]">flight</span>
                        </div>
                        <div>
                          <p className="font-label-md text-label-md text-on-surface">AQ-80X-Delta</p>
                          <p className="text-on-surface-variant text-[12px]">Lumina Heavy V1</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-sm px-sm">
                      <span className="inline-flex items-center gap-base px-2 py-1 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        Operational
                      </span>
                    </td>
                    <td className="py-sm px-sm text-on-surface-variant">v5.0.1</td>
                    <td className="py-sm px-sm text-on-surface-variant">Nov 02, 2024</td>
                    <td className="py-sm px-sm text-right">
                      <button className="text-on-surface-variant hover:text-primary transition-colors p-1 rounded hover:bg-surface-variant cursor-pointer">
                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* Pagination / Table Footer */}
            <div className="bg-surface-container-low border-t border-outline-variant py-sm px-sm flex items-center justify-between">
              <p className="font-body-sm text-body-sm text-on-surface-variant">Showing 1 to 4 of 24 entries</p>
              <div className="flex items-center gap-xs">
                <button className="p-1 rounded text-on-surface-variant hover:bg-surface-variant transition-colors disabled:opacity-50 cursor-pointer" disabled>
                  <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                </button>
                <button className="p-1 rounded text-on-surface-variant hover:bg-surface-variant transition-colors cursor-pointer">
                  <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-low dark:bg-surface-container-highest border-t border-outline-variant dark:border-outline flat no shadows full-width bottom mt-auto shrink-0">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-margin-desktop py-md max-w-7xl mx-auto gap-xs">
          <div className="flex items-center gap-sm">
            <span className="font-headline-sm text-headline-sm text-secondary dark:text-secondary-fixed-dim tracking-tight">SolarShield</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant dark:text-on-secondary-fixed-variant border-l border-outline-variant pl-sm ml-xs">© 2024 SolarShield Lumina Core. All rights reserved.</span>
          </div>
          <nav className="flex flex-wrap justify-center gap-sm md:gap-md">
            <a className="text-on-surface-variant dark:text-on-secondary-fixed-variant font-label-sm text-label-sm hover:text-primary dark:hover:text-primary-fixed-dim transition-colors cursor-pointer" href="#!">System Status</a>
            <a className="text-on-surface-variant dark:text-on-secondary-fixed-variant font-label-sm text-label-sm hover:text-primary dark:hover:text-primary-fixed-dim transition-colors cursor-pointer" href="#!">Terms of Service</a>
            <a className="text-on-surface-variant dark:text-on-secondary-fixed-variant font-label-sm text-label-sm hover:text-primary dark:hover:text-primary-fixed-dim transition-colors cursor-pointer" href="#!">Privacy Policy</a>
            <a className="text-on-surface-variant dark:text-on-secondary-fixed-variant font-label-sm text-label-sm hover:text-primary dark:hover:text-primary-fixed-dim transition-colors cursor-pointer" href="#!">Contact Support</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}

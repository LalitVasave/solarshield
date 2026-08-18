import React from 'react';

export default function Inspections() {
  return (
    <div className="flex flex-col h-full bg-background text-on-background min-h-[calc(100vh-64px)] overflow-y-auto">
      <div className="flex flex-1 max-w-7xl mx-auto w-full relative">
        
        {/* SideNavBar */}
        <aside className="hidden md:flex flex-col md:w-64 bg-surface-container-low dark:bg-surface-dim border-r border-outline-variant dark:border-outline py-md px-sm z-40 sticky top-0 h-[calc(100vh-64px)] overflow-y-auto">
          <div className="mb-lg px-2">
            <div className="flex items-center gap-xs mb-1 mt-4">
              <img alt="Farm Overview" className="w-10 h-10 rounded-DEFAULT object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAsmsMXbsBWXsyKkHxcgjbJf4awCLMi3zZqOmHlCLpuvvsWMah2bV6RuB_o52ybxXdtIpqydNG51miRJg3S7Pau7_Km5Zn9VEkpo71AMfnKL4kQb4Jq-ssU_zHTYjlnSJ-878nIyPdFDQZseTDKtBO81zF_MgAV089xOMgsDG9r93aTsMZ56FkGr2ZBQ4k57NqiJ2lE0IbgfJZJ_kF2g_he1oGVrjhskQAOK6utxn72ZcpMsVkaea4u"/>
              <div>
                <h2 className="font-headline-sm text-headline-sm font-black text-on-surface leading-tight">Farm Alpha-1</h2>
                <p className="font-label-sm text-label-sm text-on-surface-variant">Active Monitoring</p>
              </div>
            </div>
          </div>
          <nav className="flex flex-col gap-2">
            <a className="font-label-md text-label-md text-on-surface-variant dark:text-secondary-fixed-dim hover:bg-secondary-container dark:hover:bg-secondary-fixed-variant transition-all flex items-center gap-xs p-sm cursor-pointer rounded-lg" href="#!">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>sensors</span>
              Sensors
            </a>
            <a className="font-label-md text-label-md text-on-surface-variant dark:text-secondary-fixed-dim hover:bg-secondary-container dark:hover:bg-secondary-fixed-variant transition-all flex items-center gap-xs p-sm cursor-pointer rounded-lg" href="#!">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>cloud</span>
              Weather
            </a>
            <a className="font-label-md text-label-md text-on-surface-variant dark:text-secondary-fixed-dim hover:bg-secondary-container dark:hover:bg-secondary-fixed-variant transition-all flex items-center gap-xs p-sm cursor-pointer rounded-lg" href="#!">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>wb_sunny</span>
              Panels
            </a>
            <a className="font-label-md text-label-md text-on-surface-variant dark:text-secondary-fixed-dim hover:bg-secondary-container dark:hover:bg-secondary-fixed-variant transition-all flex items-center gap-xs p-sm cursor-pointer rounded-lg" href="#!">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>settings_input_component</span>
              Inverters
            </a>
            <a className="font-label-md text-label-md text-on-surface-variant dark:text-secondary-fixed-dim hover:bg-secondary-container dark:hover:bg-secondary-fixed-variant transition-all flex items-center gap-xs p-sm cursor-pointer rounded-lg" href="#!">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>battery_full</span>
              Storage
            </a>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 w-full p-margin-mobile md:p-margin-desktop bg-background">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-lg gap-4 mt-4">
            <div>
              <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">Inspection Logs</h1>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">Review recent drone survey results and anomaly reports.</p>
            </div>
            <button className="bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md px-4 py-2 rounded-DEFAULT transition-colors shadow-[0px_4px_12px_rgba(30,41,59,0.05)] flex items-center gap-2 cursor-pointer">
              <span className="material-symbols-outlined text-sm">flight_takeoff</span>
              Schedule New Inspection
            </button>
          </div>

          {/* Controls (Filter/Sort) */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 mb-md flex flex-wrap gap-4 items-center shadow-[0px_4px_12px_rgba(30,41,59,0.02)]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-on-surface-variant text-sm">filter_list</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Filter by:</span>
            </div>
            <div className="flex gap-2">
              <select className="bg-surface border border-outline-variant text-on-surface font-body-sm text-body-sm rounded-DEFAULT px-3 py-1.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                <option>All Statuses</option>
                <option>Critical</option>
                <option>Warning</option>
                <option>Nominal</option>
              </select>
              <select className="bg-surface border border-outline-variant text-on-surface font-body-sm text-body-sm rounded-DEFAULT px-3 py-1.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                <option>All Farms</option>
                <option>Farm Alpha-1</option>
                <option>Farm Beta-2</option>
                <option>Farm Gamma-3</option>
              </select>
            </div>
            <div className="h-6 w-px bg-outline-variant hidden sm:block mx-2"></div>
            <div className="flex items-center gap-2 ml-auto">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Sort:</span>
              <select className="bg-surface border border-outline-variant text-on-surface font-body-sm text-body-sm rounded-DEFAULT px-3 py-1.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                <option>Newest First</option>
                <option>Oldest First</option>
                <option>Highest Severity</option>
              </select>
            </div>
          </div>

          {/* Bento Grid / Cards Layout for Logs */}
          <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-gutter">
            {/* Log Card 1: Critical */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden flex flex-col shadow-[0px_4px_12px_rgba(30,41,59,0.03)] hover:shadow-[0px_4px_12px_rgba(30,41,59,0.08)] transition-shadow">
              <div className="h-40 relative bg-surface-container-low">
                <img alt="Severe damage" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB9UWRnv9BhGdleeA3iKjQGBLfyksTmlKKVRtsbtGMFGUO496Uov0P9ZCuAYgF1tRoAQbK-j-NkkCaIjZMCentqcKo0d8qYwc6Jlzw_0tHPAN9l4zrYJgcsSxQURu7G-498O2EF-R2MrFRdDIHHlG0iClcICojMxHvZCTzBNzsLzLYkl35oXooc6VVzACOKsUT7yJpcy_l-ZWZsumZN6c6owy_8W0FbSKYmSVnetiZdh-KaIvfIBE38"/>
                <div className="absolute top-3 left-3 bg-error text-on-error font-label-sm text-label-sm px-2 py-1 rounded-DEFAULT flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">warning</span>
                  Critical
                </div>
              </div>
              <div className="p-sm flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">Farm Alpha-1</h3>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Today, 09:45 AM</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">Severe thermal anomaly detected on Sector 4, String B. Immediate maintenance required.</p>
                <div className="mt-auto pt-sm border-t border-outline-variant flex justify-between items-center">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Log ID: #INSP-8892</span>
                  <button className="font-label-md text-label-md text-primary hover:text-primary-container transition-colors flex items-center gap-1 cursor-pointer">
                    View Details
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Log Card 2: Warning */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden flex flex-col shadow-[0px_4px_12px_rgba(30,41,59,0.03)] hover:shadow-[0px_4px_12px_rgba(30,41,59,0.08)] transition-shadow">
              <div className="h-40 relative bg-surface-container-low">
                <img alt="Dusty panels" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGTU_-hnvN9Plq6qqB3SydKesPvdkRycDFc9RVQ0CfoUubT-v4AsDH-Xd8m9TwO32hppSiwylOzaNHU05TbKM6uBjzZm9DAucpD2YB-BGuU4VNGedHrvMw30EDPXfdjY4I9tllHO0P5skUuLZyMxO4p6ThDVeRtESe6FvTP6QgsSNvgQECB7e115xORo9oded6C3Od_qaMYmuHikVyNRAz0dFqo_SnWYbo4vcrN_lI1pGYm4yAjH4J"/>
                <div className="absolute top-3 left-3 bg-tertiary-container text-on-tertiary-container font-label-sm text-label-sm px-2 py-1 rounded-DEFAULT flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">error_outline</span>
                  Warning
                </div>
              </div>
              <div className="p-sm flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">Farm Beta-2</h3>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Yesterday, 14:20 PM</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">Significant soiling buildup detected across Sector 1. Cleaning recommended within 7 days to restore optimal yield.</p>
                <div className="mt-auto pt-sm border-t border-outline-variant flex justify-between items-center">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Log ID: #INSP-8891</span>
                  <button className="font-label-md text-label-md text-primary hover:text-primary-container transition-colors flex items-center gap-1 cursor-pointer">
                    View Details
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Log Card 3: Nominal */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden flex flex-col shadow-[0px_4px_12px_rgba(30,41,59,0.03)] hover:shadow-[0px_4px_12px_rgba(30,41,59,0.08)] transition-shadow">
              <div className="h-40 relative bg-surface-container-low">
                <img alt="Healthy panels" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhVgSC_rF7yLvDGFmiB7CpELAT-DPPSRHjuZ1lt0n247R2ocOyPmSXSYjBuhfRhAaCZo3ot1X_JVP_gtDDg5NevS_YsNSQ_538gOxSD_SrjOHkMCCeUXHdfFL0NL57v0Mgpe61WgPN89ALkS-uV5CraRUiAXzKALErybjYM5-fAe3e6B23EkGRJlUmKGUSRVnle5t5U_CnaWbOQHbaVPiruG8kLZUD3J6xbYEpV046qchI7YUXERSH"/>
                <div className="absolute top-3 left-3 bg-primary-container text-on-primary-container font-label-sm text-label-sm px-2 py-1 rounded-DEFAULT flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  Nominal
                </div>
              </div>
              <div className="p-sm flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">Farm Gamma-3</h3>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Oct 24, 08:00 AM</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">Routine survey completed. All sectors operating within expected thermal and structural parameters. No anomalies found.</p>
                <div className="mt-auto pt-sm border-t border-outline-variant flex justify-between items-center">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Log ID: #INSP-8890</span>
                  <button className="font-label-md text-label-md text-primary hover:text-primary-container transition-colors flex items-center gap-1 cursor-pointer">
                    View Details
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Log Card 4: Critical */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden flex flex-col shadow-[0px_4px_12px_rgba(30,41,59,0.03)] hover:shadow-[0px_4px_12px_rgba(30,41,59,0.08)] transition-shadow">
              <div className="h-40 relative bg-surface-container-low">
                <img alt="Thermal hotspot" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDzjYf6bQ0I6o9eVDMUe2zJLNKmPAFJSb4ekGAbUvIA_kTqmKATuPbQXYkoc7mjcWZgwMS16Mnfuetciaxn2tjUs39KOorz_aWYJh_mRv_gJlfHzB1pNsFKexl6q3W8EjJ4WwjoA6DxjiwyZZ0zWgNsu0gvo0BzgC3WbMTOYQKFuSHTI5fdYbeS54SkbIu2OJvfF5JkMsj92_dN9ubgvcWd2cKFpinFQw12AohiSEQy0Y-AwpYnR0Tq"/>
                <div className="absolute top-3 left-3 bg-error text-on-error font-label-sm text-label-sm px-2 py-1 rounded-DEFAULT flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">warning</span>
                  Critical
                </div>
              </div>
              <div className="p-sm flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">Farm Alpha-1</h3>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Oct 22, 11:15 AM</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">Inverter offline in Sector 2. Multiple hot spots detected indicating potential string failure. Urgent review needed.</p>
                <div className="mt-auto pt-sm border-t border-outline-variant flex justify-between items-center">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Log ID: #INSP-8889</span>
                  <button className="font-label-md text-label-md text-primary hover:text-primary-container transition-colors flex items-center gap-1 cursor-pointer">
                    View Details
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-surface-container-lowest dark:bg-surface-container-low w-full bottom-0 border-t border-outline-variant dark:border-outline mt-auto">
        <div className="flex justify-between items-center w-full px-margin-desktop py-md max-w-7xl mx-auto flex-col sm:flex-row gap-4">
          <span className="font-label-md text-label-md font-bold text-on-surface-variant">© 2024 SolarShield Intelligence. All rights reserved.</span>
          <div className="flex gap-md">
            <a className="font-label-sm text-label-sm text-on-surface-variant dark:text-on-secondary-fixed-variant hover:text-primary dark:hover:text-primary-fixed-dim transition-opacity duration-200" href="#!">System Status</a>
            <a className="font-label-sm text-label-sm text-on-surface-variant dark:text-on-secondary-fixed-variant hover:text-primary dark:hover:text-primary-fixed-dim transition-opacity duration-200" href="#!">API Docs</a>
            <a className="font-label-sm text-label-sm text-on-surface-variant dark:text-on-secondary-fixed-variant hover:text-primary dark:hover:text-primary-fixed-dim transition-opacity duration-200" href="#!">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

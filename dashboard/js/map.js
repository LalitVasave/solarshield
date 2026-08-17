/**
 * map.js — Leaflet.js farm map with panel markers
 */

let map = null;
let markers = {};

const COLOUR_MAP = {
  green:  { fill: '#27ae60', stroke: '#1e8449' },
  yellow: { fill: '#f39c12', stroke: '#d68910' },
  red:    { fill: '#e74c3c', stroke: '#cb4335' },
  grey:   { fill: '#555577', stroke: '#44446a' },
};

function initMap(centerLat = 28.6139, centerLng = 77.2090) {
  if (map) return;

  map = L.map('map', {
    center: [centerLat, centerLng],
    zoom: 19,
    zoomControl: true,
  });

  // Dark tile layer (CartoDB Dark Matter)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap contributors © CARTO',
    subdomains: 'abcd',
    maxZoom: 22,
  }).addTo(map);
}

function updateMap(panels) {
  if (!panels.length) return;

  // Initialize map centered on first panel
  const first = panels[0];
  if (!map) {
    initMap(parseFloat(first.lat), parseFloat(first.lng));
  }

  // Clear existing markers
  Object.values(markers).forEach(m => map.removeLayer(m));
  markers = {};

  const bounds = [];

  panels.forEach(panel => {
    const lat    = parseFloat(panel.lat);
    const lng    = parseFloat(panel.lng);
    const colour = panel.colour || 'grey';
    const c      = COLOUR_MAP[colour] || COLOUR_MAP.grey;

    bounds.push([lat, lng]);

    const marker = L.circleMarker([lat, lng], {
      radius:      12,
      fillColor:   c.fill,
      color:       c.stroke,
      weight:      2,
      opacity:     1,
      fillOpacity: 0.85,
    });

    // Tooltip (always visible)
    marker.bindTooltip(
      `<div class="panel-popup">
         <strong>${panel.panel_id}</strong><br/>
         ${panel.severity} ${panel.fault_type ? '— ' + panel.fault_type : ''}
       </div>`,
      { permanent: false, direction: 'top', className: 'panel-tooltip' }
    );

    // Click → open drawer
    marker.on('click', () => openPanel(panel.panel_id));

    marker.addTo(map);
    markers[panel.panel_id] = marker;
  });

  // Fit map to panel bounds
  if (bounds.length > 1) {
    map.fitBounds(bounds, { padding: [40, 40] });
  } else if (bounds.length === 1) {
    map.setView(bounds[0], 20);
  }
}

// Init map shell immediately (before data loads)
window.addEventListener('DOMContentLoaded', () => {
  initMap();
});

/**
 * dashboard.js — Auth, API calls, inspections table, panel drawer
 */

const API = '';  // Same origin — FastAPI serves dashboard at /dashboard

let token = localStorage.getItem('ss_token');
let currentFarm = 'FARM-001';

// ── Auth ─────────────────────────────────────────────────────────────────

function showLoginModal() {
  document.getElementById('login-modal').classList.remove('hidden');
  document.getElementById('login-username').focus();
}

function hideLoginModal() {
  document.getElementById('login-modal').classList.add('hidden');
  document.getElementById('login-error').classList.add('hidden');
}

async function doLogin() {
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;
  const errEl    = document.getElementById('login-error');

  if (!username || !password) {
    errEl.textContent = 'Please enter username and password.';
    errEl.classList.remove('hidden');
    return;
  }

  const form = new FormData();
  form.append('username', username);
  form.append('password', password);

  try {
    const res = await fetch(`${API}/auth/token`, { method: 'POST', body: form });
    if (!res.ok) {
      const data = await res.json();
      errEl.textContent = data.detail || 'Login failed';
      errEl.classList.remove('hidden');
      return;
    }
    const data = await res.json();
    token = data.access_token;
    localStorage.setItem('ss_token', token);
    hideLoginModal();
    onLoggedIn(username);
    loadFarmStatus();
    loadRecentInspections();
  } catch (e) {
    errEl.textContent = 'Network error: ' + e.message;
    errEl.classList.remove('hidden');
  }
}

function logout() {
  token = null;
  localStorage.removeItem('ss_token');
  document.getElementById('auth-status').className = 'auth-status not-logged-in';
  document.getElementById('auth-status').innerHTML = '<span>Not authenticated</span>';
  document.getElementById('btn-login').classList.remove('hidden');
  document.getElementById('btn-logout').classList.add('hidden');
  document.getElementById('inspections-tbody').innerHTML =
    '<tr><td colspan="7" class="empty-row">Login to view inspections</td></tr>';
}

function onLoggedIn(username) {
  document.getElementById('auth-status').className = 'auth-status logged-in';
  document.getElementById('auth-status').innerHTML = `<span>👤 ${username}</span>`;
  document.getElementById('btn-login').classList.add('hidden');
  document.getElementById('btn-logout').classList.remove('hidden');
}

// ── API helpers ───────────────────────────────────────────────────────────

function authHeaders() {
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function apiFetch(path) {
  const res = await fetch(API + path, { headers: authHeaders() });
  if (res.status === 401) { logout(); return null; }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ── Farm status ───────────────────────────────────────────────────────────

async function loadFarmStatus() {
  if (!token) return;
  document.getElementById('map-overlay').classList.remove('hidden');
  try {
    const panels = await apiFetch(`/farms/${currentFarm}/panels/status`);
    if (!panels) return;
    updateStats(panels);
    updateMap(panels);
    document.getElementById('last-update').textContent = new Date().toLocaleTimeString();
  } catch (e) {
    console.error('Farm status error:', e);
  } finally {
    document.getElementById('map-overlay').classList.add('hidden');
  }
}

function updateStats(panels) {
  const healthy  = panels.filter(p => p.colour === 'green').length;
  const warning  = panels.filter(p => p.colour === 'yellow').length;
  const critical = panels.filter(p => p.colour === 'red').length;
  document.getElementById('stat-total').textContent   = panels.length;
  document.getElementById('stat-healthy').textContent  = healthy;
  document.getElementById('stat-warning').textContent  = warning;
  document.getElementById('stat-critical').textContent = critical;
}

// ── Inspections table ─────────────────────────────────────────────────────

async function loadRecentInspections() {
  if (!token) return;
  try {
    const data = await apiFetch('/inspections/?');
    if (!data) return;
    const tbody = document.getElementById('inspections-tbody');
    if (!data.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="empty-row">No inspections yet</td></tr>';
      return;
    }
    tbody.innerHTML = data.map(insp => {
      const result = insp.result;
      const sev    = result?.severity || '—';
      const sevClass = { NONE: 'green', LOW: 'green', MEDIUM: 'yellow', HIGH: 'red' }[sev] || 'grey';
      const statusClass = { completed: 'green', processing: 'blue', pending: 'grey', failed: 'red' }[insp.status] || 'grey';
      const conf = result?.confidence ? (parseFloat(result.confidence) * 100).toFixed(0) + '%' : '—';
      const date = new Date(insp.inspected_at).toLocaleString();
      return `
        <tr>
          <td><strong>${insp.panel_id}</strong></td>
          <td><span class="badge badge-${statusClass}">${insp.status.toUpperCase()}</span></td>
          <td>${result?.fault_type || '—'}</td>
          <td><span class="badge badge-${sevClass}">${sev}</span></td>
          <td>${conf}</td>
          <td>${date}</td>
          <td>
            ${insp.status === 'completed'
              ? `<a class="btn-pdf" style="padding:4px 10px;font-size:11px;display:inline-block;width:auto"
                   href="${API}/inspections/${insp.id}/report" target="_blank">PDF</a>`
              : '—'}
          </td>
        </tr>`;
    }).join('');
  } catch (e) {
    console.error('Inspections error:', e);
  }
}

// ── Panel drawer ──────────────────────────────────────────────────────────

async function openPanel(panelId) {
  const drawer = document.getElementById('panel-drawer');
  document.getElementById('drawer-panel-id').textContent = `Panel ${panelId}`;
  document.getElementById('drawer-body').innerHTML = '<div class="drawer-loading">Loading…</div>';
  drawer.classList.add('open');

  if (!token) {
    document.getElementById('drawer-body').innerHTML =
      '<p style="color:var(--text-muted)">Login to see panel details.</p>';
    return;
  }

  try {
    const history = await apiFetch(`/panels/${panelId}/history`);
    if (!history) return;
    renderDrawer(panelId, history);
  } catch (e) {
    document.getElementById('drawer-body').innerHTML =
      `<p style="color:var(--red)">Error loading panel: ${e.message}</p>`;
  }
}

function renderDrawer(panelId, history) {
  if (!history.length) {
    document.getElementById('drawer-body').innerHTML =
      '<p style="color:var(--text-muted)">No inspections yet for this panel.</p>';
    return;
  }

  const latest = history[0];
  const result = latest?.result;
  const sev    = result?.severity || 'NONE';
  const sevClass = { NONE: 'low', LOW: 'low', MEDIUM: 'medium', HIGH: 'high' }[sev] || 'low';

  let html = `<div class="fault-card ${sevClass}">`;
  html += `<div class="detail-row"><span class="detail-key">Latest Status</span>
             <span class="detail-val">${latest.status.toUpperCase()}</span></div>`;

  if (result) {
    html += `<div class="detail-row"><span class="detail-key">Fault Detected</span>
               <span class="detail-val">${result.fault_detected ? '⚠ YES' : '✓ No'}</span></div>`;
    html += `<div class="detail-row"><span class="detail-key">Fault Type</span>
               <span class="detail-val">${result.fault_type || 'None'}</span></div>`;
    html += `<div class="detail-row"><span class="detail-key">Severity</span>
               <span class="detail-val">${sev}</span></div>`;
    html += `<div class="detail-row"><span class="detail-key">Confidence</span>
               <span class="detail-val">${result.confidence ? (parseFloat(result.confidence)*100).toFixed(1)+'%' : '—'}</span></div>`;
    html += `<div class="detail-row"><span class="detail-key">Delta-T</span>
               <span class="detail-val">${result.delta_t || '—'}°C</span></div>`;
    html += `<div class="detail-row"><span class="detail-key">Hotspots</span>
               <span class="detail-val">${result.hotspot_count}</span></div>`;

    if (result.annotated_image_path) {
      html += `<img class="annotated-img" src="/images/${result.annotated_image_path}" alt="Annotated inspection" loading="lazy" />`;
    }

    if (latest.status === 'completed') {
      html += `<a class="btn-pdf" href="/inspections/${latest.id}/report" target="_blank">📄 Download PDF Report</a>`;
    }
  }

  html += `</div>`;

  // History list
  html += `<div class="section-title" style="margin-top:20px">INSPECTION HISTORY (${history.length})</div>`;
  html += history.slice(0, 10).map(insp => {
    const r = insp.result;
    const s = r?.severity || 'NONE';
    const cls = { NONE:'green', LOW:'green', MEDIUM:'yellow', HIGH:'red' }[s] || 'grey';
    return `<div class="detail-row">
      <span class="detail-key">${new Date(insp.inspected_at).toLocaleDateString()}</span>
      <span class="detail-val"><span class="badge badge-${cls}">${s}</span></span>
    </div>`;
  }).join('');

  document.getElementById('drawer-body').innerHTML = html;
}

// Close panel drawer
function closeDrawer() {
    document.getElementById('panel-drawer').classList.remove('open');
}

// Download Flight Path KML
function downloadFlightPath() {
    const farmId = document.getElementById('farm-select').value;
    const token = localStorage.getItem('token');
    
    if (!token) {
        alert("Please login first to download the flight path.");
        return;
    }
    
    fetch(`http://localhost:8000/farms/${farmId}/flightpath`, {
        headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(res => {
        if (!res.ok) throw new Error("Failed to generate KML flight path");
        return res.blob();
    })
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${farmId}_flightpath.kml`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    })
    .catch(err => alert(err.message));
}

function switchFarm() {
  const newFarm = document.getElementById('farm-select').value;
  document.getElementById('farm-id').textContent = newFarm;
  loadFarmStatus();
  loadDigitalTwin();
}

function showDashboardSection() {
    document.querySelector('.map-container').style.display = 'block';
    document.getElementById('inspections-section').style.display = 'block';
    document.getElementById('twin-section').style.display = 'none';
    document.getElementById('live-section').style.display = 'none';
    
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.getElementById('nav-dashboard').classList.add('active');
}

function showLiveSection() {
    document.querySelector('.map-container').style.display = 'none';
    document.getElementById('inspections-section').style.display = 'none';
    document.getElementById('twin-section').style.display = 'none';
    document.getElementById('live-section').style.display = 'block';
    
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.getElementById('nav-live').classList.add('active');
}

async function startLiveStream() {
    const urlInput = document.getElementById('stream-url').value || '0';
    const placeholder = document.getElementById('stream-placeholder');
    const video = document.getElementById('live-video');
    
    placeholder.textContent = "Connecting to drone feed...";
    
    const formData = new FormData();
    formData.append("rtsp_url", urlInput);
    
    try {
        const res = await fetch(`http://localhost:8000/streams/start`, {
            method: 'POST',
            body: formData
        });
        if (res.ok) {
            const data = await res.json();
            video.src = `http://localhost:8000${data.feed_url}`;
            video.style.display = 'block';
            placeholder.style.display = 'none';
        } else {
            placeholder.textContent = "Failed to start stream.";
        }
    } catch (e) {
        placeholder.textContent = "Error: " + e.message;
    }
}

function showTwinSection() {
    document.querySelector('.map-container').style.display = 'none';
    document.getElementById('inspections-section').style.display = 'none';
    document.getElementById('live-section').style.display = 'none';
    document.getElementById('twin-section').style.display = 'block';
    
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.getElementById('nav-twin').classList.add('active');
    
    loadDigitalTwin();
}

async function loadDigitalTwin() {
    const farmId = document.getElementById('farm-select').value;
    try {
        const res = await fetch(`http://localhost:8000/farms/${farmId}`);
        if (res.ok) {
            const data = await res.json();
            const viewer = document.getElementById('farm-3d-model');
            const placeholder = document.getElementById('twin-placeholder');
            
            if (data.digital_twin_url) {
                viewer.src = "http://localhost:8000" + data.digital_twin_url;
                viewer.style.display = 'block';
                placeholder.style.display = 'none';
            } else {
                viewer.style.display = 'none';
                placeholder.style.display = 'block';
            }
        }
    } catch (err) {
        console.error("Failed to load digital twin info", err);
    }
}

async function upload3DModel() {
    const farmId = document.getElementById('farm-select').value;
    const fileInput = document.getElementById('model-upload');
    const token = localStorage.getItem('token');
    
    if (!token) return alert("Please login to upload a model.");
    if (!fileInput.files.length) return alert("Please select a .glb or .gltf file.");
    
    const formData = new FormData();
    formData.append("file", fileInput.files[0]);
    
    try {
        const res = await fetch(`http://localhost:8000/farms/${farmId}/3d-model`, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token },
            body: formData
        });
        
        if (!res.ok) throw new Error(await res.text());
        alert("Model uploaded successfully!");
        loadDigitalTwin();
    } catch (err) {
        alert("Upload failed: " + err.message);
    }
}

// ── Enter key for login ───────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !document.getElementById('login-modal').classList.contains('hidden')) {
    doLogin();
  }
  if (e.key === 'Escape') {
    closeDrawer();
    hideLoginModal();
  }
});

// ── Init ──────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  if (token) {
    // Validate token
    fetch(`${API}/auth/me`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : null)
      .then(user => {
        if (user) {
          onLoggedIn(user.username);
          loadFarmStatus();
          loadRecentInspections();
        } else {
          token = null;
          localStorage.removeItem('ss_token');
        }
      })
      .catch(() => { token = null; localStorage.removeItem('ss_token'); });
  }

  // Auto-refresh every 30s
  setInterval(() => {
    if (token) {
      loadFarmStatus();
      loadRecentInspections();
    }
  }, 30000);
});

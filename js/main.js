// ── SIMULATED STATION DATA ──
const stations = [
  { id: 1, name: "EcoCharge Hub – Anna Nagar", lat: 13.0850, lng: 80.2101, dist: "1.2 km", speed: "150 kW DC Fast", price: "₹12/kWh", ports: [1,1,1,0,1,0], status: "available", time: "18 min", facilities: ["🍕 Pizza Hut","☕ Café Coffee Day"] },
  { id: 2, name: "GreenVolt Station – T. Nagar",  lat: 13.0418, lng: 80.2341, dist: "3.5 km", speed: "50 kW AC",      price: "₹8/kWh",  ports: [0,0,1,1,0,1], status: "busy",      time: "55 min", facilities: ["🍔 Burger King","🛒 Reliance Smart"] },
  { id: 3, name: "PowerUp Point – Adyar",         lat: 13.0012, lng: 80.2565, dist: "5.1 km", speed: "22 kW AC",      price: "₹6/kWh",  ports: [1,1,1,1,0,0], status: "available", time: "120 min",facilities: ["🍽️ Saravana Bhavan","🏪 Starbucks"] },
  { id: 4, name: "Rapid Charge – OMR",            lat: 12.9716, lng: 80.2488, dist: "8.2 km", speed: "250 kW DC Fast",price: "₹15/kWh", ports: [1,0,1,1,1,1], status: "available", time: "12 min", facilities: ["🍕 Domino's","🏥 Clinic"] },
  { id: 5, name: "VoltStation – Velachery",       lat: 12.9780, lng: 80.2209, dist: "6.4 km", speed: "7 kW AC",       price: "₹5/kWh",  ports: [0,1,1,0,0,1], status: "reserved",  time: "240 min",facilities: ["☕ Tea stall","🏪 Supermart"] },
];

const trips = [
  { date: "Apr 25, 2025", from: "Anna Nagar", to: "OMR Tech Park", km: "28 km", kwh: "7.2 kWh", cost: "₹86", station: "Rapid Charge – OMR" },
  { date: "Apr 20, 2025", from: "T. Nagar",   to: "Adyar Beach",   km: "12 km", kwh: "3.1 kWh", cost: "₹37", station: "PowerUp Point – Adyar" },
  { date: "Apr 15, 2025", from: "Velachery",  to: "Anna Nagar",    km: "19 km", kwh: "5.0 kWh", cost: "₹60", station: "EcoCharge Hub – Anna Nagar" },
  { date: "Apr 10, 2025", from: "Adyar",      to: "T. Nagar",      km: "7 km",  kwh: "1.8 kWh", cost: "₹22", station: "GreenVolt Station – T. Nagar" },
];

// ── MAP ──
let map;
function initMap() {
  if (!document.getElementById('map')) return;
  map = L.map('map').setView([13.0450, 80.2341], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map);

  const greenIcon = L.divIcon({
    html: `<div style="background:#2ecc71;width:28px;height:28px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:14px;">⚡</div>`,
    className: '', iconSize: [28,28], iconAnchor: [14,14]
  });

  stations.forEach(s => {
    const marker = L.marker([s.lat, s.lng], { icon: greenIcon }).addTo(map);
    marker.bindPopup(`
      <div style="font-family:'DM Sans',sans-serif;min-width:200px">
        <strong style="font-size:0.95rem">${s.name}</strong><br>
        <span style="color:#2ecc71;font-size:0.85rem">⚡ ${s.speed}</span><br>
        <span style="font-size:0.8rem;color:#6b7280">${s.price} &nbsp;·&nbsp; ${s.dist}</span><br>
        <span style="font-size:0.8rem">Status: <b style="color:${s.status==='available'?'#2ecc71':s.status==='busy'?'#ef4444':'#f59e0b'}">${s.status}</b></span>
      </div>
    `);
  });
}

// ── RENDER STATION CARDS ──
function renderStations(list) {
  const container = document.getElementById('stationCards');
  if (!container) return;
  container.innerHTML = list.map(s => {
    const portDots = s.ports.map(p =>
      `<div class="port-dot ${p ? 'available' : 'busy'}"></div>`
    ).join('');
    const statusClass = s.status === 'available' ? 'badge-green' : s.status === 'busy' ? 'badge-red' : 'badge-yellow';
    const facilities = s.facilities.map(f => `<span style="font-size:0.8rem;color:#6b7280">${f}</span>`).join(' · ');
    return `
      <div class="station-card fade-up">
        <div class="station-header">
          <div>
            <div class="station-name">${s.name}</div>
            <div class="station-dist">📍 ${s.dist}</div>
          </div>
          <span class="badge ${statusClass}">${s.status}</span>
        </div>
        <div class="station-info">
          <div class="info-item"><strong>${s.speed}</strong>Charge Speed</div>
          <div class="info-item"><strong>${s.price}</strong>Price</div>
          <div class="info-item"><strong>~${s.time}</strong>Est. Time</div>
        </div>
        <div>
          <div style="font-size:0.75rem;color:#6b7280;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.5px">Port Availability</div>
          <div class="port-dots">${portDots}</div>
        </div>
        <div style="border-top:1px solid #f0f0f0;padding-top:0.75rem">
          <div style="font-size:0.75rem;color:#6b7280;margin-bottom:4px">Nearby</div>
          <div style="display:flex;gap:0.5rem;flex-wrap:wrap">${facilities}</div>
        </div>
        <button class="btn btn-primary" onclick="showNotif('Navigating to ${s.name}...')">⚡ Navigate Here</button>
      </div>
    `;
  }).join('');
}

// ── ROUTE PLANNER ──
function planRoute() {
  const from = document.getElementById('fromLoc')?.value || 'Current Location';
  const to   = document.getElementById('toLoc')?.value;
  const bat  = parseInt(document.getElementById('batSlider')?.value || 75);
  const cap  = parseInt(document.getElementById('batCap')?.value || 60);

  if (!to) { showNotif('Please enter a destination!'); return; }

  const distKm   = Math.round(10 + Math.random() * 60);
  const kwUsed   = Math.round(distKm * 0.18 * 10) / 10;
  const batAfter = Math.max(5, bat - Math.round((kwUsed / cap) * 100));
  const stops    = batAfter < 20 ? 1 : 0;
  const cost     = Math.round(kwUsed * 10);

  document.getElementById('routeResult').innerHTML = `
    <div class="result-box">
      <h4>🗺️ Route: ${from} → ${to}</h4>
      <div class="result-row"><span>Distance</span><span>~${distKm} km</span></div>
      <div class="result-row"><span>Energy Used</span><span>~${kwUsed} kWh</span></div>
      <div class="result-row"><span>Battery After Trip</span><span>${batAfter}%</span></div>
      <div class="result-row"><span>Charging Stops Needed</span><span>${stops}</span></div>
      <div class="result-row"><span>Est. Charging Cost</span><span>₹${cost}</span></div>
      ${stops > 0 ? `<div style="margin-top:0.75rem;padding:0.75rem;background:rgba(46,204,113,0.1);border-radius:8px;font-size:0.85rem">
        ⚡ Suggested Stop: <strong>${stations[0].name}</strong> (${stations[0].dist} off route)
      </div>` : '<div style="margin-top:0.75rem;font-size:0.85rem;color:#16a34a">✅ No charging stop needed for this trip!</div>'}
    </div>
  `;
  showNotif('Route planned successfully!');
}

// ── CHARGE CALCULATOR ──
function calcCharge() {
  const speed = parseFloat(document.getElementById('chargeSpeed')?.value || 50);
  const from  = parseInt(document.getElementById('chargeFrom')?.value || 20);
  const to    = parseInt(document.getElementById('chargeTo')?.value   || 80);
  const cap   = parseFloat(document.getElementById('vehicleCap')?.value || 60);

  const kwNeeded = ((to - from) / 100) * cap;
  const mins     = Math.round((kwNeeded / speed) * 60);
  const cost     = Math.round(kwNeeded * 10);

  document.getElementById('chargeResult').innerHTML = `
    <div class="result-box">
      <h4>⚡ Charging Estimate</h4>
      <div class="result-row"><span>Energy Required</span><span>${kwNeeded.toFixed(1)} kWh</span></div>
      <div class="result-row"><span>Charging Time</span><span>${mins} min</span></div>
      <div class="result-row"><span>Estimated Cost</span><span>₹${cost}</span></div>
    </div>
  `;
}

// ── TRIPS TABLE ──
function renderTrips() {
  const tbody = document.getElementById('tripsBody');
  if (!tbody) return;
  tbody.innerHTML = trips.map(t => `
    <tr>
      <td>${t.date}</td>
      <td>${t.from}</td>
      <td>${t.to}</td>
      <td>${t.km}</td>
      <td>${t.kwh}</td>
      <td style="color:#2ecc71;font-weight:600">${t.cost}</td>
      <td style="font-size:0.8rem;color:#6b7280">${t.station}</td>
    </tr>
  `).join('');
}

// ── NOTIFICATION ──
function showNotif(msg) {
  const n = document.getElementById('notif');
  if (!n) return;
  n.textContent = '⚡ ' + msg;
  n.classList.add('show');
  setTimeout(() => n.classList.remove('show'), 3000);
}

// ── SEARCH FILTER ──
function searchStations() {
  const q = document.getElementById('searchInput')?.value.toLowerCase() || '';
  const filtered = q ? stations.filter(s =>
    s.name.toLowerCase().includes(q) || s.speed.toLowerCase().includes(q)
  ) : stations;
  renderStations(filtered);
}

// ── CONTACT FORM ──
function submitContact(e) {
  if (e) e.preventDefault();
  showNotif('Message sent! We\'ll get back to you soon.');
  document.getElementById('contactForm')?.reset();
}

// ── RANGE SLIDER SYNC ──
function syncSlider(id, outId) {
  const slider = document.getElementById(id);
  const out    = document.getElementById(outId);
  if (slider && out) {
    out.textContent = slider.value + '%';
    slider.addEventListener('input', () => out.textContent = slider.value + '%');
  }
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  renderStations(stations);
  renderTrips();
  syncSlider('batSlider', 'batVal');

  // highlight active nav
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });
});

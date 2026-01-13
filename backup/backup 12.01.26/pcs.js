// PC Specs Monitoring - Card-based Design

// ===== CHECK AUTHENTICATION ON PAGE LOAD =====
(async function() {
  const user = await requireAuth();
  if (user) {
    console.log('✅ User authenticated on PC Specs page:', user.username);
  }
})();

let allPCs = [];
let filteredPCs = [];

// Render PC cards with modern design
function renderPCCards(pcs) {
  const container = document.getElementById('pcsContainer');
  if (!container) return;

  if (pcs.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-desktop"></i>
        <h4>No PC specs found</h4>
        <p>Add a PC to get started</p>
      </div>
    `;
    return;
  }

  container.innerHTML = pcs.map(pc => `
    <div class="pc-card">
      <div class="pc-header">
        <div>
          <div class="pc-branch">${pc.branch_name || 'N/A'}</div>
          <div style="font-size: 13px; color: var(--muted); margin-top: 3px;">
            <i class="fa-solid fa-location-dot" style="font-size: 11px;"></i> ${pc.city || 'N/A'}
            ${pc.branch_code ? `<span class="pc-code ms-2">${pc.branch_code}</span>` : ''}
          </div>
        </div>
        <div class="action-buttons">
          <button class="btn btn-sm btn-outline-warning" onclick="editPC(${pc.id})" title="Edit">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger" onclick="deletePC(${pc.id})" title="Delete">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>

      <div class="spec-row">
        <div class="spec-item">
          <i class="fa-solid fa-desktop spec-icon"></i>
          <div>
            <div class="spec-label">Desktop</div>
            <div class="spec-value">${pc.desktop_name || 'N/A'}</div>
          </div>
        </div>
        <div class="spec-item">
          <i class="fa-solid fa-hashtag spec-icon"></i>
          <div>
            <div class="spec-label">PC #</div>
            <div class="spec-value">${pc.pc_number || 'N/A'}</div>
          </div>
        </div>
      </div>

      <div class="spec-row">
        <div class="spec-item">
          <i class="fa-solid fa-microchip spec-icon"></i>
          <div>
            <div class="spec-label">CPU</div>
            <div class="spec-value">${pc.processor || 'N/A'}</div>
          </div>
        </div>
        <div class="spec-item">
          <i class="fa-solid fa-memory spec-icon"></i>
          <div>
            <div class="spec-label">RAM</div>
            <div class="spec-value">${pc.ram || 'N/A'}</div>
          </div>
        </div>
      </div>

      <div class="spec-row">
        <div class="spec-item">
          <i class="fa-solid fa-hard-drive spec-icon"></i>
          <div>
            <div class="spec-label">Storage</div>
            <div class="spec-value">${pc.storage || 'N/A'}</div>
          </div>
        </div>
        <div class="spec-item">
          <i class="fa-solid fa-plug spec-icon"></i>
          <div>
            <div class="spec-label">PSU</div>
            <div class="spec-value">${pc.psu || 'N/A'}</div>
          </div>
        </div>
      </div>

      <div class="spec-row">
        <div class="spec-item">
          <i class="fa-solid fa-layer-group spec-icon"></i>
          <div>
            <div class="spec-label">Motherboard</div>
            <div class="spec-value">${pc.motherboard || 'N/A'}</div>
          </div>
        </div>
        <div class="spec-item">
          <i class="fa-solid fa-tv spec-icon"></i>
          <div>
            <div class="spec-label">Monitor</div>
            <div class="spec-value">${pc.monitor || 'N/A'}</div>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

// Calculate and display statistics
function updateStats(pcs) {
  const totalPCs = pcs.length;
  const uniqueBranches = [...new Set(pcs.map(pc => pc.branch_name).filter(Boolean))].length;
  const uniqueCities = [...new Set(pcs.map(pc => pc.city).filter(Boolean))].length;
  
  // Calculate average RAM (extract numbers from RAM strings like "8GB", "16 GB")
  const ramValues = pcs.map(pc => {
    const ram = pc.ram || '';
    const match = ram.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }).filter(v => v > 0);
  const avgRAM = ramValues.length > 0 ? Math.round(ramValues.reduce((a, b) => a + b, 0) / ramValues.length) : 0;

  document.getElementById('totalPCs').textContent = totalPCs;
  document.getElementById('totalBranches').textContent = uniqueBranches;
  document.getElementById('totalCities').textContent = uniqueCities;
  document.getElementById('avgRAM').textContent = avgRAM > 0 ? `${avgRAM}GB` : 'N/A';
}

// Populate filter dropdowns
function populateFilters(pcs) {
  const cities = [...new Set(pcs.map(pc => pc.city).filter(Boolean))].sort();
  const filterCity = document.getElementById('filterCity');
  filterCity.innerHTML = '<option value="">All Cities</option>' + 
    cities.map(city => `<option value="${city}">${city}</option>`).join('');
}

// Load PCs from server
async function loadPCs() {
  try {
    const res = await fetch('/pcs');
    allPCs = await res.json();
    filteredPCs = allPCs;
    renderPCCards(filteredPCs);
    updateStats(allPCs);
    populateFilters(allPCs);
  } catch (err) {
    console.error('Error loading PC specs:', err);
    document.getElementById('pcsContainer').innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <h4>Error loading data</h4>
        <p>${err.message}</p>
      </div>
    `;
  }
}

// Search functionality
const searchInput = document.getElementById('searchInput');
if (searchInput) {
  searchInput.addEventListener('input', filterPCs);
}

// City filter
const filterCity = document.getElementById('filterCity');
if (filterCity) {
  filterCity.addEventListener('change', filterPCs);
}

// Apply filters
function filterPCs() {
  const searchQuery = searchInput.value.toLowerCase();
  const cityFilter = filterCity.value;

  filteredPCs = allPCs.filter(pc => {
    const matchesSearch = !searchQuery || Object.values(pc).some(val => 
      (val || '').toString().toLowerCase().includes(searchQuery)
    );
    const matchesCity = !cityFilter || pc.city === cityFilter;
    
    return matchesSearch && matchesCity;
  });

  renderPCCards(filteredPCs);
}

// Clear filters
window.clearFilters = function() {
  searchInput.value = '';
  filterCity.value = '';
  filteredPCs = allPCs;
  renderPCCards(filteredPCs);
};

// Delete PC
window.deletePC = async function(id) {
  if (!confirm('Are you sure you want to delete this PC spec?')) return;
  try {
    const res = await fetch(`/pcs/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Delete failed');
    await loadPCs();
  } catch (err) {
    alert('Error deleting PC spec: ' + err.message);
  }
};

// Modal management
let currentModal = null;
let currentEditId = null;

function showPCModal(pc = null) {
  currentEditId = pc ? pc.id : null;
  
  // Create modal if it doesn't exist
  if (!document.getElementById('pcModal')) {
    const modalHTML = `
      <div class="modal fade" id="pcModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
          <div class="modal-content" style="background: #1a2332; color: #e6f2fb; border: 1px solid rgba(255,255,255,0.1);">
            <form id="pcForm">
              <div class="modal-header" style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                <h5 class="modal-title" id="modalTitle"></h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Branch Name *</label>
                    <input type="text" name="branch_name" class="form-control" required>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">City *</label>
                    <input type="text" name="city" class="form-control" required>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Branch Code</label>
                    <input type="text" name="branch_code" class="form-control">
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Desktop Name *</label>
                    <input type="text" name="desktop_name" class="form-control" required>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">PC Number *</label>
                    <input type="text" name="pc_number" class="form-control" required>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Processor</label>
                    <input type="text" name="processor" class="form-control" placeholder="e.g., Intel Core i5-10400">
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">RAM</label>
                    <input type="text" name="ram" class="form-control" placeholder="e.g., 16GB DDR4">
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Storage</label>
                    <input type="text" name="storage" class="form-control" placeholder="e.g., 512GB SSD">
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Motherboard</label>
                    <input type="text" name="motherboard" class="form-control">
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">PSU</label>
                    <input type="text" name="psu" class="form-control" placeholder="e.g., 500W">
                  </div>
                  <div class="col-md-12 mb-3">
                    <label class="form-label">Monitor</label>
                    <input type="text" name="monitor" class="form-control" placeholder="e.g., Dell 24-inch">
                  </div>
                </div>
              </div>
              <div class="modal-footer" style="border-top: 1px solid rgba(255,255,255,0.1);">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="submit" class="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add form submit handler
    document.getElementById('pcForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const pcData = Object.fromEntries(formData.entries());
      
      try {
        const url = currentEditId ? `/pcs/${currentEditId}` : '/pcs';
        const method = currentEditId ? 'PUT' : 'POST';
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pcData)
        });
        if (!res.ok) throw new Error('Save failed');
        
        bootstrap.Modal.getInstance(document.getElementById('pcModal')).hide();
        await loadPCs();
      } catch (err) {
        alert('Error saving PC spec: ' + err.message);
      }
    });
  }
  
  // Populate form
  const modal = document.getElementById('pcModal');
  const form = document.getElementById('pcForm');
  const title = document.getElementById('modalTitle');
  
  title.textContent = pc ? 'Edit PC Spec' : 'Add PC Spec';
  form.reset();
  
  if (pc) {
    Object.keys(pc).forEach(key => {
      const input = form.elements[key];
      if (input && pc[key]) input.value = pc[key];
    });
  }
  
  currentModal = new bootstrap.Modal(modal);
  currentModal.show();
}

// Edit PC
window.editPC = function(id) {
  const pc = allPCs.find(p => p.id === id);
  if (pc) showPCModal(pc);
};

// Add PC button
const addPCBtn = document.getElementById('addPCBtn');
if (addPCBtn) {
  addPCBtn.addEventListener('click', () => showPCModal());
}

// Initial load
loadPCs();

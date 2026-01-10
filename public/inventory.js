const API_BASE = "/inventory";
const CACHE_KEY_INVENTORY = "inventory_items_cache";
const CACHE_KEY_SUMMARY = "inventory_summary_cache";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// ===== CHECK AUTHENTICATION ON PAGE LOAD =====
(async function() {
  const user = await requireAuth();
  if (user) {
    console.log('✅ User authenticated on Inventory page:', user.username);
  }
})();

// ===== CACHE UTILITY =====
class CacheManager {
  static get(key) {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;
      
      const { data, timestamp } = JSON.parse(cached);
      const isExpired = Date.now() - timestamp > CACHE_DURATION;
      
      if (isExpired) {
        localStorage.removeItem(key);
        return null;
      }
      console.log(`✅ Cache HIT: ${key}`);
      return data;
    } catch (e) {
      console.warn(`Cache read error: ${key}`, e);
      return null;
    }
  }

  static set(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
      console.log(`✅ Cache SET: ${key}`);
    } catch (e) {
      console.warn(`Cache write error: ${key}`, e);
    }
  }

  static clear(key) {
    try {
      localStorage.removeItem(key);
      console.log(`✅ Cache CLEARED: ${key}`);
    } catch (e) {
      console.warn(`Cache clear error: ${key}`, e);
    }
  }

  static clearAll() {
    CacheManager.clear(CACHE_KEY_INVENTORY);
    CacheManager.clear(CACHE_KEY_SUMMARY);
  }
}

// ===== DOM ELEMENTS =====
const addPartForm = document.getElementById('addPartForm');
const editPartForm = document.getElementById('editPartForm');
const searchInput = document.getElementById('searchInput');
const filterType = document.getElementById('filterType');
const filterStatus = document.getElementById('filterStatus');
const filterCondition = document.getElementById('filterCondition');
const inventoryContainer = document.getElementById('inventoryContainer');
const partTypesContainer = document.getElementById('partTypesContainer');

let allInventoryItems = [];

// ===== FETCH WITH CACHE =====
async function fetchWithCache(url, cacheKey) {
  // Try cache first
  const cached = CacheManager.get(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    CacheManager.set(cacheKey, data);
    return data;
  } catch (err) {
    console.error(`Error fetching ${url}:`, err);
    throw err;
  }
}

// ===== LOAD INVENTORY =====
async function loadInventory() {
  try {
    inventoryContainer.innerHTML = '<div class="loading-spinner"><div class="spinner-border text-primary"></div></div>';
    
    allInventoryItems = await fetchWithCache(`${API_BASE}`, CACHE_KEY_INVENTORY);
    
    if (!Array.isArray(allInventoryItems)) {
      allInventoryItems = [];
    }

    await loadSummary();
    await loadPartTypes();
    displayInventory(allInventoryItems);
  } catch (err) {
    console.error("Error loading inventory:", err);
    inventoryContainer.innerHTML = '<div class="empty-state"><i class="fa-solid fa-exclamation-circle"></i><p>Failed to load inventory</p></div>';
  }
}

// ===== LOAD SUMMARY =====
async function loadSummary() {
  try {
    const summary = await fetchWithCache(`${API_BASE}/summary`, CACHE_KEY_SUMMARY);
    
    document.getElementById('totalCount').textContent = summary.total || 0;
    document.getElementById('availableCount').textContent = summary.available || 0;
    document.getElementById('dispatchedCount').textContent = summary.dispatched || 0;
    document.getElementById('attentionCount').textContent = summary.needsAttention || 0;
  } catch (err) {
    console.error("Error loading summary:", err);
  }
}

// ===== LOAD PART TYPES =====
async function loadPartTypes() {
  try {
    const summary = await fetchWithCache(`${API_BASE}/summary`, CACHE_KEY_SUMMARY);
    const partTypes = summary.byType || [];

    partTypesContainer.innerHTML = '';
    
    if (partTypes.length === 0) {
      partTypesContainer.innerHTML = '<div class="col-12"><div class="empty-state">No parts yet</div></div>';
      return;
    }

    // Populate filter dropdown
    const existingOptions = filterType.innerHTML;
    const newOptions = partTypes.map(pt => `<option value="${pt.part_type}">${pt.part_type}</option>`).join('');
    filterType.innerHTML = '<option value="">All Types</option>' + newOptions;

    // Display cards
    partTypes.forEach(pt => {
      const card = document.createElement('div');
      card.className = 'col-lg-2 col-md-3 col-sm-4 col-6';
      card.innerHTML = `
        <div class="part-type-card">
          <div class="part-type-count">${pt.count}</div>
          <div class="part-type-name">${pt.part_type}</div>
        </div>
      `;
      partTypesContainer.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading part types:", err);
  }
}

// ===== DISPLAY INVENTORY =====
function displayInventory(items) {
  if (items.length === 0) {
    inventoryContainer.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-inbox"></i>
        <h4>No inventory items found</h4>
        <p>Add parts to get started</p>
      </div>
    `;
    return;
  }

  inventoryContainer.innerHTML = items.map(item => {
    const statusClass = item.status.toLowerCase().replace(/\s+/g, '-');
    const conditionClass = item.condition.toLowerCase();
    
    return `
      <div class="inventory-card status-${statusClass}">
        <div class="inventory-header">
          <div>
            <div class="part-name">${item.part_name}</div>
            <div class="part-type-label"><i class="fa-solid fa-tag"></i> ${item.part_type}</div>
          </div>
          <div class="action-buttons">
            <button class="btn btn-sm btn-outline-warning" onclick="editPart(${item.id})" title="Edit">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" onclick="deletePart(${item.id})" title="Delete">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>

        <div class="mb-3">
          <span class="status-badge ${statusClass}">${item.status}</span>
          <span class="condition-badge ${conditionClass}">${item.condition}</span>
          <span class="badge" style="background: rgba(74,215,246,0.2); color: #4ad7f6; padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-left: 8px;">Qty: ${item.quantity}</span>
        </div>

        <div class="spec-row">
          <div class="spec-item">
            <i class="fa-solid fa-barcode spec-icon"></i>
            <div>
              <div class="spec-label">Serial</div>
              <div class="spec-value">${item.serial_number || 'N/A'}</div>
            </div>
          </div>
          <div class="spec-item">
            <i class="fa-solid fa-calendar spec-icon"></i>
            <div>
              <div class="spec-label">Warranty</div>
              <div class="spec-value">${item.warranty_date ? formatDate(item.warranty_date) : 'N/A'}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ===== FILTER INVENTORY =====
function filterInventory() {
  const searchTerm = searchInput.value.toLowerCase();
  const typeFilter = filterType.value;
  const statusFilter = filterStatus.value;
  const conditionFilter = filterCondition.value;

  const filtered = allInventoryItems.filter(item => {
    const matchesSearch = !searchTerm || 
      item.part_name.toLowerCase().includes(searchTerm) ||
      item.serial_number?.toLowerCase().includes(searchTerm) ||
      item.part_type.toLowerCase().includes(searchTerm);

    const matchesType = !typeFilter || item.part_type === typeFilter;
    const matchesStatus = !statusFilter || item.status === statusFilter;
    const matchesCondition = !conditionFilter || item.condition === conditionFilter;

    return matchesSearch && matchesType && matchesStatus && matchesCondition;
  });

  displayInventory(filtered);
}

// ===== CLEAR FILTERS =====
function clearFilters() {
  searchInput.value = '';
  filterType.value = '';
  filterStatus.value = '';
  filterCondition.value = '';
  displayInventory(allInventoryItems);
}

// ===== ADD PART =====
addPartForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const newPart = {
    part_type: document.getElementById('partType').value,
    part_name: document.getElementById('partName').value,
    quantity: parseInt(document.getElementById('quantity').value),
    serial_number: document.getElementById('serialNumber').value,
    warranty_date: document.getElementById('warrantyDate').value,
    condition: document.getElementById('condition').value,
    status: document.getElementById('status').value
  };

  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPart)
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    document.getElementById('addPartModal').close();
    addPartForm.reset();
    
    // Invalidate cache and reload
    CacheManager.clearAll();
    await loadInventory();
    
    alert('✅ Part added successfully!');
  } catch (err) {
    console.error('Error adding part:', err);
    alert('❌ Failed to add part. Check console.');
  }
});

// ===== EDIT PART =====
async function editPart(id) {
  const part = allInventoryItems.find(p => p.id === id);
  if (!part) return;

  document.getElementById('editPartId').value = part.id;
  document.getElementById('editPartType').value = part.part_type;
  document.getElementById('editPartName').value = part.part_name;
  document.getElementById('editQuantity').value = part.quantity;
  document.getElementById('editSerialNumber').value = part.serial_number || '';
  document.getElementById('editWarrantyDate').value = part.warranty_date || '';
  document.getElementById('editCondition').value = part.condition;
  document.getElementById('editStatus').value = part.status;

  document.getElementById('editPartModal').showModal();
}

editPartForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = document.getElementById('editPartId').value;
  const updatedPart = {
    part_type: document.getElementById('editPartType').value,
    part_name: document.getElementById('editPartName').value,
    quantity: parseInt(document.getElementById('editQuantity').value),
    serial_number: document.getElementById('editSerialNumber').value,
    warranty_date: document.getElementById('editWarrantyDate').value,
    condition: document.getElementById('editCondition').value,
    status: document.getElementById('editStatus').value
  };

  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedPart)
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    document.getElementById('editPartModal').close();
    CacheManager.clearAll();
    await loadInventory();
    
    alert('✅ Part updated successfully!');
  } catch (err) {
    console.error('Error updating part:', err);
    alert('❌ Failed to update part. Check console.');
  }
});

// ===== DELETE PART =====
async function deletePart(id) {
  if (!confirm('Are you sure you want to delete this part?')) return;

  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    CacheManager.clearAll();
    await loadInventory();
    
    alert('✅ Part deleted successfully!');
  } catch (err) {
    console.error('Error deleting part:', err);
    alert('❌ Failed to delete part. Check console.');
  }
}

// ===== UTILITY FUNCTION =====
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ===== EVENT LISTENERS =====
searchInput.addEventListener('input', filterInventory);
filterType.addEventListener('change', filterInventory);
filterStatus.addEventListener('change', filterInventory);
filterCondition.addEventListener('change', filterInventory);

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', loadInventory);

// Auto-refresh summary every 30 seconds (with cache)
setInterval(async () => {
  try {
    await loadSummary();
  } catch (err) {
    console.warn("Auto-refresh failed:", err);
  }
}, 30000);

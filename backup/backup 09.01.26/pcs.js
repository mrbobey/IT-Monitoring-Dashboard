// PC Specs Inventory Monitoring Page
// Professional UI: Search, Add, Edit, Delete

let allPCs = [];

function renderPCsTable(pcs) {
  const tbody = document.getElementById('pcsTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';
  pcs.forEach(pc => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${pc.branch_name || ''}</td>
      <td>${pc.city || ''}</td>
      <td>${pc.branch_code || ''}</td>
      <td>${pc.desktop_name || ''}</td>
      <td>${pc.pc_number || ''}</td>
      <td>${pc.motherboard || ''}</td>
      <td>${pc.processor || ''}</td>
      <td>${pc.storage || ''}</td>
      <td>${pc.ram || ''}</td>
      <td>${pc.psu || ''}</td>
      <td>${pc.monitor || ''}</td>
      <td>
        <div class="d-flex gap-2 justify-content-center">
          <button class="btn btn-sm btn-warning" onclick="editPC(${pc.id})"><i class="fa-solid fa-pen"></i></button>
          <button class="btn btn-sm btn-danger" onclick="deletePC(${pc.id})"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function loadPCs() {
  try {
    const res = await fetch('/pcs');
    allPCs = await res.json();
    renderPCsTable(allPCs);
  } catch (err) {
    console.error('Error loading PC specs:', err);
  }
}

// Search/filter functionality
const pcsSearchInput = document.getElementById('pcsSearchInput');
if (pcsSearchInput) {
  pcsSearchInput.addEventListener('input', function() {
    const query = this.value.toLowerCase();
    const filtered = allPCs.filter(pc =>
      Object.values(pc).some(val => (val || '').toString().toLowerCase().includes(query))
    );
    renderPCsTable(filtered);
  });
}

// Delete PC spec
async function deletePC(id) {
  if (!confirm('Delete this PC spec?')) return;
  try {
    const res = await fetch(`/pcs/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Delete failed');
    await loadPCs();
  } catch (err) {
    alert('Error deleting PC spec');
  }
}

// Modal for Add/Edit
let modal = null;
let modalForm = null;
let currentEditId = null;

function createModal() {
  if (document.getElementById('pcModal')) return;
  modal = document.createElement('div');
  modal.id = 'pcModal';
  modal.className = 'modal';
  modal.tabIndex = -1;
  modal.innerHTML = `
    <div class="modal-dialog">
      <div class="modal-content">
        <form id="pcModalForm">
          <div class="modal-header">
            <h5 class="modal-title" id="modalTitle">Add/Edit PC Spec</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="mb-2"><input class="form-control" name="branch_name" placeholder="Branch Name" required></div>
            <div class="mb-2"><input class="form-control" name="city" placeholder="City" required></div>
            <div class="mb-2"><input class="form-control" name="branch_code" placeholder="Branch Code" required></div>
            <div class="mb-2"><input class="form-control" name="desktop_name" placeholder="Desktop Name" required></div>
            <div class="mb-2"><input class="form-control" name="pc_number" placeholder="PC Number" required></div>
            <div class="mb-2"><input class="form-control" name="motherboard" placeholder="Motherboard"></div>
            <div class="mb-2"><input class="form-control" name="processor" placeholder="Processor"></div>
            <div class="mb-2"><input class="form-control" name="storage" placeholder="Storage"></div>
            <div class="mb-2"><input class="form-control" name="ram" placeholder="RAM"></div>
            <div class="mb-2"><input class="form-control" name="psu" placeholder="PSU"></div>
            <div class="mb-2"><input class="form-control" name="monitor" placeholder="Monitor"></div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="submit" class="btn btn-primary" id="modalSaveBtn">Save</button>
          </div>
        </form>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modalForm = modal.querySelector('#pcModalForm');
  modalForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const formData = new FormData(modalForm);
    const pcData = {};
    for (const [key, value] of formData.entries()) pcData[key] = value;
    try {
      if (currentEditId) {
        // Edit
        const res = await fetch(`/pcs/${currentEditId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pcData)
        });
        if (!res.ok) throw new Error('Edit failed');
      } else {
        // Add
        const res = await fetch('/pcs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pcData)
        });
        if (!res.ok) throw new Error('Add failed');
      }
      hideModal();
      await loadPCs();
    } catch (err) {
      alert('Error saving PC spec');
    }
  });
}
function showModal(pc = null) {
  if (!modal) createModal();
  currentEditId = pc ? pc.id : null;
  document.getElementById('modalTitle').textContent = pc ? 'Edit PC Spec' : 'Add PC Spec';
  const fields = modalForm.elements;
  for (const key of ['branch_name','city','branch_code','desktop_name','pc_number','motherboard','processor','storage','ram','psu','monitor']) {
    fields[key].value = pc && pc[key] ? pc[key] : '';
  }
  modal.style.display = 'block';
  modal.classList.add('show');
  modal.setAttribute('aria-modal', 'true');
  modal.removeAttribute('aria-hidden');
}
function hideModal() {
  if (modal) {
    modal.style.display = 'none';
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    modal.removeAttribute('aria-modal');
  }
}
document.addEventListener('click', function(e) {
  if (modal && e.target === modal) hideModal();
  if (e.target.classList.contains('btn-close')) hideModal();
});

// Add/Edit button handlers
window.editPC = function(id) {
  const pc = allPCs.find(p => p.id === id);
  if (!pc) return;
  showModal(pc);
};
window.deletePC = deletePC;

// Add PC button
const addPCBtn = document.getElementById('addPCBtn');
if (addPCBtn) {
  addPCBtn.addEventListener('click', function() {
    showModal();
  });
}

// Initial load
loadPCs();

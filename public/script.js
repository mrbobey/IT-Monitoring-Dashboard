const API_URL = "/tasks"; // same-origin API

const branchContainer = document.getElementById("branchContainer");
const taskForm = document.getElementById("taskForm");
const taskNameInput = document.getElementById("taskName");
const branchNameInput = document.getElementById("branchName");
const taskDescInput = document.getElementById("taskDesc");
const taskStatusInput = document.getElementById("taskStatus");

// ===== helper to mark active filter button =====
const sidebarButtons = document.querySelectorAll('#sidebar button');

function setActiveFilter(status) {
  sidebarButtons.forEach(btn => {
    const s = btn.dataset.status || btn.textContent.trim();
    if (s === status) {
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
    } else {
      btn.classList.remove('active');
      btn.setAttribute('aria-pressed', 'false');
    }
  });
}

// ===== ADD TASK =====
taskForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const task = {
    taskName: taskNameInput.value,
    branchName: branchNameInput.value,
    description: taskDescInput.value,
    status: taskStatusInput.value
  };

  try {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task)
    });

    taskForm.reset();
    await loadTasks();
  } catch (err) {
    console.error("Error adding task:", err);
  }
});

// ===== DELETE TASK =====
async function deleteTask(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Delete failed");
    await loadTasks();
  } catch (err) {
    console.error("Error deleting task:", err);
  }
}

// ===== LOAD TASKS =====
async function loadTasks(filterBranch = null) {
  try {
    const res = await fetch(API_URL);
    const tasks = await res.json();

    branchContainer.innerHTML = "";

    // Get unique branches
    const branches = [...new Set(tasks.map(t => t.branchName))];

    branches.forEach((branch) => {
      // Skip if filtering
      if (filterBranch && branch !== filterBranch) return;

      // Branch header wrapped in a full-width column
      const header = document.createElement("h5");
      header.textContent = branch;
      header.className = "mt-3 branch-header";
      header.style.cursor = "pointer";
      header.onclick = () => loadTasks(branch);
      const headerCol = document.createElement("div");
      headerCol.className = "col-12";
      headerCol.appendChild(header);
      branchContainer.appendChild(headerCol);
      

      // Tasks for this branch
      tasks
        .filter((t) => t.branchName === branch)
        .forEach((task) => {
          const card = document.createElement("div");
          card.className = "card bg-dark text-light mb-3 shadow task-card";

          const cardBody = document.createElement("div");
          cardBody.className =
            "card-body d-flex justify-content-between align-items-start";

          const info = document.createElement("div");
          const getStatusClass = (s) => {
            if (s === 'Pending') return 'badge badge-status pending';
            if (s === 'In Progress') return 'badge badge-status progress';
            return 'badge badge-status done';
          };

          info.innerHTML = `
            <h6 class="card-title mb-1">${task.taskName}</h6>
            <p class="card-text mb-1"><small>${task.description || ""}</small></p>
            <span class="${getStatusClass(task.status)}">${task.status}</span>
          `;

          const delBtn = document.createElement("button");
          delBtn.className = "btn btn-sm btn-danger";
          delBtn.textContent = "Delete";
          delBtn.onclick = () => {
            if (confirm(`Delete task "${task.taskName}"?`)) deleteTask(task.id);
          };

          cardBody.appendChild(info);
          cardBody.appendChild(delBtn);
          card.appendChild(cardBody);

          const col = document.createElement("div");
          col.className = "col-lg-3 col-md-6 col-sm-12";
          col.appendChild(card);
          branchContainer.appendChild(col);
        });
    });

    // Reset filter button
    if (filterBranch) {
      const reset = document.createElement("button");
      reset.textContent = "Show All Branches";
      reset.className = "btn btn-info mt-3";
      reset.onclick = () => loadTasks();
      const btnCol = document.createElement("div");
      btnCol.className = "col-12";
      btnCol.appendChild(reset);
      branchContainer.appendChild(btnCol);
    }
  } catch (err) {
    console.error("Error loading tasks:", err);
  }
}

// ===== FILTER TASKS (from buttons) =====
function filterTasks(status) {
  setActiveFilter(status);
  if (status === "All") {
    loadTasks();
  } else {
    loadTasksByStatus(status);
  }
}

// Helper: Load tasks filtered by status (accept optional branch filter)
async function loadTasksByStatus(status, filterBranch = null) {
  try {
    const res = await fetch(API_URL);
    const tasks = await res.json();
    branchContainer.innerHTML = "";

    // first filter by status, then by branch if provided
    const filteredTasks = tasks.filter((t) => t.status === status)
                               .filter((t) => (filterBranch ? t.branchName === filterBranch : true));

    const branches = [...new Set(filteredTasks.map((t) => t.branchName))];

    branches.forEach((branch) => {
      const header = document.createElement("h5");
      header.textContent = branch;
      header.className = "mt-3 branch-header";
      header.style.cursor = "pointer";
      // clicking a header will filter within the current status to that branch
      header.onclick = () => loadTasksByStatus(status, branch);
      const headerCol = document.createElement("div");
      headerCol.className = "col-12";
      headerCol.appendChild(header);
      branchContainer.appendChild(headerCol);

      filteredTasks
        .filter((t) => t.branchName === branch)
        .forEach((task) => {
          const card = document.createElement("div");
          card.className = "card bg-dark text-light mb-3 shadow task-card";

          const cardBody = document.createElement("div");
          cardBody.className =
            "card-body d-flex justify-content-between align-items-start";

          const info = document.createElement("div");
          const getStatusClass = (s) => {
            if (s === 'Pending') return 'badge badge-status pending';
            if (s === 'In Progress') return 'badge badge-status progress';
            return 'badge badge-status done';
          };

          info.innerHTML = `
            <h6 class="card-title mb-1">${task.taskName}</h6>
            <p class="card-text mb-1"><small>${task.description || ""}</small></p>
            <span class="${getStatusClass(task.status)}">${task.status}</span>
          `;

          const delBtn = document.createElement("button");
          delBtn.className = "btn btn-sm btn-danger";
          delBtn.textContent = "Delete";
          delBtn.onclick = () => {
            if (confirm(`Delete task "${task.taskName}"?`)) deleteTask(task.id);
          };

          cardBody.appendChild(info);
          cardBody.appendChild(delBtn);
          card.appendChild(cardBody);

          const col = document.createElement("div");
          col.className = "col-lg-3 col-md-6 col-sm-12";
          col.appendChild(card);
          branchContainer.appendChild(col);
        });
    });

    // Reset button for filtered view
    const resetBtn = document.createElement("button");
    resetBtn.textContent = "Show All Tasks";
    resetBtn.className = "btn btn-info mt-3";
    resetBtn.onclick = () => { setActiveFilter('All'); loadTasks(); };
    const resetCol = document.createElement("div");
    resetCol.className = "col-12";
    resetCol.appendChild(resetBtn);
    branchContainer.appendChild(resetCol);
  } catch (err) {
    console.error("Error filtering tasks:", err);
  }
}

// ===== PROFESSIONAL ADD TASK BUTTON & MODAL =====
function createAddTaskButton() {
  if (document.getElementById('addTaskBtn')) return;
  const btn = document.createElement('button');
  btn.id = 'addTaskBtn';
  btn.className = 'btn btn-success btn-lg mb-3 d-block mx-auto';
  btn.innerHTML = '<i class="fas fa-plus"></i> Add Task';
  btn.onclick = showAddTaskModal;
  branchContainer.parentNode.insertBefore(btn, branchContainer);
}
// Call this on page load
createAddTaskButton();

// ===== INITIAL LOAD =====
setActiveFilter('All');
loadTasks();
// ===== LOAD PC SPECS =====
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
        <button class="btn btn-sm btn-warning" onclick="editPC(${pc.id})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deletePC(${pc.id})">Delete</button>
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

// ===== MODAL EDIT FORM FOR PC SPECS =====
let editModal = null;
let editForm = null;
let currentEditId = null;

function createEditModal() {
  if (document.getElementById('editPCModal')) return;
  const modal = document.createElement('div');
  modal.id = 'editPCModal';
  modal.className = 'modal';
  modal.tabIndex = -1;
  modal.innerHTML = `
    <div class="modal-dialog">
      <div class="modal-content">
        <form id="editPCForm">
          <div class="modal-header">
            <h5 class="modal-title">Edit PC Spec</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="mb-2"><input class="form-control" name="branch_name" placeholder="Branch Name"></div>
            <div class="mb-2"><input class="form-control" name="city" placeholder="City"></div>
            <div class="mb-2"><input class="form-control" name="branch_code" placeholder="Branch Code"></div>
            <div class="mb-2"><input class="form-control" name="desktop_name" placeholder="Desktop Name"></div>
            <div class="mb-2"><input class="form-control" name="pc_number" placeholder="PC Number"></div>
            <div class="mb-2"><input class="form-control" name="motherboard" placeholder="Motherboard"></div>
            <div class="mb-2"><input class="form-control" name="processor" placeholder="Processor"></div>
            <div class="mb-2"><input class="form-control" name="storage" placeholder="Storage"></div>
            <div class="mb-2"><input class="form-control" name="ram" placeholder="RAM"></div>
            <div class="mb-2"><input class="form-control" name="psu" placeholder="PSU"></div>
            <div class="mb-2"><input class="form-control" name="monitor" placeholder="Monitor"></div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="submit" class="btn btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  editModal = modal;
  editForm = modal.querySelector('#editPCForm');
  editForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const formData = new FormData(editForm);
    const updated = {};
    for (const [key, value] of formData.entries()) updated[key] = value;
    try {
      const res = await fetch(`/pcs/${currentEditId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      if (!res.ok) throw new Error('Edit failed');
      hideEditModal();
      await loadPCs();
    } catch (err) {
      alert('Error editing PC spec');
    }
  });
}
function showEditModal(pc) {
  if (!editModal) createEditModal();
  currentEditId = pc.id;
  const fields = editForm.elements;
  for (const key in pc) {
    if (fields[key]) fields[key].value = pc[key] || '';
  }
  editModal.style.display = 'block';
  editModal.classList.add('show');
  editModal.setAttribute('aria-modal', 'true');
  editModal.removeAttribute('aria-hidden');
}
function hideEditModal() {
  if (editModal) {
    editModal.style.display = 'none';
    editModal.classList.remove('show');
    editModal.setAttribute('aria-hidden', 'true');
    editModal.removeAttribute('aria-modal');
  }
}
document.addEventListener('click', function(e) {
  if (editModal && e.target === editModal) hideEditModal();
  if (e.target.classList.contains('btn-close')) hideEditModal();
});

// Update editPC to use modal
async function editPC(id) {
  const pc = allPCs.find(p => p.id === id);
  if (!pc) return;
  showEditModal(pc);
}

// Initial load for PC specs
loadPCs();

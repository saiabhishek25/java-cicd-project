// ==========================================================================
// TALENTSPHERE APPLICATION CONTROLLER (VANILLA JAVASCRIPT)
// Direct REST Integration, Canvas-Based Premium Graphics, & State Engine
// ==========================================================================

const API_BASE_URL = '/api/employees';

// Core State variables
let employeesState = [];
let dashboardStats = null;
let currentSort = { column: 'id', direction: 'asc' };
let activeTab = 'dashboard';

// Initialize application on load
document.addEventListener('DOMContentLoaded', () => {
    initClock();
    fetchDashboardStats();
    fetchEmployees();
    
    // Default joining date to today in form
    document.getElementById('emp-joiningDate').valueAsDate = new Date();
});

// Digital Clock in Header
function initClock() {
    const timeDisplay = document.getElementById('live-time');
    const updateClock = () => {
        const now = new Date();
        timeDisplay.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };
    updateClock();
    setInterval(updateClock, 1000);
}

// Switching View Tabs
function switchTab(tabId) {
    activeTab = tabId;
    
    // Update sidebar styles
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`nav-${tabId}`).classList.add('active');
    
    // Update active view panels
    document.querySelectorAll('.tab-view').forEach(view => view.classList.remove('active'));
    document.getElementById(`view-${tabId}`).classList.add('active');

    // Update Header title
    const headerTitle = document.getElementById('header-title');
    if (tabId === 'dashboard') {
        headerTitle.textContent = 'Enterprise Dashboard';
        fetchDashboardStats(); // Refresh stats on switch
    } else if (tabId === 'directory') {
        headerTitle.textContent = 'Employee Directory';
        fetchEmployees();
    } else if (tabId === 'utilities') {
        headerTitle.textContent = 'Bulk System Operations';
    }
}

// ==========================================================================
// REST API INTEGRATIONS
// ==========================================================================

// Fetch stats for dashboard metrics and analytical charts
async function fetchDashboardStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/stats`);
        if (!response.ok) throw new Error('Failed to load metrics.');
        
        dashboardStats = await response.json();
        renderDashboardStats(dashboardStats);
    } catch (err) {
        showToast(`Metrics Error: ${err.message}`, 'error');
    }
}

// Fetch employee records matching search queries and department/status filters
async function fetchEmployees() {
    const searchVal = document.getElementById('filter-search').value;
    const deptVal = document.getElementById('filter-dept').value;
    const statusVal = document.getElementById('filter-status').value;

    let queryParams = [];
    if (searchVal) queryParams.push(`search=${encodeURIComponent(searchVal)}`);
    if (deptVal) queryParams.push(`department=${encodeURIComponent(deptVal)}`);
    if (statusVal) queryParams.push(`status=${encodeURIComponent(statusVal)}`);

    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

    try {
        const tableBody = document.getElementById('employee-table-body');
        if (employeesState.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="9" class="table-loading">Querying API Database...</td></tr>`;
        }

        const response = await fetch(`${API_BASE_URL}${queryString}`);
        if (!response.ok) throw new Error('Database request failed.');
        
        employeesState = await response.json();
        renderEmployeeTable();
    } catch (err) {
        showToast(`API Query Failed: ${err.message}`, 'error');
    }
}

// Save or edit an employee record
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const id = document.getElementById('employee-id').value;
    const employeeData = {
        firstName: document.getElementById('emp-firstName').value.trim(),
        lastName: document.getElementById('emp-lastName').value.trim(),
        email: document.getElementById('emp-email').value.trim(),
        phone: document.getElementById('emp-phone').value.trim(),
        department: document.getElementById('emp-department').value,
        role: document.getElementById('emp-role').value.trim(),
        salary: parseFloat(document.getElementById('emp-salary').value),
        joiningDate: document.getElementById('emp-joiningDate').value,
        status: document.getElementById('emp-status').value
    };

    const isEdit = id && id.trim() !== '';
    const method = isEdit ? 'PUT' : 'POST';
    const url = isEdit ? `${API_BASE_URL}/${id}` : API_BASE_URL;

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(employeeData)
        });

        if (!response.ok) {
            let errorMsg = 'Operations failed.';
            try {
                const result = await response.json();
                errorMsg = result.error || result.message || errorMsg;
            } catch (e) {
                errorMsg = `HTTP ${response.status}: ${response.statusText}`;
            }
            throw new Error(errorMsg);
        }

        const result = await response.json();
        showToast(isEdit ? 'Employee record updated successfully.' : 'New employee registered successfully.', 'success');
        closeModal();
        
        // Refresh active views
        fetchEmployees();
        fetchDashboardStats();
    } catch (err) {
        showToast(`Save Error: ${err.message}`, 'error');
    }
}

// Delete an employee record
async function deleteEmployee(id, name) {
    if (!confirm(`Are you absolutely sure you want to delete the employee record for ${name}?`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Connection refused.');

        showToast(`Record for ${name} removed.`, 'success');
        fetchEmployees();
        fetchDashboardStats();
    } catch (err) {
        showToast(`Delete failed: ${err.message}`, 'error');
    }
}

// Import bulk CSV data
async function handleCsvImport(event) {
    event.preventDefault();
    
    const fileInput = document.getElementById('csv-file-input');
    if (fileInput.files.length === 0) return;

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(`${API_BASE_URL}/import`, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'CSV import failed.');
        }

        showToast(result.message, 'success');
        fileInput.value = '';
        updateUploadLabel(fileInput);
        
        // Refresh
        fetchEmployees();
        fetchDashboardStats();
    } catch (err) {
        showToast(`CSV Upload Error: ${err.message}`, 'error');
    }
}

// ==========================================================================
// RENDER ENGINE
// ==========================================================================

// Display stats in dashboard overview metrics
function renderDashboardStats(stats) {
    if (!stats) return;

    document.getElementById('stat-total-employees').textContent = stats.totalEmployees || '0';
    document.getElementById('stat-avg-salary').textContent = formatCurrency(stats.averageSalary || 0);
    document.getElementById('stat-top-dept').textContent = stats.topDepartment || 'None';

    // Redraw graphs with new stats
    drawDepartmentChart(stats.departmentBreakdown || {});
    drawStatusChart(stats.statusBreakdown || {});
}

// Render dynamic employees table list
function renderEmployeeTable() {
    const tableBody = document.getElementById('employee-table-body');
    tableBody.innerHTML = '';

    if (employeesState.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-dimmed); padding: 3rem;">No employee records found matching current query filters.</td></tr>`;
        return;
    }

    // Sort current in-memory dataset
    const sortedEmployees = [...employeesState].sort((a, b) => {
        let valA = a[currentSort.column];
        let valB = b[currentSort.column];

        // Handle string casing comparison
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return currentSort.direction === 'asc' ? -1 : 1;
        if (valA > valB) return currentSort.direction === 'asc' ? 1 : -1;
        return 0;
    });

    sortedEmployees.forEach(emp => {
        const row = document.createElement('tr');
        row.style.animation = 'fadeIn 0.3s ease';

        row.innerHTML = `
            <td>#${emp.id}</td>
            <td style="font-weight: 500;">${emp.firstName} ${emp.lastName}</td>
            <td style="color: var(--text-muted); font-size: 0.85rem;">${emp.email}</td>
            <td><span class="dept-badge">${emp.department}</span></td>
            <td>${emp.role}</td>
            <td style="font-weight: 600;">${formatCurrency(emp.salary)}</td>
            <td style="font-size: 0.85rem; color: var(--text-muted);">${formatDate(emp.joiningDate)}</td>
            <td>
                <span class="status-badge ${emp.status.toLowerCase().replace(' ', '-')}">
                    ${emp.status}
                </span>
            </td>
            <td>
                <div class="action-btns">
                    <button class="action-btn edit-btn" onclick="openEditModal(${emp.id})" title="Edit Employee">
                        <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteEmployee(${emp.id}, '${emp.firstName} ${emp.lastName}')" title="Delete Employee">
                        <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Sort column handler
function sortDirectory(columnName) {
    const prevColumn = currentSort.column;
    
    if (prevColumn === columnName) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.column = columnName;
        currentSort.direction = 'asc';
    }

    // Update table header icons
    document.querySelectorAll('.employee-table th').forEach(th => {
        const ind = th.querySelector('.sort-indicator');
        if (ind) ind.className = 'sort-indicator';
    });

    // Translate Javascript fields to table header IDs
    let thId = '';
    switch(columnName) {
        case 'id': thId = 'th-id'; break;
        case 'firstName': thId = 'th-name'; break;
        case 'email': thId = 'th-email'; break;
        case 'department': thId = 'th-dept'; break;
        case 'role': thId = 'th-role'; break;
        case 'salary': thId = 'th-salary'; break;
        case 'joiningDate': thId = 'th-joining'; break;
        case 'status': thId = 'th-status'; break;
    }

    const currentTh = document.getElementById(thId);
    if (currentTh) {
        const indicator = currentTh.querySelector('.sort-indicator') || currentTh;
        indicator.className = `sort-indicator ${currentSort.direction}`;
    }

    renderEmployeeTable();
}

// Real-time search handler with light debounce
let searchDebounceTimer;
function onSearchInput() {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
        fetchEmployees();
    }, 300);
}

// File picker custom label updater
function updateUploadLabel(input) {
    const labelSpan = document.querySelector('.upload-inner span');
    if (input.files && input.files.length > 0) {
        labelSpan.textContent = `Selected: ${input.files[0].name}`;
        labelSpan.style.color = 'var(--secondary)';
    } else {
        labelSpan.textContent = 'Choose CSV File or Drag Here';
        labelSpan.style.color = 'var(--text-muted)';
    }
}

// ==========================================================================
// HIGH-MARKS HD CUSTOM CANVAS CHARTS
// Drawing premium 2D diagrams with vector scales & rounded geometry
// ==========================================================================

// Draw Department Breakdown Bar Chart
function drawDepartmentChart(deptBreakdown) {
    const canvas = document.getElementById('deptChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    // Fit canvas scale to high resolution
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Clear Canvas
    ctx.clearRect(0, 0, width, height);

    const keys = Object.keys(deptBreakdown);
    const values = Object.values(deptBreakdown);

    if (keys.length === 0) {
        ctx.fillStyle = '#64748b';
        ctx.font = '500 13px Outfit';
        ctx.textAlign = 'center';
        ctx.fillText('No data available', width / 2, height / 2);
        return;
    }

    const maxValue = Math.max(...values, 1);
    const barCount = keys.length;
    const padding = 25;
    const chartWidth = width - (padding * 2);
    const chartHeight = height - 55;
    const gap = 12;
    const barWidth = (chartWidth - (gap * (barCount - 1))) / barCount;

    // Draw Bars
    keys.forEach((key, index) => {
        const val = deptBreakdown[key];
        const valRatio = val / maxValue;
        const barHeight = chartHeight * valRatio;
        
        const x = padding + (index * (barWidth + gap));
        const y = height - 25 - barHeight;

        // Rounded bar logic
        ctx.save();
        
        // Define path
        ctx.beginPath();
        const radius = Math.min(barWidth / 2, 8);
        ctx.roundRect(x, y, barWidth, barHeight, [radius, radius, 0, 0]);
        
        // Apply Premium Accents Gradients
        const grad = ctx.createLinearGradient(x, y, x, height - 25);
        grad.addColorStop(0, '#6366f1'); // Indigo Accent
        grad.addColorStop(1, 'rgba(168, 85, 247, 0.25)'); // Purple fade
        
        ctx.fillStyle = grad;
        
        // Soft Glow Drop Shadow
        ctx.shadowColor = 'rgba(99, 102, 241, 0.3)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = -2;
        
        ctx.fill();
        ctx.restore();

        // Print values on top of bars
        ctx.fillStyle = '#f1f5f9';
        ctx.font = '600 11px Space Grotesk';
        ctx.textAlign = 'center';
        ctx.fillText(val, x + (barWidth / 2), y - 6);

        // Labels underneath bars
        ctx.fillStyle = '#94a3b8';
        ctx.font = '500 10px Outfit';
        ctx.textAlign = 'center';
        ctx.fillText(key, x + (barWidth / 2), height - 8);
    });
}

// Draw Status Allocation Doughnut Pie Graph
function drawStatusChart(statusBreakdown) {
    const canvas = document.getElementById('statusChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    // Fit canvas scale to high resolution
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Clear Canvas
    ctx.clearRect(0, 0, width, height);

    const keys = Object.keys(statusBreakdown);
    const values = Object.values(statusBreakdown);

    if (keys.length === 0) {
        ctx.fillStyle = '#64748b';
        ctx.font = '500 13px Outfit';
        ctx.textAlign = 'center';
        ctx.fillText('No data available', width / 2, height / 2);
        return;
    }

    const total = values.reduce((sum, val) => sum + val, 0);
    const centerX = (width / 2) - 45;
    const centerY = height / 2;
    const outerRadius = Math.min(centerX, centerY) - 20;
    const innerRadius = outerRadius - 15;

    // Harmonious colors matching variables
    const statusColors = {
        'Active': '#10b981',       // Emerald
        'On Leave': '#eab308',     // Yellow
        'Terminated': '#ef4444'    // Red
    };

    let startAngle = -Math.PI / 2; // Start drawing at the top

    // Draw doughnut wedges
    keys.forEach((key, index) => {
        const val = statusBreakdown[key];
        const sliceAngle = (val / total) * (Math.PI * 2);
        const color = statusColors[key] || '#6366f1';

        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, outerRadius, startAngle, startAngle + sliceAngle);
        ctx.arc(centerX, centerY, innerRadius, startAngle + sliceAngle, startAngle, true);
        ctx.closePath();

        ctx.fillStyle = color;
        ctx.shadowColor = color + '40';
        ctx.shadowBlur = 8;
        
        ctx.fill();
        ctx.restore();

        startAngle += sliceAngle;
    });

    // Draw legends
    const legendX = (width / 2) + outerRadius - 20;
    const legendYStart = centerY - ((keys.length * 20) / 2) + 5;

    keys.forEach((key, index) => {
        const val = statusBreakdown[key];
        const color = statusColors[key] || '#6366f1';
        const lx = legendX;
        const ly = legendYStart + (index * 22);

        // Draw color square
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(lx, ly, 10, 10, 3);
        ctx.fill();

        // Print Text
        ctx.fillStyle = '#f1f5f9';
        ctx.font = '600 11px Outfit';
        ctx.textAlign = 'left';
        ctx.fillText(`${key} (${val})`, lx + 16, ly + 9);
    });
}

// ==========================================================================
// FORM / MODAL CONTROLS & HELPERS
// ==========================================================================

function openAddModal() {
    document.getElementById('employee-form').reset();
    document.getElementById('employee-id').value = '';
    document.getElementById('modal-title').textContent = 'Register New Employee';
    document.getElementById('btn-save').textContent = 'Save Employee';
    document.getElementById('emp-joiningDate').valueAsDate = new Date();
    
    // Unlock email field for edits
    document.getElementById('emp-email').disabled = false;
    
    document.getElementById('employee-modal').classList.add('active');
}

function openEditModal(id) {
    const emp = employeesState.find(e => e.id === id);
    if (!emp) return;

    document.getElementById('employee-id').value = emp.id;
    document.getElementById('emp-firstName').value = emp.firstName;
    document.getElementById('emp-lastName').value = emp.lastName;
    document.getElementById('emp-email').value = emp.email;
    document.getElementById('emp-phone').value = emp.phone || '';
    document.getElementById('emp-department').value = emp.department;
    document.getElementById('emp-role').value = emp.role;
    document.getElementById('emp-salary').value = emp.salary;
    document.getElementById('emp-joiningDate').value = emp.joiningDate;
    document.getElementById('emp-status').value = emp.status;

    // Set header titles
    document.getElementById('modal-title').textContent = `Update Record #${emp.id}`;
    document.getElementById('btn-save').textContent = 'Update Employee';

    document.getElementById('employee-modal').classList.add('active');
}

function closeModal() {
    document.getElementById('employee-modal').classList.remove('active');
}

// Currency format utility
function formatCurrency(number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(number);
}

// Date format utility
function formatDate(dateString) {
    if (!dateString) return '-';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Close modal clicking outside the card
window.onclick = function(event) {
    const modal = document.getElementById('employee-modal');
    if (event.target === modal) {
        closeModal();
    }
};

// ==========================================================================
// TOAST NOTIFICATIONS ENGINE
// ==========================================================================
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast glass ${type}`;
    
    // Unique ID
    const toastId = 'toast-' + Math.random().toString(36).substr(2, 9);
    toast.id = toastId;

    toast.innerHTML = `
        <span>${message}</span>
        <button class="toast-close" onclick="document.getElementById('${toastId}').remove()">&times;</button>
    `;

    container.appendChild(toast);

    // Auto-remove after 4.5 seconds
    setTimeout(() => {
        toast.style.transform = 'translateX(120px)';
        toast.style.opacity = '0';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 4500);
}

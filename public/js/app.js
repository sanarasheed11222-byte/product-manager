// Auth Guard
if (!localStorage.getItem('token')) {
  window.location.href = '/auth.html';
}

// Show username
const user = JSON.parse(localStorage.getItem('user') || '{}');
const greetingEl = document.getElementById('userGreeting');
if (greetingEl && user.name) {
  greetingEl.textContent = `Welcome, ${user.name}`;
}

// Logout
document.getElementById('btnLogout')?.addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/auth.html';
});

// State
const State = {
  products:    [],
  filtered:    [],
  search:      '',
  category:    '',
  status:      '',
  page:        1,
  limit:       5,
  totalPages:  1
};

document.addEventListener('DOMContentLoaded', () => {
  checkConnection();
  loadProducts();
  bindEvents();
  renderPagination();
});

async function checkConnection() {
  const online = await ProductAPI.ping();
  UI.setConnectionStatus(online);
  if (!online) UI.toast('Cannot connect to server!', 'error');
}

async function loadProducts() {
  document.getElementById('tableBody').innerHTML =
    `<tr><td colspan="9" class="empty-row"><div class="spinner"></div> Loading…</td></tr>`;
  try {
    const [productsRes, statsRes] = await Promise.all([
      ProductAPI.getAll(State.page, State.limit),
      ProductAPI.getStats()
    ]);
    if (!productsRes.success) throw new Error(productsRes.message);
    State.products  = productsRes.products;
    State.totalPages = productsRes.totalPages;
    UI.renderTable(State.products);
    UI.populateCategoryFilter(State.products);
    renderPagination();
    document.getElementById('rowCount').textContent =
      `${productsRes.total} product${productsRes.total !== 1 ? 's' : ''}`;
    if (statsRes.success) UI.updateStats(statsRes.data);
  } catch (err) {
    document.getElementById('tableBody').innerHTML =
      `<tr><td colspan="9" class="empty-row" style="color:#f05a5a">⚠ ${err.message}</td></tr>`;
    UI.toast(err.message, 'error');
  }
}

// Pagination
function renderPagination() {
  let wrap = document.getElementById('paginationWrap');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.id = 'paginationWrap';
    wrap.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:8px;padding:16px;';
    document.querySelector('.table-section').appendChild(wrap);
  }

  wrap.innerHTML = '';

  if (State.totalPages <= 1) return;

  // Prev button
  const prev = document.createElement('button');
  prev.textContent = '← Prev';
  prev.style.cssText = btnStyle(State.page === 1);
  prev.disabled = State.page === 1;
  prev.onclick = () => { State.page--; loadProducts(); };
  wrap.appendChild(prev);

  // Page numbers
  for (let i = 1; i <= State.totalPages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.style.cssText = i === State.page
      ? 'padding:7px 14px;border-radius:7px;border:none;background:#d4af37;color:#080b12;font-weight:700;cursor:pointer;'
      : btnStyle(false);
    btn.onclick = () => { State.page = i; loadProducts(); };
    wrap.appendChild(btn);
  }

  // Next button
  const next = document.createElement('button');
  next.textContent = 'Next →';
  next.style.cssText = btnStyle(State.page === State.totalPages);
  next.disabled = State.page === State.totalPages;
  next.onclick = () => { State.page++; loadProducts(); };
  wrap.appendChild(next);
}

function btnStyle(disabled) {
  return `padding:7px 14px;border-radius:7px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.04);color:${disabled ? '#3d4258' : '#eef0f8'};font-weight:500;cursor:${disabled ? 'not-allowed' : 'pointer'};`;
}

function applyFilters() {
  State.filtered = UI.filterProducts(State.products, State.search, State.category, State.status);
  UI.renderTable(State.filtered);
}

async function handleFormSubmit(e) {
  e.preventDefault();
  const data = UI.getFormData();
  if (!UI.validateForm(data)) return;
  UI.setSubmitLoading(true);

  try {
    // Use FormData for image upload
    const formData = new FormData();
    formData.append('name',     data.name);
    formData.append('category', data.category);
    formData.append('price',    data.price);
    formData.append('stock',    data.stock);
    formData.append('status',   data.status);

    const imageFile = document.getElementById('fImage')?.files[0];
    if (imageFile) formData.append('image', imageFile);

    const isEdit = !!data.id;
    const res = isEdit
      ? await ProductAPI.update(data.id, formData)
      : await ProductAPI.create(formData);

    if (!res.success) throw new Error(res.message);
    UI.toast(res.message, 'success');
    UI.closeModal();
    await loadProducts();
  } catch (err) {
    UI.toast(err.message || 'Something went wrong.', 'error');
  } finally {
    UI.setSubmitLoading(false);
  }
}

async function handleDelete(id) {
  try {
    const res = await ProductAPI.delete(id);
    if (!res.success) throw new Error(res.message);
    UI.toast(res.message, 'success');
    UI.closeDeleteConfirm();
    await loadProducts();
  } catch (err) {
    UI.toast(err.message || 'Delete failed.', 'error');
  }
}

async function openEditModal(id) {
  try {
    const res = await ProductAPI.getById(id);
    if (!res.success) throw new Error(res.message);
    UI.openModal(id, res.data);
  } catch (err) {
    UI.toast('Could not load product.', 'error');
  }
}

function bindEvents() {
  document.getElementById('btnOpenAdd').addEventListener('click', () => UI.openModal());
  document.getElementById('btnCloseModal').addEventListener('click', UI.closeModal);
  document.getElementById('btnCancel').addEventListener('click', UI.closeModal);
  document.getElementById('overlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('overlay')) UI.closeModal();
  });

  document.getElementById('productForm').addEventListener('submit', handleFormSubmit);
  document.getElementById('btnRefresh').addEventListener('click', () => {
    State.page = 1;
    loadProducts();
  });

  let searchTimer;
  document.getElementById('searchInput').addEventListener('input', (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      State.search = e.target.value;
      State.page   = 1;
      loadProducts();
    }, 300);
  });

  document.getElementById('filterCat').addEventListener('change', (e) => {
    State.category = e.target.value;
    State.page     = 1;
    loadProducts();
  });

  document.getElementById('filterStatus').addEventListener('change', (e) => {
    State.status = e.target.value;
    State.page   = 1;
    loadProducts();
  });

  document.getElementById('tableBody').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    if (btn.dataset.action === 'edit')   openEditModal(btn.dataset.id);
    if (btn.dataset.action === 'delete') UI.openDeleteConfirm(btn.dataset.id, btn.dataset.name);
  });

  document.getElementById('btnConfirmDelete').addEventListener('click', (e) => handleDelete(e.target.dataset.id));
  document.getElementById('btnCancelDelete').addEventListener('click',  UI.closeDeleteConfirm);
  document.getElementById('deleteOverlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('deleteOverlay')) UI.closeDeleteConfirm();
  });
}
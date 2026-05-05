// ── Auth Guard ─────────────────────────────────────────────────────
(function() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/auth.html';
    return;
  }
  // Show user name in header
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const greeting = document.getElementById('userGreeting');
  if (greeting && user.name) greeting.textContent = `👋 ${user.name}`;
})();

// ── Logout ─────────────────────────────────────────────────────────
document.getElementById('btnLogout').addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/auth.html';
});
const State = {
  products: [],
  filtered: [],
  search:   '',
  category: '',
  status:   ''
};

document.addEventListener('DOMContentLoaded', () => {
  checkConnection();
  loadProducts();
  bindEvents();
});

async function checkConnection() {
  const online = await ProductAPI.ping();
  UI.setConnectionStatus(online);
  if (!online) UI.toast('Cannot connect to server. Is Node.js running on port 3000?', 'error');
}

async function loadProducts() {
  document.getElementById('tableBody').innerHTML =
    `<tr><td colspan="8" class="empty-row"><div class="spinner"></div> Loading…</td></tr>`;
  try {
    const [productsRes, statsRes] = await Promise.all([
      ProductAPI.getAll(),
      ProductAPI.getStats()
    ]);
    if (!productsRes.success) throw new Error(productsRes.message);
    State.products = productsRes.data;
    applyFilters();
    UI.populateCategoryFilter(State.products);
    if (statsRes.success) UI.updateStats(statsRes.data);
  } catch (err) {
    document.getElementById('tableBody').innerHTML =
      `<tr><td colspan="8" class="empty-row" style="color:#ef4444">⚠ ${err.message}</td></tr>`;
    UI.toast(err.message, 'error');
    UI.setConnectionStatus(false);
  }
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
    const isEdit = !!data.id;
    const res = isEdit
      ? await ProductAPI.update(data.id, data)
      : await ProductAPI.create(data);
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
  document.getElementById('btnRefresh').addEventListener('click', loadProducts);

  let searchTimer;
  document.getElementById('searchInput').addEventListener('input', (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { State.search = e.target.value; applyFilters(); }, 300);
  });

  document.getElementById('filterCat').addEventListener('change', (e) => {
    State.category = e.target.value; applyFilters();
  });
  document.getElementById('filterStatus').addEventListener('change', (e) => {
    State.status = e.target.value; applyFilters();
  });

  document.getElementById('tableBody').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    if (btn.dataset.action === 'edit')   openEditModal(btn.dataset.id);
    if (btn.dataset.action === 'delete') UI.openDeleteConfirm(btn.dataset.id, btn.dataset.name);
  });

  document.getElementById('btnConfirmDelete').addEventListener('click', (e) => handleDelete(e.target.dataset.id));
  document.getElementById('btnCancelDelete').addEventListener('click', UI.closeDeleteConfirm);
  document.getElementById('deleteOverlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('deleteOverlay')) UI.closeDeleteConfirm();
  });
}
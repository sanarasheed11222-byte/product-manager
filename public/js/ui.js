const UI = {

  toast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const t = document.createElement('div');
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    t.className = `toast ${type}`;
    t.innerHTML = `<span>${icons[type] || ''}</span> ${message}`;
    container.appendChild(t);
    setTimeout(() => {
      t.style.opacity = '0';
      t.style.transform = 'translateX(20px)';
      t.style.transition = 'all 0.3s';
      setTimeout(() => t.remove(), 300);
    }, 3000);
  },

  updateStats(stats) {
    document.getElementById('sTotal').textContent    = stats.total      ?? '—';
    document.getElementById('sActive').textContent   = stats.active     ?? '—';
    document.getElementById('sInactive').textContent = stats.inactive   ?? '—';
    document.getElementById('sStock').textContent    = stats.totalStock ?? '—';
  },

  renderTable(products) {
    const tbody    = document.getElementById('tableBody');

    if (!products.length) {
      tbody.innerHTML = `<tr><td colspan="9" class="empty-row">No products found.</td></tr>`;
      return;
    }

    tbody.innerHTML = products.map((p, i) => `
      <tr data-id="${p.id}">
        <td><span class="row-num">${i + 1}</span></td>
        <td>
          ${p.image
            ? `<img src="${p.image}" style="width:38px;height:38px;object-fit:cover;border-radius:8px;border:1px solid rgba(255,255,255,0.08);">`
            : `<div style="width:38px;height:38px;background:rgba(255,255,255,0.05);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:18px;">📦</div>`
          }
        </td>
        <td><span class="prod-name">${UI.esc(p.name)}</span></td>
        <td><span class="cat-tag">${UI.esc(p.category)}</span></td>
        <td><span class="price-val">$${Number(p.price).toFixed(2)}</span></td>
        <td><span class="${Number(p.stock) < 10 ? 'stock-low' : ''}">${p.stock}${Number(p.stock) < 10 ? ' ⚠' : ''}</span></td>
        <td><span class="badge badge-${p.status}">${p.status}</span></td>
        <td><span class="date-val">${UI.formatDate(p.created_at)}</span></td>
        <td>
          <div class="action-group">
            <button class="btn-icon edit" data-action="edit" data-id="${p.id}" title="Edit">✏️</button>
            <button class="btn-icon del" data-action="delete" data-id="${p.id}" data-name="${UI.esc(p.name)}" title="Delete">🗑️</button>
          </div>
        </td>
      </tr>
    `).join('');
  },

  populateCategoryFilter(products) {
    const sel  = document.getElementById('filterCat');
    const curr = sel.value;
    const cats = [...new Set(products.map(p => p.category))].sort();
    sel.innerHTML = '<option value="">All Categories</option>'
      + cats.map(c => `<option value="${c}"${c === curr ? ' selected' : ''}>${c}</option>`).join('');
  },

  openModal(id = null, product = null) {
    const overlay = document.getElementById('overlay');
    const title   = document.getElementById('modalTitle');
    const label   = document.getElementById('submitLabel');
    document.getElementById('productForm').reset();
    document.getElementById('imagePreview').style.display = 'none';
    UI.clearErrors();

    if (product) {
      title.textContent = 'Edit Product';
      label.textContent = 'Update Product';
      document.getElementById('fId').value       = product.id;
      document.getElementById('fName').value     = product.name;
      document.getElementById('fCategory').value = product.category;
      document.getElementById('fPrice').value    = product.price;
      document.getElementById('fStock').value    = product.stock;
      document.getElementById('fStatus').value   = product.status;
      if (product.image) {
        document.getElementById('previewImg').src = product.image;
        document.getElementById('imagePreview').style.display = 'block';
      }
    } else {
      title.textContent = 'Add Product';
      label.textContent = 'Save Product';
      document.getElementById('fId').value = '';
    }
    overlay.classList.add('open');
  },

  closeModal() {
    document.getElementById('overlay').classList.remove('open');
    document.getElementById('productForm').reset();
    document.getElementById('imagePreview').style.display = 'none';
    UI.clearErrors();
  },

  openDeleteConfirm(id, name) {
    document.getElementById('deleteMsg').textContent = `Delete "${name}"?`;
    document.getElementById('btnConfirmDelete').dataset.id = id;
    document.getElementById('deleteOverlay').classList.add('open');
  },

  closeDeleteConfirm() {
    document.getElementById('deleteOverlay').classList.remove('open');
  },

  getFormData() {
    return {
      id:       document.getElementById('fId').value,
      name:     document.getElementById('fName').value.trim(),
      category: document.getElementById('fCategory').value.trim(),
      price:    parseFloat(document.getElementById('fPrice').value),
      stock:    parseInt(document.getElementById('fStock').value),
      status:   document.getElementById('fStatus').value
    };
  },

  validateForm(data) {
    let valid = true;
    UI.clearErrors();
    if (!data.name)                          { UI.showError('fName',     'errName',     'Name is required.');        valid = false; }
    if (!data.category)                      { UI.showError('fCategory', 'errCategory', 'Category is required.');    valid = false; }
    if (isNaN(data.price) || data.price < 0) { UI.showError('fPrice',    'errPrice',    'Enter a valid price.');     valid = false; }
    if (isNaN(data.stock) || data.stock < 0) { UI.showError('fStock',    'errStock',    'Enter a valid stock qty.'); valid = false; }
    return valid;
  },

  showError(fieldId, errId, msg) {
    document.getElementById(fieldId).classList.add('error');
    document.getElementById(errId).textContent = msg;
  },

  clearErrors() {
    ['fName','fCategory','fPrice','fStock'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('error');
    });
    ['errName','errCategory','errPrice','errStock'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '';
    });
  },

  setSubmitLoading(loading) {
    document.getElementById('btnSubmit').disabled = loading;
    document.getElementById('submitSpinner').classList.toggle('hidden', !loading);
    document.getElementById('submitLabel').style.opacity = loading ? '0.5' : '1';
  },

  setConnectionStatus(online) {
    const dot   = document.getElementById('connDot');
    const label = dot.querySelector('.conn-label');
    dot.querySelector('.conn-dot').style.background = online ? '#3dd68c' : '#f05a5a';
    if (label) label.textContent = online ? 'Connected' : 'Offline';
  },

  esc(str) {
    return String(str)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  },

  formatDate(str) {
    if (!str) return '—';
    return new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  },

  filterProducts(products, search, category, status) {
    const s = search.toLowerCase();
    return products.filter(p => {
      const matchSearch   = !s        || p.name.toLowerCase().includes(s) || p.category.toLowerCase().includes(s);
      const matchCategory = !category || p.category === category;
      const matchStatus   = !status   || p.status   === status;
      return matchSearch && matchCategory && matchStatus;
    });
  }

};
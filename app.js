// ============ Tchapda Customs — script partagé ============

// ------------------ Theme (light/dark) ------------------
const THEME_KEY = 'tchapda.theme';

function applyTheme(theme) {
  document.body.dataset.theme = theme;
}

function toggleTheme() {
  const current = document.body.dataset.theme === 'dark' ? 'dark' : 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
}

(function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const initial = saved || 'light';
  applyTheme(initial);

  // optional: respect OS preference only if user never chose
  if (!saved && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    applyTheme('dark');
  }
})();

// ------------------ Language (fr/en) ------------------
const LANG_KEY = 'tchapda.lang';

const I18N = {
  fr: {
    'topbar.title.dashboard': 'Tableau de bord',
    'topbar.sub.dashboard': "Vue d'ensemble de vos opérations douanières",
    'topbar.title.clients': 'Clients',
    'topbar.sub.clients': 'Entreprises clientes et historique des déclarations',
    'topbar.title.dossiers': 'Dossiers douaniers',
    'topbar.sub.dossiers': 'Suivi de chaque dossier, de la préparation à la livraison',
    'topbar.title.notifications': 'Notifications',
    'topbar.sub.notifications': 'Toutes vos alertes récentes',
    'topbar.title.documents': 'Documents',
    'topbar.sub.documents': 'Gestion documentaire par dossier',
    'topbar.title.marchandises': 'Marchandises',
    'topbar.sub.marchandises': 'Détail des produits déclarés par dossier',
    'topbar.title.facturation': 'Facturation',
    'topbar.sub.facturation': 'Factures, paiements et honoraires',

    'btn.theme': 'Thème',
    'btn.lang': 'FR/EN',

    'btn.new-dossier': '+ Nouveau dossier',
    'btn.view-reports': 'Voir les rapports',
    'btn.new-client': '+ Nouveau client',

    'notif.title': 'Notifications'
  },
  en: {
    'topbar.title.dashboard': 'Dashboard',
    'topbar.sub.dashboard': 'Overview of your customs operations',
    'topbar.title.clients': 'Clients',
    'topbar.sub.clients': 'Client companies and declaration history',
    'topbar.title.dossiers': 'Customs files',
    'topbar.sub.dossiers': 'Track each file from preparation to delivery',
    'topbar.title.notifications': 'Notifications',
    'topbar.sub.notifications': 'All your recent alerts',
    'topbar.title.documents': 'Documents',
    'topbar.sub.documents': 'Document management by file',
    'topbar.title.marchandises': 'Merchandise',
    'topbar.sub.marchandises': 'Details of declared products by file',
    'topbar.title.facturation': 'Billing',
    'topbar.sub.facturation': 'Invoices, payments and fees',

    'btn.theme': 'Theme',
    'btn.lang': 'FR/EN',

    'btn.new-dossier': '+ New customs file',
    'btn.view-reports': 'View reports',
    'btn.new-client': '+ New client',

    'notif.title': 'Notifications'
  }
};

function applyLanguage(lang) {
  const dict = I18N[lang] || I18N.fr;
  document.body.dataset.lang = lang;
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) el.textContent = dict[key];
  });

  // special case: notif panel strong header
  const notifTitle = document.querySelector('#notifPanel [data-i18n="notif.title"]');
  if (notifTitle && dict['notif.title']) notifTitle.textContent = dict['notif.title'];
}

function toggleLanguage() {
  const current = localStorage.getItem(LANG_KEY) || 'fr';
  const next = current === 'fr' ? 'en' : 'fr';
  localStorage.setItem(LANG_KEY, next);
  applyLanguage(next);

  const langBtn = document.getElementById('langToggle');
  if (langBtn) {
    langBtn.textContent = I18N[next]['btn.lang'] || 'FR/EN';
  }
}

(function initLanguage() {
  const saved = localStorage.getItem(LANG_KEY);
  const initial = saved || 'fr';
  applyLanguage(initial);
})();

// ------------------ Active nav link (based on current page) ------------------
document.addEventListener('DOMContentLoaded', () => {
  const current = document.body.dataset.page;
  document.querySelectorAll('.nav a[data-view]').forEach(a => {
    a.classList.toggle('active', a.dataset.view === current);
  });
});

// ------------------ mobile sidebar toggle ------------------
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// ------------------ notif panel ------------------
function toggleNotif(open) {
  document.getElementById('notifPanel').classList.toggle('open', open);
  document.getElementById('scrim').classList.toggle('show', open);
}

// ------------------ modals ------------------
function openModal(id) {
  document.getElementById(id).classList.add('open');
}
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

document.querySelectorAll('.modal-scrim').forEach(m => {
  m.addEventListener('click', e => {
    if (e.target === m) m.classList.remove('open');
  });
});

// ESC to close modals / notif / scrim
(function () {
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    // close modals
    document.querySelectorAll('.modal-scrim.open').forEach(m => m.classList.remove('open'));
    // close notifications
    const np = document.getElementById('notifPanel');
    const scrim = document.getElementById('scrim');
    if (np && np.classList.contains('open')) {
      np.classList.remove('open');
    }
    if (scrim && scrim.classList.contains('show')) {
      scrim.classList.remove('show');
    }
  });
})();

// ---------- Store bindings (Clients + Dossiers v1) ----------
function renderClientsTable() {
  const tbody = document.querySelector('#view-clients table tbody');
  if (!tbody) return;

  const stateClients = window.TchapdaStore?.list('clients') || [];
  // If first run and no data, keep existing demo rows (fallback):
  if (stateClients.length === 0) return;

  tbody.innerHTML = '';

  stateClients
    .slice()
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
    .forEach((c) => {
      const dossiers = window.TchapdaStore.list('dossiers').filter(d => d.clientId === c.id);
      const last = dossiers
        .slice()
        .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))[0];
      const lastDate = last?.arrivalDate || '';
      const docsCount = window.TchapdaStore.list('documents').filter(doc => doc.clientId === c.id).length;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><span class="avatar-mini">${(c.code || c.name || '?').slice(0,2).toUpperCase()}</span>${escapeHtml(c.name)}</td>
        <td>${escapeHtml(c.phone || '')}</td>
        <td>${escapeHtml(c.city || '')}</td>
        <td>${dossiers.length}</td>
        <td>${lastDate ? escapeHtml(formatShortDate(lastDate)) : ''}</td>
        <td class="mono">${docsCount} fichiers</td>
      `;
      tbody.appendChild(tr);
    });
}

function renderDossiersKanban() {
  const kanban = document.querySelector('#view-dossiers .kanban');
  if (!kanban) return;

  const dossiers = window.TchapdaStore?.list('dossiers') || [];
  if (dossiers.length === 0) return; // keep demo unless user created data

// const statusOrder = window.TchapdaStore.DOSSIER_STATUSES;


  // Map existing columns by title
  const cols = Array.from(kanban.querySelectorAll('.kcol'));

  function statusFromCol(col) {
    const h4 = col.querySelector('h4');
    if (!h4) return null;
    const txt = h4.firstChild ? h4.firstChild.textContent : h4.textContent;
    // h4 contains: 'Préparation ' + span count; get first text node
    const name = (h4.childNodes[0] && h4.childNodes[0].textContent || '').trim();
    // Fallback: remove trailing spaces
    return name || null;
  }

  cols.forEach(col => {
    const status = statusFromCol(col);
    const list = dossiers.filter(d => d.status === status);
    const countSpan = col.querySelector('h4 span');
    if (countSpan) countSpan.textContent = String(list.length);

    // clear cards
    const cardsWrap = Array.from(col.querySelectorAll('.kcard'));
    cardsWrap.forEach(c => c.remove());

    list
      .slice()
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
      .forEach(d => {
        const client = window.TchapdaStore.list('clients').find(x => x.id === d.clientId);
        const meta = buildDossierMeta(d, client);

        const card = document.createElement('div');
        card.className = 'kcard';
        card.draggable = true;
        card.dataset.dossierId = d.id;
        card.innerHTML = `
          <div class="id mono">${escapeHtml(d.ref)}</div>
          <div class="cl">${escapeHtml(client?.name || '')}</div>
          <div class="meta">${meta}</div>
        `;

        card.addEventListener('click', () => {
          // simple quick action: move to next status
          // (modal detail can be added later)
        });

        col.appendChild(card);
      });
  });

  // drag drop between columns
  cols.forEach(col => {
    col.addEventListener('dragover', (e) => e.preventDefault());
    col.addEventListener('drop', (e) => {
      e.preventDefault();
      const dossierId = e.dataTransfer?.getData('text/dossierId');
      if (!dossierId) return;
      const status = statusFromCol(col);
      moveDossierStatus(dossierId, status);
    });
  });

  // set dragstart handler on cards
  Array.from(kanban.querySelectorAll('.kcard')).forEach(card => {
    card.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/dossierId', card.dataset.dossierId);
    });
  });
}

function buildDossierMeta(d, client) {
  const pill = d.type === 'Import'
    ? `<span class="pill import">Import</span>`
    : `<span class="pill export">Export</span>`;

  const urgent = window.TchapdaStore.computeDossierIsUrgent(d);
  const dueText = d.dueDate ? formatShortDate(d.dueDate) : '';
  const urgentStyle = urgent ? 'style="color:var(--danger);font-weight:700;"' : '';

  return `${pill}<span ${urgentStyle}>${escapeHtml(dueText)}</span>`;
}

function moveDossierStatus(dossierId, nextStatus) {
  const store = window.TchapdaStore;
  const d = store.getById('dossiers', dossierId);
  if (!d) return;

  store.update('dossiers', dossierId, { status: nextStatus, updatedAt: new Date().toISOString() });
  store.recomputeNotifications();

  renderDossiersKanban();
}

function handleCreateClientFromModal() {
  const modal = document.getElementById('modal-client');
  if (!modal) return;

  const inputs = modal.querySelectorAll('input');
  const [nameEl, phoneEl, cityEl, emailEl] = Array.from(inputs);
  const name = (nameEl?.value || '').trim();
  const phone = (phoneEl?.value || '').trim();
  const city = (cityEl?.value || '').trim();
  const email = (emailEl?.value || '').trim();

  if (!name) return alert('Nom de l’entreprise requis');

  const store = window.TchapdaStore;
  const exists = store.query('clients', c => (c.name || '').toLowerCase() === name.toLowerCase());
  if (exists.length > 0) {
    alert('Client existe déjà.');
    closeModal('modal-client');
    return;
  }

  const code = (name.replace(/\s+/g, '').slice(0,2) || 'CL').toUpperCase();
  store.create('clients', {
    id: null,
    name,
    code,
    phone,
    city,
    email,
    createdAt: new Date().toISOString()
  });

  // close modal + rerender
  closeModal('modal-client');
  // clear fields
  inputs.forEach(i => i.value = '');

  renderClientsTable();
  // also update dossiers modal client dropdown
  syncDossierClientSelects();
  store.recomputeNotifications();
}

function syncDossierClientSelects() {
  const selects = document.querySelectorAll('#modal-dossier select');
  // modal-dossier first select is client
  if (!selects || selects.length === 0) return;

  const clientSelect = selects[0];
  if (!clientSelect) return;

  const store = window.TchapdaStore;
  const clients = store.list('clients');
  if (!clients.length) return;

  clientSelect.innerHTML = '';
  clients.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = c.name;
    clientSelect.appendChild(opt);
  });
}

function handleCreateDossierFromModal() {
  const modal = document.getElementById('modal-dossier');
  if (!modal) return;

  const clientSelect = modal.querySelector('select'); // first select
  const typeSelect = modal.querySelectorAll('select')[1];
  const transportSelect = modal.querySelectorAll('select')[2];

  const originSelectOrInput = modal.querySelector('select[data-country="origin"], input[data-country="origin"], select');
  const originEl = modal.querySelector('[data-country="origin"]');
  const destinationEl = modal.querySelector('[data-country="destination"]');

  const dateEl = modal.querySelector('input[type="date"]');

  const clientId = clientSelect?.value;
  const type = typeSelect?.value;
  const transport = transportSelect?.value;
  const origin = originEl ? (originEl.value || originEl.options?.[originEl.selectedIndex]?.text || '') : '';
  const destination = destinationEl ? (destinationEl.value || destinationEl.options?.[destinationEl.selectedIndex]?.text || '') : '';
  const arrivalDate = dateEl?.value || '';

  if (!clientId) return alert('Choisir un client');
  if (!type) return alert('Choisir le type');
  if (!transport) return alert('Choisir le transport');
  if (!arrivalDate) return alert('Date d’arrivée prévue requise');

  const ref = `TC-${new Date().getFullYear()}-${Math.floor(Math.random()*9000+1000)}`;
  const store = window.TchapdaStore;

  const dossier = {
    id: null,
    ref,
    clientId,
    type,
    transport,
    origin,
    destination,
    arrivalDate: store.normalizeDateInput(arrivalDate),
    dueDate: store.normalizeDateInput(arrivalDate),
    status: store.DOSSIER_STATUSES[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  store.create('dossiers', dossier);
  store.recomputeNotifications();

  // close modal
  closeModal('modal-dossier');
  // clear date + country selects/inputs
  const countryInputs = modal.querySelectorAll('[data-country]');
  countryInputs.forEach(el => { el.value = ''; });
  if (dateEl) dateEl.value = '';

  renderDossiersKanban();
}

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#039;');
}

function formatShortDate(yyyyMmDdOrIso) {
  const iso = window.TchapdaStore.normalizeDateInput(yyyyMmDdOrIso);
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  const months = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

// init per page
(function initStorePage() {
  if (!window.TchapdaStore) return;

  // Clients page
  if (document.body.dataset.page === 'clients') {
    renderClientsTable();
    syncDossierClientSelects();

    // bind create client button: detect modal close button click is inline so we override the handler
    const modal = document.getElementById('modal-client');
    if (modal) {
      // replace onclick via event delegation (buttons are already inline; easiest: attach click on gold button)
      const actionsBtn = modal.querySelectorAll('.btn.btn-gold');
      if (actionsBtn && actionsBtn.length) {
        actionsBtn[actionsBtn.length - 1].addEventListener('click', (e) => {
          e.preventDefault();
          handleCreateClientFromModal();
        });
      }
    }
  }

  // Dossiers page
  if (document.body.dataset.page === 'dossiers') {
    renderDossiersKanban();
    const modal = document.getElementById('modal-dossier');
    if (modal) {
      syncDossierClientSelects();
      const actionsBtn = modal.querySelectorAll('.btn.btn-gold');
      if (actionsBtn && actionsBtn.length) {
        actionsBtn[actionsBtn.length - 1].addEventListener('click', (e) => {
          e.preventDefault();
          handleCreateDossierFromModal();
        });
      }
    }

    // recompute notifications once
    window.TchapdaStore.recomputeNotifications();
    renderDossiersKanban();
  }
})();

// ------------------ 3D hero parallax (dashboard only) ------------------
const wrap = document.getElementById('sceneWrap');

const scene = document.getElementById('scene3d');
if (wrap && scene) {
  wrap.addEventListener('mousemove', (e) => {
    const r = wrap.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    scene.style.transform = `rotateX(${52 - py * 14}deg) rotateZ(${-38 + px * 16}deg)`;
  });
  wrap.addEventListener('mouseleave', () => {
    scene.style.transform = 'rotateX(52deg) rotateZ(-38deg)';
  });
}

// ------------------ card tilt (dashboard stat cards) ------------------
document.querySelectorAll('.tilt').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `perspective(600px) rotateX(${-py * 8}deg) rotateY(${px * 10}deg) translateY(-2px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'none';
  });
});


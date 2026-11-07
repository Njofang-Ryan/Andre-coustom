// Tchapda Customs — Store localStorage (front-only)
// Entities: clients, dossiers, documents, marchandises, factures, notifications

const STORAGE_KEY = 'tchapda.store.v1';

function safeJsonParse(str, fallback) {
  try { return JSON.parse(str); } catch { return fallback; }
}

function nowIso() {
  return new Date().toISOString();
}

function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function normalizeDateInput(value) {
  // Accepts: yyyy-mm-dd from <input type="date"> OR ISO string
  if (!value) return '';
  if (typeof value === 'string' && value.length >= 10) {
    // if yyyy-mm-dd, keep as yyyy-mm-dd
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const d = new Date(value);
    if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  }
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

function parseLocalDate(yyyyMmDd) {
  // yyyy-mm-dd -> Date at local midnight
  if (!yyyyMmDd) return null;
  const m = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(yyyyMmDd);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);
  return new Date(y, mo, d, 0, 0, 0, 0);
}

function daysUntil(yyyyMmDd) {
  const target = parseLocalDate(yyyyMmDd);
  if (!target) return null;
  const today = new Date();
  const a = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
  const diffMs = target.getTime() - a.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

function defaultState() {
  return {
    clients: [],
    dossiers: [],
    documents: [],
    marchandises: [],
    factures: [],
    notifications: [],
    meta: { createdAt: nowIso(), updatedAt: nowIso() }
  };
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultState();
  const parsed = safeJsonParse(raw, null);
  if (!parsed || typeof parsed !== 'object') return defaultState();
  return { ...defaultState(), ...parsed, meta: { ...(defaultState().meta), ...(parsed.meta || {}) } };
}

function saveState(state) {
  state.meta = state.meta || {};
  state.meta.updatedAt = nowIso();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getState() {
  if (window.__tchapdaState) return window.__tchapdaState;
  window.__tchapdaState = loadState();
  return window.__tchapdaState;
}

function commit(mutator) {
  const state = getState();
  mutator(state);
  saveState(state);
  return state;
}

function list(entity) {
  const state = getState();
  return state[entity] || [];
}

function upsert(entity, item, { idField = 'id' } = {}) {
  return commit((state) => {
    const arr = state[entity] || (state[entity] = []);
    const id = item[idField];
    const idx = arr.findIndex(x => x[idField] === id);
    if (idx >= 0) arr[idx] = item;
    else arr.push(item);
  });
}

function create(entity, item, { idField = 'id' } = {}) {
  const id = item[idField] || uid(entity);
  const normalized = { ...item, [idField]: id };
  return commit((state) => {
    state[entity] = state[entity] || [];
    state[entity].push(normalized);
  });
}

function update(entity, id, patch, { idField = 'id' } = {}) {
  return commit((state) => {
    state[entity] = state[entity] || [];
    const idx = state[entity].findIndex(x => x[idField] === id);
    if (idx < 0) return;
    state[entity][idx] = { ...state[entity][idx], ...patch, [idField]: id };
  });
}

function remove(entity, id, { idField = 'id' } = {}) {
  return commit((state) => {
    state[entity] = (state[entity] || []).filter(x => x[idField] !== id);
  });
}

function getById(entity, id, { idField = 'id' } = {}) {
  const state = getState();
  return (state[entity] || []).find(x => x[idField] === id) || null;
}

function query(entity, predicate) {
  const state = getState();
  return (state[entity] || []).filter(predicate);
}

// ---------- Domain helpers ----------
const DOSSIER_STATUSES = [
  'Préparation',
  'En cours',
  'Attente docs',
  'Dédouané',
  'Livré'
];

function computeDossierMissingDocs(dossierId) {
  const docs = list('documents');
  return docs.filter(d => d.dossierId === dossierId && d.mandatory && d.received !== true);
}

function computeDossierIsUrgent(dossier) {
  // Urgent criteria (front): deadline within 3 days OR there are mandatory docs missing
  const missing = computeDossierMissingDocs(dossier.id);
  const due = daysUntil(dossier.dueDate);
  const dueSoon = due !== null && due <= 3;
  return missing.length > 0 || dueSoon;
}

function upsertNotification(n) {
  return commit((state) => {
    state.notifications = state.notifications || [];
    const idx = state.notifications.findIndex(x => x.id === n.id);
    if (idx >= 0) state.notifications[idx] = n;
    else state.notifications.push(n);
  });
}

function generateNotificationForDossier(dossier) {
  // Keep it deterministic-like: id based on dossierId + type
  const missing = computeDossierMissingDocs(dossier.id);
  const due = daysUntil(dossier.dueDate);

  // type: docs_missing (if mandatory docs missing)
  if (missing.length > 0) {
    upsertNotification({
      id: `notif_docs_${dossier.id}`,
      type: 'docs_missing',
      title: 'Documents manquants',
      message: `Dossier ${dossier.ref} — ${missing.length} document(s) requis manquant(s).`,
      dossierId: dossier.id,
      createdAt: nowIso(),
      read: false
    });
  }

  // type: due_soon (if due soon)
  if (due !== null && due <= 3) {
    upsertNotification({
      id: `notif_due_${dossier.id}`,
      type: 'due_soon',
      title: 'Échéance importante',
      message: `Dossier ${dossier.ref} — échéance dans ${due} jour(s).`,
      dossierId: dossier.id,
      createdAt: nowIso(),
      read: false
    });
  }
}

function recomputeNotifications() {
  // Recompute dossiers-based notifications: keep user-created read flags if still relevant.
  return commit((state) => {
    state.notifications = state.notifications || [];

    const dossierList = state.dossiers || [];
    const requiredIds = new Set();

    dossierList.forEach(d => {
      const missing = computeDossierMissingDocs(d.id);
      if (missing.length > 0) requiredIds.add(`notif_docs_${d.id}`);
      const due = daysUntil(d.dueDate);
      if (due !== null && due <= 3) requiredIds.add(`notif_due_${d.id}`);
    });

    // remove obsolete dossier notifications
    state.notifications = (state.notifications || []).filter(n => {
      if (!n || !n.id) return false;
      const isDossierNotif = n.id.startsWith('notif_docs_') || n.id.startsWith('notif_due_');
      if (isDossierNotif) return requiredIds.has(n.id);
      return true; // keep other notifications
    });

    // ensure required notifications exist
    dossierList.forEach(d => {
      const missing = computeDossierMissingDocs(d.id);
      const due = daysUntil(d.dueDate);
      if (missing.length > 0) {
        const id = `notif_docs_${d.id}`;
        const existing = state.notifications.find(x => x.id === id);
        state.notifications = state.notifications || [];
        if (!existing) {
          state.notifications.push({
            id,
            type: 'docs_missing',
            title: 'Documents manquants',
            message: `Dossier ${d.ref} — ${missing.length} document(s) requis manquant(s).`,
            dossierId: d.id,
            createdAt: nowIso(),
            read: false
          });
        } else {
          existing.message = `Dossier ${d.ref} — ${missing.length} document(s) requis manquant(s).`;
          existing.title = 'Documents manquants';
        }
      }
      if (due !== null && due <= 3) {
        const id = `notif_due_${d.id}`;
        const existing = state.notifications.find(x => x.id === id);
        if (!existing) {
          state.notifications.push({
            id,
            type: 'due_soon',
            title: 'Échéance importante',
            message: `Dossier ${d.ref} — échéance dans ${due} jour(s).`,
            dossierId: d.id,
            createdAt: nowIso(),
            read: false
          });
        } else {
          existing.message = `Dossier ${d.ref} — échéance dans ${due} jour(s).`;
          existing.title = 'Échéance importante';
        }
      }
    });
  });
}

// ---------- Expose to window (simple for multi-page static app) ----------
window.TchapdaStore = {
  STORAGE_KEY,
  DOSSIER_STATUSES,
  normalizeDateInput,
  parseLocalDate,
  daysUntil,
  list,
  getState,
  saveState,
  create,
  update,
  remove,
  getById,
  query,
  upsert,
  computeDossierMissingDocs,
  computeDossierIsUrgent,
  recomputeNotifications
};


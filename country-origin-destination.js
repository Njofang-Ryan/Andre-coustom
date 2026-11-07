// Adds custom select behavior for Origin/Destination fields.
// Expects HTML inputs with data attributes OR selects we can replace.
// 
// Markup expected (for inputs):
//   <input data-country="origin">  (or destination)
//   <input data-country="destination">
// 
// We replace each input by a searchable-ish select (native select), filled from COUNTRIES.

(function () {
  function ensureReady() {
    if (typeof COUNTRIES === 'undefined') {
      console.warn('[country-origin-destination] COUNTRIES is not loaded.');
      return false;
    }
    if (typeof renderCountriesOptions !== 'function') {
      console.warn('[country-origin-destination] renderCountriesOptions is not loaded.');
      return false;
    }
    return true;
  }

  function replaceInputWithSelect(inputEl) {
    const kind = inputEl.getAttribute('data-country');
    const placeholder = inputEl.getAttribute('placeholder') || (kind === 'origin' ? 'Pays d’origine' : 'Pays de destination');

    const selectEl = document.createElement('select');
    selectEl.dataset.placeholder = placeholder;
    selectEl.className = inputEl.className || '';
    selectEl.name = inputEl.name || `country_${kind}`;

    // Keep current typed value if any
    const currentValue = inputEl.value || '';

    inputEl.parentElement.replaceChild(selectEl, inputEl);

    renderCountriesOptions(selectEl, { includePlaceholder: true });

    if (currentValue) {
      selectEl.value = currentValue;
    }

    // Basic UX: if user changes, update select value only (native select already does it)
    selectEl.addEventListener('change', () => {
      // no-op
    });
  }

  function initForDocument() {
    if (!ensureReady()) return;

    // Origin/Destination are likely in modal-dossier (dashboard.html) and/or modal-dossier in clients.html.
    document.querySelectorAll('input[data-country="origin"], input[data-country="destination"]').forEach(replaceInputWithSelect);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initForDocument);
  } else {
    initForDocument();
  }
})();


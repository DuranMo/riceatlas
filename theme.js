const root = document.documentElement;
const toggle = document.querySelector('#theme-toggle');

function setNightMode(enabled) {
  root.dataset.theme = enabled ? 'night' : 'day';
  toggle?.setAttribute('aria-label', enabled ? 'Switch to day mode' : 'Switch to night mode');
}

// Storage may be unavailable in private or restricted browsing.
try { setNightMode(localStorage.getItem('rice-atlas-theme') === 'night'); }
catch { setNightMode(false); }

toggle?.addEventListener('click', (event) => {
  event.preventDefault();
  const enabled = root.dataset.theme !== 'night';
  setNightMode(enabled);
  try { localStorage.setItem('rice-atlas-theme', enabled ? 'night' : 'day'); }
  catch { /* The toggle still works without saving the preference. */ }
});

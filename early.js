// Early external script: hide document immediately to avoid flash
// Moved from inline to satisfy extension CSP (script-src 'self').
try {
  document.documentElement.style.visibility = 'hidden';
} catch (e) {
  // If document isn't ready for some reason, ignore silently.
}

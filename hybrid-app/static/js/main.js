// =====================================================
//  main.js — App init, dark mode, toast notifications
// =====================================================

// ── Dark Mode ─────────────────────────────────────
function initDarkMode() {
  const toggle = document.getElementById('darkToggle');
  if (!toggle) return;

  if (localStorage.getItem('darkMode') === 'true') applyDark(true);

  toggle.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('darkMode', isDark);
    updateDarkIcon(isDark);
  });
}

function applyDark(on) {
  document.documentElement.classList.toggle('dark', on);
  updateDarkIcon(on);
}
function updateDarkIcon(isDark) {
  document.querySelector('#darkToggle .fa-moon')?.style.setProperty('display', isDark ? 'none'   : 'inline');
  document.querySelector('#darkToggle .fa-sun')?.style.setProperty('display',  isDark ? 'inline' : 'none');
}

// ── Toast Notification ────────────────────────────
function showToast(message, type = 'info') {
  const existing = document.getElementById('toastNotif');
  if (existing) existing.remove();

  const colors = {
    success: 'bg-green-600',
    error:   'bg-red-600',
    info:    'bg-blue-600'
  };

  const toast = document.createElement('div');
  toast.id = 'toastNotif';
  toast.className = `fixed bottom-28 right-6 z-50 ${colors[type] || colors.info}
    text-white px-5 py-3 rounded-xl shadow-xl text-sm max-w-xs
    transform translate-y-4 opacity-0 transition-all duration-300`;
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-4', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ── Scroll spy for active nav ──────────────────────
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('nav a[href^="#"]');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting)
        navLinks.forEach(l =>
          l.classList.toggle('text-green-600', l.getAttribute('href') === '#' + e.target.id));
    });
  }, { threshold: 0.4 });
  sections.forEach(s => observer.observe(s));
}

// ── Page Init ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initDarkMode();
  initScrollSpy();
  updateNavUI();        // auth.js
  loadVideos();         // videos.js
  initChatbot();        // chatbot.js
  initDragDrop();       // videos.js

  // Restore admin panel if still logged in as admin
  if (Auth.isAdmin()) {
    document.getElementById('adminVideoPanel')?.classList.remove('hidden');
  }
});

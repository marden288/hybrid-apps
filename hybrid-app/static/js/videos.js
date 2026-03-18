// =====================================================
//  videos.js — Video gallery (uses backend API)
// =====================================================

let currentFilter = 'all';

// ── Load & Display ────────────────────────────────
async function loadVideos() {
  const gallery = document.getElementById('videoGallery');
  gallery.innerHTML = `
    <div class="col-span-3 flex justify-center py-12">
      <div class="flex items-center gap-3 text-gray-500">
        <i class="fas fa-spinner fa-spin text-2xl text-green-500"></i>
        <span>Loading videos…</span>
      </div>
    </div>`;
  try {
    const videos = await API.videos.getAll(currentFilter === 'all' ? null : currentFilter);
    renderGallery(videos);
  } catch (err) {
    gallery.innerHTML = `<p class="col-span-3 text-center text-red-500 py-12">
      <i class="fas fa-exclamation-triangle me-2"></i>${err.message}</p>`;
  }
}

function renderGallery(videos) {
  const gallery = document.getElementById('videoGallery');
  if (!videos || videos.length === 0) {
    gallery.innerHTML = '<p class="col-span-3 text-center text-gray-500 py-12">No videos in this category yet.</p>';
    return;
  }

  gallery.innerHTML = videos.map(v => `
    <div class="video-card" id="vid-${v.id}">
      <div class="relative group cursor-pointer" onclick="playVideo('${v.id}','${escHtml(v.videoUrl)}','${escHtml(v.title)}')">
        <video src="${escHtml(v.videoUrl)}" class="w-full h-48 object-cover" preload="metadata" muted></video>
        <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
          <i class="fas fa-play-circle text-white text-5xl opacity-0 group-hover:opacity-100 transition-all"></i>
        </div>
        <span class="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
          <i class="fas fa-eye me-1"></i>${v.views}
        </span>
        <span class="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded capitalize">
          ${escHtml(v.category)}
        </span>
      </div>
      <div class="p-4">
        <h4 class="font-bold text-lg">${escHtml(v.title)}</h4>
        <p class="text-sm text-gray-500 mt-1">${escHtml(v.description)}</p>
        <div class="flex justify-between items-center mt-3 text-xs text-gray-500">
          <span><i class="fas fa-user me-1"></i>${escHtml(v.uploader)}</span>
          <span><i class="fas fa-calendar me-1"></i>${v.date}</span>
        </div>
        ${Auth.isAdmin() ? `
          <button onclick="deleteVideo('${v.id}')"
            class="mt-3 text-red-500 text-sm hover:text-red-700 w-full text-center border-t pt-2 transition-colors">
            <i class="fas fa-trash me-1"></i>Delete
          </button>` : ''}
      </div>
    </div>`).join('');
}

// We expose displayVideos as an alias for loadVideos so auth.js can call it
function displayVideos() { loadVideos(); }

// ── Filter ────────────────────────────────────────
function filterVideos(category, btn) {
  currentFilter = category;
  document.querySelectorAll('.filter-btn').forEach(b => {
    b.classList.remove('bg-green-600', 'text-white');
    b.classList.add('bg-gray-200', 'text-gray-700');
  });
  if (btn) {
    btn.classList.remove('bg-gray-200', 'text-gray-700');
    btn.classList.add('bg-green-600', 'text-white');
  }
  loadVideos();
}

// ── Upload ────────────────────────────────────────
function previewVideo(input) {
  const file = input.files[0];
  if (!file) return;
  const preview = document.getElementById('videoPreview');
  const player  = document.getElementById('previewPlayer');
  player.src = URL.createObjectURL(file);
  preview.classList.remove('hidden');
}

async function uploadVideo() {
  if (!Auth.isAdmin()) { alert('You must be logged in as admin.'); return; }

  const title    = document.getElementById('videoTitle').value.trim();
  const desc     = document.getElementById('videoDesc').value.trim();
  const category = document.getElementById('videoCategory').value;
  const uploader = document.getElementById('videoUploader').value;
  const file     = document.getElementById('videoFile').files[0];

  if (!title) { alert('Please enter a video title.'); return; }
  if (!file)  { alert('Please select a video file.'); return; }

  const btn = document.querySelector('[onclick="uploadVideo()"]');
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Uploading…'; }

  const fd = new FormData();
  fd.append('title',       title);
  fd.append('description', desc);
  fd.append('category',    category);
  fd.append('uploader',    uploader);
  fd.append('video',       file);

  try {
    await API.videos.upload(fd);
    // Reset form
    document.getElementById('videoTitle').value = '';
    document.getElementById('videoDesc').value  = '';
    document.getElementById('videoFile').value  = '';
    document.getElementById('videoPreview').classList.add('hidden');
    loadVideos();
    if (typeof addMessage === 'function')
      addMessage(`📹 Video "${title}" uploaded by ${uploader}!`, 'bot');
    showToast('Video published successfully! 🎉', 'success');
  } catch (err) {
    showToast('Upload failed: ' + err.message, 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-upload me-2"></i>Publish Video'; }
  }
}

// ── Play ──────────────────────────────────────────
function playVideo(id, url, title) {
  // Increment view count in background
  API.videos.view(id).catch(() => {});

  const overlay = document.createElement('div');
  overlay.id = 'videoOverlay';
  overlay.className = 'fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4';
  overlay.innerHTML = `
    <div class="relative w-full max-w-4xl">
      <button onclick="document.getElementById('videoOverlay').remove()"
        class="absolute -top-12 right-0 text-white text-3xl hover:text-gray-300">
        <i class="fas fa-times"></i>
      </button>
      <video src="${escHtml(url)}" controls autoplay class="w-full rounded-xl shadow-2xl"></video>
      <h3 class="text-white text-xl mt-4">${escHtml(title)}</h3>
    </div>`;
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
}

// ── Delete ────────────────────────────────────────
async function deleteVideo(id) {
  if (!confirm('Delete this video?')) return;
  try {
    await API.videos.delete(id);
    document.getElementById(`vid-${id}`)?.remove();
    showToast('Video deleted.', 'success');
  } catch (err) {
    showToast('Delete failed: ' + err.message, 'error');
  }
}

// ── Drag & Drop ───────────────────────────────────
function initDragDrop() {
  const area = document.querySelector('.upload-area');
  if (!area) return;
  area.addEventListener('dragover', e => { e.preventDefault(); area.style.borderColor = '#0288D1'; });
  area.addEventListener('dragleave', () => { area.style.borderColor = '#00C853'; });
  area.addEventListener('drop', e => {
    e.preventDefault();
    area.style.borderColor = '#00C853';
    const fi = document.getElementById('videoFile');
    if (e.dataTransfer.files.length) { fi.files = e.dataTransfer.files; previewVideo(fi); }
  });
}

// ── Helpers ───────────────────────────────────────
function escHtml(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

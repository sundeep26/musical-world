const grid = document.querySelector('#video-grid');
const empty = document.querySelector('#empty-state');
const filters = document.querySelector('#filters');
const search = document.querySelector('#search');
const dialog = document.querySelector('#player-dialog');
const player = document.querySelector('#player');
let videos = [];
let activeCategory = 'all';

const escapeHTML = (value = '') => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

function renderFilters() {
  const categories = [...new Set(videos.map(video => video.category).filter(Boolean))];
  filters.innerHTML = `<button class="filter ${activeCategory === 'all' ? 'active' : ''}" data-category="all">ALL <span>—</span></button>` + categories.map(category => `<button class="filter ${activeCategory === category ? 'active' : ''}" data-category="${escapeHTML(category)}">${escapeHTML(category.toUpperCase())} <span>—</span></button>`).join('');
  filters.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => {
    activeCategory = button.dataset.category;
    renderFilters();
    renderVideos();
  }));
}

function renderVideos() {
  const term = search.value.trim().toLowerCase();
  const matches = videos.filter(video => {
    const matchesCategory = activeCategory === 'all' || video.category === activeCategory;
    const haystack = `${video.title} ${video.description || ''} ${video.category || ''}`.toLowerCase();
    return matchesCategory && haystack.includes(term);
  });
  grid.innerHTML = matches.map((video, index) => {
    const number = String(videos.indexOf(video) + 1).padStart(2, '0');
    const poster = video.poster ? ` style="--poster:url('${escapeHTML(video.poster)}')"` : '';
    return `<button class="video-card" data-index="${videos.indexOf(video)}" aria-label="Play ${escapeHTML(video.title)}"><span class="card-art${video.poster ? ' has-poster' : ''}"${poster}><span class="card-number">${number} / ${String(videos.length).padStart(2, '0')}</span><span class="play-button" aria-hidden="true">▶</span><span class="card-duration">${escapeHTML(video.duration || 'PLAY SONG')}</span></span><span class="card-meta"><span class="card-category">${escapeHTML(video.category || 'COVER')}</span><span class="card-arrow" aria-hidden="true">↗</span><span class="card-title">${escapeHTML(video.title)}</span><span class="card-description">${escapeHTML(video.description || '')}</span></span></button>`;
  }).join('');
  grid.querySelectorAll('.video-card').forEach(card => card.addEventListener('click', () => openVideo(videos[Number(card.dataset.index)])));
  empty.hidden = videos.length > 0;
  grid.hidden = videos.length === 0;
  document.querySelector('#result-note').textContent = videos.length ? `${matches.length} SONG${matches.length === 1 ? '' : 'S'} READY TO PLAY` : 'MADE TO BE PLAYED';
  document.querySelector('#collection-count').textContent = `${String(matches.length).padStart(2, '0')} SONG${matches.length === 1 ? '' : 'S'} · A LITTLE MUSIC FOR YOUR DAY`;
  if (videos.length && matches.length === 0) {
    grid.hidden = false;
    grid.innerHTML = '<p class="no-results">Nothing in this frame. Try another search.</p>';
  }
}

function openVideo(video) {
  if (!video) return;
  player.src = video.src;
  player.poster = video.poster || '';
  document.querySelector('#player-title').textContent = video.title;
  document.querySelector('#player-category').textContent = `${video.category || 'COVER'}  /  ${video.year || ''}`;
  document.querySelector('#player-description').textContent = video.description || '';
  dialog.showModal();
  player.play().catch(() => {});
}

function closePlayer() {
  player.pause();
  player.removeAttribute('src');
  player.load();
  dialog.close();
}

search.addEventListener('input', renderVideos);
document.querySelector('#close-player').addEventListener('click', closePlayer);
dialog.addEventListener('click', event => { if (event.target === dialog) closePlayer(); });
dialog.addEventListener('close', () => { player.pause(); player.removeAttribute('src'); });

async function loadSongbook() {
  const githubPages = location.hostname.endsWith('.github.io');
  if (githubPages) {
    const owner = location.hostname.slice(0, -'.github.io'.length);
    const pathParts = location.pathname.split('/').filter(Boolean);
    const repo = pathParts[0] || `${owner}.github.io`;
    const endpoint = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/videos`;
    const response = await fetch(endpoint, { headers: { Accept: 'application/vnd.github+json' } });
    if (!response.ok) throw new Error(`GitHub could not list videos (${response.status})`);
    const files = await response.json();
    const posters = new Map(files.filter(file => file.type === 'file' && /\.(jpe?g|png|webp)$/i.test(file.name)).map(file => [file.name.replace(/\.(jpe?g|png|webp)$/i, '').toLowerCase(), `videos/${encodeURIComponent(file.name)}`]));
    videos = files.filter(file => file.type === 'file' && /\.(mp4|webm|mov|m4v|ogv)$/i.test(file.name)).map(file => {
      const title = file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
      return { title, src: `videos/${encodeURIComponent(file.name)}`, poster: posters.get(title.toLowerCase()), category: 'Cover', description: 'A song cover from My Singing World.' };
    });
  } else {
    const response = await fetch('./videos.json');
    if (!response.ok) throw new Error('Could not load videos.json');
    const data = await response.json();
    videos = Array.isArray(data) ? data.filter(video => video && video.title && video.src) : [];
  }
}

loadSongbook().then(() => {
  renderFilters();
  renderVideos();
}).catch(error => {
  console.error(error);
  try {
    const localSongbook = JSON.parse(document.querySelector('#local-songbook').textContent);
    videos = Array.isArray(localSongbook) ? localSongbook.filter(video => video && video.title && video.src) : [];
  } catch (fallbackError) {
    console.error(fallbackError);
    document.querySelector('#empty-state .eyebrow').textContent = 'COULDN’T LOAD THE SONGBOOK';
    document.querySelector('#empty-state h3').textContent = 'Try refreshing the page.';
    document.querySelector('#empty-state p:not(.eyebrow)').textContent = 'The song list could not be read. Check the repository visibility and the videos folder, then reload.';
  }
  renderFilters();
  renderVideos();
});
/* ================================================
   ARTIFEXTECH — script.js
   Zainab Qazi | Design × Engineering
================================================ */

// ── SEED POSTS ──────────────────────────────────────────────────────────────
const SEED_POSTS = [
    {
        id: 'seed-1',
        title: 'The Power of White Space in Graphic Design',
        content: 'White space — also called negative space — is one of the most misunderstood tools in a designer\'s toolkit. New designers often feel the urge to fill every pixel, but seasoned professionals know that breathing room is what makes a design feel luxurious and intentional. Apple\'s product pages are a masterclass in this. Notice how much space surrounds their product imagery. That emptiness isn\'t wasted — it\'s directing your focus, building anticipation, and communicating premium quality without saying a word. Next time you design, try removing elements instead of adding them.',
        category: 'design',
        author: 'Zainab Qazi',
        date: '2025-01-10',
        claps: 24,
        clappedBy: [],
        comments: [
            { author: 'Hira M.', text: 'This changed how I approach my layouts. Thank you!', date: '2025-01-11' },
            { author: 'Ahmed R.', text: 'White space truly is underrated. Great read!', date: '2025-01-12' }
        ]
    },
    {
        id: 'seed-2',
        title: 'Color Theory for Digital Designers: A Practical Guide',
        content: 'Understanding color isn\'t just about making things look pretty — it\'s about psychology, emotion, and communication. The color red raises heart rate and urgency (think sale signs). Blue builds trust and calm (why almost every bank uses it). As digital designers, we work with the RGB color model, but we think in HSL — Hue, Saturation, and Lightness. A practical tip: when building a color palette, start with one brand color, then create a 60-30-10 split. 60% dominant neutral, 30% secondary color, 10% accent. This formula works every single time and creates visual harmony without overthinking.',
        category: 'design',
        author: 'Zainab Qazi',
        date: '2025-01-15',
        claps: 18,
        clappedBy: [],
        comments: [
            { author: 'Sara K.', text: 'The 60-30-10 rule is a game changer. I\'ve been applying it everywhere!', date: '2025-01-16' }
        ]
    },
    {
        id: 'seed-3',
        title: 'Why Every Developer Needs Basic Design Skills',
        content: 'I\'m a Software Engineering student who also designs, and let me tell you — it has been the biggest advantage in my academic and professional journey. When you understand typography, spacing, and color, your UIs stop looking like developer-coded interfaces and start looking like products. You don\'t need to become a full Graphic Designer. Just learn the basics: use system fonts or well-paired Google Fonts, maintain consistent spacing with an 8px grid, and never use pure #000000 black on pure #ffffff white (it\'s harsh on the eyes). These small rules make enormous differences.',
        category: 'design',
        author: 'Zainab Qazi',
        date: '2025-01-20',
        claps: 31,
        clappedBy: [],
        comments: []
    }
];

const STORAGE_KEY = 'artifex_blogs_v2';
const CLAP_KEY = 'artifex_user_claps';
let currentFilter = 'all';
let activeCommentIndex = null;

// ── DATA HELPERS ─────────────────────────────────────────────────────────────
function loadPosts() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_POSTS));
        return [...SEED_POSTS];
    }
    return JSON.parse(saved);
}

function savePosts(posts) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

function getUserClaps() {
    const saved = localStorage.getItem(CLAP_KEY);
    return saved ? JSON.parse(saved) : {};
}

function saveUserClaps(claps) {
    localStorage.setItem(CLAP_KEY, JSON.stringify(claps));
}

// ── NAVIGATION ────────────────────────────────────────────────────────────────
function goto(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(id);
    if (target) {
        target.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (id === 'home') renderFeed();
}

function scrollToFeed() {
    const anchor = document.getElementById('feed-anchor');
    if (anchor) anchor.scrollIntoView({ behavior: 'smooth' });
}

function toggleMenu() {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('open');
}

// ── THEME ─────────────────────────────────────────────────────────────────────
function toggleTheme() {
    const html = document.documentElement;
    const isLight = html.getAttribute('data-theme') === 'light';
    const newTheme = isLight ? 'dark' : 'light';
    html.setAttribute('data-theme', newTheme);
    document.getElementById('theme-btn').innerText = isLight ? '☀️' : '🌙';
    localStorage.setItem('artifex_theme', newTheme);
}

function loadTheme() {
    const saved = localStorage.getItem('artifex_theme');
    if (saved) {
        document.documentElement.setAttribute('data-theme', saved);
        document.getElementById('theme-btn').innerText = saved === 'light' ? '🌙' : '☀️';
    }
}

// ── TOAST ─────────────────────────────────────────────────────────────────────
function showToast(msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2800);
}

// ── PUBLISH ───────────────────────────────────────────────────────────────────
function publishBlog() {
    const title = document.getElementById('blog-title').value.trim();
    const content = document.getElementById('blog-content').value.trim();
    const category = document.getElementById('blog-category').value;
    const authorRaw = document.getElementById('blog-author').value.trim();
    const author = authorRaw || 'Anonymous';

    if (!title || !content) {
        showToast('⚠️ Please fill in title and content!');
        return;
    }

    const posts = loadPosts();
    const newPost = {
        id: 'post-' + Date.now(),
        title,
        content,
        category,
        author,
        date: new Date().toISOString().split('T')[0],
        claps: 0,
        clappedBy: [],
        comments: []
    };
    posts.unshift(newPost);
    savePosts(posts);

    document.getElementById('blog-title').value = '';
    document.getElementById('blog-content').value = '';
    document.getElementById('blog-author').value = '';

    showToast('🚀 Post published!');
    goto('home');
}

// ── CLAP ──────────────────────────────────────────────────────────────────────
function toggleClap(postId) {
    const posts = loadPosts();
    const userClaps = getUserClaps();
    const idx = posts.findIndex(p => p.id === postId);
    if (idx === -1) return;

    if (userClaps[postId]) {
        // un-clap
        posts[idx].claps = Math.max(0, (posts[idx].claps || 0) - 1);
        delete userClaps[postId];
    } else {
        posts[idx].claps = (posts[idx].claps || 0) + 1;
        userClaps[postId] = true;
    }

    savePosts(posts);
    saveUserClaps(userClaps);
    renderFeed();
}

// ── COMMENTS ─────────────────────────────────────────────────────────────────
function openCommentModal(postId) {
    activeCommentIndex = postId;
    const posts = loadPosts();
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const list = document.getElementById('modal-comments-list');
    list.innerHTML = '';

    if (!post.comments || post.comments.length === 0) {
        list.innerHTML = '<div class="no-comments">No comments yet. Be the first! 👇</div>';
    } else {
        post.comments.forEach(c => {
            const div = document.createElement('div');
            div.className = 'comment-item';
            div.innerHTML = `<div class="c-author">${escapeHtml(c.author)} · <span style="color:var(--text-dim);font-weight:400">${c.date || ''}</span></div>${escapeHtml(c.text)}`;
            list.appendChild(div);
        });
    }

    document.getElementById('modal-comment-input').value = '';
    document.getElementById('comment-modal').classList.add('open');
}

function closeCommentModal() {
    document.getElementById('comment-modal').classList.remove('open');
    activeCommentIndex = null;
}

function closeModal(event) {
    if (event.target.id === 'comment-modal') closeCommentModal();
}

function submitModalComment() {
    const input = document.getElementById('modal-comment-input');
    const text = input.value.trim();
    if (!text) { showToast('⚠️ Please write a comment first.'); return; }
    if (!activeCommentIndex) return;

    const posts = loadPosts();
    const idx = posts.findIndex(p => p.id === activeCommentIndex);
    if (idx === -1) return;

    if (!posts[idx].comments) posts[idx].comments = [];
    posts[idx].comments.push({
        author: 'You',
        text,
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    });
    savePosts(posts);
    showToast('💬 Comment added!');
    openCommentModal(activeCommentIndex); // refresh modal
    renderFeed(); // refresh card preview
}

// ── DELETE ────────────────────────────────────────────────────────────────────
function deletePost(postId, event) {
    event.stopPropagation();
    if (!confirm('Delete this post?')) return;
    const posts = loadPosts().filter(p => p.id !== postId);
    savePosts(posts);
    showToast('🗑️ Post deleted.');
    renderFeed();
}

// ── FILTER ────────────────────────────────────────────────────────────────────
function filterPosts(cat, btn) {
    currentFilter = cat;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    renderFeed();
}

// ── RENDER ────────────────────────────────────────────────────────────────────
function renderFeed() {
    const feed = document.getElementById('community-feed');
    const emptyState = document.getElementById('empty-state');
    if (!feed) return;

    const allPosts = loadPosts();
    const userClaps = getUserClaps();
    const filtered = currentFilter === 'all'
        ? allPosts
        : allPosts.filter(p => p.category === currentFilter);

    feed.innerHTML = '';

    if (filtered.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    if (emptyState) emptyState.style.display = 'none';

    const catLabels = {
        design: '🎨 Graphic Design',
        community: '💬 Community',
        engineering: '⚙️ Engineering',
        tools: '🛠️ Tools',
    };

    filtered.forEach((post, loopIdx) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.animationDelay = (loopIdx * 0.06) + 's';

        const hasClappped = !!userClaps[post.id];
        const clapClass = hasClappped ? 'react-btn clapped' : 'react-btn';
        const commentCount = post.comments ? post.comments.length : 0;
        const tagLabel = catLabels[post.category] || '📝 Post';
        const isSeeded = post.id && post.id.startsWith('seed-');

        // Build comment preview (last 2)
        let commentPreviewHTML = '';
        if (commentCount > 0) {
            const preview = post.comments.slice(-2);
            commentPreviewHTML = `<div class="comments-preview">` +
                preview.map(c => `<div class="comment-chip"><strong>${escapeHtml(c.author)}</strong>${escapeHtml(c.text)}</div>`).join('') +
                `</div>`;
        }

        card.innerHTML = `
            <div class="card-header">
                <span class="card-tag">${tagLabel}</span>
                <span class="card-meta">${post.author || 'Anonymous'} · ${post.date || ''}</span>
            </div>
            <h3>${escapeHtml(post.title)}</h3>
            <p>${escapeHtml(post.content)}</p>
            ${commentPreviewHTML}
            <div class="reaction-bar">
                <button class="${clapClass}" onclick="toggleClap('${post.id}')">
                    👏 ${post.claps || 0}
                </button>
                <button class="react-btn" onclick="openCommentModal('${post.id}')">
                    💬 ${commentCount}
                </button>
                ${!isSeeded ? `<button class="delete-btn" onclick="deletePost('${post.id}', event)">🗑️</button>` : ''}
            </div>
        `;

        feed.appendChild(card);
    });
}

// ── UTILS ─────────────────────────────────────────────────────────────────────
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// ── PROGRESS BAR ──────────────────────────────────────────────────────────────
window.addEventListener('scroll', () => {
    const scrolled = document.documentElement.scrollTop;
    const max = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const pct = max > 0 ? (scrolled / max) * 100 : 0;
    const bar = document.getElementById('progress-bar');
    if (bar) bar.style.width = pct + '%';
});

// ── KEYBOARD SHORTCUT ────────────────────────────────────────────────────────
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCommentModal();
    if (e.key === 'Enter' && document.getElementById('comment-modal').classList.contains('open')) {
        submitModalComment();
    }
});

// ── INIT ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    renderFeed();

    // Inject toast element
    if (!document.getElementById('toast')) {
        const toast = document.createElement('div');
        toast.id = 'toast';
        document.body.appendChild(toast);
    }
});

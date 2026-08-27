/**
 * SPHERA API Client
 * Handles all communication with the FastAPI backend.
 * - Production (sphera.expediteconsults.com): uses relative /api/v1 path via Nginx
 * - Development (localhost): uses http://localhost:8000/api/v1
 */

const _isProd = location.hostname !== 'localhost' && location.hostname !== '127.0.0.1';
const SPHERA_BACKEND = 'https://sphera-api.onrender.com';
const SPHERA_API = _isProd ? `${SPHERA_BACKEND}/api/v1` : 'http://127.0.0.1:8001/api/v1';
const SPHERA_WS = _isProd
    ? `wss://sphera-api.onrender.com/ws`
    : 'ws://127.0.0.1:8001/ws';

// ── Token management ──────────────────────────────────────────
const Auth = {
    getToken: () => localStorage.getItem('sphera_token'),
    setToken: (t) => localStorage.setItem('sphera_token', t),
    getRefresh: () => localStorage.getItem('sphera_refresh'),
    setRefresh: (t) => localStorage.setItem('sphera_refresh', t),
    getUser: () => JSON.parse(localStorage.getItem('sphera_user') || 'null'),
    setUser: (u) => localStorage.setItem('sphera_user', JSON.stringify(u)),
    clear: () => { localStorage.removeItem('sphera_token'); localStorage.removeItem('sphera_refresh'); localStorage.removeItem('sphera_user'); },
    clearTokens: function () { this.clear(); },  // alias used by me-dropdown handler
    isLoggedIn: () => !!localStorage.getItem('sphera_token'),
};

// ── Per-User localStorage Namespace Proxy ──────────────────────
// Keys in BYPASS stay un-prefixed (auth/identity/global prefs).
// All other keys get prefixed with the active user's ID so that
// two different accounts never share app data on the same browser.
const _NS_BYPASS = new Set([
    'sphera_user', 'sphera_token', 'sphera_refresh',
    'co_theme', 'sphera_tour_seen', 'spheraOnboardingSeen',
    'sdResumeProfile', 'sphera_guest_id'
]);

function setupUserNamespace(userId) {
    // Restore real storage first (idempotent)
    teardownUserNamespace();
    if (!userId) return;  // guest or no user — no isolation needed
    const prefix = 'u_' + userId + '_';
    const _real = window.localStorage;
    window._spheraRealStorage = _real;
    const proxy = new Proxy(_real, {
        get(target, prop) {
            const key = (k) => (_NS_BYPASS.has(k) ? k : prefix + k);
            if (prop === 'getItem') return (k) => target.getItem(key(k));
            if (prop === 'setItem') return (k, v) => target.setItem(key(k), v);
            if (prop === 'removeItem') return (k) => target.removeItem(key(k));
            const val = target[prop];
            return typeof val === 'function' ? val.bind(target) : val;
        }
    });
    try {
        Object.defineProperty(window, 'localStorage', { get: () => proxy, configurable: true });
    } catch (e) { console.warn('[SPHERA] Could not install storage namespace proxy:', e); }
}

function teardownUserNamespace() {
    if (!window._spheraRealStorage) return;
    try {
        Object.defineProperty(window, 'localStorage', {
            get: () => window._spheraRealStorage, configurable: true
        });
    } catch (e) { }
    window._spheraRealStorage = null;
}

// ── Core fetch wrapper ────────────────────────────────────────
async function apiCall(method, path, body = null, isFormData = false) {
    const headers = {};
    const token = Auth.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (!isFormData) headers['Content-Type'] = 'application/json';

    const opts = { method, headers };
    if (body && !isFormData) opts.body = JSON.stringify(body);
    if (body && isFormData) opts.body = body;

    let res = await fetch(`${SPHERA_API}${path}`, opts);

    // Auto-refresh token on 401
    if (res.status === 401 && Auth.getRefresh()) {
        const refreshed = await fetch(`${SPHERA_API}/auth/refresh`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${Auth.getRefresh()}` },
        });
        if (refreshed.ok) {
            const data = await refreshed.json();
            Auth.setToken(data.access_token);
            headers['Authorization'] = `Bearer ${data.access_token}`;
            res = await fetch(`${SPHERA_API}${path}`, { method, headers, body: opts.body });
        } else {
            Auth.clear();
            spheraLogout();
            return null;
        }
    }

    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        const detail = err.detail;
        let msg;
        if (Array.isArray(detail)) {
            // FastAPI 422 validation error — extract the first human-readable message
            msg = detail.map(d => d.msg || d.message || JSON.stringify(d)).join(', ');
        } else {
            msg = String(detail || 'Something went wrong');
        }
        throw new Error(msg);
    }
    if (res.status === 204) return null;
    return res.json();
}

// ── Auth API ──────────────────────────────────────────────────
async function spheraRegister(username, email, password, displayName) {
    // Try real API first, fall back to mock offline session if unavailable
    try {
        const data = await apiCall('POST', '/auth/register', { username, email, password, display_name: displayName });
        Auth.setToken(data.access_token);
        Auth.setRefresh(data.refresh_token);
        await spheraLoadMe();
        return data;
    } catch (e) {
        // Backend unavailable — create a local mock session for this new user
        const fakeToken = 'mock_user_' + Date.now();
        Auth.setToken(fakeToken);
        Auth.setRefresh(fakeToken);
        Auth.setUser({ email, display_name: displayName, username, role: 'user' });
        setupUserNamespace(email);
        return { access_token: fakeToken, refresh_token: fakeToken };
    }
}

/* ── Mock offline credentials (no backend needed) ─────────────
   Add or edit users here. role: 'admin' | 'user'
──────────────────────────────────────────────── */
const MOCK_USERS = [
    { email: 'admin@sphera.io', password: 'admin123', name: 'Admin', username: 'admin', role: 'admin' },
    { email: 'admin@sphera.com', password: 'admin123', name: 'Admin', username: 'admin', role: 'admin' },
    { email: 'user@sphera.com', password: 'sphera123', name: 'Alex Rivera', username: 'alexr', role: 'user' },
    { email: 'demo@sphera.com', password: 'demo1234', name: 'Demo User', username: 'demouser', role: 'user' },
];

async function spheraLogin(email, password) {
    // ── 1. Try mock credentials first (works offline) ───────────
    const emailLC = (email || '').toLowerCase().trim();
    const mock = MOCK_USERS.find(u => u.email === emailLC && u.password === password);
    if (mock) {
        const fakeToken = 'mock_' + mock.role + '_' + Date.now();
        Auth.setToken(fakeToken);
        Auth.setRefresh(fakeToken);
        Auth.setUser({ email: mock.email, display_name: mock.name, username: mock.username, role: mock.role });
        setupUserNamespace(mock.email);
        return { access_token: fakeToken, refresh_token: fakeToken, user: mock };
    }
    // ── 2. Fall back to real API if backend is available ────────
    const data = await apiCall('POST', '/auth/login', { email, password });
    Auth.setToken(data.access_token);
    Auth.setRefresh(data.refresh_token);
    const me = await spheraLoadMe();
    if (me) setupUserNamespace(me.email || email);
    return data;
}

async function spheraLoadMe() {
    const me = await apiCall('GET', '/auth/me');
    if (me) Auth.setUser(me);
    return me;
}

function spheraLogout() {
    teardownUserNamespace();
    Auth.clear();
    sessionStorage.removeItem('sphera_guest_id');
    closeMeMenu && closeMeMenu();
    if (typeof spheraWS !== 'undefined' && spheraWS) { try { spheraWS.close(); } catch { } spheraWS = null; }
    showToast('🧹 Local data cleared. Reloading...');
    setTimeout(() => location.reload(), 800);
}

// ── Posts API ─────────────────────────────────────────────────
async function apiFeed(page = 1) { return apiCall('GET', `/posts/feed?page=${page}`); }
async function apiExploreFeed(page = 1) { return apiCall('GET', `/posts/explore?page=${page}`); }
async function apiReels(page = 1) { return apiCall('GET', `/posts/reels?page=${page}`); }
async function apiCreatePost(body) { return apiCall('POST', '/posts/', body); }
async function apiLikePost(postId) { return apiCall('POST', `/posts/${postId}/like`); }
async function apiComment(postId, content) { return apiCall('POST', `/posts/${postId}/comment`, { content }); }

// ── Users API ─────────────────────────────────────────────────
async function apiGetProfile(username) { return apiCall('GET', `/users/${username}`); }
async function apiFollow(username) { return apiCall('POST', `/users/${username}/follow`); }
async function apiSearch(q) { return apiCall('GET', `/users/search?q=${encodeURIComponent(q)}`); }

// ── LinkedUp API ──────────────────────────────────────────────
async function apiDiscover() { return apiCall('GET', '/linkedup/discover'); }
async function apiSwipe(swiped_user_id, direction) { return apiCall('POST', '/linkedup/swipe', { swiped_user_id, direction }); }
async function apiGetMatches() { return apiCall('GET', '/linkedup/matches'); }

// ── Messages API ──────────────────────────────────────────────
async function apiStartConvo(recipient_username) { return apiCall('POST', '/messages/conversations', { recipient_username }); }
async function apiGetMessages(convoId) { return apiCall('GET', `/messages/${convoId}`); }
async function apiSendMessage(conversation_id, content) { return apiCall('POST', '/messages/send', { conversation_id, content }); }

// ── Sphera Pay API ────────────────────────────────────────────
async function apiGetWallet() { return apiCall('GET', '/pay/wallet'); }
async function apiTopUp(amount, method) { return apiCall('POST', '/pay/topup', { amount, method }); }
async function apiSendMoney(recipient_username, amount, note) { return apiCall('POST', '/pay/send', { recipient_username, amount, note }); }

// ── WebSocket — real-time events ──────────────────────────────
let spheraWS = null;
let wsReconnectTimer = null;

function connectWebSocket() {
    const token = Auth.getToken();
    if (!token || spheraWS?.readyState === WebSocket.OPEN) return;

    spheraWS = new WebSocket(`${SPHERA_WS}?token=${token}`);

    spheraWS.onopen = () => {
        console.log('✅ SPHERA WebSocket connected');
        // Heartbeat ping every 25s
        clearInterval(wsReconnectTimer);
        wsReconnectTimer = setInterval(() => {
            if (spheraWS.readyState === WebSocket.OPEN) spheraWS.send(JSON.stringify({ type: 'ping' }));
        }, 25000);
    };

    spheraWS.onmessage = (e) => {
        try { handleWsEvent(JSON.parse(e.data)); } catch { }
    };

    spheraWS.onclose = () => {
        console.log('🔴 WebSocket closed, reconnecting in 5s…');
        clearInterval(wsReconnectTimer);
        setTimeout(connectWebSocket, 5000);
    };

    spheraWS.onerror = () => spheraWS.close();
}

function handleWsEvent(evt) {
    switch (evt.event) {
        case 'notification':
            incrementBellBadge();
            if (evt.type === 'like') showToast(`❤️ ${evt.actor} liked your post`);
            if (evt.type === 'comment') showToast(`💬 ${evt.actor} commented: ${evt.message}`);
            if (evt.type === 'follow') showToast(`👤 ${evt.actor} followed you`);
            break;
        case 'linkedup_match':
            showToast(`💘 It's a Match! You matched with ${evt.matched_with}`);
            // Optionally trigger match popup
            break;
        case 'new_message':
            incrementBellBadge();
            showToast(`💬 ${evt.sender}: ${evt.content?.slice(0, 60)}`);
            break;
        case 'presence':
            // Could update online dots on user avatars
            break;
    }
}

function incrementBellBadge() {
    const badge = document.getElementById('notifBadge');
    if (!badge) return;
    const curr = parseInt(badge.textContent) || 0;
    badge.textContent = curr + 1;
    badge.style.display = 'flex';
}

// ── Auth gate — call on page load ─────────────────────────────
function spheraInitAuth() {
    // BYPASS AUTHENTICATION ENTIRELY
    if (!Auth.isLoggedIn()) {
        const mock = MOCK_USERS[0]; // Admin mock user
        const fakeToken = 'mock_' + mock.role + '_' + Date.now();
        Auth.setToken(fakeToken);
        Auth.setRefresh(fakeToken);
        Auth.setUser({ email: mock.email, display_name: mock.name, username: mock.username, role: mock.role });
    }

    const u = Auth.getUser();
    if (u && u.email) setupUserNamespace(u.email);
    hideAuthModal();
    connectWebSocket();
    loadLiveFeed();
    updateTopBarUser();

    // Ensure auth modal is explicitly removed
    const authOverlay = document.getElementById('spheraAuthOverlay');
    if (authOverlay) authOverlay.style.display = 'none';
}

function updateTopBarUser() {
    const user = Auth.getUser();
    if (!user) return;
    // Populate the Me button dropdown
    if (typeof updateMeMenu === 'function') updateMeMenu(user);
}

// ── Live feed loader ──────────────────────────────────────────
async function loadLiveFeed() {
    const feedContainer = document.getElementById('feedPosts');
    if (!feedContainer) return;
    try {
        feedContainer.innerHTML = '<div style="padding:20px;color:var(--text2);text-align:center">Loading feed…</div>';
        const data = await apiFeed(1);
        if (!data || !data.posts || data.posts.length === 0) {
            feedContainer.innerHTML = '<div style="padding:20px;color:var(--text2);text-align:center">📭 Nothing in your feed yet — follow some people!</div>';
            return;
        }
        feedContainer.innerHTML = data.posts.map(renderApiPost).join('');
    } catch (e) {
        // Fall back to mock data silently if API unavailable
        console.warn('Feed API unavailable, using mock data:', e.message);
    }
}

function renderApiPost(p) {
    const user = Auth.getUser();
    return `
    <div class="post-card" id="apipost_${p.id}">
      <div class="post-header">
        <div class="post-avatar" style="background:linear-gradient(135deg,#7c3aed,#ec4899)">
          ${(p.author_name || 'U')[0].toUpperCase()}
        </div>
        <div class="post-meta">
          <span class="post-username">@${p.author_name || 'user'}</span>
          <span class="post-time">${timeAgo(p.created_at)}</span>
        </div>
      </div>
      <div class="post-body">${p.content || ''}</div>
      ${p.media_urls?.length ? `<img src="${p.media_urls[0]}" class="post-media-img" alt="">` : ''}
      <div class="post-actions">
        <button class="post-action-btn" onclick="handleApiLike('${p.id}', this)">
          <span>❤️</span> <span id="likeCount_${p.id}">${p.likes_count || 0}</span>
        </button>
        <button class="post-action-btn"><span>💬</span> ${p.comments_count || 0}</button>
        <button class="post-action-btn"><span>🔁</span> ${p.shares_count || 0}</button>
      </div>
    </div>`;
}

async function handleApiLike(postId, btn) {
    try {
        const res = await apiLikePost(postId);
        const countEl = document.getElementById(`likeCount_${postId}`);
        if (countEl && res) countEl.textContent = res.likes_count;
        btn.style.color = res?.liked ? '#ec4899' : '';
    } catch (e) { showToast('❌ ' + e.message); }
}

function timeAgo(iso) {
    if (!iso) return '';
    const diff = (Date.now() - new Date(iso)) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

// ═══════════════════════════════════════════════════════════════════
// ── Extended API — v4.0.0 additions ───────────────────────────────
// ═══════════════════════════════════════════════════════════════════

// ── Posts (extended) ─────────────────────────────────────────────
async function apiGetPost(postId) { return apiCall('GET', `/posts/${postId}`); }
async function apiGetComments(postId) { return apiCall('GET', `/posts/${postId}/comments`); }
async function apiGetHashtagFeed(tag, page = 1) { return apiCall('GET', `/posts/hashtag/${encodeURIComponent(tag)}?page=${page}`); }

// ── Users (extended) ─────────────────────────────────────────────
async function apiUpdateProfile({ displayName, bio, avatarUrl, coverUrl } = {}) {
    const body = {};
    if (displayName !== undefined) body.display_name = displayName;
    if (bio !== undefined) body.bio = bio;
    if (avatarUrl !== undefined) body.avatar_url = avatarUrl;
    if (coverUrl !== undefined) body.cover_url = coverUrl;
    return apiCall('PATCH', '/users/me', body);
}
async function apiGetUserPosts(username, page = 1) { return apiCall('GET', `/users/${username}/posts?page=${page}`); }

// ── Unified Search ───────────────────────────────────────────────
/**
 * Unified search across users, posts, and hashtags.
 * @param {string} q - search query
 * @param {'all'|'users'|'posts'|'hashtags'} category
 * @param {number} page
 */
async function apiSearch(q, category = 'all', page = 1) {
    return apiCall('GET', `/search?q=${encodeURIComponent(q)}&category=${category}&page=${page}`);
}

// ── Stories ──────────────────────────────────────────────────────
async function apiCreateStory({ content = '', mediaUrl = '', bgColor = '#1a1a2e', storyType = 'text' } = {}) {
    return apiCall('POST', '/stories', { content, media_url: mediaUrl, bg_color: bgColor, story_type: storyType });
}
async function apiGetStories() { return apiCall('GET', '/stories'); }
async function apiGetMyStories() { return apiCall('GET', '/stories/mine'); }
async function apiViewStory(storyId) { return apiCall('POST', `/stories/${storyId}/view`); }
async function apiDeleteStory(storyId) { return apiCall('DELETE', `/stories/${storyId}`); }

// ── Notifications ────────────────────────────────────────────────
async function apiGetNotifications({ unreadOnly = false, page = 1 } = {}) {
    return apiCall('GET', `/notifications?unread_only=${unreadOnly}&page=${page}`);
}
async function apiUnreadCount() { return apiCall('GET', '/notifications/unread-count'); }
async function apiMarkNotifRead(notifId) { return apiCall('POST', `/notifications/${notifId}/read`); }
async function apiMarkAllNotifsRead() { return apiCall('POST', '/notifications/read-all'); }
async function apiDeleteNotif(notifId) { return apiCall('DELETE', `/notifications/${notifId}`); }

// ── Messages (extended) ──────────────────────────────────────────
async function apiGetConversations() { return apiCall('GET', '/messages/conversations/list'); }
async function apiMarkMessagesRead(convoId) { return apiCall('POST', `/messages/${convoId}/read`); }

// ── Sphera Pay (extended) ────────────────────────────────────────
async function apiGetTransactions(page = 1) { return apiCall('GET', `/pay/transactions?page=${page}`); }

// ── Password Reset ───────────────────────────────────────────────
async function apiForgotPassword(email) { return apiCall('POST', '/auth/forgot-password', { email }); }
async function apiResetPassword(token, newPassword) { return apiCall('POST', '/auth/reset-password', { token, new_password: newPassword }); }
async function apiResendVerification() { return apiCall('POST', '/auth/resend-verification'); }

// ── Uploads ──────────────────────────────────────────────────────
/**
 * Upload a file to the backend.
 * @param {File} file - browser File object
 * @param {'post'|'avatar'|'cover'|'reel'} purpose
 * @returns {Promise<{url: string, filename: string, size_bytes: number}>}
 */
async function apiUpload(file, purpose = 'post') {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('purpose', purpose);
    return apiCall('POST', '/upload', fd, true);
}

// ── Admin ────────────────────────────────────────────────────────
const AdminAPI = {
    stats: () => apiCall('GET', '/admin/stats'),
    users: (page = 1, q = '') => apiCall('GET', `/admin/users?page=${page}&q=${encodeURIComponent(q)}`),
    getUser: (id) => apiCall('GET', `/admin/users/${id}`),
    updateUser: (id, patch) => apiCall('PATCH', `/admin/users/${id}`, patch),
    deleteUser: (id) => apiCall('DELETE', `/admin/users/${id}`),
    posts: (page = 1, q = '', type = '') => apiCall('GET', `/admin/posts?page=${page}&q=${encodeURIComponent(q)}&post_type=${type}`),
    deletePost: (id) => apiCall('DELETE', `/admin/posts/${id}`),
    broadcast: (message, recipientIds = [], notifType = 'system') =>
        apiCall('POST', '/admin/broadcast', { recipient_ids: recipientIds, message, notif_type: notifType }),
};

// ── Extended WebSocket event handling ────────────────────────────
/**
 * Extend the existing handleWsEvent to cover new event types.
 * Replaces the original handleWsEvent function.
 */
function handleWsEvent(evt) {
    switch (evt.event) {
        case 'notification':
            incrementBellBadge();
            if (evt.type === 'like') showToast(`❤️ ${evt.actor} liked your post`);
            if (evt.type === 'comment') showToast(`💬 ${evt.actor} commented: ${evt.message?.slice(0, 60)}`);
            if (evt.type === 'follow') showToast(`👤 ${evt.actor} started following you`);
            if (evt.type === 'match') showToast(`💘 You matched with ${evt.actor}!`);
            if (evt.type === 'system') showToast(`📢 ${evt.message}`);
            // Fire custom event so page handlers can update their UI
            document.dispatchEvent(new CustomEvent('sphera:notification', { detail: evt }));
            break;

        case 'linkedup_match':
            showToast(`💘 It's a Match! You matched with ${evt.matched_with}`);
            document.dispatchEvent(new CustomEvent('sphera:match', { detail: evt }));
            break;

        case 'new_message':
            incrementBellBadge();
            showToast(`💬 ${evt.sender}: ${evt.content?.slice(0, 60)}`);
            document.dispatchEvent(new CustomEvent('sphera:message', { detail: evt }));
            break;

        case 'story_created':
            // A contact posted a new story — show a subtle badge
            document.dispatchEvent(new CustomEvent('sphera:story', { detail: evt }));
            break;

        case 'presence':
            // Online/offline status — update avatar dots
            document.dispatchEvent(new CustomEvent('sphera:presence', { detail: evt }));
            break;

        case 'pong':
            // Server replied to our ping — connection is alive
            break;

        default:
            console.debug('[SPHERA WS] Unknown event:', evt.event);
    }
}

// ── Notification bell init ────────────────────────────────────────
async function refreshNotifBadge() {
    try {
        const data = await apiUnreadCount();
        const badge = document.getElementById('notifBadge');
        if (!badge || !data) return;
        const count = data.unread || 0;
        badge.textContent = count > 99 ? '99+' : count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    } catch { /* silent */ }
}

// ── Stories renderer ─────────────────────────────────────────────
function renderStory(s) {
    const expires = new Date(s.expires_at);
    const pct = Math.max(0, Math.min(100, ((expires - Date.now()) / (24 * 3600 * 1000)) * 100));
    return `
    <div class="story-bubble" onclick="handleViewStory(${s.id})" title="${s.author_name}'s story">
      <div class="story-ring" style="--pct:${pct.toFixed(0)}%">
        <div class="story-avatar" style="background:${s.bg_color || '#1a1a2e'}">
          ${s.media_url
            ? `<img src="${s.media_url}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`
            : `<span style="font-size:1.2rem">${(s.author_name || 'U')[0].toUpperCase()}</span>`}
        </div>
      </div>
      <span class="story-name">@${s.author_name}</span>
    </div>`;
}

async function handleViewStory(storyId) {
    try { await apiViewStory(storyId); } catch { /* best-effort */ }
    document.dispatchEvent(new CustomEvent('sphera:viewStory', { detail: { storyId } }));
}

// ── Search helper ─────────────────────────────────────────────────
async function spheraSearch(q, category = 'all') {
    if (!q?.trim()) return { users: [], posts: [] };
    return apiSearch(q.trim(), category);
}

// ── Profile update helper ────────────────────────────────────────
async function spheraUpdateProfile(fields) {
    try {
        const updated = await apiUpdateProfile(fields);
        if (updated) {
            Auth.setUser({ ...Auth.getUser(), ...updated });
            showToast('✅ Profile updated!');
        }
        return updated;
    } catch (e) {
        showToast('❌ ' + e.message);
        return null;
    }
}

// ── Export public surface (for module bundler compatibility) ──────
if (typeof module !== 'undefined') {
    module.exports = {
        Auth, apiCall,
        spheraRegister, spheraLogin, spheraLogout, spheraLoadMe, spheraInitAuth,
        apiFeed, apiExploreFeed, apiReels, apiCreatePost, apiLikePost, apiComment,
        apiGetPost, apiGetComments, apiGetHashtagFeed,
        apiGetProfile, apiFollow, apiGetUserPosts, apiUpdateProfile,
        apiSearch, spheraSearch,
        apiCreateStory, apiGetStories, apiGetMyStories, apiViewStory, apiDeleteStory,
        apiGetNotifications, apiUnreadCount, apiMarkNotifRead, apiMarkAllNotifsRead, apiDeleteNotif,
        apiGetConversations, apiMarkMessagesRead, apiStartConvo, apiGetMessages, apiSendMessage,
        apiGetWallet, apiTopUp, apiSendMoney, apiGetTransactions,
        apiForgotPassword, apiResetPassword, apiResendVerification,
        apiUpload,
        AdminAPI,
        connectWebSocket, handleWsEvent,
        renderApiPost, renderStory, timeAgo,
        refreshNotifBadge, spheraUpdateProfile,
    };
}

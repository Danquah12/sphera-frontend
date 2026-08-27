/**
 * SPHERA Profile Pages
 * Private profile page for every user — Facebook/Instagram/LinkedIn style.
 * Slide-in full-screen panel with: cover, avatar, bio, stats, posts grid, edit.
 */

let _currentProfileUser = null;   // username currently shown
let _profilePostsPage = 1;

// ── Open a profile ────────────────────────────────────────────────────────────
async function openProfile(username) {
    /* Called from anywhere — avatar click, username click, @mention, etc. */
    const panel = document.getElementById('spheraProfilePanel');
    if (!panel) return;
    _profilePostsPage = 1;

    // Show skeleton while loading
    panel.classList.add('profile-open');
    document.body.style.overflow = 'hidden';
    document.getElementById('profileContent').innerHTML = renderProfileSkeleton();

    try {
        const me = Auth.getUser();
        const data = await apiGetProfile(username);   // GET /api/v1/users/{username}
        _currentProfileUser = data;
        document.getElementById('profileContent').innerHTML = renderProfileHTML(data, me);
        loadProfilePosts(username);
    } catch (e) {
        document.getElementById('profileContent').innerHTML =
            `<div style="padding:80px;text-align:center;color:var(--text2)">
              <div style="font-size:48px">😕</div>
              <p style="font-size:18px;margin-top:12px">Profile not found</p>
             </div>`;
    }
}

function closeProfile() {
    const panel = document.getElementById('spheraProfilePanel');
    if (panel) panel.classList.remove('profile-open');
    document.body.style.overflow = '';
    _currentProfileUser = null;
}

// ── Render full profile HTML ──────────────────────────────────────────────────
function renderProfileHTML(u, me) {
    const isOwn = me && me.username === u.username;
    const isMobile = window.innerWidth < 768;

    const avatarInitial = (u.display_name || u.username || '?')[0].toUpperCase();
    const avatarGrad = `linear-gradient(135deg,${stringToColor(u.username)},${stringToColor(u.username + '2')})`;
    const followersCount = u.followers_count ?? 0;
    const followingCount = u.following_count ?? 0;
    const postsCount = u.posts_count ?? 0;
    const isVerified = u.is_verified ? '<span class="profile-verified">✦</span>' : '';
    const followBtnHTML = isOwn
        ? `<button class="profile-edit-btn" onclick="openEditProfile()">✏️ Edit Profile</button>`
        : `<button class="profile-follow-btn ${u.is_following ? 'following' : ''}"
                   id="profileFollowBtn"
                   onclick="handleProfileFollow('${u.username}')">
             ${u.is_following ? 'Following ▾' : '+ Follow'}
           </button>`;
    const messageBtnHTML = isOwn ? '' :
        `<button class="profile-msg-btn" onclick="openProfileMessage('${u.username}')">💬 Message</button>`;

    return `
    <div class="profile-cover-wrap">
      <div class="profile-cover" style="background:${u.cover_url
            ? `url(${u.cover_url}) center/cover`
            : `linear-gradient(135deg,${stringToColor(u.username + '_cover')},#1a0a2e)`}">
        <div class="profile-cover-overlay"></div>
      </div>
      ${isOwn ? `<button class="profile-cover-edit-btn" onclick="document.getElementById('coverInput').click()">🖼 Change Cover</button>
                 <input type="file" id="coverInput" accept="image/*" style="display:none" onchange="handleCoverUpload(this)">` : ''}
    </div>

    <div class="profile-avatar-row">
      <div class="profile-avatar-wrap">
        <div class="profile-avatar" style="background:${u.avatar_url ? 'none' : avatarGrad}">
          ${u.avatar_url ? `<img src="${u.avatar_url}" style="width:100%;height:100%;border-radius:50%;object-fit:cover">` : avatarInitial}
        </div>
        ${isOwn ? `<button class="profile-avatar-edit" onclick="document.getElementById('avatarInput').click()" title="Change photo">📷</button>
                   <input type="file" id="avatarInput" accept="image/*" style="display:none" onchange="handleAvatarUpload(this)">` : ''}
      </div>
      <div class="profile-action-btns">
        ${followBtnHTML}
        ${messageBtnHTML}
      </div>
    </div>

    <div class="profile-info">
      <h2 class="profile-display-name">${escHtml(u.display_name || u.username)}${isVerified}</h2>
      <p class="profile-username">@${escHtml(u.username)}</p>
      ${u.bio ? `<p class="profile-bio">${escHtml(u.bio)}</p>` : (isOwn ? `<p class="profile-bio-empty" onclick="openEditProfile()">+ Add a bio…</p>` : '')}
      <div class="profile-meta-row">
        ${u.location ? `<span>📍 ${escHtml(u.location)}</span>` : ''}
        ${u.website ? `<span>🔗 <a href="${escHtml(u.website)}" target="_blank">${escHtml(u.website.replace(/https?:\/\//, ''))}</a></span>` : ''}
        <span>📅 Joined ${joinedDate(u.created_at)}</span>
      </div>
      <div class="profile-stats-row">
        <div class="profile-stat" onclick="openFollowList('${u.username}','following')">
          <span class="profile-stat-num">${fmtCount(followingCount)}</span>
          <span class="profile-stat-label">Following</span>
        </div>
        <div class="profile-stat" onclick="openFollowList('${u.username}','followers')">
          <span class="profile-stat-num">${fmtCount(followersCount)}</span>
          <span class="profile-stat-label">Followers</span>
        </div>
        <div class="profile-stat">
          <span class="profile-stat-num">${fmtCount(postsCount)}</span>
          <span class="profile-stat-label">Posts</span>
        </div>
      </div>
    </div>

    <!-- Profile Tabs -->
    <div class="profile-tabs" id="profileTabs">
      <button class="profile-tab active-profile-tab" onclick="switchProfileTab('posts', this)">Posts</button>
      <button class="profile-tab" onclick="switchProfileTab('reels', this)">Reels</button>
      <button class="profile-tab" onclick="switchProfileTab('media', this)">Media</button>
      ${isOwn ? '<button class="profile-tab" onclick="switchProfileTab(\'liked\', this)">Liked</button>' : ''}
    </div>
    <div id="profilePostsGrid" class="profile-posts-grid"></div>
    `;
}

// ── Skeleton loader ───────────────────────────────────────────────────────────
function renderProfileSkeleton() {
    return `
    <div class="profile-cover-wrap"><div class="profile-cover skeleton-shimmer"></div></div>
    <div class="profile-avatar-row">
      <div class="profile-avatar-wrap"><div class="profile-avatar skeleton-shimmer" style="border-radius:50%"></div></div>
    </div>
    <div class="profile-info">
      <div class="skeleton-line" style="width:180px;height:24px;border-radius:8px;margin-bottom:8px"></div>
      <div class="skeleton-line" style="width:120px;height:16px;border-radius:8px;margin-bottom:16px"></div>
      <div class="skeleton-line" style="width:100%;height:14px;border-radius:8px;margin-bottom:8px"></div>
    </div>`;
}

// ── Load profile posts ────────────────────────────────────────────────────────
async function loadProfilePosts(username, tab = 'posts') {
    const grid = document.getElementById('profilePostsGrid');
    if (!grid) return;
    grid.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text2)">Loading…</div>';
    try {
        const data = await apiCall('GET', `/users/${username}/posts?page=${_profilePostsPage}`);
        const posts = data?.posts || [];
        if (posts.length === 0) {
            grid.innerHTML = `<div class="profile-empty-posts">
              <div style="font-size:48px">📭</div>
              <p>No posts yet</p>
            </div>`;
            return;
        }
        grid.innerHTML = posts.map(p => renderProfilePost(p)).join('');
    } catch (e) {
        // Fallback — empty grid
        grid.innerHTML = `<div class="profile-empty-posts"><div style="font-size:48px">📸</div><p>Posts will appear here</p></div>`;
    }
}

function renderProfilePost(p) {
    const thumb = p.media_urls?.[0];
    if (thumb) {
        return `<div class="profile-post-tile" onclick='openPost("${p.id}")'>
          <img src="${thumb}" alt="">
          <div class="profile-post-tile-overlay">
            <span>❤️ ${fmtCount(p.likes_count || 0)}</span>
            <span>💬 ${fmtCount(p.comments_count || 0)}</span>
          </div>
        </div>`;
    }
    return `<div class="profile-post-tile profile-post-text-tile" onclick='openPost("${p.id}")'>
      <p>${escHtml((p.content || '').slice(0, 80))}${(p.content || '').length > 80 ? '…' : ''}</p>
      <span class="profile-post-tile-meta">❤️ ${fmtCount(p.likes_count || 0)}</span>
    </div>`;
}

function switchProfileTab(tab, btn) {
    document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active-profile-tab'));
    btn.classList.add('active-profile-tab');
    if (_currentProfileUser) loadProfilePosts(_currentProfileUser.username, tab);
}

// ── Follow / Unfollow ─────────────────────────────────────────────────────────
async function handleProfileFollow(username) {
    const btn = document.getElementById('profileFollowBtn');
    if (!btn) return;
    const isFollowing = btn.classList.contains('following');
    btn.disabled = true;
    try {
        await apiFollow(username);   // backend toggles follow
        btn.classList.toggle('following', !isFollowing);
        btn.textContent = isFollowing ? '+ Follow' : 'Following ▾';
        showToast(isFollowing ? `Unfollowed @${username}` : `Now following @${username} 🎉`);
        // Update follower count
        const countEl = document.querySelector('.profile-stat-num');
        // reload stats
    } catch (e) {
        showToast('❌ ' + e.message);
    } finally { btn.disabled = false; }
}

// ── Edit Profile Modal ────────────────────────────────────────────────────────
function openEditProfile() {
    const u = Auth.getUser();
    if (!u) return;
    const modal = document.getElementById('editProfileModal');
    if (!modal) return;
    // Pre-fill fields
    document.getElementById('epName').value = u.display_name || '';
    document.getElementById('epBio').value = u.bio || '';
    document.getElementById('epLocation').value = u.location || '';
    document.getElementById('epWebsite').value = u.website || '';
    modal.classList.add('ep-open');
}

function closeEditProfile() {
    document.getElementById('editProfileModal')?.classList.remove('ep-open');
}

async function saveEditProfile() {
    const btn = document.querySelector('.ep-save-btn');
    btn.disabled = true;
    btn.innerHTML = '<span class="sphera-spinner"></span> Saving…';
    const body = {
        display_name: document.getElementById('epName').value.trim(),
        bio: document.getElementById('epBio').value.trim(),
        location: document.getElementById('epLocation').value.trim(),
        website: document.getElementById('epWebsite').value.trim(),
    };
    try {
        const updated = await apiCall('PATCH', '/users/me', body);
        Auth.setUser(updated);
        closeEditProfile();
        showToast('✅ Profile updated!');
        // Re-render profile if still open
        if (_currentProfileUser) openProfile(updated.username);
    } catch (e) {
        showToast('❌ ' + e.message);
    } finally {
        btn.disabled = false; btn.innerHTML = 'Save Changes';
    }
}

// ── Direct message from profile ───────────────────────────────────────────────
async function openProfileMessage(username) {
    try {
        await apiStartConvo(username);
        closeProfile();
        // Open messages panel
        const msgTab = document.querySelector('[data-tab="messages"]') ||
            document.querySelector('.nav-item[onclick*=messages]');
        if (msgTab) msgTab.click();
        showToast(`💬 Conversation with @${username} opened`);
    } catch (e) {
        showToast('❌ ' + e.message);
    }
}

// ── Mini profile card on hover ────────────────────────────────────────────────
let _hoverTimer;
function showProfileHover(username, anchorEl) {
    clearTimeout(_hoverTimer);
    _hoverTimer = setTimeout(async () => {
        try {
            const u = await apiGetProfile(username);
            const card = document.getElementById('profileHoverCard');
            if (!card) return;
            card.innerHTML = renderHoverCard(u);
            const rect = anchorEl.getBoundingClientRect();
            card.style.top = (rect.bottom + window.scrollY + 8) + 'px';
            card.style.left = Math.min(rect.left, window.innerWidth - 280) + 'px';
            card.style.display = 'block';
        } catch { }
    }, 500);
}

function hideProfileHover() {
    clearTimeout(_hoverTimer);
    const card = document.getElementById('profileHoverCard');
    if (card) card.style.display = 'none';
}

function renderHoverCard(u) {
    const me = Auth.getUser();
    const isOwn = me && me.username === u.username;
    const avatarInitial = (u.display_name || u.username || '?')[0].toUpperCase();
    return `
    <div style="display:flex;gap:12px;align-items:flex-start;margin-bottom:12px">
      <div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,${stringToColor(u.username)},${stringToColor(u.username + '2')});display:flex;align-items:center;justify-content:center;font-weight:700;font-size:18px;cursor:pointer"
           onclick="openProfile('${u.username}')">${avatarInitial}</div>
      <div>
        <div style="font-weight:700;font-size:14px">${escHtml(u.display_name || u.username)}</div>
        <div style="color:var(--text2);font-size:12px">@${escHtml(u.username)}</div>
      </div>
    </div>
    ${u.bio ? `<p style="font-size:13px;color:var(--text2);margin-bottom:12px">${escHtml(u.bio)}</p>` : ''}
    <div style="display:flex;gap:16px;margin-bottom:12px">
      <div style="text-align:center"><div style="font-weight:700">${fmtCount(u.followers_count || 0)}</div><div style="font-size:11px;color:var(--text2)">Followers</div></div>
      <div style="text-align:center"><div style="font-weight:700">${fmtCount(u.following_count || 0)}</div><div style="font-size:11px;color:var(--text2)">Following</div></div>
    </div>
    ${!isOwn ? `<button onclick="handleHoverFollow('${u.username}', this)" style="width:100%;background:linear-gradient(135deg,#7c3aed,#ec4899);border:none;border-radius:10px;padding:8px;color:#fff;font-weight:600;cursor:pointer">
      ${u.is_following ? 'Following' : '+ Follow'}
    </button>` : ''}`;
}

async function handleHoverFollow(username, btn) {
    try {
        await apiFollow(username);
        btn.textContent = btn.textContent.includes('+') ? 'Following' : '+ Follow';
    } catch (e) { showToast('❌ ' + e.message); }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function escHtml(s) {
    if (!s) return '';
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function stringToColor(str) {
    let hash = 0;
    for (let c of str) hash = c.charCodeAt(0) + ((hash << 5) - hash);
    const h = Math.abs(hash) % 360;
    return `hsl(${h},65%,45%)`;
}

function joinedDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function fmtCount(n) {
    n = Number(n) || 0;
    if (n >= 1e6) return (n / 1e6).toFixed(1).replace('.0', '') + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1).replace('.0', '') + 'K';
    return n.toString();
}

// ── Keyboard close ────────────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeProfile(); closeEditProfile(); }
});

// ── Make all usernames clickable (called after feed renders) ──────────────────
function wireProfileLinks() {
    document.querySelectorAll('[data-username]:not([data-profile-wired])').forEach(el => {
        el.setAttribute('data-profile-wired', '1');
        el.style.cursor = 'pointer';
        el.addEventListener('click', function (e) {
            e.stopPropagation();
            openProfile(this.dataset.username);
        });
        el.addEventListener('mouseenter', function () {
            showProfileHover(this.dataset.username, this);
        });
        el.addEventListener('mouseleave', hideProfileHover);
    });
}

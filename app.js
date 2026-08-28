/* ═══════════════════════════════════════════════════════════════
   SPHERA — app.js v45
   Core application logic: navigation, modals, content, interactions
   ═══════════════════════════════════════════════════════════════ */

// ── Global State ──────────────────────────────────────────────
let currentView = 'feed';
let copilotOpen = false;

// ── Toast Notification ────────────────────────────────────────
function showToast(msg, duration = 3000) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    Object.assign(container.style, {
      position:'fixed',bottom:'24px',left:'50%',transform:'translateX(-50%)',
      zIndex:'99999',display:'flex',flexDirection:'column',alignItems:'center',gap:'8px'
    });
    document.body.appendChild(container);
  }
  const t = document.createElement('div');
  Object.assign(t.style, {
    background:'rgba(15,15,30,0.95)',color:'#fff',padding:'12px 24px',borderRadius:'12px',
    fontSize:'13px',fontWeight:'600',border:'1px solid rgba(124,58,237,0.4)',
    backdropFilter:'blur(20px)',boxShadow:'0 8px 32px rgba(0,0,0,0.4)',
    animation:'toastIn .3s ease',fontFamily:'Outfit,sans-serif',maxWidth:'400px',textAlign:'center'
  });
  t.textContent = msg;
  container.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; setTimeout(() => t.remove(), 300); }, duration);
}

// ── Page Navigation ───────────────────────────────────────────
const VIEW_TO_PAGE = {
  feed:'pageFeed', reels:'pageReels', groups:'pageGroups', events:'pageEvents',
  marketplace:'pageMarketplace', careerorbit:'pageCareerorbit', network:'pageNetwork',
  elevate:'pageElevate', nexus:'pageNexus', watch:'pageWatch', discover:'pageDiscover',
  messages:'pageMessages', pulse:'pagePulse', timecapsule:'pageTimecapsule',
  videostudio:'pageVideostudio', linkedup:'pageLinkedup', stories:'pageStories',
  live:'pageLive', spaces:'pageSpaces', creatorstudio:'pageCreatorstudio',
  spherapay:'pageSpherapay', local:'pageLocal', bookclub:'pageBookclub',
  recipehub:'pageRecipehub', fitness:'pageFitness', aimatch:'pageAimatch',
  ainews:'pageAinews', profile:'pageProfile', creator:'pageCreatorstudio',
  chat:'pageMessages', notifications:'pageNotifications'
};

function showPage(view) {
  if (!view) return;
  currentView = view;
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active-page'));
  // Show target
  const pageId = VIEW_TO_PAGE[view] || ('page' + view.charAt(0).toUpperCase() + view.slice(1));
  const page = document.getElementById(pageId);
  if (page) {
    page.classList.add('active-page');
  } else {
    // Fallback: show feed
    const feed = document.getElementById('pageFeed');
    if (feed) feed.classList.add('active-page');
    console.warn('[SPHERA] Page not found:', pageId);
  }
  // Update sidebar active state
  document.querySelectorAll('.lnav').forEach(btn => {
    btn.classList.toggle('active-lnav', btn.dataset.view === view);
  });
  // Update mobile nav
  document.querySelectorAll('.mob-nav-item').forEach(b => b.classList.remove('active'));
  // Close mobile sidebar if open
  closeMobileSidebar();
  // Scroll to top
  const main = document.getElementById('mainContent');
  if (main) main.scrollTop = 0;
  // Run page-specific init
  if (view === 'reels') initReelsPage();
  if (view === 'nexus') initNexusPage();
  if (view === 'messages') initMessagesPage();
  if (view === 'discover') initDiscoverPage();
  if (view === 'network') initNetworkPage();
  if (view === 'events') initEventsPage();
  if (view === 'groups') initGroupsPage();
  if (view === 'watch') initWatchPage();
  if (view === 'pulse') initPulsePage();
  if (view === 'marketplace') initMarketplacePage();
  if (view === 'elevate') initElevatePage();
}

function setView(view) { showPage(view); }

function setMobActive(id) {
  document.querySelectorAll('.mob-nav-item').forEach(b => b.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

// ── Sidebar Navigation Wiring ─────────────────────────────────
function initSidebarNav() {
  document.querySelectorAll('.lnav[data-view]').forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      if (view) showPage(view);
    });
  });
}

// ── Mobile Sidebar ────────────────────────────────────────────
function toggleMobileSidebar() {
  const sidebar = document.getElementById('leftSidebar');
  const backdrop = document.getElementById('sidebarBackdrop');
  if (!sidebar) return;
  sidebar.classList.toggle('open');
  if (backdrop) backdrop.classList.toggle('show');
}
function closeMobileSidebar() {
  const sidebar = document.getElementById('leftSidebar');
  const backdrop = document.getElementById('sidebarBackdrop');
  if (sidebar) sidebar.classList.remove('open');
  if (backdrop) backdrop.classList.remove('show');
}

// ── Desktop Sidebar Toggle ────────────────────────────────────
function initSidebarToggle() {
  const toggle = document.getElementById('sidebarToggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const shell = document.getElementById('appShell');
      if (shell) shell.classList.toggle('sidebar-collapsed');
    });
  }
}

// ── Profile ───────────────────────────────────────────────────
function openOwnProfile() { showPage('profile'); initProfilePage(); }
function closeProfile() { showPage('feed'); }
function openEditProfile() { toggleModal('editProfileModal', true); }
function closeEditProfile() { toggleModal('editProfileModal', false); }
function saveEditProfile() { showToast('✅ Profile saved!'); closeEditProfile(); }
function openProfileAnalytics() { showToast('📊 Opening profile analytics...'); }
function exportProfilePDF() { showToast('📄 Exporting profile as PDF...'); }
function initProfilePage() { /* Profile content already in HTML */ }

// ── Me Menu ───────────────────────────────────────────────────
function toggleMeMenu() {
  const dd = document.getElementById('meDropdown');
  if (dd) dd.classList.toggle('show');
}
function closeMeMenu() {
  const dd = document.getElementById('meDropdown');
  if (dd) dd.classList.remove('show');
}
function updateMeMenu(user) {
  if (!user) return;
  const nameEl = document.getElementById('meCardName');
  const unEl = document.getElementById('meCardUsername');
  const avEl = document.getElementById('meAvatarEl');
  const cardAv = document.getElementById('meCardAvatar');
  if (nameEl) nameEl.textContent = user.display_name || user.username || 'User';
  if (unEl) unEl.textContent = '@' + (user.username || 'user');
  const initial = (user.display_name || user.username || 'U')[0].toUpperCase();
  if (avEl) avEl.textContent = initial;
  if (cardAv) cardAv.textContent = initial;
}

// ── Auth / Sign Out ───────────────────────────────────────────
function handleSignOut() { if (typeof spheraLogout === 'function') spheraLogout(); else { showToast('Signing out...'); setTimeout(() => location.reload(), 800); } }
function handleLogin() { showToast('🔐 Logging in...'); }
function handleRegister() { showToast('📝 Registering...'); }
function handleGuestLogin() { showToast('👋 Entering as guest...'); if (typeof spheraInitAuth === 'function') spheraInitAuth(); }
function handleForgotPassword() { showToast('📧 Password reset link sent!'); }
function handleResetPassword() { showToast('🔑 Password reset successfully!'); }
function showForgotPassword() { showToast('📧 Check your email for reset instructions'); }
function showResetPassword() { showToast('Enter your new password'); }
function switchAuthTab(tab) { showToast('Switching to ' + tab); }
function hideAuthModal() { const m = document.getElementById('spheraAuthOverlay'); if (m) m.style.display = 'none'; }

// ── Notifications ─────────────────────────────────────────────
function openNotifPanel() {
  const panel = document.getElementById('notifPanel');
  if (panel) panel.classList.toggle('hidden');
}
function openSettings() { showToast('⚙️ Settings panel opening...'); }
function showHelp() { showToast('❓ Help Center — Coming soon!'); }

// ── Generic Modal Helper ──────────────────────────────────────
function toggleModal(id, show) {
  const el = document.getElementById(id);
  if (!el) return;
  if (show) { el.style.display = 'flex'; el.classList.remove('hidden'); }
  else { el.style.display = 'none'; el.classList.add('hidden'); }
}

// ── Launchpad ─────────────────────────────────────────────────
function openLaunchpad() {
  const lp = document.getElementById('launchpadOverlay');
  if (!lp) { showToast('⊞ Launchpad — All Apps'); return; }
  lp.classList.add('lp-open');
  // Mark current active tile
  lp.querySelectorAll('.lp-tile').forEach(t => t.classList.remove('lp-tile-active'));
  const active = lp.querySelector(`.lp-tile[data-view="${currentView}"]`);
  if (active) active.classList.add('lp-tile-active');
  // Focus search input
  const search = document.getElementById('lpSearch');
  if (search) { search.value = ''; search.focus(); filterLaunchpad(''); }
  document.getElementById('launchpadBtn')?.classList.add('lp-active');
}
function closeLaunchpad() {
  const lp = document.getElementById('launchpadOverlay');
  if (lp) lp.classList.remove('lp-open');
  document.getElementById('launchpadBtn')?.classList.remove('lp-active');
}
function filterLaunchpad(q) {
  const query = (q || '').toLowerCase().trim();
  const noRes = document.getElementById('lpNoResults');
  const qSpan = document.getElementById('lpSearchQuery');
  let found = 0;
  document.querySelectorAll('.lp-tile[data-label]').forEach(tile => {
    const label = (tile.dataset.label || '').toLowerCase();
    const match = !query || label.includes(query);
    tile.classList.toggle('lp-hidden', !match);
    if (match) found++;
  });
  if (noRes) noRes.style.display = (!query || found > 0) ? 'none' : 'block';
  if (qSpan) qSpan.textContent = q;
}
function lpGo(app) {
  closeLaunchpad();
  if (VIEW_TO_PAGE[app]) showPage(app);
  else showToast('Opening ' + app + '...');
}

// ── Create Post ───────────────────────────────────────────────
function initCreatePost() {
  const btn = document.getElementById('createPostBtn');
  if (btn) btn.addEventListener('click', () => showToast('✏️ Create post — coming soon!'));
}
function submitPost() { showToast('📤 Post published!'); }

// ── Copilot ───────────────────────────────────────────────────
function toggleCopilot() {
  copilotOpen = !copilotOpen;
  const panel = document.getElementById('copilotPanel');
  if (panel) panel.classList.toggle('show', copilotOpen);
  else showToast('🤖 Orbit Copilot — Your AI Career Partner');
}
function sendCopilot() { showToast('🤖 Copilot is thinking...'); }
function copilotQuick(action) { showToast('🤖 ' + action); }

// ── Stories ───────────────────────────────────────────────────
function initStories() {
  document.querySelectorAll('.story-card').forEach(card => {
    card.addEventListener('click', () => showToast('📸 Opening story...'));
  });
  const addBtn = document.getElementById('addStoryBtn');
  if (addBtn) addBtn.addEventListener('click', () => showToast('📸 Create a story'));
}
function scCreateStory() { showToast('📸 Creating story...'); }

// ── Category Pills ────────────────────────────────────────────
function initCategoryPills() {
  document.querySelectorAll('.cat-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active-pill'));
      pill.classList.add('active-pill');
      showToast('📂 Filtering: ' + pill.textContent);
    });
  });
}

// ── Feed Content Grid ─────────────────────────────────────────
function initContentGrid() {
  const grid = document.getElementById('contentGrid');
  if (!grid || grid.children.length > 0) return;

  const mockPosts = [
    { 
      user: 'Kwesi Asiedu', 
      handle: '@kwesi', 
      time: '2h ago', 
      verified: true,
      channel: 'Professional',
      content: 'Just passed my <span class="hashtag">#OSCP</span> certification! 🎉 The 24-hour exam was intense but worth every minute. Big thanks to the SPHERA community for the resources and study groups.', 
      likes: 847, 
      comments: 124, 
      shares: 48,
      color: '#7c3aed,#ec4899' 
    },
    { 
      user: 'Alex Rivera', 
      handle: '@alexr', 
      time: '4h ago', 
      verified: true,
      channel: 'Tech & Architecture',
      content: 'New deep-dive breakdown: <strong>"Zero Trust Architecture in Practice"</strong> — 5 lessons learned from implementing ZTA across multi-cloud environments. <br/><br/>Key takeaway: Identity is the new perimeter. <span class="hashtag">#ZeroTrust</span> <span class="hashtag">#CloudSecurity</span> <span class="hashtag">#DevSecOps</span>', 
      likes: 392, 
      comments: 67, 
      shares: 31,
      color: '#0ea5e9,#6d28d9' 
    },
    { 
      user: 'Jordan Chen', 
      handle: '@jordanc', 
      time: '6h ago', 
      verified: true,
      channel: 'Career Update',
      content: 'Excited to announce I\'m joining CrowdStrike as a Senior Threat Intelligence Analyst! 🚀 Huge shoutout to the <span class="hashtag">#CareerOrbit</span> JD Match & Interview Forge tools for helping me prep.', 
      likes: 2103, 
      comments: 284, 
      shares: 112,
      color: '#10b981,#0ea5e9' 
    },
    { 
      user: 'Maya Patel', 
      handle: '@mayap', 
      time: '8h ago', 
      verified: false,
      channel: 'Cybersecurity',
      content: 'The global cybersecurity skills gap is real. We need to invest heavily in training the next generation of analysts and ethical hackers. What is your company doing to mentor junior talent? <span class="hashtag">#CyberSecurity</span> <span class="hashtag">#Mentorship</span>', 
      likes: 651, 
      comments: 93, 
      shares: 27,
      color: '#f59e0b,#ef4444' 
    },
    { 
      user: 'Riley Zhang', 
      handle: '@rileyz', 
      time: '12h ago', 
      verified: true,
      channel: 'Creative & Code',
      content: 'Built a custom SIEM visualization dashboard this weekend. Python + Elasticsearch + Grafana = 🔥 Live metrics, automated threat detection, and real-time alerts.', 
      likes: 528, 
      comments: 76, 
      shares: 54,
      color: '#ec4899,#f97316' 
    },
    { 
      user: 'Sam Torres', 
      handle: '@samt', 
      time: '1d ago', 
      verified: false,
      channel: 'Events & Network',
      content: 'Attending RSA Conference next week! Who else will be in San Francisco? Let\'s connect and grab coffee! 🤝 <span class="hashtag">#RSAC2026</span> <span class="hashtag">#Infosec</span>', 
      likes: 193, 
      comments: 41, 
      shares: 16,
      color: '#6d28d9,#0ea5e9' 
    },
  ];

  grid.innerHTML = mockPosts.map((p, i) => `
    <div class="content-card" style="animation:fadeInUp .35s ease ${i * 0.06}s both">
      <div class="cc-header">
        <div class="cc-avatar" style="background:linear-gradient(135deg,${p.color})">${p.user[0]}</div>
        <div class="cc-meta">
          <div class="cc-author-row">
            <span class="cc-name">${p.user}</span>
            ${p.verified ? '<span class="cc-badge-verified">✦ VERIFIED</span>' : ''}
            <span class="cc-channel-tag">${p.channel}</span>
          </div>
          <span class="cc-handle">${p.handle} · ${p.time}</span>
        </div>
        <button class="cc-more" onclick="showToast('Post options')">⋯</button>
      </div>
      <div class="cc-body">${p.content}</div>
      <div class="cc-actions">
        <button class="cc-action" onclick="togglePostLike(this, ${p.likes})">
          <span class="action-icon">🤍</span> <span class="action-count">${p.likes}</span>
        </button>
        <button class="cc-action" onclick="showToast('💬 Opening comments...')">
          <span class="action-icon">💬</span> <span>${p.comments}</span>
        </button>
        <button class="cc-action" onclick="togglePostRepost(this, ${p.shares})">
          <span class="action-icon">🔁</span> <span>${p.shares}</span>
        </button>
        <button class="cc-action" onclick="togglePostSave(this)">
          <span class="action-icon">🔖</span> <span>Save</span>
        </button>
      </div>
    </div>
  `).join('');
}

function togglePostLike(btn, baseCount) {
  const icon = btn.querySelector('.action-icon');
  const count = btn.querySelector('.action-count');
  const isLiked = btn.classList.toggle('liked');
  if (isLiked) {
    icon.textContent = '❤️';
    count.textContent = baseCount + 1;
    showToast('❤️ Sparked!');
  } else {
    icon.textContent = '🤍';
    count.textContent = baseCount;
  }
}

function togglePostRepost(btn, baseCount) {
  const isReposted = btn.classList.toggle('reposted');
  if (isReposted) {
    showToast('🔁 Amplified to your orbit!');
  }
}

function togglePostSave(btn) {
  const isSaved = btn.classList.toggle('saved');
  showToast(isSaved ? '🔖 Post saved to bookmarks!' : 'Removed from bookmarks');
}

function publishQuickPost() {
  const input = document.getElementById('quickPostInput');
  const val = input ? input.value.trim() : '';
  if (!val) {
    showToast('⚠️ Please write something before transmitting');
    return;
  }
  const grid = document.getElementById('contentGrid');
  if (grid) {
    const newPost = document.createElement('div');
    newPost.className = 'content-card';
    newPost.style.animation = 'fadeInUp .35s ease both';
    newPost.innerHTML = `
      <div class="cc-header">
        <div class="cc-avatar" style="background:linear-gradient(135deg,#7c3aed,#ec4899)">K</div>
        <div class="cc-meta">
          <div class="cc-author-row">
            <span class="cc-name">Kwesi Asiedu</span>
            <span class="cc-badge-verified">✦ YOU</span>
            <span class="cc-channel-tag">Professional</span>
          </div>
          <span class="cc-handle">@kwesi · Just now</span>
        </div>
        <button class="cc-more" onclick="showToast('Post options')">⋯</button>
      </div>
      <div class="cc-body">${val}</div>
      <div class="cc-actions">
        <button class="cc-action" onclick="togglePostLike(this, 1)">
          <span class="action-icon">🤍</span> <span class="action-count">1</span>
        </button>
        <button class="cc-action" onclick="showToast('💬 Comments')">
          <span class="action-icon">💬</span> <span>0</span>
        </button>
        <button class="cc-action" onclick="togglePostRepost(this, 0)">
          <span class="action-icon">🔁</span> <span>0</span>
        </button>
        <button class="cc-action" onclick="togglePostSave(this)">
          <span class="action-icon">🔖</span> <span>Save</span>
        </button>
      </div>
    `;
    grid.insertBefore(newPost, grid.firstChild);
  }
  if (input) input.value = '';
  showToast('📡 Transmitted live to SPHERA network!');
}

function quickAIEnhance() {
  const input = document.getElementById('quickPostInput');
  if (!input) return;
  const current = input.value.trim();
  if (!current) {
    input.value = 'Excited to share insights on modern zero-trust architecture and enterprise cloud defense. Key takeaway: continuous verification is essential. #CyberSecurity #ZeroTrust #InfoSec';
  } else {
    input.value = current + ' ✨ Enhanced with AI #CyberSecurity #ZeroTrust';
  }
  showToast('✦ Draft polished by Orbit Copilot');
}

// ── Marquee ───────────────────────────────────────────────────
function initMarquee() {
  const topics = ['#CyberSecurity','#ZeroTrust','#CloudSecurity','#OSCP','#ThreatIntel','#SIEM','#PenTest','#BlueTeam','#RedTeam','#CISSP','#DevSecOps','#AI_Security'];
  ['marqueeRow1','marqueeRow2'].forEach(id => {
    const row = document.getElementById(id);
    if (!row || row.children.length > 0) return;
    const html = topics.map(t => `<span class="marquee-item">${t}</span>`).join('');
    row.innerHTML = html + html;
  });
}

// ── Load More ─────────────────────────────────────────────────
function initLoadMore() {
  const btn = document.getElementById('loadMoreBtn');
  if (btn) btn.addEventListener('click', () => showToast('📜 Loading more posts...'));
}

// ── Right Sidebar Widgets ─────────────────────────────────────
function logMood(mood) { showToast('😊 Mood set to: ' + mood); }
function initRightSidebar() {
  // AI Match, Trending, Live Pulse are static HTML
}

// ── Nexus Page ────────────────────────────────────────────────
function initNexusPage() {
  // Wire up Nexus tab navigation
  document.querySelectorAll('.nx-navitem[data-nxtab]').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.nxtab;
      document.querySelectorAll('.nx-navitem').forEach(b => b.classList.remove('active-nxi'));
      btn.classList.add('active-nxi');
      document.querySelectorAll('.nx-tab-panel').forEach(p => p.classList.remove('active-nxp'));
      const panel = document.getElementById('nxPanel' + tab.charAt(0).toUpperCase() + tab.slice(1));
      if (panel) panel.classList.add('active-nxp');
    });
  });
  initNexusFeed();
}

function initNexusFeed() {
  const feed = document.getElementById('nxFeed');
  if (!feed || feed.children.length > 0) return;
  const posts = [
    { name:'Yaw Asiedu-Danquah', handle:'@yasiedudanquah', verified:true, time:'2h', text:'The convergence of AI and cybersecurity is creating unprecedented opportunities. Thread 🧵', sparks:284, echoes:47, amplifies:12 },
    { name:'CyberWatch Global', handle:'@cyberwatchhq', verified:true, time:'4h', text:'BREAKING: Major zero-day vulnerability discovered in widely-used enterprise VPN software. Patch immediately. CVE-2026-XXXX', sparks:1823, echoes:934, amplifies:412 },
    { name:'Sarah Mitchell', handle:'@sarahm_sec', verified:false, time:'6h', text:'Just completed my SANS SEC504 certification! The hands-on labs were incredible. Highly recommend for anyone in incident response. 🎓', sparks:647, echoes:89, amplifies:23 },
  ];
  feed.innerHTML = posts.map(p => `
    <div class="nx-post">
      <div class="nx-post-avatar">${p.name[0]}</div>
      <div class="nx-post-content">
        <div class="nx-post-header">
          <span class="nx-post-name">${p.name} ${p.verified ? '<span class="nx-verified">✦</span>' : ''}</span>
          <span class="nx-post-handle">${p.handle} · ${p.time}</span>
        </div>
        <div class="nx-post-text">${p.text}</div>
        <div class="nx-post-actions">
          <button class="nx-post-action" onclick="showToast('💬 Reply')">💬 ${p.echoes}</button>
          <button class="nx-post-action" onclick="showToast('🔁 Amplified!')">🔁 ${p.amplifies}</button>
          <button class="nx-post-action" onclick="showToast('💎 Sparked!')">💎 ${p.sparks}</button>
          <button class="nx-post-action" onclick="showToast('🔖 Bookmarked!')">🔖</button>
        </div>
      </div>
    </div>
  `).join('');
}

// ── Page Initializers (stubs for pages without dynamic content) ──
function initReelsPage() { /* Reels HTML is static + video upload */ }
function initMessagesPage() { /* SphereChat HTML is static */ }
function initDiscoverPage() { initDiscoverGrid(); }
function initNetworkPage() { initPeopleGrid(); }
function initEventsPage() { initEventsGrid(); }
function initGroupsPage() { initGroupsList(); }
function initWatchPage() { initWatchGrid(); }
function initPulsePage() { initPulseStreams(); }
async function initMarketplacePage() {
  const grid = document.getElementById('mkpItemGrid');
  const countEl = document.getElementById('mkpResultCount');
  if (!grid) return;

  grid.innerHTML = '<div style="text-align:center;padding:40px;color:var(--muted)">Loading products...</div>';

  try {
    const res = await fetch(`${typeof SPHERA_API !== 'undefined' ? SPHERA_API : 'https://sphera-backend-alpha.vercel.app/api/v1'}/bazaar/products?limit=40`);
    const data = await res.json();
    const products = data.products || data.items || data || [];

    if (countEl) countEl.textContent = `${products.length} results`;

    if (products.length === 0) {
      grid.innerHTML = '<div style="text-align:center;padding:40px;color:var(--muted)">No products found</div>';
      return;
    }

    grid.innerHTML = products.map(p => {
      const rawPrice = typeof p.price === 'object' ? (p.price?.value ?? p.special_price?.value ?? 0) : (p.price ?? p.sale_price ?? 0);
      const priceNum = parseFloat(rawPrice) || 0;
      const title = p.name || p.title || 'Product';
      const imgUrl = p.img || p.image || (Array.isArray(p.images) ? p.images[0] : null) || `https://via.placeholder.com/300x180?text=${encodeURIComponent(title)}`;
      const cat = p.cat || p.category || p.type || 'General';
      const rating = typeof p.rating === 'number' ? p.rating : 4.5;
      const badge = p.badge ? `<span style="position:absolute;top:8px;left:8px;background:${p.badge==='hot'?'#ef4444':p.badge==='new'?'#10b981':'#f59e0b'};color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:10px;text-transform:uppercase">${p.badge}</span>` : '';

      return `
        <div class="mkp-item-card" style="position:relative;background:var(--surface);border-radius:12px;overflow:hidden;border:1px solid var(--border);cursor:pointer;transition:transform 0.2s" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='none'">
          ${badge}
          <div style="height:180px;background:#1a1a2e;display:flex;align-items:center;justify-content:center;overflow:hidden">
            <img src="${imgUrl}" 
                 alt="${title}" 
                 style="width:100%;height:100%;object-fit:cover" 
                 onerror="this.src='https://via.placeholder.com/300x180?text=Product'"/>
          </div>
          <div style="padding:12px">
            <div style="font-weight:600;font-size:14px;margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${title}</div>
            <div style="color:#10b981;font-weight:700;font-size:16px;margin-bottom:4px">$${priceNum.toFixed(2)}</div>
            <div style="font-size:11px;color:var(--muted);margin-bottom:6px">${cat}</div>
            <div style="display:flex;align-items:center;gap:6px">
              <span style="font-size:12px;color:#f59e0b">★ ${rating.toFixed(1)}</span>
              <span style="font-size:11px;color:var(--muted)">${p.condition || 'In Stock'}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

  } catch (err) {
    console.error('Bazaar fetch error:', err);
    grid.innerHTML = '<div style="text-align:center;padding:40px;color:var(--muted)">Could not load products. Please try again.</div>';
  }
}

// ── Bazaar modal handlers ─────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const myBazaarBtn = document.getElementById('mkpMyOrbitBtn');
  const sellBtn = document.getElementById('mkpSellBtn');
  const myBazaarModal = document.getElementById('mkpMyOrbitModal');
  const sellModal = document.getElementById('mkpSellModal');
  const orbitClose = document.getElementById('mkpOrbitClose');
  const sellClose = document.getElementById('mkpSellClose');

  if (myBazaarBtn && myBazaarModal) {
    myBazaarBtn.addEventListener('click', () => {
      myBazaarModal.classList.remove('hidden');
      const content = document.getElementById('mkpOrbitContent');
      if (content && !content.innerHTML.trim()) {
        content.innerHTML = '<div style="padding:30px;text-align:center;color:var(--muted)"><p style="font-size:16px;margin-bottom:8px">Welcome to My BAZAAR</p><p style="font-size:13px">Your buying, selling, watchlist, bids, and feedback — all in one place.</p><p style="font-size:12px;margin-top:16px;color:#a78bfa">Sign in to view your marketplace activity</p></div>';
      }
    });
  }
  if (sellBtn && sellModal) {
    sellBtn.addEventListener('click', () => sellModal.classList.remove('hidden'));
  }
  if (orbitClose && myBazaarModal) {
    orbitClose.addEventListener('click', () => myBazaarModal.classList.add('hidden'));
  }
  if (sellClose && sellModal) {
    sellClose.addEventListener('click', () => sellModal.classList.add('hidden'));
  }
});

function initElevatePage() { /* Elevate HTML */ }

function initDiscoverGrid() {
  const grid = document.getElementById('discoverGrid');
  if (!grid || grid.children.length > 0) return;
  const items = [
    { title:'Cybersecurity', icon:'🛡', color:'#0ea5e9' },
    { title:'AI & ML', icon:'🤖', color:'#7c3aed' },
    { title:'Cloud Computing', icon:'☁️', color:'#10b981' },
    { title:'DevOps', icon:'⚙️', color:'#f59e0b' },
    { title:'Blockchain', icon:'🔗', color:'#ec4899' },
    { title:'Data Science', icon:'📊', color:'#6d28d9' },
  ];
  grid.innerHTML = items.map(it => `
    <div class="discover-card" style="border-color:${it.color}30" onclick="showToast('Exploring ${it.title}...')">
      <div class="dc-icon">${it.icon}</div>
      <div class="dc-title">${it.title}</div>
    </div>
  `).join('');
}

function initPeopleGrid() {
  const grid = document.getElementById('peopleGrid');
  if (!grid || grid.children.length > 0) return;
  const people = [
    { name:'Sarah Chen', title:'CISO at TechCorp', color:'#0ea5e9,#6d28d9' },
    { name:'Marcus Johnson', title:'Penetration Tester', color:'#7c3aed,#ec4899' },
    { name:'Priya Sharma', title:'Cloud Security Architect', color:'#10b981,#0ea5e9' },
    { name:'David Kim', title:'SOC Analyst Lead', color:'#f59e0b,#ef4444' },
  ];
  grid.innerHTML = people.map(p => `
    <div class="people-card">
      <div class="pc-avatar" style="background:linear-gradient(135deg,${p.color})">${p.name[0]}</div>
      <div class="pc-name">${p.name}</div>
      <div class="pc-title">${p.title}</div>
      <button class="pc-connect-btn" onclick="showToast('🤝 Connection request sent to ${p.name}!')">+ Connect</button>
    </div>
  `).join('');
}

function initEventsGrid() {
  const grid = document.getElementById('eventsGrid');
  if (!grid || grid.children.length > 0) return;
  grid.innerHTML = `
    <div class="event-card" onclick="showToast('📅 Opening event details...')">
      <div class="ec-date"><span class="ec-month">APR</span><span class="ec-day">15</span></div>
      <div class="ec-info"><div class="ec-title">Cybersecurity Summit 2026</div><div class="ec-meta">🌐 Virtual · 2,400 attending</div></div>
    </div>
    <div class="event-card" onclick="showToast('📅 Opening event details...')">
      <div class="ec-date"><span class="ec-month">MAY</span><span class="ec-day">3</span></div>
      <div class="ec-info"><div class="ec-title">RSA Conference — Networking Mixer</div><div class="ec-meta">📍 San Francisco, CA · 850 attending</div></div>
    </div>
  `;
}

function initGroupsList() {
  const list = document.getElementById('gsMyList');
  if (!list || list.children.length > 0) return;
  const groups = ['Cybersecurity Professionals','Cloud Architecture Forum','Federal IT Network'];
  list.innerHTML = groups.map(g => `<div class="gs-item" onclick="showToast('Opening ${g}...')">${g}</div>`).join('');
}

function initWatchGrid() {
  const grid = document.getElementById('watchGrid');
  if (!grid || grid.children.length > 0) return;
  grid.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text2)">🎥 Videos coming soon — check back later!</div>';
}

function initPulseStreams() {
  const streams = document.getElementById('pulseStreams');
  if (!streams || streams.children.length > 0) return;
  streams.innerHTML = [
    { topic:'#CyberSecurity', count:'12.4K', trend:'↑' },
    { topic:'#ZeroTrust', count:'8.7K', trend:'↑' },
    { topic:'#CloudSec', count:'5.2K', trend:'→' },
  ].map(s => `<div class="pulse-stream-item"><span class="ps-topic">${s.topic}</span><span class="ps-count">${s.count} pulses ${s.trend}</span></div>`).join('');
}

// ── Reels Video Upload ────────────────────────────────────────
function handleReelVideoChange(input) {
  if (!input.files || !input.files[0]) return;
  const file = input.files[0];
  const preview = document.getElementById('reelUploadPreview');
  const meta = document.getElementById('reelUploadMeta');
  const actions = document.getElementById('reelUploadActions');
  if (preview) { preview.src = URL.createObjectURL(file); preview.style.display = 'block'; preview.play(); }
  if (meta) meta.style.display = 'block';
  if (actions) actions.style.display = 'flex';
  showToast('🎬 Reel uploaded! Scroll through your feed.');
}
function addDemoReels() { showToast('🎬 Demo reels added!'); }

// ── YouTube Connect ───────────────────────────────────────────
function openYTConnect() { toggleModal('ytChannelModal', true); document.getElementById('ytChannelModal')?.classList.remove('hidden'); }
function closeYTConnect() { const m = document.getElementById('ytChannelModal'); if (m) m.classList.add('hidden'); }
function loadYTChannel() { showToast('📺 Loading YouTube channel...'); }
function importYTReels() { showToast('✦ Importing selected videos as Reels!'); closeYTConnect(); }

// ── Video Creator / Studio ────────────────────────────────────
function spheraVideoCreator() { showToast('🎞️ SpheraReel AI Video Creator — Opening InVideo...'); window.open('https://invideo.io', '_blank'); }
function switchVSMode(mode) { showToast('🎬 Switched to ' + mode + ' mode'); }
function vsPublishTo(platform) { showToast('📤 Publishing to ' + platform + '...'); }

// ── Onboarding ────────────────────────────────────────────────
function obChooseUpload() { showToast('📥 Opening resume upload...'); toggleModal('obOverlay', false); openResumeUpload(); }
function obChooseForm() { showToast('✏️ Starting guided profile builder...'); toggleModal('obOverlay', false); openPBW(); }
function obSkip() { toggleModal('obOverlay', false); localStorage.setItem('spheraOnboardingSeen', 'true'); }

// ── Profile Builder Wizard ────────────────────────────────────
let pbwStep = 0;
function openPBW() { toggleModal('pbwOverlay', true); toggleModal('pbwModal', true); pbwStep = 0; updatePBW(); }
function closePBW() { toggleModal('pbwOverlay', false); toggleModal('pbwModal', false); }
function confirmClosePBW() { if (confirm('Discard profile builder progress?')) closePBW(); }
function pbwNext() { if (pbwStep < 5) { pbwStep++; updatePBW(); } else { showToast('✦ Profile built successfully!'); closePBW(); } }
function pbwBack() { if (pbwStep > 0) { pbwStep--; updatePBW(); } }
function updatePBW() {
  for (let i = 0; i < 6; i++) {
    const page = document.getElementById('pbwPage' + i);
    const dot = document.getElementById('pbwDot' + i);
    if (page) { page.classList.toggle('active-pbw', i === pbwStep); page.style.display = i === pbwStep ? 'block' : 'none'; }
    if (dot) { dot.classList.toggle('active', i <= pbwStep); dot.classList.toggle('done', i < pbwStep); }
  }
  const backBtn = document.getElementById('pbwBackBtn');
  const nextBtn = document.getElementById('pbwNextBtn');
  const prog = document.getElementById('pbwProgressText');
  if (backBtn) backBtn.style.display = pbwStep > 0 ? 'inline-flex' : 'none';
  if (nextBtn) nextBtn.textContent = pbwStep === 5 ? '✦ Build My Profile' : 'Continue →';
  if (prog) prog.textContent = `Step ${pbwStep + 1} of 6`;
}
function pbwAddExpItem() { showToast('➕ Adding work experience entry'); }
function pbwAddEduItem() { showToast('➕ Adding education entry'); }
function pbwAddSkill() {
  const input = document.getElementById('pbwSkillInput');
  const tags = document.getElementById('pbwSkillTags');
  if (!input || !tags || !input.value.trim()) return;
  const tag = document.createElement('span');
  tag.className = 'pbw-skill-tag';
  tag.textContent = input.value.trim();
  tag.onclick = () => tag.remove();
  tags.appendChild(tag);
  input.value = '';
}
function pbwAutoGenerateBio() { showToast('✨ AI generating your professional summary...'); }
function togglePBWOTW(btn, val) {
  document.querySelectorAll('#pbwOTWRow .bio-tone-btn').forEach(b => b.classList.remove('active-tone'));
  btn.classList.add('active-tone');
  const roles = document.getElementById('pbwOTWRoles');
  if (roles) roles.style.display = val ? 'block' : 'none';
}

// ── Resume Upload ─────────────────────────────────────────────
function openResumeUpload() { showToast('📄 Resume upload — drag & drop your PDF or TXT'); }
function closeResumeUpload() { showToast('Closed resume upload'); }
function applyResumeToProfile() { showToast('✅ Resume data applied to profile!'); }
function selectResumeOption(opt) { showToast('Selected: ' + opt); }
function scoreResume() { showToast('📊 Scoring your resume...'); }
function runResumeTailor() { showToast('✂️ Tailoring resume to job description...'); }
function copyTailoredResume() { showToast('📋 Copied to clipboard!'); }
function downloadTailoredPDF() { showToast('📥 Downloading tailored PDF...'); }
function downloadTailoredWord() { showToast('📥 Downloading as Word...'); }

// ═══ CareerOrbit Functions ═══════════════════════════════════
function coSwitchTab(tab) {
  const signals = document.getElementById('coSignalsPanel');
  const orbit = document.getElementById('myOrbitPanel');
  document.querySelectorAll('.co-tab-btn').forEach(b => b.classList.remove('active-cotab'));
  if (tab === 'signals') { if (signals) signals.style.display = 'flex'; if (orbit) orbit.style.display = 'none'; document.getElementById('tabSignals')?.classList.add('active-cotab'); }
  if (tab === 'orbit') { if (signals) signals.style.display = 'none'; if (orbit) orbit.style.display = 'block'; document.getElementById('tabMyOrbit')?.classList.add('active-cotab'); }
}
function toggleOpenSignal() { showToast('📡 Open Signal toggled!'); }
function saveOpenSignal() { showToast('✅ Signal preferences saved!'); }
function closeOpenSignal() { showToast('Closed signal settings'); }
function toggleTalentScout() { showToast('🔍 Talent Scout mode toggled'); }
function showOrbitPostToast() { showToast('📡 Signal broadcast to your orbit!'); }
function showOrbitTracker() { showToast('🎯 Opening Job Tracker...'); }
function showOrbitAlerts() { showToast('🔔 Orbit Alerts'); }
function closeOrbitAlerts() { showToast('Closed alerts'); }
function createOrbitAlert() { showToast('🔔 New orbit alert created!'); }
function toggleCoThemePopup() {
  const popup = document.getElementById('coThemePopup');
  if (popup) popup.classList.toggle('hidden');
}
function setCoTheme(theme) {
  document.querySelectorAll('.co-theme-check').forEach(c => c.style.display = 'none');
  const check = document.getElementById('check-' + theme);
  if (check) check.style.display = 'inline';
  localStorage.setItem('co_theme', theme);
  showToast('🎨 Theme: ' + theme);
  toggleCoThemePopup();
}
function openOrbitChannels() { showToast('📡 Orbit Channels'); }
function orbitNwSwitch(tab) { showToast('Switched to ' + tab); }

// ═══ CareerOrbit Modals (open/close pairs) ═══════════════════
const MODAL_PAIRS = {
  HireMe: '🏆 Hire Me Page', FS: '🛡️ Fraud Sentinel', RS: '⭐ Rep Signal / Resume Score',
  IP: '🎤 Interview Prep', IF: '🎤 Interview Forge', OO: '💼 Offer Orbit',
  TOV: '💰 Benefits Decoder', OD: '🔍 Orbit Debrief', OW: '👁 Orbit Watch',
  PO: '🗂 Proof Orbit', MR: '📝 Interview Log', ORF: '🤝 Referral Engine',
  ORLOC: '🗺 Relocate Advisor', SC: '🌱 Signal Check', CCC: '🚀 Command Center',
  OI: '🔭 Orbit Intel', SWR: '💵 Salary War Room', DO: '🌑 Dark Orbit',
  OB: '🙈 Orbit Blind', TOM: '🤜 Team Match', MED: '🏥 MedOrbit',
  COM: '🪖 Command Orbit', LP: '🚀 Launch Pad', OS: '⚡ Orbit Score',
  MSIM: '🎮 Mission Sim', OM: '🏪 Orbit Market', OTL: '⏱️ Offer Timeline',
  OPulse: '📡 Orbit Pulse', SGR: '🎯 Skill Gap Radar', OVault: '🔐 Orbit Vault',
  AF: '📊 App Funnel', JDM: '🎯 JD Match', CPE: '🎓 CPE Tracker',
  Neg: '💬 Negotiation', Ref: '📋 References', TCB: '💰 Comp Builder',
  CTL: '📅 Timeline', ONWS: '📰 Orbit News', CPS: '📈 Career Path Sim',
  Spotlight: '🔦 Spotlight', AIBio: '✨ AI Bio Generator', CI: '🧠 Career Intelligence',
  OR: '📋 Orbit Resume', RT: '✂️ Resume Tailor', Salary: '💰 Salary Benchmark',
  Outreach: '📧 Outreach', OT: '🎯 Orbit Tracker', Endorse: '👏 Endorsement',
  Analytics: '📊 Analytics', QL: '⚡ Quick Launch', SP: '⚡ Skill Probe',
  LP: '🚀 Launch Pad'
};

// Generate open/close functions for all modal pairs
Object.entries(MODAL_PAIRS).forEach(([key, label]) => {
  const openName = 'open' + key;
  const closeName = 'close' + key;
  if (typeof window[openName] === 'undefined') {
    window[openName] = function() {
      const overlay = document.getElementById(key.toLowerCase() + 'Overlay') || document.getElementById(key + 'Overlay');
      const panel = document.getElementById(key.toLowerCase() + 'Panel') || document.getElementById(key + 'Panel');
      if (overlay) { overlay.style.display = 'flex'; overlay.classList.remove('hidden'); }
      if (panel) { panel.style.display = 'flex'; panel.classList.remove('hidden'); }
      if (!overlay && !panel) showToast(label);
    };
  }
  if (typeof window[closeName] === 'undefined') {
    window[closeName] = function() {
      const overlay = document.getElementById(key.toLowerCase() + 'Overlay') || document.getElementById(key + 'Overlay');
      const panel = document.getElementById(key.toLowerCase() + 'Panel') || document.getElementById(key + 'Panel');
      if (overlay) { overlay.style.display = 'none'; }
      if (panel) { panel.style.display = 'none'; }
    };
  }
});

// ═══ Additional Feature Functions ════════════════════════════
function openSkillProbe() { showToast('⚡ Skill Probe — Test your expertise!'); const o = document.getElementById('spOverlay'); if(o) o.style.display='flex'; const p = document.getElementById('spPanel'); if(p) p.style.display='flex'; }
function closeSP() { const o = document.getElementById('spOverlay'); if(o) o.style.display='none'; const p = document.getElementById('spPanel'); if(p) p.style.display='none'; }
function spNext() { showToast('Next question...'); }
function openOrbitResume() { const o = document.getElementById('orOverlay'); const p = document.getElementById('orPanel'); if(o){o.style.display='flex';o.classList.remove('hidden');} if(p){p.style.display='flex';p.classList.remove('hidden');} if(!o&&!p) showToast('📋 Orbit Resume Builder'); }
function closeOR() { const o = document.getElementById('orOverlay'); const p = document.getElementById('orPanel'); if(o) o.style.display='none'; if(p) p.style.display='none'; }
function orTogglePreview() { showToast('👁 Toggling preview...'); }
function orExportResume() { showToast('📥 Exporting resume as PDF...'); }
function orAIEnhance() { showToast('🤖 AI enhancing all sections...'); }
function selectORTemplate(t) { document.querySelectorAll('.or-tpl-btn').forEach(b=>b.classList.remove('active-tpl')); document.querySelector(`.or-tpl-btn[data-t="${t}"]`)?.classList.add('active-tpl'); showToast('Template: '+t); }
function addORExperience() { showToast('➕ Adding experience entry'); }
function addOREducation() { showToast('➕ Adding education entry'); }

function openSalaryBenchmark() { showToast('💰 Salary Benchmark Tool'); }
function openLinkedInLearning() { showToast('📚 Opening learning resources...'); }

function activateHireMe() { showToast('🏆 Hire Me page activated!'); }
function openEndorsementEngine() { showToast('👏 Endorsement Engine'); }
function generateEndorsement() { showToast('✨ Generating endorsement...'); }
function closeEndorse() { showToast('Closed endorsement'); }

// Bio tools
function openAIBio() { showToast('✨ AI Bio Generator'); }
function closeAIBio() { showToast('Closed AI Bio'); }
function generateBio() { showToast('✨ Generating professional bio...'); }
function applyBio() { showToast('✅ Bio applied to profile!'); }
function copyBio() { showToast('📋 Bio copied!'); }
function selectTone(tone) { showToast('🎨 Tone: ' + tone); }

// Outreach
function openOutreach() { showToast('📧 Outreach Manager'); }
function closeOutreach() { showToast('Closed outreach'); }
function regenerateOutreach() { showToast('🔄 Regenerating outreach message...'); }
function sendOutreach() { showToast('📤 Outreach sent!'); }

// CareerOrbit misc
function scoreJDM() { showToast('🎯 Scoring JD match...'); }
function runFraudScan() { showToast('🛡️ Running fraud scan...'); }
function runCPS() { showToast('📈 Running career path simulation...'); }
function addCPE() { showToast('➕ Adding CPE entry'); }
function closeCPE() { showToast('Closed CPE tracker'); }
function addCTL() { showToast('➕ Adding timeline entry'); }
function closeCTL() { showToast('Closed timeline'); }
function runMEDLicense() { showToast('🏥 Checking medical license...'); }
function resetMSIM() { showToast('🔄 Mission reset!'); }
function switchOMTab(tab) { showToast('Switched to ' + tab); }
function switchOWTab(tab) { showToast('Switched to ' + tab); }
function switchLPTab(tab) { showToast('Switched to ' + tab); }
function openLPAddModal() { showToast('➕ Adding to Launch Pad'); }
function closeLPModal() { showToast('Closed LP modal'); }
function addOOOffer() { showToast('➕ Adding offer'); }
function addOTLOffer() { showToast('➕ Adding to timeline'); }
function addOWCompany() { showToast('➕ Adding company to watch'); }
function addPOProject() { showToast('➕ Adding proof project'); }
function addRef() { showToast('➕ Adding reference'); }
function addVaultDoc() { showToast('🔐 Adding to vault'); }
function addAFEntry() { showToast('➕ Adding funnel entry'); }
function calcTCB() { showToast('💰 Calculating compensation...'); }
function calcTOV() { showToast('💰 Calculating total offer value...'); }
function calculateOO() { showToast('💼 Calculating offer comparison...'); }
function recalcOS() { showToast('⚡ Recalculating Orbit Score...'); }
function runDO() { showToast('🌑 Running Dark Orbit scan...'); }
function runOD() { showToast('🔍 Running Orbit Debrief...'); }
function runOI() { showToast('🔭 Running Orbit Intel...'); }
function runSWR() { showToast('💵 Running Salary War Room analysis...'); }
function runTOM() { showToast('🤜 Finding team matches...'); }
function runORLOC() { showToast('🗺 Running relocation analysis...'); }
function exportOTSummary() { showToast('📤 Exporting tracker summary...'); }
function filterOT(filter) { showToast('🔍 Filtering: ' + filter); }
function submitOTManual() { showToast('✅ Manual entry submitted'); }
function openOTAddModal() { showToast('➕ Adding tracker entry'); }
function closeOTAdd() { showToast('Closed tracker add'); }
function requestORF() { showToast('🤝 Referral requested!'); }
function submitRep() { showToast('✅ Reputation signal submitted'); }
function saveMR() { showToast('📝 Interview log saved!'); }

// Interview Forge
function startIF() { showToast('🎤 Starting interview session...'); }
function nextIFQuestion() { showToast('Next question...'); }
function submitIFAnswer() { showToast('✅ Answer submitted!'); }
function genIPQuestions() { showToast('🎤 Generating interview questions...'); }
function genNegScript() { showToast('💬 Generating negotiation script...'); }
function copyQLRef() { showToast('📋 Copied!'); }
function qlNextStep() { showToast('Next step...'); }
function qlPrevStep() { showToast('Previous step...'); }

// SpheraMatch (LinkedUp)
function luSwipeCard(dir) { showToast(dir === 'right' ? '💚 Liked!' : '❌ Passed'); }
function luSwitchTab(tab) { showToast('Switched to ' + tab); }
function luFilter(f) { showToast('Filtering: ' + f); }
function luSendMessage() { showToast('💬 Message sent!'); }
function luDismissMatch() { showToast('Match dismissed'); }

// Navigation helpers
function navToSection(section) { showToast('Navigating to ' + section); }
function ciShowCat(cat) { showToast('Category: ' + cat); }

// Marketplace
function sdHubSearchGo() { showToast('🔍 Searching marketplace...'); }

// Open signal
function toggleOpenSignal() { showToast('📡 Open Signal toggled'); }

// Prezi
function openPreziApp() { showToast('Opening Prezi...'); window.open('https://prezi.com', '_blank'); }
function preziPostTo(platform) { showToast('Posting to ' + platform); }

// Friend Requests
function initFriendRequests() {
  const btn = document.getElementById('friendReqBtn');
  const panel = document.getElementById('friendReqPanel');
  if (btn && panel) {
    btn.addEventListener('click', () => panel.classList.toggle('hidden'));
  }
}

// Notification Button
function initNotifications() {
  const btn = document.getElementById('notifBtn');
  if (btn) btn.addEventListener('click', openNotifPanel);
}

// Settings Button
function initSettingsBtn() {
  const btn = document.getElementById('settingsBtn');
  if (btn) btn.addEventListener('click', openSettings);
}

// ── Keyboard Shortcuts ────────────────────────────────────────
function initKeyboardShortcuts() {
  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      const search = document.getElementById('globalSearch');
      if (search) search.focus();
    }
    if (e.key === 'Escape') { closeMeMenu(); closeLaunchpad(); }
  });
}

// ── Click Outside Handlers ────────────────────────────────────
function initClickOutside() {
  document.addEventListener('click', e => {
    const meWrap = document.getElementById('meManuWrap');
    const meDD = document.getElementById('meDropdown');
    if (meDD && meDD.classList.contains('show') && meWrap && !meWrap.contains(e.target)) closeMeMenu();
    const notifPanel = document.getElementById('notifPanel');
    const notifBtn = document.getElementById('notifBtn');
    if (notifPanel && !notifPanel.classList.contains('hidden') && !notifPanel.contains(e.target) && notifBtn && !notifBtn.contains(e.target)) {
      notifPanel.classList.add('hidden');
    }
  });
}

// ── CSS Animation Injection ───────────────────────────────────
function injectAnimations() {
  if (document.getElementById('spheraAnimations')) return;
  const style = document.createElement('style');
  style.id = 'spheraAnimations';
  style.textContent = `
    @keyframes toastIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    @keyframes fadeInUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .me-dropdown.show { display: block !important; }
  `;
  document.head.appendChild(style);
}

// ═══ BOOT ════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  console.log('✦ SPHERA app.js v45 loaded');
  injectAnimations();
  initSidebarNav();
  initSidebarToggle();
  initCreatePost();
  initStories();
  initCategoryPills();
  initContentGrid();
  initMarquee();
  initLoadMore();
  initRightSidebar();
  initFriendRequests();
  initNotifications();
  initSettingsBtn();
  initKeyboardShortcuts();
  initClickOutside();

  // Auth init
  if (typeof spheraInitAuth === 'function') spheraInitAuth();

  // Check onboarding
  if (!localStorage.getItem('spheraOnboardingSeen')) {
    const ob = document.getElementById('obOverlay');
    if (ob) ob.style.display = 'flex';
  }

  // Copilot FAB
  const copilotFab = document.querySelector('.copilot-fab, #copilotFab, [onclick*="toggleCopilot"]');
  if (copilotFab) copilotFab.addEventListener('click', toggleCopilot);

  // ── Deep-link support: ?tab=reels, ?tab=careerorbit, etc. ──
  const urlParams = new URLSearchParams(window.location.search);
  const tabParam = urlParams.get('tab');
  if (tabParam) {
    // Small delay to let DOM settle
    setTimeout(() => {
      showPage(tabParam);
      console.log('✦ Deep-linked to:', tabParam);
    }, 300);
  }

  // Also listen for hash changes: #reels, #careerorbit, etc.
  function handleHashNav() {
    const hash = window.location.hash.replace('#', '');
    if (hash && VIEW_TO_PAGE[hash]) showPage(hash);
  }
  window.addEventListener('hashchange', handleHashNav);
  if (window.location.hash) setTimeout(handleHashNav, 300);

  console.log('✅ SPHERA fully initialized — deep-linking enabled');
});

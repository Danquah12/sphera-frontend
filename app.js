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
  if (view === 'feed') initContentGrid();
  if (view === 'careerorbit') initCareerorbitPage();
  if (view === 'elevate') initElevatePage();
  if (view === 'marketplace') initMarketplacePage();
  if (view === 'reels') initReelsPage();
  if (view === 'nexus') initNexusPage();
  if (view === 'messages') initMessagesPage();
  if (view === 'discover') initDiscoverPage();
  if (view === 'network') initNetworkPage();
  if (view === 'events') initEventsPage();
  if (view === 'groups') initGroupsPage();
  if (view === 'watch') initWatchPage();
  if (view === 'pulse') initPulsePage();
  if (view === 'profile') initProfilePage();
  if (view === 'linkedup') initLinkedUpPage();
  if (view === 'creatorstudio') initCreatorStudioPage();
  if (view === 'spherapay') initSpheraPayPage();
  if (view === 'spaces') initSpacesPage();
  if (view === 'stories') initStoriesPage();
  if (view === 'local') initLocalPage();
  if (view === 'live') initLivePage();
  if (view === 'bookclub') initBookclubPage();
  if (view === 'recipehub') initRecipehubPage();
  if (view === 'fitness') initFitnessPage();
  if (view === 'timecapsule') initTimecapsulePage();
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
    { 
      name: 'Yaw Asiedu-Danquah', 
      handle: '@yasiedudanquah', 
      verified: true, 
      time: '2h ago', 
      color: '#0ea5e9,#6d28d9',
      text: 'The convergence of <span class="nx-tx-hashtag">#AI</span> and <span class="nx-tx-hashtag">#CyberSecurity</span> is creating unprecedented opportunities. When autonomous defense agents can remediate zero-days within milliseconds, the threat landscape shifts entirely from reactive patching to predictive posture engineering. Thread 🧵👇', 
      sparks: 284, 
      echoes: 47, 
      amplifies: 12 
    },
    { 
      name: 'CyberWatch Global', 
      handle: '@cyberwatchhq', 
      verified: true, 
      time: '4h ago', 
      color: '#ef4444,#f59e0b',
      text: '🚨 <strong>CRITICAL ADVISORY:</strong> Major zero-day vulnerability discovered in enterprise SSL-VPN appliances. Threat actors actively chaining auth bypass with remote code execution. Patch immediately or restrict external ingress. <span class="nx-tx-hashtag">#CVE2026</span> <span class="nx-tx-hashtag">#InfoSec</span>', 
      sparks: 1823, 
      echoes: 934, 
      amplifies: 412 
    },
    { 
      name: 'Sarah Mitchell', 
      handle: '@sarahm_sec', 
      verified: false, 
      time: '6h ago', 
      color: '#10b981,#0ea5e9',
      text: 'Just completed my SANS SEC504 certification! The hands-on DFIR labs were incredible. Huge shoutout to the <span class="nx-tx-hashtag">#Elevate</span> study group for the practice exams! 🎓🛡️ <span class="nx-tx-hashtag">#GIAC</span> <span class="nx-tx-hashtag">#IncidentResponse</span>', 
      sparks: 647, 
      echoes: 89, 
      amplifies: 23 
    },
    { 
      name: 'Jordan Chen', 
      handle: '@jordanc', 
      verified: true, 
      time: '9h ago', 
      color: '#7c3aed,#ec4899',
      text: 'Zero Trust is not a product you buy off the shelf — it is a disciplined architectural posture. Always verify, never trust, assume breach. <span class="nx-tx-hashtag">#ZeroTrust</span> <span class="nx-tx-hashtag">#Architecture</span>', 
      sparks: 912, 
      echoes: 154, 
      amplifies: 88 
    }
  ];

  feed.innerHTML = posts.map((p, i) => `
    <div class="nx-transmission" style="animation:fadeInUp .3s ease ${i * 0.05}s both">
      <div class="nx-tx-header">
        <div class="nx-tx-av" style="background:linear-gradient(135deg,${p.color})">${p.name[0]}</div>
        <div class="nx-tx-meta">
          <div class="nx-tx-name-row">
            <span class="nx-tx-name">${p.name}</span>
            ${p.verified ? '<span class="nx-verified">✦</span>' : ''}
            <span class="nx-tx-handle">${p.handle}</span>
            <span class="nx-tx-dot">·</span>
            <span class="nx-tx-time">${p.time}</span>
            <button class="nx-tx-more" onclick="showToast('Transmission options')">⋯</button>
          </div>
          <div class="nx-tx-text">${p.text}</div>
          <div class="nx-tx-actions">
            <button class="nx-tx-action reply-act" onclick="showToast('💬 Replying in thread...')">
              <span class="nx-act-icon">💬</span> <span>${p.echoes}</span>
            </button>
            <button class="nx-tx-action amplify-act" onclick="toggleNexusAmplify(this, ${p.amplifies})">
              <span class="nx-act-icon">🔁</span> <span class="amplify-count">${p.amplifies}</span>
            </button>
            <button class="nx-tx-action spark-act" onclick="toggleNexusSpark(this, ${p.sparks})">
              <span class="nx-act-icon">💎</span> <span class="spark-count">${p.sparks}</span>
            </button>
            <button class="nx-tx-action bookmark-act" onclick="toggleNexusBookmark(this)">
              <span class="nx-act-icon">🔖</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function publishNexusTransmission() {
  const input = document.getElementById('nxQuickInput');
  const text = input ? input.value.trim() : '';
  if (!text) {
    showToast('⚠️ Please write your transmission before broadcasting');
    return;
  }

  const feed = document.getElementById('nxFeed');
  if (feed) {
    const newTx = document.createElement('div');
    newTx.className = 'nx-transmission';
    newTx.style.animation = 'fadeInUp .3s ease both';
    newTx.innerHTML = `
      <div class="nx-tx-header">
        <div class="nx-tx-av" style="background:linear-gradient(135deg,#0ea5e9,#6d28d9)">Y</div>
        <div class="nx-tx-meta">
          <div class="nx-tx-name-row">
            <span class="nx-tx-name">Yaw Asiedu</span>
            <span class="nx-verified">✦</span>
            <span class="nx-tx-handle">@yasiedudanquah</span>
            <span class="nx-tx-dot">·</span>
            <span class="nx-tx-time">Just now</span>
            <button class="nx-tx-more" onclick="showToast('Transmission options')">⋯</button>
          </div>
          <div class="nx-tx-text">${text}</div>
          <div class="nx-tx-actions">
            <button class="nx-tx-action reply-act" onclick="showToast('💬 Replying...')">
              <span class="nx-act-icon">💬</span> <span>0</span>
            </button>
            <button class="nx-tx-action amplify-act" onclick="toggleNexusAmplify(this, 0)">
              <span class="nx-act-icon">🔁</span> <span class="amplify-count">0</span>
            </button>
            <button class="nx-tx-action spark-act" onclick="toggleNexusSpark(this, 1)">
              <span class="nx-act-icon">💎</span> <span class="spark-count">1</span>
            </button>
            <button class="nx-tx-action bookmark-act" onclick="toggleNexusBookmark(this)">
              <span class="nx-act-icon">🔖</span>
            </button>
          </div>
        </div>
      </div>
    `;
    feed.insertBefore(newTx, feed.firstChild);
  }

  if (input) input.value = '';
  showToast('🌊 Transmitted live across the Nexus network!');
}

function toggleNexusSpark(btn, baseCount) {
  const isSparked = btn.classList.toggle('sparked');
  const count = btn.querySelector('.spark-count');
  if (count) count.textContent = isSparked ? baseCount + 1 : baseCount;
  showToast(isSparked ? '💎 Sparked transmission!' : 'Spark removed');
}

function toggleNexusAmplify(btn, baseCount) {
  const isAmplified = btn.classList.toggle('amplified');
  const count = btn.querySelector('.amplify-count');
  if (count) count.textContent = isAmplified ? baseCount + 1 : baseCount;
  showToast(isAmplified ? '🔁 Amplified to your followers!' : 'Amplification undone');
}

function toggleNexusBookmark(btn) {
  const isBookmarked = btn.classList.toggle('bookmarked');
  showToast(isBookmarked ? '🔖 Saved to your Bookmarks' : 'Removed from Bookmarks');
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

// ═══════════════════════════════════════════════════════════════
// CAREERORBIT ENTERPRISE JOB BOARD & DETAIL VIEWER
// ═══════════════════════════════════════════════════════════════
const CO_JOBS = [
  {
    id: 'job-1',
    title: 'Senior Information Systems Security Engineer (ISSE)',
    company: 'Open Systems Technology (OST)',
    location: 'Laurel, MD · Hybrid',
    type: 'Full-time · Hybrid',
    salary: '$175,000 - $215,000 / yr',
    clearance: 'TS/SCI with Poly',
    match: 98,
    category: 'cyber',
    color: '#7c3aed,#ec4899',
    posted: '1d ago',
    applicants: 14,
    tags: ['ISSE', 'NIST 800-53', 'RMF', 'Zero Trust', 'Cloud Security'],
    desc: 'Lead enterprise security engineering and authorization for federal multi-cloud environments. Implement Zero Trust Architecture (ZTA), design continuous monitoring pipelines, and ensure ATO compliance across high-impact federal defense systems.',
    reqs: [
      'Active TS/SCI clearance with Polygraph required',
      '8+ years of dedicated ISSE or cybersecurity engineering experience',
      'CISSP, CASP+, or CISM certification required',
      'Hands-on expertise with AWS GovCloud and Azure Government architecture',
      'Proven track record implementing NIST SP 800-53 Rev 5 & RMF life-cycle',
      'Experience in automated compliance scanning (Tenable/Nessus, OpenSCAP, STIGs)'
    ],
    benefits: [
      'Total Compensation: $175K-$215K Base + 15% Annual Bonus Target',
      '401(k) Match: 100% match up to 6% of salary, immediate vesting',
      'Clearance Retention Bonus: $15,000 annual polygraph stipend',
      'Comprehensive Medical/Dental/Vision with 100% premium coverage'
    ]
  },
  {
    id: 'job-2',
    title: 'Principal Cloud Security Architect (Zero Trust)',
    company: 'CrowdStrike',
    location: 'Remote · USA',
    type: 'Full-time · Remote',
    salary: '$195,000 - $240,000 / yr',
    clearance: 'Public Trust / Clean Background',
    match: 96,
    category: 'cyber',
    color: '#ef4444,#f59e0b',
    posted: '2d ago',
    applicants: 28,
    tags: ['CloudSec', 'Zero Trust', 'Falcon Platform', 'Kubernetes', 'AWS'],
    desc: 'Design and spearhead global cloud detection and response architecture across AWS, GCP, and Azure. Partner with engineering leaders to embed continuous identity verification, microsegmentation, and automated threat isolation.',
    reqs: [
      '10+ years architecture and security engineering experience',
      'Expertise with Kubernetes security, container isolation, and service meshes (Istio)',
      'Deep knowledge of identity federations (OIDC, SAML, Okta, Entra ID)',
      'Proficiency in Go, Python, and Terraform infrastructure-as-code'
    ],
    benefits: [
      'Base: $195K-$240K + RSU Equity Grant ($120K over 4 yrs)',
      'Unlimited Paid Time Off (FTO) + Annual Wellness Stipend ($2,500)',
      'Remote Office Setup Allowance ($3,000)'
    ]
  },
  {
    id: 'job-3',
    title: 'Lead Cyber Threat Hunter & Incident Responder',
    company: 'Mandiant / Google Cloud',
    location: 'Washington, DC · Hybrid',
    type: 'Full-time · Hybrid',
    salary: '$180,000 - $225,000 / yr',
    clearance: 'Top Secret Eligible',
    match: 94,
    category: 'cyber',
    color: '#0ea5e9,#6d28d9',
    posted: '3d ago',
    applicants: 19,
    tags: ['Threat Hunting', 'DFIR', 'MITRE ATT&CK', 'SIEM', 'YARA'],
    desc: 'Investigate advanced nation-state threat actors (APTs), conduct proactive threat hunts across enterprise telemetry, and author deep threat intelligence advisories for Fortune 100 executives.',
    reqs: [
      '7+ years in digital forensics and incident response (DFIR)',
      'Deep understanding of Windows/Linux internals and kernel telemetry',
      'Experience authoring custom YARA rules and Sigma detection logic',
      'SANS GIAC certifications (GCFA, GCFE, GNFA, or GREM) highly preferred'
    ],
    benefits: [
      'Comprehensive Google equity & bonus program',
      'World-class continuing education & SANS training budget ($10,000/yr)',
      'On-site gourmet meals & wellness benefits'
    ]
  },
  {
    id: 'job-4',
    title: 'Senior DevSecOps & Security Automation Engineer',
    company: 'Lockheed Martin Space',
    location: 'Bethesda, MD · Hybrid',
    type: 'Full-time · Hybrid',
    salary: '$160,000 - $198,000 / yr',
    clearance: 'Secret / TS Eligible',
    match: 92,
    category: 'gov',
    color: '#10b981,#0ea5e9',
    posted: '4d ago',
    applicants: 31,
    tags: ['DevSecOps', 'CI/CD', 'GitLab', 'Terraform', 'Static Analysis'],
    desc: 'Integrate automated SAST, DAST, and container vulnerability scanning directly into satellite ground station CI/CD pipelines. Eliminate security bottlenecks for mission-critical aerospace software.',
    reqs: [
      '6+ years in DevOps / DevSecOps engineering',
      'Expertise in GitLab CI/CD, GitHub Actions, and ArgoCD',
      'Experience hardening Linux/RHEL images to DISA STIG baselines',
      'Secret clearance required; ability to obtain TS/SCI'
    ],
    benefits: [
      '4x10 Flexible Work Schedule (Every Friday Off)',
      'Exceptional defined retirement contribution (9% total company match)',
      'Full tuition assistance for Master\'s degree programs'
    ]
  },
  {
    id: 'job-5',
    title: 'Staff Offensive Security Consultant / Red Teamer',
    company: 'Bishop Fox',
    location: 'Remote · USA',
    type: 'Full-time · Remote',
    salary: '$170,000 - $210,000 / yr',
    clearance: 'None / Private Sector',
    match: 95,
    category: 'tech',
    color: '#f59e0b,#ef4444',
    posted: '5d ago',
    applicants: 22,
    tags: ['Red Team', 'OSCP', 'Active Directory', 'C2', 'Penetration Testing'],
    desc: 'Execute complex red team simulations against enterprise defenses. Emulate real-world adversary tactics, develop custom payloads, exploit Active Directory trust relationships, and deliver strategic executive briefings.',
    reqs: [
      'OSCP, OSEP, CRTO, or GPEN certification required',
      '5+ years dedicated penetration testing / red teaming experience',
      'Demonstrated experience bypassing EDR solutions and developing custom C2 implants',
      'Outstanding technical report writing and executive communication skills'
    ],
    benefits: [
      '100% remote work with flexible hours',
      'Annual hardware & lab budget ($5,000/yr)',
      'Comprehensive healthcare + 401k match'
    ]
  }
];

let _activeJobId = 'job-1';

function initCareerorbitPage() {
  renderCoJobs('all');
  selectCoJob(_activeJobId);

  // Wire category filter tabs
  document.querySelectorAll('#coSourceTabs .co-pill').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('#coSourceTabs .co-pill').forEach(b => b.classList.remove('active-copill'));
      btn.classList.add('active-copill');
      const cat = btn.dataset.source || 'all';
      renderCoJobs(cat);
    };
  });

  // Wire Curated / Live tabs
  const tabCurated = document.getElementById('tabCurated');
  const tabLive = document.getElementById('tabLive');
  if (tabCurated) tabCurated.onclick = () => {
    tabCurated.classList.add('active-copill');
    tabLive?.classList.remove('active-copill');
    renderCoJobs('all');
  };
  if (tabLive) tabLive.onclick = () => {
    tabLive?.classList.add('active-copill');
    tabCurated?.classList.remove('active-copill');
    renderCoJobs('all');
  };
}

function renderCoJobs(category = 'all') {
  const container = document.getElementById('coJobList');
  if (!container) return;

  const filtered = category === 'all' 
    ? CO_JOBS 
    : CO_JOBS.filter(j => j.category === category || j.tags.some(t => t.toLowerCase().includes(category)));

  const displayList = filtered.length > 0 ? filtered : CO_JOBS;

  container.innerHTML = displayList.map(j => {
    const isActive = j.id === _activeJobId;
    return `
      <div class="co-job-card ${isActive ? 'co-active-job' : ''}" onclick="selectCoJob('${j.id}')">
        <button class="cj-save-btn" onclick="event.stopPropagation(); showToast('⭐ Job saved to watchlist!')">☆</button>
        <div class="cj-header">
          <div class="cj-logo-fallback" style="background:linear-gradient(135deg,${j.color})">${j.company[0]}</div>
          <div style="flex:1;min-width:0">
            <div class="cj-title">${j.title}</div>
            <div class="cj-company">${j.company}</div>
            <div class="cj-location">📍 ${j.location}</div>
          </div>
        </div>
        <div class="cj-tags">
          <span class="cj-tag" style="background:rgba(16,185,129,.15);border-color:rgba(16,185,129,.3);color:#10b981">✦ ${j.match}% MATCH</span>
          <span class="cj-tag tssci">🛡️ ${j.clearance}</span>
          ${j.tags.slice(0, 3).map(t => `<span class="cj-tag">${t}</span>`).join('')}
        </div>
        <div class="cj-salary">${j.salary}</div>
        <div class="cj-footer">
          <span>${j.posted} · ${j.applicants} applicants</span>
          <button class="cj-easy-apply" onclick="event.stopPropagation(); showToast('⚡ Quick apply initiated for ${j.company}!')">⚡ Orbit Apply</button>
        </div>
      </div>
    `;
  }).join('');
}

function selectCoJob(jobId) {
  _activeJobId = jobId;
  const job = CO_JOBS.find(j => j.id === jobId) || CO_JOBS[0];
  const detail = document.getElementById('coJobDetail');
  if (!detail) return;

  // Highlight active card
  document.querySelectorAll('.co-job-card').forEach(c => c.classList.remove('co-active-job'));
  const activeEl = document.querySelector(`.co-job-card[onclick*="${jobId}"]`);
  if (activeEl) activeEl.classList.add('co-active-job');

  detail.innerHTML = `
    <div class="cd-header" style="animation:fadeIn .25s ease">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px">
        <div class="cd-logo-lg-fb" style="background:linear-gradient(135deg,${job.color})">${job.company[0]}</div>
        <span style="background:rgba(16,185,129,.15);border:1px solid rgba(16,185,129,.35);color:#10b981;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:800">✦ ${job.match}% Profile Fit</span>
      </div>
      <h2 class="cd-title">${job.title}</h2>
      <div class="cd-company">${job.company} · ${job.location}</div>
      <div class="cd-meta-row">
        <span class="cd-meta-item">🕒 ${job.type}</span>
        <span class="cd-meta-item">🛡️ ${job.clearance}</span>
        <span class="cd-meta-item">📅 Posted ${job.posted}</span>
      </div>
      <div class="cd-salary">${job.salary}</div>
      
      <div class="cd-actions">
        <button class="cd-apply-btn easy" onclick="showToast('🚀 Application transmitted to ${job.company}!')">⚡ 1-Click Orbit Apply</button>
        <button class="cd-save-btn" onclick="showToast('✂️ AI tailoring resume to ${job.title}...')">✂️ Tailor Resume</button>
        <button class="cd-save-btn" onclick="showToast('🎤 Loading interview simulation questions for ${job.title}...')">🎤 Interview Prep</button>
      </div>

      <div class="cd-section">
        <div class="cd-section-title">Role Overview</div>
        <p class="cd-desc">${job.desc}</p>
      </div>

      <div class="cd-section">
        <div class="cd-section-title">Requirements & Qualifications</div>
        <ul class="cd-req-list">
          ${job.reqs.map(r => `<li>${r}</li>`).join('')}
        </ul>
      </div>

      <div class="cd-section">
        <div class="cd-section-title">Compensation & Benefits Package</div>
        <ul class="cd-req-list">
          ${job.benefits.map(b => `<li>${b}</li>`).join('')}
        </ul>
      </div>

      <div class="cd-section">
        <div class="cd-section-title">Orbit Network Connections</div>
        <div class="cd-connections">
          <div class="cd-conn-item">
            <div class="cd-conn-avatar">Y</div>
            <div><strong>Yaw Asiedu-Danquah</strong> works at an affiliated partner · <a href="#" onclick="showToast('Message sent asking for introduction');return false" style="color:#a78bfa;font-weight:700">Ask for Referral</a></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════════════════════════
// ELEVATE LEARNING HUB
// ═══════════════════════════════════════════════════════════════
function initElevatePage() {
  const goalsContainer = document.getElementById('elGoals');
  if (goalsContainer) {
    goalsContainer.innerHTML = `
      <div style="padding:10px 0">
        <div style="display:flex;justify-content:space-between;font-size:12px;font-weight:700;color:#fff;margin-bottom:6px">
          <span>Zero Trust Architecture</span><span>75%</span>
        </div>
        <div style="height:6px;background:rgba(255,255,255,0.08);border-radius:4px;overflow:hidden">
          <div style="width:75%;height:100%;background:linear-gradient(90deg,#7c3aed,#0ea5e9)"></div>
        </div>
      </div>
      <div style="padding:10px 0">
        <div style="display:flex;justify-content:space-between;font-size:12px;font-weight:700;color:#fff;margin-bottom:6px">
          <span>CISSP Exam Prep</span><span>90%</span>
        </div>
        <div style="height:6px;background:rgba(255,255,255,0.08);border-radius:4px;overflow:hidden">
          <div style="width:90%;height:100%;background:linear-gradient(90deg,#10b981,#0ea5e9)"></div>
        </div>
      </div>
    `;
  }
}

// ═══════════════════════════════════════════════════════════════
// CONNECTIONS / NETWORK
// ═══════════════════════════════════════════════════════════════
function initPeopleGrid() {
  const grid = document.getElementById('peopleGrid');
  if (!grid || grid.children.length > 0) return;

  const people = [
    { name: 'Sarah Chen, CISSP', title: 'Chief Information Security Officer (CISO)', company: 'Federal Cloud Systems', mutual: 18, color: '#0ea5e9,#6d28d9' },
    { name: 'Marcus Johnson, OSCP', title: 'Senior Penetration Tester & Red Team Lead', company: 'Bishop Fox', mutual: 24, color: '#7c3aed,#ec4899' },
    { name: 'Priya Sharma', title: 'Principal Cloud Security Architect', company: 'CrowdStrike', mutual: 12, color: '#10b981,#0ea5e9' },
    { name: 'David Kim', title: 'SOC Lead & Incident Responder', company: 'Mandiant / Google Cloud', mutual: 9, color: '#f59e0b,#ef4444' },
    { name: 'Elena Rostova', title: 'Director of Cyber Defense & Threat Intel', company: 'Lockheed Martin', mutual: 31, color: '#ec4899,#7c3aed' },
    { name: 'Tariq Al-Mansoor', title: 'Zero Trust Security Architect', company: 'Microsoft Defense', mutual: 15, color: '#059669,#10b981' }
  ];

  grid.innerHTML = people.map(p => `
    <div class="people-card" style="background:rgba(17,17,37,0.9);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:20px;display:flex;flex-direction:column;align-items:center;text-align:center;position:relative">
      <div class="pc-avatar" style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,${p.color});display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:800;color:#fff;margin-bottom:12px;box-shadow:0 0 16px rgba(124,58,237,0.3)">${p.name[0]}</div>
      <div class="pc-name" style="font-size:15px;font-weight:700;color:#fff;margin-bottom:4px">${p.name}</div>
      <div class="pc-title" style="font-size:12px;color:rgba(255,255,255,0.6);margin-bottom:6px">${p.title}</div>
      <div style="font-size:11px;color:#a78bfa;margin-bottom:16px">💼 ${p.company} · ${p.mutual} mutual connections</div>
      <div style="display:flex;gap:8px;width:100%">
        <button class="pc-connect-btn" onclick="showToast('🤝 Connection request sent to ${p.name}!')" style="flex:1;background:linear-gradient(135deg,#7c3aed,#0ea5e9);border:none;color:#fff;padding:8px 14px;border-radius:20px;font-size:12px;font-weight:700;cursor:pointer">+ Connect</button>
        <button onclick="showToast('💬 Opening direct chat with ${p.name}...')" style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);color:#fff;padding:8px 12px;border-radius:20px;font-size:12px;cursor:pointer">💬</button>
      </div>
    </div>
  `).join('');
}

// ═══════════════════════════════════════════════════════════════
// EVENTS HUB
// ═══════════════════════════════════════════════════════════════
function initEventsGrid() {
  const grid = document.getElementById('eventsGrid');
  if (!grid || grid.children.length > 0) return;

  const events = [
    { title: 'Global Zero Trust Summit 2026', date: 'APR 15', time: '1:00 PM EST', format: '🌐 Virtual Keynote', attendees: '2,400 attending', desc: 'Architecture patterns for continuous verification across multi-cloud defense ecosystems.' },
    { title: 'RSA Conference — Cyber Executive Mixer', date: 'MAY 03', time: '6:30 PM PST', format: '📍 San Francisco, CA', attendees: '850 attending', desc: 'Private networking mixer with CISOs, threat hunters, and venture founders.' },
    { title: 'Black Hat USA — Advanced Red Team Labs', date: 'AUG 12', time: '9:00 AM PST', format: '📍 Las Vegas, NV & Virtual', attendees: '4,100 attending', desc: 'Hands-on adversary emulation, active directory exploitation, and EDR evasion masterclass.' },
    { title: 'AWS re:Inforce Cloud Security Briefing', date: 'JUN 22', time: '10:00 AM EST', format: '🌐 Virtual Masterclass', attendees: '1,900 attending', desc: 'Deep dive into automated compliance with AWS Security Hub, GuardDuty, and IAM Identity Center.' }
  ];

  grid.innerHTML = events.map(e => `
    <div class="event-card" style="background:rgba(17,17,37,0.9);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:18px;display:flex;gap:16px;align-items:flex-start;cursor:pointer;transition:transform 0.2s" onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform='none'">
      <div class="ec-date" style="background:linear-gradient(135deg,#7c3aed,#0ea5e9);border-radius:12px;padding:10px 14px;text-align:center;color:#fff;flex-shrink:0">
        <div style="font-size:11px;font-weight:700;opacity:0.8">${e.date.split(' ')[0]}</div>
        <div style="font-size:20px;font-weight:900">${e.date.split(' ')[1]}</div>
      </div>
      <div class="ec-info" style="flex:1">
        <div class="ec-title" style="font-size:15px;font-weight:700;color:#fff;margin-bottom:4px">${e.title}</div>
        <div class="ec-meta" style="font-size:12px;color:#a78bfa;margin-bottom:6px">${e.format} · ${e.time} · ${e.attendees}</div>
        <p style="font-size:12.5px;color:rgba(255,255,255,0.7);line-height:1.5;margin-bottom:12px">${e.desc}</p>
        <button onclick="event.stopPropagation(); showToast('🎟️ RSVP confirmed for ${e.title}!')" style="background:rgba(16,185,129,0.15);border:1px solid rgba(16,185,129,0.35);color:#10b981;border-radius:20px;padding:5px 16px;font-size:12px;font-weight:700;cursor:pointer">✓ RSVP Attending</button>
      </div>
    </div>
  `).join('');
}

// ═══════════════════════════════════════════════════════════════
// GROUPS / SPHERES
// ═══════════════════════════════════════════════════════════════
const SPHERA_GROUPS = [
  {
    id: 'grp-1',
    name: 'Cybersecurity Executives & CISOs',
    members: '14.2K members',
    category: 'Executive',
    banner: '#7c3aed,#ec4899',
    desc: 'Strategic leadership group for CISOs, Directors of Information Security, and executive advisors.',
    posts: [
      { author: 'Sarah Chen, CISO', time: '2h ago', content: 'What is your current posture on third-party SaaS risk scoring? We are migrating from static vendor questionnaires to continuous telemetry monitoring.', likes: 48, comments: 19 },
      { author: 'Elena Rostova', time: '5h ago', content: 'NIST 800-53 Rev 5 compliance checklist template is now updated in the group files section.', likes: 82, comments: 24 }
    ]
  },
  {
    id: 'grp-2',
    name: 'Zero Trust & Cloud Defense Network',
    members: '9.8K members',
    category: 'Architecture',
    banner: '#0ea5e9,#6d28d9',
    desc: 'Practitioners, engineers, and architects deploying continuous identity verification and microsegmentation.',
    posts: [
      { author: 'Marcus Vance', time: '1h ago', content: 'Comparing SPIFFE/SPIRE with Istio mTLS for workload identity in hybrid cloud. Thoughts?', likes: 35, comments: 12 }
    ]
  },
  {
    id: 'grp-3',
    name: 'Federal IT Security & RMF Compliance',
    members: '7.4K members',
    category: 'Gov / Defense',
    banner: '#059669,#10b981',
    desc: 'Navigating FedRAMP High, DoD IL5/IL6, and continuous ATO pipelines.',
    posts: [
      { author: 'Kwesi Asiedu', time: '3h ago', content: 'Automating STIG compliance audits in AWS GovCloud with Terraform & OpenSCAP.', likes: 94, comments: 31 }
    ]
  }
];

let _activeGroupId = 'grp-1';

function initGroupsPage() {
  const myList = document.getElementById('gsMyList');
  const sugList = document.getElementById('gsSugList');

  if (myList) {
    myList.innerHTML = SPHERA_GROUPS.map(g => `
      <div class="gs-item ${g.id === _activeGroupId ? 'active-gsi' : ''}" onclick="selectGroup('${g.id}')" style="background:${g.id === _activeGroupId ? 'rgba(124,58,237,0.18)' : 'rgba(255,255,255,0.03)'};border:1px solid ${g.id === _activeGroupId ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.06)'};border-radius:12px;padding:12px 16px;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between;cursor:pointer">
        <div>
          <div style="font-size:13.5px;font-weight:700;color:#fff">${g.name}</div>
          <div style="font-size:11px;color:rgba(255,255,255,0.45);margin-top:2px">🔮 ${g.members} · <span style="color:#a78bfa">${g.category}</span></div>
        </div>
        <button onclick="event.stopPropagation(); showToast('✓ In Group')" style="background:rgba(124,58,237,0.15);border:1px solid rgba(124,58,237,0.3);color:#c4b5fd;border-radius:16px;padding:4px 12px;font-size:11px;font-weight:700;cursor:pointer">Joined</button>
      </div>
    `).join('');
  }

  if (sugList) {
    const sug = [
      { name: 'Bug Bounty Hunters & 0day Labs', members: '22.4K', cat: 'Offensive' },
      { name: 'Kubernetes & Container Hardening', members: '8.1K', cat: 'DevSecOps' }
    ];
    sugList.innerHTML = sug.map(s => `
      <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);border-radius:12px;padding:10px 14px;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between">
        <div>
          <div style="font-size:12.5px;font-weight:700;color:#fff">${s.name}</div>
          <div style="font-size:10.5px;color:rgba(255,255,255,0.4)">${s.members} members</div>
        </div>
        <button onclick="showToast('✓ Request sent to join ${s.name}')" style="background:linear-gradient(135deg,#7c3aed,#0ea5e9);border:none;color:#fff;border-radius:14px;padding:4px 12px;font-size:11px;font-weight:700;cursor:pointer">+ Join</button>
      </div>
    `).join('');
  }

  selectGroup(_activeGroupId);
}

function selectGroup(groupId) {
  _activeGroupId = groupId;
  const group = SPHERA_GROUPS.find(g => g.id === groupId) || SPHERA_GROUPS[0];
  const main = document.getElementById('groupsMain');
  if (!main) return;

  main.innerHTML = `
    <div style="padding:20px;max-width:760px">
      <!-- Group Header Banner -->
      <div style="background:linear-gradient(135deg,${group.banner});border-radius:18px;padding:28px 24px;color:#fff;margin-bottom:20px;box-shadow:0 8px 32px rgba(0,0,0,0.35)">
        <span style="background:rgba(0,0,0,0.4);backdrop-filter:blur(6px);padding:3px 10px;border-radius:12px;font-size:11px;font-weight:700">${group.category}</span>
        <h2 style="font-size:22px;font-weight:800;margin:8px 0 6px">${group.name}</h2>
        <p style="font-size:13.5px;opacity:0.9;margin:0 0 16px;max-width:540px">${group.desc}</p>
        <div style="display:flex;align-items:center;gap:12px">
          <span style="font-size:12px;font-weight:700">🔮 ${group.members}</span>
          <button onclick="showToast('📢 Notification settings updated')" style="background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.3);color:#fff;border-radius:20px;padding:6px 16px;font-size:12px;font-weight:700;cursor:pointer">🔔 Joined</button>
          <button onclick="showToast('📤 Invite link copied!')" style="background:rgba(255,255,255,0.15);border:none;color:#fff;border-radius:20px;padding:6px 14px;font-size:12px;cursor:pointer">Invite</button>
        </div>
      </div>

      <!-- Post Composer -->
      <div style="background:rgba(17,17,37,0.9);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:16px 20px;margin-bottom:20px">
        <input id="grpPostInput" placeholder="Start a discussion in ${group.name}…" style="width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);color:#fff;border-radius:20px;padding:10px 16px;font-size:13px;outline:none" onkeydown="if(event.key==='Enter')showToast('Discussion transmitted to group!')"/>
      </div>

      <!-- Discussions Feed -->
      <div style="display:flex;flex-direction:column;gap:16px">
        ${group.posts.map(p => `
          <div style="background:rgba(17,17,37,0.9);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:18px 20px">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
              <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,${group.banner});display:flex;align-items:center;justify-content:center;font-weight:800;color:#fff">${p.author[0]}</div>
              <div>
                <div style="font-size:14px;font-weight:700;color:#fff">${p.author}</div>
                <div style="font-size:11px;color:rgba(255,255,255,0.4)">${p.time}</div>
              </div>
            </div>
            <p style="font-size:13.5px;color:rgba(255,255,255,0.85);line-height:1.6;margin-bottom:14px">${p.content}</p>
            <div style="display:flex;gap:12px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.06)">
              <button onclick="showToast('❤️ Liked!')" style="background:transparent;border:none;color:rgba(255,255,255,0.6);font-size:12.5px;cursor:pointer">❤️ ${p.likes}</button>
              <button onclick="showToast('💬 Replying...')" style="background:transparent;border:none;color:rgba(255,255,255,0.6);font-size:12.5px;cursor:pointer">💬 ${p.comments} Comments</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
// ═══════════════════════════════════════════════════════════════
// ELEVATE LEARNING HUB
// ═══════════════════════════════════════════════════════════════
const ELEVATE_COURSES = [
  {
    id: 'course-1',
    title: 'Practical Zero Trust Architecture & Implementation',
    instructor: 'Dr. Marcus Vance, CISSP-ISSAP',
    level: 'Advanced',
    duration: '8 hrs · 12 modules',
    rating: 4.9,
    students: '1,420 enrolled',
    color: '#7c3aed,#ec4899',
    badge: 'Trending 🔥',
    category: 'foryou'
  },
  {
    id: 'course-2',
    title: 'SANS SEC504: Incident Response & Threat Hunting',
    instructor: 'Elena Rostova, GCFA',
    level: 'Intermediate',
    duration: '14 hrs · 18 modules',
    rating: 4.95,
    students: '2,890 enrolled',
    color: '#0ea5e9,#6d28d9',
    badge: 'Popular ✦',
    category: 'paths'
  },
  {
    id: 'course-3',
    title: 'AWS Certified Security - Specialty Exam Deep Dive',
    instructor: 'Priya Sharma, AWS Hero',
    level: 'Advanced',
    duration: '12 hrs · 15 modules',
    rating: 4.85,
    students: '3,100 enrolled',
    color: '#10b981,#0ea5e9',
    badge: 'Cert Prep',
    category: 'certs'
  },
  {
    id: 'course-4',
    title: 'CISSP 8-Domain Mastery & 2026 Exam Simulator',
    instructor: 'Kwesi Asiedu & Global Security Council',
    level: 'Comprehensive',
    duration: '24 hrs · 32 modules',
    rating: 4.92,
    students: '5,400 enrolled',
    color: '#ef4444,#f59e0b',
    badge: 'Must Have',
    category: 'certs'
  },
  {
    id: 'course-5',
    title: 'Offensive Security Web Expert (OSWE) Lab Prep',
    instructor: 'Bishop Fox Red Team Labs',
    level: 'Expert',
    duration: '16 hrs · 20 modules',
    rating: 4.88,
    students: '920 enrolled',
    color: '#ec4899,#7c3aed',
    badge: 'Hands-on',
    category: 'paths'
  },
  {
    id: 'course-6',
    title: 'NIST SP 800-53 Rev 5 & Federal RMF Authorization',
    instructor: 'Federal Cybersecurity Institute',
    level: 'Intermediate',
    duration: '6 hrs · 8 modules',
    rating: 4.8,
    students: '1,150 enrolled',
    color: '#059669,#10b981',
    badge: 'Gov / Defense',
    category: 'foryou'
  }
];

function initElevatePage() {
  const goalsContainer = document.getElementById('elGoals');
  if (goalsContainer) {
    goalsContainer.innerHTML = `
      <div style="padding:10px 0">
        <div style="display:flex;justify-content:space-between;font-size:12px;font-weight:700;color:#fff;margin-bottom:6px">
          <span>Zero Trust Architecture</span><span>75%</span>
        </div>
        <div style="height:6px;background:rgba(255,255,255,0.08);border-radius:4px;overflow:hidden">
          <div style="width:75%;height:100%;background:linear-gradient(90deg,#7c3aed,#0ea5e9)"></div>
        </div>
      </div>
      <div style="padding:10px 0">
        <div style="display:flex;justify-content:space-between;font-size:12px;font-weight:700;color:#fff;margin-bottom:6px">
          <span>CISSP Exam Prep</span><span>90%</span>
        </div>
        <div style="height:6px;background:rgba(255,255,255,0.08);border-radius:4px;overflow:hidden">
          <div style="width:90%;height:100%;background:linear-gradient(90deg,#10b981,#0ea5e9)"></div>
        </div>
      </div>
    `;
  }

  renderElevateCourses('foryou');

  // Wire tab switching
  document.querySelectorAll('.el-tab').forEach(tabBtn => {
    tabBtn.onclick = () => {
      document.querySelectorAll('.el-tab').forEach(b => b.classList.remove('active-eltab'));
      tabBtn.classList.add('active-eltab');
      const tab = tabBtn.dataset.eltab;
      const courseGrid = document.getElementById('elCourseGrid');
      const linkedInPanel = document.getElementById('elLinkedInPanel');

      if (tab === 'linkedin') {
        if (courseGrid) courseGrid.style.display = 'none';
        if (linkedInPanel) linkedInPanel.style.display = 'flex';
      } else {
        if (courseGrid) courseGrid.style.display = 'grid';
        if (linkedInPanel) linkedInPanel.style.display = 'none';
        renderElevateCourses(tab);
      }
    };
  });
}

function renderElevateCourses(cat = 'foryou') {
  const grid = document.getElementById('elCourseGrid');
  if (!grid) return;

  const filtered = cat === 'foryou' ? ELEVATE_COURSES : ELEVATE_COURSES.filter(c => c.category === cat || cat === 'live');
  const displayList = filtered.length > 0 ? filtered : ELEVATE_COURSES;

  grid.innerHTML = displayList.map(c => `
    <div class="el-course-card" onclick="showToast('📚 Opening course: ${c.title}')" style="background:rgba(17,17,37,0.9);border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;cursor:pointer;transition:transform 0.2s" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='none'">
      <div style="height:130px;background:linear-gradient(135deg,${c.color});position:relative;display:flex;align-items:center;justify-content:center;padding:16px">
        <span style="position:absolute;top:10px;left:10px;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:12px">${c.badge}</span>
        <div style="font-size:32px">🎓</div>
        <span style="position:absolute;bottom:10px;right:10px;background:rgba(0,0,0,0.6);color:#fff;font-size:10px;font-weight:600;padding:2px 6px;border-radius:4px">${c.duration}</span>
      </div>
      <div style="padding:16px">
        <div style="font-size:14px;font-weight:700;color:#fff;margin-bottom:6px;line-height:1.35">${c.title}</div>
        <div style="font-size:12px;color:rgba(255,255,255,0.6);margin-bottom:10px">By ${c.instructor}</div>
        <div style="display:flex;align-items:center;justify-content:space-between;font-size:11.5px;color:#a78bfa;padding-top:10px;border-top:1px solid rgba(255,255,255,0.06)">
          <span>★ ${c.rating} (${c.students})</span>
          <span style="color:#10b981;font-weight:700">Start Course →</span>
        </div>
      </div>
    </div>
  `).join('');
}

// ═══════════════════════════════════════════════════════════════
// REELS VERTICAL VIDEO FEED
// ═══════════════════════════════════════════════════════════════
function initReelsPage() {
  const container = document.getElementById('reelsContainer');
  if (!container) return;

  // If already initialized beyond the prompt card, don't duplicate
  if (container.querySelectorAll('.reel-sample-card').length > 0) return;

  const sampleReels = [
    {
      id: 'reel-1',
      creator: 'Alex Rivera',
      handle: '@alexr',
      verified: true,
      caption: '3 Zero Trust architecture mistakes every security engineer makes in 2026 🔥 #ZeroTrust #CloudSec',
      sound: 'Original Audio · Alex Rivera',
      likes: '14.2K',
      comments: '342',
      color: '#7c3aed,#0ea5e9'
    },
    {
      id: 'reel-2',
      creator: 'Elena Rostova',
      handle: '@elena_sec',
      verified: true,
      caption: 'Live demonstration: How we hunted an APT29 threat actor using YARA & Sigma rules 🛡️ #CyberSecurity #ThreatHunting',
      sound: 'Cyber Defense Soundtrack · Elena',
      likes: '28.9K',
      comments: '618',
      color: '#ec4899,#7c3aed'
    },
    {
      id: 'reel-3',
      creator: 'Marcus Johnson',
      handle: '@marcus_oscp',
      verified: false,
      caption: 'Bypassing modern EDR solutions in 60 seconds with custom shellcode injection! ⚡ #RedTeam #OSCP',
      sound: 'Techno Pulse Mix · Marcus',
      likes: '41.5K',
      comments: '912',
      color: '#ef4444,#f59e0b'
    }
  ];

  sampleReels.forEach(r => {
    const card = document.createElement('div');
    card.className = 'reel-card reel-sample-card';
    card.style.cssText = `background:linear-gradient(180deg,rgba(0,0,0,0.2),rgba(0,0,0,0.85)), linear-gradient(135deg,${r.color});position:relative;border-radius:18px;overflow:hidden;display:flex;flex-direction:column;justify-content:flex-end;padding:24px;min-height:540px;margin-bottom:16px;box-shadow:0 8px 32px rgba(0,0,0,0.5)`;
    card.innerHTML = `
      <div style="position:absolute;top:20px;right:20px;background:rgba(0,0,0,0.5);backdrop-filter:blur(6px);color:#fff;font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px">
        🔴 SPHERA REEL
      </div>
      <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:64px;height:64px;border-radius:50%;background:rgba(255,255,255,0.2);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;font-size:24px;color:#fff;cursor:pointer" onclick="showToast('▶ Playing Reel...')">
        ▶
      </div>
      <div style="display:flex;justify-content:space-between;align-items:flex-end;gap:16px;z-index:2">
        <div style="flex:1">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
            <div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,${r.color});display:flex;align-items:center;justify-content:center;font-weight:800;color:#fff;border:2px solid #fff">${r.creator[0]}</div>
            <div>
              <div style="font-weight:800;font-size:15px;color:#fff">${r.creator} ${r.verified ? '<span style="color:#38bdf8">✦</span>' : ''}</div>
              <div style="font-size:12px;color:rgba(255,255,255,0.6)">${r.handle}</div>
            </div>
            <button onclick="showToast('✓ Following ${r.creator}')" style="background:rgba(255,255,255,0.2);backdrop-filter:blur(4px);border:1px solid rgba(255,255,255,0.3);color:#fff;border-radius:20px;padding:3px 12px;font-size:11px;font-weight:700;cursor:pointer;margin-left:8px">Follow</button>
          </div>
          <p style="font-size:13.5px;color:rgba(255,255,255,0.9);line-height:1.4;margin-bottom:8px">${r.caption}</p>
          <div style="font-size:11.5px;color:#a78bfa;display:flex;align-items:center;gap:6px">🎵 ${r.sound}</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:16px">
          <button onclick="showToast('❤️ Liked!')" style="background:rgba(255,255,255,0.15);border:none;width:44px;height:44px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;cursor:pointer"><span style="font-size:18px">❤️</span><span style="font-size:10px;font-weight:700">${r.likes}</span></button>
          <button onclick="showToast('💬 Comments')" style="background:rgba(255,255,255,0.15);border:none;width:44px;height:44px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;cursor:pointer"><span style="font-size:18px">💬</span><span style="font-size:10px;font-weight:700">${r.comments}</span></button>
          <button onclick="showToast('↗ Shared!')" style="background:rgba(255,255,255,0.15);border:none;width:44px;height:44px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;cursor:pointer"><span style="font-size:18px">↗</span><span style="font-size:10px;font-weight:700">Share</span></button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// ═══════════════════════════════════════════════════════════════
// SPHERECHAT / MESSAGES
// ═══════════════════════════════════════════════════════════════
const SC_CONVOS = [
  {
    id: 'sc-1',
    name: 'Sarah Chen, CISO',
    avatar: 'S',
    color: '#0ea5e9,#6d28d9',
    lastMsg: 'Hey Kwesi, loved your post on Zero Trust architecture!',
    time: '12m ago',
    unread: 1,
    messages: [
      { sender: 'them', text: 'Hey Kwesi! Saw your latest post on Zero Trust Architecture and NIST 800-53 implementation.', time: '10:45 AM' },
      { sender: 'them', text: 'Are you available next Tuesday for a quick sync regarding our federal cloud advisory panel?', time: '10:46 AM' },
      { sender: 'me', text: 'Hi Sarah! Absolutely, Tuesday afternoon works great for me. I can share the latest automation framework we built.', time: '10:50 AM' },
      { sender: 'them', text: 'Fantastic! I will send over the calendar invite and agenda.', time: '10:52 AM' }
    ]
  },
  {
    id: 'sc-2',
    name: 'Marcus Johnson (OSCP)',
    avatar: 'M',
    color: '#7c3aed,#ec4899',
    lastMsg: 'Are you taking the OSCP lab this weekend?',
    time: '1h ago',
    unread: 0,
    messages: [
      { sender: 'them', text: 'Hey Kwesi, did you check out the new buffer overflow practice boxes?', time: '9:15 AM' },
      { sender: 'me', text: 'Yes, just completed Box 3! The pivoting technique was tricky.', time: '9:20 AM' }
    ]
  },
  {
    id: 'sc-3',
    name: 'Zero Trust Working Group',
    avatar: 'Z',
    color: '#10b981,#0ea5e9',
    lastMsg: 'Jordan: Next meeting scheduled for Thursday 2pm',
    time: '3h ago',
    unread: 0,
    messages: [
      { sender: 'them', text: 'Reminder: Draft RFC for identity microsegmentation is open for comments.', time: '8:00 AM' }
    ]
  }
];

let _activeScConvoId = 'sc-1';

function initMessagesPage() {
  renderScConvos();
  selectScConvo(_activeScConvoId);
}

function renderScConvos() {
  const list = document.getElementById('scConvoList');
  if (!list) return;

  list.innerHTML = SC_CONVOS.map(c => `
    <div class="sc-convo-item ${c.id === _activeScConvoId ? 'active-scc' : ''}" onclick="selectScConvo('${c.id}')" style="display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.06);cursor:pointer;background:${c.id === _activeScConvoId ? 'rgba(124,58,237,0.15)' : 'transparent'}">
      <div style="width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,${c.color});display:flex;align-items:center;justify-content:center;font-weight:800;color:#fff;flex-shrink:0">${c.avatar}</div>
      <div style="flex:1;min-width:0">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px">
          <span style="font-size:13.5px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${c.name}</span>
          <span style="font-size:10.5px;color:rgba(255,255,255,0.4)">${c.time}</span>
        </div>
        <div style="font-size:12px;color:rgba(255,255,255,0.6);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${c.lastMsg}</div>
      </div>
      ${c.unread ? '<div style="width:8px;height:8px;border-radius:50%;background:#0ea5e9"></div>' : ''}
    </div>
  `).join('');
}

function selectScConvo(convoId) {
  _activeScConvoId = convoId;
  renderScConvos();
  const convo = SC_CONVOS.find(c => c.id === convoId) || SC_CONVOS[0];
  const center = document.getElementById('scCenter');
  if (!center) return;

  center.innerHTML = `
    <div style="display:flex;flex-direction:column;height:100%;background:var(--bg)">
      <!-- Header -->
      <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 20px;border-bottom:1px solid rgba(255,255,255,0.08);background:rgba(17,17,37,0.85);backdrop-filter:blur(12px)">
        <div style="display:flex;align-items:center;gap:12px">
          <div style="width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,${convo.color});display:flex;align-items:center;justify-content:center;font-weight:800;color:#fff">${convo.avatar}</div>
          <div>
            <div style="font-size:14px;font-weight:700;color:#fff">${convo.name}</div>
            <div style="font-size:11px;color:#10b981">🟢 Active in Orbit</div>
          </div>
        </div>
        <div style="display:flex;gap:8px">
          <button onclick="showToast('📞 Initiating secure voice call...')" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:#fff;border-radius:8px;padding:6px 12px;cursor:pointer">📞</button>
          <button onclick="showToast('🎥 Initiating encrypted video session...')" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:#fff;border-radius:8px;padding:6px 12px;cursor:pointer">🎥</button>
        </div>
      </div>

      <!-- Thread -->
      <div style="flex:1;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:14px">
        ${convo.messages.map(m => `
          <div style="display:flex;flex-direction:column;align-items:${m.sender === 'me' ? 'flex-end' : 'flex-start'}">
            <div style="max-width:70%;padding:10px 16px;border-radius:16px;font-size:13.5px;line-height:1.5;background:${m.sender === 'me' ? 'linear-gradient(135deg,#7c3aed,#0ea5e9)' : 'rgba(255,255,255,0.08)'};color:#fff;border:${m.sender === 'me' ? 'none' : '1px solid rgba(255,255,255,0.1)'}">
              ${m.text}
            </div>
            <span style="font-size:10px;color:rgba(255,255,255,0.4);margin-top:4px">${m.time}</span>
          </div>
        `).join('')}
      </div>

      <!-- Input Box -->
      <div style="padding:14px 20px;border-top:1px solid rgba(255,255,255,0.08);background:rgba(17,17,37,0.9);display:flex;align-items:center;gap:10px">
        <button onclick="showToast('📎 Attach file / document')" style="background:none;border:none;color:rgba(255,255,255,0.6);font-size:18px;cursor:pointer">📎</button>
        <input id="scInputMessage" placeholder="Type an encrypted message…" style="flex:1;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);color:#fff;border-radius:24px;padding:10px 18px;font-size:13.5px;outline:none" onkeydown="if(event.key==='Enter')sendScMessage()"/>
        <button onclick="sendScMessage()" style="background:linear-gradient(135deg,#7c3aed,#0ea5e9);border:none;color:#fff;border-radius:20px;padding:8px 20px;font-size:13px;font-weight:700;cursor:pointer">Send</button>
      </div>
    </div>
  `;
}

function sendScMessage() {
  const input = document.getElementById('scInputMessage');
  const text = input ? input.value.trim() : '';
  if (!text) return;
  const convo = SC_CONVOS.find(c => c.id === _activeScConvoId);
  if (convo) {
    convo.messages.push({ sender: 'me', text, time: 'Just now' });
    selectScConvo(_activeScConvoId);
  }
  showToast('🔒 Message transmitted via encrypted protocol');
}

// ═══════════════════════════════════════════════════════════════
// SPHERAMATCH (AI MATCHING DECK)
// ═══════════════════════════════════════════════════════════════
function initLinkedUpPage() {
  const stage = document.getElementById('luCardStage');
  if (!stage || stage.children.length > 0) return;

  const matches = [
    { name: 'Dr. Sarah Lin, PhD', role: 'AI Security Researcher', org: 'MIT / Defense Tech', match: 98, color: '#7c3aed,#ec4899', bio: 'Specializing in LLM adversarial robustness, red teaming generative models, and automated vulnerability detection.', tags: ['AI Red Teaming', 'LLM Defense', 'Python', 'PyTorch'] },
    { name: 'Marcus Vance, CISSP', role: 'Lead Zero Trust Architect', org: 'Cyber Defense Systems', match: 95, color: '#0ea5e9,#6d28d9', bio: 'Spearheading identity federation and continuous posture verification for federal defense agencies.', tags: ['Zero Trust', 'NIST 800-53', 'AWS GovCloud', 'Okta'] },
    { name: 'Amara Okafor', role: 'Staff Cloud Detection Engineer', org: 'CrowdStrike', match: 92, color: '#10b981,#0ea5e9', bio: 'Building real-time detection pipelines and automated remediation across Kubernetes microservices.', tags: ['Detection Eng', 'Falcon', 'Go', 'Kubernetes'] }
  ];

  stage.innerHTML = matches.map((m, i) => `
    <div class="lu-card" style="background:rgba(17,17,37,0.95);border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:24px;position:relative;max-width:420px;margin:0 auto;box-shadow:0 12px 40px rgba(0,0,0,0.5)">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
        <div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,${m.color});display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:800;color:#fff">${m.name[0]}</div>
        <span style="background:rgba(16,185,129,0.15);border:1px solid rgba(16,185,129,0.35);color:#10b981;font-size:12px;font-weight:800;padding:4px 12px;border-radius:20px">✦ ${m.match}% Match</span>
      </div>
      <h3 style="font-size:18px;font-weight:800;color:#fff;margin-bottom:4px">${m.name}</h3>
      <div style="font-size:13px;color:#a78bfa;font-weight:600;margin-bottom:12px">${m.role} · ${m.org}</div>
      <p style="font-size:13px;color:rgba(255,255,255,0.8);line-height:1.5;margin-bottom:16px">${m.bio}</p>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:20px">
        ${m.tags.map(t => `<span style="background:rgba(124,58,237,0.15);border:1px solid rgba(124,58,237,0.3);color:#c4b5fd;font-size:11px;font-weight:600;padding:2px 10px;border-radius:12px">${t}</span>`).join('')}
      </div>
      <div style="display:flex;gap:12px">
        <button onclick="showToast('Pass')" style="flex:1;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);color:rgba(255,255,255,0.6);border-radius:14px;padding:10px;font-weight:700;cursor:pointer">✕ Pass</button>
        <button onclick="showToast('💘 Connected with ${m.name}!')" style="flex:1;background:linear-gradient(135deg,#ec4899,#7c3aed);border:none;color:#fff;border-radius:14px;padding:10px;font-weight:800;cursor:pointer;box-shadow:0 0 16px rgba(236,72,153,0.4)">💘 Connect Orbit</button>
      </div>
    </div>
  `).join('');
}

// ═══════════════════════════════════════════════════════════════
// DISCOVER
// ═══════════════════════════════════════════════════════════════
function initDiscoverGrid() {
  const grid = document.getElementById('discoverGrid');
  if (!grid || grid.children.length > 0) return;

  const items = [
    { title: 'Cybersecurity & Defense', icon: '🛡️', color: '#0ea5e9', desc: '14.8K pulses today' },
    { title: 'Zero Trust Architecture', icon: '🔐', color: '#7c3aed', desc: '8.4K pulses today' },
    { title: 'Cloud & Kubernetes Security', icon: '☁️', color: '#10b981', desc: '6.2K pulses today' },
    { title: 'AI & Machine Learning Red Teaming', icon: '🤖', color: '#ec4899', desc: '11.5K pulses today' },
    { title: 'Offensive Security & Pentesting', icon: '🎯', color: '#ef4444', desc: '9.1K pulses today' },
    { title: 'Federal Compliance & RMF', icon: '🏛️', color: '#f59e0b', desc: '4.7K pulses today' }
  ];

  grid.innerHTML = items.map(it => `
    <div class="discover-card" style="background:rgba(17,17,37,0.9);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:22px;cursor:pointer;transition:transform 0.2s" onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform='none'" onclick="showToast('Exploring topic: ${it.title}...')">
      <div style="font-size:32px;margin-bottom:10px">${it.icon}</div>
      <div style="font-size:16px;font-weight:800;color:#fff;margin-bottom:4px">${it.title}</div>
      <div style="font-size:12px;color:#a78bfa">${it.desc}</div>
    </div>
  `).join('');
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

// ═══════════════════════════════════════════════════════════════
// CREATOR STUDIO
// ═══════════════════════════════════════════════════════════════
function initCreatorStudioPage() {
  const ov = document.getElementById('csOverviewCards');
  if (ov && ov.children.length === 0) {
    const kpis = [
      { label: '30-Day Reach', value: '142.8K', trend: '↑ +32.4%', color: '#7c3aed' },
      { label: 'Impressions', value: '840.2K', trend: '↑ +18.7%', color: '#0ea5e9' },
      { label: 'Follower Growth', value: '+1,240', trend: '↑ +45.1%', color: '#10b981' },
      { label: 'Creator Earnings', value: '$4,850.00', trend: '↑ +28.0%', color: '#f59e0b' }
    ];
    ov.innerHTML = kpis.map(k => `
      <div style="background:rgba(17,17,37,0.9);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:20px">
        <div style="font-size:12px;color:rgba(255,255,255,0.5);margin-bottom:6px">${k.label}</div>
        <div style="font-size:24px;font-weight:800;color:#fff;margin-bottom:4px">${k.value}</div>
        <div style="font-size:11px;font-weight:700;color:${k.color}">${k.trend} vs last month</div>
      </div>
    `).join('');
  }
}

// ═══════════════════════════════════════════════════════════════
// SPHERA PAY
// ═══════════════════════════════════════════════════════════════
function initSpheraPayPage() {
  const tx = document.getElementById('payTransactions');
  if (tx && tx.children.length === 0) {
    const txs = [
      { desc: 'Federal Cloud Advisory Retainer', type: 'incoming', amount: '+$1,200.00', date: 'Today · 2:15 PM', color: '#10b981' },
      { desc: 'AWS Security Testing Sandbox', type: 'outgoing', amount: '-$124.50', date: 'Yesterday', color: '#ef4444' },
      { desc: 'Bazaar Marketplace Order #8491', type: 'incoming', amount: '+$350.00', date: 'Aug 24', color: '#10b981' },
      { desc: 'Sphera Studio AI Cloud Compute', type: 'outgoing', amount: '-$45.00', date: 'Aug 21', color: '#ef4444' }
    ];
    tx.innerHTML = txs.map(t => `
      <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:14px 18px;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between">
        <div>
          <div style="font-size:13.5px;font-weight:700;color:#fff">${t.desc}</div>
          <div style="font-size:11px;color:rgba(255,255,255,0.4)">${t.date}</div>
        </div>
        <div style="font-size:15px;font-weight:800;color:${t.color}">${t.amount}</div>
      </div>
    `).join('');
  }
}

// ═══════════════════════════════════════════════════════════════
// SPACES (LIVE AUDIO ROOMS)
// ═══════════════════════════════════════════════════════════════
function initSpacesPage() {
  const grid = document.getElementById('spacesGrid');
  if (grid && grid.children.length === 0) {
    const spaces = [
      { title: '🔴 CISO Roundtable: Defending Against Autonomous AI Threats', host: 'Sarah Chen & Kwesi Asiedu', listeners: '342 listening', color: '#ef4444,#7c3aed' },
      { title: '🎙 Tech Resume Roast & Live Career Coaching', host: 'Jordan Chen (CrowdStrike)', listeners: '189 listening', color: '#0ea5e9,#6d28d9' },
      { title: '⚡ Red Team Tactics: Live Exploit Walkthrough', host: 'Bishop Fox Labs', listeners: '512 listening', color: '#10b981,#0ea5e9' }
    ];
    grid.innerHTML = spaces.map(s => `
      <div class="space-card" onclick="showToast('🎙 Joining Space: ${s.title}')" style="background:linear-gradient(135deg,${s.color});border-radius:18px;padding:24px;color:#fff;cursor:pointer;margin-bottom:14px;box-shadow:0 8px 32px rgba(0,0,0,0.3)">
        <span style="background:rgba(0,0,0,0.5);backdrop-filter:blur(6px);padding:3px 10px;border-radius:12px;font-size:10.5px;font-weight:700">🔴 LIVE AUDIO</span>
        <h3 style="font-size:17px;font-weight:800;margin:10px 0 6px">${s.title}</h3>
        <div style="font-size:12.5px;opacity:0.9;margin-bottom:14px">Hosted by ${s.host}</div>
        <div style="display:flex;align-items:center;justify-content:space-between">
          <span style="font-size:12px;font-weight:700">👥 ${s.listeners}</span>
          <button style="background:#fff;color:#000;border:none;border-radius:20px;padding:6px 18px;font-size:12px;font-weight:800;cursor:pointer">Join Room →</button>
        </div>
      </div>
    `).join('');
  }
}

// ═══════════════════════════════════════════════════════════════
// STORIES & LIVE
// ═══════════════════════════════════════════════════════════════
function initStoriesPage() { /* Stories handled by initStories */ }
function initLivePage() { /* Live broadcast initialized */ }
function initLocalPage() { /* Local meetups initialized */ }
function initBookclubPage() { /* Book club initialized */ }
function initRecipehubPage() { /* Recipe hub initialized */ }
function initFitnessPage() { /* Fitness initialized */ }
function initTimecapsulePage() { /* Time capsule initialized */ }

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

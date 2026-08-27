
/* ============================================================
   CAREERORBIT TOOLS LAUNCHER — patch appended to app.js
============================================================ */
const CO_TOOLS = [
    { wave: 'Wave 1 — AI Core', icon: '🔍', name: 'Job Signals', desc: 'Find & filter cyber career opportunities', fn: 'coSwitchTab("signals")', col: '#7c3aed' },
    { wave: 'Wave 1 — AI Core', icon: '🪐', name: 'My Orbit', desc: 'Your personal career dashboard', fn: 'coSwitchTab("orbit")', col: '#7c3aed' },
    { wave: 'Wave 1 — AI Core', icon: '⚡', name: 'Skill Probe', desc: 'AI skill gap analysis vs. target roles', fn: 'openSkillProbe()', col: '#7c3aed' },
    { wave: 'Wave 1 — AI Core', icon: '📋', name: 'Orbit Resume', desc: 'AI resume builder & enhancer', fn: 'openOrbitResume()', col: '#7c3aed' },
    { wave: 'Wave 1 — AI Core', icon: '🏆', name: 'Hire Me Mode', desc: 'Reverse marketplace — employers bid for you', fn: 'openHireMe()', col: '#a78bfa' },
    { wave: 'Wave 1 — AI Core', icon: '📈', name: 'Career Path Sim', desc: 'Step-by-step AI career path planner', fn: 'openCPS()', col: '#a78bfa' },
    { wave: 'Wave 1 — AI Core', icon: '🎯', name: 'My Tracker', desc: 'Application pipeline tracker', fn: 'showOrbitTracker()', col: '#a78bfa' },
    { wave: 'Wave 1 — AI Core', icon: '🔔', name: 'Orbit Alerts', desc: 'Job match notifications & alerts', fn: 'showOrbitAlerts()', col: '#a78bfa' },
    { wave: 'Wave 2 — Intelligence', icon: '🚀', name: 'Command Center', desc: '22-tool career intelligence dashboard', fn: 'openCCC()', col: '#6d28d9' },
    { wave: 'Wave 2 — Intelligence', icon: '🔭', name: 'Orbit Intel', desc: 'Company deep-dive intelligence reports', fn: 'openOI()', col: '#6d28d9' },
    { wave: 'Wave 2 — Intelligence', icon: '💵', name: 'Salary War Room', desc: 'Live salary data & negotiation leverage', fn: 'openSWR()', col: '#6d28d9' },
    { wave: 'Wave 2 — Intelligence', icon: '🌑', name: 'Dark Orbit', desc: 'Hidden job market & unadvertised roles', fn: 'openDO()', col: '#6d28d9' },
    { wave: 'Wave 2 — Intelligence', icon: '🙈', name: 'Orbit Blind', desc: 'Blind salary & culture Q&A by company', fn: 'openOB()', col: '#6d28d9' },
    { wave: 'Wave 2 — Intelligence', icon: '🤜', name: 'Team Match', desc: 'Find teammates with complementary skills', fn: 'openTOM()', col: '#6d28d9' },
    { wave: 'Wave 3 — Specialist', icon: '🏥', name: 'MedOrbit', desc: 'Healthcare & medical careers + license check', fn: 'openMED()', col: '#10b981' },
    { wave: 'Wave 3 — Specialist', icon: '🪖', name: 'Command Orbit', desc: 'Cleared/Gov jobs + clearance guide', fn: 'openCOM()', col: '#ef4444' },
    { wave: 'Wave 3 — Specialist', icon: '🎓', name: 'Launch Pad', desc: 'Internships, entry-level & campus roadmap', fn: 'openLP()', col: '#3b82f6' },
    { wave: 'Wave 4 — Gamification', icon: '⚡', name: 'Orbit Score', desc: 'Career readiness score 0–1000 + XP badges', fn: 'openOS()', col: '#fbbf24' },
    { wave: 'Wave 4 — Gamification', icon: '🎮', name: 'Mission Sim', desc: 'NSA/CrowdStrike/AWS scenario simulator', fn: 'openMSIM()', col: '#a78bfa' },
    { wave: 'Wave 5 — Marketplace', icon: '🏪', name: 'Orbit Market', desc: 'Contract listings + rate calculator', fn: 'openOM()', col: '#34d399' },
    { wave: 'Wave 5 — Marketplace', icon: '🕸️', name: 'Orbit Web', desc: 'Company connection radar + referral finder', fn: 'openOM()', col: '#14b8a6' },
    { wave: 'Wave 6 — Excellence', icon: '🎤', name: 'Interview Forge', desc: 'AI mock interviewer with live scoring', fn: 'openIF()', col: '#ec4899' },
    { wave: 'Wave 6 — Excellence', icon: '💼', name: 'Offer Orbit', desc: 'Side-by-side offer comparison', fn: 'openOO()', col: '#ec4899' },
    { wave: 'Wave 6 — Excellence', icon: '🛡️', name: 'Fraud Sentinel', desc: 'Job scam detector AI', fn: 'openFS()', col: '#ec4899' },
    { wave: 'Wave 6 — Excellence', icon: '⭐', name: 'Rep Signal', desc: 'Recruiter & company rating system', fn: 'openRS()', col: '#ec4899' },
    { wave: 'Wave 6 — Excellence', icon: '💰', name: 'Benefits Decoder', desc: 'True $ value of benefits packages', fn: 'openTOV()', col: '#ec4899' },
    { wave: 'Wave 6 — Excellence', icon: '🔍', name: 'Orbit Debrief', desc: 'Rejection analysis + resume auto-patch', fn: 'openOD()', col: '#ec4899' },
    { wave: 'Wave 6 — Excellence', icon: '👁', name: 'Orbit Watch', desc: 'Company watchlist + funding/layoff alerts', fn: 'openOW()', col: '#ec4899' },
    { wave: 'Wave 6 — Excellence', icon: '🗂', name: 'Proof Orbit', desc: 'Portfolio builder + GitHub showcase', fn: 'openPO()', col: '#ec4899' },
    { wave: 'Wave 6 — Excellence', icon: '📝', name: 'Interview Log', desc: 'Interview debrief journal + question bank', fn: 'openMR()', col: '#ec4899' },
    { wave: 'Wave 6 — Excellence', icon: '🤝', name: 'Referral Gateway', desc: 'Warm referral marketplace', fn: 'openORF()', col: '#ec4899' },
    { wave: 'Wave 6 — Excellence', icon: '🗺', name: 'Relocate Intel', desc: 'CoL adjuster + relocation intelligence', fn: 'openORLOC()', col: '#ec4899' },
    { wave: 'Wave 6 — Excellence', icon: '🌱', name: 'Signal Check', desc: 'Mental health & job search wellbeing', fn: 'openSC()', col: '#ec4899' },
    { wave: 'Wave 6 — Excellence', icon: '⏱️', name: 'Offer Timeline', desc: 'Negotiation deadline tracker', fn: 'openOTL()', col: '#f97316' },
    { wave: 'Wave 6 — Excellence', icon: '📡', name: 'Orbit Pulse', desc: 'Live salary pulse across 10 roles', fn: 'openOPulse()', col: '#06b6d4' },
    { wave: 'Wave 6 — Excellence', icon: '🎯', name: 'Skill Gap Radar', desc: 'Personalised skill heatmap vs target role', fn: 'openSGR()', col: '#f43f5e' },
    { wave: 'Wave 6 — Excellence', icon: '🔐', name: 'Orbit Vault', desc: 'Secure document hub for certs & offers', fn: 'openOVault()', col: '#d97706' },
    { wave: 'Wave 7 — Career Intelligence', icon: '📊', name: 'Application Funnel', desc: 'App to offer conversion funnel', fn: 'openAF()', col: '#6366f1' },
    { wave: 'Wave 7 — Career Intelligence', icon: '🎯', name: 'JD Match Scorer', desc: 'Paste JD to get % match + keywords', fn: 'openJDM()', col: '#0ea5e9' },
    { wave: 'Wave 7 — Career Intelligence', icon: '📄', name: 'Resume Score', desc: 'ATS score + gap analysis + auto bullets', fn: 'openRS()', col: '#8b5cf6' },
    { wave: 'Wave 7 — Career Intelligence', icon: '🎓', name: 'CPE/CEU Tracker', desc: 'Cert renewal credit tracker', fn: 'openCPE()', col: '#10b981' },
    { wave: 'Wave 7 — Career Intelligence', icon: '💬', name: 'Negotiation Script', desc: 'Word-for-word negotiation script', fn: 'openNeg()', col: '#ec4899' },
    { wave: 'Wave 8 — New Tools', icon: '🎤', name: 'Interview Prep Builder', desc: 'STAR answers + AI practice mode', fn: 'openIP()', col: '#6d28d9' },
    { wave: 'Wave 8 — New Tools', icon: '📋', name: 'Reference Manager', desc: '5 refs with email generator', fn: 'openRef()', col: '#14b8a6' },
    { wave: 'Wave 8 — New Tools', icon: '💰', name: 'Total Comp Builder', desc: '3-offer side-by-side chart', fn: 'openTCB()', col: '#059669' },
    { wave: 'Wave 8 — New Tools', icon: '📅', name: 'Career Timeline', desc: 'Visual milestone timeline', fn: 'openCTL()', col: '#3b82f6' },
    { wave: 'Wave 8 — New Tools', icon: '📰', name: 'Orbit News', desc: 'Curated cyber careers news feed', fn: 'openONWS()', col: '#ea580c' },
    { wave: 'AI Powered', icon: '✦', name: 'Career Intelligence Scan', desc: 'AI-driven job match + skill gap scan', fn: 'openCI()', col: '#7c3aed' },
];
var _coToolsOpen = false;
function toggleCoToolsMenu() {
    _coToolsOpen = !_coToolsOpen;
    var menu = document.getElementById('coToolsMenu');
    var chev = document.getElementById('coToolsChevron');
    if (!menu) return;
    menu.style.display = _coToolsOpen ? 'block' : 'none';
    if (chev) chev.style.transform = _coToolsOpen ? 'rotate(180deg)' : '';
    if (_coToolsOpen) { renderCoTools(CO_TOOLS); setTimeout(function () { var s = document.getElementById('coToolSearch'); if (s) s.focus(); }, 100); }
}
function filterCoTools(q) {
    var ql = (q || '').toLowerCase().trim();
    if (!ql) { renderCoTools(CO_TOOLS); return; }
    renderCoTools(CO_TOOLS.filter(function (t) { return t.name.toLowerCase().includes(ql) || t.desc.toLowerCase().includes(ql) || t.wave.toLowerCase().includes(ql); }));
}
function renderCoTools(items) {
    var list = document.getElementById('coToolsList'); if (!list) return;
    if (!items.length) { list.innerHTML = '<div style="padding:24px;text-align:center;color:rgba(255,255,255,.3);font-size:12px">No tools found</div>'; return; }
    var groups = {};
    items.forEach(function (t) { if (!groups[t.wave]) groups[t.wave] = []; groups[t.wave].push(t); });
    list.innerHTML = Object.keys(groups).map(function (wave) {
        var tools = groups[wave];
        return '<div class="co-tools-group">' + wave + ' <span style="color:rgba(255,255,255,.2)">(' + tools.length + ')</span></div>' +
            tools.map(function (t) {
                var fn = t.fn.replace(/'/g, "\\'");
                return '<div class="co-tool-item" onclick="coRunTool(\'' + fn + '\')">' +
                    '<div class="co-tool-icon" style="background:' + t.col + '18;border:1px solid ' + t.col + '33">' + t.icon + '</div>' +
                    '<div style="flex:1;min-width:0"><div class="co-tool-name">' + t.name + '</div><div class="co-tool-desc">' + t.desc + '</div></div>' +
                    '<span class="co-wave-badge" style="background:' + t.col + '18;color:' + t.col + ';border:1px solid ' + t.col + '33">↵</span>' +
                    '</div>';
            }).join('');
    }).join('');
}
function coRunTool(fn) {
    toggleCoToolsMenu();
    try { eval(fn); } catch (e) { console.warn('co tool error:', e); }
}
document.addEventListener('click', function (e) {
    if (_coToolsOpen && !e.target.closest('#coToolsDropBtn') && !e.target.closest('#coToolsMenu')) {
        _coToolsOpen = false;
        var menu = document.getElementById('coToolsMenu');
        var chev = document.getElementById('coToolsChevron');
        if (menu) menu.style.display = 'none';
        if (chev) chev.style.transform = '';
    }
});

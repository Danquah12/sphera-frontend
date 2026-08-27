#!/bin/bash
# Run this on the production server to fix the empty CareerOrbit tools dropdown
# Usage: bash /tmp/fix_co_tools.sh

APPJS="/opt/sphera/app.js"

echo "Patching $APPJS..."

# Append the fix to override the broken functions
cat >> "$APPJS" << 'JSEOF'

/* === CAREERORBIT TOOLS FIX (override) === */
window.CO_TOOLS = [
  { wave:'Wave 1 — AI Core', icon:'🔍', name:'Job Signals', desc:'Find & filter career opportunities', fn:'coSwitchTab("signals")', col:'#7c3aed' },
  { wave:'Wave 1 — AI Core', icon:'🪐', name:'My Orbit', desc:'Your personal career dashboard', fn:'coSwitchTab("orbit")', col:'#7c3aed' },
  { wave:'Wave 1 — AI Core', icon:'⚡', name:'Skill Probe', desc:'AI skill gap analysis', fn:'openSkillProbe()', col:'#7c3aed' },
  { wave:'Wave 1 — AI Core', icon:'📋', name:'Orbit Resume', desc:'AI resume builder', fn:'openOrbitResume()', col:'#7c3aed' },
  { wave:'Wave 1 — AI Core', icon:'🏆', name:'Hire Me Mode', desc:'Employers bid for you', fn:'openHireMe()', col:'#a78bfa' },
  { wave:'Wave 1 — AI Core', icon:'📈', name:'Career Path Sim', desc:'AI career path planner', fn:'openCPS()', col:'#a78bfa' },
  { wave:'Wave 1 — AI Core', icon:'🎯', name:'My Tracker', desc:'Application pipeline tracker', fn:'showOrbitTracker()', col:'#a78bfa' },
  { wave:'Wave 2 — Intelligence', icon:'🚀', name:'Command Center', desc:'22-tool career dashboard', fn:'openCCC()', col:'#6d28d9' },
  { wave:'Wave 2 — Intelligence', icon:'🔭', name:'Orbit Intel', desc:'Company intelligence reports', fn:'openOI()', col:'#6d28d9' },
  { wave:'Wave 2 — Intelligence', icon:'💵', name:'Salary War Room', desc:'Live salary data', fn:'openSWR()', col:'#6d28d9' },
  { wave:'Wave 2 — Intelligence', icon:'🌑', name:'Dark Orbit', desc:'Hidden job market', fn:'openDO()', col:'#6d28d9' },
  { wave:'Wave 2 — Intelligence', icon:'🙈', name:'Orbit Blind', desc:'Blind salary & culture Q&A', fn:'openOB()', col:'#6d28d9' },
  { wave:'Wave 3 — Specialist', icon:'🏥', name:'MedOrbit', desc:'Healthcare + license check', fn:'openMED()', col:'#10b981' },
  { wave:'Wave 3 — Specialist', icon:'🪖', name:'Command Orbit', desc:'Cleared/Gov jobs + clearance guide', fn:'openCOM()', col:'#ef4444' },
  { wave:'Wave 3 — Specialist', icon:'🎓', name:'Launch Pad', desc:'Internships & entry-level', fn:'openLP()', col:'#3b82f6' },
  { wave:'Wave 4 — Gamification', icon:'⚡', name:'Orbit Score', desc:'Career readiness 0-1000', fn:'openOS()', col:'#fbbf24' },
  { wave:'Wave 4 — Gamification', icon:'🎮', name:'Mission Sim', desc:'NSA/AWS scenario simulator', fn:'openMSIM()', col:'#a78bfa' },
  { wave:'Wave 5 — Marketplace', icon:'🏪', name:'Orbit Market', desc:'Contract listings + rate calc', fn:'openOM()', col:'#34d399' },
  { wave:'Wave 6 — Excellence', icon:'🎤', name:'Interview Forge', desc:'AI mock interviewer', fn:'openIF()', col:'#ec4899' },
  { wave:'Wave 6 — Excellence', icon:'💼', name:'Offer Orbit', desc:'Side-by-side offer comparison', fn:'openOO()', col:'#ec4899' },
  { wave:'Wave 6 — Excellence', icon:'🛡️', name:'Fraud Sentinel', desc:'Job scam detector AI', fn:'openFS()', col:'#ec4899' },
  { wave:'Wave 6 — Excellence', icon:'💰', name:'Benefits Decoder', desc:'True value of benefits', fn:'openTOV()', col:'#ec4899' },
  { wave:'Wave 6 — Excellence', icon:'⏱️', name:'Offer Timeline', desc:'Negotiation deadline tracker', fn:'openOTL()', col:'#f97316' },
  { wave:'Wave 6 — Excellence', icon:'📡', name:'Orbit Pulse', desc:'Live salary pulse 10 roles', fn:'openOPulse()', col:'#06b6d4' },
  { wave:'Wave 6 — Excellence', icon:'🎯', name:'Skill Gap Radar', desc:'Skill heatmap vs target role', fn:'openSGR()', col:'#f43f5e' },
  { wave:'Wave 6 — Excellence', icon:'🔐', name:'Orbit Vault', desc:'Secure document hub', fn:'openOVault()', col:'#d97706' },
  { wave:'Wave 7 — Intelligence', icon:'📊', name:'Application Funnel', desc:'App to offer conversion', fn:'openAF()', col:'#6366f1' },
  { wave:'Wave 7 — Intelligence', icon:'🎯', name:'JD Match Scorer', desc:'Paste JD get match score', fn:'openJDM()', col:'#0ea5e9' },
  { wave:'Wave 7 — Intelligence', icon:'📄', name:'Resume Score', desc:'ATS score + auto bullets', fn:'openRS()', col:'#8b5cf6' },
  { wave:'Wave 7 — Intelligence', icon:'🎓', name:'CPE Tracker', desc:'Cert renewal tracker', fn:'openCPE()', col:'#10b981' },
  { wave:'Wave 7 — Intelligence', icon:'💬', name:'Negotiation Script', desc:'Word-for-word script', fn:'openNeg()', col:'#ec4899' },
  { wave:'Wave 8 — New Tools', icon:'🎤', name:'Interview Prep', desc:'STAR answers + practice', fn:'openIP()', col:'#6d28d9' },
  { wave:'Wave 8 — New Tools', icon:'📋', name:'References', desc:'5 refs + email generator', fn:'openRef()', col:'#14b8a6' },
  { wave:'Wave 8 — New Tools', icon:'💰', name:'Comp Builder', desc:'3-offer comparison chart', fn:'openTCB()', col:'#059669' },
  { wave:'Wave 8 — New Tools', icon:'📅', name:'Career Timeline', desc:'Visual milestone timeline', fn:'openCTL()', col:'#3b82f6' },
  { wave:'Wave 8 — New Tools', icon:'📰', name:'Orbit News', desc:'Cyber careers news feed', fn:'openONWS()', col:'#ea580c' },
  { wave:'AI Powered', icon:'✦', name:'Career Intelligence Scan', desc:'AI job match + skill gap', fn:'openCI()', col:'#7c3aed' },
];

window._coToolsOpenState = false;

window.toggleCoToolsMenu = function() {
  window._coToolsOpenState = !window._coToolsOpenState;
  var menu = document.getElementById('coToolsMenu');
  var chev = document.getElementById('coToolsChevron');
  if (!menu) return;
  menu.style.display = window._coToolsOpenState ? 'block' : 'none';
  if (chev) chev.style.transform = window._coToolsOpenState ? 'rotate(180deg)' : '';
  if (window._coToolsOpenState) {
    window.renderCoTools(window.CO_TOOLS);
    setTimeout(function(){ var s=document.getElementById('coToolSearch'); if(s) s.focus(); }, 100);
  }
};

window.filterCoTools = function(q) {
  var ql = (q||'').toLowerCase().trim();
  window.renderCoTools(!ql ? window.CO_TOOLS : window.CO_TOOLS.filter(function(t){
    return t.name.toLowerCase().includes(ql) || t.desc.toLowerCase().includes(ql);
  }));
};

window.renderCoTools = function(items) {
  var list = document.getElementById('coToolsList');
  if (!list) return;
  if (!items || !items.length) {
    list.innerHTML = '<div style="padding:24px;text-align:center;color:rgba(255,255,255,.3);font-size:12px">No tools found</div>';
    return;
  }
  var groups = {};
  items.forEach(function(t){ if(!groups[t.wave]) groups[t.wave]=[]; groups[t.wave].push(t); });
  list.innerHTML = Object.keys(groups).map(function(wave){
    return '<div style="font-size:9px;font-weight:800;text-transform:uppercase;color:rgba(255,255,255,.3);padding:10px 14px 4px;letter-spacing:.06em">'+wave+'</div>'+
      groups[wave].map(function(t){
        var fn = t.fn.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
        return '<div onclick="window.coRunTool(\''+fn+'\')" style="display:flex;align-items:center;gap:10px;padding:9px 14px;cursor:pointer" onmouseover="this.style.background=\'rgba(124,58,237,.2)\'" onmouseout="this.style.background=\'\'">'+
          '<div style="width:30px;height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;background:'+t.col+'18;border:1px solid '+t.col+'33">'+t.icon+'</div>'+
          '<div style="flex:1;min-width:0"><div style="font-size:12px;font-weight:700;color:#fff">'+t.name+'</div><div style="font-size:10px;color:rgba(255,255,255,.4)">'+t.desc+'</div></div>'+
          '<span style="font-size:10px;color:rgba(255,255,255,.2)">↵</span>'+
        '</div>';
      }).join('');
  }).join('');
};

window.coRunTool = function(fn) {
  window.toggleCoToolsMenu();
  try { eval(fn); } catch(e) { console.warn('tool error:',e); }
};

// Rebind button click
(function rebindBtn() {
  var btn = document.getElementById('coToolsDropBtn');
  if (btn) {
    btn.setAttribute('onclick', '');
    btn.onclick = window.toggleCoToolsMenu;
  }
  var inp = document.getElementById('coToolSearch');
  if (inp) inp.oninput = function(){ window.filterCoTools(this.value); };
})();

document.addEventListener('click', function(e) {
  if (window._coToolsOpenState && !e.target.closest('#coToolsDropBtn') && !e.target.closest('#coToolsMenu')) {
    window._coToolsOpenState = false;
    var m = document.getElementById('coToolsMenu');
    var c = document.getElementById('coToolsChevron');
    if (m) m.style.display = 'none';
    if (c) c.style.transform = '';
  }
}, true);
/* === END CAREERORBIT TOOLS FIX === */
JSEOF

echo "Done patching app.js"

# Reload nginx to serve updated file
docker ps --format "{{.Names}}" | grep -i frontend | xargs -I{} docker exec {} nginx -s reload
echo "Nginx reloaded — hard refresh the site now"

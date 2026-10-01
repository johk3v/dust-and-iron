/* ============================================================
   DUST & IRON — Game Engine
   Tick-based idle engine: skills (gather/produce), inventory,
   bank, equipment, and turn-based combat. Autosaves to
   localStorage and simulates offline progress on load.
   ============================================================ */

const SAVE_KEY = "dustAndIronSave_v1";
const TICK_MS = 100;

// ---------- Default state ----------
function freshState() {
  const skillLevels = {};
  const skillXp = {};
  Object.keys(SKILLS).forEach(k => { skillLevels[k] = 1; skillXp[k] = 0; });

  return {
    gold: 50,
    inventory: {}, // itemId -> qty
    skillXp,
    skillLevels,
    combat: {
      level: 1,
      xp: 0,
      hp: 50,
      maxHp: 50,
      equippedWeapon: "rusty_six_shooter",
      region: "dusty_gulch",
      monsterId: null,
      monsterHp: 0,
      inBattle: false,
    },
    currentAction: null, // { skillId, actionId, progress (0-1), startedAt }
    lastSeen: Date.now(),
  };
}

let state = loadState();
let lastTick = Date.now();

function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return freshState();
    const parsed = JSON.parse(raw);
    const fresh = freshState();
    // shallow-merge to survive future added fields
    const merged = Object.assign({}, fresh, parsed);
    merged.combat = Object.assign({}, fresh.combat, parsed.combat || {});
    merged.skillLevels = Object.assign({}, fresh.skillLevels, parsed.skillLevels || {});
    merged.skillXp = Object.assign({}, fresh.skillXp, parsed.skillXp || {});
    return merged;
  } catch (e) {
    console.warn("Save corrupted, starting fresh", e);
    return freshState();
  }
}

function saveState() {
  state.lastSeen = Date.now();
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

// ---------- XP / leveling math (Melvor-style exponential curve) ----------
function xpForLevel(level) {
  // total xp required to REACH this level
  let total = 0;
  for (let l = 1; l < level; l++) {
    total += Math.floor(100 * Math.pow(1.104, l - 1));
  }
  return Math.floor(total);
}

function levelFromXp(xp) {
  let level = 1;
  while (xp >= xpForLevel(level + 1) && level < 99) level++;
  return level;
}

function addXp(skillId, amount) {
  state.skillXp[skillId] = (state.skillXp[skillId] || 0) + amount;
  const newLevel = levelFromXp(state.skillXp[skillId]);
  if (newLevel > state.skillLevels[skillId]) {
    state.skillLevels[skillId] = newLevel;
    toast(`🎉 ${SKILLS[skillId].name} leveled up to ${newLevel}!`);
  }
}

function addCombatXp(amount) {
  state.combat.xp += amount;
  const newLevel = levelFromXp(state.combat.xp);
  if (newLevel > state.combat.level) {
    state.combat.level = newLevel;
    state.combat.maxHp = 50 + (newLevel - 1) * 6;
    state.combat.hp = state.combat.maxHp; // full heal on level up
    toast(`⚔️ Combat level up! Now level ${newLevel}`);
  }
}

// ---------- Inventory helpers ----------
function addItem(itemId, qty) {
  state.inventory[itemId] = (state.inventory[itemId] || 0) + qty;
}

function removeItem(itemId, qty) {
  state.inventory[itemId] = (state.inventory[itemId] || 0) - qty;
  if (state.inventory[itemId] <= 0) delete state.inventory[itemId];
}

function hasItems(consumes) {
  if (!consumes) return true;
  return consumes.every(c => (state.inventory[c.item] || 0) >= c.qty);
}

// ---------- Actions (gathering/production) ----------
function findAction(skillId, actionId) {
  return SKILLS[skillId].actions.find(a => a.id === actionId);
}

function startAction(skillId, actionId) {
  const action = findAction(skillId, actionId);
  if (!action) return;
  if (state.skillLevels[skillId] < action.level) {
    toast(`Need ${SKILLS[skillId].name} level ${action.level}`);
    return;
  }
  if (action.consumes && !hasItems(action.consumes)) {
    toast("Not enough materials!");
    return;
  }
  state.currentAction = {
    skillId, actionId,
    progress: 0,
    duration: action.time,
  };
  render();
}

function stopAction() {
  state.currentAction = null;
  render();
}

function completeAction() {
  const { skillId, actionId } = state.currentAction;
  const action = findAction(skillId, actionId);
  if (!action) { state.currentAction = null; return; }

  if (action.consumes && !hasItems(action.consumes)) {
    toast("Ran out of materials.");
    state.currentAction = null;
    return;
  }
  if (action.consumes) action.consumes.forEach(c => removeItem(c.item, c.qty));
  action.yields.forEach(y => addItem(y.item, y.qty));
  addXp(skillId, action.xp);

  // loop the action
  state.currentAction.progress = 0;
}

// ---------- Combat ----------
function getEquippedWeapon() {
  return ITEMS[state.combat.equippedWeapon];
}

function getRegion() {
  return REGIONS.find(r => r.id === state.combat.region);
}

function startBattle(monsterDefId) {
  const region = getRegion();
  const monsterDef = region.monsters.find(m => m.id === monsterDefId);
  if (!monsterDef) return;
  state.combat.monsterId = monsterDefId;
  state.combat.monsterHp = monsterDef.hp;
  state.combat.inBattle = true;
  state.combat.playerAttackCd = 0;
  state.combat.monsterAttackCd = 0;
  logCombat(`A ${monsterDef.name} appears!`);
  render();
}

function fleeBattle() {
  state.combat.inBattle = false;
  state.combat.monsterId = null;
  logCombat("You retreat from the fight.");
  render();
}

function logCombat(msg) {
  const logEl = document.getElementById("combat-log");
  if (!logEl) return;
  const div = document.createElement("div");
  div.textContent = msg;
  logEl.appendChild(div);
  logEl.scrollTop = logEl.scrollHeight;
  while (logEl.children.length > 60) logEl.removeChild(logEl.firstChild);
}

function combatTick(deltaSec) {
  if (!state.combat.inBattle) return;
  const region = getRegion();
  const monsterDef = region.monsters.find(m => m.id === state.combat.monsterId);
  if (!monsterDef) return;

  const weapon = getEquippedWeapon();
  const ammoOk = (state.inventory[weapon.ammo] || 0) > 0;

  state.combat.playerAttackCd = (state.combat.playerAttackCd || 0) - deltaSec;
  state.combat.monsterAttackCd = (state.combat.monsterAttackCd || 0) - deltaSec;

  if (state.combat.playerAttackCd <= 0) {
    state.combat.playerAttackCd = weapon.speed;
    if (!ammoOk) {
      logCombat("Out of ammo! Buy/craft more bullets.");
    } else {
      removeItem(weapon.ammo, 1);
      const dmg = Math.floor(Math.random() * (weapon.dmgMax - weapon.dmgMin + 1)) + weapon.dmgMin;
      state.combat.monsterHp -= dmg;
      logCombat(`You hit ${monsterDef.name} for ${dmg} damage.`);
      if (state.combat.monsterHp <= 0) {
        handleMonsterDeath(monsterDef);
        return;
      }
    }
  }

  if (state.combat.monsterAttackCd <= 0) {
    state.combat.monsterAttackCd = monsterDef.speed;
    const dmg = Math.floor(Math.random() * (monsterDef.dmgMax - monsterDef.dmgMin + 1)) + monsterDef.dmgMin;
    state.combat.hp -= dmg;
    logCombat(`${monsterDef.name} hits you for ${dmg} damage.`);
    if (state.combat.hp <= 0) {
      handlePlayerDeath();
      return;
    }
  }
}

function handleMonsterDeath(monsterDef) {
  logCombat(`💀 You defeated ${monsterDef.name}!`);
  addCombatXp(monsterDef.xp);
  const gold = Math.floor(Math.random() * (monsterDef.goldMax - monsterDef.goldMin + 1)) + monsterDef.goldMin;
  state.gold += gold;
  logCombat(`Looted ${gold} dollars.`);
  (monsterDef.loot || []).forEach(l => {
    if (Math.random() < l.chance) {
      addItem(l.item, l.qty);
      logCombat(`Found ${ITEMS[l.item].name} x${l.qty}!`);
    }
  });
  // respawn next monster of same type automatically
  state.combat.monsterHp = monsterDef.hp;
  state.combat.playerAttackCd = 0;
  state.combat.monsterAttackCd = 0;
}

function handlePlayerDeath() {
  logCombat("☠️ You were knocked out! You wake up back in town, having lost some dollars.");
  state.gold = Math.floor(state.gold * 0.8);
  state.combat.hp = state.combat.maxHp;
  state.combat.inBattle = false;
  state.combat.monsterId = null;
}

function equipWeapon(weaponId) {
  state.combat.equippedWeapon = weaponId;
  render();
}

function setRegion(regionId) {
  state.combat.region = regionId;
  state.combat.inBattle = false;
  state.combat.monsterId = null;
  render();
}

// ---------- Selling / bank ----------
function sellItem(itemId, qty) {
  const have = state.inventory[itemId] || 0;
  const sellQty = Math.min(qty, have);
  if (sellQty <= 0) return;
  removeItem(itemId, sellQty);
  state.gold += ITEMS[itemId].sell * sellQty;
  render();
}

function sellAll() {
  Object.keys(state.inventory).forEach(itemId => {
    sellItem(itemId, state.inventory[itemId]);
  });
  toast("Sold entire inventory.");
}

// ---------- Offline progress ----------
function simulateOffline() {
  const now = Date.now();
  const elapsedSec = Math.max(0, (now - (state.lastSeen || now)) / 1000);
  if (elapsedSec < 5) return;

  const cappedSec = Math.min(elapsedSec, 8 * 3600); // cap at 8 hours
  let gained = { gold: 0, items: {}, xp: {} };

  if (state.currentAction) {
    const action = findAction(state.currentAction.skillId, state.currentAction.actionId);
    if (action) {
      let cycles = Math.floor(cappedSec / action.duration);
      // limit by available materials for production actions
      if (action.consumes) {
        let maxByMats = Infinity;
        action.consumes.forEach(c => {
          const have = state.inventory[c.item] || 0;
          maxByMats = Math.min(maxByMats, Math.floor(have / c.qty));
        });
        cycles = Math.min(cycles, maxByMats);
      }
      for (let i = 0; i < cycles; i++) {
        if (action.consumes) action.consumes.forEach(c => removeItem(c.item, c.qty));
        action.yields.forEach(y => { addItem(y.item, y.qty); gained.items[y.item] = (gained.items[y.item]||0) + y.qty; });
        addXp(state.currentAction.skillId, action.xp);
        gained.xp[state.currentAction.skillId] = (gained.xp[state.currentAction.skillId]||0) + action.xp;
      }
      if (cycles > 0) {
        toast(`⏳ While away: ${cycles}x ${action.name}`);
      }
    }
  }

  state.lastSeen = now;
}

// ---------- Main loop ----------
function gameLoop() {
  const now = Date.now();
  const deltaSec = (now - lastTick) / 1000;
  lastTick = now;

  if (state.currentAction) {
    state.currentAction.progress += deltaSec / state.currentAction.duration;
    if (state.currentAction.progress >= 1) {
      completeAction();
    }
    updateActionBar();
  }

  if (state.combat.inBattle) {
    combatTick(deltaSec);
    updateCombatView();
  }

  updateGoldDisplay();
}

setInterval(gameLoop, TICK_MS);
setInterval(saveState, 5000);

// ============================================================
// RENDERING
// ============================================================

let activeTab = "prospecting";

function toast(msg) {
  const container = document.getElementById("toast-container");
  const div = document.createElement("div");
  div.className = "toast";
  div.textContent = msg;
  container.appendChild(div);
  setTimeout(() => div.remove(), 3500);
}

function updateGoldDisplay() {
  const el = document.getElementById("gold-amount");
  if (el) el.textContent = state.gold.toLocaleString();
}

function updateActionBar() {
  const bar = document.getElementById("current-action-bar");
  if (!state.currentAction) { bar.classList.add("hidden"); return; }
  bar.classList.remove("hidden");
  const action = findAction(state.currentAction.skillId, state.currentAction.actionId);
  document.getElementById("current-action-label").textContent =
    `${SKILLS[state.currentAction.skillId].icon} ${action.name}`;
  document.getElementById("current-action-progress").style.width =
    `${Math.min(100, state.currentAction.progress * 100)}%`;
}

function renderSkillTab(skillId) {
  const skill = SKILLS[skillId];
  const level = state.skillLevels[skillId];
  const xp = state.skillXp[skillId];
  const xpStart = xpForLevel(level);
  const xpEnd = xpForLevel(level + 1);
  const pct = level >= 99 ? 100 : Math.floor(((xp - xpStart) / (xpEnd - xpStart)) * 100);

  let html = `
    <div class="panel">
      <div class="skill-header">
        <h2>${skill.icon} ${skill.name}</h2>
        <div class="level-badge">Lv. ${level}</div>
      </div>
      <div class="xp-bar-outer"><div class="xp-bar-inner" style="width:${pct}%"></div></div>
      <div class="action-list">
  `;

  skill.actions.forEach(action => {
    const locked = level < action.level;
    const isActive = state.currentAction &&
      state.currentAction.skillId === skillId &&
      state.currentAction.actionId === action.id;
    const matsOk = hasItems(action.consumes);

    const yieldsStr = action.yields.map(y => `${ITEMS[y.item].icon} ${ITEMS[y.item].name} x${y.qty}`).join(", ");
    const consumesStr = action.consumes
      ? "Needs: " + action.consumes.map(c => `${ITEMS[c.item].icon} ${ITEMS[c.item].name} x${c.qty}`).join(", ")
      : "";

    html += `
      <div class="action-row ${locked ? 'locked' : ''}">
        <div class="action-info">
          <div class="action-name">${action.name} ${locked ? `(Req. Lv.${action.level})` : ''}</div>
          <div class="action-sub">${yieldsStr} · ${action.xp} xp · ${action.time}s ${consumesStr ? '· ' + consumesStr : ''}</div>
        </div>
        <button class="action-btn ${isActive ? 'active-action' : ''}"
          ${locked || (!matsOk && action.consumes) ? 'disabled' : ''}
          onclick="${isActive ? 'stopAction()' : `startAction('${skillId}','${action.id}')`}">
          ${isActive ? 'Stop' : 'Start'}
        </button>
      </div>
    `;
  });

  html += `</div></div>`;
  document.getElementById(`tab-${skillId}`).innerHTML = html;
}

function renderCombatTab() {
  const region = getRegion();
  const weapon = getEquippedWeapon();
  const ownedWeapons = Object.keys(state.inventory).filter(id => ITEMS[id].type === "weapon" && ITEMS[id].combatLvl <= state.combat.level);
  if (state.combat.equippedWeapon === "rusty_six_shooter") ownedWeapons.unshift("rusty_six_shooter");

  const weaponOptions = Array.from(new Set(["rusty_six_shooter", ...ownedWeapons]))
    .map(id => `<option value="${id}" ${id === state.combat.equippedWeapon ? 'selected' : ''}>${ITEMS[id].name}</option>`)
    .join("");

  const regionButtons = REGIONS.map(r => {
    const locked = state.combat.level < r.unlockCombatLvl;
    return `<button class="region-btn ${r.id === region.id ? 'active' : ''}" ${locked ? 'disabled' : ''}
      onclick="setRegion('${r.id}')">${r.name} ${locked ? `(Lv.${r.unlockCombatLvl})` : ''}</button>`;
  }).join("");

  const combatXp = state.combat.xp;
  const combatXpStart = xpForLevel(state.combat.level);
  const combatXpEnd = xpForLevel(state.combat.level + 1);
  const combatPct = state.combat.level >= 99 ? 100 : Math.floor(((combatXp - combatXpStart) / (combatXpEnd - combatXpStart)) * 100);

  let monsterListHtml = "";
  if (!state.combat.inBattle) {
    monsterListHtml = `<div class="monster-list">` + region.monsters.map(m => `
      <div class="action-row">
        <div class="action-info">
          <div class="action-name">${m.icon} ${m.name}</div>
          <div class="action-sub">HP ${m.hp} · ${m.dmgMin}-${m.dmgMax} dmg · ${m.xp} xp · ${m.goldMin}-${m.goldMax}$</div>
        </div>
        <button class="action-btn" onclick="startBattle('${m.id}')">Engage</button>
      </div>
    `).join("") + `</div>`;
  }

  let battleHtml = "";
  if (state.combat.inBattle) {
    const monsterDef = region.monsters.find(m => m.id === state.combat.monsterId);
    const monsterHpPct = Math.max(0, (state.combat.monsterHp / monsterDef.hp) * 100);
    battleHtml = `
      <div class="combat-grid">
        <div class="combatant">
          <div>🤠 You (Lv.${state.combat.level})</div>
          <div class="hp-bar-outer"><div class="hp-bar-inner" id="player-hp-bar" style="width:${(state.combat.hp/state.combat.maxHp)*100}%"></div></div>
          <div id="player-hp-text">${state.combat.hp} / ${state.combat.maxHp} HP</div>
        </div>
        <div class="combatant">
          <div>${monsterDef.icon} ${monsterDef.name}</div>
          <div class="hp-bar-outer"><div class="hp-bar-inner" id="monster-hp-bar" style="width:${monsterHpPct}%"></div></div>
          <div id="monster-hp-text">${Math.max(0,state.combat.monsterHp)} / ${monsterDef.hp} HP</div>
        </div>
      </div>
      <button class="btn danger" style="margin-top:10px" onclick="fleeBattle()">Flee</button>
      <div id="combat-log" style="margin-top:10px"></div>
    `;
  }

  document.getElementById("tab-combat").innerHTML = `
    <div class="panel">
      <div class="skill-header">
        <h2>💀 Combat</h2>
        <div class="level-badge">Lv. ${state.combat.level}</div>
      </div>
      <div class="xp-bar-outer"><div class="xp-bar-inner" style="width:${combatPct}%"></div></div>
      <div class="equip-row">
        <label>Weapon: <select onchange="equipWeapon(this.value)">${weaponOptions}</select></label>
        <span class="action-sub">Dmg ${weapon.dmgMin}-${weapon.dmgMax} · Ammo: ${ITEMS[weapon.ammo].name} (${state.inventory[weapon.ammo]||0})</span>
      </div>
      <div class="region-select">${regionButtons}</div>
      ${monsterListHtml}
      ${battleHtml}
    </div>
  `;
}

function updateCombatView() {
  if (!state.combat.inBattle) return;
  const region = getRegion();
  const monsterDef = region.monsters.find(m => m.id === state.combat.monsterId);
  if (!monsterDef) return;
  const playerBar = document.getElementById("player-hp-bar");
  const monsterBar = document.getElementById("monster-hp-bar");
  const playerText = document.getElementById("player-hp-text");
  const monsterText = document.getElementById("monster-hp-text");
  if (playerBar) playerBar.style.width = `${Math.max(0,(state.combat.hp/state.combat.maxHp)*100)}%`;
  if (monsterBar) monsterBar.style.width = `${Math.max(0,(state.combat.monsterHp/monsterDef.hp)*100)}%`;
  if (playerText) playerText.textContent = `${Math.max(0,state.combat.hp)} / ${state.combat.maxHp} HP`;
  if (monsterText) monsterText.textContent = `${Math.max(0,state.combat.monsterHp)} / ${monsterDef.hp} HP`;
}

function renderBankTab() {
  const rows = Object.keys(state.inventory).sort().map(id => {
    const item = ITEMS[id];
    const qty = state.inventory[id];
    return `
      <tr>
        <td>${item.icon} ${item.name}</td>
        <td>${qty}</td>
        <td>${item.sell}$</td>
        <td><button class="btn secondary" onclick="sellItem('${id}',1)">Sell 1</button>
            <button class="btn secondary" onclick="sellItem('${id}',${qty})">Sell All</button></td>
      </tr>
    `;
  }).join("") || `<tr><td colspan="4">Your bank is empty. Go gather some resources!</td></tr>`;

  document.getElementById("tab-bank").innerHTML = `
    <div class="panel">
      <div class="skill-header"><h2>🏦 Bank</h2><button class="btn danger" onclick="sellAll()">Sell Everything</button></div>
      <table class="bank-table">
        <thead><tr><th>Item</th><th>Qty</th><th>Value</th><th>Actions</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function renderSettingsTab() {
  document.getElementById("tab-settings").innerHTML = `
    <div class="panel">
      <h2>⚙️ Settings</h2>
      <p>Dust &amp; Iron — a Wild West idle RPG. Progress autosaves every 5 seconds and while you're offline.</p>
      <button class="btn danger" onclick="if(confirm('Reset all progress? This cannot be undone.')){localStorage.removeItem('${SAVE_KEY}'); location.reload();}">Hard Reset Save</button>
    </div>
  `;
}

function render() {
  if (activeTab === "combat") renderCombatTab();
  else if (activeTab === "bank") renderBankTab();
  else if (activeTab === "settings") renderSettingsTab();
  else renderSkillTab(activeTab);
  updateActionBar();
  updateGoldDisplay();
}

function switchTab(tabId) {
  activeTab = tabId;
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.tab === tabId);
  });
  document.querySelectorAll(".tab-pane").forEach(pane => {
    pane.classList.toggle("active", pane.id === `tab-${tabId}`);
  });
  render();
}

// ---------- Init ----------
document.addEventListener("DOMContentLoaded", () => {
  simulateOffline();
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });
  render();
});

window.addEventListener("beforeunload", saveState);

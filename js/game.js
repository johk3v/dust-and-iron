/* ============================================================
   DUST & IRON — Game Engine (v2)
   Tick-based idle engine: non-combat skills w/ soft-locks,
   inventory, storage, an equipment system (weapon + 4 armor
   slots + 1 accessory), and 3 trainable combat skills
   (Brawling / Gunslinging / Marksmanship) driven by whichever
   weapon class is equipped. Autosaves to localStorage and
   simulates offline progress on load.
   ============================================================ */

const SAVE_KEY = "dustAndIronSave_v2";
const TICK_MS = 100;

const EQUIP_SLOTS = ["weapon", "head", "top", "bottom", "boots", "accessory"];

// ---------- Default state ----------
function freshState() {
  const skillLevels = {};
  const skillXp = {};
  Object.keys(SKILLS).forEach(k => { skillLevels[k] = 1; skillXp[k] = 0; });

  const combatSkillLevels = {};
  const combatSkillXp = {};
  Object.keys(COMBAT_SKILLS).forEach(k => { combatSkillLevels[k] = 1; combatSkillXp[k] = 0; });

  return {
    gold: 50,
    inventory: {}, // itemId -> qty
    skillXp,
    skillLevels,
    combatSkillXp,
    combatSkillLevels,
    equipment: { weapon: "rusty_six_shooter", head: null, top: null, bottom: null, boots: null, accessory: null },
    combat: {
      hp: 50,
      maxHp: 50,
      region: "dusty_gulch",
      monsterId: null,
      monsterHp: 0,
      inBattle: false,
      log: [],
      playerAttackCd: 0,
      monsterAttackCd: 0,
    },
    currentAction: null, // { skillId, actionId, progress (0-1), duration }
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
    const merged = Object.assign({}, fresh, parsed);
    merged.combat = Object.assign({}, fresh.combat, parsed.combat || {});
    merged.equipment = Object.assign({}, fresh.equipment, parsed.equipment || {});
    merged.skillLevels = Object.assign({}, fresh.skillLevels, parsed.skillLevels || {});
    merged.skillXp = Object.assign({}, fresh.skillXp, parsed.skillXp || {});
    merged.combatSkillLevels = Object.assign({}, fresh.combatSkillLevels, parsed.combatSkillLevels || {});
    merged.combatSkillXp = Object.assign({}, fresh.combatSkillXp, parsed.combatSkillXp || {});
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

function addCombatXp(classId, amount) {
  state.combatSkillXp[classId] = (state.combatSkillXp[classId] || 0) + amount;
  const newLevel = levelFromXp(state.combatSkillXp[classId]);
  if (newLevel > state.combatSkillLevels[classId]) {
    state.combatSkillLevels[classId] = newLevel;
    toast(`⚔️ ${COMBAT_SKILLS[classId].name} leveled up to ${newLevel}!`);
  }
  recalcMaxHp();
}

function getHighestCombatLevel() {
  return Math.max(...Object.values(state.combatSkillLevels));
}

function recalcMaxHp() {
  const lvl = getHighestCombatLevel();
  const newMax = 50 + (lvl - 1) * 6;
  const wasFull = state.combat.hp >= state.combat.maxHp;
  state.combat.maxHp = newMax;
  if (wasFull) state.combat.hp = newMax;
  else state.combat.hp = Math.min(state.combat.hp, newMax);
}

// ---------- Skill soft-locks ----------
function skillUnlocked(skillId) {
  const skill = SKILLS[skillId];
  if (!skill.requires) return true;
  return skill.requires.every(r => state.skillLevels[r.skill] >= r.level);
}

function skillLockReasons(skillId) {
  const skill = SKILLS[skillId];
  if (!skill.requires) return [];
  return skill.requires.map(r => ({
    skill: r.skill,
    name: SKILLS[r.skill].name,
    need: r.level,
    have: state.skillLevels[r.skill],
    met: state.skillLevels[r.skill] >= r.level,
  }));
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

// ---------- Actions (gathering/production/risk) ----------
function findAction(skillId, actionId) {
  return SKILLS[skillId].actions.find(a => a.id === actionId);
}

function canAffordAction(action) {
  if (action.goldCost && state.gold < action.goldCost) return false;
  if (action.consumes && !hasItems(action.consumes)) return false;
  return true;
}

function startAction(skillId, actionId) {
  if (!skillUnlocked(skillId)) {
    toast(`${SKILLS[skillId].name} is locked.`);
    return;
  }
  const action = findAction(skillId, actionId);
  if (!action) return;
  if (state.skillLevels[skillId] < action.level) {
    toast(`Need ${SKILLS[skillId].name} level ${action.level}`);
    return;
  }
  if (!canAffordAction(action)) {
    toast(action.goldCost ? "Not enough gold!" : "Not enough materials!");
    return;
  }
  state.currentAction = {
    skillId, actionId,
    progress: 0,
    duration: action.time,
  };
  // Persist immediately: if the page/tab is closed in the next few
  // seconds (before the periodic autosave fires), the in-progress
  // action must already be on disk or offline progress can't resume it.
  saveState();
  render();
}

function stopAction() {
  state.currentAction = null;
  saveState();
  render();
}

// Resolves one cycle of an action: spends cost/materials, rolls
// success if applicable, grants xp/items/gold. Returns false if the
// cycle could not be paid for (caller should stop the loop).
function resolveActionCycle(skillId, action) {
  if (!canAffordAction(action)) return false;

  if (action.goldCost) state.gold -= action.goldCost;
  if (action.consumes) action.consumes.forEach(c => removeItem(c.item, c.qty));

  const success = action.successChance === undefined || Math.random() < action.successChance;

  if (success) {
    if (action.yields) action.yields.forEach(y => addItem(y.item, y.qty));
    if (action.goldYield) {
      const g = Math.floor(Math.random() * (action.goldYield.max - action.goldYield.min + 1)) + action.goldYield.min;
      state.gold += g;
    }
    addXp(skillId, action.xp);
  } else {
    // Failed attempt: materials/gold already spent above are still lost,
    // but xp gain is reduced and no reward — mirrors risk/reward skills.
    addXp(skillId, Math.ceil(action.xp * 0.4));
  }
  return true;
}

function completeAction() {
  const { skillId, actionId } = state.currentAction;
  const action = findAction(skillId, actionId);
  if (!action) { state.currentAction = null; return; }

  const ok = resolveActionCycle(skillId, action);
  if (!ok) {
    toast(action.goldCost ? "Ran out of gold." : "Ran out of materials.");
    state.currentAction = null;
    render();
    return;
  }

  // loop the action
  state.currentAction.progress = 0;

  // Refresh whichever tab is open so qty/XP bars/inline progress update
  // live instead of only on tab-switch.
  render();
}

// ---------- Equipment ----------
function getEquippedWeapon() {
  return ITEMS[state.equipment.weapon] || ITEMS.fists;
}

function equipItem(slot, itemId) {
  if (slot === "weapon" && !itemId) itemId = "fists";
  state.equipment[slot] = itemId || null;
  render();
}

function getTotalDefense() {
  let def = 0;
  ["head", "top", "bottom", "boots", "accessory"].forEach(slot => {
    const id = state.equipment[slot];
    if (id && ITEMS[id]) def += ITEMS[id].defense || 0;
  });
  return def;
}

function getTotalDmgBonusPct() {
  const id = state.equipment.accessory;
  if (id && ITEMS[id]) return ITEMS[id].dmgBonusPct || 0;
  return 0;
}

function ownedItemsForSlot(slot) {
  let owned;
  if (slot === "weapon") {
    owned = Object.keys(state.inventory).filter(id => ITEMS[id] && ITEMS[id].type === "weapon").concat(["fists"]);
  } else if (slot === "accessory") {
    owned = Object.keys(state.inventory).filter(id => ITEMS[id] && ITEMS[id].type === "accessory");
  } else {
    owned = Object.keys(state.inventory).filter(id => ITEMS[id] && ITEMS[id].type === "armor" && ITEMS[id].slot === slot);
  }
  // Always include whatever is currently equipped, even if it somehow
  // isn't in the raw inventory (e.g. the starting weapon), so the
  // dropdown's selected option always matches the real equipped item.
  const equipped = state.equipment[slot];
  if (equipped && !owned.includes(equipped)) owned.push(equipped);
  return owned;
}

// ---------- Combat ----------
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
  if (!state.combat.log) state.combat.log = [];
  state.combat.log.push(msg);
  if (state.combat.log.length > 60) state.combat.log.shift();

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
  const weaponClass = weapon.class;
  const needsAmmo = !!weapon.ammo;
  const ammoOk = !needsAmmo || (state.inventory[weapon.ammo] || 0) > 0;

  state.combat.playerAttackCd = (state.combat.playerAttackCd || 0) - deltaSec;
  state.combat.monsterAttackCd = (state.combat.monsterAttackCd || 0) - deltaSec;

  if (state.combat.playerAttackCd <= 0) {
    state.combat.playerAttackCd = weapon.speed;
    if (!ammoOk) {
      logCombat("Out of ammo! Buy/craft more bullets.");
    } else {
      if (needsAmmo) removeItem(weapon.ammo, 1);
      const bonus = 1 + getTotalDmgBonusPct();
      const dmg = Math.round((Math.random() * (weapon.dmgMax - weapon.dmgMin) + weapon.dmgMin) * bonus);
      state.combat.monsterHp -= dmg;
      logCombat(`You hit ${monsterDef.name} for ${dmg} damage.`);
      if (state.combat.monsterHp <= 0) {
        handleMonsterDeath(monsterDef, weaponClass);
        return;
      }
    }
  }

  if (state.combat.monsterAttackCd <= 0) {
    state.combat.monsterAttackCd = monsterDef.speed;
    const rawDmg = Math.floor(Math.random() * (monsterDef.dmgMax - monsterDef.dmgMin + 1)) + monsterDef.dmgMin;
    const dmg = Math.max(1, rawDmg - getTotalDefense());
    state.combat.hp -= dmg;
    logCombat(`${monsterDef.name} hits you for ${dmg} damage.`);
    if (state.combat.hp <= 0) {
      handlePlayerDeath();
      return;
    }
  }
}

function handleMonsterDeath(monsterDef, weaponClass) {
  logCombat(`💀 You defeated ${monsterDef.name}!`);
  addCombatXp(weaponClass, monsterDef.xp);
  const gold = Math.floor(Math.random() * (monsterDef.goldMax - monsterDef.goldMin + 1)) + monsterDef.goldMin;
  state.gold += gold;
  logCombat(`Looted $${gold}.`);
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

function setRegion(regionId) {
  state.combat.region = regionId;
  state.combat.inBattle = false;
  state.combat.monsterId = null;
  render();
}

// ---------- Selling / storage ----------
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

  if (state.currentAction) {
    const action = findAction(state.currentAction.skillId, state.currentAction.actionId);
    if (action && skillUnlocked(state.currentAction.skillId)) {
      let cycles = Math.floor(cappedSec / action.duration);
      let completed = 0;
      for (let i = 0; i < cycles; i++) {
        const ok = resolveActionCycle(state.currentAction.skillId, action);
        if (!ok) break;
        completed++;
      }
      if (completed > 0) {
        toast(`⏳ While away: ${completed}x ${action.name}`);
      }
      if (completed < cycles) state.currentAction = null;
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
    updateInlineActionProgress();
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

let activeTab = "woodcutting";

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

// Updates just the inline progress bar of the currently active action
// row, if it's visible on the current tab, without a full re-render.
function updateInlineActionProgress() {
  const bar = document.getElementById("inline-action-progress");
  if (bar && state.currentAction) {
    bar.style.width = `${Math.min(100, state.currentAction.progress * 100)}%`;
  }
}

function renderSkillTab(skillId) {
  const skill = SKILLS[skillId];
  const level = state.skillLevels[skillId];
  const xp = state.skillXp[skillId];
  const xpStart = xpForLevel(level);
  const xpEnd = xpForLevel(level + 1);
  const pct = level >= 99 ? 100 : Math.floor(((xp - xpStart) / (xpEnd - xpStart)) * 100);
  const unlocked = skillUnlocked(skillId);

  let lockHtml = "";
  if (!unlocked) {
    const reasons = skillLockReasons(skillId);
    lockHtml = `
      <div class="lock-banner">
        <strong>🔒 ${skill.name} is locked.</strong> Reach the following first:
        ${reasons.map(r => `<div class="lock-req ${r.met ? 'met' : 'unmet'}">${r.met ? '✓' : '✗'} ${r.name} level ${r.need} (currently ${r.have})</div>`).join("")}
      </div>
    `;
  }

  let html = `
    <div class="panel">
      <div class="skill-header">
        <h2>${skill.icon} ${skill.name}</h2>
        <div class="level-badge">Lv. ${level}</div>
      </div>
      <div class="xp-bar-outer"><div class="xp-bar-inner" style="width:${pct}%"></div></div>
      ${lockHtml}
      <div class="action-list">
  `;

  skill.actions.forEach(action => {
    const levelLocked = level < action.level;
    const locked = !unlocked || levelLocked;
    const isActive = state.currentAction &&
      state.currentAction.skillId === skillId &&
      state.currentAction.actionId === action.id;
    const affordable = canAffordAction(action);

    const bits = [];
    if (action.yields) bits.push(action.yields.map(y => `${ITEMS[y.item].icon} ${ITEMS[y.item].name} x${y.qty}`).join(", "));
    if (action.goldYield) bits.push(`$${action.goldYield.min}-${action.goldYield.max}`);
    if (action.successChance !== undefined) bits.push(`${Math.round(action.successChance * 100)}% success`);
    bits.push(`${action.xp} xp`, `${action.time}s`);
    if (action.goldCost) bits.push(`Costs $${action.goldCost}`);
    if (action.consumes) bits.push("Needs: " + action.consumes.map(c => `${ITEMS[c.item].icon} ${ITEMS[c.item].name} x${c.qty}`).join(", "));

    const progressHtml = isActive
      ? `<div class="action-progress-outer"><div class="action-progress-inner" id="inline-action-progress" style="width:${state.currentAction.progress * 100}%"></div></div>`
      : "";

    html += `
      <div class="action-row ${locked ? 'locked' : ''}">
        <div class="action-info">
          <div class="action-name">${action.name} ${levelLocked ? `(Req. Lv.${action.level})` : ''}</div>
          <div class="action-sub">${bits.join(" · ")}</div>
          ${progressHtml}
        </div>
        <button class="action-btn ${isActive ? 'active-action' : ''}"
          ${locked || (!affordable && !isActive) ? 'disabled' : ''}
          onclick="${isActive ? 'stopAction()' : `startAction('${skillId}','${action.id}')`}">
          ${isActive ? 'Stop' : 'Start'}
        </button>
      </div>
    `;
  });

  html += `</div></div>`;
  document.getElementById(`tab-${skillId}`).innerHTML = html;
}

function renderEquipmentGrid() {
  const slotMeta = {
    weapon:    { label: "Weapon", icon: "🔫" },
    head:      { label: "Head",   icon: "🎩" },
    top:       { label: "Top",    icon: "🧥" },
    bottom:    { label: "Bottom", icon: "👖" },
    boots:     { label: "Boots",  icon: "👢" },
    accessory: { label: "Extra",  icon: "⭐" },
  };

  const slotsHtml = EQUIP_SLOTS.map(slot => {
    const equippedId = state.equipment[slot];
    const equippedItem = equippedId ? ITEMS[equippedId] : null;
    const owned = ownedItemsForSlot(slot);
    const options = [];
    if (slot !== "weapon") options.push(`<option value="">(empty)</option>`);
    Array.from(new Set(owned)).forEach(id => {
      const item = ITEMS[id];
      if (!item) return;
      options.push(`<option value="${id}" ${id === equippedId ? 'selected' : ''}>${item.name}</option>`);
    });

    let statLine = "";
    if (equippedItem) {
      if (equippedItem.type === "weapon") {
        statLine = `${equippedItem.dmgMin}-${equippedItem.dmgMax} dmg`;
      } else if (equippedItem.type === "armor") {
        statLine = `+${equippedItem.defense} def`;
      } else if (equippedItem.type === "accessory") {
        const parts = [];
        if (equippedItem.defense) parts.push(`+${equippedItem.defense} def`);
        if (equippedItem.dmgBonusPct) parts.push(`+${Math.round(equippedItem.dmgBonusPct * 100)}% dmg`);
        statLine = parts.join(", ");
      }
    }

    return `
      <div class="equip-slot">
        <div class="equip-slot-label">${slotMeta[slot].label}</div>
        <div class="equip-slot-icon">${equippedItem ? equippedItem.icon : slotMeta[slot].icon}</div>
        <select onchange="equipItem('${slot}', this.value)">${options.join("")}</select>
        <div class="equip-stat">${statLine}</div>
      </div>
    `;
  }).join("");

  return `<div class="equipment-grid">${slotsHtml}</div>`;
}

function renderCombatTab() {
  const region = getRegion();
  const weapon = getEquippedWeapon();
  const weaponClass = weapon.class;
  const combatLevel = getHighestCombatLevel();

  const regionButtons = REGIONS.map(r => {
    const locked = combatLevel < r.unlockCombatLvl;
    return `<button class="region-btn ${r.id === region.id ? 'active' : ''}" ${locked ? 'disabled' : ''}
      onclick="setRegion('${r.id}')">${r.name} ${locked ? `(Lv.${r.unlockCombatLvl})` : ''}</button>`;
  }).join("");

  const trainedLevel = state.combatSkillLevels[weaponClass];
  const trainedXp = state.combatSkillXp[weaponClass];
  const xpStart = xpForLevel(trainedLevel);
  const xpEnd = xpForLevel(trainedLevel + 1);
  const combatPct = trainedLevel >= 99 ? 100 : Math.floor(((trainedXp - xpStart) / (xpEnd - xpStart)) * 100);

  const skillBadges = Object.keys(COMBAT_SKILLS).map(id => {
    const active = id === weaponClass;
    return `<span ${active ? 'style="color:var(--gold);font-weight:bold;"' : ''}>${COMBAT_SKILLS[id].icon} ${COMBAT_SKILLS[id].name} Lv.${state.combatSkillLevels[id]}</span>`;
  }).join(" &nbsp;·&nbsp; ");

  let monsterListHtml = "";
  if (!state.combat.inBattle) {
    monsterListHtml = `<div class="monster-list">` + region.monsters.map(m => `
      <div class="action-row">
        <div class="action-info">
          <div class="action-name">${m.icon} ${m.name}</div>
          <div class="action-sub">HP ${m.hp} · ${m.dmgMin}-${m.dmgMax} dmg · ${m.xp} xp · $${m.goldMin}-${m.goldMax}</div>
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
          <div>🤠 You</div>
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
      <div id="combat-log" style="margin-top:10px">${(state.combat.log || []).map(m => `<div>${m}</div>`).join("")}</div>
    `;
  }

  document.getElementById("tab-combat").innerHTML = `
    <div class="panel">
      <div class="skill-header">
        <h2>💀 Combat</h2>
        <div class="level-badge" id="combat-level-badge">${COMBAT_SKILLS[weaponClass].name} Lv. ${trainedLevel}</div>
      </div>
      <div class="xp-bar-outer"><div class="xp-bar-inner" id="combat-xp-bar" style="width:${combatPct}%"></div></div>
      <div class="combat-stats-summary">
        <span>${skillBadges}</span>
      </div>
      <div class="combat-stats-summary">
        <span>❤️ Max HP: <b>${state.combat.maxHp}</b></span>
        <span>🛡️ Defense: <b>${getTotalDefense()}</b></span>
        <span>💥 Dmg Bonus: <b>${Math.round(getTotalDmgBonusPct()*100)}%</b></span>
        <span>🔫 Weapon Dmg: <b>${weapon.dmgMin}-${weapon.dmgMax}</b></span>
        ${weapon.ammo ? `<span>Ammo: <b id="ammo-count">${state.inventory[weapon.ammo]||0}</b> ${ITEMS[weapon.ammo].name}</span>` : ""}
      </div>
      ${renderEquipmentGrid()}
      <div class="region-select">${regionButtons}</div>
      ${monsterListHtml}
      ${battleHtml}
    </div>
  `;
  const logEl = document.getElementById("combat-log");
  if (logEl) logEl.scrollTop = logEl.scrollHeight;
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

  const weapon = getEquippedWeapon();
  const weaponClass = weapon.class;
  const ammoEl = document.getElementById("ammo-count");
  if (ammoEl && weapon.ammo) ammoEl.textContent = state.inventory[weapon.ammo] || 0;

  const levelBadge = document.getElementById("combat-level-badge");
  if (levelBadge) levelBadge.textContent = `${COMBAT_SKILLS[weaponClass].name} Lv. ${state.combatSkillLevels[weaponClass]}`;

  const xpBar = document.getElementById("combat-xp-bar");
  if (xpBar) {
    const trainedLevel = state.combatSkillLevels[weaponClass];
    const xpStart = xpForLevel(trainedLevel);
    const xpEnd = xpForLevel(trainedLevel + 1);
    const pct = trainedLevel >= 99 ? 100 : Math.floor(((state.combatSkillXp[weaponClass] - xpStart) / (xpEnd - xpStart)) * 100);
    xpBar.style.width = `${pct}%`;
  }
}

function renderBankTab() {
  const rows = Object.keys(state.inventory).sort().map(id => {
    const item = ITEMS[id];
    const qty = state.inventory[id];
    return `
      <tr>
        <td>${item.icon} ${item.name}</td>
        <td>${qty}</td>
        <td>$${item.sell}</td>
        <td><button class="btn secondary" onclick="sellItem('${id}',1)">Sell 1</button>
            <button class="btn secondary" onclick="sellItem('${id}',${qty})">Sell All</button></td>
      </tr>
    `;
  }).join("") || `<tr><td colspan="4">Storage is empty. Go gather some resources!</td></tr>`;

  document.getElementById("tab-bank").innerHTML = `
    <div class="panel">
      <div class="skill-header"><h2>🏚️ Storage</h2><button class="btn danger" onclick="sellAll()">Sell Everything</button></div>
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
  updateInlineActionProgress();
  updateGoldDisplay();
}

function updateTabLockIndicators() {
  document.querySelectorAll(".tab-btn[data-tab]").forEach(btn => {
    const tabId = btn.dataset.tab;
    if (SKILLS[tabId] && SKILLS[tabId].requires) {
      btn.classList.toggle("soft-locked", !skillUnlocked(tabId));
    }
  });
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
  recalcMaxHp();
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });
  updateTabLockIndicators();
  render();
});

// beforeunload is unreliable on mobile browsers and when a tab/app is
// killed rather than navigated away from. visibilitychange + pagehide
// cover those cases too, so progress is saved the moment the page is
// hidden/closed, not just on a clean desktop unload.
window.addEventListener("beforeunload", saveState);
window.addEventListener("pagehide", saveState);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") saveState();
});

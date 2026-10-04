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
    actionCounts: {}, // actionId -> number of times completed (success or fail), powers Store unlocks
    constructedBuildings: [], // array of building-stage ids, in construction order
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
    merged.actionCounts = Object.assign({}, fresh.actionCounts, parsed.actionCounts || {});
    merged.constructedBuildings = parsed.constructedBuildings || fresh.constructedBuildings;
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

// Builds a human-readable "123 / 456 XP (333 to next level)" string,
// so players can see the numbers behind the bar, not just a % fill.
// At level 99 there's no next level, so it just shows total XP.
function formatXpLabel(level, xp) {
  if (level >= 99) {
    return `${xp.toLocaleString()} XP (max level)`;
  }
  const xpEnd = xpForLevel(level + 1);
  const remaining = xpEnd - xp;
  return `${xp.toLocaleString()} / ${xpEnd.toLocaleString()} XP (${remaining.toLocaleString()} to next level)`;
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

// ---------- Store (economy) ----------
function storeSectionUnlocked(section) {
  const u = section.unlock;
  if (!u) return true;
  if (u.type === "actionCount") {
    return (state.actionCounts[u.actionId] || 0) >= u.count;
  }
  return true;
}

function storeSectionProgress(section) {
  const u = section.unlock;
  if (!u || u.type !== "actionCount") return null;
  return { have: state.actionCounts[u.actionId] || 0, need: u.count, label: u.label };
}

function buyStoreItem(sectionId, itemIndex) {
  const section = STORE_SECTIONS.find(s => s.id === sectionId);
  if (!section || !storeSectionUnlocked(section)) return;
  const entry = section.items[itemIndex];
  if (!entry) return;
  if (state.gold < entry.price) {
    toast("Not enough gold!");
    return;
  }
  state.gold -= entry.price;
  addItem(entry.item, entry.qty);
  toast(`Bought ${ITEMS[entry.item].icon} ${ITEMS[entry.item].name} x${entry.qty}.`);
  render();
}

// ---------- Settlement / Buildings ----------
// A building stage is "built" once its id is in state.constructedBuildings.
function isStageBuilt(stageId) {
  return state.constructedBuildings.includes(stageId);
}

// Which stage of a building is next to build (0 = base, not started yet).
// Returns null if the whole building (all stages) is already complete.
function nextStageIndex(building) {
  for (let i = 0; i < building.stages.length; i++) {
    if (!isStageBuilt(building.stages[i].id)) return i;
  }
  return null;
}

function canAffordStage(stage) {
  if (stage.goldCost && state.gold < stage.goldCost) return false;
  const cost = stage.cost || {};
  return Object.keys(cost).every(item => (state.inventory[item] || 0) >= cost[item]);
}

function buildStage(buildingId) {
  const building = BUILDINGS.find(b => b.id === buildingId);
  if (!building) return;
  const idx = nextStageIndex(building);
  if (idx === null) return; // already fully built
  const stage = building.stages[idx];
  if (state.skillLevels.settlement < stage.level) {
    toast(`Need Settlement level ${stage.level}`);
    return;
  }
  if (!canAffordStage(stage)) {
    toast("Missing materials or gold for this stage.");
    return;
  }
  if (stage.goldCost) state.gold -= stage.goldCost;
  Object.keys(stage.cost || {}).forEach(item => removeItem(item, stage.cost[item]));
  state.constructedBuildings.push(stage.id);
  addXp("settlement", stage.xp);
  toast(`🏗️ Built: ${stage.name}!`);
  render();
}

// Sums up every constructed stage's buff of a given type. Percent-type
// buffs (xxx_pct) are summed additively (e.g. two +10% stages = +20%);
// flat buffs (e.g. global_defense) are summed as plain numbers.
function getSettlementBuff(type) {
  let total = 0;
  BUILDINGS.forEach(building => {
    building.stages.forEach(stage => {
      if (stage.buff && stage.buff.type === type && isStageBuilt(stage.id)) {
        total += stage.buff.value;
      }
    });
  });
  return total;
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

  // Tracks how many times each action has ever completed (success or
  // fail) — used to power Store section unlocks (e.g. "scout trails
  // 10 times"), independent of skill levels.
  state.actionCounts[action.id] = (state.actionCounts[action.id] || 0) + 1;

  // Settlement building buffs that modify an action's success chance
  // before it's rolled (currently just the Saloon Speakeasy stage).
  let successChance = action.successChance;
  if (successChance !== undefined && skillId === "debauchery") {
    successChance = Math.min(1, successChance + getSettlementBuff("debauchery_success_pct"));
  }
  const success = successChance === undefined || Math.random() < successChance;

  if (success) {
    if (action.yields) {
      action.yields.forEach(y => {
        let qty = y.qty;
        // Armory (Settlement) buff: bonus ammo yield from casting recipes.
        if (action.ammoRecipe) {
          qty = Math.round(qty * (1 + getSettlementBuff("ammo_bonus_pct")));
        }
        addItem(y.item, qty);
      });
    }
    if (action.goldYield) {
      let g = Math.floor(Math.random() * (action.goldYield.max - action.goldYield.min + 1)) + action.goldYield.min;
      // Saloon buff: bonus gold from Debauchery games.
      if (skillId === "debauchery") {
        g = Math.round(g * (1 + getSettlementBuff("debauchery_gold_pct")));
      }
      state.gold += g;
    }
    let xpGain = action.xp;
    // Gunsmith Wing (Settlement) buff: bonus XP crafting weapons.
    if (action.weaponRecipe) {
      xpGain = Math.round(xpGain * (1 + getSettlementBuff("craft_weapon_xp_pct")));
    }
    addXp(skillId, xpGain);
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
  let def = getSettlementBuff("global_defense");
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
  // Forge Vault Room (Settlement) buff: halves the gold-loss penalty.
  const baseLossPct = 0.2;
  const reduction = getSettlementBuff("death_gold_loss_reduction_pct");
  const effectiveLossPct = baseLossPct * (1 - reduction);
  state.gold = Math.floor(state.gold * (1 - effectiveLossPct));
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
  const bonus = 1 + getSettlementBuff("sell_price_pct");
  state.gold += Math.round(ITEMS[itemId].sell * sellQty * bonus);
  render();
}

function sellAll() {
  Object.keys(state.inventory).forEach(itemId => {
    sellItem(itemId, state.inventory[itemId]);
  });
  toast("Sold entire inventory.");
}

// ---------- Food / healing ----------
function eatItem(itemId) {
  const item = ITEMS[itemId];
  if (!item || item.type !== "food") return;
  if ((state.inventory[itemId] || 0) <= 0) return;
  if (state.combat.hp >= state.combat.maxHp) {
    toast("Already at full health.");
    return;
  }
  removeItem(itemId, 1);
  const healed = Math.min(item.heal, state.combat.maxHp - state.combat.hp);
  state.combat.hp += healed;
  toast(`🍖 Ate ${item.name}, healed ${healed} HP.`);
  if (state.combat.inBattle) logCombat(`You eat ${item.name} and heal ${healed} HP.`);
  render();
}

// ---------- Offline progress ----------
function simulateOffline() {
  const now = Date.now();
  const elapsedSec = Math.max(0, (now - (state.lastSeen || now)) / 1000);
  if (elapsedSec < 5) return;

  const cappedSec = Math.min(elapsedSec, (8 + getSettlementBuff("offline_cap_hours_bonus")) * 3600); // base 8h cap, + Well buff

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
//
// IMPORTANT: scoped to the *visible* tab pane only. Switching tabs
// doesn't clear other panes' innerHTML (only toggles a CSS class), so
// a stale copy of #inline-action-progress can linger in a hidden pane
// (e.g. Woodcutting, since it's first in the DOM and the default tab
// on load). A bare getElementById would grab that stale/hidden one
// instead of the real, visible element on whatever skill tab you
// switched to — which looked like the progress bar being "stuck" on
// Woodcutting. Querying only inside .tab-pane.active fixes that.
function updateInlineActionProgress() {
  const activePane = document.querySelector(".tab-pane.active");
  const bar = activePane ? activePane.querySelector("#inline-action-progress") : null;
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
      <div class="xp-label">${formatXpLabel(level, xp)}</div>
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

  const foodEntries = Object.keys(state.inventory).filter(id => ITEMS[id] && ITEMS[id].type === "food");
  const foodBarHtml = foodEntries.length ? `
    <div class="combat-stats-summary" id="food-bar">
      <span>🍖 Food:</span>
      ${foodEntries.map(id => `<button class="btn secondary" onclick="eatItem('${id}')">${ITEMS[id].icon} ${ITEMS[id].name} (${state.inventory[id]}) +${ITEMS[id].heal} HP</button>`).join("")}
    </div>
  ` : "";

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
      <div class="xp-label" id="combat-xp-label">${formatXpLabel(trainedLevel, trainedXp)}</div>
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
      ${foodBarHtml}
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
  const xpLabel = document.getElementById("combat-xp-label");
  if (xpLabel) {
    const trainedLevel = state.combatSkillLevels[weaponClass];
    xpLabel.textContent = formatXpLabel(trainedLevel, state.combatSkillXp[weaponClass]);
  }
}

function sellCustomQty(itemId) {
  const input = document.getElementById(`sell-qty-${itemId}`);
  if (!input) return;
  const qty = parseInt(input.value, 10);
  if (!qty || qty <= 0) {
    toast("Enter a quantity to sell.");
    return;
  }
  sellItem(itemId, qty);
}

function renderBankTab() {
  const rows = Object.keys(state.inventory).sort().map(id => {
    const item = ITEMS[id];
    const qty = state.inventory[id];
    const eatBtn = item.type === "food"
      ? `<button class="btn" onclick="eatItem('${id}')" title="Heal ${item.heal} HP">🍖 Eat (+${item.heal} HP)</button>`
      : "";
    return `
      <tr>
        <td>${item.icon} ${item.name}</td>
        <td>${qty}</td>
        <td>$${item.sell}</td>
        <td class="bank-actions-cell">
          ${eatBtn}<button class="btn secondary" onclick="sellItem('${id}',1)">Sell 1</button>
          <button class="btn secondary" onclick="sellItem('${id}',${qty})">Sell All</button>
          <span class="sell-qty-group">
            <input type="number" id="sell-qty-${id}" class="sell-qty-input" min="1" max="${qty}" placeholder="#">
            <button class="btn secondary" onclick="sellCustomQty('${id}')">Sell #</button>
          </span>
        </td>
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

function renderSettlementTab() {
  const skill = SKILLS.settlement;
  const level = state.skillLevels.settlement;
  const xp = state.skillXp.settlement;
  const xpStart = xpForLevel(level);
  const xpEnd = xpForLevel(level + 1);
  const pct = level >= 99 ? 100 : Math.floor(((xp - xpStart) / (xpEnd - xpStart)) * 100);
  const unlocked = skillUnlocked("settlement");

  let lockHtml = "";
  if (!unlocked) {
    const reasons = skillLockReasons("settlement");
    lockHtml = `
      <div class="lock-banner">
        <strong>🔒 ${skill.name} is locked.</strong> Reach the following first:
        ${reasons.map(r => `<div class="lock-req ${r.met ? 'met' : 'unmet'}">${r.met ? '✓' : '✗'} ${r.name} level ${r.need} (currently ${r.have})</div>`).join("")}
      </div>
    `;
  }

  // Foundation/wall actions, rendered the same way a normal skill tab
  // renders its action rows (these are the only two buildable solo).
  const materialRowsHtml = skill.actions.map(action => {
    const levelLocked = level < action.level;
    const locked = !unlocked || levelLocked;
    const isActive = state.currentAction &&
      state.currentAction.skillId === "settlement" &&
      state.currentAction.actionId === action.id;
    const affordable = canAffordAction(action);

    const bits = [];
    if (action.yields) bits.push(action.yields.map(y => `${ITEMS[y.item].icon} ${ITEMS[y.item].name} x${y.qty}`).join(", "));
    bits.push(`${action.xp} xp`, `${action.time}s`);
    if (action.goldCost) bits.push(`Costs $${action.goldCost}`);
    if (action.consumes) bits.push("Needs: " + action.consumes.map(c => `${ITEMS[c.item].icon} ${ITEMS[c.item].name} x${c.qty}`).join(", "));

    const progressHtml = isActive
      ? `<div class="action-progress-outer"><div class="action-progress-inner" id="inline-action-progress" style="width:${state.currentAction.progress * 100}%"></div></div>`
      : "";

    return `
      <div class="action-row ${locked ? 'locked' : ''}">
        <div class="action-info">
          <div class="action-name">${action.name} ${levelLocked ? `(Req. Lv.${action.level})` : ''}</div>
          <div class="action-sub">${bits.join(" · ")}</div>
          ${progressHtml}
        </div>
        <button class="action-btn ${isActive ? 'active-action' : ''}"
          ${locked || (!affordable && !isActive) ? 'disabled' : ''}
          onclick="${isActive ? 'stopAction()' : `startAction('settlement','${action.id}')`}">
          ${isActive ? 'Stop' : 'Start'}
        </button>
      </div>
    `;
  }).join("");

  // Stockpile readout so it's obvious how many foundations/walls you
  // currently have banked, since every building below consumes them.
  const stockpileHtml = `
    <div class="combat-stats-summary">
      <span>${ITEMS.foundation.icon} Foundations: <b>${state.inventory.foundation || 0}</b></span>
      <span>${ITEMS.wall.icon} Walls: <b>${state.inventory.wall || 0}</b></span>
    </div>
  `;

  // Buildings: each is a chain of stages. Show the next buildable
  // stage's cost/buff; completed stages are listed as done; stages
  // beyond the next one are shown greyed out as a preview.
  const buildingsHtml = BUILDINGS.map(building => {
    const idx = nextStageIndex(building);
    const completeStages = idx === null ? building.stages : building.stages.slice(0, idx);
    const nextStage = idx === null ? null : building.stages[idx];

    const doneHtml = completeStages.map(s => `<div class="lock-req met">✓ ${s.name} — ${s.buff.label}</div>`).join("");

    let nextHtml = "";
    if (nextStage) {
      const levelLocked = level < nextStage.level;
      const affordable = canAffordStage(nextStage);
      const costBits = Object.keys(nextStage.cost || {}).map(item => `${ITEMS[item].icon} ${ITEMS[item].name} x${nextStage.cost[item]}`);
      if (nextStage.goldCost) costBits.push(`$${nextStage.goldCost}`);
      nextHtml = `
        <div class="action-row ${!unlocked || levelLocked ? 'locked' : ''}">
          <div class="action-info">
            <div class="action-name">${nextStage.name} ${levelLocked ? `(Req. Settlement Lv.${nextStage.level})` : ''}</div>
            <div class="action-sub">Needs: ${costBits.join(", ")} · ${nextStage.xp} xp</div>
            <div class="action-sub" style="color:var(--gold)">Grants: ${nextStage.buff.label}</div>
          </div>
          <button class="action-btn" ${!unlocked || levelLocked || !affordable ? 'disabled' : ''}
            onclick="buildStage('${building.id}')">Build</button>
        </div>
      `;
    } else {
      nextHtml = `<div class="lock-req met" style="font-weight:bold;">🏁 Fully built!</div>`;
    }

    return `
      <div class="panel">
        <div class="skill-header"><h2>${building.icon} ${building.name}</h2></div>
        <p class="action-sub" style="margin-top:-6px;margin-bottom:10px;">${building.description}</p>
        ${doneHtml}
        ${nextHtml}
      </div>
    `;
  }).join("");

  document.getElementById("tab-settlement").innerHTML = `
    <div class="panel">
      <div class="skill-header">
        <h2>${skill.icon} ${skill.name}</h2>
        <div class="level-badge">Lv. ${level}</div>
      </div>
      <div class="xp-bar-outer"><div class="xp-bar-inner" style="width:${pct}%"></div></div>
      <div class="xp-label">${formatXpLabel(level, xp)}</div>
      ${lockHtml}
      ${stockpileHtml}
      <div class="action-list">${materialRowsHtml}</div>
    </div>
    ${buildingsHtml}
  `;
}

function renderStoreTab() {
  const sectionsHtml = STORE_SECTIONS.map(section => {
    const unlocked = storeSectionUnlocked(section);
    const progress = storeSectionProgress(section);

    let lockHtml = "";
    if (!unlocked && progress) {
      lockHtml = `
        <div class="lock-banner">
          <strong>🔒 ${section.name} is locked.</strong>
          <div class="lock-req unmet">✗ ${progress.label}: ${progress.have} / ${progress.need}</div>
        </div>
      `;
    }

    const rowsHtml = section.items.map((entry, idx) => {
      const item = ITEMS[entry.item];
      const affordable = state.gold >= entry.price;
      return `
        <div class="action-row ${!unlocked ? 'locked' : ''}">
          <div class="action-info">
            <div class="action-name">${item.icon} ${item.name} x${entry.qty}</div>
            <div class="action-sub">$${entry.price}</div>
          </div>
          <button class="action-btn" ${!unlocked || !affordable ? 'disabled' : ''}
            onclick="buyStoreItem('${section.id}', ${idx})">Buy</button>
        </div>
      `;
    }).join("");

    return `
      <div class="panel">
        <div class="skill-header">
          <h2>${section.icon} ${section.name}</h2>
        </div>
        <p class="action-sub" style="margin-top:-6px;margin-bottom:10px;">${section.description}</p>
        ${lockHtml}
        <div class="action-list">${rowsHtml}</div>
      </div>
    `;
  }).join("");

  document.getElementById("tab-store").innerHTML = sectionsHtml;
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
  else if (activeTab === "store") renderStoreTab();
  else if (activeTab === "settlement") renderSettlementTab();
  else if (activeTab === "settings") renderSettingsTab();
  else renderSkillTab(activeTab);
  updateInlineActionProgress();
  updateGoldDisplay();
  // Re-check soft-lock status on every render, not just on page load —
  // otherwise the 🔒 nav icon keeps showing after the prerequisite
  // levels are actually met, until the next full page reload.
  updateTabLockIndicators();
}

function updateTabLockIndicators() {
  document.querySelectorAll(".tab-btn[data-tab]").forEach(btn => {
    const tabId = btn.dataset.tab;
    if (SKILLS[tabId] && SKILLS[tabId].requires) {
      btn.classList.toggle("soft-locked", !skillUnlocked(tabId));
    }
    if (tabId === "store") {
      const anyUnlocked = STORE_SECTIONS.some(s => storeSectionUnlocked(s));
      btn.classList.toggle("soft-locked", !anyUnlocked);
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

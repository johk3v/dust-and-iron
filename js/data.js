/* ============================================================
   DUST & IRON — Game Data
   All static definitions: items, skills, actions, recipes,
   monsters, and regions. No game state lives in here.
   ============================================================ */

const ITEMS = {
  // --- Raw resources: Prospecting ---
  copper_ore:   { name: "Copper Ore",   icon: "🟤", type: "ore",  sell: 2 },
  tin_ore:      { name: "Tin Ore",      icon: "⚪", type: "ore",  sell: 2 },
  iron_ore:     { name: "Iron Ore",     icon: "🔘", type: "ore",  sell: 5 },
  silver_ore:   { name: "Silver Ore",   icon: "⚙️", type: "ore",  sell: 12 },
  gold_ore:     { name: "Gold Ore",     icon: "🟡", type: "ore",  sell: 25 },
  coal:         { name: "Coal",         icon: "⚫", type: "ore",  sell: 4 },

  // --- Raw resources: Lumberjacking ---
  pine_wood:    { name: "Pine Wood",    icon: "🪵", type: "wood", sell: 2 },
  oak_wood:     { name: "Oak Wood",     icon: "🪵", type: "wood", sell: 6 },
  ironwood:     { name: "Ironwood",     icon: "🪵", type: "wood", sell: 15 },

  // --- Blacksmithing: bars ---
  bronze_bar:   { name: "Bronze Bar",   icon: "🔶", type: "bar",  sell: 6 },
  iron_bar:     { name: "Iron Bar",     icon: "🔸", type: "bar",  sell: 14 },
  steel_bar:    { name: "Steel Bar",    icon: "🔩", type: "bar",  sell: 30 },
  silver_bar:   { name: "Silver Bar",   icon: "🥈", type: "bar",  sell: 28 },
  gold_bar:     { name: "Gold Bar",     icon: "🥇", type: "bar",  sell: 55 },

  // --- Gunsmithing: weapons ---
  rusty_six_shooter: { name: "Rusty Six-Shooter", icon: "🔫", type: "weapon",
    sell: 10, dmgMin: 2, dmgMax: 5, speed: 1.6, ammo: "lead_bullet", combatLvl: 1 },
  bronze_revolver:   { name: "Bronze Revolver", icon: "🔫", type: "weapon",
    sell: 40, dmgMin: 4, dmgMax: 9, speed: 1.5, ammo: "lead_bullet", combatLvl: 5 },
  steel_revolver:    { name: "Steel Revolver", icon: "🔫", type: "weapon",
    sell: 120, dmgMin: 7, dmgMax: 15, speed: 1.4, ammo: "steel_bullet", combatLvl: 15 },
  hunting_rifle:     { name: "Hunting Rifle", icon: "🏹", type: "weapon",
    sell: 260, dmgMin: 14, dmgMax: 26, speed: 2.4, ammo: "rifle_round", combatLvl: 25 },
  silver_rifle:      { name: "Silver-Plated Rifle", icon: "🏹", type: "weapon",
    sell: 520, dmgMin: 22, dmgMax: 38, speed: 2.2, ammo: "rifle_round", combatLvl: 35 },
  golden_peacemaker: { name: "Golden Peacemaker", icon: "✨", type: "weapon",
    sell: 1500, dmgMin: 35, dmgMax: 60, speed: 1.3, ammo: "steel_bullet", combatLvl: 50 },

  // --- Gunsmithing: ammo ---
  lead_bullet:  { name: "Lead Bullets",  icon: "●", type: "ammo", sell: 1 },
  steel_bullet: { name: "Steel Bullets", icon: "⬤", type: "ammo", sell: 3 },
  rifle_round:  { name: "Rifle Rounds",  icon: "➤", type: "ammo", sell: 4 },

  // --- Armor / misc loot from combat ---
  leather_vest:   { name: "Leather Vest",   icon: "🦺", type: "armor", sell: 30 },
  duster_coat:    { name: "Duster Coat",    icon: "🧥", type: "armor", sell: 70 },
  tin_star:       { name: "Tin Star",       icon: "⭐", type: "trophy", sell: 150 },
  snake_fang:     { name: "Snake Fang",     icon: "🦷", type: "trophy", sell: 20 },
  bandit_bandana: { name: "Bandit's Bandana", icon: "🧣", type: "trophy", sell: 45 },
  ghost_dust:     { name: "Ghost Dust",     icon: "👻", type: "trophy", sell: 300 },
  pocket_watch:   { name: "Stolen Pocket Watch", icon: "⌚", type: "trophy", sell: 85 },
};

// ------------------------------------------------------------
// SKILLS (gathering + production). Each "action" is one thing
// the player can click to start doing repeatedly.
// ------------------------------------------------------------

const SKILLS = {
  prospecting: {
    name: "Prospecting",
    icon: "⛏️",
    actions: [
      { id: "pan_copper",  name: "Pan for Copper Ore", level: 1,  xp: 4,  time: 2.2, yields: [{ item: "copper_ore", qty: 1 }] },
      { id: "pan_tin",     name: "Pan for Tin Ore",    level: 1,  xp: 4,  time: 2.2, yields: [{ item: "tin_ore", qty: 1 }] },
      { id: "dig_coal",    name: "Dig for Coal",       level: 5,  xp: 7,  time: 2.6, yields: [{ item: "coal", qty: 1 }] },
      { id: "dig_iron",    name: "Dig for Iron Ore",   level: 10, xp: 11, time: 3.0, yields: [{ item: "iron_ore", qty: 1 }] },
      { id: "pan_silver",  name: "Pan for Silver Ore", level: 20, xp: 19, time: 3.6, yields: [{ item: "silver_ore", qty: 1 }] },
      { id: "pan_gold",    name: "Pan for Gold Ore",   level: 35, xp: 32, time: 4.4, yields: [{ item: "gold_ore", qty: 1 }] },
    ],
  },

  lumberjacking: {
    name: "Lumberjacking",
    icon: "🪓",
    actions: [
      { id: "chop_pine",     name: "Chop Pine",     level: 1,  xp: 4,  time: 2.0, yields: [{ item: "pine_wood", qty: 1 }] },
      { id: "chop_oak",      name: "Chop Oak",      level: 12, xp: 13, time: 2.8, yields: [{ item: "oak_wood", qty: 1 }] },
      { id: "chop_ironwood", name: "Chop Ironwood", level: 28, xp: 27, time: 3.8, yields: [{ item: "ironwood", qty: 1 }] },
    ],
  },

  blacksmithing: {
    name: "Blacksmithing",
    icon: "🔥",
    actions: [
      { id: "smelt_bronze", name: "Smelt Bronze Bar", level: 1,  xp: 6,  time: 2.2,
        consumes: [{ item: "copper_ore", qty: 1 }, { item: "tin_ore", qty: 1 }],
        yields: [{ item: "bronze_bar", qty: 1 }] },
      { id: "smelt_iron",   name: "Smelt Iron Bar",   level: 10, xp: 12, time: 2.8,
        consumes: [{ item: "iron_ore", qty: 1 }, { item: "coal", qty: 1 }],
        yields: [{ item: "iron_bar", qty: 1 }] },
      { id: "smelt_steel",  name: "Smelt Steel Bar",  level: 22, xp: 22, time: 3.4,
        consumes: [{ item: "iron_ore", qty: 1 }, { item: "coal", qty: 2 }],
        yields: [{ item: "steel_bar", qty: 1 }] },
      { id: "smelt_silver", name: "Smelt Silver Bar", level: 20, xp: 20, time: 3.2,
        consumes: [{ item: "silver_ore", qty: 1 }],
        yields: [{ item: "silver_bar", qty: 1 }] },
      { id: "smelt_gold",   name: "Smelt Gold Bar",   level: 35, xp: 34, time: 4.0,
        consumes: [{ item: "gold_ore", qty: 1 }],
        yields: [{ item: "gold_bar", qty: 1 }] },
    ],
  },

  gunsmithing: {
    name: "Gunsmithing",
    icon: "🔫",
    actions: [
      { id: "craft_rusty_six_shooter", name: "Craft Rusty Six-Shooter", level: 1, xp: 15, time: 4.0,
        consumes: [{ item: "bronze_bar", qty: 2 }, { item: "pine_wood", qty: 1 }],
        yields: [{ item: "rusty_six_shooter", qty: 1 }] },
      { id: "craft_lead_bullet", name: "Cast Lead Bullets (x10)", level: 1, xp: 3, time: 1.4,
        consumes: [{ item: "bronze_bar", qty: 1 }],
        yields: [{ item: "lead_bullet", qty: 10 }] },
      { id: "craft_bronze_revolver", name: "Craft Bronze Revolver", level: 5, xp: 28, time: 5.0,
        consumes: [{ item: "bronze_bar", qty: 4 }, { item: "oak_wood", qty: 1 }],
        yields: [{ item: "bronze_revolver", qty: 1 }] },
      { id: "craft_steel_bullet", name: "Cast Steel Bullets (x10)", level: 12, xp: 9, time: 1.8,
        consumes: [{ item: "steel_bar", qty: 1 }],
        yields: [{ item: "steel_bullet", qty: 10 }] },
      { id: "craft_steel_revolver", name: "Craft Steel Revolver", level: 15, xp: 48, time: 6.0,
        consumes: [{ item: "steel_bar", qty: 5 }, { item: "oak_wood", qty: 2 }],
        yields: [{ item: "steel_revolver", qty: 1 }] },
      { id: "craft_rifle_round", name: "Cast Rifle Rounds (x10)", level: 20, xp: 14, time: 2.2,
        consumes: [{ item: "steel_bar", qty: 1 }, { item: "silver_bar", qty: 1 }],
        yields: [{ item: "rifle_round", qty: 10 }] },
      { id: "craft_hunting_rifle", name: "Craft Hunting Rifle", level: 25, xp: 70, time: 7.5,
        consumes: [{ item: "steel_bar", qty: 6 }, { item: "ironwood", qty: 2 }],
        yields: [{ item: "hunting_rifle", qty: 1 }] },
      { id: "craft_silver_rifle", name: "Craft Silver-Plated Rifle", level: 35, xp: 110, time: 9.0,
        consumes: [{ item: "silver_bar", qty: 6 }, { item: "steel_bar", qty: 4 }, { item: "ironwood", qty: 3 }],
        yields: [{ item: "silver_rifle", qty: 1 }] },
      { id: "craft_golden_peacemaker", name: "Craft Golden Peacemaker", level: 50, xp: 220, time: 12.0,
        consumes: [{ item: "gold_bar", qty: 8 }, { item: "steel_bar", qty: 6 }, { item: "ironwood", qty: 4 }],
        yields: [{ item: "golden_peacemaker", qty: 1 }] },
    ],
  },
};

// ------------------------------------------------------------
// COMBAT: regions and monsters
// ------------------------------------------------------------

const REGIONS = [
  {
    id: "dusty_gulch",
    name: "Dusty Gulch",
    unlockCombatLvl: 1,
    monsters: [
      { id: "coyote", name: "Coyote", icon: "🐺", hp: 18, dmgMin: 1, dmgMax: 3, speed: 2.0, xp: 8, goldMin: 2, goldMax: 6,
        loot: [{ item: "snake_fang", chance: 0.1, qty: 1 }] },
      { id: "drunk_prospector", name: "Drunk Prospector", icon: "🥃", hp: 26, dmgMin: 2, dmgMax: 4, speed: 2.2, xp: 11, goldMin: 4, goldMax: 10,
        loot: [{ item: "copper_ore", chance: 0.3, qty: 2 }] },
      { id: "rattlesnake", name: "Rattlesnake", icon: "🐍", hp: 22, dmgMin: 2, dmgMax: 5, speed: 1.8, xp: 12, goldMin: 2, goldMax: 5,
        loot: [{ item: "snake_fang", chance: 0.4, qty: 1 }] },
    ],
  },
  {
    id: "whispering_pines",
    name: "Whispering Pines",
    unlockCombatLvl: 8,
    monsters: [
      { id: "timber_wolf", name: "Timber Wolf", icon: "🐺", hp: 45, dmgMin: 4, dmgMax: 8, speed: 2.0, xp: 20, goldMin: 6, goldMax: 14,
        loot: [{ item: "leather_vest", chance: 0.12, qty: 1 }] },
      { id: "poacher", name: "Poacher", icon: "🪤", hp: 58, dmgMin: 5, dmgMax: 10, speed: 2.4, xp: 26, goldMin: 10, goldMax: 20,
        loot: [{ item: "duster_coat", chance: 0.08, qty: 1 }, { item: "pocket_watch", chance: 0.1, qty: 1 }] },
    ],
  },
  {
    id: "red_rock_canyon",
    name: "Red Rock Canyon",
    unlockCombatLvl: 18,
    monsters: [
      { id: "bandit_gunslinger", name: "Bandit Gunslinger", icon: "🤠", hp: 90, dmgMin: 8, dmgMax: 16, speed: 1.6, xp: 42, goldMin: 20, goldMax: 40,
        loot: [{ item: "bandit_bandana", chance: 0.15, qty: 1 }, { item: "lead_bullet", chance: 0.5, qty: 8 }] },
      { id: "crooked_lawman", name: "Crooked Lawman", icon: "🥾", hp: 110, dmgMin: 9, dmgMax: 18, speed: 1.8, xp: 55, goldMin: 25, goldMax: 50,
        loot: [{ item: "tin_star", chance: 0.1, qty: 1 }] },
      { id: "giant_scorpion", name: "Giant Scorpion", icon: "🦂", hp: 130, dmgMin: 10, dmgMax: 20, speed: 2.0, xp: 60, goldMin: 15, goldMax: 30,
        loot: [{ item: "steel_bar", chance: 0.1, qty: 1 }] },
    ],
  },
];

const WORLD_REGIONS_EXTRA = [
  {
    id: "boothill_cemetery",
    name: "Boothill Cemetery",
    unlockCombatLvl: 35,
    monsters: [
      { id: "skeletal_gunslinger", name: "Skeletal Gunslinger", icon: "💀", hp: 220, dmgMin: 18, dmgMax: 32, speed: 1.6, xp: 120, goldMin: 50, goldMax: 90,
        loot: [{ item: "ghost_dust", chance: 0.08, qty: 1 }, { item: "steel_bullet", chance: 0.4, qty: 10 }] },
      { id: "desert_wraith", name: "Desert Wraith", icon: "👻", hp: 260, dmgMin: 22, dmgMax: 38, speed: 1.9, xp: 150, goldMin: 60, goldMax: 110,
        loot: [{ item: "ghost_dust", chance: 0.12, qty: 1 }] },
    ],
  },
];
REGIONS.push(...WORLD_REGIONS_EXTRA);

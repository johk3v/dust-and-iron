/* ============================================================
   DUST & IRON — Game Data (v2)
   All static definitions: items, skills, actions, recipes,
   monsters, and regions. No game state lives in here.
   ============================================================ */

const ITEMS = {
  // ---------------- Raw resources ----------------
  // Prospecting
  copper_ore:   { name: "Copper Ore",   icon: "🟤", type: "ore",  sell: 2 },
  tin_ore:      { name: "Tin Ore",      icon: "⚪", type: "ore",  sell: 2 },
  iron_ore:     { name: "Iron Ore",     icon: "🔘", type: "ore",  sell: 5 },
  silver_ore:   { name: "Silver Ore",   icon: "⚙️", type: "ore",  sell: 12 },
  gold_ore:     { name: "Gold Ore",     icon: "🟡", type: "ore",  sell: 25 },
  coal:         { name: "Coal",         icon: "⚫", type: "ore",  sell: 4 },

  // Woodcutting
  pine_wood:    { name: "Pine Wood",    icon: "🪵", type: "wood", sell: 2 },
  oak_wood:     { name: "Oak Wood",     icon: "🪵", type: "wood", sell: 6 },
  ironwood:     { name: "Ironwood",     icon: "🪵", type: "wood", sell: 15 },

  // Farming
  egg:          { name: "Egg",          icon: "🥚", type: "produce", sell: 1 },
  milk:         { name: "Milk",         icon: "🥛", type: "produce", sell: 2 },
  wheat:        { name: "Wheat",        icon: "🌾", type: "produce", sell: 3 },
  cattle_hide:  { name: "Cattle Hide",  icon: "🐄", type: "produce", sell: 7 },
  cotton:       { name: "Cotton",       icon: "🧵", type: "produce", sell: 9 },

  // Exploration
  ancient_coin:    { name: "Ancient Coin",    icon: "🪙", type: "trophy", sell: 15 },
  turquoise_stone: { name: "Turquoise Stone", icon: "💠", type: "trophy", sell: 10 },
  trail_map:       { name: "Trail Map",       icon: "🗺️", type: "trophy", sell: 40 },

  // ---------------- Fishing (raw catches, double as food) ----------------
  // type: "food" items can be eaten (from Storage or mid-combat) to
  // restore `heal` HP, consuming one unit.
  raw_trout:          { name: "Raw Trout",          icon: "🐟", type: "food", heal: 8,  sell: 3 },
  raw_catfish:        { name: "Raw Catfish",        icon: "🐠", type: "food", heal: 14, sell: 6 },
  raw_bass:           { name: "Raw Bass",           icon: "🐡", type: "food", heal: 20, sell: 10 },
  raw_salmon:         { name: "Raw Salmon",         icon: "🍣", type: "food", heal: 28, sell: 16 },
  raw_sturgeon:       { name: "Raw Sturgeon",       icon: "🐋", type: "food", heal: 38, sell: 26 },
  legendary_catfish:  { name: "Legendary Catfish",  icon: "🏆", type: "food", heal: 55, sell: 60 },

  // Farming produce doubles as basic trail food
  trail_jerky:        { name: "Trail Jerky",        icon: "🥓", type: "food", heal: 6,  sell: 4 },

  // ---------------- Craftsmanship: bars ----------------
  bronze_bar:   { name: "Bronze Bar",   icon: "🔶", type: "bar",  sell: 6 },
  iron_bar:     { name: "Iron Bar",     icon: "🔸", type: "bar",  sell: 14 },
  steel_bar:    { name: "Steel Bar",    icon: "🔩", type: "bar",  sell: 30 },
  silver_bar:   { name: "Silver Bar",   icon: "🥈", type: "bar",  sell: 28 },
  gold_bar:     { name: "Gold Bar",     icon: "🥇", type: "bar",  sell: 55 },

  // ---------------- Craftsmanship: weapons ----------------
  // class: which combat skill the weapon trains. ammo: null = melee.
  fists: { name: "Bare Fists", icon: "✊", type: "weapon", sell: 0,
    class: "brawling", dmgMin: 1, dmgMax: 3, speed: 1.2, ammo: null, reqLevel: 1 },
  rusty_six_shooter: { name: "Rusty Six-Shooter", icon: "🔫", type: "weapon", sell: 10,
    class: "gunslinging", dmgMin: 2, dmgMax: 5, speed: 1.6, ammo: "lead_bullet", reqLevel: 1 },

  bronze_knuckles: { name: "Bronze Knuckles", icon: "🥊", type: "weapon", sell: 25,
    class: "brawling", dmgMin: 3, dmgMax: 7, speed: 1.4, ammo: null, reqLevel: 1 },
  steel_tomahawk: { name: "Steel Tomahawk", icon: "🪓", type: "weapon", sell: 200,
    class: "brawling", dmgMin: 10, dmgMax: 20, speed: 1.8, ammo: null, reqLevel: 15 },

  bronze_revolver: { name: "Bronze Revolver", icon: "🔫", type: "weapon", sell: 40,
    class: "gunslinging", dmgMin: 4, dmgMax: 9, speed: 1.5, ammo: "lead_bullet", reqLevel: 5 },
  steel_revolver: { name: "Steel Revolver", icon: "🔫", type: "weapon", sell: 120,
    class: "gunslinging", dmgMin: 7, dmgMax: 15, speed: 1.4, ammo: "steel_bullet", reqLevel: 15 },
  golden_peacemaker: { name: "Golden Peacemaker", icon: "✨", type: "weapon", sell: 1500,
    class: "gunslinging", dmgMin: 35, dmgMax: 60, speed: 1.3, ammo: "steel_bullet", reqLevel: 50 },

  hunting_rifle: { name: "Hunting Rifle", icon: "🏹", type: "weapon", sell: 260,
    class: "marksmanship", dmgMin: 14, dmgMax: 26, speed: 2.4, ammo: "rifle_round", reqLevel: 25 },
  silver_rifle: { name: "Silver-Plated Rifle", icon: "🏹", type: "weapon", sell: 520,
    class: "marksmanship", dmgMin: 22, dmgMax: 38, speed: 2.2, ammo: "rifle_round", reqLevel: 35 },

  // ---------------- Craftsmanship: ammo ----------------
  lead_bullet:  { name: "Lead Bullets",  icon: "●", type: "ammo", sell: 1 },
  steel_bullet: { name: "Steel Bullets", icon: "⬤", type: "ammo", sell: 3 },
  rifle_round:  { name: "Rifle Rounds",  icon: "➤", type: "ammo", sell: 4 },

  // ---------------- Craftsmanship: armor ----------------
  // slot: head | top | bottom | boots. defense reduces incoming damage.
  leather_hat:         { name: "Leather Hat",         icon: "🎩", type: "armor", slot: "head",   defense: 2,  sell: 20 },
  iron_helm:           { name: "Iron Helm",           icon: "⛑️", type: "armor", slot: "head",   defense: 5,  sell: 90 },
  cavalry_hat:         { name: "Cavalry Hat",         icon: "🤠", type: "armor", slot: "head",   defense: 8,  sell: 260 },

  leather_vest:        { name: "Leather Vest",        icon: "🦺", type: "armor", slot: "top",    defense: 4,  sell: 30 },
  duster_coat:         { name: "Duster Coat",         icon: "🧥", type: "armor", slot: "top",    defense: 7,  sell: 140 },
  steel_plate_vest:    { name: "Steel Plate Vest",    icon: "🛡️", type: "armor", slot: "top",    defense: 12, sell: 420 },

  leather_chaps:       { name: "Leather Chaps",       icon: "👖", type: "armor", slot: "bottom", defense: 3,  sell: 25 },
  reinforced_trousers: { name: "Reinforced Trousers", icon: "👖", type: "armor", slot: "bottom", defense: 6,  sell: 120 },
  steel_greaves:       { name: "Steel Greaves",       icon: "👖", type: "armor", slot: "bottom", defense: 10, sell: 380 },

  worn_boots:          { name: "Worn Boots",          icon: "👢", type: "armor", slot: "boots",  defense: 1,  sell: 8 },
  leather_boots:       { name: "Leather Boots",       icon: "👢", type: "armor", slot: "boots",  defense: 2,  sell: 22 },
  steel_toe_boots:     { name: "Steel-Toe Boots",     icon: "👢", type: "armor", slot: "boots",  defense: 5,  sell: 130 },
  spurred_boots:       { name: "Spurred Boots",       icon: "👢", type: "armor", slot: "boots",  defense: 7,  sell: 300 },

  // ---------------- Accessories (extra customization slot) ----------------
  // dmgBonusPct: % increase to player damage. defense: small bonus too.
  tin_star:         { name: "Tin Star",            icon: "⭐", type: "accessory", slot: "accessory", defense: 1, dmgBonusPct: 0,    sell: 150 },
  pocket_watch:     { name: "Stolen Pocket Watch", icon: "⌚", type: "accessory", slot: "accessory", defense: 0, dmgBonusPct: 0.02, sell: 85 },
  sheriff_badge:    { name: "Sheriff's Badge",     icon: "🌟", type: "accessory", slot: "accessory", defense: 2, dmgBonusPct: 0.08, sell: 400 },
  lucky_ace_card:   { name: "Lucky Ace Card",      icon: "🃏", type: "accessory", slot: "accessory", defense: 0, dmgBonusPct: 0.05, sell: 220 },
  bear_claw_charm:  { name: "Bear Claw Charm",     icon: "🐾", type: "accessory", slot: "accessory", defense: 1, dmgBonusPct: 0.06, sell: 260 },
  flask_of_courage: { name: "Flask of Courage",    icon: "🍶", type: "accessory", slot: "accessory", defense: 0, dmgBonusPct: 0.12, sell: 600 },
  bandit_bandana:   { name: "Bandit's Bandana",    icon: "🧣", type: "accessory", slot: "accessory", defense: 1, dmgBonusPct: 0.03, sell: 45 },
  ghost_dust:       { name: "Ghost Dust",          icon: "👻", type: "accessory", slot: "accessory", defense: 0, dmgBonusPct: 0.15, sell: 300 },
  snake_fang:       { name: "Snake Fang",          icon: "🦷", type: "trophy", sell: 20 },
};

// ------------------------------------------------------------
// NON-COMBAT SKILLS
// `requires` (optional): soft-lock. The skill's tab stays visible
// but is locked (no actions runnable) until ALL listed skills meet
// their level requirement.
// ------------------------------------------------------------

const SKILLS = {
  woodcutting: {
    name: "Woodcutting",
    icon: "🪓",
    actions: [
      { id: "chop_pine",     name: "Chop Pine",     level: 1,  xp: 4,  time: 2.0, yields: [{ item: "pine_wood", qty: 1 }] },
      { id: "chop_oak",      name: "Chop Oak",      level: 12, xp: 13, time: 2.8, yields: [{ item: "oak_wood", qty: 1 }] },
      { id: "chop_ironwood", name: "Chop Ironwood", level: 28, xp: 27, time: 3.8, yields: [{ item: "ironwood", qty: 1 }] },
    ],
  },

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

  farming: {
    name: "Farming",
    icon: "🌾",
    actions: [
      { id: "tend_chickens", name: "Tend Chickens", level: 1,  xp: 4,  time: 2.0, yields: [{ item: "egg", qty: 1 }] },
      { id: "milk_cow",      name: "Milk the Cow",  level: 1,  xp: 4,  time: 2.2, yields: [{ item: "milk", qty: 1 }] },
      { id: "grow_wheat",    name: "Grow Wheat",    level: 6,  xp: 8,  time: 2.6, yields: [{ item: "wheat", qty: 1 }] },
      { id: "herd_cattle",   name: "Herd Cattle",   level: 10, xp: 11, time: 3.0, yields: [{ item: "cattle_hide", qty: 1 }] },
      { id: "smoke_jerky",   name: "Smoke Trail Jerky", level: 10, xp: 12, time: 3.2,
        consumes: [{ item: "cattle_hide", qty: 1 }], yields: [{ item: "trail_jerky", qty: 2 }] },
      { id: "grow_cotton",   name: "Grow Cotton",   level: 16, xp: 15, time: 3.4, yields: [{ item: "cotton", qty: 1 }] },
    ],
  },

  fishing: {
    name: "Fishing",
    icon: "🎣",
    actions: [
      { id: "fish_trout",    name: "Fish for Trout",       level: 1,  xp: 4,  time: 2.2, yields: [{ item: "raw_trout", qty: 1 }] },
      { id: "fish_catfish",  name: "Fish for Catfish",     level: 8,  xp: 9,  time: 2.8, yields: [{ item: "raw_catfish", qty: 1 }] },
      { id: "fish_bass",     name: "Fish for Bass",        level: 15, xp: 14, time: 3.2, yields: [{ item: "raw_bass", qty: 1 }] },
      { id: "fish_salmon",   name: "Fish for Salmon",      level: 24, xp: 21, time: 3.8, yields: [{ item: "raw_salmon", qty: 1 }] },
      { id: "fish_sturgeon", name: "Fish for Sturgeon",    level: 33, xp: 30, time: 4.6, yields: [{ item: "raw_sturgeon", qty: 1 }] },
      { id: "fish_legendary_catfish", name: "Chase the Legendary Catfish", level: 40, xp: 45, time: 6.0, successChance: 0.25,
        yields: [{ item: "legendary_catfish", qty: 1 }] },
    ],
  },

  exploration: {
    name: "Exploration",
    icon: "🧭",
    actions: [
      { id: "scout_trails",     name: "Scout Local Trails",   level: 1,  xp: 5,  time: 2.2, goldYield: { min: 1, max: 4 } },
      { id: "scout_canyon_rim", name: "Scout the Canyon Rim", level: 10, xp: 13, time: 3.0, goldYield: { min: 3, max: 9 } },
      { id: "search_ruins",     name: "Search Ancient Ruins", level: 15, xp: 10, time: 4.0, successChance: 0.3,
        goldYield: { min: 10, max: 30 }, yields: [{ item: "ancient_coin", qty: 1 }] },
      { id: "chart_desert",     name: "Chart the Desert",     level: 25, xp: 22, time: 4.5, goldYield: { min: 8, max: 18 } },
      { id: "hunt_relics",      name: "Hunt for Relics",      level: 32, xp: 28, time: 5.5, successChance: 0.2,
        goldYield: { min: 20, max: 50 }, yields: [{ item: "turquoise_stone", qty: 2 }] },
    ],
  },

  craftsmanship: {
    name: "Craftsmanship",
    icon: "🔨",
    requires: [{ skill: "prospecting", level: 5 }, { skill: "woodcutting", level: 5 }],
    actions: [
      // Bars
      { id: "smelt_bronze", name: "Smelt Bronze Bar", level: 1,  xp: 6,  time: 2.2,
        consumes: [{ item: "copper_ore", qty: 1 }, { item: "tin_ore", qty: 1 }], yields: [{ item: "bronze_bar", qty: 1 }] },
      { id: "smelt_iron",   name: "Smelt Iron Bar",   level: 8,  xp: 12, time: 2.8,
        consumes: [{ item: "iron_ore", qty: 1 }, { item: "coal", qty: 1 }], yields: [{ item: "iron_bar", qty: 1 }] },
      { id: "smelt_silver", name: "Smelt Silver Bar", level: 16, xp: 20, time: 3.2,
        consumes: [{ item: "silver_ore", qty: 1 }], yields: [{ item: "silver_bar", qty: 1 }] },
      { id: "smelt_steel",  name: "Smelt Steel Bar",  level: 18, xp: 22, time: 3.4,
        consumes: [{ item: "iron_ore", qty: 1 }, { item: "coal", qty: 2 }], yields: [{ item: "steel_bar", qty: 1 }] },
      { id: "smelt_gold",   name: "Smelt Gold Bar",   level: 30, xp: 34, time: 4.0,
        consumes: [{ item: "gold_ore", qty: 1 }], yields: [{ item: "gold_bar", qty: 1 }] },

      // Weapons
      { id: "craft_bronze_knuckles", name: "Craft Bronze Knuckles", level: 1, xp: 15, time: 4.0,
        consumes: [{ item: "bronze_bar", qty: 2 }, { item: "pine_wood", qty: 1 }], yields: [{ item: "bronze_knuckles", qty: 1 }] },
      { id: "craft_bronze_revolver", name: "Craft Bronze Revolver", level: 5, xp: 28, time: 5.0,
        consumes: [{ item: "bronze_bar", qty: 4 }, { item: "oak_wood", qty: 1 }], yields: [{ item: "bronze_revolver", qty: 1 }] },
      { id: "craft_steel_revolver", name: "Craft Steel Revolver", level: 15, xp: 48, time: 6.0,
        consumes: [{ item: "steel_bar", qty: 5 }, { item: "oak_wood", qty: 2 }], yields: [{ item: "steel_revolver", qty: 1 }] },
      { id: "craft_steel_tomahawk", name: "Craft Steel Tomahawk", level: 20, xp: 55, time: 6.5,
        consumes: [{ item: "steel_bar", qty: 5 }, { item: "ironwood", qty: 2 }], yields: [{ item: "steel_tomahawk", qty: 1 }] },
      { id: "craft_hunting_rifle", name: "Craft Hunting Rifle", level: 25, xp: 70, time: 7.5,
        consumes: [{ item: "steel_bar", qty: 6 }, { item: "ironwood", qty: 2 }], yields: [{ item: "hunting_rifle", qty: 1 }] },
      { id: "craft_silver_rifle", name: "Craft Silver-Plated Rifle", level: 35, xp: 110, time: 9.0,
        consumes: [{ item: "silver_bar", qty: 6 }, { item: "steel_bar", qty: 4 }, { item: "ironwood", qty: 3 }], yields: [{ item: "silver_rifle", qty: 1 }] },
      { id: "craft_golden_peacemaker", name: "Craft Golden Peacemaker", level: 50, xp: 220, time: 12.0,
        consumes: [{ item: "gold_bar", qty: 8 }, { item: "steel_bar", qty: 6 }, { item: "ironwood", qty: 4 }], yields: [{ item: "golden_peacemaker", qty: 1 }] },

      // Ammo
      { id: "craft_lead_bullet", name: "Cast Lead Bullets (x10)", level: 1, xp: 3, time: 1.4,
        consumes: [{ item: "bronze_bar", qty: 1 }], yields: [{ item: "lead_bullet", qty: 10 }] },
      { id: "craft_steel_bullet", name: "Cast Steel Bullets (x10)", level: 12, xp: 9, time: 1.8,
        consumes: [{ item: "steel_bar", qty: 1 }], yields: [{ item: "steel_bullet", qty: 10 }] },
      { id: "craft_rifle_round", name: "Cast Rifle Rounds (x10)", level: 20, xp: 14, time: 2.2,
        consumes: [{ item: "steel_bar", qty: 1 }, { item: "silver_bar", qty: 1 }], yields: [{ item: "rifle_round", qty: 10 }] },

      // Armor
      { id: "craft_leather_hat",   name: "Craft Leather Hat",   level: 3,  xp: 10, time: 2.6,
        consumes: [{ item: "cattle_hide", qty: 2 }], yields: [{ item: "leather_hat", qty: 1 }] },
      { id: "craft_leather_vest",  name: "Craft Leather Vest",  level: 3,  xp: 12, time: 2.8,
        consumes: [{ item: "cattle_hide", qty: 3 }], yields: [{ item: "leather_vest", qty: 1 }] },
      { id: "craft_leather_chaps", name: "Craft Leather Chaps", level: 4,  xp: 12, time: 2.8,
        consumes: [{ item: "cattle_hide", qty: 3 }], yields: [{ item: "leather_chaps", qty: 1 }] },
      { id: "craft_leather_boots", name: "Craft Leather Boots", level: 4,  xp: 11, time: 2.6,
        consumes: [{ item: "cattle_hide", qty: 2 }, { item: "pine_wood", qty: 1 }], yields: [{ item: "leather_boots", qty: 1 }] },
      { id: "craft_iron_helm",     name: "Craft Iron Helm",     level: 12, xp: 24, time: 3.6,
        consumes: [{ item: "iron_bar", qty: 3 }], yields: [{ item: "iron_helm", qty: 1 }] },
      { id: "craft_duster_coat",   name: "Craft Duster Coat",   level: 14, xp: 30, time: 4.0,
        consumes: [{ item: "iron_bar", qty: 2 }, { item: "cattle_hide", qty: 4 }], yields: [{ item: "duster_coat", qty: 1 }] },
      { id: "craft_reinforced_trousers", name: "Craft Reinforced Trousers", level: 14, xp: 30, time: 4.0,
        consumes: [{ item: "iron_bar", qty: 2 }, { item: "cattle_hide", qty: 3 }], yields: [{ item: "reinforced_trousers", qty: 1 }] },
      { id: "craft_steel_toe_boots", name: "Craft Steel-Toe Boots", level: 16, xp: 32, time: 4.2,
        consumes: [{ item: "steel_bar", qty: 2 }, { item: "cattle_hide", qty: 2 }], yields: [{ item: "steel_toe_boots", qty: 1 }] },
      { id: "craft_steel_plate_vest", name: "Craft Steel Plate Vest", level: 28, xp: 58, time: 5.2,
        consumes: [{ item: "steel_bar", qty: 6 }, { item: "ironwood", qty: 1 }], yields: [{ item: "steel_plate_vest", qty: 1 }] },
      { id: "craft_steel_greaves", name: "Craft Steel Greaves", level: 28, xp: 55, time: 5.0,
        consumes: [{ item: "steel_bar", qty: 5 }], yields: [{ item: "steel_greaves", qty: 1 }] },
      { id: "craft_cavalry_hat",   name: "Craft Cavalry Hat",   level: 30, xp: 60, time: 5.4,
        consumes: [{ item: "silver_bar", qty: 3 }, { item: "cattle_hide", qty: 2 }], yields: [{ item: "cavalry_hat", qty: 1 }] },
      { id: "craft_spurred_boots", name: "Craft Spurred Boots", level: 30, xp: 58, time: 5.2,
        consumes: [{ item: "silver_bar", qty: 2 }, { item: "cattle_hide", qty: 3 }], yields: [{ item: "spurred_boots", qty: 1 }] },
    ],
  },

  settlement: {
    name: "Settlement",
    icon: "🏘️",
    requires: [{ skill: "craftsmanship", level: 10 }, { skill: "farming", level: 5 }],
    actions: [
      { id: "lay_foundations", name: "Lay Foundations",   level: 1,  xp: 10, time: 3.0, goldCost: 20,
        consumes: [{ item: "pine_wood", qty: 3 }] },
      { id: "build_well",      name: "Build a Well",      level: 5,  xp: 18, time: 3.6, goldCost: 40,
        consumes: [{ item: "iron_bar", qty: 2 }] },
      { id: "build_saloon",    name: "Build the Saloon",  level: 10, xp: 30, time: 4.5, goldCost: 80,
        consumes: [{ item: "oak_wood", qty: 4 }, { item: "iron_bar", qty: 3 }] },
      { id: "build_bank_vault",name: "Build a Bank Vault", level: 18, xp: 45, time: 5.5, goldCost: 150,
        consumes: [{ item: "steel_bar", qty: 4 }] },
      { id: "appoint_sheriff", name: "Appoint a Sheriff", level: 25, xp: 60, time: 6.5, goldCost: 250, successChance: 0.5,
        consumes: [{ item: "silver_bar", qty: 3 }, { item: "cotton", qty: 5 }], yields: [{ item: "sheriff_badge", qty: 1 }] },
      { id: "charter_railroad",name: "Charter a Railroad", level: 35, xp: 90, time: 8.0, goldCost: 500,
        consumes: [{ item: "steel_bar", qty: 8 }, { item: "ironwood", qty: 4 }] },
    ],
  },

  debauchery: {
    name: "Debauchery",
    icon: "🥃",
    requires: [{ skill: "settlement", level: 10 }, { skill: "exploration", level: 10 }],
    actions: [
      { id: "nurse_a_whiskey", name: "Nurse a Whiskey",  level: 1,  xp: 6,  time: 2.0, goldCost: 5,
        successChance: 0.6, goldYield: { min: 5, max: 15 } },
      { id: "play_poker",      name: "Play Poker",       level: 8,  xp: 14, time: 3.2, goldCost: 20,
        successChance: 0.45, goldYield: { min: 20, max: 60 } },
      { id: "high_stakes_faro",name: "High-Stakes Faro", level: 18, xp: 26, time: 4.2, goldCost: 60,
        successChance: 0.35, goldYield: { min: 60, max: 180 }, yields: [{ item: "lucky_ace_card", qty: 1 }] },
      { id: "arm_wrestle_bear",name: "Arm-Wrestle a Bear",level: 25, xp: 34, time: 4.8,
        successChance: 0.5, goldYield: { min: 30, max: 80 }, yields: [{ item: "bear_claw_charm", qty: 1 }] },
      { id: "backroom_dice",   name: "Backroom Dice Game", level: 35, xp: 50, time: 6.0, goldCost: 150,
        successChance: 0.3, goldYield: { min: 150, max: 400 }, yields: [{ item: "flask_of_courage", qty: 1 }] },
    ],
  },
};

// ------------------------------------------------------------
// COMBAT SKILLS — trained by equipping the matching weapon class.
// ------------------------------------------------------------

const COMBAT_SKILLS = {
  brawling:     { name: "Brawling",     icon: "👊" },
  gunslinging:  { name: "Gunslinging",  icon: "🔫" },
  marksmanship: { name: "Marksmanship", icon: "🏹" },
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
        loot: [{ item: "leather_vest", chance: 0.1, qty: 1 }] },
      { id: "poacher", name: "Poacher", icon: "🪤", hp: 58, dmgMin: 5, dmgMax: 10, speed: 2.4, xp: 26, goldMin: 10, goldMax: 20,
        loot: [{ item: "duster_coat", chance: 0.06, qty: 1 }, { item: "pocket_watch", chance: 0.1, qty: 1 }] },
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

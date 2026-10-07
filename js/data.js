/* ============================================================
   DUST & IRON — Game Data (v2)
   All static definitions: items, skills, actions, recipes,
   monsters, and regions. No game state lives in here.
   ============================================================ */

const ITEMS = {
  // ---------------- Raw resources ----------------
  // Construction materials (Settlement) — the only four Settlement
  // items buildable standalone; every building/addition consumes
  // some number of these plus other materials.
  foundation:   { name: "Foundation",   icon: "🧱", type: "material", sell: 0 },
  wall:         { name: "Wall",         icon: "🧱", type: "material", sell: 0 },
  roof:         { name: "Roof",         icon: "🏚️", type: "material", sell: 0 },
  balcony:      { name: "Balcony",      icon: "🪟", type: "material", sell: 0 },

  // Prospecting
  copper_ore:   { name: "Copper Ore",   icon: "🟤", type: "ore",  sell: 2 },
  tin_ore:      { name: "Tin Ore",      icon: "⚪", type: "ore",  sell: 2 },
  iron_ore:     { name: "Iron Ore",     icon: "🔘", type: "ore",  sell: 5 },
  silver_ore:   { name: "Silver Ore",   icon: "⚙️", type: "ore",  sell: 12 },
  gold_ore:     { name: "Gold Ore",     icon: "🟡", type: "ore",  sell: 25 },
  coal:         { name: "Coal",         icon: "⚫", type: "ore",  sell: 4 },

  // Woodcutting
  pine_wood:     { name: "Pine Wood",     icon: "🪵", type: "wood", sell: 2 },
  alder_wood:    { name: "Alder Wood",    icon: "🌳", type: "wood", sell: 4 },
  fir_wood:      { name: "Fir Wood",      icon: "🌲", type: "wood", sell: 7 },
  maple_wood:    { name: "Maple Wood",    icon: "🍁", type: "wood", sell: 10 },
  oak_wood:      { name: "Oak Wood",      icon: "🪵", type: "wood", sell: 14 },
  ironwood:      { name: "Ironwood",      icon: "🪵", type: "wood", sell: 22 },
  mesquite_wood: { name: "Mesquite Wood", icon: "🌵", type: "wood", sell: 32 },
  redwood_wood:  { name: "Redwood Wood",  icon: "🎄", type: "wood", sell: 48 },

  // Prospecting
  limestone:    { name: "Limestone",    icon: "🪨", type: "ore",  sell: 3 },
  bronze_ore:   { name: "Bronze Scraps",icon: "🟫", type: "ore",  sell: 8 },

  // Farming
  potato:       { name: "Potato",       icon: "🥔", type: "produce", sell: 3 },
  carrot:       { name: "Carrot",       icon: "🥕", type: "produce", sell: 3 },
  tomato:       { name: "Tomato",       icon: "🍅", type: "produce", sell: 4 },
  corn:         { name: "Corn",         icon: "🌽", type: "produce", sell: 5 },

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
  // restore `heal` HP, consuming one unit. Also usable as Cooking
  // ingredients (see cooking skill / cooked meal items below).
  raw_perch:          { name: "Raw Perch",          icon: "🐟", type: "food", heal: 5,  sell: 2 },
  raw_bluegill:       { name: "Raw Bluegill",       icon: "🐟", type: "food", heal: 6,  sell: 2 },
  raw_trout:          { name: "Raw Trout",          icon: "🐟", type: "food", heal: 8,  sell: 3 },
  raw_crappie:        { name: "Raw Crappie",        icon: "🐠", type: "food", heal: 11, sell: 5 },
  raw_catfish:        { name: "Raw Catfish",        icon: "🐠", type: "food", heal: 14, sell: 6 },
  raw_pike:           { name: "Raw Pike",           icon: "🐠", type: "food", heal: 17, sell: 8 },
  raw_bass:           { name: "Raw Bass",           icon: "🐡", type: "food", heal: 20, sell: 10 },
  raw_walleye:        { name: "Raw Walleye",        icon: "🐡", type: "food", heal: 23, sell: 13 },
  raw_salmon:         { name: "Raw Salmon",         icon: "🍣", type: "food", heal: 28, sell: 16 },
  raw_muskie:         { name: "Raw Muskie",         icon: "🍣", type: "food", heal: 32, sell: 20 },
  raw_sturgeon:       { name: "Raw Sturgeon",       icon: "🐋", type: "food", heal: 38, sell: 26 },
  raw_paddlefish:     { name: "Raw Paddlefish",     icon: "🐋", type: "food", heal: 43, sell: 32 },
  raw_gar:            { name: "Raw Gar",             icon: "🐊", type: "food", heal: 48, sell: 38 },
  raw_steelhead:      { name: "Raw Steelhead",      icon: "🐬", type: "food", heal: 54, sell: 46 },
  raw_golden_trout:   { name: "Raw Golden Trout",   icon: "✨", type: "food", heal: 60, sell: 70, successFish: true },
  legendary_catfish:  { name: "Legendary Catfish",  icon: "🏆", type: "food", heal: 55, sell: 60 },

  // Farming produce doubles as basic trail food

  // ---------------- Cooking: cooked meals ----------------
  // Combine Farming produce + Fishing catches into meals that heal
  // (and sell) for noticeably more than eating the raw ingredients
  // separately. See the `cooking` skill below for recipes.
  campfire_perch:       { name: "Campfire Perch",         icon: "🔥", type: "food", heal: 10, sell: 5 },
  egg_battered_bluegill:{ name: "Egg-Battered Bluegill",  icon: "🍳", type: "food", heal: 15, sell: 9 },
  trout_with_wild_carrots: { name: "Trout with Wild Carrots", icon: "🥘", type: "food", heal: 22, sell: 14 },
  fried_catfish_potatoes:  { name: "Fried Catfish & Potatoes", icon: "🍽️", type: "food", heal: 28, sell: 18 },
  cornbread_crusted_pike:  { name: "Cornbread-Crusted Pike",   icon: "🌽", type: "food", heal: 34, sell: 24 },
  bass_corn_skillet:       { name: "Bass & Corn Skillet",      icon: "🍳", type: "food", heal: 40, sell: 30 },
  buttered_walleye:        { name: "Buttered Walleye",         icon: "🧈", type: "food", heal: 46, sell: 36 },
  salmon_tomato_stew:      { name: "Salmon Tomato Stew",       icon: "🍲", type: "food", heal: 55, sell: 44 },
  muskie_wheat_biscuits:   { name: "Muskie & Wheat Biscuits",  icon: "🥖", type: "food", heal: 62, sell: 52 },
  hearty_fish_stew:        { name: "Hearty Fish Stew",         icon: "🍲", type: "food", heal: 70, sell: 60 },
  sturgeon_steak_dinner:   { name: "Sturgeon Steak Dinner",    icon: "🍽️", type: "food", heal: 78, sell: 70 },
  paddlefish_chowder:      { name: "Paddlefish Chowder",       icon: "🥣", type: "food", heal: 86, sell: 82 },
  steelhead_supreme:       { name: "Steelhead Supreme",        icon: "🍽️", type: "food", heal: 95, sell: 95 },
  golden_trout_feast:      { name: "Golden Trout Feast",       icon: "👑", type: "food", heal: 120, sell: 150 },

  // ---------------- Store-exclusive basic goods ----------------
  trail_rations:    { name: "Trail Rations",    icon: "🥫", type: "food", heal: 12, sell: 5 },
  canteen_of_water: { name: "Canteen of Water", icon: "🧴", type: "food", heal: 5,  sell: 2 },

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
      // woodcuttingAction: true lets a built Woodcutters Camp (Settlement)
      // boost yield via getSettlementBuff('woodcutting_yield_bonus_pct').
      { id: "chop_pine",     name: "Chop Pine",     level: 1,  xp: 4,  time: 2.0, woodcuttingAction: true, yields: [{ item: "pine_wood", qty: 1 }] },
      { id: "chop_alder",    name: "Chop Alder",    level: 6,  xp: 7,  time: 2.3, woodcuttingAction: true, yields: [{ item: "alder_wood", qty: 1 }] },
      { id: "chop_fir",      name: "Chop Fir",      level: 12, xp: 11, time: 2.6, woodcuttingAction: true, yields: [{ item: "fir_wood", qty: 1 }] },
      { id: "chop_maple",    name: "Chop Maple",    level: 18, xp: 16, time: 3.0, woodcuttingAction: true, yields: [{ item: "maple_wood", qty: 1 }] },
      { id: "chop_oak",      name: "Chop Oak",      level: 24, xp: 21, time: 3.3, woodcuttingAction: true, yields: [{ item: "oak_wood", qty: 1 }] },
      { id: "chop_ironwood", name: "Chop Ironwood", level: 32, xp: 29, time: 3.8, woodcuttingAction: true, yields: [{ item: "ironwood", qty: 1 }] },
      { id: "chop_mesquite", name: "Chop Mesquite", level: 40, xp: 38, time: 4.3, woodcuttingAction: true, yields: [{ item: "mesquite_wood", qty: 1 }] },
      { id: "chop_redwood",  name: "Chop Redwood",  level: 50, xp: 50, time: 5.0, woodcuttingAction: true, yields: [{ item: "redwood_wood", qty: 1 }] },
    ],
  },

  prospecting: {
    name: "Prospecting",
    icon: "⛏️",
    actions: [
      // miningAction: true lets a built Mining Hut (Settlement)
      // boost yield via getSettlementBuff('mining_yield_bonus_pct').
      { id: "pan_copper",    name: "Pan for Copper Ore",  level: 1,  xp: 4,  time: 2.2, miningAction: true, yields: [{ item: "copper_ore", qty: 1 }] },
      { id: "pan_tin",       name: "Pan for Tin Ore",     level: 1,  xp: 4,  time: 2.2, miningAction: true, yields: [{ item: "tin_ore", qty: 1 }] },
      { id: "dig_iron",      name: "Dig for Iron Ore",    level: 10, xp: 11, time: 3.0, miningAction: true, yields: [{ item: "iron_ore", qty: 1 }] },
      { id: "scavenge_bronze", name: "Scavenge Bronze Scraps", level: 15, xp: 14, time: 3.2, miningAction: true, yields: [{ item: "bronze_ore", qty: 1 }] },
      { id: "quarry_limestone", name: "Quarry Limestone", level: 18, xp: 16, time: 3.3, miningAction: true, yields: [{ item: "limestone", qty: 1 }] },
      { id: "pan_silver",    name: "Pan for Silver Ore",  level: 20, xp: 19, time: 3.6, miningAction: true, yields: [{ item: "silver_ore", qty: 1 }] },
      { id: "pan_gold",      name: "Pan for Gold Ore",    level: 35, xp: 32, time: 4.4, miningAction: true, yields: [{ item: "gold_ore", qty: 1 }] },
      { id: "dig_coal",      name: "Dig for Coal",        level: 5,  xp: 7,  time: 2.6, miningAction: true, yields: [{ item: "coal", qty: 1 }] },
    ],
  },

  farming: {
    name: "Farming",
    icon: "🌾",
    actions: [
      // farmAction: true lets a built Farmhouse/Barn (Settlement) boost
      // xp/yield via getSettlementBuff('farming_xp_pct' / 'farming_yield_bonus_pct').
      { id: "tend_chickens", name: "Tend Chickens", level: 1,  xp: 4,  time: 2.0, farmAction: true, yields: [{ item: "egg", qty: 1 }] },
      { id: "milk_cow",      name: "Milk the Cow",  level: 1,  xp: 4,  time: 2.2, farmAction: true, yields: [{ item: "milk", qty: 1 }] },
      { id: "grow_potatoes", name: "Grow Potatoes", level: 4,  xp: 6,  time: 2.4, farmAction: true, yields: [{ item: "potato", qty: 1 }] },
      { id: "grow_carrots",  name: "Grow Carrots",  level: 7,  xp: 8,  time: 2.5, farmAction: true, yields: [{ item: "carrot", qty: 1 }] },
      { id: "grow_wheat",    name: "Grow Wheat",    level: 6,  xp: 8,  time: 2.6, farmAction: true, yields: [{ item: "wheat", qty: 1 }] },
      { id: "grow_tomatoes", name: "Grow Tomatoes", level: 9,  xp: 10, time: 2.7, farmAction: true, yields: [{ item: "tomato", qty: 1 }] },
      { id: "grow_corn",     name: "Grow Corn",     level: 12, xp: 12, time: 2.9, farmAction: true, yields: [{ item: "corn", qty: 1 }] },
      { id: "herd_cattle",   name: "Herd Cattle",   level: 10, xp: 11, time: 3.0, farmAction: true, yields: [{ item: "cattle_hide", qty: 1 }] },
      { id: "grow_cotton",   name: "Grow Cotton",   level: 16, xp: 15, time: 3.4, farmAction: true, yields: [{ item: "cotton", qty: 1 }] },
    ],
  },

  fishing: {
    name: "Fishing",
    icon: "🎣",
    actions: [
      // fishAction: true lets a built fishing-related Settlement buff
      // (future-proofing, none yet) and Cooking recognize these as raw
      // ingredients.
      { id: "fish_perch",    name: "Fish for Perch",      level: 1,  xp: 3,  time: 1.8, fishAction: true, yields: [{ item: "raw_perch", qty: 1 }] },
      { id: "fish_bluegill", name: "Fish for Bluegill",   level: 4,  xp: 5,  time: 2.0, fishAction: true, yields: [{ item: "raw_bluegill", qty: 1 }] },
      { id: "fish_trout",    name: "Fish for Trout",       level: 1,  xp: 4,  time: 2.2, fishAction: true, yields: [{ item: "raw_trout", qty: 1 }] },
      { id: "fish_crappie",  name: "Fish for Crappie",    level: 6,  xp: 7,  time: 2.5, fishAction: true, yields: [{ item: "raw_crappie", qty: 1 }] },
      { id: "fish_catfish",  name: "Fish for Catfish",     level: 8,  xp: 9,  time: 2.8, fishAction: true, yields: [{ item: "raw_catfish", qty: 1 }] },
      { id: "fish_pike",     name: "Fish for Pike",       level: 11, xp: 11, time: 3.0, fishAction: true, yields: [{ item: "raw_pike", qty: 1 }] },
      { id: "fish_bass",     name: "Fish for Bass",        level: 15, xp: 14, time: 3.2, fishAction: true, yields: [{ item: "raw_bass", qty: 1 }] },
      { id: "fish_walleye",  name: "Fish for Walleye",    level: 19, xp: 17, time: 3.5, fishAction: true, yields: [{ item: "raw_walleye", qty: 1 }] },
      { id: "fish_salmon",   name: "Fish for Salmon",      level: 24, xp: 21, time: 3.8, fishAction: true, yields: [{ item: "raw_salmon", qty: 1 }] },
      { id: "fish_muskie",   name: "Fish for Muskie",     level: 28, xp: 25, time: 4.2, fishAction: true, yields: [{ item: "raw_muskie", qty: 1 }] },
      { id: "fish_sturgeon", name: "Fish for Sturgeon",    level: 33, xp: 30, time: 4.6, fishAction: true, yields: [{ item: "raw_sturgeon", qty: 1 }] },
      { id: "fish_paddlefish", name: "Fish for Paddlefish", level: 37, xp: 34, time: 5.0, fishAction: true, yields: [{ item: "raw_paddlefish", qty: 1 }] },
      { id: "fish_legendary_catfish", name: "Chase the Legendary Catfish", level: 40, xp: 45, time: 6.0, successChance: 0.25,
        yields: [{ item: "legendary_catfish", qty: 1 }] },
      { id: "fish_gar",      name: "Fish for Gar",        level: 44, xp: 40, time: 5.4, fishAction: true, yields: [{ item: "raw_gar", qty: 1 }] },
      { id: "fish_steelhead", name: "Fish for Steelhead", level: 50, xp: 46, time: 5.8, fishAction: true, yields: [{ item: "raw_steelhead", qty: 1 }] },
      { id: "fish_golden_trout", name: "Chase the Golden Trout", level: 55, xp: 60, time: 6.5, successChance: 0.3,
        yields: [{ item: "raw_golden_trout", qty: 1 }] },
    ],
  },

  cooking: {
    name: "Cooking",
    icon: "🍳",
    requires: [{ skill: "farming", level: 3 }, { skill: "fishing", level: 3 }],
    actions: [
      { id: "cook_campfire_perch", name: "Cook Campfire Perch", level: 1, xp: 5, time: 2.0,
        consumes: [{ item: "raw_perch", qty: 1 }], yields: [{ item: "campfire_perch", qty: 1 }] },
      { id: "cook_egg_battered_bluegill", name: "Cook Egg-Battered Bluegill", level: 5, xp: 9, time: 2.4,
        consumes: [{ item: "raw_bluegill", qty: 1 }, { item: "egg", qty: 1 }], yields: [{ item: "egg_battered_bluegill", qty: 1 }] },
      { id: "cook_trout_with_wild_carrots", name: "Cook Trout with Wild Carrots", level: 9, xp: 14, time: 2.8,
        consumes: [{ item: "raw_trout", qty: 1 }, { item: "carrot", qty: 1 }], yields: [{ item: "trout_with_wild_carrots", qty: 1 }] },
      { id: "cook_fried_catfish_potatoes", name: "Cook Fried Catfish & Potatoes", level: 13, xp: 19, time: 3.2,
        consumes: [{ item: "raw_catfish", qty: 1 }, { item: "potato", qty: 1 }], yields: [{ item: "fried_catfish_potatoes", qty: 1 }] },
      { id: "cook_cornbread_crusted_pike", name: "Cook Cornbread-Crusted Pike", level: 17, xp: 24, time: 3.6,
        consumes: [{ item: "raw_pike", qty: 1 }, { item: "corn", qty: 1 }, { item: "wheat", qty: 1 }], yields: [{ item: "cornbread_crusted_pike", qty: 1 }] },
      { id: "cook_bass_corn_skillet", name: "Cook Bass & Corn Skillet", level: 21, xp: 29, time: 4.0,
        consumes: [{ item: "raw_bass", qty: 1 }, { item: "corn", qty: 1 }], yields: [{ item: "bass_corn_skillet", qty: 1 }] },
      { id: "cook_buttered_walleye", name: "Cook Buttered Walleye", level: 25, xp: 34, time: 4.2,
        consumes: [{ item: "raw_walleye", qty: 1 }, { item: "milk", qty: 1 }], yields: [{ item: "buttered_walleye", qty: 1 }] },
      { id: "cook_salmon_tomato_stew", name: "Cook Salmon Tomato Stew", level: 29, xp: 40, time: 4.6,
        consumes: [{ item: "raw_salmon", qty: 1 }, { item: "tomato", qty: 2 }], yields: [{ item: "salmon_tomato_stew", qty: 1 }] },
      { id: "cook_muskie_wheat_biscuits", name: "Cook Muskie & Wheat Biscuits", level: 33, xp: 46, time: 5.0,
        consumes: [{ item: "raw_muskie", qty: 1 }, { item: "wheat", qty: 2 }, { item: "egg", qty: 1 }], yields: [{ item: "muskie_wheat_biscuits", qty: 1 }] },
      { id: "cook_hearty_fish_stew", name: "Cook Hearty Fish Stew", level: 37, xp: 52, time: 5.4,
        consumes: [{ item: "raw_pike", qty: 1 }, { item: "potato", qty: 1 }, { item: "carrot", qty: 1 }, { item: "tomato", qty: 1 }], yields: [{ item: "hearty_fish_stew", qty: 1 }] },
      { id: "cook_sturgeon_steak_dinner", name: "Cook Sturgeon Steak Dinner", level: 41, xp: 58, time: 5.8,
        consumes: [{ item: "raw_sturgeon", qty: 1 }, { item: "potato", qty: 2 }, { item: "carrot", qty: 1 }], yields: [{ item: "sturgeon_steak_dinner", qty: 1 }] },
      { id: "cook_paddlefish_chowder", name: "Cook Paddlefish Chowder", level: 45, xp: 64, time: 6.2,
        consumes: [{ item: "raw_paddlefish", qty: 1 }, { item: "milk", qty: 2 }, { item: "potato", qty: 1 }], yields: [{ item: "paddlefish_chowder", qty: 1 }] },
      { id: "cook_steelhead_supreme", name: "Cook Steelhead Supreme", level: 50, xp: 72, time: 6.6,
        consumes: [{ item: "raw_steelhead", qty: 1 }, { item: "corn", qty: 2 }, { item: "tomato", qty: 2 }], yields: [{ item: "steelhead_supreme", qty: 1 }] },
      { id: "cook_golden_trout_feast", name: "Cook Golden Trout Feast", level: 56, xp: 100, time: 8.0,
        consumes: [{ item: "raw_golden_trout", qty: 1 }, { item: "corn", qty: 2 }, { item: "tomato", qty: 2 }, { item: "potato", qty: 2 }], yields: [{ item: "golden_trout_feast", qty: 1 }] },
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

      // Weapons. weaponRecipe: true lets a built Gunsmith Wing (Settlement)
      // boost xp gained via getSettlementBuff('craft_weapon_xp_pct').
      { id: "craft_bronze_knuckles", name: "Craft Bronze Knuckles", level: 1, xp: 15, time: 4.0, weaponRecipe: true,
        consumes: [{ item: "bronze_bar", qty: 2 }, { item: "pine_wood", qty: 1 }], yields: [{ item: "bronze_knuckles", qty: 1 }] },
      { id: "craft_bronze_revolver", name: "Craft Bronze Revolver", level: 5, xp: 28, time: 5.0, weaponRecipe: true,
        consumes: [{ item: "bronze_bar", qty: 4 }, { item: "oak_wood", qty: 1 }], yields: [{ item: "bronze_revolver", qty: 1 }] },
      { id: "craft_steel_revolver", name: "Craft Steel Revolver", level: 15, xp: 48, time: 6.0, weaponRecipe: true,
        consumes: [{ item: "steel_bar", qty: 5 }, { item: "oak_wood", qty: 2 }], yields: [{ item: "steel_revolver", qty: 1 }] },
      { id: "craft_steel_tomahawk", name: "Craft Steel Tomahawk", level: 20, xp: 55, time: 6.5, weaponRecipe: true,
        consumes: [{ item: "steel_bar", qty: 5 }, { item: "ironwood", qty: 2 }], yields: [{ item: "steel_tomahawk", qty: 1 }] },
      { id: "craft_hunting_rifle", name: "Craft Hunting Rifle", level: 25, xp: 70, time: 7.5, weaponRecipe: true,
        consumes: [{ item: "steel_bar", qty: 6 }, { item: "ironwood", qty: 2 }], yields: [{ item: "hunting_rifle", qty: 1 }] },
      { id: "craft_silver_rifle", name: "Craft Silver-Plated Rifle", level: 35, xp: 110, time: 9.0, weaponRecipe: true,
        consumes: [{ item: "silver_bar", qty: 6 }, { item: "steel_bar", qty: 4 }, { item: "ironwood", qty: 3 }], yields: [{ item: "silver_rifle", qty: 1 }] },
      { id: "craft_golden_peacemaker", name: "Craft Golden Peacemaker", level: 50, xp: 220, time: 12.0, weaponRecipe: true,
        consumes: [{ item: "gold_bar", qty: 8 }, { item: "steel_bar", qty: 6 }, { item: "ironwood", qty: 4 }], yields: [{ item: "golden_peacemaker", qty: 1 }] },

      // Ammo. ammoRecipe: true lets a built Armory (Settlement) discount
      // the bar cost via getSettlementBuff('ammo_discount_pct').
      { id: "craft_lead_bullet", name: "Cast Lead Bullets (x10)", level: 1, xp: 3, time: 1.4, ammoRecipe: true,
        consumes: [{ item: "bronze_bar", qty: 1 }], yields: [{ item: "lead_bullet", qty: 10 }] },
      { id: "craft_steel_bullet", name: "Cast Steel Bullets (x10)", level: 12, xp: 9, time: 1.8, ammoRecipe: true,
        consumes: [{ item: "steel_bar", qty: 1 }], yields: [{ item: "steel_bullet", qty: 10 }] },
      { id: "craft_rifle_round", name: "Cast Rifle Rounds (x10)", level: 20, xp: 14, time: 2.2, ammoRecipe: true,
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
      // The only four Settlement actions buildable standalone — every
      // building and addition below consumes some number of these.
      { id: "lay_foundation", name: "Lay a Foundation", level: 1,  xp: 8,  time: 2.4, goldCost: 8,
        yields: [{ item: "foundation", qty: 1 }] },
      { id: "build_wall",     name: "Build a Wall",     level: 1,  xp: 5,  time: 1.8, goldCost: 4,
        consumes: [{ item: "pine_wood", qty: 1 }], yields: [{ item: "wall", qty: 1 }] },
      { id: "build_roof",     name: "Build a Roof",     level: 8,  xp: 9,  time: 2.6, goldCost: 10,
        consumes: [{ item: "oak_wood", qty: 1 }], yields: [{ item: "roof", qty: 1 }] },
      { id: "build_balcony",  name: "Build a Balcony",  level: 16, xp: 13, time: 3.2, goldCost: 18,
        consumes: [{ item: "ironwood", qty: 1 }, { item: "iron_bar", qty: 1 }], yields: [{ item: "balcony", qty: 1 }] },
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

// ------------------------------------------------------------
// STORE — the game's economy. Entirely separate from the skill
// tree: sections unlock based on arbitrary conditions (right now
// just "perform this action N times") rather than skill levels,
// so the Store can grow independently later (new sections keyed
// off Settlement buildings, Debauchery reputation, etc).
// Each section's `items` list is its loot/goods table: a flat
// price in gold for a fixed quantity of a basic item.
// ------------------------------------------------------------

const STORE_SECTIONS = [
  {
    id: "trading_post",
    name: "Trading Post",
    icon: "🤝",
    description: "A dusty counter at the edge of town. The trader will sell you the basics once you've proven you know the trails.",
    unlock: { type: "actionCount", actionId: "scout_trails", count: 10, label: "Scout Local Trails (Exploration)" },
    items: [
      { item: "lead_bullet",       qty: 10, price: 15 },
      { item: "trail_rations",     qty: 1,  price: 12 },
      { item: "canteen_of_water",  qty: 1,  price: 5 },
      { item: "worn_boots",        qty: 1,  price: 10 },
      { item: "leather_hat",       qty: 1,  price: 25 },
      { item: "leather_vest",      qty: 1,  price: 35 },
      { item: "pine_wood",         qty: 5,  price: 8 },
      { item: "potato",            qty: 5,  price: 6 },
      { item: "egg",               qty: 5,  price: 4 },
    ],
  },
];

// ------------------------------------------------------------
// SETTLEMENT: BUILDINGS
// Three categories (see `category` field on each building):
//
//  - "non_construction": standalone buildings. They do NOT need
//    Foundations/Walls — just gold + a bit of raw material. These
//    are the explicit exceptions to the construction-material rule.
//  - "construction": everything else. Every stage needs some number
//    of Foundation/Wall (and often Roof/Balcony too, for bigger
//    stages) PLUS whatever other materials are listed. Construction
//    buildings are listed here in unlock order (ascending level).
//
// A building is a `stages` array. Stage 0 is the base structure;
// later stages are ADDITIONS that require the previous stage already
// built (you can't build a Gambling Room before the Saloon exists).
// Some buildings only ever have one stage (nothing to add onto).
// Each stage grants a permanent buff the moment it's constructed —
// see getSettlementBuff() in game.js for how each buff.type is
// actually applied in the engine.
// ------------------------------------------------------------

const BUILDINGS = [
  // ============================================================
  // NON-CONSTRUCTION BUILDINGS — buildable standalone, no
  // Foundation/Wall required.
  // ============================================================
  {
    id: "tent",
    name: "Tent",
    icon: "⛺",
    category: "non_construction",
    description: "A simple canvas tent. Somewhere to rest before the real buildings go up.",
    stages: [
      {
        id: "tent_base", name: "Tent", level: 1,
        cost: { pine_wood: 2 },
        goldCost: 15, xp: 10,
        buff: { type: "max_hp_bonus", value: 5, label: "+5 Max HP" },
      },
    ],
  },
  {
    id: "trading_post_building",
    name: "Trading Post",
    icon: "🤝",
    category: "non_construction",
    description: "A trader's stall at the edge of town. Haggle a standing discount on everything the Store sells.",
    stages: [
      {
        id: "trading_post_building_base", name: "Trading Post", level: 3,
        cost: { cotton: 3 },
        goldCost: 60, xp: 20,
        buff: { type: "store_discount_pct", value: 0.05, label: "+5% discount on Store purchases" },
      },
    ],
  },
  {
    id: "well",
    name: "Well",
    icon: "🪣",
    category: "non_construction",
    description: "Clean water for the whole settlement.",
    stages: [
      {
        id: "well_base", name: "Well", level: 5,
        cost: { iron_bar: 2 },
        goldCost: 40, xp: 18,
        buff: { type: "offline_cap_hours_bonus", value: 2, label: "+2 hours to offline progress cap" },
      },
    ],
  },
  {
    id: "mining_hut",
    name: "Mining Hut",
    icon: "⛏️",
    category: "non_construction",
    description: "A sturdy shack full of pickaxes and lanterns, right at the mouth of the mine.",
    stages: [
      {
        id: "mining_hut_base", name: "Mining Hut", level: 8,
        cost: { limestone: 4 },
        goldCost: 70, xp: 26,
        buff: { type: "mining_yield_bonus_pct", value: 0.08, label: "+8% ore/stone yield from Prospecting" },
      },
    ],
  },
  {
    id: "woodcutters_camp",
    name: "Woodcutters Camp",
    icon: "🪓",
    category: "non_construction",
    description: "A camp at the treeline with sharpened axes and a place to stack logs.",
    stages: [
      {
        id: "woodcutters_camp_base", name: "Woodcutters Camp", level: 8,
        cost: { pine_wood: 6 },
        goldCost: 70, xp: 26,
        buff: { type: "woodcutting_yield_bonus_pct", value: 0.08, label: "+8% wood yield from Woodcutting" },
      },
    ],
  },

  // ============================================================
  // CONSTRUCTION BUILDINGS — require Foundation + Wall (and bigger
  // stages also need Roof/Balcony). Listed in unlock order.
  // ============================================================
  {
    id: "saloon",
    name: "Saloon",
    icon: "🍺",
    category: "construction",
    description: "The heart of frontier nightlife. Build it, then add onto it over time.",
    stages: [
      {
        id: "saloon_base", name: "Saloon", level: 10,
        cost: { foundation: 5, wall: 8, oak_wood: 4, iron_bar: 3 },
        goldCost: 80, xp: 30,
        buff: { type: "debauchery_gold_pct", value: 0.05, label: "+5% gold from Debauchery" },
      },
      {
        id: "saloon_gambling_room", name: "+ Gambling Room", level: 16,
        cost: { foundation: 3, wall: 4, silver_bar: 2 },
        goldCost: 150, xp: 45,
        buff: { type: "debauchery_gold_pct", value: 0.10, label: "+10% gold from Debauchery" },
      },
      {
        id: "saloon_speakeasy", name: "+ Speakeasy", level: 24,
        cost: { foundation: 4, wall: 6, steel_bar: 3, cotton: 5 },
        goldCost: 300, xp: 65,
        buff: { type: "debauchery_success_pct", value: 0.15, label: "+15% success chance on Debauchery games" },
      },
    ],
  },
  {
    id: "farmhouse",
    name: "Farmhouse",
    icon: "🏡",
    category: "construction",
    description: "A proper farmhouse to run the fields from. Teaches better technique, not just more muscle.",
    stages: [
      {
        id: "farmhouse_base", name: "Farmhouse", level: 14,
        cost: { foundation: 4, wall: 6, wheat: 5, pine_wood: 3 },
        goldCost: 100, xp: 35,
        buff: { type: "farming_xp_pct", value: 0.10, label: "+10% XP from Farming actions" },
      },
      {
        id: "farmhouse_henhouse_wing", name: "+ Henhouse Wing", level: 20,
        cost: { foundation: 2, wall: 3, roof: 2, egg: 10 },
        goldCost: 160, xp: 50,
        buff: { type: "farming_xp_pct", value: 0.15, label: "+15% XP from Farming actions" },
      },
    ],
  },
  {
    id: "barn",
    name: "Barn",
    icon: "🏚️",
    category: "construction",
    description: "Storage and stock capacity for the farm — more produce per harvest.",
    stages: [
      {
        id: "barn_base", name: "Barn", level: 18,
        cost: { foundation: 5, wall: 8, roof: 3, oak_wood: 4 },
        goldCost: 180, xp: 55,
        buff: { type: "farming_yield_bonus_pct", value: 0.08, label: "+8% yield from Farming actions" },
      },
      {
        id: "barn_silo", name: "+ Silo", level: 24,
        cost: { foundation: 3, wall: 4, roof: 2, steel_bar: 2 },
        goldCost: 260, xp: 70,
        buff: { type: "farming_yield_bonus_pct", value: 0.12, label: "+12% yield from Farming actions" },
      },
    ],
  },
  {
    id: "market",
    name: "Market",
    icon: "🏪",
    category: "construction",
    description: "A covered market square. Better prices buying and selling.",
    stages: [
      {
        id: "market_base", name: "Market", level: 22,
        cost: { foundation: 5, wall: 7, roof: 3, cotton: 6 },
        goldCost: 220, xp: 60,
        buff: { type: "sell_price_pct", value: 0.05, label: "+5% gold from selling items" },
      },
      {
        id: "market_trade_stalls", name: "+ Trade Stalls", level: 28,
        cost: { foundation: 3, wall: 5, balcony: 2, silver_bar: 2 },
        goldCost: 320, xp: 80,
        buff: { type: "store_discount_pct", value: 0.10, label: "+10% discount on Store purchases" },
      },
    ],
  },
  {
    id: "forge",
    name: "Blacksmith's Forge",
    icon: "⚒️",
    category: "construction",
    description: "Where the town's ore becomes bars, bullets, and blades. Expand it as Craftsmanship grows.",
    stages: [
      {
        id: "forge_base", name: "Blacksmith's Forge", level: 26,
        cost: { foundation: 4, wall: 6, roof: 2, iron_bar: 2 },
        goldCost: 280, xp: 70,
        buff: { type: "ammo_bonus_pct", value: 0.10, label: "+10% ammo yield from casting" },
      },
      {
        id: "forge_gunsmith_wing", name: "+ Gunsmith Wing", level: 32,
        cost: { foundation: 3, wall: 5, balcony: 2, steel_bar: 3 },
        goldCost: 400, xp: 95,
        buff: { type: "craft_weapon_xp_pct", value: 0.15, label: "+15% XP crafting weapons" },
      },
      {
        id: "forge_vault_room", name: "+ Vault Room", level: 40,
        cost: { foundation: 5, wall: 8, balcony: 3, steel_bar: 4, silver_bar: 2 },
        goldCost: 600, xp: 130,
        buff: { type: "death_gold_loss_reduction_pct", value: 0.5, label: "Halves gold lost when knocked out" },
      },
    ],
  },
  {
    id: "sheriff_office",
    name: "Sheriff",
    icon: "🌟",
    category: "construction",
    description: "Law and order, frontier-style. Appointing a sheriff grants the whole town extra protection.",
    stages: [
      {
        id: "sheriff_office_base", name: "Sheriff", level: 30,
        cost: { foundation: 3, wall: 4, roof: 1, silver_bar: 3, cotton: 5 },
        goldCost: 350, xp: 90,
        buff: { type: "global_defense", value: 2, label: "+2 Defense in all combat" },
      },
    ],
  },
  {
    id: "bank_vault",
    name: "Bank",
    icon: "🏦",
    category: "construction",
    description: "A reinforced steel vault for the town's gold reserves.",
    stages: [
      {
        id: "bank_vault_base", name: "Bank", level: 34,
        cost: { foundation: 4, wall: 6, roof: 2, balcony: 1, steel_bar: 4 },
        goldCost: 450, xp: 110,
        buff: { type: "sell_price_pct", value: 0.05, label: "+5% gold from selling items" },
      },
    ],
  },
  {
    id: "doctor",
    name: "Doctor",
    icon: "⚕️",
    category: "construction",
    description: "A clinic to patch up gunshot wounds and snake bites. Expand it into proper surgery later.",
    stages: [
      {
        id: "doctor_base", name: "Doctor", level: 38,
        cost: { foundation: 4, wall: 6, roof: 3, cattle_hide: 4, cotton: 4 },
        goldCost: 500, xp: 120,
        buff: { type: "food_heal_bonus_pct", value: 0.15, label: "+15% HP restored from food" },
      },
      {
        id: "doctor_surgery", name: "+ Surgery", level: 44,
        cost: { foundation: 3, wall: 5, balcony: 2, steel_bar: 3, silver_bar: 2 },
        goldCost: 700, xp: 150,
        buff: { type: "max_hp_bonus", value: 10, label: "+10 Max HP" },
      },
    ],
  },
  {
    id: "railroad_depot",
    name: "Train Station",
    icon: "🚂",
    category: "construction",
    description: "Charter a railroad line and connect the settlement to the wider frontier economy.",
    stages: [
      {
        id: "railroad_depot_base", name: "Train Station", level: 42,
        cost: { foundation: 6, wall: 10, roof: 4, balcony: 2, steel_bar: 8, ironwood: 4 },
        goldCost: 900, xp: 200,
        buff: { type: "offline_cap_hours_bonus", value: 3, label: "+3 hours to offline progress cap" },
      },
    ],
  },
];

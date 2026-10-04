# 🤠 Dust & Iron

A browser-based, Wild West-themed idle/incremental RPG inspired by [Melvor Idle](https://melvoridle.com/). Pan for gold, chop wood, farm the land, explore the frontier, craft your gear, build your settlement, and gun down outlaws — all in pure HTML/CSS/JavaScript, no build step required.

## Play it

Just open `index.html` in any modern browser, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

Progress autosaves to `localStorage` every 5 seconds, and the game simulates offline progress (up to 8 hours) for whatever action you left running — just like Melvor.

> An earlier, simpler version of the game (single Combat skill, Prospecting/Lumberjacking/Blacksmithing/Gunsmithing, "Bank" tab) is preserved at the git tag/branch `v1-original-iteration`.

## Current features (v2)

### Non-combat skills
- **Woodcutting** — chop Pine, Alder, Fir, Maple, Oak, Ironwood, Mesquite, and Redwood (8 tiers)
- **Prospecting** — pan/dig/quarry Copper, Tin, Coal, Iron, Bronze, Limestone, Silver, and Gold
- **Farming** — tend chickens, milk cows, grow Potatoes/Carrots/Wheat/Tomatoes/Corn/Cotton, herd cattle
- **Fishing** — catch trout, catfish, bass, salmon, sturgeon, and a rare Legendary Catfish; catches double as food
- **Exploration** — scout trails, search ruins and hunt relics for gold and trophies (risk/reward, some actions can fail); scouting trails also feeds the Store's Trading Post unlock
- **Craftsmanship** — smelt bars and craft weapons, ammo, and armor. *Soft-locked* until Prospecting 5 + Woodcutting 5.
- **Settlement** — a construction system of its own (see below). *Soft-locked* until Craftsmanship 10 + Farming 5.
- **Debauchery** — gamble, drink, and brawl for gold and rare charms. *Soft-locked* until Settlement 10 + Exploration 10.

Soft-locked skills stay visible in the nav (marked with 🔒) so you always know what's coming, but their actions can't be run until the prerequisites are met. The lock indicator clears live the moment the requirement is met, no reload needed.

### Combat
Three independently-trained combat skills, each leveled by equipping the matching weapon class and fighting with it:
- **Brawling** — fists, knuckles, tomahawks (melee, no ammo)
- **Gunslinging** — revolvers (fast, pistol ammo)
- **Marksmanship** — rifles (slow, high damage, rifle rounds)

Turn-based (tick-based) fights across 4 regions (Dusty Gulch → Whispering Pines → Red Rock Canyon → Boothill Cemetery) with loot drops, gold, and combat XP.

### Equipment system
Six gear slots: **Weapon**, **Head**, **Top**, **Bottom**, **Boots**, and an **Extra** customization slot for accessories (badges, charms, trinkets) that grant bonus damage % and/or defense. Armor reduces incoming damage; accessories can boost both offense and defense.

### Settlement: construction system
Settlement is organized into three sections, in this order:
1. **Non-Construction Buildings** — buildable standalone, no Foundation/Wall needed: Tent, Trading Post, Well, Mining Hut, Woodcutters Camp.
2. **Construction Materials** — Foundation and Wall are the only two base materials buildable by themselves; bigger additions also need Roof and/or Balcony. All four are simple Settlement actions (cost gold + a little raw material).
3. **Construction Buildings** (shown in unlock order) — every one of these requires some number of Foundation/Wall (and often Roof/Balcony) plus other materials. Buildings are **chains of stages**: the first stage is the base structure, later stages are **additions** that require the previous stage to already exist. Two chains as a flagship example:
   - 🍺 **Saloon** → + Gambling Room → + Speakeasy (boosts Debauchery gold/success odds)
   - ⚒️ **Blacksmith's Forge** → + Gunsmith Wing → + Vault Room (ammo yield, weapon-crafting XP, reduced gold loss on death)

   Plus: Farmhouse → Henhouse Wing, Barn → Silo, Market → Trade Stalls, Doctor → Surgery, and single-stage Sheriff/Bank/Train Station.

Every stage grants a **permanent buff** the moment it's built — live gameplay effects (ammo/ore/wood/crop yield, Farming XP, sell price, Store discount, food healing, max HP, defense, offline progress cap, death penalty reduction), not just flavor text.

### Other
- **Storage** — view and sell your inventory (formerly "Bank"); food items show an "Eat" button to heal HP, plus a "Sell #" box to sell a custom quantity (alongside Sell 1 / Sell All)
- **Store** — the game's economy, a separate tab from Storage. Sections unlock based on progress (not skill level) — e.g. the **Trading Post** section unlocks after Scouting Local Trails 10 times — and sell a flat-price loot table of basic goods (ammo, food, starter armor, raw materials) for gold, discounted by any Settlement Trading Post/Market buffs you've built.
- Food/healing: Fishing catches and Store rations restore HP when eaten, from Storage or via a quick-eat bar inside Combat while fighting; a built Doctor boosts how much HP food restores.
- Gold-colored XP bars with a numeric XP readout (e.g. "108 / 210 XP (102 to next level)") under every bar, skill and combat alike
- Inline per-activity progress bars right in each action row, correctly scoped per tab (switching skills while one is running no longer shows a stuck/stale bar)
- Currency displayed as `$123` instead of "123 Dollars"
- Melvor-style exponential XP curve and leveling (same curve for all non-combat and combat skills)

## Roadmap

- More Craftsmanship/Settlement/Debauchery depth (additional recipes, buildings, games)
- Bounty Hunting board (Slayer-style contracts on named outlaws)
- "Go West" prestige system — new frontiers with carried-over legendary perks
- Mastery XP per action
- More regions: Deadwood Flats, Rio Seco Desert, Silver Peak Mountains

## Tech

Vanilla JS, no dependencies, no build tools. `js/data.js` holds all game data (items/skills/monsters/regions); `js/game.js` is the engine (state, tick loop, soft-locks, equipment, rendering).

## License

MIT

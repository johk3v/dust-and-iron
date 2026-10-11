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
- **Fishing** — 16 species from Perch and Bluegill up through Sturgeon, Paddlefish, Steelhead, and two rare risk/reward catches (Legendary Catfish, Golden Trout); catches double as food, or feed into Cooking
- **Cooking** — turn Farming produce + Fishing catches into cooked meals that heal (and sell) for noticeably more than the raw ingredients. *Soft-locked* until Farming 3 + Fishing 3.
- **Exploration** — scout trails, search ruins and hunt relics for gold and trophies (risk/reward, some actions can fail); scouting trails also feeds the Store's Trading Post unlock
- **Craftsmanship** — smelt bars and craft weapons, ammo, and armor. *Soft-locked* until Prospecting 5 + Woodcutting 5.
- **Settlement** — a construction system of its own (see below). *Soft-locked* until Craftsmanship 10 + Farming 5.
- **Debauchery** — gamble, drink, and brawl for gold and rare charms. *Locked* until the Saloon is built in Settlement (requires 500 population).

Soft-locked skills stay visible in the nav (marked with 🔒) so you always know what's coming, but their actions can't be run until the prerequisites are met. The lock indicator clears live the moment the requirement is met, no reload needed.

### Combat
Three independently-trained combat skills, each leveled by equipping the matching weapon class and fighting with it:
- **Brawling** — fists, knuckles, tomahawks (melee, no ammo)
- **Gunslinging** — revolvers (fast, pistol ammo)
- **Marksmanship** — rifles (slow, high damage, rifle rounds)

Turn-based (tick-based) fights across 4 regions (Dusty Gulch → Whispering Pines → Red Rock Canyon → Boothill Cemetery) with loot drops, gold, and combat XP. Combat and skill actions (gathering/crafting) are mutually exclusive — engaging a monster auto-stops whatever skill you were training, and starting a skill action auto-flees any fight in progress, just like switching between two skill actions stops the first.

### Equipment system
Six gear slots: **Weapon**, **Head**, **Top**, **Bottom**, **Boots**, and an **Extra** customization slot for accessories (badges, charms, trinkets) that grant bonus damage % and/or defense. Armor reduces incoming damage; accessories can boost both offense and defense.

### Settlement: construction system
Settlement is organized into three sections, each a separate panel, with every buildable item indented as a row directly under its category:

1. **Non-Construction Buildings** — buildable standalone, no Foundation/Wall needed. Split into two kinds:
   - **Housing** (repeatable — build as many as you can afford): Tent (+1 pop), Shack (+2 pop), House (+5 pop), Apartment (+20 pop). Each builds the settlement's **population**, shown live at the top of the tab. Per-unit cost scales up 15% with each one already built, so population growth isn't a flat grind forever.
   - **Utility buildings** (single-stage, built once): Trading Post, Well, Mining Hut, Woodcutters Camp — each grants a standing buff (Store discount, offline-progress cap, gather yield).
2. **Construction Materials** — Foundation and Wall are the only two base materials buildable by themselves; Roof and Balcony are needed for bigger builds. All four are simple Settlement actions, sorted by level.
3. **Construction Buildings** (shown in unlock order, no "(Req. ...)" clutter — requirements show inline instead) — the big civic buildings, each gated by **both** a Settlement level **and** a population threshold reached via Housing:
   - 🏬 **General Store** — 100 population. Unlocks the General Store section in the Store tab (real crafting materials — wood, bars, cotton — not just trail basics).
   - 🍺 **Saloon** — 500 population. Unlocks the **Debauchery** skill.
   - 🚔 **Jail** — 1,000 population. +10% damage in all combat.
   - 🚂 **Train Station** — 5,000 population. +10% XP from every non-combat skill.

Every Construction Building and utility building still consumes Foundation/Wall/Roof/Balcony plus other materials and gold, same as before — population is an *additional* gate on top, not a replacement for the material cost.

### Other
- **Storage** — view and sell your inventory (formerly "Bank"); food items show an "Eat" button to heal HP, plus a "Sell #" box to sell a custom quantity (alongside Sell 1 / Sell All)
- **Store** — the game's economy, a separate tab from Storage. Sections unlock based on progress (not skill level) — the **Trading Post** unlocks after Scouting Local Trails 10 times (very basic trail goods), the **General Store** unlocks once the Settlement's General Store is built (100 population — real crafting materials) — discounted by any Settlement Trading Post/General Store buffs you've built.
- Food/healing: Fishing catches and Store rations restore HP when eaten, from Storage or via a quick-eat bar inside Combat while fighting.
- Gold-colored XP bars with a numeric XP readout (e.g. "108 / 210 XP (102 to next level)") under every bar, skill and combat alike
- Every skill tab's header (title/emoji, level badge, XP bar) stays sticky at the top of the viewport while you scroll the action list, so running a far-down action (e.g. Chop Redwood) never hides the XP bar that's tracking it
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

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
- **Woodcutting** — chop pine, oak, and ironwood
- **Prospecting** — pan/dig for copper, tin, coal, iron, silver, and gold ore
- **Farming** — tend chickens, milk cows, grow wheat/cotton, herd cattle
- **Exploration** — scout trails, search ruins and hunt relics for gold and trophies (risk/reward, some actions can fail)
- **Craftsmanship** — smelt bars and craft weapons, ammo, and armor. *Soft-locked* until Prospecting 5 + Woodcutting 5.
- **Settlement** — build up the town (well, saloon, bank vault, railroad...). *Soft-locked* until Craftsmanship 10 + Farming 5.
- **Debauchery** — gamble, drink, and brawl for gold and rare charms. *Soft-locked* until Settlement 10 + Exploration 10.

Soft-locked skills stay visible in the nav (marked with 🔒) so you always know what's coming, but their actions can't be run until the prerequisites are met.

### Combat
Three independently-trained combat skills, each leveled by equipping the matching weapon class and fighting with it:
- **Brawling** — fists, knuckles, tomahawks (melee, no ammo)
- **Gunslinging** — revolvers (fast, pistol ammo)
- **Marksmanship** — rifles (slow, high damage, rifle rounds)

Turn-based (tick-based) fights across 4 regions (Dusty Gulch → Whispering Pines → Red Rock Canyon → Boothill Cemetery) with loot drops, gold, and combat XP.

### Equipment system
Six gear slots: **Weapon**, **Head**, **Top**, **Bottom**, **Boots**, and an **Extra** customization slot for accessories (badges, charms, trinkets) that grant bonus damage % and/or defense. Armor reduces incoming damage; accessories can boost both offense and defense.

### Other
- **Storage** — view and sell your inventory (formerly "Bank")
- Gold-colored XP bars; inline per-activity progress bars right in each action row
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

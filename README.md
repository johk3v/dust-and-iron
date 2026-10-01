# 🤠 Dust & Iron

A browser-based, Wild West-themed idle/incremental RPG inspired by [Melvor Idle](https://melvoridle.com/). Pan for gold, smelt ore, forge revolvers, and gun down outlaws across the frontier — all in pure HTML/CSS/JavaScript, no build step required.

## Play it

Just open `index.html` in any modern browser, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

Progress autosaves to `localStorage` every 5 seconds, and the game simulates offline progress (up to 8 hours) for whatever action you left running — just like Melvor.

## Current features (v0.1 — vertical slice)

- **Prospecting** — pan/dig for copper, tin, coal, iron, silver, and gold ore
- **Lumberjacking** — chop pine, oak, and ironwood
- **Blacksmithing** — smelt ore into bronze, iron, steel, silver, and gold bars
- **Gunsmithing** — craft revolvers, rifles, and ammunition
- **Combat** — turn-based (tick-based) gunfights across 4 regions (Dusty Gulch → Whispering Pines → Red Rock Canyon → Boothill Cemetery) with loot drops, gold, and combat XP
- **Bank** — view and sell your inventory
- Melvor-style exponential XP curve and leveling

## Roadmap (see full design doc below)

- Ranching, Trapping, Scouting (remaining gathering skills)
- Leatherworking, Tailoring, Cooking, Distilling, Assaying (remaining production skills)
- Outlawing (risk/reward thieving with a Wanted Level)
- Bounty Hunting board (Slayer-style contracts on named outlaws)
- Township building (Saloon, Bank, General Store, Railroad Depot, etc.)
- "Go West" prestige system — new frontiers with carried-over legendary perks
- Mastery XP per action
- More regions: Deadwood Flats, Rio Seco Desert, Silver Peak Mountains

## Design doc

### Core Loop
Pan for gold → smelt it → forge a revolver → shoot outlaws → loot their gear → sell it → buy land → build your town → take bigger bounties.

### Skills
**Gathering:** Prospecting (Mining), Ranching (Farming), Trapping (Fishing), Lumberjacking (Woodcutting), Scouting (Agility)
**Production:** Blacksmithing, Gunsmithing (Crafting), Leatherworking (Fletching), Tailoring, Cooking, Distilling (Herblore), Assaying (Runecrafting)
**Risk:** Outlawing (Thieving) — rob stagecoaches/trains/banks, scales with a Wanted Level

### Combat classes (gear-defined, not locked)
- **Gunslinger** — pistols, fast/low damage
- **Rifleman** — long-range, high single-hit, slow reload
- **Brawler** — melee, high sustain
- **Dynamiter** — explosives/special ammo, AoE & status effects

### World regions
Dusty Gulch → Whispering Pines → Deadwood Flats → Red Rock Canyon → Rio Seco Desert → Silver Peak Mountains → Boothill Cemetery (supernatural endgame dungeon)

### Progression
Mastery XP per action (passive perks), "Go West" prestige (new frontier + legendary perks), Township building for passive bonuses.

## Tech

Vanilla JS, no dependencies, no build tools. `js/data.js` holds all game data (items/skills/monsters/regions); `js/game.js` is the engine (state, tick loop, rendering).

## License

MIT

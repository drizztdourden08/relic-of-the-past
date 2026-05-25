# Profiles

Profiles are isolated containers that let you maintain completely separate configurations of the game. Each profile has its own:

- ROM reference
- Language
- Save data (all save types)
- Game settings (display, gameplay, audio)
- Control bindings
- MSU pack selection

---

## Creating a Profile

1. Open Menu → Profiles
2. Click **Create Profile**
3. Enter a name
4. Select a ROM (must be imported first)
5. Choose a language

---

## Switching Profiles

Use Menu → **Switch Profile** or the profile selector in the title area. Switching profiles immediately loads that profile's settings and saves. The game must be stopped before switching.

---

## Use Cases

- **Casual vs Speedrun** — different control bindings, different HUD settings
- **Multiple languages** — English profile and a French profile using the same ROM
- **MSU experiments** — try different music packs without affecting your main setup
- **Randomizer** (future) — separate profiles for different seeds

---

## Data Isolation

Profiles are fully isolated. Changing settings in one profile never affects another. Save files, quick save slots, and auto-saves are all per-profile.

---

## Deleting a Profile

Deleting a profile removes all its save data, settings, and bindings. The imported ROM is **not** deleted (ROMs are shared resources).

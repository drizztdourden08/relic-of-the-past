<!-- @layer docs @kind doc -->
# Testing

## Unit tests

Logic is covered by Vitest. Run the file you're working on, not the whole suite:

```bash
pnpm exec vitest run apps/desktop/tests/<file>
```

Tests live in the package they test, under `packages/<name>/tests/`. Tests that drive the app, or several packages at once, live under `apps/desktop/tests/`, and the tests of a repo tool under `tooling/<tool>/tests/`. The save-state fixtures stay in `tests/fixtures/`.

Vitest tests are **throwaway by default**, the same rule as Playwright specs below: write it, run it, delete it once it's done its job. A test becomes permanent only when the maintainer asks for it, and a permanent one carries a `.keep.test.ts` suffix instead of `.test.ts`, no matter which `tests/` folder it lives in (Vitest tests aren't segregated into a scratch vs. permanent folder the way Playwright specs are, since they're organized by subject, not by lifespan). `.gitignore` enforces the default: `*.test.ts` under each of those `tests/` folders is ignored, `*.keep.test.ts` is excepted, so an un-kept test naturally never reaches a commit.

Don't add the `.keep` suffix, or rename an existing test to add it, on your own initiative. If a throwaway looks worth keeping, say so and ask.

### Test-coverage registry

`tests/COVERAGE.md` is a living matrix of app features/areas against their test coverage (covered / partial / none), kept at the root of `tests/` on purpose so a gap is visible at a glance. **It must be kept up to date**: when a `.keep.test.ts` file is added, removed, or its target area changes, update the matching row in the same change. Don't let it drift into a stale snapshot.

## Checking the running app

The app can drive itself from the command line, which is usually quicker than a browser test for confirming a change. Build first with `pnpm run build`, make sure a profile and the save slots you reference exist, then run the built app with a flag:

| Flag | What it does |
|------|--------------|
| `--auto-state=N` | start with the active profile and load save-state slot N |
| `--screenshot=NAME` | capture the window to `Data/screenshots/NAME.png` in the app's user-data folder |
| `--dump-layers=N` | write the collision grid for slot N to `debug-output/dump-layers.json` |
| `--dump-nav=N` | write the navigation state for slot N to `debug-output/dump-nav.json` |
| `--muted` | mute audio |
| `--no-focus` | open the window without taking focus |
| `--instance=NAME` | run as a named instance: own profile, own identity, and read-only for the two shared files below. See the note after this section: some app-wide tool state still isn't sandboxed |

For example:

```bash
pnpm exec electron apps/desktop/dist/electron/main.js --no-focus --muted --instance=big-key --auto-state=test-jail-cell --screenshot=snapshot
```

The JSON dumps are the most reliable way to check navigation and collision behavior, so read those instead of squinting at a screenshot.

### Scripted input and Archipelago flags

Five more flags let a run play the game, reach a multiworld and report what happened without anyone at the keyboard. All five count as automation flags, so the launch stays hidden and muted, the same as `--auto-state`.

| Flag | What it does |
|------|--------------|
| `--input-script=PATH` | play a JSON file of frame-timed pad input into the game |
| `--ap-connect=HOST:PORT:SLOT[:PASSWORD]` | point an Archipelago (online) profile at a plain Archipelago server and slot before the game boots, creating the profile from the server's slot data when none exists |
| `--lobby-join=HOST[:PORT]:CODE` | join an Archipelia lobby with an Archipelia profile (created when none exists), wait for the host to start the room, then boot the game connected to it |
| `--profile-name=NAME` | the profile `--ap-connect` / `--lobby-join` use or create, by exact name |
| `--event-log=PATH` | append one JSON line per Archipelago event to PATH, for a test that waits on the game |

**`--input-script`** takes a JSON array of events. Frames are counted from the first frame after `--auto-state` has loaded (or after the game starts, with `--auto-start`):

```json
[
  { "frame": 120, "press": ["A"] },
  { "frame": 130, "hold": ["Up"], "for": 40 }
]
```

- `press` taps the buttons for 3 frames unless `for` says otherwise; `hold` needs `for`, the number of frames.
- Buttons are `B Y Select Start Up Down Left Right A X L R`, in any letter case. Overlapping events combine.
- The game is paused while the script plays and advanced one frame per tick, so the same script on the same save gives the same result however slow the machine is. The game stays paused for a `--screenshot` taken afterwards, so the picture is the frame after the script's last one. Without `--screenshot` the game resumes when the script ends.
- Pair it with `--screenshot=NAME --screenshot-frames=N` to see the result. A long script needs a larger `--screenshot-timeout=SECONDS`.
- A script that cannot be read or parsed stops the launch with an error in the app log; nothing is played.
- **Tracked script: `apps/desktop/tests/fixtures/input-scripts/links-house-chest.json`.** Played from the save `test-links-house` (Link standing beside his bed in Link's house, room 0x104, nothing collected), it walks him right, down along the south wall and right again to the chest, faces it and opens it. The chest's item (the lamp in a vanilla seed) is granted at frame 233 and the "You got it" text box shows at about frame 285; the extra `A` taps close it, and the game is back in normal play by frame 345. The script ends at frame 443 and tolerates a start a few frames late, so it opens the chest the same way. Run it with `--auto-state=test-links-house --input-script=apps/desktop/tests/fixtures/input-scripts/links-house-chest.json`.

**`--ap-connect`** rewrites an Archipelago (online) profile's server, slot and password and the game connects the way it does after a normal start. The host may not contain a colon, so IPv6 literals are not supported. The password is everything after the third colon. Which profile it uses:

- With `--profile-name=NAME`: the profile called NAME. It is created when it does not exist, and the launch stops if it exists but is not an online profile.
- Without it: the active profile when that already is an online profile; otherwise the profile called after the slot; otherwise one created with the slot's name.
- A created profile shares the ROM, language and sound pack of the profile the launch started on, has Developer Tools and Experimental Features on, and is selected for the launch. Its options come from the server: the launch connects once as the slot (and leaves), reads the Connected packet's `slot_data`, and stores that as the profile's options, seed and Death Link setting. A server that is unreachable, refuses the slot or holds slot data from another world version stops the launch with the reason in the app log.

The slot data RotP reads (`parseSlotData`): `worldVersion` (must equal the app's), `seed`, `options` (a flat map of option name to string, number or boolean), `medallions` (`mire`, `turtleRock`), `deathLink` and `preRolled`. Every name in `options` is a key of the option catalog (`packages/randomizer/src/world/options/`); a name missing from the slot data keeps its baseline value. The keys:

```text
accessibility allow_collect beemizer_total_chance beemizer_trap_chance big_key_shuffle blue_clock_time
boss_shuffle bush_shuffle compass_shuffle countdown_start_time dark_room_light_required death_link
difficulty_heart_cap dungeon_prize_shuffle enemy_damage enemy_health enemy_shuffle entrance_shuffle
entrance_shuffle_seed glitch_boots glitches_required goal green_clock_time hints include_npc_checks
include_world_items key_drop_shuffle killable_thieves map_shuffle misery_mire_medallion mode
plando_connections pot_shuffle red_clock_time restrict_dungeon_item_on_boss retro_arrow_cost_silver
retro_arrow_cost_wood retro_bow retro_caves scams shop_item_slots shop_price_bottle shop_price_modifier
shop_shuffle_mode shop_slot_depth shuffle_prizes small_key_shuffle start_inventory_from_pool tile_shuffle
timer triforce_pieces_available triforce_pieces_extra triforce_pieces_mode triforce_pieces_percentage
triforce_pieces_required turtle_rock_medallion
```

Two more families are generated rather than listed: `capacity_upgrades_enabled`, `capacity_progressive` and every key matching `capacity_(explosives|projectiles|meter|wallet)_(mode|start|max|count|curve|jumps)` (`world/capacity/capacity-option-keys/`), and `pond_share` with the per-pond ask keys of `pondAskKeysOf` (`world/pond/pond-ask-keys/`).

**`--lobby-join`** uses an Archipelia profile, picked the same way as for `--ap-connect`: `--profile-name=NAME` names it exactly; without that the active profile when it is an Archipelia profile, otherwise the one called `RotP-` plus the first four characters of the lobby code. A missing profile is created and joins the lobby through the code the profile form runs. Its name is also its slot name, so it must be a valid slot name (at most 16 characters, no braces). The lobby's `lobby.info` reply fixes the server, code and Archipelago build; it carries no per-slot options, so a created profile starts from the form's default options. The host and port are the lobby's, and the code is the eight-character lobby code, written with or without its dash. The port is optional and defaults to the lobby port. The launch waits (up to 15 minutes) for the lobby to start its room; when that happens the profile becomes an online profile for the room, and the game boots connected to it. `--ap-connect` and `--lobby-join` cannot be combined, and neither boots the game by itself: add `--auto-state=NAME` or `--auto-start` (without one, `--lobby-join` only joins and waits).

**`--event-log`** writes through the main process, one JSON object per line, appended and flushed per line (the file and its folder are created on the first line). Only the online Archipelago client writes to it; the frame is the number of emulator frames the core has run since it booted, so it advances with `--input-script` steps and with real play alike.

```json
{"t":"location-checked","id":<AP location id>,"name":"...","frame":n}
{"t":"item-received","id":<AP item id>,"name":"...","from":"<player>","self":true,"frame":n}
{"t":"connected","slot":"...","server":"..."}
{"t":"disconnected","reason":"..."}
```

- `location-checked` is written when this instance reports a check (the line is written even if the server is not reachable yet; the report is then sent on connect).
- `item-received` is written when an item the server sent is handed to the game, or arrives back as the echo of this instance's own pickup. `from` is the sending player, or `the server` for items the server sent itself; `self` is true when the sender is this slot.
- `disconnected` reasons are `connection lost` (the link dropped; the client retries) and `session stopped`.

For example, two instances playing the same multiworld, one through a lobby and one by hand:

```bash
rotp worktree launch a test-links-house --lobby-join=192.168.1.20:38281:K7M2-Q9XD --input-script=chest.json
rotp worktree launch b test-links-house --ap-connect=192.168.1.20:38282:Player2 --input-script=chest.json
```

Launch test runs with `--no-focus --muted` so the window doesn't grab focus while you work. For a quick dev-server boot check, use `pnpm run dev -- --no-focus --muted`.

### Mandatory: an automated launch always names its own profile

> **Every automated launch must pass `--instance=NAME` and use that instance's own
> profile.** Never launch automation against the profile that opens by default. That
> profile, its save states and its settings belong to the person at the keyboard and are
> relied on for their own testing, so an automated run must leave them exactly as it found
> them.

An `--instance=NAME` launch gets its own profile (created by `rotp worktree create NAME`,
pre-loaded with a copy of the named save states) and identifies itself on screen and on the
taskbar, so it is never mistaken for the real app. See
[parallel-worktrees.md](parallel-worktrees.md).

The app enforces the "changes nothing shared" half of this instead of trusting the caller.
Any launch carrying an automation flag is **read-only** for configuration every launch
shares:

| Shared file | What it controls | On an automated launch |
|---|---|---|
| `lastProfileId` in `Data/app.json` | which profile opens by default | never written |
| `Data/config/window-state.json` | window size, position, maximized/fullscreen | never written |

So forgetting `--instance` cannot repoint the default profile or move the window. It
does mean the run shares the user's save data, which is exactly what the rule above exists
to prevent. Pass the flag.

### `--instance` sandboxes profile data, not app-wide tool state

`--instance` selects a game **profile** (`app.getPath('userData')` is one fixed directory
regardless of the flag, as `initPaths` in `@drizztdourden08/brock-electron` shows), so anything that isn't
stored inside `Data/profiles/<id>/` is shared across every instance, named or not. Besides
the two enforced-read-only files above, five files sit directly under `Data/` and are
**global by design:** they're tool/UI preferences, not gameplay state, so
they don't belong per-profile any more than a window's size would:

| File | What it holds |
|---|---|
| `Data/ui-views.json` | Data Inspector view-state: per-collection columns, sort, filters |
| `Data/nav-review.json` | navigation-baseline review progress |
| `Data/connection-review.json` | connection-review progress |
| `Data/sprite-review.json` | sprite-review progress |
| `Data/stick-calibration.json` | controller stick calibration (hardware, not a save) |

Unlike the two files the app refuses to write, these are meant to be written, and normal use
updates them. The consequence for automation: **a `--instance` launch is not
a safe sandbox for exercising a real UI flow that saves through one of these files.**
Resizing/sorting/filtering a live Data Inspector column, for example, debounce-saves
straight to the one shared `ui-views.json`, which is where the maintainer's own hand-tuned
layouts live. Before driving that flow with Playwright, read the file first; if it holds
real content, verify with a throwaway unit test against the pure logic instead of the live
UI, or stop short of the save-triggering interaction.

## Playwright

Playwright specs are **throwaway by default**. The app changes quickly and specs go stale within days, so a one-off check belongs in `tests/scratch/` (gitignored): write it, run it, delete it.

A spec becomes permanent only when the maintainer asks for it. Those live in `apps/desktop/tests/e2e/` with a `.keep.spec.ts` suffix and are documented in that folder's README, which records what each one guards against. Don't add one, or move a spec there, on your own initiative. If a throwaway looks worth keeping, say so and ask.

A few files make up the test harness and shouldn't be changed casually: `apps/desktop/electron/handlers/test-handlers.ts` and `apps/desktop/src/views/GameSession/behavior/useAutoTest.ts`. If you think one needs to change, check with the maintainer first.

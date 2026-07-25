<!-- @layer docs @kind doc -->
# Working on the project in parallel

Several people — or several automated sessions — can work this repo at the same time,
each in a separate checkout with its own build, and each able to run the app without
disturbing anyone else's game data.

Two pieces make that work: a pool of **worktrees** managed by `npm run wt`, and a
**named instance** flag on the app itself.

## Quick start

```bash
npm run wt:list
```

```bash
npm run wt -- claim --any --ttl 4h
```

`claim` prints the worktree path and a ready-to-run launch command. Work in that
directory, then hand it back:

```bash
npm run wt -- release <name>
```

If the pool has nothing free, create a worktree — this takes a few minutes and about
800 MB, which is why reusing one is preferred:

```bash
npm run wt -- new <name>
```

## Commands

| Command | What it does |
|---|---|
| `wt list` | Every worktree with its live status. `--json` for machine-readable output. |
| `wt claim <name>` / `--any` | Lease a worktree. `--any` picks the best free one and brings it up to date. |
| `wt release <name>` | Return it to the pool. Leaves the checkout, branch and notes alone. |
| `wt new <name>` | Create a worktree, its branch and its game profile, then build it. |
| `wt refresh <name>` | Fetch and rebase onto the base branch. `--all` for every worktree. |
| `wt note <name> "…"` | Record what a session worked on. |
| `wt pr <name> <url>` | Record the PR opened from the worktree. |
| `wt launch <name>` | Run the built app from the worktree as a named instance. |
| `wt clean` | Remove finished worktrees. Dry run unless `--yes`. |
| `wt doctor` | Reconcile the registry with what is on disk. |

Add `--help` to any command for its exact options.

Worktrees live beside the repo in `../rotp-worktrees/` (override with
`ROTP_WORKTREE_ROOT`), so a worktree's 800 MB of dependencies never lands inside the
tree that linting and tests walk. The pool's bookkeeping lives in
`../rotp-worktrees/registry.json`.

## What each worktree gets, and what it shares

Each worktree has its **own** checkout, branch, `node_modules`, WASM core, `dist/`,
`debug-output/` and screenshots. Nothing about one worktree's build can affect another's.

Each also gets its **own game profile**, named after the worktree, holding its own save
states and quick-save slots. Your default profile is never touched — with two instances
running at once, each writes only its own profile, including the game's battery save.

The new profile starts with a **copy of your named save states**, so
`--auto-state=test-jail-cell` and the other baselines work in it immediately. Quick saves
and auto-saves are not copied, and neither is the battery save, so an agent starts from
the same baselines rather than inheriting in-game progress.

Shared, because it is read far more than written: the ROMs, extracted assets, sprites and
language packs in the user-data folder.

Two files in that folder belong to whoever is at the keyboard, and a named instance never
writes them — your window position (`config/window-state.json`) and your last-used profile
(`app.json`). Close an agent's window and your own next launch is exactly as you left it.

### A new worktree needs files git does not carry

`git worktree add` produces tracked files only, and several things this project needs are
deliberately git-ignored: `CLAUDE.md`, `.claude/`, `.vault/`, `test-roms/` and the asset
blob. `wt new` supplies them — `.claude/` and `.vault/` as directory links so a change
reaches every worktree at once, everything else copied.

## Mandatory: automation never runs on the default profile

> **Every automated launch must pass `--instance=NAME`.** The profile that opens by
> default belongs to the person at the keyboard — they rely on it for their own testing,
> and an automated run must never use it, change its saves, or change which profile opens
> next time.

The app enforces the second half: any launch carrying an automation flag is read-only for
`Data/app.json` (`lastProfileId`) and `Data/config/window-state.json`, so a forgotten flag
cannot repoint the default profile or move the window. It would still share the user's save
data, though, which is the reason the rule exists. Pass the flag.

## Identifying a running instance

Launch the app with `--instance=<name>` and it identifies itself four ways: the bot icon
on the taskbar (the dock on macOS), the name in the window title, the bot logo in the
title bar, and a name chip beside it. It also boots straight into the profile of the same
name.

The window title is held deliberately: the game core sets its own SDL window title, which
would otherwise replace ours as soon as the game starts. On Windows an instance also takes
its own taskbar identity, so it groups separately from your app rather than merging with it.

```bash
npx electron dist/electron/main.js --no-focus --muted --instance=big-key
```

`--no-focus --muted` keep the window inactive and silent — always use them for an
automated launch. Pass `--profile=<name|id>` to run an instance against a different
profile, and add the usual automation flags (`--auto-state`, `--screenshot`,
`--dump-nav`, `--sim-run`) as normal.

Without `--instance`, nothing changes: the app looks and behaves exactly as it always has.

## Statuses, and when a worktree can be removed

`wt list` derives each status from git, so it can never be out of date:

| Status | Meaning |
|---|---|
| `ready` | Clean, unused, nothing unmerged — claim it. |
| `spent` | Used before, and its work has landed. Safe to reuse or remove. |
| `leased` | A session holds it. A lease has an expiry, so an abandoned one frees itself. |
| `holds-work` | Uncommitted changes, or commits not yet on the base branch. |
| `missing` | The checkout is gone; `wt doctor` drops the record. |

A worktree counts as finished when every commit on its branch is already on the base
branch — the same condition as its pull request having been merged. Nothing has to be
marked done by hand.

`wt clean` will not touch a `holds-work` or `leased` worktree, prints exactly what it
would remove, and only acts with `--yes`. Removing a worktree also removes its game
profile **and that profile's save states**.

> ⚠️ **Remove worktrees with `wt clean`, never with `git worktree remove` directly.**
> A worktree links to the main repo's `.claude/` and `.vault/`, and
> `git worktree remove` follows those links and deletes the contents of the real
> directories. `wt clean` detaches the links first and refuses to continue if any
> remain. If you ever do lose them: `.claude/` is restored by the ai-config bootstrap
> and `.vault/` by `npm run vault:sync`.

## Keeping branches in step

All worktrees share one `.git`, so a single `git fetch` in any of them updates
`origin/master` everywhere and no objects are duplicated. Git also refuses to check the
same branch out twice, so two sessions cannot collide on one branch.

`wt claim` refreshes automatically when the tree is clean and behind. It never rebases a
dirty tree — it reports and leaves the work alone. Nothing in `wt` pushes, opens a PR or
merges anything.

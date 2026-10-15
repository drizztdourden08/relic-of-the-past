<!-- @layer docs @kind doc -->
# Working on the project in parallel

Several people and several automated sessions can work this repo at the same time,
each in a separate checkout with its own build, and each able to run the app without
disturbing anyone else's game data.

Two pieces make that work: **worktrees** managed by the `rotp` command, and a
**named instance** flag on the app itself.

## Quick start

```bash
rotp worktree create <name>
```

`create` makes the worktree and its branch, installs its dependencies, and sets up its
own game profile. It prints the path and the launch command. Work in that directory, then
retire it from inside:

```bash
rotp worktree finish
```

## Commands

| Command | What it does |
|---|---|
| `rotp worktree create <name>` | Create a worktree, its branch and its game profile. `--from <ref>` picks the start point and `--base <branch>` the branch it merges into. |
| `rotp worktree launch <name> <state or none>` | Run the app from the worktree as a named instance. `none` boots the app only, a save name boots the game on that state. |
| `rotp worktree refresh <name>` | Put the worktree back to as created. `--rebase [ref]` also brings the branch up to date. |
| `rotp worktree commit [name]` | Commit with the repo hooks running. |
| `rotp worktree finish [name]` | Remove a finished worktree and its merged branch, from inside it. |
| `rotp worktree remove <name>` | Remove a worktree from outside it. It refuses when work is uncommitted or unpushed. |
| `rotp worktree base [name]` | Show or change the branch the worktree merges into. |

Run `rotp` with no arguments for the exact options.

## What each worktree gets

Each worktree has its **own** checkout, branch, `node_modules`, WASM core, `dist/`,
`debug-output/` and screenshots. Nothing about one worktree's build can affect another's.

Each also gets its **own user data folder** at `<worktree>/.user-data/`, holding its game
profile with its own save states and quick-save slots. Your default profile is never
touched, and with two instances running at once each writes only its own profile,
including the game's battery save.

The settings of that profile are kept. They are copied up to the main checkout when a
launch ends, and the next worktree starts from that copy, so a setting tuned once stays
tuned.

Each worktree has its own port slot, so its dev servers never collide with another
checkout's.

### A new worktree needs files git does not carry

`git worktree add` produces tracked files only, and several things this project needs are
deliberately git-ignored: `CLAUDE.md`, `.claude/`, the ROM and the asset blob.
`rotp worktree create` wires the project guide and the tooling config, and provisions the
ROM, the assets and the save state fixtures under `<worktree>/.user-data/`. The record
dataset at `packages/game-data/src/data/records/` is an ordinary tracked directory, so a
new worktree already has its own copy.

## Mandatory: automation never runs on the default profile

> **Every automated launch must use a named instance and that instance's own
> profile.** The profile that opens by default belongs to the person at the keyboard, who
> relies on it for their own testing. An automated run must never use it, change its
> saves, or change which profile opens next time.

The app enforces the second half: any launch carrying an automation flag is read-only for
`Data/app.json` (`lastProfileId`) and `Data/config/window-state.json`, so a forgotten flag
cannot repoint the default profile or move the window. It would still share the user's save
data, though, which is the reason the rule exists.

## Identifying a running instance

A launch from `rotp worktree launch` identifies itself four ways: the bot icon on the
taskbar (the dock on macOS), the name in the window title, the bot logo in the title bar,
and a name chip beside it. It also boots straight into the profile of the same name.

The window title is held deliberately: the game core sets its own SDL window title, which
would otherwise replace ours as soon as the game starts. On Windows an instance also takes
its own taskbar identity, so it groups separately from your app instead of merging with it.

An automated launch is headless by default: the window stays inactive and silent. Add
`--visible` to hand the window to a person, and `--sound` only when audio is wanted. Pass
the usual automation flags (`--screenshot`, `--dump-nav`, `--sim-run`) after the state.

## When a worktree can be removed

`finish` and `remove` check git, so the answer is never out of date. A worktree counts as
finished when every commit on its branch is already on its base branch, which is the same
condition as its pull request having been merged. Nothing has to be marked done by hand.

Both refuse a worktree with uncommitted changes or commits that have not landed.
Removing a worktree also removes its game profile **and that profile's save states**.

> **Remove worktrees with `rotp worktree finish` or `remove`, never with
> `git worktree remove` directly.** A worktree links to the main repo's `.claude/` and
> record dataset, and `git worktree remove` follows those links and deletes the contents
> of the real directories. The rotp verbs detach the links first. If you ever do lose them:
> `.claude/` is restored by rendering the local tooling config again, and the dataset by
> `pnpm run vault:sync`.

## Keeping branches in step

All worktrees share one `.git`, so a single `git fetch` in any of them updates
`origin/master` everywhere and no objects are duplicated. Git also refuses to check the
same branch out twice, so two sessions cannot collide on one branch.

`rotp worktree refresh --rebase` brings a clean tree up to date and aborts a conflicted
rebase. The `rotp pr` verbs, not the worktree verbs, push a branch and open its pull
request.

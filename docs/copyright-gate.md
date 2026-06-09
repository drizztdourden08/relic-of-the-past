<!-- @layer docs @kind doc -->
# Copyright / Media Gate

An automatic guard that flags any **media** (images, audio, music, video, fonts, ROM/asset
binaries) or **Nintendo trademark reference** introduced by a commit or PR. The project ships no
game assets, so anything flagged needs a conscious "yes, this is fine" from the owner.

It runs in two places, sharing one engine (`scripts/copyright-gate/`):

| Layer | Where | Purpose | How to approve |
|-------|-------|---------|----------------|
| `commit-msg` hook | local, on every commit | your personal heads-up | add `[allow-copyright]` to the commit message |
| Copyright Gate workflow | GitHub, on PR + push to `master` | the enforced gate | apply the **`copyright-ok`** label (maintainers only) — or the commit already carries `[allow-copyright]` |

## What it flags (changed files / added lines only)

- **Media files** — any added/modified file with an image/audio/video/font/rom extension. Always a
  hard block until approved. Existing committed assets are never re-scanned.
- **Nintendo references** — trademarked terms (Zelda, Hyrule, Ganon, Triforce, Master Sword,
  Nintendo, …) in *added* text lines. Paths that legitimately use these names are skipped
  (`docs/`, `*.md`, `shared/game/data/`, `shared/input/data/`, `shared/credits.ts`, `LICENSE`,
  the gate itself). Tune the lists in [`patterns.mjs`](../scripts/copyright-gate/patterns.mjs).

## Approving

- **Your own commit:** put `[allow-copyright]` anywhere in the commit message. It passes the local
  hook *and* the CI gate (the marker travels with the commit), and documents the decision in history.
  ```
  git commit -m "Add app store screenshot [allow-copyright]"
  ```
- **A contributor's PR:** review it, then add the **`copyright-ok`** label. Only users with write
  access can label, so this is the owner-only approval. (A PR also passes if its commits carry
  `[allow-copyright]`.)
- **Emergency local skip:** `git commit --no-verify` bypasses the hook — but CI still enforces.

## Setup (one-time)

- The hook installs itself on `npm install` via the `prepare` script (`git config core.hooksPath .githooks`).
- Make **`Copyright Gate`** a **required status check** on `master`
  (GitHub → Settings → Branches → branch protection). That's what makes a flagged PR un-mergeable
  until you approve — the one manual step.

## Tuning

- Media is a hard block. To make the Nintendo-text rule warn-only instead of blocking, set
  `TEXT_RULE_BLOCKS = false` in [`patterns.mjs`](../scripts/copyright-gate/patterns.mjs).
- Add extensions to `MEDIA_EXT`, terms to `TRADEMARK_RE`, or skip-paths to `TEXT_SKIP_*` in the same file.

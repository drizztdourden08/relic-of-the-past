<!-- @layer docs @kind doc -->
# Copyright / Media Gate

An automatic guard that flags any media (images, audio, music, video, fonts, ROM or asset binaries) or Nintendo trademark reference introduced by a commit or PR. The project ships no game assets, so anything it flags needs a deliberate sign-off from the owner.

It runs in two places, sharing one engine in `scripts/copyright-gate/`:

| Layer | Where | Purpose | How to approve |
|-------|-------|---------|----------------|
| `commit-msg` hook | local, on every commit | your personal heads-up | add `[allow-copyright]` to the commit message |
| Copyright Gate workflow | GitHub, on PR and push to `master` | the enforced gate | apply the `copyright-ok` label (maintainers only), or carry `[allow-copyright]` on the commit |

## What it checks

It only looks at changed files and added lines:

- **Media files:** any added or modified file with an image, audio, video, font, or ROM extension. These are blocked until approved; files already committed are never re-scanned.
- **Nintendo references:** trademarked terms such as Zelda, Hyrule, Ganon, Triforce, Master Sword, and Nintendo in added text. Paths that legitimately use these names are skipped, including `docs/`, `*.md`, `shared/game/data/`, `shared/input/data/`, `shared/credits.ts`, `LICENSE`, and the gate itself. The lists live in `scripts/copyright-gate/patterns.mjs`.

## Approving

- **Your own commit:** put `[allow-copyright]` anywhere in the commit message. It clears both the local hook and the CI gate, and the decision stays in the history.
  ```
  git commit -m "Add app store screenshot [allow-copyright]"
  ```
- **A contributor's PR:** review it and add the `copyright-ok` label. Only users with write access can apply labels, so this stays an owner-level approval. A PR also passes if its commits already carry `[allow-copyright]`.
- **Emergency local skip:** `git commit --no-verify` bypasses the hook, but CI still enforces it.

## Setup (one-time)

- The hook installs itself on `npm install` through the `prepare` script (`git config core.hooksPath .githooks`).
- Make `Copyright Gate` a required status check on `master`, under GitHub → Settings → Branches → branch protection. That's what keeps a flagged PR un-mergeable until you approve it.

## Tuning

Media is always blocked. To make the Nintendo-text rule warn instead of block, set `TEXT_RULE_BLOCKS = false` in `scripts/copyright-gate/patterns.mjs`. You can also add extensions to `MEDIA_EXT`, terms to `TRADEMARK_RE`, or skip-paths to `TEXT_SKIP_*` in the same file.

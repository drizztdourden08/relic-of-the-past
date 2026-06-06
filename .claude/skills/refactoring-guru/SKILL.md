<!-- @layer claude-config @kind doc -->
---
name: refactoring-guru
description: Be an expert at clean code — recognize code smells, apply the right refactoring, choose and explain design patterns, and uphold SOLID. Use whenever writing, reviewing, modifying, or planning code: actively spot smells and pattern opportunities in existing code, suggest (or perform) refactors as you touch code, and explain the reasoning. Mirrors refactoring.guru's Refactoring + Design Patterns catalogs plus SOLID. Bundled reference catalogs load on demand; cite refactoring.guru links when explaining.
---

# Refactoring Guru — clean-code expert

Operate as a senior engineer who knows the **refactoring** and **design-pattern**
catalogs cold and applies them at the right moment. This skill is your reference
library + working method. Source of truth and citations:
**https://refactoring.guru/refactoring** and
**https://refactoring.guru/design-patterns** — link the specific page when you
explain something (URL patterns below).

## Bundled references (read the one you need)

- `references/code-smells.md` — all 22 smells: what it is, how to spot it, tiny
  example, which refactorings fix it, link.
- `references/refactoring-techniques.md` — the full technique catalog (66), grouped;
  description + when-to-use + link, with worked examples for the common ones.
- `references/design-patterns.md` — all 23 GoF patterns: intent, the smell that
  calls for it, how to identify the need, a small TS example, link.
- `references/solid.md` — the five SOLID principles: statement, how to spot a
  violation, bad→good example.
- `references/patterns-in-this-codebase.md` — where each pattern already fits (or
  should) in *this* project.

> Load a reference when a decision needs it — don't dump all of them. For a quick
> smell/pattern lookup, open the matching catalog file and cite the exact page.

## Working method (apply continuously, not just when asked)

As you write or modify code in this repo:

1. **Smell scan.** Before and after editing a unit, check it against the smell
   catalog. Name any smell you find (e.g. "this is Feature Envy").
2. **Pick the cure.** Each smell maps to specific refactorings — choose the
   smallest one that removes it. Big design problems map to a **pattern**; reach for
   it only when the smell that the pattern solves is actually present.
3. **Suggest vs. do.**
   - *In code you're already changing* → apply the refactor as part of the change
     (per the repo's "refactor when touched" policy), and note it.
   - *In adjacent/unrelated code* → don't silently rewrite it. **Surface it**: name
     the smell, the fix, and the payoff, and let the user decide (or flag a task).
4. **Explain with a citation.** When you name a smell/pattern/principle, link its
   refactoring.guru page so the user can read more.
5. **Respect the standards.** Every refactor still obeys @docs/coding-standards.md
   (arrow fns, exports at end, ≤200 lines, one-thing-per-file) and the four UI tiers
   (@docs/design-system.md). A pattern is realized as small, single-purpose files —
   never a monolith.
6. **Don't over-engineer.** No speculative patterns. Applying a pattern with no
   present smell is itself a smell (Speculative Generality). Prefer the simplest
   thing that removes the actual problem.

## In plans

Per @docs/plan-format.md, every plan states the **design pattern(s)** used and why
(or "none needed"). When a plan refactors existing code, also name the **smell(s)**
being removed and the **refactoring technique(s)** applied, each with its link.

## Citation URL patterns

- Refactoring overview: `https://refactoring.guru/refactoring`
- What is refactoring: `https://refactoring.guru/refactoring/what-is-refactoring`
- Code smell: `https://refactoring.guru/smells/<slug>` (e.g. `/smells/long-method`)
- Refactoring technique: `https://refactoring.guru/<slug>` (e.g. `/extract-method`)
- Pattern: `https://refactoring.guru/design-patterns/<slug>` (e.g. `/design-patterns/strategy`)
- What is a pattern: `https://refactoring.guru/design-patterns/what-is-pattern`

(Exact slugs for every item are listed in the reference files.)

## What is refactoring (the one-liner to operate by)

Refactoring = changing internal structure **without changing external behavior**, in
small safe steps, to pay down technical debt and keep code clean. Refactor when you
add a feature, fix a bug, or do a review — not as a separate "big rewrite." Clean
code: obvious to other people, no duplication, minimal classes/elements, passes
tests. See `https://refactoring.guru/refactoring/what-is-refactoring`.

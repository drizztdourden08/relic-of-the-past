<!-- @layer docs @kind doc -->
# Design Consistency Audit & Remediation Plan

> Snapshot audit of how well the UI follows `docs/contributing/design-language.md`, with a
> phased plan to close the gaps. Code-level conformance (raw-html / tokens /
> structure) is already **0 warnings**; this is about *visual* consistency —
> which the code gate does not catch.
>
> Scope excludes `domains/hud/**` (intentional separate style).

## Verdict

The token **palette** is healthy (86 tokens, none dead). The inconsistency the eye
sees comes from **four systemic gaps**, in priority order:

1. **Two surface systems** — neutral near-black tokens vs. ad-hoc **blue-tinted**
   `rgb(20,20,30)` glass. *(This is the "black vs black-blue-ish" you noticed.)*
2. **Three "selected" colors** — gold (correct), blue (tracker), green (cheats).
3. **Reinvented controls** — 4 hand-rolled tab bars, multiple chip/button styles,
   ~40% primitive adoption.
4. **Loose scale usage** — spacing 38% tokenized, type 57%, radius 55%; plus
   ~14 **ghost tokens** that silently no-op.

None are gate failures; all are fixable by snapping to `design-language.md`.

---

## 1. Ghost tokens (referenced but undefined → silently broken)

These render nothing/inherit today. Fix = define an alias OR repoint to the real token.

| Ghost token | Refs | Repoint to |
|---|---|---|
| `--color-bg-hover` | 5 | `--color-surface-hover` |
| `--color-bg-input` | 4 | `--color-bg-raised` |
| `--color-bg-sunken` | 1 | `--color-bg-base` |
| `--color-bg-surface` | 1 | `--color-bg-raised` |
| `--color-bg-active` | (editors, now fixed) | `--color-surface-selected` |
| `--color-accent-default/-subtle/-text` | (editors, now fixed) | `--color-gold-base/-glow/-bright` |
| `--color-text-tertiary` | 1 | `--color-text-muted` |
| `--color-danger` / `--color-danger-default` | 2 | `--color-danger-base` |
| `--color-success` / `--color-error` | 2 | `--color-green-base` / `--color-danger-base` |
| `--color-border-focus` | 2 | `--color-gold-base` |
| `--radius-full` | 1 | `--radius-pill` (to add) |

*Legit runtime vars (NOT bugs, set via JS): `--widget-frame-opacity`,
`--tracker-frame-opacity`, `--slider-pct`.*

## 2. Scale discipline (raw vs tokenized)

| Axis | Tokenized | Worst raw values | Worst files |
|---|---|---|---|
| Spacing | **38%** | `2px`×95, `6px`×75, `3px`×31, `10px`×17 | TrackerView.filters, ControlsSettings, CheatsWidget, Widget |
| Font-size | 57% | `12px`×24, `9px`×12, `14px`×9 | CheatsWidget, ControlsSettings, TrackerView.* , CreditsTab |
| Radius | 55% | `3px`×35, `10px`×6, `2px`×7 | widget/save-slot/tracker chrome |

## 3. Surface / elevation drift

| Surface concept | Canonical (design-language) | Drift found |
|---|---|---|
| Floating glass panel | `--color-bg-overlay` (neutral) + `--blur-md` | Widget `rgb(20,20,30,.96)`, Settings popover `rgb(30,30,45,.98)`, FullScreen `rgb(14,14,20,.88)`, ShadowEditor `rgb(20,20,30,.95)` |
| Modal scrim | `--color-scrim` .6 / `--color-scrim-game` .35 | 0.35 / 0.6 / 0.75 / 0.85 / 0.88 |
| Blur | 4 or 8 | 2 / 4 / 8 / 16 |
| Shadow | `--shadow-sm/md/lg` | widget `0 4 20`, fullscreen `0 16 48`, settings `0 8 32`, save-slot glow |
| Panel width | `--panel-w-sm/md/lg` (200/280/380) | 180 / 260 / 340 / 380 / 420 |

## 4. "Selected/active" color divergence

| Active color | Used by | Verdict |
|---|---|---|
| **Gold** | SegmentedControl, TabBar, Toggle, RadioGroup, TagPicker, data-manager tabs, profile-hub tabs, controls-settings tab, conn-editor tags | ✅ canonical |
| **Blue** | tracker filter mode/btn/status/tag, shadow-element-list, height-level-picker | ❌ flip to gold |
| **Green** | cheats-widget tab, cheats-radio, input-cal button-cell | ⚠ green is for *primary action / success status*, not selection → flip tab+radio to gold; keep green only where it means "pressed/active input" |

## 5. Per-domain conformance scorecard

| Area | Surfaces | Controls | Scale | Overall |
|---|---|---|---|---|
| `design-system/` primitives & composites | ✅ | ✅ (the source of truth) | ✅ | **A** |
| `domains/app/compounds` (cards, save cards, dialogs) | ✅ | ✅ mostly | 🟡 some `3px`/`6px` | **A−** |
| `domains/app/views` › ProfileHub/DataManager | 🟡 hand-rolled tab decks | 🟡 tabs not `TabBar` | 🟡 | **B** |
| `domains/app/views` › ControlsSettings/InputCalibration | 🟡 ghost `--color-bg-hover` | 🟡 bespoke tabs/btns; green/gold mix | 🔴 many raw px | **B−** |
| `domains/app/views` › TrackerView | 🔴 blue glass + blue selection | 🔴 blue chips/filters (should be TagPicker+gold) | 🔴 worst offender (raw px) | **C** |
| `domains/app/views` › GameLayer/ShadowEditor | 🔴 blue glass, blur 8 ok, ghost tokens | 🟡 blue selection in pickers | 🟡 | **C+** |
| `domains/widgets` › Cheats | 🟡 | 🔴 green tabs/radios (should be gold) + bespoke | 🔴 raw px | **C+** |
| `domains/widgets` › Navigation (editors) | ✅ now on WizardDialogShell | 🟡 tags should be TagPicker | 🟡 | **B** |
| `domains/hud` | — exempt — | — | — | **N/A** |

---

## Remediation plan (phased, gate-green after each)

Each phase is independently shippable and play-testable. Ordered by impact/effort.

- **DS-D1 — Token foundation.** Add the missing tokens (§8 of design-language:
  `--radius-pill`, `--shadow-sm/-md`, `--blur-sm/-md`, `--color-scrim/-scrim-game`,
  `--dialog-w-*`, `--panel-w-*`, `--widget-w-min`). Add **aliases** for every ghost
  token so existing refs resolve correctly *immediately* (low-risk, instantly fixes
  silently-broken styling). *Small, no visual regressions, high payoff.*

- **DS-D2 — One surface system.** Repoint blue-tinted glass (Widget, Settings popover,
  FullScreen, ShadowEditor/list) to the neutral `--color-bg-overlay` glass + `--blur-md`.
  Collapse scrims to the two tokens; snap shadows to `--shadow-*`. *Kills the
  "black vs blue-black" split.*

- **DS-D3 — Selection = gold.** Flip tracker (blue) and cheats (green tab/radio)
  active states to the gold selection tokens. Reserve green for primary `Button` +
  success status only. *Makes "what's selected" read the same everywhere.*

- **DS-D4 — Adopt control primitives.** Replace the 4 hand-rolled tab decks with
  `TabBar`; tracker/conn chips with `TagPicker`; cheats radios with `RadioGroup`;
  sidebar icon buttons with `IconButton`. Delete the bespoke CSS. *Biggest structural
  win; raises primitive adoption from ~40% → ~90%.*

- **DS-D5 — Sizing tokens.** Move dialog/panel/widget widths onto `--dialog-w-*` /
  `--panel-w-*` / `--widget-w-min`. *Consistent footprints.*

- **DS-D6 — Scale snap.** Sweep raw px → tokens (spacing `2/3/6/10`, type `9/12/14`,
  radius `3/10`) per the snap rules. Consider a stylelint rule to keep it honest
  (warn on raw px for font-size/padding/margin/gap/border-radius). *Long-tail polish;
  do per-file, biggest offenders first: TrackerView.*, ControlsSettings, CheatsWidget.*

**Done already (this session):** `WizardDialogShell` extracted; both nav editor
dialogs migrated; their ghost tokens fixed.

> Recommended order to *look* fixed fastest: **D1 → D2 → D3** (foundation, one surface,
> one selection color) — that alone resolves most of what the eye catches. D4–D6 are
> structural/long-tail.

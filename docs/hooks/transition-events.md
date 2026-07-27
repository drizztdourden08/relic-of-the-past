<!-- @layer docs @kind doc -->
# Transition Events

`window.__onTransitionSettled` (see [Callbacks](callbacks.md)) tells the renderer when a
module or dungeon submodule transition has just finished, replacing what used to be a
polling loop in the navigation widget's auto mode.

**Source:** `core/game-hooks/transition_events.c` (C side), `apps/web/src/lib/game/events/`
(TS bridge).

## Why an event instead of polling a flag

Three earlier attempts tried to infer "has the transition finished" from game state
(`is_standing_in_doorway`, `door_animation_step_indicator`). Both are **latched**, not
per-frame: set when something begins, cleared much later by unrelated code, so they report
"still happening" indefinitely and either block or delay every trigger.

The game itself only knows one honest signal: `submodule_index` returning to 0 inside a
gameplay module. Every dungeon transition, whatever kind, ends by handing control back that
way, and the dungeon module's own dispatch (`Module07_Dungeon`) proves it treats 0 as
settled, since room tags and door processing only run then.

## Behind a setting

Gated on the **Developer Tools** master flag (`kFeatures0_DeveloperTools`), off by default,
under Profile → Developer. Off, `GameHook_ModuleFrameEnd` returns immediately, before doing
anything else, exactly like the haptics gate. No `EM_ASM`, no host-call, no cost beyond the
flag check.

## Classification

C reports raw numbers; `classify-transition.ts` turns `(module, fromSubmodule)` into a
`TransitionKind`:

| Kind | Dungeon submodule(s) |
|------|----------------------|
| `room` | 2 |
| `quadrant` | 1 |
| `doors` | 4, 5, 9 |
| `stairs` | 6, 8, 0x0E, 0x10 to 0x13 |
| `entered` | `fromSubmodule` is 0 and the module just became a gameplay module |
| `other` | any remaining submodule returning to 0 |

## Subscribing

```ts
import { subscribeTransitionSettled } from '@app/lib/game';

const unsubscribe = subscribeTransitionSettled((event) => {
  // event.kind, event.isIndoors, event.roomIndex, event.owScreenIndex
});
```

The bridge installs `window.__onTransitionSettled` once per game session (wired into
`lifecycle.ts` alongside the tracker and haptic bridges), and fans out to every subscriber.
Subscribing when the setting is off is harmless: the callback is simply never invoked.

## Known gap

A room tag that rewrites collision **without** passing through a submodule produces no
event. `RoomTag_OperateChestReveal` is the clearest case: it stamps attrs directly while the
game sits at submodule 0. If a revealed chest turns out to need a refresh, the fix is one
more explicit `GameHook_*` call at that site, not a return to polling.

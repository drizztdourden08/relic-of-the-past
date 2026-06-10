<!-- @layer docs @kind doc -->
# Keyboard Shortcuts

Beyond the gameplay controls (which you remap under [Input & Controllers](input-controllers.md)), the
app has a handful of global shortcuts handled by the renderer's `useKeyboardShortcuts` hook.

| Shortcut | Action |
|----------|--------|
| `Esc` | Open/close the menu |
| `F1`–`F8` | Quick-access [save-state](save-states.md) slots 0–7 |
| Widget toggles | Show/hide widgets (inventory, checks, cheats, logs, …) — see the title bar for current bindings |
| Game controls | Pause / stop / reset the running game |
| Profile switching | Jump between profiles |

Game input is **suppressed** automatically when a menu/overlay is open, when the Sprite Debug view is
active, or during input calibration — so a shortcut never leaks into the game and vice-versa.

> The exact key for each toggle is shown in the title bar and the relevant settings. Most actions are
> also reachable from the menu and the title bar, so you don't have to memorize them.

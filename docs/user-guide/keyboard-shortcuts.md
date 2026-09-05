<!-- @layer docs @kind doc -->
# Keyboard Shortcuts

Beyond the gameplay controls (which you remap under [Input & Controllers](input-controllers.md)), the
app has a handful of global shortcuts handled by the renderer's `useKeyboardShortcuts` hook.

| Shortcut | Action |
|----------|--------|
| `Esc` | Open/close the menu |
| `F1`-`F8` | Quick-access [save-state](save-states.md) slots 0-7 |
| Widget toggles | Show/hide widgets (inventory, checks, cheats, logs, and so on); see the title bar for current bindings |
| Game controls | Pause / stop / reset the running game |
| Profile switching | Jump between profiles |

Game input is held back automatically when a menu or overlay is open, when the Sprite Debug view is
active, or during input calibration. That keeps a shortcut from leaking into the game, and the other
way around.

> The current key for each toggle shows up in the title bar and the relevant settings. Most actions are
> also reachable from the menu and the title bar, so there's nothing to memorize.

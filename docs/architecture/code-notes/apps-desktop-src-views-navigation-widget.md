<!-- @layer docs @kind doc -->
# Code notes: apps/desktop/src/views/NavigationWidget

Facts about `apps/desktop/src/views/NavigationWidget/` that the code cannot say on its own. Each heading names a file or folder by its path from the repository root.

## apps/desktop/src/views/NavigationWidget/behavior/useConnectionStatus.ts

A detection is matched when a stored pair already links this screen and the resolved target, whichever side the stored point sits on: the question `pairLinksScreens` answers for the connection audit, so the badge and the audit cannot disagree. Which side of a pair can be taken is `canExit`, a separate fact.

## apps/desktop/src/views/NavigationWidget/behavior/useFloodOnTransition.ts

Re floods in auto mode when the player's surroundings change. It replaced a polling loop that guessed whether a transition had finished from latched game state flags and got it wrong three times running.
Indoor transitions (room, quadrant, door, stairs) are pure event subscription: the core fires `window.__onTransitionSettled` on the frame it considers the room settled, so nothing is polled. Walking across an overworld screen boundary is the one real exception: overworld travel is continuous scrolling with no discrete transition (`overworld_screen_index` in WRAM only changes on special cased area exits, never on a plain screen crossing), so there is no event. That case is derived from the player's live world position, which the per frame UI bridge already keeps current; reacting to it adds no timer.

## apps/desktop/src/views/NavigationWidget/behavior/useNavigation.ts

All of the navigation widget's state, data reads and flood orchestration. Flood output is read from the overlay store, never mirrored into component state: the widget unmounts whenever the hub opens, and a local copy used to leave with it, which is how the minimap once vanished while the overlay stayed.
Manual or auto mode is remembered by the profile. The overlay store stays the live value because auto mode has to survive the widget unmounting mid run; the pref is the copy that survives the app closing. The saved mode is restored once per app run and only after the profile's prefs land, since before that the pref reads as the `manual` fallback and would overwrite a real `auto`. The `--auto-flood` flag is applied once per app run, held at module level: a ref resets when the hub unmounts the widget and would force auto back on after the user chose manual.
The room's starting layer is captured when a room loads. A lightweight 200 ms tick re renders so live debug values follow the player. The overlay and the bundle drop when the active screen changes, and a bundle that no longer covers the player is dropped.
An indoor run bails early while the room's tile data is not there yet (a transition in progress); the transition settled event only fires once the core considers the room settled, so this guards the manual button, the CLI flag and the inventory trigger. Fall hole entrance ids are left out of the regular markers; overworld door ids mark physical doors. The outdoor bundle is set before the early return so it persists with no reachable screens. The annotations derive from the same reads the run gates on, so the overlay and the run never describe a screen differently.
The indoor half of the auto reflood listens for the native transition settled event, which the core only fires when the developer tools feature bit is set (`core/game-hooks/transition_events.c`). That bit is off for a normal player, so auto mode holds the developer tools override while it is on; the gate only unlocks read only instrumentation. A change in sword, gloves, boots, flippers, hookshot or hammer re floods, since it changes reachability. Switching to auto floods at once so the overlay matches the mode just picked.

## apps/desktop/src/views/NavigationWidget/behavior/usePlayerDebugState.ts

`inDoorway` is the doorway orientation the player occupies, 0 when not in one, and it is sticky, not per frame. `doorAnimStep` is the door open or close animation step, 0 when no door animates.

## apps/desktop/src/views/NavigationWidget/behavior/useRealTransitions.ts

A memo over the observation facade's real transition enumeration (`@app/lib/game/observations`), where the native table reads and their indoor and outdoor split live.

## apps/desktop/src/views/NavigationWidget/behavior/useScreenDetection.ts

A screen resolved by the palace scan fallback carries a wrong `dungeon.palaceIndex`. It still renders the right room, so the mismatch is logged once per room so the mislabel gets fixed.

## apps/desktop/src/views/NavigationWidget/sub-components/ActiveStates.tsx

The States chips: everything the game holds true at once, like a follower, story beats or keys in hand. It renders whatever the registry reports, so a new state needs no change here. A state that affects traversal reads brighter (`chipGating`), because it changes what is reachable.

## apps/desktop/src/views/NavigationWidget/sub-components/AnnotationLayer.tsx

The minimap half of `ScreenAnnotations`: a dot per annotated tile plus the check tally for the screen, so the small map shows the same mechanics as the overlay and not only reachability. The cell props place the annotated screen's 64 by 64 tile grid on the minimap. Screen wide kinds (room tags) have no tile and are skipped, since they live in the widget panel.

## apps/desktop/src/views/NavigationWidget/sub-components/ConnectionsPanel.tsx

The Connections panel, in order: entrances, edges, internal edges and fall hole landings.

## apps/desktop/src/views/NavigationWidget/sub-components/CrossingCard.tsx

One way on or off the screen. A crossing the player cannot take is marked, not hidden. The layer tag shows the floor the crossing sits on when the record names one.

## apps/desktop/src/views/NavigationWidget/sub-components/DescRow.tsx

A clickable info row label that expands an inline description. The open state is keyed by label so each row remembers itself, not the last one opened.

## apps/desktop/src/views/NavigationWidget/sub-components/EdgeArrowSvg.tsx

A small directional arrow glyph coloured by edge direction.

## apps/desktop/src/views/NavigationWidget/sub-components/EdgeCard.tsx

One boundary scroll off the flooded area. `playerLayer` is the floor the player stands on, which a toggling border flips. The span badge lists the tiles the scroll runs across, on the axis its side runs along; the tile badge counts the walkable tiles of the run, with the gated ones behind a plus.

## apps/desktop/src/views/NavigationWidget/sub-components/FunctionsPanel.tsx

`MODE_OPTIONS` sits at module level so the array identity is stable across renders. The flood and clear buttons only show in manual mode: flooding by hand is the point of manual mode, and in auto the widget owns the timing.

## apps/desktop/src/views/NavigationWidget/sub-components/GameStatePanel.tsx

The Game State info panel. The viewport size is the base room shape expanded by the quadrant fullsize flags.

## apps/desktop/src/views/NavigationWidget/sub-components/IndoorMinimap.tsx

The indoor and dungeon minimap: a single full size rectangle.

## apps/desktop/src/views/NavigationWidget/sub-components/InternalEdgeDiamond.tsx

A four slot diamond layout of internal edge connection cards around a room.

## apps/desktop/src/views/NavigationWidget/sub-components/InternalEdgesSection.tsx

Intra room boundary pairs plus inter screen internals. Intra room connections are grouped into boundary pairs (south with north, east with west): each contiguous run on one side matches the run on the opposite side that starts at the same position, and south and east are the side a card is drawn from. Overworld inter screen internals are kept as they are and shown unpaired.

## apps/desktop/src/views/NavigationWidget/sub-components/InternalEdgeSvg.tsx

A two square connector glyph showing an internal room edge transition. `SQ` is the square size and `LINE_OVERFLOW` is how far the separator line runs past the squares.

## apps/desktop/src/views/NavigationWidget/sub-components/NavigationWidgetSettings.tsx

The widget's own options: manual or auto flooding. The overlay store holds the live value and the widget pref is the copy that survives the app closing, so a change here writes both, the same way `setMode` in `useNavigation` does.

## apps/desktop/src/views/NavigationWidget/sub-components/OverworldMinimap.tsx

The overworld minimap: a grid with one cell per 512 by 512 screen. Every annotated screen draws in its own cell, because a multi screen area has mechanics on sub screens the player is not standing on.

## apps/desktop/src/views/NavigationWidget/sub-components/PathCopyBtn.tsx

Copies the currently locked pathfinding path to the clipboard.

## apps/desktop/src/views/NavigationWidget/sub-components/PlayerStatePanel.tsx

The Player State info panel.

## apps/desktop/src/views/NavigationWidget/sub-components/ReachabilityCanvas.tsx

A pixel canvas drawing a flood fill reachability grid, one pixel per tile.

## apps/desktop/src/views/NavigationWidget/sub-components/ReqIcon.tsx

Renders a requirement as an emoji icon (known requirements) or a labelled chip. `REQ_ICONS` lives in `ReqIcon.constants.ts`: it is a categorical palette of emoji and colours, and the lint exemptions for raw colours and glyphs name that file by path.

## apps/desktop/src/views/NavigationWidget/sub-components/ScreenMapWithConnections.tsx

Picks the indoor or overworld minimap from the current room context.

## apps/desktop/src/views/NavigationWidget/sub-components/ScreenPanel/

The On this screen panel: every annotation the simulator derived, grouped the way the overlay colours them, plus the decoded room tags. It is the list side of the same `ScreenAnnotations` the canvas draws, so a mechanic can never appear in one and be missing from the other. Ways on and off the screen belong to the Connections panel, which reads crossings. A multi screen area annotates every sub screen; the panel is one list, so the items merge and the tallies sum. Clicking a row toggles its kind on the overlay; the legend is display only.
`groupAnnotations` groups by the same families the overlay colours by, so the panel and the canvas tell the same story in the same order. `unknown` rides along in the Unmapped group and is never dropped: an unmapped mechanic must stay visible in the list too, not only on the canvas.

## apps/desktop/src/views/NavigationWidget/sub-components/TileRecorderBtn.tsx

A debug aid that records the attribute value of each tile the player walks over.

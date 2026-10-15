<!-- @layer docs @kind doc -->
# Code notes: apps/desktop/src/hud

Facts about `apps/desktop/src/hud/` that the code cannot say on its own. Each heading names a file or folder by its path from the repository root.

## apps/desktop/src/hud/

The HUD domain reproduces the in-game interface with the SNES palette, so it keeps its own primitive set and its own inline styles; the lint exemption for static inline styles and raw colours covers this whole folder.

## apps/desktop/src/hud/active-profile/

Which profile the HUD stores read and write. The answer is tried in this order:

1. The profile the settings screen says it is editing. It is the one place that knows for
   certain, and it clears the value when it lets go.
2. The running game's profile. The bridge only knows it while a game runs, and the layout
   editor works without one.
3. The profile a launch is pinned to (`--profile`, the named instance flag), matched by id
   and then by name the way `useStartup` matches it. It comes before the app state because a
   pinned launch does not write `app.json`, so the app state names some other profile.
   Reading that one would load one profile's layouts while the screen edits another's.
4. The app state's last selected profile.

## apps/desktop/src/hud/custom-glyph-store/

A custom glyph pack is an override, never a replacement. It holds only the positions the
player imported and names a built-in `fallbackPack`, so a pack with four face buttons still
draws shoulders, triggers and the d-pad through the chain in `resolve-glyph.ts`. Images are
stored like user sprites: raw bytes in the platform FileStore under the profile's folder,
with a JSON manifest beside them. A stored file has no URL of its own on either host, so the
bytes are read once into an object URL and cached; `customGlyphUrl` is the synchronous
lookup a render pass needs. Files are flat, one per pack and position, so the file name is
the key.

## apps/desktop/src/hud/hud-visibility.ts

Which game modes the main HUD overlay is present in: active gameplay and dialogue (where the native HUD shows too), plus `paused_menu` so the open and close slide can animate the HUD off screen. Everything else (intro and title, loading, full screen maps, flute and save menus, game over) hides the overlay.

## apps/desktop/src/hud/hud.css

This stylesheet is exempt from the token only stylelint rules (`exemptGlobs` in `stylelint.config.mjs`). It styles the in game interface that is laid over the running game picture: sizes and offsets in the game's own pixel scale, black plates and halos tuned to read on live terrain, and overlay widths that follow the console screen and not the app theme. No design token can stand for those values, because they follow the original picture. Every other stylesheet under `src` stays token only, and a rule that fits a token belongs in a token or component sheet and not here.

The pause cursor flashes 16 frames on and 16 off at 60 fps, a 533 ms cycle. The bottle panel expands from the bottom upward and collapses from the top downward, like `Hud_ExpandBottleMenu` and `Hud_EraseBottleMenu`.
The enhanced pause menu has no ground of its own: painting over the paused game hides what the player paused to look at, so the world stays visible between the panels and every readable part brings its own ground. Each rule is there because removing the backdrop broke something specific. `--hud-silhouette` is a surface's answer to what colour an unowned thing is. `HudSprite` defaults to the dark shape the gameplay cluster needs over bright terrain, and the pale one suits the menu's black panels, where a black silhouette is an empty cell. It used to be set on `.enhanced-pause` for the whole subtree, which was right only while a near black backdrop lay under all of it; with the backdrop gone the button chips are back over live terrain, so the pale tone is scoped to the panels, the only surface that is dark.
Text drawn outside a panel (the tab strip, the selected item's name, the assignment hint) now sits on terrain. The glyphs are light, so they take a dark halo: a filter and not a plate, because the game's font sprites are irregular and a rectangle behind them reads as a box. Inside a panel there is already a black ground, so the halo is off there, border tiles included. The halo is two rings: a single soft shadow is a smudge that loses to bright terrain, while the tight one repeated compounds into a near solid black edge (the read the HUD's sprite outline gives) and the wide one separates the word from what it crosses. The tight rings are stacked and not darkened because `PauseText`'s dim opacity fades the halo with the glyph. The tab strip also takes a faint plate, the one run of text with nothing near it and the one the eye finds first.
The item's name and the hint under it are the two strings a screen writes outside its panel, in the portrait column, so they take a plate on the column and not on the line: `PauseText` fades a dim line to 45% and would fade its own plate with it, giving the hint the weakest ground. The column box carries no opacity, so the plate stays at full strength under a deliberately quiet line. `:has(> div > img[src*="font-"])` is that column, the box whose children are runs of the game's font sprites, the same shape on the items and gear screens. It is scoped inside the screen area, so the legend and tab strip (which have plates) do not get a second one, and outside a panel, where the ground is black anyway.

## apps/desktop/src/hud/layout-document-io/

Player layouts use the same document format and the same loader (`loadLayout`) as the
built-ins in `packages/hud/data/layouts/`. They differ only by the `builtIn` flag. A
stored document that does not validate is refused, never repaired: it is dropped from the
list and its reasons are kept in `problems`, so a screen can say which layout is broken.
Layouts are validated on the way out too, because the editor's draft is not a document until
it passes. The store file is `hud-documents.json`, not the old flat format's
`hud-layouts.json`; nothing shipped in that format, so there is nothing to migrate. Saving
upserts by id. A fork gets a new id and records `basedOn`, which the editor's start from
list reads. An unknown id resolves to the shipped default, since a stale id in a settings
file is far likelier than a request for no interface.

## apps/desktop/src/hud/slot-content.ts

Three facts meet here and nowhere else: where a control sits (the device's slot list), what
it fires (the per save assignment table), and whether the save holds that thing (the live
inventory). It is one pure function because the live HUD, the pause menu and the layout
editor (which runs with no game) all need the same answer; an earlier editor copy drifted.

- Glyphs are binding first: a slot rebound to a key draws that key's cap. The synthetic
  `DPAD` position stands for a whole control and resolves through the renderer's own table
  in `HudNodeRenderer.constants.ts`.
- Item art comes from `buildItemCells`, as in the pause grid, which covers all 24 HUD item
  ids including the two cells that share a save slot and the four bottles.
- The action button is contextual (talk, lift, open, dash), so it wears no sprite. Only the
  sword names a fixed piece of gear, drawn at the tier the save holds and always as owned.
- `items` are the 20 inventory bytes and `bottles` the 4 bottle bytes, as the core reports
  them. `packId` is the document's pack or `auto` to follow the device family.
- `filledSlots` feeds the engine's `dimWhenEmpty`, which dims a whole group at once.
- `signature` changes only when an assignment moves (swapping two items counts) or a
  different pad is plugged in, the two events the on change reveal exists for.

<!-- @layer docs @kind doc -->
# Code notes: apps/desktop/src/nav-widget

Facts about `apps/desktop/src/nav-widget/` that the code cannot say on its own. Each heading names a file or folder by its path from the repository root.

## apps/desktop/src/nav-widget/build-connection-record/build-connection-record.ts

Editor state to a `ConnectionRecord` minus its id. `kind` and `dungeonId` are derived the way the dataset's own split derived them, so an edge written here matches the files, and `transit:*` tags that became a kind are retired from the tags. Both endpoints must resolve to real screens or nothing is written.
A connection point always needs a real `toConnectionId` partner (`packages/game-data/src/data/connections/derive`). When the destination already has a point aimed back, it links to it; otherwise it links to `pendingPartnerId(to.id)`, because minting a real id needs the allocator round trip only the write path (`apps/desktop/src/data-inspector/record-creators`, over IPC) can do. `createConnection` checks every accepted proposal for that sentinel and mints both halves as a pair (`write-connection-pair.ts` on the main side). A proposal always describes a point the player was just seen leaving, so it can exit; overall direction is whatever the partner's `canExit` says. The draft carries tag terms, the record carries references to them.

## apps/desktop/src/nav-widget/build-connection-record/connection-kind-for.ts

The kind follows a priority order: a fall through is a hole wherever it leads; a warp or portal is a teleport; an overworld to non overworld crossing is an entrance (the `ctx:entrance`, `ctx:exit` and `ctx:dungeon-enter` tags say the same); otherwise the physical mechanism names it (stairs, door); everything left is a scroll across a boundary. Approach tags (grave, bomb, bonk, rock, push, hookshot, ledge, waterfall) never name a kind.

## apps/desktop/src/nav-widget/connection-issues/connection-issues.ts

Per connection warnings, so a reviewer sees what a connection is missing instead of an editor that renders nothing. `tileDesc` is the already resolved crossing description (persisted nav, else the live flood). The messages are named constants because the shape detector matches on them and turns the fixable ones into record edits. Direction is not a tag to check: it is `canExit`, a required field the types already guarantee.

## apps/desktop/src/nav-widget/connection-tile-display/describe-connection-tiles.ts

Where a connection crosses: the persisted `nav` first (overlap tiles or entry point), then the live flood's matching crossing, else nothing. The flood always runs from the current screen, so only edges leaving it can be backed by a live crossing. A flood crossing backs a connection when its target index resolves to the connection's `to` id; the index is an overworld screen outdoors and a room indoors, so both resolutions are tried.

## apps/desktop/src/nav-widget/detect-connections/detect-connections.ts

Every detection carries the screen id it resolves to, so no consumer recovers identity from the label; the old "Exit" label prefix is now the `isExit` flag. The label is display text only. Entrances lead into this room from an overworld screen, stairs lead to their destination room, the exit screen is where this room exits back onto, and each fall hole on an overworld screen drops into a room.

## apps/desktop/src/nav-widget/nav-flood/annotate-flooded.ts

Every screen the flood covered is annotated, and not only the player's: on a multi screen area that would hide three quarters of the mechanics. Indoors the flood covers one room, so the detected screen's own id is the only correct id. Outdoors a sub screen's id comes from the screen data through its game id, never formatted from the index by hand.

## apps/desktop/src/nav-widget/nav-flood/collect-screen-crossings.ts

One crossing record per flooded screen, off the same flood and border bundles the overlay draws, so the panel, the minimap and the overlay agree on a screen's ways out. A response's `screenIndex` is the room index indoors and the overworld screen index outdoors.

## apps/desktop/src/nav-widget/nav-flood/finalize/annotate-layer-toggles.ts

Stamps the border bundles the overlay and the internal edge lists read. The crossing facade answers the same question for its own edge records off the same predicate, so both views of a boundary agree.

## apps/desktop/src/nav-widget/nav-flood/finalize/build-indoor-screen-bundle.ts

A multi screen room expands into virtual quadrant cells; its shape gives the grid. Whether a room is multi screen comes from the layout info directly, not from flood transitions, since the flood now covers the whole grid without quadrant bounds. The effective layout from the dungeon map data wins when there is one.

## apps/desktop/src/nav-widget/nav-flood/indoor-entrances.ts

Merges the canonical indoor entrance list (`roomEntrances`, shared with the simulator) into the widget's seed array and reports the respawn points: real entrances that are neither a fall hole landing nor an overworld door. The overworld pass may already hold an id with outdoor grid coordinates, so it is replaced. Overworld screen ids overlap indoor room ids (OW 0x51 and room 0x51), so an unrelated overworld entrance can leak in and is dropped; fall holes (id 200 and up) and synthetic stair and boundary ids are exempt.

## apps/desktop/src/nav-widget/nav-flood/live-overworld-screen.ts

The overworld screen under the player: each screen is 512 world pixels, so bits 9 to 11 of the X and Y position give the column and the row of the 8 by 8 grid.

## apps/desktop/src/nav-widget/nav-flood/prepare/build-inventory.ts

`lift.1` is bushes and pots (no glove), `lift.2` the Power Glove (light rocks), `lift.3` the Titan's Mitt (dark rocks). Inventory slot 2 is the hookshot, 3 the bombs, 11 the hammer.

## apps/desktop/src/nav-widget/nav-flood/prepare/compute-start-context.ts

The overworld blockers used to be built here from the live sprite list, which only describes the screen the game occupies. They now come from the addressable spawn table inside the shared flood (`packages/navigation/src/flood/blockers`), so the widget and the simulator agree about every screen.

## apps/desktop/src/nav-widget/nav-flood/propagate.ts

An adapter: the flood lives in `apps/desktop/src/game/flood/flood-area` and the simulator runs the same code. The widget used to assemble the options by hand and read solid sprite blockers from the live sprite list, which made its numbers diverge from the simulator's on every screen the game was not on. `dynamicBlockers` is kept for the widget's blocker tally.

## apps/desktop/src/nav-widget/nav-flood/useNavConnections.ts

Splits connections into internal and external. Indoors that is the `isIntraRoom` flag (quadrant boundaries); outdoors it is bundle membership (the screens of a 2 by 2 big screen group). Internal borders are deduplicated: A to B east and B to A west are the same border, and east or south is kept for spatial correctness. Intra room edges are all kept, since south and north are two sides of the same boundary. The crossings get the same split, so the panel lists the borders the minimap draws arrows for.

## apps/desktop/src/nav-widget/recommendations/strategies/connection/connection-crossing-probe.ts

Every non edge crossing leaving the current screen, as one `SetProbe`: the missing, unresolvable and unbacked split falls out of `compareSet`'s own join. The live set is `realTransitions`, not the pre filtered unmatched crossings, so the join decides what is missing. Only enumerable sources count (exit, stair, travel, hole, entrance, doorway): a flood source proves presence only and can never back a removal, and `walk` belongs to the indoor edge probe. Live entries are deduplicated by resolved key, since two sources can name the same destination (a stair and a travel byte landing in one room) and `compareSet` does not dedupe its input.
Removal needs the backing table to have been read: indoors no source enumerates fall holes, so a missing hole or drop proves nothing. Such a record is still matched by the far side pair check, which keeps the live crossing from being proposed twice.

## apps/desktop/src/nav-widget/recommendations/strategies/connection/connection-strategy.ts

The `connection` comparison strategy. The tile data (`nav`) fix is a field probe. Direction is derived from `canExit` (`packages/game-data/src/data/connections/derive`), so no `dir:` tag backfill remains. The crossing probe covers entrance, stair, hole and travel crossings and the indoor edge probe covers indoor scroll edges; each says below why they are two probes. Unresolvable differences route through `wire-detector.ts`, not through this strategy's own `detectorFromStrategy` call. Importing the folder's `index.ts` installs the strategy.

## apps/desktop/src/nav-widget/recommendations/strategies/connection/indoor-edge-probe.ts

An outdoor scroll edge is flood only: the flood proves presence, never absence, so it is never proposed for removal. Indoors the room's walk boundary table enumerates every wall the room scrolls through, so an indoor edge is provable both ways once that table is read. The probe is gated on `walkBoundaries` and `doorBoundaries` both being present, not merely `realAvailable`; `doorBoundaries` carries no destination and only proves the room's exits were queried. A batch accept is gated on `certain`, so a wrong gate here would make it unsafe. The `realTransitions` entries with `source: 'walk'` come from the same native call but say nothing about the door table, which is why this probe reads `walkBoundaries` directly; the crossing probe leaves `walk` sources to this one.

## apps/desktop/src/nav-widget/recommendations/strategies/connection/nav-probe.ts

The tile data fix: where the crossing physically sits, from the live flood crossing. Flood evidence proves presence only, so it grades `likely`. A record that already has `nav` is complete, and an endpoint that does not resolve to a real screen gets no fix; inventing one is what the connection path refuses to do.

## apps/desktop/src/nav-widget/recommendations/strategies/connection/points/infer-tags.ts

A doorway object through an outer wall joins two rooms of the same interior. An exit (the overworld screen this room exits to) and an entrance (an overworld door leading into a room) are both door crossings.

## apps/desktop/src/nav-widget/recommendations/strategies/connection/screen-endpoint/auditable-from-here.ts

A record backs a crossing leaving the screen only when it sits on that screen and can be exited. A record sits on exactly one screen; the arriving side is its own record on the other screen.

## apps/desktop/src/nav-widget/recommendations/strategies/connection/screen-endpoint/stored-on-far-side.ts

A stored pair already links this screen to the destination, but no exitable point on this screen carries it: the pair covers the crossing from the far side, so proposing it again would duplicate the dataset. The accepted cost is that a near side `canExit: false` error stays invisible.

## apps/desktop/src/nav-widget/recommendations/strategies/connection/screen-endpoint/transition-key.ts

The resolved destination screen id, or a sentinel unique to the raw kind and index when it resolves to no screen. A dataset key is always a real screen id, so an unresolvable item can never read as already covered. A pair with no far side yet keys on the record's own id for the same reason.

## apps/desktop/src/nav-widget/recommendations/strategies/connection/tiles-probe.ts

Fills `placement.tiles`. The migration codemod left about 700 points with an empty tile list because a static rewrite cannot read room geometry. Indoors `wasmGetRoomWalkBoundaries` enumerates every walk boundary tile with the room it leads to, so the tiles sharing this point's destination room are its footprint; the table covers the whole wall, so an empty result is proof and this grades `certain`. It is gated on both boundary tables like the indoor edge probe, and only applies to a point on the currently loaded room. The screen is looked up with `get`, not `getScreen`, because a record being edited can name a screen nothing holds yet.

## apps/desktop/src/nav-widget/recommendations/strategies/connection/unresolvable-screen.ts

A crossing whose destination resolves to no screen used to vanish silently. It is the most informative finding the connection probes can make (the game goes somewhere the dataset never catalogued), so the `onUnresolvable` hook turns it into a `screen` create proposal built with `packages/navigation/src/recommendations/strategies/screen/screen-draft.ts`, matching a screen minted by the presence probe. An overworld destination names one real screen and grades `certain`. A room number alone can be a castle room or an unrelated cave and a crossing carries no palace index, so that proposal stays palace less (`interior`) and grades `likely`. Room 0 is every table's empty slot, not a destination. The difference's `item` is `unknown` because the engine erases a set probe's item type; the cast holds because this mapper is registered only for the connection strategy, whose set probes both use `ObservedTransition`.

## apps/desktop/src/nav-widget/recommendations/strategies/connection/wire-detector.ts

Registers the connection detector with its `onUnresolvable` mapper, apart from the generic pass in `strategy-detectors.ts`, which calls `detectorFromStrategy(strategy)` with no second argument and would drop every unresolved crossing if this registration lost the race. `detectorFromStrategy` always mints the id `strategy:${kind}` and `registerDetector` keys on id, so the last write wins: this import must run after `packages/navigation/src/recommendations/strategy-detectors.ts` (see the import order in `useDetectionPass`), while `index.ts` must run before it so the strategy is registered when the generic pass reads `allStrategies()`.

## apps/desktop/src/nav-widget/screen-editor/build-screen-record.ts

Form state to a `ScreenRecord` minus its id. The return type is the record shape itself, so a field a migration adds is either filled here or fails to compile. Fields the form does not edit (`nav`, `triggerIds`, `spawns`, `review`) are carried across from the record being edited. Anything missing comes back as a blocker, never a fabricated value. Only the two rules a form alone can break are judged here (a name, and a grid position under a floor); whether the screen is real belongs to `screenBlockers`, so the editor cannot accept a screen a query then fails to resolve. The form picks tag terms and the record stores references to them.

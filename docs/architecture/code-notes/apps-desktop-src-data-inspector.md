<!-- @layer docs @kind doc -->
# Code notes: apps/desktop/src/data-inspector

Facts about `apps/desktop/src/data-inspector/` that the code cannot say on its own. Each heading names a file or folder by its path from the repository root.

## apps/desktop/src/data-inspector/collection-sources/

The eleven dataset collections as `CollectionSource`s. Adding a collection is this folder and nothing else.
Rows are read once per collection, on first use, and kept. Writes go to the source files on disk, not the in memory registry, so a stable array is correct and keeps the derived schema memo stable.
The serializers are the same emitters the write path uses, so the source tab shows exactly what a save would produce.
`COLLECTION_SOURCES` is built lazily on first read, not at module scope. The record writers, the id reference options and the collection sources form an import cycle. Building at module scope ran while `RECORD_WRITERS` was still undefined, and every collection silently lost its write path. See `apps/desktop/tests/data-inspector/module-init-order.keep.test.ts`.
`refreshCollectionSource` drops a cached source so the next read sees a newly minted record. `rows` is a snapshot, so anything that grows a collection must call it.

## apps/desktop/src/data-inspector/id-ref-display/

The reading half of the id reference handoff. A table column can show a field of the record it points at instead of the id. Which fields exist and what a record holds are dataset facts, so they are answered here and injected.
Field lists and the by id index are cached per collection. The rows never change, and without the index every cell in a 900 row table would scan the target collection on every render.
Every leaf of the schema is collected, nested ones included, and the paths are already dotted.
A display value that does not resolve to readable text is undefined, and the cell then falls back to the id.

## apps/desktop/src/data-inspector/number-bounds/

Number limits for the editor. Bounds depend on the record, not just the path: the same grid coordinate is bounded differently on an overworld screen and in a room.
Indices are folded out of the path, so one rule covers every list element: `spawns.3.tile.x` becomes `spawns[].tile.x`, which is how the schema names an element.
An undefined bound leaves the field open at both ends.
Resolvers are bound to one collection and kept, so the editor's binding memo stays stable.

## apps/desktop/src/data-inspector/recommendations/accept-all-certain/accept-all-certain.ts

The batch runs strictly in sequence on purpose. Two findings often land in the same dataset source file, and each write is a read, modify and write of that file. Fired at once, the file would come out holding only one edit.
The same sequencing keeps connection pairs (two records per create, see `create-connection.ts`) from interleaving their ids or writes.
`certain` is the gate: `likely` only ever proved presence (see `Confidence`) and should not be written without somebody looking at it.
A failure does not stop the run, since stopping would make the outcome depend on list order.
`skipped` holds every entry the run passed over because its proposal is incomplete, not wrong. Nothing was attempted, so these are not failures. Filling one in is a per entry job for a person.
`failures` holds every entry whose write was refused, with the reason it gave.

## apps/desktop/src/data-inspector/recommendations/accept-recommendation/accept-recommendation.ts

Accepting a finding is the one place a recommendation turns into a real dataset write.
Nothing new writes here. The three actions map onto the three CRUD verbs the screen already has for every collection (`RECORD_CREATORS`, `RECORD_WRITERS` and `recordDeleterFor`), so a finding is applied by the same code path as the same edit made by hand, through the same channel, into the same file. A second write path would be a second thing to keep in step with the emitters.
A create is checked against `validate-create.ts` first, because a detector can only propose what the live game exposes, and some collections need more than that to have a home on disk.
The outcome is a union, not a boolean plus optional fields. A refusal a person can resolve (`needs-form`) and one nothing can (`failed`) lead to different handling in both callers, and the union makes forgetting one a compile error.
`needs-form` means nothing was attempted because the proposal is incomplete or already covered, so a person decides what happens next and a batch run counts it as skipped. `failed` means the write itself was refused.
A creator can decline for a reason a person has to settle, such as a record that already covers this identity. That is not a failed write.
The proposal carries whatever id the detector put on it, which for an update is the record's own. `targetId` is the identity the store reconciles on, so the write is keyed by it, not by the payload.
`proposed` is passed in, not read off the entry, so what gets written is the pane's edited draft: the reviewer's amendment to what the detector suggested.
The order of the tail matters. The verdict is recorded only after the dataset write has landed, so a failed write leaves the finding open, which is the honest state for something nobody managed to apply.
A dismissal is a verdict with no dataset write behind it.

## apps/desktop/src/data-inspector/recommendations/comparison-lines.ts

Which lines a comparison pane marks as changed. Paths are computed once for the pair, then resolved to line numbers per side and per tab: JSON and the emitted TypeScript lay a record out differently, and the two sides differ when one declares a field the other does not.
The source text comes from the same functions the tab uses, so the numbers match what is on screen.
The editor tab and an absent record (a create has no left hand record) get no lines.

## apps/desktop/src/data-inspector/recommendations/proposal-draft/

The reviewer's amendment to a proposal, as plain state. A draft carries the id it belongs to, so selecting another finding drops it with no effect needed, and Revert is a single assignment.
Nothing here writes to the store. The recorded proposal stays as it is until an accept succeeds, so running detection again reconciles onto the same entry.
`proposalOf` gives the amendment when there is one for this finding, and the detector's draft otherwise. `revertedDraft` discards the amendment.

## apps/desktop/src/data-inspector/recommendations/recommendation-cache/

The renderer's read model of the recommendation store. The collection itself lives in the main process (`apps/desktop/electron/recommendations/`) behind a per kind queue.
This module never merges an edit of its own. It stores what the main process returned, so two quick accepts cannot disagree about the file.
It is plain module functions, so callers outside React can read synchronously.
The flattened list is rebuilt only on change. `useSyncExternalStore` compares it, and a fresh array per read would re-render forever.
`refreshRecommendations` reads one collection from disk again, whatever the cache held. `ensureRecommendationsLoaded` starts the background load once per kind.
`decideRecommendation` records a verdict and adopts what the main process wrote back. `accepted` is stamped only after the dataset write has landed.
`applyRecommendationPass` folds one detection pass into the main process store and adopts what it returns, so every viewer reads the same result.
`clearRecommendationCache` drops every cached collection, for a test or a profile switch.

## apps/desktop/src/data-inspector/recommendations/recommendation-rows/recommendation-rows.ts

Every open finding, from every collection, as one flat table. Columns are kind agnostic on purpose: anything only some rows can answer belongs in the comparison panes.
Every value is text, because a mixed type column would infer as `unknown` and lose its filters. The timestamp is `YYYY-MM-DD HH:MM` in UTC so text order matches time order.
`targetId` and `screenId` stay null for a create, never a dash placeholder. The schema deriver samples present values only, and a literal dash fails the id pattern, which degraded the whole column to plain text (no id reference styling, no name substitution, no click to navigate). The field kit renders the dash for absent values after inference.
The row id is the recommendation's own content derived id.
`certain` sorts before `likely`, so the batch accept gate leads the list. Within a confidence, the oldest comes first: the order a review pass works through, and the table's default.
Only open findings are listed, since a decided finding has left the pass.

## apps/desktop/src/data-inspector/recommendations/recommendation-source/recommendation-source.ts

The recommendations pseudo collection as a `CollectionSource`, so the generic table renders it with nothing added.
It has no `serialize` and no `onSave` on purpose: a finding is not a record, and the write it leads to happens to the record it proposes, through that collection's writer.
The table opens grouped by which collection each finding is about.
The source is built per entry list, not cached, because the rows change whenever a pass or a verdict lands.

## apps/desktop/src/data-inspector/recommendations/use-comparison-scroll/

Keeps the two comparison panes scrolled together. The side the user scrolled leads and gets no `scrollTo`. Only the other side is driven.
The follower's programmatic scroll fires a native event, which the `ScrollArea` guard swallows so it cannot bounce the leader (Tessera's `ScrollArea` sync, tested in Tessera).
`followerScrollTo` gives the leader's offset to the follower and nothing to the leader. It is pure, so it is testable without a DOM.

## apps/desktop/src/data-inspector/recommendations/use-recommendations/

The React binding over the recommendation cache: it subscribes to every collection's findings at once.
The cache is client only, so the same getter serves the server snapshot, which is what the third argument is for.
`openInPassOrder` lists open findings in pass order. The table and next open finding share it, so they never disagree.

## apps/desktop/src/data-inspector/recommendations/useRecommendationReview.ts

The comparison view's state: which finding is open, its edited proposal, and the three verdicts.
The edited proposal lives only here until an accept succeeds, so Revert drops a local value and the store never sees a half reviewed proposal.
Every decision moves on to the next open finding instead of closing the panel. `neighbourOf` picks the one after it in pass order, or the one before when it was last.
A batch reports its two leftovers separately: what refused to be written, and what nobody attempted because the proposal is still incomplete.
Both refusals hold position. The entry stays selected, so the editor pane beside the message is where an incomplete proposal is finished.
After a batch the view lands on the first thing the batch did not write, the only part of the run still needing a person.

## apps/desktop/src/data-inspector/recommendations/validate-create.ts

Whether a create proposal can land, checked before the write.
A draft record is minted from live registers alone, so it can be missing things only a person knows.
What counts as missing for a screen (a native index, real geography that agrees with itself, a home on disk) is `screen-validity`'s question, so a proposal accepted here and a screen typed in by hand are held to one standard.
An empty list means the proposal is writable as it stands.

## apps/desktop/src/data-inspector/record-creators/

Where a new record is minted, the create flow counterpart to the record writers.
Screen has no allocate channel: a new one goes through `writeScreen` with no id, which tells the main process to allocate instead of replace.
Connection lives in `create-connection.ts`, because a connection is never created alone. Every creator ends with `settleCreatedRecord`.
A screen create first checks whether a record already catalogues this identity. Two detectors can notice the same uncatalogued room on their own, and without the check a second accept mints a duplicate that then has to be removed by hand.
A facade creator differs from the others only in its channel.

## apps/desktop/src/data-inspector/record-links/

An item group has no lookup by id in the facade beyond `itemGroupById`, and its `label` is its name.
No single id lookup exists for enumeration entries (only by category), so the small seeded set is scanned.
The getters are exhaustive: every `EntityKind` resolves to a lookup that can answer nothing.
They use `get`, never a `getFoo` getter. The inspector labels whatever id a column holds, including one a row names before its record exists, and a getter throws on that.
`PREFIX_TO_KIND` is the reverse of `KIND_ID_PREFIXES`. A kind's prefix is not always its name: `item-group` mints `ig-NNN` and `enumeration` mints `enum-NNN`.
An id's own kind is read off its prefix, everything before the last hyphen.
`defaultIdRefDisplay` is the baseline name for an id with no column level display choice. A valid kind hint wins. Otherwise the kind is read off the id's prefix, so a mixed column such as the Recommendations table's `targetId` still resolves per row. Undefined means it cannot answer, and the caller shows the id.
`resolveRecordLabel` gives the display name for link text and falls back to the id.

## apps/desktop/src/data-inspector/record-writers/

Where an edited record is written back. A collection absent from the map is read only by construction: `RecordEditor` renders no save button when `onSave` is omitted.
The record facade collections share one factory: send the whole record under its id, let the main process find its file, then fold the result into the live session and refresh the id reference picker label.
The editor shows a rejected write as its own error, so a failure throws. Every writer ends in `settleWrite`, which makes it the one place a landed edit is announced to whatever reads the dataset revision.
A screen write is guarded the same way a tag write is: a variant states its progress tier twice, and only one of the two is what the runtime reads, so an edit that moves one and leaves the other is refused.
A tag write folds the edit into the live registry and the id reference options cache. Tag chips read labels through that cache, so the registry alone is not enough.
An item group write makes the same bargain, for the other reference guarded kind.
An enumeration write is the same round trip without the reference guard, since nothing references an enumeration entry's id.
A facade write passes no destination. The main process locates the record by id.

## apps/desktop/src/data-inspector/reference-usage/

The usage overview half of the delete guard. It calls `referencesTo` and turns each hit's id into a display label, so the design system only sees the plain strings and labels `ReferencedBy` renders.
Whether a collection is guarded is taken from the index itself, so a collection is guarded the moment it has a reverse lookup.
A collection with no reverse reference index gets no hits.

## apps/desktop/src/data-inspector/schema-config/

Per collection diffs over the derived schema. Area, location, item group and enumeration are absent on purpose: their derived layout is already right, and a config would only restate it.
Actor: `gameId` and `clearedBy` are nested shapes that say nothing in a cell, and `effect` is what tells two rows apart. Its sprite type is a native sprite type byte, not a room id.
Check: twelve derived fields, several deep unions or free prose. The default columns are what a reader scans by. `roomId` is a room id (hex4) and `chestIndex` is not.
Connection: the largest collection, about 1600 points. `placement` and `requirements` are deep unions that swamp a row, so the groups keep them below the identifying fields. None of its game ids is a room id, so they use hex2.
Dungeon: `roomScreenIds` runs to dozens of entries per row, so it is left out of the default columns but stays in the column picker. `bossRoomId` is a room id (hex4) and `palaceIndex` is not.
Item: the column set drops two nested shapes that say nothing in a cell. Its receive item index is a native byte.
Screen: the largest shape in the dataset, 14 derived fields with four nested. The default columns are the identity and placement subset, and the groups give the editor a running order instead of key insertion order.
A screen variant's tier is one of four values of a game byte. Derivation only sees the one the dataset uses today, so the set is declared from the enumeration that names them, and the picker offers those four and nothing else. The range form of the field has no control here, since an array is not one of a closed set, so a variant that spans tiers is still edited through the source tab.
The hex formats match the Game State panel's hex rendering (`GameStatePanel.tsx`).
Tag: it leads with the hierarchy, namespace then term, because that is how the vocabulary is browsed. The groups separate the levels from their labels.

## apps/desktop/src/data-inspector/tag-suggestions/

Tag suggestions for the editor. They union two sources: the tag collection, which is the canonical vocabulary including terms not yet in use, and the values already in use at this path, since a hand added tag must be findable or it gets retyped differently.
Suggestions are terms such as `env:outdoor`, not ids. The editor translates through the reference lookup.
`appliesTo` filters the vocabulary per collection. Values in use lead, and each half is sorted.
Stored ids resolve to terms, and dangling ids are skipped.
The lists are cached per collection and path. The rows never change, and the search box would otherwise rebuild per keystroke.
An unanswerable field gets an empty list, and the entry stays usable without help.
Resolvers are cached per collection so the editor's binding memo is not invalidated every render.
`invalidateTagSuggestions` drops the built lists, so a newly minted term shows up without a reload.

## apps/desktop/src/data-inspector/useDeleteGuard/useDeleteGuard.ts

Ties the usage overview panel and the delete confirmation together for one open record.
A referenced record's delete stops at a dialog naming what points at it. An unreferenced one deletes at once, with no dialog.
`onDelete` is undefined when the collection has no delete write path, so the button is omitted.

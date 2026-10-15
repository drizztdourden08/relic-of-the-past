<!-- @layer docs @kind doc -->
# Code notes: apps/desktop/src/views/DataInspector

Facts about `apps/desktop/src/views/DataInspector/` that the code cannot say on its own. Each heading names a file or folder by its path from the repository root.

## apps/desktop/src/views/DataInspector/behavior/blank-record.ts

The blank record for the create dialog: required fields seeded, optional ones absent.
It wraps the top level fields as one object so `blankValue` (the record editor's array element helpers) builds the whole record.

## apps/desktop/src/views/DataInspector/behavior/create-connection.ts

A connection is never created alone: every `ConnectionRecord` needs a real `toConnectionId` partner (`packages/game-data/src/data/types/connection`). Two shapes reach here, told apart by `pendingPartnerScreenId`.
When the far screen already holds a point aimed back here, it is a normal single record insert through `writeConnections`.
When it does not, `toConnectionId` carries the `pendingPartnerId` sentinel (`packages/game-data/src/data/connections/pending-partner`). Both halves are minted through `writeConnectionPair`, which allocates two ids on one allocator turn. `write-connection-pair.ts` owns that atomicity, and it overwrites the far half's placeholder partner id with the allocated near id.
The partner's placement is left empty. The live tiles probe fills it in once the player visits that screen.
The near point's own nav data is the only signal that overrides the mirror the kind default.
A hole's partner is a receive only drop. Every other kind mirrors, two way unless known one way. This is the same rule as the connection points migration codemod.

## apps/desktop/src/views/DataInspector/behavior/create-schema.ts

The schema a create dialog offers, per collection. The id is allocated, never entered, and a tag's `name` is computed from namespace and value.
Those fields are dropped, not hidden, so `blankRecordFor` never seeds them and a blank `id` cannot collide with the allocated one.

## apps/desktop/src/views/DataInspector/behavior/create-tag-for.ts

Mints a vocabulary term from the editor. The main process validates, allocates the id and appends the record. The result is folded into the in memory collection so the chip resolves at once.
The key convention is also checked locally to save an IPC round trip, but the writer's check is the one that counts. Failures return their reason, never a bare null.
`tagCreatorFor` caches a creator per collection so the editor's binding memo is not invalidated every render.

## apps/desktop/src/views/DataInspector/behavior/data-inspector-nav.constants.ts

The inspector's side nav: the eleven collections, then the review pass on its own.

## apps/desktop/src/views/DataInspector/behavior/default-table-columns.ts

Turns a collection's curated column paths (`schema-config/`) into `DataTable` column specs. Every default column opens fit to content, and a reference column shows the target collection's name field instead of the raw id.
Collections with no curated list (area, location) stay on the table's own schema derived fallback.
Every curated path is top level, so the schema is searched flat, not walked.
A non reference or unknown kind gets no display field, and the column shows the id.

## apps/desktop/src/views/DataInspector/behavior/delete-record.ts

Only kinds the reference index answers for are wired, since a delete without a reverse index has nothing to warn about.
The main process writes the source file first, and the in memory registry is updated only on success, so a failed write never desyncs it from disk.
Tag and item group keep their own lookup maps, so each has its own unregister. A facade delete differs only in its channel.
`recordDeleterFor` is undefined for any collection with no delete write path.
Its wrapper is where a landed removal is announced to whatever reads the dataset revision, since the deleters have no shared tail and every caller goes through the lookup.

## apps/desktop/src/views/DataInspector/behavior/id-ref-options.ts

The editing half of the id reference handoff.
`id-ref-kit` knows a field points at some collection and stops there, as its cell renderer does, because which collections exist is not something the design system may know. This side takes a target kind and hands back that collection's records as options, so the generic editor offers a real picker without importing a dataset.
A collection's own `id` is an id but not a reference. Repointing a record's primary key from a list of its siblings is never the edit anyone meant, so identity paths get nothing back and the kit falls back to its plain input. `EditorRow` then forces that input read only through the same `IDENTITY_PATH`.
Each list is built once and kept. The largest collection is about 900 rows, the source arrays never change, and the search box would otherwise rebuild the whole list per keystroke.
One collection is offered narrowed. A location record names the area it sits in, and a screen carries both ids, so picking them from two unrelated lists lets a screen claim a place on the other side of the map. Once the record has an area, only that area's locations are offered. That is the same rule `screen-validity` refuses a saved record for, applied where it costs nothing to obey.
A record with no area yet gets the whole list. The narrowing exists to stop a wrong pick, not to make the field unusable before its sibling is filled in. An area holding nothing narrows to an empty list, which drops the field back to its plain input.
The narrowed cache is keyed by the area and the kind, because two records open on different areas must not read each other's list. It is derived from the main cache, so every entry for a kind is dropped whenever that kind's own list changes.

## apps/desktop/src/views/DataInspector/behavior/id-ref-target.ts

`id-ref-kit` publishes `data-id-ref` and `data-target-kind` on the cell and stops there. Turning them back into a collection and a display name is this screen's job. It takes only the attribute values, no DOM.
The published target kind wins when it names a real collection, and the id's prefix is the fallback.

## apps/desktop/src/views/DataInspector/behavior/record-creators.type.ts

The shapes live in their own file so `create-connection.ts` can share them without a value import cycle.
`needsReview` marks a refusal a person settles, such as a record that already exists, not a write that broke. A batch caller skips those and does not report them as failures.

## apps/desktop/src/views/DataInspector/behavior/register-id-ref-option.ts

Adds one record to a collection's built list.
Only the tag collection can grow inside a session, when a term is minted from the editor, and the new chip must resolve to its term at once or it reads as a bare id.
The list is built first if nothing has asked for it yet, so the append can never seed a cache from a half loaded collection.

## apps/desktop/src/views/DataInspector/behavior/required-fields.ts

Which paths a record must hold before it can be created. `optional` is exact because derivation samples every row.
Only plain objects are walked. An array's or union's completeness depends on its value, not a shape the schema can name in advance.

## apps/desktop/src/views/DataInspector/behavior/settle-created-record.ts

The shared tail every record creator ends with: publish the new id as a pickable option and rebuild the collection source so the table shows the row without a reload. `create-connection.ts` shares it and settles two ids.

## apps/desktop/src/views/DataInspector/behavior/singular-label.ts

Every current collection label is a plain plural, so trimming the trailing `s` reads naturally.

## apps/desktop/src/views/DataInspector/behavior/table-view-key.ts

Each collection has two view keys, because two independent `useViewState` bindings share this screen: `DataTable` owns one internally, and the screen owns the filter clauses and the detail tab.
Sharing one key would make each write carry the other half as it stood at load, so a column drag would revert a filter. `query-view-key.ts` builds the second key.

## apps/desktop/src/views/DataInspector/behavior/ts-source-of.ts

The two read only renderings of a record are JSON and source. The source form uses the dataset's own emitter, so the tab shows exactly what a save would write.
The emitter refuses unknown fields, and that failure is shown in the panel as a comment.

## apps/desktop/src/views/DataInspector/behavior/unregister-id-ref-option.ts

The delete guard's counterpart to registering: a deleted tag or item group stops being offered as a pick the moment its own delete succeeds.

## apps/desktop/src/views/DataInspector/behavior/update-id-ref-option.ts

Re-resolves one record's cached label after an edit. Every reference field pointing at this collection, a screen's tag chips among them, reads its options from this cache, so a rename that only updated the registry would still show the old label until a reload.

## apps/desktop/src/views/DataInspector/behavior/useCreateRecordDialog.ts

State for one collection's New record flow: the dialog's open flag, the trimmed schema and blank draft it starts from, and the required path list that gates its Create button.
`onCreate` is undefined when the collection has no create write path, so the button is omitted.

## apps/desktop/src/views/DataInspector/behavior/useDataInspector.ts

All of the screen's state, so the component stays a layout. Rows are filtered by a compiled clause list, which is data, so the filter survives a restart.
The durable half lives under the query key only. The recommendations pseudo collection has no `COLLECTION_SOURCES` entry, so the source is chosen, not looked up.
`editIntent` is the record `openRecord` last asked for. It forces the editor tab open for that record and stops applying once the kind or the selection moves on.
A real collection's source is stable until the kind changes. The pseudo collection's is rebuilt whenever a pass or a verdict lands.
The free text query stays transient while the clauses are durable. A search is a moment's question, and reopening the screen to old query text that silently hides rows would read as data loss.
The selected record is looked up in the whole collection, not in the filtered rows, so following a reference opens the record it points at even when the active filter hides it.
A hand picked tab retires a pending edit intent, or the override would force the editor tab straight back open.
Selecting a recommendation is always keyed to the pseudo collection, so a verdict can advance the pass.
The detail fold is stored per collection like the clauses and the tab, so it survives a restart.
A finding or a record requested elsewhere (`openRecommendation` and `openRecord` in the data view store) is consumed on arrival, so coming back does not reopen what was reviewed. The record handoff also wants the editor tab, hence the edit intent.

## apps/desktop/src/views/DataInspector/behavior/useIdRefNavigation.ts

One delegated listener for every id reference on the screen, so the generic composites stay unaware of navigation: they publish an attribute and this reads it.
It runs in the capture phase on purpose. A click on a reference must open its target, not select the row, so this runs first and stops the event.

## apps/desktop/src/views/DataInspector/behavior/useRecordSelection.ts

Which record is open, per collection, for the session only. Switching collections and back lands where you were, but yesterday's selection is not worth restoring.
It writes through the store, not `useViewState`, because following an id reference must select a record in a collection that is not active yet, and a hook bound to the current key would need a render in between.

## apps/desktop/src/views/DataInspector/DataInspector.constants.ts

`RECOMMENDATIONS_KIND` is the pseudo collection: findings about the dataset, not records in it.
`KIND_NAV_ITEMS` is the side menu, in the order the collections reference each other.
The recommendations entry is a permanent rail entry, so a review pass is reachable without a jump.
`NAV_ITEMS` is the eleven real collections plus the pseudo collection at a fixed spot.
`NAME_FIELD_BY_KIND` is the field a reference to each collection shows in place of the raw id.
Container kinds (object, union, array) address nothing on their own. Only their leaves do.
`NARROWED_KIND` is the collection that narrows, and `AREA_FIELD` is the sibling field it narrows by.
The outdoor map is 8 by 8 screens per world. An indoor grid is wider and one row shorter, which is the layout rooms are placed on.
Floors run below and above the level you walk in at. A spawn sits on the 64 by 64 base tile grid one screen is drawn on.
`NO_TABLE` is the table half of the query key. That key stores clauses and the open tab, so its table half is deliberately empty.
The create schema drops a tag's `name`, because the allocator takes the combined key and computes it.

## apps/desktop/src/views/DataInspector/DataInspector.css

The screen gap leaves room for the nav's round toggle, which straddles its right edge.
The shared two pane layout sizes its list column for a list of rows. A table needs the greater share of the width and scrolls itself, with a sticky header inside its own scroller, so the list column must not scroll around it.
A folded detail column gives its width back to the list.
The shared detail pane normally scrolls as one block. Here the tab strip stays put and only the record content scrolls, so the scrolling moves down to `.data-inspector__detail-content` and the pane only clips.
The overflow itself lives on `ScrollArea`, which sits alongside the content class. The class only sizes and pads the region.
Two records side by side need more room than one, so the comparing layout widens the detail column. That rule comes last so it wins over the base column split.

## apps/desktop/src/views/DataInspector/DataInspector.tsx

Every part of the screen is schema driven and derived from the rows. Nothing is written per collection.
Recommendations reuse the list and swap only the detail side, which is `RecommendationDetail`.
Id reference cells publish their target as data attributes, and this tier, which knows the collections, turns that into a jump.
One delegated listener on the panes covers every reference the composites render.
The default column list is undefined for collections with no curated list (area, location), and the table then falls back to the schema's own visible top level.
Only this tier may look up what another collection calls a record, so it injects the id reference resolvers into the table.
A finding is minted by a detection pass and never created by hand, so the create button shows for real collections only.
The comparison holds two records side by side, so it gets more width until it is folded.

## apps/desktop/src/views/DataInspector/DataInspector.type.ts

Composites read untyped rows by dot path. Concrete record types are needed only where a serializer or writer is chosen.
`InspectorKind` is one of the eleven real collections or the recommendations pseudo collection. It is not a twelfth `EntityKind`: it has no record, no id prefix and no `COLLECTION_SOURCES` entry, and asking for one would throw.
`IdRefTarget` is what a clicked id reference resolved to, ready to select. Its label is the referenced record's display name, for a status line or a title.
`selectIn` selects a record in any collection, active or not.
A loose named record has one name field, which a few kinds leave empty.
`DeleteRoute` is the delete guard's whole rule as one pure decision, so a test pins the rule and not React's plumbing.
`onDeleted` runs when the record open in the editor is deleted and nothing is left selected.
`highlightedLines` are 1 indexed lines to mark as changed in the two code tabs.
`editorSlot` replaces the built in editor, for a pane that must not write or delete.
A create button's label is the nav rail's plural label for the collection, such as Item Groups.

## apps/desktop/src/views/DataInspector/sub-components/CreateRecordButton.tsx

The New record trigger and its dialog together, so a collection with no create write path renders neither.
It wires the same resolvers as `RecordEditorPanel`, so fields behave the same when creating and editing.

## apps/desktop/src/views/DataInspector/sub-components/DetailTabs.tsx

Three readings of one record: JSON, the dataset's own emitter output, and the schema derived form.
It is fully controlled, so two can run side by side in the comparison view off one tab state and one scroll offset. The optional slots (changed lines, scroll binding, a caller supplied editor) exist for that pairing.

## apps/desktop/src/views/DataInspector/sub-components/RecommendationDetail/RecommendationDetail.tsx

The comparison view: current on the left, proposed on the right, the same tabs on both, scrolled together.
Both panes read the recommendation's own collection, looked up by `entry.kind`, not the pseudo collection the list shows.
The diff is computed once and resolved to line numbers per side and per tab (see `comparison-lines.ts`).
Its stylesheet holds the comparison pieces.

## apps/desktop/src/views/DataInspector/sub-components/RecommendationDetail/sub-components/ComparisonPane.tsx

One side of the comparison: a titled `DetailTabs`. The pairing lives in the props, so neither side knows the other exists.
The current side of a create has no record, since nothing is there yet.

## apps/desktop/src/views/DataInspector/sub-components/RecommendationDetail/sub-components/ProposalForm.tsx

The editor tab of a comparison pane: `RecordEditor` with the normal lookups minus the two that would write to the dataset mid review (no delete guard, no tag creator).
Without `onCommit` every control renders disabled, which is what the current side wants.
Saving commits to the reviewer's draft, not to disk. The dataset write happens once, on Accept.
`changedPaths` marks where the proposal differs from what the dataset holds.

## apps/desktop/src/views/DataInspector/sub-components/RecommendationDetail/sub-components/RecommendationActions.tsx

The four verdicts. Revert stays disabled until there are amendments, and the batch button names its own scope with the count of certain findings it would write.

## apps/desktop/src/views/DataInspector/sub-components/RecommendationDetail/sub-components/RecommendationSummary.tsx

The claim, the confidence and the evidence, above the two panes. Evidence is shown in full: it is what lets a reviewer disagree for a reason.

## apps/desktop/src/views/DataInspector/sub-components/RecordEditorPanel.tsx

The editor tab. `RecordEditor` renders read only with no save function, and the note says why, since a form that silently refuses to save looks broken.
The dataset lookups are injected here, each bound to the collection once, so the form's binding is not rebuilt every render.

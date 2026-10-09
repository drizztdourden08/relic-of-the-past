<!-- @layer docs @kind doc -->
# Code notes: tests

Facts about the test suites that the code cannot say on its own. Each heading names the
file or folder the note belongs to, relative to `tests/`.

## dataset-guard

`describeDataset` marks a suite that reads real record content. The records are tracked in
the repository, so it never skips today; it stays as the marker for those suites.

On an empty registry the suite body is replaced, not skipped. `describe.skip` still runs its
callback, and several suites build fixtures in the body outside any `it`, which would throw.
The placeholder registers one skipped test so vitest does not report the file as empty.

A suite over records it builds itself keeps plain `describe`.

## asset-extraction/alttp-asset-set.keep.test.ts

The byte identity case compiles with full options on purpose. The cheap variant
(`skipDialogue`, `skipMusic`) only proves identity for a blob the app never ships.

## asset-extraction/gba-alttp-supplement.keep.test.ts

The base game ROM is found by its `(USA).sfc` suffix, never named, because its filename
carries the trademark. The USA image is the one the extractor validates.

The `.sav` fixture is a live save the reference emulator writes during play, so its slots
hold whatever the tester last did. The test asserts the shape of the decode, never story
state.

## data-inspector

Several suites import `buildSchema` from its own module, never from the `@ds/data` barrel:
the barrel pulls in the view state binding, which touches `window` at module load. For the
same reason, suites that render the inspector stub `window` and then import the component
fresh after `vi.resetModules()`, because the binding reaches `lib/storage` and the log bus.

### data-inspector/accept-all-certain.keep.test.ts

Batch accept is a loop, never a `Promise.all`: two findings often land in the same source
file, and every write reads, waits for the IPC round trip, then writes back. Overlapped, one
edit is lost; the contrast case shows it. The gate is `certain`, because `likely` evidence
only proves presence and must not be written unreviewed.

### data-inspector/accept-recommendation.keep.test.ts

Accepting writes first and records the verdict second; a verdict before the write would
mark done a finding nobody applied. The four collaborators are mocked because each really
writes to disk or to the store. An update is keyed by `targetId`, the identity the store
reconciles on.

### data-inspector/collection-sources.keep.test.ts

Every id is `<prefix>-<digits>`; the prefix is the kind name except `item-group` (`ig`) and
`enumeration` (`enum`), see `KIND_ID_PREFIXES`. Default column sets are typed by hand, so a
typo would open a column that renders nothing. Editor groups may name a path no row
carries, so the check is that no path is claimed twice: the layout would render it in the
first group and drop the other.

### data-inspector/comparison-view-sync.keep.test.ts

The comparison panes read as one view: the same tab and the same scroll offset. `DetailTabs`
is fully controlled, so both panes take the same `{tab, onTabChange}`. Scrolling uses the
`ScrollArea` guard: the side the user scrolled leads, the other follows, and the follower's
programmatic scroll is swallowed, so each real scroll makes one programmatic move.

### data-inspector/data-inspector-render.keep.test.ts

Server side render smoke tests. The active collection is React state that SSR cannot drive,
so the detail panel renders once per collection on each tab. Clicking a row or an id
reference, switching collection and anything portalled are not covered. The id reference
attributes are the half of the click contract a renderless test can check.

### data-inspector/module-init-order.keep.test.ts

`record-writers`, `id-ref-options` and `collection-sources` form an import cycle. A cycle
only faults when something is read during module evaluation, so each module must be safe to
import first in a fresh graph, with `RECORD_WRITERS` populated. The first import loads the
whole data graph cold, about three seconds alone, hence the long timeout.

### data-inspector/open-recommendation.keep.test.ts

`openRecommendation` is the one call that brings a finding on screen from outside the
inspector. The shell registers how to bring the inspector forward (its `useAppNavigation`
effect), the caller hands over what to show, and the view consumes the request once. The
request is stored before the page opens, because a shell may render the inspector
synchronously. The opener is not store state, so registering it again notifies nobody.

### data-inspector/proposal-draft.keep.test.ts

A reviewer may amend a proposal before accepting. The editable copy never reaches the store,
where a new detection would collide with a half made edit. Revert drops the amendment; it is
no undo history. The amendment is keyed to its finding, so selecting another drops it.

### data-inspector/recommendation-cache.keep.test.ts

The renderer's read model never merges an edit of its own: a verdict goes to the main
process and the answer replaces the cache whole. The flattened snapshot must stay the same
array between changes, because `useSyncExternalStore` compares it.

### data-inspector/recommendation-rows.keep.test.ts

Columns are the same for every kind, since one findings list mixes collections. Rows sort
certain first, then oldest first. A decided finding leaves the list, which is what makes
Reject remove it from view. A missing target or screen stays `null`: a placeholder string
would be sampled, fail the id pattern and turn the column into plain text.

### data-inspector/recommendations-shell.keep.test.ts

The folded detail column is hidden by CSS and stays mounted, so folding never discards a
half made amendment. The shell knows nothing about recommendations; a plain collection's
detail pane uses it too.

### data-inspector/record-creators.keep.test.ts

One adapter per collection's `Allocate*` shape. Each folds the record into the live
registry, publishes it as an id reference option and rebuilds the collection source.

### data-inspector/record-links.keep.test.ts

The Recommendations `targetId` column points at a different collection per row, so it has
no single target kind and each id resolves by its own prefix.

### data-inspector/tag-consistency.keep.test.ts

The `isTagKey` gate in `create-tag.ts` never runs on a direct edit, so `writeTag` checks that
`name` reads `namespace:value` and refuses the save before the write channel.

## design-system

Most suites here render with `renderToStaticMarkup` and compare markup strings, because a
portalled or interactive surface needs a browser; hover, drag and click wiring is left to the
Playwright pass. A few suites run under jsdom where a real DOM event is the thing pinned.
The DataTable suites stub `window` before importing the table, because the view state binding
reaches the storage layer and the log bus, which touches `window` at load.

### design-system/anchor-tracking.keep.test.ts

A portalled panel is placed in viewport coordinates, so it drifts when anything scrolls. The
suite covers the geometry (where the panel goes, whether the trigger is still visible) and the
listener wiring; the React glue (`use-anchor-tracking`) needs a DOM. A row scrolled below its
pane's own edge is still on screen but hidden, so the panel closes. The Select placement uses
the options `useSelectDropdown` passes (200 room, 4 gap, 180 minimum width).

### design-system/build-schema.keep.test.ts

The schema config is a diff over the derived base, never a replacement. Every case is one
assertion said several ways: whatever the config does not mention keeps what the data said.

### design-system/code-block-highlight.keep.test.ts

The `highlightedLines` diff is purely additive. Every line div is a sibling with no nested
divs (tokens render as spans), so splitting the markup on the line class is exact.

### design-system/compact-record-view-identity.keep.test.ts

The identity field is exempt from `resolveIdRefDisplay`. A collection's own `id` infers as an
`idRef` to its own collection, so with the default resolver the `Id` row would repeat the
record's name. The row reads the raw id even though the same resolver turns a real reference
on the same record into readable text, which proves the exemption and not a resolver that
never ran.

### design-system/compact-record-view-render

The view builds and shows the right text per field kind, and the allow list narrows what
shows. Hover and clicking an id reference need a browser. An object or union descriptor with
no `children` does not nest; it renders as the structured kit's one line summary. Only idRef
fields (top level and nested) ever reach the resolver. When one group survives the allow list
its label stays off, the same rule as with no filter: a single set never needs a heading. A
connection's placement is a plain object (form, rect, tiles); its own fields show as rows at
depth 1, and anything deeper folds into the parent's summary.

### design-system/compact-tier-render.keep.test.ts

Eight components gained a `size?: 'sm' | 'md'` prop defaulting to `md`, and the claim of that
change is that no rendered pixel moves: a call site that omits `size` emits exactly the markup
it emitted before the prop existed. The expected markup was captured from the components
before the change. Trailing spaces in class attributes come from the class templates, so a
tidy up that removes one is a real change to the emitted bytes. `sm` adds one modifier class
and nothing else; what `sm` looks like is CSS, pinned by `compact-tier-tokens`. The Toggle
case passes an explicit id, because without one the input takes a per instance `useId()`
value. TextInput and NumberInput extend `InputHTMLAttributes`, which carries the native `size`
(a character count); the tier took the name and `htmlSize` keeps the attribute reachable.
Neither may leak the other's value.

### design-system/compact-tier-tokens.keep.test.ts

What `sm` means in tokens, pinned at the stylesheet text, since there is no CSSOM and the
authored declaration is what needs pinning. Every control variable read falls back to the
exact expression the rule carried before; those fallbacks are the `md` tier, asserted
character for character, which stops `md` drifting under the composites built on it. The
second half asserts what `sm` resolves to (the numbers in the modern controls contract plan,
section 32). The `--ctl-` prefix is assembled in code, because a bare one reads to the
analyzer's dead CSS variable rule as a reference.

- The `2xs` space token existed but the `SpaceToken` union did not name it, and the
  inspector's stylesheet worked around that 21 times.
- Only the swatch's `sm` modifier may set `--swatch-size`; an `md` rule would override
  ColorPicker's own 16px on every swatch.
- A wrapper (Field, EmptyState) must not set the shared control variables, or a compact row
  would shrink a control asked for at `md`.
- The variables inherit, which is safe only while the sole writers are the controls' own `sm`
  classes, none of which take arbitrary children.

### design-system/create-record-dialog.keep.test.ts

`DialogShell` mounts a `Portal` while open, and `Portal` reaches for `document` with no SSR
guard, so no open dialog is rendered here. The suite pins `useCreateFormState`'s gating rule
through the real hook; the portalled chrome is left to Playwright.

### design-system/data-table-drag-sequence.keep.test.ts

The failure this suite exists for: the first drop landed and every drop after was refused. So
every case runs a gesture, checks it landed, then runs another against the list the first
produced; a second gesture that still used the old index would pick up a different column. The
refusal was geometric: columns step aside to open a gap, and a cursor held still ends up on
bare grid no cell owns, which the browser cancels (`dragend` fires, `drop` never does). That
needs a real browser. Pinned here: the surface behind the cells accepts the drag, and a cell's
own drop is not answered twice. The hook is driven with no DOM, so it never commits state,
which is the condition the drop handler must survive: with no remembered path it falls back to
the one the drag carries.

### design-system/data-table-drag

The drag gesture needs a browser. Pinned here: which cells step aside while a column is
carried over them, and which way, checked against the reorder being previewed. The cursor
carries a strip of the column, its name over a few real values; which values is a pure choice
pinned here, and how Chromium draws it is not testable. The drop zone is the whole column,
header and body: each body cell carries its own position, so the drop works from anywhere down
the column. A row with selection on draws a select cell ahead of its data cells, and without it
that slot is an empty child, so the cells are picked out by type. The seam over the gutter
between columns is crossed by a carried column; with a hole there the header would never hear
the cursor move on, so the seam answers the drag with its own column's index. The remove
target used to escape through the shared overlay portal, which needs a document; it is now
absolutely positioned in the table's own tree, so plain SSR sees it.

### design-system/data-table-field-tree.keep.test.ts

The recursive walk from schema to choosable tree, and the adapter that hands it to a menu.
Where the entries end up is asserted in `data-table-menus`.

### design-system/data-table-footer.keep.test.ts

The footer: row count, options menu trigger, and the sort and group summary that used to
repeat in every column's menu and now renders once, on the left of the same strip. The options
menu is portalled, so only its render with the full action set is checked here.

### design-system/data-table-group-row.keep.test.ts

One group header row: its depth, key, field label and count.

### design-system/data-table-header-cell.keep.test.ts

One column header: its label, sort caret, menu trigger and resize seam. With no live DOM there
is no drag and drop and no menu opening. The seam is never draggable, because picking up the
column is the other gesture. The caret uses the small triangles, since a sorted caret is
permanent and sits on the label. The rank badge and grouping flag were unreadable at header
size and became one sentence in the footer. The reveal is CSS: both controls are always in the
markup (focusable, no reflow), and a sorted column marks itself so its caret stays visible.
Both controls form one absolutely positioned cluster over the name, so the label's track is the
whole cell; the label renders before the cluster, which puts it underneath. An unsorted caret is
dimmed and hidden until hover.

### design-system/data-table-menus

The pure parts of the table chrome: the column menu, the footer menu, and nested group row
identity. The field tree is in `data-table-field-tree` and rendering in `data-table-render`. In
the add column submenus a branch opens further and only a leaf acts. Placing a column is the
column menu's job; the footer's add covers the two cases it cannot: not caring where the column
lands, and a table with no columns left.

### design-system/data-table-sizing

Sizing as pure functions: seam delta to width, fit to content, and the grid track per width
mode; the gesture and the measuring need a browser.

- Fit to content is a persistent mode, unlike grow: it does not wait for an overflow to act, so
  its fallback is used as soon as a measurement lands.
- A grow column fills only while space is left over. Once the table scrolls sideways it sizes
  to content, and fills again when space returns. A table showing a filled column measures wide
  because it is filled, so flexible columns are counted at content width first and both modes
  agree.
- The floor sits in front of the measured width: a narrower fallback could un-overflow the
  table, restore the fill, and overflow it again.
- The fallback is a render override that rides alongside the column list, so one list renders
  both ways and still says the column grows.
- A seam drag never goes through state while it runs; it writes the preview track list and
  commits only the final width, so the preview and the commit must agree.

### design-system/data-table-measure.keep.test.ts

With no DOM the browser rule is modelled: an element reports the box it is laid out in (`box`),
one laid out nowhere reports nothing, and `scrollWidth` rises above the box only once the
content (`content`, the width with nothing holding it in) spills. That last part was the bug: a
short value in a roomy column has nothing spilling, so its scroll width is the column width,
and a fit built on it could never bring the column in. The measurement only calls the members
modelled, so a hand built stand in replaces the element.

### design-system/data-table-render.keep.test.ts

Real collections render and a keyless table is silent. Drag and drop, carets, actions and the
portalled menus need a live DOM; the header cell, group row, footer and view signature have
their own suites. The resize seam carries the column boundary line, and its resting colour
makes the boundary permanent, one per real column. Each header parks one drag ghost holding a
capped sample. Nothing is laid out on the server, so no column falls back to its content width
and every column is on the track its own state asks for.

### design-system/data-table-sort-group-summary.keep.test.ts

The header used to carry a rank number and a flag glyph, then every column menu a sentence.
Now it is one sentence at the bottom left (`TableFooter`), built as a pure function. Titles are
spelled the way a header spells them. Layered grouping reads "then", not a comma, because the
levels nest and a flat list reads as peers. The sort half reads first.

### design-system/data-table-view-signature.keep.test.ts

What counts as a layout change, and proof that the table hook and the persisted view snapshot
start from the same seed. The render suite cannot prove that, since effects never run under
SSR. The table hook and the snapshot are seeded from the same column list, so the capture
effect's guard holds on the first pass and the first render never writes.

### design-system/delete-guard-route.keep.test.ts

The delete guard's rule, pulled out of `useDeleteGuard` as a pure function: a referenced
record stops at confirmation, an unreferenced one deletes at once with no dialog. The Swords
item group is a real seeded group that no static requirement points at today (pinned by the
reference index suite), so it exercises the no friction path on real data.

### design-system/dismiss-stack.keep.test.ts

The registry underneath Escape, tested without React. The bug it covers was an ordering bug:
eight components each bound their own `document` listener, so which one answered a press came
down to which mounted first. The key cases register the same pair in both orders and demand
the same answer; passing one order and failing the other reproduces the bug. React runs a
child's effects before its parent's, so a popover mounted in the same commit as its layer
registers first, and insertion order cannot be the tie break between levels. Each press
dismisses one thing and the owner then unregisters, as the effect cleanups do. A listener added
to `document` after the stack's own is stopped by `stopImmediatePropagation`. The app shell
binds its Escape shortcut at start up, ahead of any surface, so nothing can silence it; it
stands down because it checks the stack depth, and the suite registers that guard in the worst
order on purpose. An inline rename editor handles Escape on its own input and marks it
consumed; React's handlers run on the root container below `document`, so that always comes
first and the stack stands down.

### design-system/enum-kit-tiering.keep.test.ts

Which control a closed set is offered as, and that it renders; clicks, drags and keys are not
covered. Every enum editor is a decorator around its picker (`OpenSetControl`), so the prop
level assertions reach through that one hop. A value outside the derived option list shows as
active: the derived set is what has been seen, not what is allowed, and hiding it hid real
values and escape hatch entries.

### design-system/enum-open-set.keep.test.ts

The escape hatch every enum editor carries. Kind inference derives `options` from the values a
collection holds, so a non optional field only ever written one way leaves a picker with one
segment that cannot be changed or cleared. Both states of the entry render directly, with the
decisions behind them as plain functions. The schema is a tree, and two fields under test are
nested, so it is flattened first. The premise is asserted: if the sample field ever grows a
second value, the dead end stops being reproducible (`status` was the other example before
`ScreenRecord.status` was retired).

### design-system/escape-layered-surfaces.keep.test.ts

The real components, mounted and pressed under jsdom.

- The defect: Escape inside the HUD layout editor closed the whole `FullScreenLayer` instead
  of the picker in front of it. The layer was closed by the app shell's shortcut, a `document`
  listener bound at start up, while every popover bound its own and hoped to get there first.
- `Drawer` bound no key and is always mounted, so a press over an open drawer reached the page
  behind it. It now registers at the `dialog` level, gated on `open`. The gate is the half that
  must be tested: a closed drawer that claimed the key would swallow it for a sheet nobody can
  see. A drag begun with the touch chrome open is a plausible gesture, and Escape must reach the
  drag. Because the drawer registers at `dialog`, the stack decides ordering, and a popover
  outranks it whichever mounted first.
- The ordering trap is why two cases look like duplicates. A fix that leans on registration
  order passes whichever order it was written against and fails the other. So the same layer
  and popover pair is built twice: both mounted in one commit (the child's effects run first,
  so the popover registers before the layer), and with the popover opened later, which is the
  order an author usually produces. Both must answer the same way.
- The test popover does exactly what the shipped popovers do.

### design-system/field-kit-render.keep.test.ts

Each control and cell renders for a representative value of its kind; appearance and
interaction are not covered. An array of references renders each entry resolved, not the
flattened one line text every other array gets.

### design-system/field-kit-strategies

The kits register themselves when the field kits barrel is imported, so `tester-for.ts`
imports it for its side effect. Every case goes back through the core registries instead of a
kit's internals, so a passing case proves both the registration and the semantics.

### design-system/filter-bar-clause-list.keep.test.ts

FilterBar only wires these transitions to handlers; the logic lives in the clause list. Every
clause is keyed by its own id, never its array index, so the cases build lists out of order and
interleave removals.

### design-system/filter-bar-persistence-roundtrip.keep.test.ts

The debounced write path end to end: what a rapid add, remove, add sequence leaves on disk once
the 400ms debounce (`lib/storage/ui-views.ts`) flushes. Nothing mocks `saveViewSnapshot` or
`loadViewSnapshot`, because the reported bug (filters being added on their own) was live
persistence; this uses the real repository, like `view-state-load-race` does for the read
side. The next launch is simulated with a cold module reading back exactly what was written.

### design-system/filter-bar-render

Each composite renders without throwing; dropdowns, the add filter picker and clicks need a
browser. FilterBar itself is not imported, because its add filter button reuses DataTable's
FieldPicker, which had not landed when the suite was written; FilterClauseCard and
OperatorMenu are everything else it assembles. A filter operand only needs the shape of the
operator's arity, never a particular row's value. The merged strip look and the compact layout
are CSS, so the suite checks the markup those rules hang off: the classes keyed off the right
state, built the same way for every control from a text box to a two ended range. The remove
badge sits inside the strip so the stylesheet can pin it to the corner; being last also puts it
on top without a stacking order and last in tab order. The operator button is icon only: its
label lives in the accessible name, so `aria-label` is stripped before asserting the label
appears nowhere else.

### design-system/filter-case-sensitivity.keep.test.ts

The real string tester is registered by importing the field kit barrel, so the cases go through
the same registry the app does. Three distinct values would infer as a closed set, so the
schema forces the text kind. Under case sensitivity only the all lowercase row still holds a
lowercase "ledge".

### design-system/filter-clause-id-stability.keep.test.ts

The reported bug: a delete that removed the wrong clause, or two, or a filter that changed when
another was touched. `createClause` handed out ids from a module level counter (`clause-1`,
`clause-2`) that reset on relaunch, while clause ids persist to disk verbatim (the snapshot's
`capture`). The first clause of a fresh session collided with a saved one, and FilterBar keys
add, remove and update off `clause.id`. The fix: `createClause` uses `crypto.randomUUID()`, and
`restoreDurableSnapshot` heals a file that already has a collision by reassigning repeat ids,
keeping everything else about the repeated clause. A relaunch is simulated with
`vi.resetModules()`, where the old counter would have reset. A single row's `name` would infer
as a one value closed set, which does not offer `eq`, so the kind is forced to text.

### design-system/filter-clause.keep.test.ts

The testers that do the real comparing live in the field kit package, which registers them into
this registry. The stand ins here are the smallest thing that proves the wiring: resolve the
field, resolve its kind's tester, and combine them all. `name` holds three distinct values, so
the kind is forced to text, which keeps the suite about `compile()` and not inference.

### design-system/group-rows.keep.test.ts

Grouping nests: a group's children are either the next level or the rows themselves, so a
renderer walks the tree and collapsing is a local decision.

### design-system/id-ref-display-default.keep.test.ts

`defaultIdRefDisplay` resolves a kind off the id's own prefix when neither column nor field
supplies one. The stand in is the Recommendations table's `targetId` column: a mixed column
where every row's id names a different collection, so `buildSchema` derives no `targetKind`
and each id resolves on its own. It is wired with no `displayField`, as the real table is. The
sample pairs an area id with an actor, two collections in one column. DataRow's module graph
reaches the view state chain, so `window` is stubbed. Navigation already falls back to the id's
prefix (`resolveIdRef` in `id-ref-target.ts`), and the display fix must not change that. A
collection's own `id` infers as an `idRef` to itself, so with the default resolver it would
show the record's name; the `Id` column is exempt.

### design-system/id-ref-display

Asserted over the real collections: a design system table shows a foreign record's field
without importing one. Opening the portalled column menu and picking a field need a browser.
The app tier lookup reaches the data barrel, which pulls the view state binding, the storage
layer and the log bus, so `window` is stubbed before the dynamic imports and the lookup is only
bound after that. Following a reference reads the attribute, not the text, so a cell shown as
a name still opens the same record. The header's menu is portalled, so nothing of it is in the
markup until it opens.

### design-system/id-ref-lookup.keep.test.ts

Which control an id reference is offered as, and that the injected lookup reaches it with real
rows; opening and typing need a browser. A list of references keeps its row controls (move up
and down), because order and membership both matter.

### design-system/infer-kind.keep.test.ts

Every downstream decision (operators, control, sort) hangs off inference, so there is one case
per kind plus the edges between neighbouring kinds. Objects with no shared key are two disjoint
branches; the same key holding a primitive on one branch and a container on the other is also
a union. The real dataset cases guard the subset chain fix: a field that is one shape with
optional keys must not read as a union because some sampled objects carry fewer keys. The
fixtures assert they exercise both branch sizes. The connection model migration replaced the
discriminated placement (a real union) with one shape where `side` is an additive optional
field, so it is an object. The observed range branches (kind; kind and tiles; kind, tiles and
sourced) form a chain, even though the TS type is written as a discriminated union.

### design-system/keycap-mouse-glyph.keep.test.ts

The two legend primitives exist because a legend that spells a shortcut in prose is read as
prose and skipped; a key cap and a lit mouse are pictures, and a strip of four is scanned. A
test cannot see the picture, so it checks that every variant is a different picture and each
is announced in words, the half a screen reader relies on. `KeyCap` is a `<kbd>` because the
element already means a key. Each mouse variant has one body and one lit part, with an outline
that never changes, so they read as states of one object; the drag variant adds the travel.

### design-system/path.keep.test.ts

Every consumer reads values by dot path, so `getPath` is on the hot path of filtering, sorting
and rendering. Its one hard requirement is that it never throws, whatever shape the row has.

### design-system/position-input

The interaction rules are tested as the pure functions the hook is built from, and the markup
by SSR; typing and focus need the running app. Each axis answers to its own bounds, so -5 is
out for the grid axis and in for the signed one. A disabled input disables both fields and the
two chevrons per axis.

### design-system/record-editor-identity-readonly.keep.test.ts

The identity field stays read only on a writable record. It fixes the rename then clobber bug
(the record writers use the edited id as the file search key) and, for item groups, the
sibling id trap: with 7 rows, `id` infers as a closed set and rendered a dropdown of other
records' ids. The sibling's id still appears as an option, being a real enum value, but its
button is disabled. A member field on the same record stays editable; `label` is not used for
that check, because with 7 rows it also infers as an enum.

### design-system/record-editor-nested-array.keep.test.ts

A requirement set (`RequirementSet = TraversalRequirement[][]`) is an OR of AND lists: an array
whose element is itself an array of strings, one level deeper than `ArrayFieldEditor` serves.
The array kit's read only fallback used to be all that was offered.

### design-system/record-editor-object-array.keep.test.ts

An element's fields get the same real controls a top level field gets; add, drag and dropdown
need a browser. Rendering every screen takes under two seconds alone and longer under a full
parallel run, so the whole collection case has a 30 second timeout.

### design-system/record-editor-position.keep.test.ts

Which control a grid position is offered as and which limits reach it, through the shape check
and bounds rule; typing and clamping need a browser.

### design-system/record-editor-render.keep.test.ts

The form builds for real records of several shapes, read only and interactive; typing, Save
and the pending and error states need a browser. A whole collection render gets the same 30
second timeout. Placement is a plain nested object, so the area form record covers nested
object recursion. `requirements` is still a real discriminated union on a connection (item,
check, all of, any of, count, impossible), so it is the union branch fixture. The schema comes
from the whole collection, so `side` appears as optional; only the nested `Rect` recursion is
pinned. A list of references is a sequence, so it keeps add, remove and reorder rows; a list
of tags does not (see the tag suite). A real requirement's `anyOf` reaches the branch editor;
the reference list on the same record is hidden so the variant list is the only one left.

### design-system/record-editor-state.keep.test.ts

The two pure pieces of the editor: what counts as changed, and how a schema lays out with and
without a config. Writing a value back to its original rewrites the container, so identity says
different and only the serialised compare is right.

### design-system/record-editor-tags.keep.test.ts

Which control a tag list is offered as and what vocabulary reaches it; typing and picking need
a browser. Every stored value is a `tag-NNN`, so the elements derive as references, while the
chips read as the terms they stand for. The dataset uses far fewer tags than the taxonomy
defines, which is the point of offering the taxonomy. Screens and connections have different
vocabularies. The tag entry replaces the reference rows a list would otherwise get.

### design-system/record-editor-union.keep.test.ts

Branch detection is only worth testing against real variants, so the shapes come from the live
dataset; a variant added or dropped upstream shows up here. Nothing from a sibling branch leaks
in: an item requirement offers the item and not the list operators. Placement is one plain
shape (`side` only on a border point), so `buildSchema` infers an object (the key subset chain
in `infer-kind.ts`), pinned so a future real disjunction shows as a diff. `check.requirements`
uses the same requirement language as `connection.requirements`, so detection is not keyed to
one collection. `item.weapon.range` was the nested case before inference was tightened; it is a
subset chain and now infers as an object.

### design-system/record-editor-variant-array.keep.test.ts

A requirement's `anyOf` or `allOf` is an array of a union (own an item, own a check, own N of a
group, nest, or the impossible sentinel), which `ObjectArrayEditor` cannot serve with its one
fixed element shape. Over a synthetic fixture, branch aware rows render, the add, remove and
branch picker plumbing is present, and a sibling branch's fields never show. Clicking and
dragging need a browser.

### design-system/referenced-by-render.keep.test.ts

The empty state copy with no hits, and grouping by kind with counts. Groups start collapsed,
because a record can carry hundreds of hits, so the referencing rows only exist after a click
and are not covered here.

### design-system/schema-real-data.keep.test.ts

Derivation has to survive the real data: hundreds of rows, deep nesting, optional branches and
arrays of objects. The suite pins the kinds inferred for load bearing paths, so any change to
inference shows up. Requirements are a real union (one is an id, another a list). Placement is
one uniform shape (form, rect, tiles, with `side` an additive optional field), so an object
nesting three levels deep. An item's `weapon.range` branches only add keys on top of the smaller
ones (unbounded, estimated, contact), so it is one shape with optional fields. A parent always
precedes its own children in the flattened order.

### design-system/scroll-area-sync.keep.test.ts

ScrollArea's sync lives in `create-scroll-sync-controller.ts` and `create-scroll-guard.ts` so it
runs without a DOM. A fake node stands in for the element, and its native scroll fires only when
`scrollTo()` changed the offset, as a browser would. A smooth scroll fires several intermediate
events before arrival, so the guard suppresses all of them, including the arrival itself, and
lets the next real scroll through. In the mirrored pair each side is one ScrollArea wired as
`ScrollArea.tsx` wires it; without the guard the pair would recurse forever, and the source side
is never scrolled back.

### design-system/segmented-control-deselect.keep.test.ts

SegmentedControl's click decision as a plain function; the wiring is covered at the props level
in `enum-kit-tiering`.

### design-system/table-state

The table hook is a thin binding over pure transforms. There is no renderer, so the transforms
are exercised directly and the hook's sequences are replayed through them, which is the same
state machine. The insert index for "add column before" is that column's own index, and "after"
is one past it; both are where the new column ends up. The generic sort fallback compares
stringified values, so 9 would sort before 10 until a number comparator is registered.

### design-system/use-view-state.keep.test.ts

`useViewState` composes the durable store (`lib/storage/ui-views`) and the session store
(`stores/data-view-store`). The contract: no key means no IPC and no store, ever; a real key
means a loaded snapshot is pruned against the current schema before a caller sees it. The hook
is re-imported per test after `window` is stubbed, because the storage layer reaches the log
bus at load. `renderToStaticMarkup` never commits, so effects never fire and a keyed render
shows zero calls too; the durable load path is covered by `view-state-load-race` and the
storage suite.

### design-system/view-state.keep.test.ts

A snapshot stores field paths, and the dataset changes shape underneath them. Restoring must
always prune, never throw, and never leave a table with no columns. `name` is forced to text so
the operator check has a field where `contains` is legal next to `tag`, which reads as an enum
and makes a string operator invalid. The Data Inspector's fold state (CollapsibleDetail)
persists through the same snapshot as the filters and the tab, keyed per collection.

### design-system/view-state-load-race.keep.test.ts

The reported bug: clearing the filter clauses one at a time brought an earlier set back. A read
still in flight when the user started editing came back with the old view and was applied
unconditionally. With no DOM the sequence replays what the hook does: the real
`beginDurableLoad`, the real repository, the real mark edited then write, with the disk answer
held back until after the removals, so the race is deterministic. The stand in for the hook has
local state, one guard and the two calls it makes. One hook instance can move between two keys;
the effect re-runs for the second and there is nothing local to preserve.

### design-system/tag-input

`tag-input-values` and `tag-input-convention` cover the TagInput's decisions as plain functions,
since keystrokes cannot be dispatched without jsdom. The convention check is advisory and never
blocks an add. `tag-input-render` renders the control empty, holding chips and disabled; the
portal panel reads `document`, so it needs a browser. Only the chip that breaks the convention
is flagged, not its well formed neighbour. `tag-input-enforce` covers the one field that refuses
a value: a tag list whose values are references, where inventing a term means minting a record.
Everywhere else stays advisory, because an opt in that became the default would break every
other tag entry. Case alone does not make a value new, because the entry resolves to the
existing value.

## e2e

`tests/e2e/README.md` describes what each permanent spec guards. The notes below hold what
the code itself used to say.

Every automated launch here leaves the owner's session alone: its own `--instance`, its own
copy of `.user-data` at a short path where one is used (a long path breaks `app-sprite://`),
`--no-focus --muted`, and nothing saved. A widget button is pressed with
`dispatchEvent('click')`, never `click()`: Playwright's click calls `Page.bringToFront()`,
which raises the window on Windows and steals focus.

### e2e/ensure-test-profile

Every permanent spec launches into one automation profile, `e2e-tests`; no automated launch
touches the profile that opens by default. `provisionProfile` (the same call `wt new` uses)
is an idempotent create or repair seeded from the maintainer's named manual saves, so this
also copies every checked in save state fixture into the profile's manual saves, skipping
ids already there. The `.mjs` tooling is loaded with a dynamic `import()`, because Playwright
compiles the file to CommonJS and a static import of an `.mjs` with `import.meta` breaks.

### e2e/state-harness and e2e/state-readers

`withState` boots the built app on a named manual save with the navigation widget open,
waits 16 s for the core to report live memory, hands the body a reader and always closes. A
missing build or fixture skips. The keyboard codes per SNES button follow
`shared/input/keyboard-default.ts`. Input is gated on the active profile's device map, so
`enableKeyboard` binds the default layout in the live input manager, in memory only. A press
must outlast one input poll.

The readers anchor on section title text ("States", "On this screen"), since the widget
renders inline styled divs: a restyle cannot break them, only a rename. Every poll waits on a
predicate. Order matters: groups, rows, tags and the check summary report nothing until the
flood has run, and reading them first looks exactly like the regression the specs catch. A
multi screen area sums its sub screens, so the flood total climbs for a moment before it
settles.

### e2e/flood-parity.keep.spec.ts

The widget, the simulator's runner and the `--dump-nav` dumper must flood a location to the
same number. They once disagreed (Jail Cell: dumper 590, widget 608) because the dumper used
an empty inventory and a fixed interior tile context. `--dump-nav` writes the dump and exits
by itself, so the spec polls for the file.

### e2e/hud-layout-options

The rig for pressing every option of the HUD Layout panel in the built app. `readShape`
reads every control of one section as tags, names and rectangles, without each control's own
lit or checked state, which is the one thing an option may change about itself.
`readPlaced` reads every node's placed box off the stage. The page readers are self
contained functions, because `page.evaluate` does not carry a closure. A tall viewport keeps
a whole section in one capture; `element.screenshot` paints black past the viewport.

The rule: press an option, and its section comes back with the same controls, rectangles and
box (`stable`), while the option's own state did move (`flipped`), or the case is vacuous.
`stageState` includes the overlay's cell boundaries: a grid whose outer tracks are `auto`
around a `fill` track answers add, insert and gap by resizing the fill track, so no child
rectangle moves while the cells do (they come from `stageCellRects`). A grid line paints its
background and a flex slot its border, which is why the overlay colour reads one or the
other. An inserted `auto` column is empty and solves to zero width, so a track edit is judged
by the occupancy map it rewrites (children are renumbered). Pressing an alignment tile that
is already lit writes the value it had, so nothing may move.

The screen root is the subject because alignment, flow and distribution only show in a
container with room to spare; the root is the full play field with three children and can
take either engine. Each spec is one serial `describe` sharing one app, so the cases depend
on order (the flex spec starts by flipping the engine). In the grid spec, the alignment case
first sizes column 1 and row 1 to `fill`, because `auto` tracks hug their content and leave
nothing to align. Sizing a column that was `auto` to `px` then `%` carries the number zero,
so `%` moves no pixel and is exempt from the solve check. Wrap on a flex row whose children
already fit moves nothing; what wrap does when it applies is pinned in
`hud-layout-engine.keep.test.ts`. A flex overlay draws one slot per child and no lines. The
gap field's formula promotion floats the control and must not reflow its row.

### e2e/hud-style-drives-scheme.keep.spec.ts

The hub's side navigation shows labels only while open, so a tab is picked by its accessible
name. The slot list sits inside the column's own scroller, so the shot scrolls the last row
into view and clips to the visible rows. The migrated profile is stored as
`hudStyle: 'extended'` with `controlScheme: 'modern'` and four assignments keyed by the old
`slot:kb:*` ids; the value rename, the style collapse and the slot renumbering must all land.
Original is pressed first so a rerun never depends on how the last run ended, and every
setting changed is changed back.

### e2e/ledge-baseline.keep.spec.ts

Four states pin every ledge kind (see the README). Counts are asserted per direction, because
these bugs move a jump between directions while the total holds. A diagonal hop is not 45
degrees: `LinkHop_FindLandingSpotDiagonallyDown` (player.c:1115) steps x by 8 and y by 9, so
the row delta may exceed the column delta by one; a hop spanning many columns came from
running along the face.

### e2e/state specs

- `state-big-screen`: the castle exterior is a four screen area (0x1B, 0x1C, 0x23, 0x24); one
  screen is 64x64 = 4096 tiles, so the total must be 16384.
- `state-intro-bed`: the sleep handler waits for a button, so beats need taps; A and B
  alternate so a stuck auto repeat cannot stall. The tap budget is a ceiling, checked before
  each tap. The first frame is the zero baseline for progress flags.
- `state-jail-cell`: the flood now reaches past the cell, so the summary counts a third
  check outside it, already done; the two behind the lock are what the state guards.
- `state-links-house`: a follower in tow is what makes this the intro and not a later visit.
- `state-sanctuary-grounds`: the single screen outdoor case, on purpose.
- `state-secret-passage`: room 0x55 is claimed by two screen records (a dam room and a
  castle passage). Neither carries an entrance id or variant, so resolution returns
  `screen-170`, not `screen-171`; the spec asserts what the widget renders today.
- `state-tag-room`: the flood derives the annotations, so it runs first; the tag must decode,
  not show raw 0x08.
- `state-throne-room`: the state is saved without a follower, so the push wall
  (`nativeType 0x14`) must read shut.

## electron/recommendation-files.keep.test.ts

Every recommendation operation reads, changes and writes a whole collection file. The per
kind queue must wrap the whole operation: queueing only the save still lets two decisions
read the same snapshot, and a batch accept depends on it. Without the queue, either the
later write overwrites the earlier verdict, or the two writes collide and the file reads
back empty, which is why the unqueued case only asserts fewer than two verdicts.

## features/all-off-vanilla.keep.test.ts

With every enhancement off, the bridge sends all zero feature words so the engine runs the
verbatim vanilla path. `hudStyle: 'vanilla'` is the default Original HUD; a host drawn
style arms the host menu gate bits.

The init time texture height follows the INI `extend_y`, which only applies with
`extendedRendering`. The live Height240 PPU flag must agree, or the draw loop overruns the
buffer. `extendY` defaults to true, so a vanilla profile with extended rendering off must
still render the stock 224 lines.

## features/bundle-flags-parity.keep.test.ts

The split bug fix flags are generated into both the C header and the TS registry from one
catalog (`scripts/build/gen-bundle-flags.mjs`). The word 3 gate bits in `features.h` and the
host menu and modern controls bits in word 2 are hand written on both sides, so they are
checked the same way. Word 3 has no free bit left, which is why those two gates live in
word 2, above `kFeatures2_HandAuthoredFloor`.

The C headers mention flag names in prose comments, so the scan strips comments first. An
enum value is either a literal or a shift; anything else is skipped. Both word 2 gates
change what the game computes (the menu takeover and the item register), so both must be
in the Vanilla Safe mask, and they are asserted by name so a removed entry fails.

## features/hud-style-scheme.keep.test.ts

The HUD style is the one choice and the control scheme follows from it. A stored profile
from before the rename carries the two old keys, `controlScheme` and `hudStyle`. The
migration runs on every profile read, so it must be idempotent and exact: a profile must
never lose the modern scheme it was saved with. A profile written after the rename has no
`controlScheme`, so one carrying `enhanced` is never promoted again.

## features/resolve-features.keep.test.ts

The rendering requirement tree: `extendedRendering` then `linearWorldTilemap` then
`ultrawideRendering` and `tallRendering`; `cameraLockToViewport` requires
`extendedRendering`; `smoothTransitions` requires `cameraLockToViewport`. A child never
resolves on while its parent is off.

## features/vanilla-safe-lock.keep.test.ts

Vanilla Safe leaves nothing enabled that diverges from the stock cartridge, asked of the
registry so new features are covered. The fixpoint matters more than the per feature flag:
it protects a future feature that depends on a parity feature without being flagged
itself. Haptics and developer tools only observe, but both have `GameHook_*` call sites in
vendored game code, so Vanilla Safe locks them too.

## game/aspect-ratio.keep.test.ts

The widest custom ratio is about 4.27, the 1024 px linear world width. The tallest is
256/480, about 0.533. A 5:4 screen now fills at its own ratio and is no longer clamped to
4:3.

## game/one-rules-path.keep.test.ts

The generator answers where a row is reachable. What this side keeps is the join from its
regions to dataset screens, plus the two inputs the file's settings hand the rows. Turning
Big Key doors off hands over only the big keys. Normal logic counts the lamp alone as light,
so the Fire Rod does not light a dark room.

## game/overworld-area.keep.test.ts

A 2x2 overworld area shares one sprite table across its four screens, with every spawn
relative to the head (top left) screen. Screens lay out 8 per row, so head 24 has area mates
25, 32 and 33. Dark World screens reuse the Light World head layout at an offset of 64.

## game/ui-bridge-parser.keep.test.ts

The UI buffer is read up to byte 124 and only the main module byte (offset 0) drives the
mode here. Module 20 is the attract demo; modules 0 to 4 are the title and the file select,
copy, erase and name menus. None of them is gameplay, so the main HUD stays hidden.

## widgets/live-data-inspector-records.keep.test.ts

`recordsFor` returns every record relating to the current screen. It replaced a lookup that
showed only the first connection, so the cases use real screens with several records,
including two spawns of the same sprite type.

## widgets/screen-record-draft.keep.test.ts

The screen editor sends this record to `screenEditor:writeScreen`, the one place the
dataset tooling writes a record into a source file. A dungeon room's file is its floor, so
an interior without a floor is a separate blocker (see `record-file-targets`).

## game/recommendations

Several suites build a `contextFor` whose `context.screenId` and `observations.match` name
the same screen, mirroring `use-screen-observations.ts`, where the two always agree. Probes
that read "the screen we are on" read it off `observations.match?.screen.id`.

### game/recommendations/actor-combat.keep.test.ts and actor-spawns.keep.test.ts

One `strategy:actor` detector covers both findings. The spawn finding's key is
`spawn:<n>`, the set probe's noun plus live key. With no native combat row supplied, a new
actor is classified `object`, never a guessed enemy, npc or boss.

### game/recommendations/check-presence.keep.test.ts

The fixture is the interior a fresh save opens in (room 260), whose single chest is the
earliest check in the game. The chest table's contents byte is a raw receive id, so it
resolves to the catalogued reward. The dataset is restored after each case.

### game/recommendations/connection-add-parity.keep.test.ts

A bare room index can be ambiguous (a castle room and a cave can share one), so the fixture
only uses rooms that `resolveRealDestId` resolves back to themselves. A new crossing has no
partner yet, so the destination lives in the finding's key and `proposed.toConnectionId` is
a placeholder. A covering record is found through its partner's screen, so the fixture's
partner must be a real registered record. An unresolvable room proposes a screen create
graded `likely`, because the palace is unknown.

### game/recommendations/connection-remove-parity.keep.test.ts

An outdoor edge is never proposed for removal: the flood proves presence, never absence. An
indoor edge can be, once both `walkBoundaries` and `doorBoundaries` were read. A one way
record is judged only from the screen that can observe it, which `canExit` states. A delete
proves an absence, so removals are graded `likely`, never batch writable. Every fixture
registers a real partner record, because a connection needs a resolvable `toConnectionId`.

### game/recommendations/connection-strategy-parity.keep.test.ts

Direction derives from `canExit`. A partner no record carries has no screen, so its own id
stands in for the screen id, which the editor reads as an unknown screen. Flood evidence
proves presence only, so a nav proposal is never `certain`. The unresolvable endpoint case
filters to the nav probe's own findings; the crossing probes flag that record separately.

### game/recommendations/diff.keep.test.ts

The diff covers the shapes real records have: an array (tags), a union (requirements), a
nested object and a deeply nested one. A union variant that appears or vanishes reports its
leaves, so a comparison view has a path for every line it marks.

### game/recommendations/item-grants.keep.test.ts

The create side is three set probes (chest contents, native receive count, tracker inventory
delta) because confidence and evidence source are fixed per probe; the alias side is two
field probes. All five share one detector id, so the tie break (chest beats grant) comes
from `runDetection`'s dedup and the registration order. That dedup is in `runDetection`, so
the suite drives the strategy through `registerDetector` and `runDetection`, as `runPass`
does. The enumerable native table outranks a single observed grant.

### game/recommendations/registry-store.keep.test.ts

A pass scopes reconciliation to what ran; without that, a pass on one screen resolves every
finding about every other screen. `wire-detector` must be imported after
`strategy-detectors`. A screen carries two detectors: the comparison strategy against live
memory, and `screen:geography`, which checks the record against the rest of the dataset.

### game/recommendations/screen-strategy-parity

`WRONG_PALACE` is a palace index no record uses, so the disagreement is real for every
screen. The indirect entrance case points entrance 0x2B at another room, which is how a
stale entrance id looks after walking in from another indoor room.

## game/data

The writer suites (`dataset-record-writers`, `enumeration-writer`, `item-group-writer`) run in
a throwaway workspace shaped like `shared/game/data/...`, because the id allocator scans that
shape and the path resolver refuses to leave it.

### game/data/check-content-tags.keep.test.ts

The check content tags (key, big key, map and compass, boss item) are a seeded
`CheckRecord.tags` array, no longer computed on read. A few known checks are pinned so a
seed edit shows as a diff.

### game/data/connection-pairing.keep.test.ts

One record is one point on one screen; `toConnectionId` names its partner (see
`shared/game/data/connections/derive.ts`). Two invariants do not hold today and stay as
`it.todo` with the violators named.

Same screen pairs: `connection-896` and `connection-1143` both sit on `screen-236`, from the
data before the migration, and neither carries `ctx:internal`. The check to restore:

```ts
const violators = ALL_CONNECTIONS.filter(c => {
  const partner = getConnection(c.toConnectionId);
  if (c.screenId !== partner.screenId) return false;
  return !hasTagKey(c.tags, 'ctx:internal') && !hasTagKey(partner.tags, 'ctx:internal');
});
expect(violators.map(c => c.id)).toEqual([]);
```

Tile footprints: 8 pairs (16 records) share tiles on one screen, a door and the stair or
entrance beneath it on different layers. `ConnectionPlacement.layer` exists for this, but
the migration had no data to fill it. The pairs: 324/325 (`screen-051`), 212/243
(`screen-103`), 228/244 (`screen-122`), 230/245 (`screen-123`), 232/246 (`screen-124`),
002/366 (`screen-204`), 382/383 (`screen-190`), 404/405 (`screen-031`). The check to
restore:

```ts
const byScreen = new Map<string, Map<string, string>>();
const collisions: string[] = [];
for (const c of ALL_CONNECTIONS) {
  const sig = tileSig(c);
  if (!sig) continue;
  const seen = byScreen.get(c.screenId) ?? new Map<string, string>();
  byScreen.set(c.screenId, seen);
  if (seen.has(sig)) collisions.push(`${seen.get(sig)} vs ${c.id} on ${c.screenId}`);
  else seen.set(sig, c.id);
}
expect(collisions).toEqual([]);
```

### game/data/dataset-integrity.keep.test.ts

The dataset held against itself, exhaustively: every reference resolves to a record of the
right kind, ids are unique and prefixed, a screen agrees with its area, location and region
about its world, and every event row owns a ledger bit. It replaced a sampling suite, because
a dangling id hides in the one row nobody sampled. Every failure names the record and field.

The menu and save and quit pseudo screen is nowhere in the world, so it carries the two
placeholder ids (`area-000`, `location-000`) and nothing answers for them; a second entry
would mean a record lost its place. The reference walk only grows (11765 references when
written); the four named fields are the easiest to lose to a type change. An area that spans
both worlds agrees with a screen in either. The floodgate's twin rows were merged into one
event. A location and an event row may share a bit (a dungeon reward pickup and its "reward
taken" row), but never two locations on one bit or a location on a bit no event owns.

### game/data/dataset-record-writers

The fixture parks one record in a file its own resolver would not name (a vanilla junk item
with the randomizer items, an enemy with the bosses). `tree-layout` forbids that in the real
tree; here it proves an update or delete finds a record by id wherever it sits. `recordsIn`
reads a written file back by evaluating its array literal, since the emitter writes plain
data.

### game/data/enumeration-generated-types.keep.test.ts

`generated-types.ts` is committed, so an edit to `ALL_ENUMERATION` without
`npm run generate:enum-types` would go unnoticed; the suite regenerates it in memory and
compares byte for byte. A category earns a union only when the field it labels stores a
string; the progress tier labels a numeric field, so it is left out of the code generation.

### game/data/enumeration-writer.keep.test.ts

The writers also regenerate `generated-types.ts` from the real repo's `ALL_ENUMERATION`
(`generate-enum-types.mjs` reads a fixed path). That is harmless here because the real
`enumeration.ts` never changes, so the run is a no op.

### game/data/generate-enum-types-root.keep.test.ts

`generateEnumTypes` takes an explicit `root`. Its default guess is relative to the script's
own file, which is wrong from the bundled `dist/electron/main.js`, so every production launch
once hit `ERR_MODULE_NOT_FOUND`. The fixture seeds one row per category, which
`buildGeneratedTypesSource` needs; every other real category is absent on purpose, proving
the read came from the temp root. The seed is read from the record tree and the union is
written beside the lookup that consumes it.

### game/data/generated-mirrors.keep.test.ts

`scripts/generate-from-records.mjs --check` rebuilds each generated file in memory and
compares it to disk, so a hand edit fails and is named. The generator is the only writer of
those files, which keeps the records the one source for tables restated in TypeScript or C.
The check runs as a child process through vite's SSR runner, the same path as the CLI. It
needs the dataset, since three targets are built from records.

### game/data/item-group-writer.keep.test.ts

The seven group ceiling is gone, so an eighth group mints a real `ig-NNN` id.

### game/data/record-file-targets.keep.test.ts

Every check record must resolve to the file it is committed in, exactly; nothing is split by
size, so there are no sibling files to fall back on. Items, actors, dungeons, areas and
locations are filed one file per category, kind, dungeon or world. An event record is written
as a numbered spec, so its file holds `n: <id minus 300>`. A few story rows name neither a
dungeon nor a screen, and event groups spanning two files are refused by design.

### game/data/record-references

Every id one record holds for another, collected off the live registry, each carrying the
record and field it came from. Requirement and presence trees are walked to their leaves,
because a dangling id inside nested `allOf` and `anyOf` hides from the eye.

### game/data/reference-index.keep.test.ts

`referencesTo` backs the delete guard. `check-072` requires three pendants and `check-041`
one bottle, in their own data. No record bakes a Swords group leaf into its static
requirements today, so Swords has no references.

### game/data/regions.keep.test.ts

A region says what a player can walk without asking for anything, so the claims are about a
screen agreeing with its region, never about geography. The region count (239) is one row per
region of the reference generator's four taxonomies. 11 regions carry the boxes of
`kAreaBoxEvents` and 15 the heads of `kAreaHeadEvents`.

The two exception lists are work left undone; shortening them is progress, lengthening one
means a record got worse. The screens with no region outside a dungeon are second readings of
a place held once (the rain, the light world side of the pyramid ledge, the spot the desert
palace east door stands on) or the graph's root. The dungeon rooms no wing owns are rooms two
wings both reach, because the boundary is inside a room the dataset holds whole, or rooms
whose only record is a staircase no room header carries. Wings with no screen are split out
of a room held whole, or corridor wings with no locations. A cave is one place behind one set
of doors, so a cave region's screens share one area; overworld regions are exempt.

### game/data/rom-facts

Every native id on a record, held against a US ROM; without one the suites skip. Nothing here
transcribes a number.

- `CHEST_ROW_EXCEPTIONS` (`check-270`): the chest game's chests are room objects, not rows of
  the native chest table. `OpenMiniGameChest` (dungeon.c:5834) spends a credit, then picks a
  prize by random index. Rooms 0x00 and 0x18 read a rupee table by the room's low byte; every
  other minigame room draws 0 to 7 from `kDungeon_MinigameChestPrizes1`, refuses the index it
  gave last, and treats index 7 as a one time keepsake guarded by bit 0x4000 of
  `dung_savegame_state_bits`. The truthful key is the room plus that mask. The row's screen
  carries room 0x106, which the four chest game doors and the brewery share.
- `SCRIPTED_ENTRANCES` (0): the opening room is entered from the intro script, never a
  doorway, so no slot of the 129 carries it.
- `MOUTHS_NO_SCREEN_CARRIES` (118, 121): fall hole mouths whose landing room a door already
  reaches. Entrance 118 drops into room 0x58 (door entrance 42); 121 into room 0x56 (door
  entrance 40).
- Every room a door opens into is held by a screen. The East Death Mountain caves were the
  last: Paradox Cave holds 0xDF, 0xEF and 0xFF, Spiral Cave 0xEE and 0xFE, Fairy Ascension
  Cave 0xED and 0xFD, and Bumper Cave 0xEB and 0xFB.
- `MOUTH_AREA_EXCEPTIONS` is empty; a new entry means an area is wrong.
- `KEY_GATED_CROSSINGS` counts sides, not doorways: `Dungeon_ProcessTorchesAndDoors`
  (dungeon.c:5069 to 5094) reads the door type of the room the player stands in, so one
  doorway can ask for a key one way and the big key the other.
- `BOSS_TAGS` are the room header tags 37 ("kill enemy to clear level") and 56 (Agahnim).
- A screen with no entrance id is a variant of a room, never a claim on a door. An overworld
  screen with no native index cannot hold a mouth. A room the dungeon map leaves out is an off
  map room.

### game/data/rom-fixture

The ROM is never committed, so `describeRom` replaces the suite body the way
`describeDataset` does. Candidate folders are the ones a checkout keeps a ROM in, plus
`ROTP_ROM`. A file counts only when its SHA1 (after the 0x200 SMC header strip that
`loadRomFromBuffer` does) is `ZELDA3_SHA1_US`.

### game/data/tag-migration.keep.test.ts and tag-records.keep.test.ts

Every tag a record holds resolves to a term its collection may carry, with no raw term left.
The tag seed is complete and lossless: every taxonomy term has exactly one record under the
same label. A missing tag id throws and names the id.

### game/data/tag-writer-convention.keep.test.ts

The writer is what stands between a bad key and the file. Every refusal returns before a file
is read or an id allocated, so a rejected term never burns a number; the root does not exist,
so touching the filesystem would throw.

### game/data/tree-layout.keep.test.ts

One convention: `<collection>/<world>-world/<overworld|interiors|dungeon>/<area-or-floor>.ts`.
Nothing is split by size; a trailing number is a floor, which only a dungeon folder's files
carry. One dungeon is filed in halves (`SPLIT_BY_HALF`), so its rooms resolve to no single
file and must sit in one of the two it declares.

## game/navigation/cliff-preprocessing.keep.test.ts

Room 0x71: lone 0x28 jump triggers beside a staircase produced 1 wide up arrows that Link's
2x2 body can never use. Indoors, a trigger is a real jump only when a perpendicular
neighbour trigger infers the same direction. In the staircase model, row 22 holds triggers
at columns 12 and 13; column 12 is walled three deep on both sides (ambiguous, so it falls
back to south) and column 13 has a wall to the north only, so it infers north with no
matching neighbour and yields no ledge. The fan case is room 0x72's north jump.

## game/navigation/connection-audit-resolve.keep.test.ts

Tag inference for a real crossing the dataset does not map, now done by `inferTags` in
`points.set.ts`. A travel transition is a warp room door destination (header slots 3 and 4,
emitted only when the room has a warp type door), so a walk tag would be wrong on any record
minted from it.

## game/navigation/connection-issues.keep.test.ts

`screen-028` and `screen-043` are `lw-00` and `lw-01`, looked up in
`scripts/generate-ids/output/id-manifest.json`.

## game/navigation/connection-nav-from-flood.keep.test.ts

`ROUND_TRIP` is a compile time guard: the shape the serializer emits must be a valid
`ConnectionRecord.nav`, so a drift in `ConnectionNavData` fails the type check.

## game/navigation/constrain-void-tiles.keep.test.ts

Room 0x72: the lower floor on layer 1 reaches the grid edge through an open south passage, a
bare 0x00 corridor flanked by walls. The void flood used to seed from every boundary 0x00,
walk up that corridor and wall the whole floor (309 tiles). Narrow, wall flanked boundary
gaps are exits and must not seed the void; wide spans must. The model is a void everywhere,
a walled floor in the south half and a 4 wide exit corridor to the south edge.

## game/navigation/dual-layer-ledge.keep.test.ts

Tagging ledge tiles as traversal once made `expandLedgeCross` return no landing cell, so a
ledge drop drew its arrow but never flooded the layer 1 area below (room 0x72). The north
jump case is room 0x72's west walkway: a 1 deep trigger line, where the old check wanted the
whole 2x2 body on ledge tiles; now the leading edge must be fully on ledges.

## game/navigation/palace-index-dungeon-name.keep.test.ts

Pins `cur_palace_index_x2` to dungeon record to destination file stem. The values are the
game's own, doubled (its tables index by `cur_palace_index_x2 >> 1`). Ground truth is the
ROM's dungeon map floor layout table at SNES `$8AF605` (14 entries), corroborated by
`kDungeonCrystalPendantBit`. The editor picks the destination file from `fileStem`, so a
shifted table writes screens into the wrong file; it once shifted by one dungeon from 0x08
up. The first castle has one dungeon record and two palace values (0x00 and 0x02).

## game/navigation/screen-detection-palace.keep.test.ts

A dungeon screen is keyed by `palaceIndex:roomIndex`. On a mismatch the detector still finds
it through the room only palace scan fallback, so a wrong label costs only the exact key.
The three blessed nav baselines (`.claude/nav-baselines/<state>/dump-nav.json`) are pinned to
an exact match. `screen-133`, `screen-119` and `screen-061` are `hc-0x80`, `hc-0x51` and
`lw-13`. Room 0x80 belongs to palace 0x02; the mismatch case reports palace 0x00.

## hud

The HUD layout editor suites. Section numbers (§50, §55 and so on) in test names refer to the
design passes of the layout editor plan.

### hud/layout-bands.harness

The Layout section measuring rig, shared by `hud-grid-strip` and `hud-layout-bands`: SSR the
real components, load the real token, primitive and editor stylesheets into headless Chromium,
and read the boxes at three rails. The rails are the widths that exist: 188 was measured until
the rails became draggable, but `PANEL_MIN_WIDTH` is 220, so no gesture reaches anything
narrower; 220 is the floor, 232 the narrow case, 320 the default.

- The composed block had five bands (title, settings panel, strip, lattice, legend) and now
  has three: the strip, the lattice, the legend. The settings are `LayoutSection`'s own flat
  sub sections, which the `section` cases render whole.
- The block is composed here instead of driven, because SSR renders the initial state and
  nothing in the harness can click. It mirrors `GridEditor.tsx` band for band, and
  `hud-layout-bands` greps that file to prove it still does.
- `probe` runs in the page through `page.evaluate`, so it may close over nothing; every
  constant it needs is declared inside it. A box paints when it has a non transparent
  background or any visible border, and only the section's own chrome is asked; controls are
  meant to be drawn. The legend's key strip is a deliberate sideways scroller, so what is
  inside it is exempt from the overflow check, but the strip itself is not.
- One toolbar row is a 26px button plus 2px of padding above and below. It was 32 while the
  strip wore the toolbar's border; the strip is flat now, so the border went with it. The
  guarantee is unchanged: one row, the same in every state.

### hud/hud-layout-bands.keep.test.ts

The totals half of the Layout section, measured; the geometry is `hud-grid-strip`.

- A grid section measured 689.5 / 689.5 / 637 (§50), 474.5 / 414.5 / 399.5 (§51), 579 / 579 /
  564 (§54), 447 / 447 / 433 (§55), then 455 / 455 / 413 (§56): 8px taller at the two narrow
  rails and 20px shorter at the default. It spent width on section one's three labels and two
  32px alignment tile rows where the 3x3 pad was one 82px square; it bought every piece of
  section one on one line at 320. At 220 and 232 the pieces need two lines, and the gap
  field's 28px is 2px more than the 26px rows beside it. A layout packed by measured width is
  supposed to answer differently at a different width.
- A flex section measured 152 / 124 / 124 (§51 and §54), 150 (§55), 164 then 198 (§56), then
  362 / 362 / 334 (§58), and 358 / 358 / 330 once the strip's 2px sunken well went. The growth
  is a flex manipulation section (title, strip, child cells, legend), Flow as its own titled
  section (because `direction` turns the alignment tiles and a section may not rearrange itself
  when one of its own options is pressed), and section one's second gap cell and Overlay piece,
  which make it the same section under both engines. The grid's numbers did not change.
- Nothing escapes the rail, down to 220.
- The block's band order is grepped out of `GridEditor.tsx`, so a band added, moved or dropped
  fails here instead of the numbers measuring something no longer on screen. §51's
  `persistent` prop, §54's settings panel, its heading box and the strip's old `controls` slot
  must stay gone. `LayoutSection.tsx` mounts four sections in the order Layout, Flow,
  Alignment, manipulation; both manipulation components hang off one slot titled for the
  engine in force, and the two wrappers §54 needed are mounted from nowhere.

### hud/hud-grid-strip

The geometry half, on the same rig. Each claim is one of the maintainer's requests turned into
a rectangle:

- Its own section means a title with a gold rule and the content under it: three titled
  sections under a grid, four under a flex container, named by concern. Flow is its own section
  because `direction` turns the alignment diagrams.
- No box around anything: nothing in the section's own chrome paints a background or border.
  §54 drew three nested surfaces (the block's card, the settings well, the alignment pad's
  well); the only thing that paints now is the sub section rule, a border on the title.
- Section one keeps labels (Type, Overlay, Gap), the same three under either engine, packed
  into as few lines as their measured widths allow: two lines at 220 and 232, one at 320. Lines
  are counted by overlapping vertical ranges, since the 28px gap field is centred against the
  26px icon rows.
- No empty space: the gap piece reaches the section's right edge, within 1px since a `1fr`
  track can land on a half pixel. A grid's two gap fields share one line and clear 50px each
  (54 at 320, 98 at 220); §55 had stacked them because the alignment pad was still in this
  section.
- Every alignment tile has one size, in full lines: a grid's two axes are a line each, and a
  flex container's six main axis values fold into two lines of three above the cross axis.
- The add column and add row `+` sit at the very end of their header strips.
- A flex container has the same two gap fields and the same overlay box as a grid; §57 showed
  the flow engine always spent a gap on each axis and `guide` belongs to any container.
- The toolbar strip is one row in every selection state at every rail. A track used to add an
  81px size field to five buttons behind its chip, 287.4px against a 224px strip at 232, so it
  wrapped; the size moved onto the track's own header. The lattice never moves between states.

### hud/hud-data-compile-expr.keep.test.ts

`compileExpr` is the piece everything above it assumes cannot fail: it never throws, never
hangs, and never lets a document smuggle real JavaScript past the arithmetic the plan promised.
Every nasty input the phase one plan names has its own case. One correction to the plan:
expr-eval uses the words `and` and `or` for logic, not `&&` and `||`; the plan's worked examples
use the wrong dialect, the fixture's `last-heart-gate` is the corrected form, and
`javascript-and` proves the original spelling fails.

- `||` concatenates strings in expr-eval. Left enabled, `life_current || 0` with life at 11
  produced "110", which numeric coercion turned into 110: a wrong number with no error. `&&`
  has no meaning in the grammar and says so.
- `random()` parses and evaluates but gives a different number every call, so a layout using it
  cannot be previewed, diffed or drawn the same twice. It is refused after the parse, because
  expr-eval has no per function switch and deleting it would only turn it into an unknown name
  failing at evaluate time. It is refused nested and as a bare name too.
- An unknown variable name is syntactically fine; which names are known is `validate-value`'s
  job. A second compile of the same text adds nothing to the cache and returns the same object.

### hud/hud-data-resolve-value.keep.test.ts

`resolveValue` is the seam a bad expression cannot get past: whatever `compileExpr` and
`evaluate` produce, this is where `1/0` stops becoming a repeat count of `Infinity`. Each case
asserts the documented clamp or proves the function never throws, since nothing downstream
catches.

### hud/hud-data-validate-value.keep.test.ts

`validateValue` is the hook in `validate-layout.ts` for the phase that gives a `HudBox` field a
real `Value` type. Nothing on the document schema calls it yet, so it is tested directly. An
unparseable expression and an unknown variable are both refused with a message naming the
field and, where one exists, the column, and it never half succeeds.

### hud/hud-data-variables.keep.test.ts

The flat variable table: the fifteen names the plan's data surface lists, the three countdown
names §62 added (for a formula or a switch to read), the three scope extras kept out of the
table, and the scope builder that turns the HUD's vitals fields into the numbers an expression
evaluates against.

### hud/hud-engine-switch.keep.test.ts

Switching a container's engine converts it and cannot crash the editor. The editor applies edits
through `patchNode`, which shallow merges. The switch handed it a new flex container, so
`layout: 'flex'` was laid over the grid, leaving `columns`, `rows`, `justifyItems`, `alignItems`
(unsavable, the validator refuses them) and a grid gap where flex then read one `Value`.
`resolveValue` read `.expr` off an object with none and threw inside the layout pass; nothing
catches above the stage, so clicking flex took the editor down once a gap had been set. Both
halves are pinned: the conversion leaves nothing of the other engine, and the resolver keeps its
never throws promise on the malformed shape, so the next merge bug costs a wrong gap, not the
screen. Since §57 `gap` is `{ x, y }` under both engines (x horizontal, y vertical) and `guide`
belongs to any container, so both pass straight through in either direction and flipping back
restores the grid exactly. The round trip never strands a child outside the new grid.

### hud/hud-layout-documents.keep.test.ts

A built in and a custom layout are the same document. Every shipped arrangement goes through the
loader a player's saved layout uses, so built in is a label, not a second authoring path; if a
built in ever needed something a saved layout cannot have, the format is too short, which the
first case checks by turning a built in into a custom layout and getting identical pixels. A bad
document fails loudly, at the wrong path, and never half draws. Cases edit documents as loose
JSON because they stand in for a hand edited file. `$comment` is documentation for readers and
does not survive into the model. A band is a direct child of the screen (what a `regions` entry
became in §42), so its own alignment is what can be wrong, not an anchor name. The glyph and
sprite cases walk to the first real `glyph` and `sprite` leaves; `hearts` is an id already used,
for the repeated id case.

### hud/hud-layout-bindable.keep.test.ts

Bindable boxes (phase 2 of the HUD data binding plan): `size`, `scale`, `opacity`, `gap` and
`visible` take a `Value` resolved against `MeasureContext.scope` before measuring. The acceptance
proof is the magic bar authored with no new element kind: a sprite whose `size.w` is
`magic_current / 128 * 24`. Its painted rect is asserted through a childless container sibling,
because an element is always contained to its intrinsic aspect while a container's placed rect
equals its resolved box; `measureBox` proves the same width box side. The test screen is three
bands each way with the root in the top left cell, what `anchor: 'top-left'` used to say. A
hidden bar takes its gap with it.

### hud/hud-presets.keep.test.ts

Phase 5 of the HUD data binding plan: the eight prebuilt subtrees, the migration that rewrites a
stored document naming one of the four deleted kinds (life, magic, consumables, wallet), and the
`shape` leaf they lean on (a heart and the magic bar, which a sprite and tint composition cannot
draw; see `hud-shape.ts`). Two inserts of the same preset never collide in ids, with each other
or the template. Original mode rounds a heart's fill up to the next quarter as the console does.
The deleted kind never appears in the migrated document, and a `scale` authored on the old node
survives onto the replacement subtree's root.

### hud/hud-appearance-escape.keep.test.ts

The prerequisite of the appearance phase, checked against what was built. The inspector UX
review blocked `SubsectionGroup` because Escape closed the whole `FullScreenLayer` instead of the
popover in front of it, losing the editor to close a colour picker. §33 fixed the mechanism on a
stand in popover (`escape-layered-surfaces`); this suite proves it on the real chain, reached by
clicks: `FullScreenLayer`, `AppearanceSection`, a `SubsectionGroup` opened from its header (a
collapsed group renders only its summary), `ColorField`, and the `ColorPickerPopover` its swatch
opens. One press closes the picker and leaves the layer; the second closes the layer. The picker
mounts long after the layer, so ordering alone proves nothing; the layer and picker are two
stack entries and closing the inner pops one. A `SubsectionGroup` is not a dismissable surface,
so with no picker open Escape goes to the layer; a group that ate Escape to collapse would put
the editor back where §33 found it. jsdom has no `ResizeObserver`, which the radius row's
`SegmentedControl` builds on mount, so a no op stands in; widths are measured in real Chromium by
`hud-appearance-controls`.

### hud/hud-cell-picker.keep.test.ts

`CellPicker` (§50) is the child's own control and the only place in the panel where clicking a
cell writes anything. It looks like `GridEditor` and means the opposite: it writes a child and
cannot touch a track, while `GridEditor` writes tracks and cannot touch a child. Each says which
it is in its own header. Nothing is written while the pointer travels.

### hud/hud-container-gap.keep.test.ts

§57: a gap is `{ x, y }` under both engines, and `x` is always horizontal. Section one holds the
container's Type and what is true of any container, and pressing Type changed the gap beside it
(two fields for a grid, one for flex). The model was wrong, not the panel: `place-flow.ts`
already spent the one number on two gaps, between items along the main axis and between wrapped
lines (`flow.ts` `linesSize`). So the acceptance test is pixel identity: `{ x: n, y: n }` is what
the engine did with `gap: n`, the migration is a rewrite (the built ins keep every number), and a
legacy document is saved in the new shape. What is new is that the two axes can differ on a flex
container, pinned at exact positions and turning with `direction`: a row separates items by `x`
and lines by `y`, a column the reverse. A row that does not wrap has no second line, so only the
item gap is spent.

### hud/hud-countdown-node.keep.test.ts

§62: the HUD countdown as a layout element. The kind validates and refuses at the right path; it
measures as the pixel pie's 44x44 box, and both pie compounds agree; it is not placed while
nothing counts, leaving a flex line and a grid as `visible: false` does; a `switch` reads the
three new variables through `expand`; its drawn origin snaps to whole game pixels (an odd view
width centres it on a half pixel) for this kind only; and a parsed UI state buffer reaches a
rendered pie in the shipped layout with no store. It spans the whole screen grid only so it sizes
no track, so it is not counted as a grid occupant (that would mark all nine cells taken, found on
the grand merge test run), except in its own cell picker.

### hud/hud-drag-gesture.keep.test.ts

Preview, then commit: a drag writes the document once. §37's stage nudge called `onOffset` on
every pointer move, so a one second drag was dozens of writes and relayouts, and would be dozens
of undo entries. §43 closed it in `behavior/useDragGesture.ts`. The stage nudge is gone (§47), so
the gesture is driven through the outline's drop, the hook's remaining caller: twelve live frames
write nothing while the ghost card says what the release would do, and `onDrop` fires exactly
once, after release. Cancel is free: Escape mid drag leaves the document untouched and reaches
the drag first (§33's `drag` level). jsdom has no `PointerEvent`, pointer capture or
`elementFromPoint`, so a `MouseEvent` under the pointer event names carries `clientX` and
`clientY`, capture calls are optional by design, and the hit test reads a flat list of fixed
height rows as `hud-drag-ghost` does.

### hud/hud-motion-preview.keep.test.ts

Phase 10's stage integration, mounted: the scrub reaching the clock, and the Escape interaction.
Everything else in Motion is what gets written to the document, answered as pure functions by
`hud-motion-controls`. The transport is a `requestAnimationFrame` loop on a shared clock and a
key eight surfaces used to fight over. A playing preview registers on the dismiss stack at
`dialog`, so Escape stops playback and the editor stays up; a second press closes the editor.
With no transport use the stage gets `null`, not 0, so it runs its own free clock and existing
animations never freeze at t=0. `matchMedia` is stubbed because jsdom has none and
`useReducedMotion` reads it; one case turns reduced motion on, and then the stage gets no
override and holds the rest pose. The hook is imported from its own file, because the renderer
barrel pulls in the art layer, the input libraries and `window.api`.

### hud/hud-node-style.keep.test.ts

Phase 4 of the HUD data binding plan: the box grows a face. The document side has
`validateLayout` refuse a bad `style` and a grid container's own fields; the render side has
`resolveNodeStyle` turn a validated style into CSS, with `outline` and `tint` combined into one
`filter`. The outline width cap makes 999 and `OUTLINE_MAX_WIDTH` resolve to the same filter.

### hud/hud-stage-select-only.keep.test.ts

The stage selects and nothing else (§47). After §46 the maintainer could still drag on the full
layout preview; §37's margin nudge and the corner scale handle are both gone (a resize is a drag),
and `scale` and `offset` are edited in Size and Box and Placement. Absence of a test cannot prove
the stage no longer drags, since a `pointermove` handler could return unnoticed, so the gesture
is still driven (a press, six frames of 6 display pixels, a release) and the suite asserts no
write, the node still selected, and no snap guide, scale handle, drop surface or ghost.
`StageSelection` is mounted with no write prop at all, so a drag would have to grow a prop, which
is a review. A click is a click: an unselected box, a container and the screen root all select on
pointer down the first time. The source may contain no other pointer handler and neither drag
hook; it still names `behavior/offset.ts` in prose, so only the import is forbidden.

### hud/hud-editor-step.keep.test.ts

§55 built `StepNumberInput` (a `ValueInput` with its spinner hidden and its own buttons) so a gap
could move by the editor's step; `ValueInput` already took a `step`, so it was replaced. The
editor step context reaches `ValueField`; an explicit `step` beats it, since a 0 to 1 fraction
nudged by 8 is as broken as a gap nudged by 1; the default outside a provider is 1, as before
the context existed. Every `ValueField` call site is read off disk and checked: a value in HUD
pixels takes the session step, and anything else (a count, an angle, a duration, opacity, an
amount) passes its own. The lists are the review, kept as code so the next field must join one.
`StepNumberInput` stays deleted and the CSS rule that hid the spinner went with it.

### hud/hud-layout-section-one.keep.test.ts

Section one is byte for byte the same section under both engines, except which Type button is
lit (§58). The maintainer's rule: nothing in a section may change when another option in the
same section is pressed. §56 asserted the breakage as a feature (a different gap cell count and
a grid only overlay), which is why six rounds passed every gate and were rejected. So section one
is rendered for a grid and a flex container, the two `aria-pressed` flags and the lit class are
stripped, and the markup must be identical. The cut is at the second sub section's wrapper,
because that wrapper carries the next section's label (Alignment or Flow). Alignment belongs to
section three. §57 gave `ContainerOverlay` a flex drawing, so the overlay is offered under both
engines. Both engines mount a manipulation component that asks the platform for the modifier
key's name, hence the platform stub. Behaviour is `hud-grid-settings`, geometry is
`hud-grid-strip`, and the stage's reaction is the e2e layout options specs.

### hud/hud-stage-cells.keep.test.ts

The stage's grid drawings cover the grid they draw. `gridCellRects(container, box, unit, ctx)`
wants `box` and its answer in one space, with `unit` that space's pixels per authored pixel. The
stage echo and grid overlay passed the game pixel rect with the display scale as `unit` and
painted the result as display pixels. Fixed tracks came out right; the area a `fill` track shares
stayed in game pixels, so the grid drew at `1 / displayScale` of its size, 72% at the editor's
~1.39. The older echo test missed it twice: it computed its expectation with the same wrong call
and had no `fill` track. So the property is asserted against a rectangle that does not come from
the solve: all cells together are exactly the container's placed rect at the display scale. One
case shows what the old convention produced. A grid inside a scaled subtree (the compact layout
at 0.75) solves with its own unit: a 124px authored band is 93 game pixels wide.

## input/haptic-gates.keep.test.ts

Two gate layers must both pass for an in game event to rumble. The C master gate is
`kFeatures0_Haptics` (bit value 1048576, matching `features.h` and
`live-settings-flags.ts`), reached through the boot INI `Haptics` key and the live push.
Then seven granular gates in the haptic service, one per event category. Spin attack
release shares the sword swing toggle, death shares damage taken, and the mirror warp
polling path shares environmental effects.

The suite advances `performance.now` by a large step on every read, so the per pattern
cooldowns (module state that persists across cases) never block a fire. It asserts gating,
not debounce timing.

## input/slot-list.keep.test.ts

Slot numbers are contiguous, so removing slot 2 makes the old slot 3 the new slot 2. The
assignment table is keyed by number, so `remapAssignments` must move each assignment with
its slot, or an item lands one button up without warning.

## input/slot-migration.keep.test.ts

`fixtures/spc2-profile.json` and `fixtures/spc2-assignments.json` are a real profile written
before slots were numbers: twelve slots keyed by SDL position and eight assignments keyed
the same way, four of them on shoulders and triggers. `fixtures/sdl-order-profile.json`
stores its list in SDL device order (SOUTH first). The fixtures sit in the tracked
`tests/fixtures/` folder so every clone has them.

Position is display only; the slot number is the identity. A binding and a position need
not describe the same device (slot 1 is drawn as NORTH and driven by the W key). The slot
list is migrated when the profile is read and the assignment table when the settings are,
so the second call sees a list whose old ids are gone; old ids are rebuilt from `position`
and from a key binding. The boot path runs the migration more than once, so it must be
idempotent. A list that already carries numbers is the player's own order and is never
sorted again.

## input/slot-prefill-order.keep.test.ts

A HUD layout and a control scheme are joined only by the slot number. The built in HUD
documents put slot 1 on the north face button through slot 8 on d-pad right. SDL reports
its buttons from SOUTH, with the d-pad before the face cross is finished, so prefilling in
device order would draw every shipped layout with the controls permuted.

## input/vibration-shaping.keep.test.ts

Shaping compensates for how each pad's rumble feels and only touches magnitude, never
duration. Xbox dual rumble is linear and soft at low magnitudes, so it boosts onto a floor
(0.3 plus 0.85 times the magnitude, clamped at 1). Switch HD rumble already feels strong, so
it stays unchanged.

## parallel/automation-launch.keep.test.ts

The automation predicate decides whether a launch may write the shared configuration
(default profile, window position). It must answer yes for every automation flag, even a
run without `--instance`; a false no lets an agent run repoint the user's profile. The two
shared files are `app.json`, written by `loadProfileForGame` on the `--auto-state` and
`--screenshot` paths, and `window-state.json`, written on close.

## parallel/link-deps.keep.test.ts

`git worktree remove --force` walks into a junction and deletes what it points at; it once
emptied the real `.claude`. Links must be detached first, without touching their contents,
and the test detaches before its own cleanup for the same reason. The production
`LINKED_DIRS` list is empty now, so the test passes a made up directory name explicitly.

## parallel/verdict.keep.test.ts

The case that matters is the refusal: uncommitted or unlanded work must never come out as
claimable or deletable.

## story-events/core-harness

The headless core harness loads a built core in node with no window. It gives RAM reads and
writes, save state loads, frame exact scripted input and a hash of the game state. Two cores
load side by side (this build and a master baseline) and run the same script, so "same
result" is a byte compare. SNES WRAM is 128 KB and the battery block sits inside it at
0xF000. A frame refused by the developer tools gate throws. `hash` can zero ranges out of
the digest, such as the event ledger.

## story-events/t1-parity.keep.test.ts

With every story field at zero, this build and a master build produce identical WRAM after
the same scripted input on every save state fixture: off, nothing observable changed. The
script idles, walks, acts and idles, enough to cross a transition on most fixtures, and the
frame counter at 0x1A must move so the script provably ran.

The baseline core is built out of band and the suite skips without it. Point
`ROTP_BASELINE_WASM_JS` at a master build's `zelda3.js`, or build one into
`.user-data/baseline-core` with
`git archive origin/master core scripts/ensure-wasm.mjs package.json | tar -x -C .user-data/baseline-core`
and then `node scripts/ensure-wasm.mjs` inside that folder, with the emsdk environment active.

## story-events/t6-tracker.keep.test.ts

The tracker's event records resolve from a synthetic heap: ledger bits, vanilla bits, the
derived pass and the older file fallbacks, with no game. A ledger event answers from its own
bit alone; a later story beat never stands in for it.

## platform/primary-modifier.keep.test.ts

On macOS and iOS the primary modifier is Cmd alone; a bare Ctrl means something else there.
An unknown OS accepts either key, because the web host reports `os: 'unknown'` and guessing
Ctrl would break Safari on a Mac.

## randomizer

### randomizer/ap-fake-core

An `OnlineCore` that records what the client asked of it. Its poller runs the real baseline
decision (`poll-rebaseline.ts`) once, as the first tick would, over the checks the test
declares complete in the save. A queued item is granted at once unless `holdGrants` is set;
then it waits until `grantNext()`, as the delivery queue holds it until the player can
receive. `notReady` names items the game cannot take until `becomeReady()`. A save swap
(`setInPlay`, `swapSave`) fires the client's `onSaveSwap` listener, as a state load or an
entered file does. A delivery with a null sender is an item the server itself sent. A kill
while `down` answers `down` and is not counted.

### randomizer/ap-fake-module

A stand in for the Emscripten module that records every `ccall` and every file written to its
virtual FS. What a session arms is exactly this record, so two sessions recording the same
calls set the game up the same way. Reads (`WasmGet*`, `WasmCanReceive*` and the like) are
kept apart. `WasmLoadSessionDialogue` adopts the last blob written to its file and returns
its line count, as the core does. Every `_Wasm*` export exists, so an export probe answers
yes. The bridge's own setter is passed in, because importing the bridge here would load it
too early.

### randomizer/ap-fake-server

An in process multiworld server: every socket the client opens lands here, and it answers as
a real room does (RoomInfo on open, the data package, Connected then the full ReceivedItems
list, scout answers, Sync, data storage reads, `!players`). A Connect with the Tracker tag
makes a tracker socket answered with the named slot's own locations; a second socket while
the game's is up counts as a tracker until its Connect says otherwise. A Get of
`_read_client_status_<team>_<slot>` returns the slot's status, or null when the room fills
none. `!players` through Say returns the chat echo, then the CommandResult line. Every
message crosses on a microtask, like a network hop. Nothing touches a disk or a profile.

### randomizer/ap-protocol-harness

The shared setup of the multiworld client tests: a two player room, a client booted against
the fake server with a recording core, fake timers and a stand in `localStorage`. Each test
file still mocks the log bus itself, since a mock is hoisted per file.

### randomizer/ap-solo-room.ts

A local placement served as a one player room: the slot data a world package would send
(options, rolled values and, when given, the deliverable spots) and a scout answer holding
every location's item under the frozen Archipelago ids. It is what a solo multiworld of the
same seed looks like to the client.

### randomizer: suites in node

Several suites stub `window` with an `addEventListener` before a dynamic import, or mock
`@app/lib/log-bus`, because the real log bus installs window error handlers on import and
node has no window.

### randomizer/ap-deathlink.keep.test.ts

DeathLink follows the slot data over the profile flag, and a slot from another world package
version is refused. Only bounces tagged DeathLink count; the network ping is a Bounce too.
When a fairy revives Link, the core reports nothing and clears its room kill flag.

### randomizer/ap-ids.keep.test.ts

The Archipelago id tables are complete (every location of the widest world and every item any
option can pool has an id; no story event has one), unique, and frozen: a digest over the
first `FROZEN_*` ids of each table pins them. Appending ids leaves the digest alone; editing,
reusing or removing one fails, because generated seeds carry those numbers. After an append,
raise the count and the digest together. The location digest was repinned once for a rename
that kept every id and name: the 155 shop keys moved from a shelf's check id and its restocks
to `<shop>-shelf_<side>-slot_<n>` (previous digest
`736690669490347d1fa78bcf312613bccf0ef65db28c5f02c7978f1ebb55c9d9`).

### randomizer/ap-online-core.keep.test.ts

The real online core runs against the recording module. The online bits of gate word 5 live
exactly as long as the session. A location holding another player's item arms the icon id of
that player's game (Ship of Harkinian plays Ocarina of Time, so the ocarina's picture, at
`0xB0` plus its place) with a line naming the item and who it went to. The sentinel and the
icon ids are pinned to the core's own definitions in `foreign_item.c`. A queued grant reports
itself granted only when the core confirms it. The room's checked locations show done in the
tracker and leave the poller for good, with no game flag written: a shelf's first stock ticks
the shelf's record, its restock has none to tick, and the poller's baseline never reports a
suppressed key. Modules that call the bridge at load are imported first, so the bridge
finishes loading before those calls.

### randomizer/ap-session-parity

A local seed and a one player room serving the same seed must set the game up identically.
Both sessions run against the same recording core. Every override, gate, table and file the
core is handed, plus every receipt line composed and every icon set applied, is the armed set.
The two sets must match call for call and argument for argument, in any order.

The one planned difference is the online bits of gate word 5: each online write carries
`kFeatures5_ApOnline`, and with it masked off the word is the local one. A room names the
item and its owner in a foreign line, which a local seed cannot, so the names are replaced
before comparing. The room recounts its spheres over the items it holds, so a handed away
case skips the sphere count.

The shipped defaults already open character checks, world items, key drops, a custom capacity
pond and progressive custom capacity, so the other cases each move one of those. The last
case carries its spots through slot data the way a player file hands them to the server, as
every other probed spot, so a client that ignored them would arm more. The quiver has no
record: it is placed like any item and arrives as the single arrow receipt (`retro_shelf.c`),
which the game reads as the bow's quiver. The foreign case puts another player's item on every
pond rung, every pond prize and the first shop shelf; the local seed carries `item-foreign`
at the same spots and no setter may refuse the sentinel. No pool icons load, so the room arms
the plain sentinel, the id a local seed arms. Composed dialogue and icon sets need a real
asset blob and ROM, so they are mocked; what the session hands them is what must match. The
preload API answers every call with an empty list, so no file or profile is touched.

### randomizer/progressive-tier-generation.keep.test.ts

A returned placement is the proof of beatability: `generatePlacement` returns one only after
the sweep collected every location and reached the goal, so a tick set that rolls thirty seeds
in a row plays. A set that cannot be rolled is refused up front, naming the rung, because a
load bearing rung left out would make a seed with no ending. The blade rungs used to be on
that list. The core now has the stand ins of the reference's swordless mode: a hanging cloth
door can be pulled down, and the hammer breaks the tower's seal and lands on the last fight.
All four blade copies are vanilla items of character checks, so with those checks out of the
shuffle the pool never carries one and a tick has nothing to take. Only with both scope tables
shuffled can the blade ticks reach anything.

### randomizer/pond-core-probe

A headless probe of the rupee pond's seams. The built wasm loads in node with the user's
asset blob, a save state fixture puts the game in a room, and every seam runs with the pond
gate on and then off. Each file loads its own core, since every case arms its own gate and
plan. Skips without the wasm, the asset blob or the vault fixture, so a clone without them
stays green.

- Price, amount taken, bank income and purchase wait are the plan's values with the gate on
  and the vendored expression's values with it off. An empty plan under the gate leaves the
  pond native.
- The plan every case reads has three throws: a prize, a capacity sale, a throw that wins
  nothing. Host lines are left unarmed (`-1`), so a seam that shows a message shows the
  vanilla one from the baked dialogue blob; the line seams are pinned through the read only
  probes. The purchase seam restores the module bytes its message moves.
- Throws resolve in order and the save counter climbs once per throw, so a prize is handed
  over once. An exhausted pond names a price no wallet holds (`0x7fff`), so the handler
  closes it. A taken prize reports its ordinal in the high half of the result.
- A capacity sale climbs the tier. At the ceiling it hands back nothing, since the vanilla
  hundred rupee refund would make a cheap pond a money press. A throw that wins nothing hands
  back its refund, which is below its price, so it cannot be farmed either.
- The gems a throw shows decompose the amount paid: 427 is one gold, one silver, then red,
  blue and two greens, three decoded sheets, so the toss waits 240 frames. One volley carries
  every denomination sharing its decoded sheet, each under its own receipt: 75 is a violet
  alone (it needs its own sheet), then red and blue together; 27 is red, blue and two greens
  in one volley. The pond's ten flying gem slots (`variables.h`) fill from the top down.
- The vanilla cost prompt quotes the plan's price in the BCD its number commands read (75 is
  `0x75`, not the native `0x50`). The baked line holds two digits, so a price past 99 leaves
  them as vanilla wrote them and the composed prompt states it. Exhausted, or with the gate
  down, the digits stand untouched.
- The award line says whether the water still holds a prize. A throw that sells a capacity
  level keeps the vanilla question, because the choice is real. With nothing composed the
  vanilla question stands for every throw.
- The purchase holds the player still through its closing palette fade. The prize goes out
  through the receipt ceremony, whose cleanup frees the player, and walking out of the fade
  leaves the room's colours in the player's palette row for good. An exhausted pond still
  holds the player, because the plan still owns the pond.
- A losing throw carries its own consolation, because the vanilla line promises a flat
  hundred back and this one hands back half. The plan's lines replace vanilla wording only
  where one was composed. Only an exhausted pond takes the closing line; a wallet too light
  for the current price keeps the vanilla "not enough rupees yet" refusal (`0x14c`).
- WRAM addresses come from `variables.h` and the hook owned registry in
  `core/game-hooks/save_bytes.h`.

### randomizer/pond-generation

Generation with the pond in the shuffle. Every slot is a real location named for its pond and
its number, every mode is beatable over many seeds, the prize slots carry pool items, and the
wallet rule gates them. A placement that comes back at all is beatable, because the sweep
inside the generator already proved full access and the goal.

- A wish pond's own pair is rungs 1 and 2 of her ladder, so a check record answers to those
  two names, and her candidates are her ladder and nothing else. The capacity pond answers in
  two named family ladders instead, so none of its plain rungs may be a record's name, or a
  tier and a rung would share one. The vanilla grant flag cannot move which slots exist under
  Custom, since that is the pond's own ladder.
- At Vanilla grants exactly the produced items leave the pool; what she takes in trade stays
  findable.
- The beatable sweep uses a wide price range so the curve really has eight throws to cut.
- A dear pond under the lowest wallet a seed can roll with has its range pulled down to what
  that wallet holds. The wallet asks for 0 and reads 599, the floor a fixed 500 rupee purchase
  in the price table sets, so a 900 to 999 range is held at 500. The wallet starts empty and
  climbs on its one upgrade, so the prizes are out of reach until it is collected. The pinned
  property is that the pond never asks for more than the wallet can ever hold.
- The shared switch makes the generator build the wish ponds' rungs from the capacity pond's
  ladder. The rows each pond holds are untouched, so the switch is reversible.
- The Brewery lock takes the pool's only Red Boomerang, so her second red displaces a filler,
  never the blue one she needs.
- Pond demands are drawn from the seed, so what the options panel previews before generation
  is byte for byte what the placement carries, retries included. The panel calls the same
  function with the same probe sets. A seed that needed a second attempt is the case the roll
  used to get wrong; pick fresh seeds if the fill ever stops retrying on these. An attempt
  seed (`#retry1`) would move every rung if it reached the roll. The mixed ask profile ticks
  every ask row and keeps both wish ponds out, so every rolled rung belongs to that ladder.

### randomizer/pond-model

The pond model: the rupee decomposition, the modes' schedules, the snapshot adapter, the
wallet reading of a prize, the pond's own receipt lines and the item demand.

- 999 is three gold, one violet, then two red, one blue and four green; the small values
  share a decoded sheet, so it flies in three volleys. A volley never holds more than the
  pond's ten slots.
- A snapshot with no pond row reads as the baseline pond, and a mode the model no longer
  offers reads as the legacy pond with a note.
- The receipt lines (the price of a toss, a prize award, an emptied pond) quote the plan's
  real amounts, because every vanilla line they replace names an amount no plan charges or
  asks a question no plan puts. Vanilla cost charges the same hundred fourteen times and never
  pays back, so it needs one price line. The composer keeps the fullest candidate that fits
  three rows and falls back down the list, so the last candidate must fit at every amount the
  ladder can reach: 63 characters, measured at 164px.
- The fixed schedule tops out at a hundred, and no reachable wallet sits below 599
  (`capacity/wallet-floor.ts`), so it is never held to the wallet; a 299 wallet reaches it
  too, so no ceiling is written.
- The item demand names only items the player holds and the core can test, ranks the pool
  early to late, and with nothing eligible falls back to another ticked kind, then to a free
  rung. The pool the roll reads is keyed by id, so a fallback test pool is built from ids; a
  name in it would name no record.
- Each demand kind has one ramp: it reaches its own two ends at the same two rungs, is
  monotone, and always stops on a stop of that kind's own ladder.

### randomizer/potion-price-rule

Guard: no shelf is ever priced in something the file cannot buy back. The hut's three
cauldrons are the only repeatable source of potions, and a bottle price consumes its content,
so a restocked shelf asks again. A cauldron handed to the shuffle takes its potion out of the
game, and any shelf priced in that potion would be unpayable. The suite walks every reachable
pairing of the shop scope and the price rows (with every price row ticked, the choice that
exercises the mask hardest) and proves the hole is closed three times: the rule masks the
row, the frozen snapshot carries the mask, and the roll refuses the content even when a hand
edited snapshot claims otherwise. The guard asserts that something was rolled and something
was blocked, since it is worthless otherwise.

- The mask is not an overwrite: the choices never lose the tick, so dropping the cauldron
  restores the row. Price rows follow the price list's order, not the cauldron list's, so
  blocked rows are compared as sets.
- The bottle rule reads the wallet ladder off collected upgrades; a file with no upgrade
  stands on the native rung, which holds any cauldron price. The bottle count is the group
  count, as the real state answers it, so holding a bottle at all means a count of one.
- A pond rung may ask for up to four bottles at once, handed over together, so three bottles
  cannot pay a demand of four. No amount means one bottle, which is what a shelf asks and
  what every placement frozen before the count means.

### randomizer/world-from-records

What the records already answer for in the engine's world, and what they still cannot. The
region collection is the engine's region list (239 regions, the whole graph the engine
walks), a check says which region it sits in, a dungeon says which wings it spans, and the
passages between regions are one rules table. Order matters as much as the set: the prefill
and the normal placement both walk the region map and each dungeon's wings, so the
collection's id order must be the order of the reference's four taxonomies, and a dungeon's
array order must be its create order.

- Which rows a seed fills is a record question. One rule over kind and scope
  (`world/seed-locations.ts`) picks 261 spots out of the 594 rows. Nothing states the set
  twice, so the suite pins it by count: the whole world (255 with key drops on, which is those
  rows minus the pond pairs; 222 with key drops off, since that option invents 33 spots), 8
  story events each in its own record's region, each dungeon in create order, the shelves the
  shop scope opens and the ladders a pond sells. A number moving means a record moved.
- Three places the reference holds as regions of the world and not of the dungeon stay out
  of the dungeon lists: a secret room under the first castle and the two bomb walls in the
  last cave. A dungeon's list decides which items its prefill restricts.
- The records flag the regions impassable while transformed, by the names the reference uses.
- One thing is still stated beside the engine, because no record can answer for it yet: which
  crossing a passage is. A connection record is a physical crossing; a reference exit is a
  logical one with its own rule and name. 205 of the 392 passages join a pair of regions that
  exactly one crossing joins, so those carry its id. The rest cannot: a mirror spot, a retry
  from the menu and a wing boundary inside one room cross no tile, and a pair joined by two
  doors cannot say which door a passage is. The gap numbers (439 crossings no passage makes,
  at most 23 placeless rows, at most 16 regions no screen carries) are what the tree measured.
  Lowering a gap is progress and still passes; raising it means a record got worse.

### randomizer/progressive-tier-probe.keep.test.ts

The built wasm is loaded in node the way the capacity probe loads it, a family's mask is armed
the way a session arms it (`WasmSetProgressiveTiers`), and the virtual id (0x62 blade, 0x66
bow, families in `progressive_grants.c` order) is resolved through the grant resolver as a
seam would. A copy hands over the lowest rung still present at or above the tier held, so
unticking a middle rung shortens the ladder. Past the top rung a copy is twenty rupees. A
family with nothing ticked puts no copy in the pool, so a zero mask means never armed and
gives the whole ladder back, which keeps a silent session byte identical. The bow byte keeps
the arrow state in its low bit, so 3 is the top rung held. Skips without the wasm, the asset
blob or the vault fixture.

### randomizer/ap-online-connect.keep.test.ts and ap-online-recovery.keep.test.ts

A server that is down at the first connect is retried on the backoff with a countdown; a
refusal is not retried. An item at a negative location is the server's own, even when this
slot asked for it. The save in play is bound to the room at Connected and after every save
swap, before any check or item crosses; a save of another room ends the session with nothing
sent. The received index moves only on a grant, every save swap asks for the list again, and a
location the save shows done is still not reported again by a reconnect's baseline.

### randomizer/ap-quiet-receipts.keep.test.ts

With a kind's option on, a delivered rupee, bomb or arrow goes in through
`WasmGrantQuietReceipt` (answering 1 granted, 2 not quiet) with no receipt line; a placed one
is armed with the silent line. Under the retro bow the single arrow is the quiver, never
quiet. When the core says a queued receipt is no longer quiet, the ordinary receipt runs.

### randomizer/ap-receipt-burst.keep.test.ts

A goal's collect sends every remaining item in one packet. Each item's line is composed when
its delivery reaches the front of the queue, so 200 items each show their own line, while the
ring of 32 never holds more than the delivery in flight. A progressive item's detail page
keeps its id and bytes through the burst.

### randomizer/ap-report-coverage.keep.test.ts

A session sends a location from one of two paths: the substitution seam (an armed override's
fire id) or the poller (a plan detection, or the tracker's sweep). A location with neither can
never be sent, so the room could never finish. The default options match the first two game
test room (341 locations). The tracker's check total must equal the room's location count;
events and status rows stay listed but are not locations. After a collect, shop restocks and
pond rungs read the taken set, since they have no record.

### randomizer/capacity-pond-rule

The pond is the only native source of the explosives and projectiles upgrades, so a family
left Vanilla while the pond hands out pool items would have no source anywhere. The suite
walks every combination the two tabs can reach, settles it, and proves the hole never
appears, settling is stable, and every control still offered leads to another sound pair.
Under the retro bow every shot is paid for, so the projectiles family reads Vanilla and needs
no source. A Custom family carries its ladder in the seed and asks the pond for nothing.

### randomizer/dialogue-charset.keep.test.ts

Every character an Archipelago name can hold encodes to a real glyph (the language's own, or
an extra glyph in a spare font slot) or to a documented fallback: an accented letter to its
base letter, a bracket to a parenthesis when no slot is left, anything else to a question
mark. European fonts have 16 spare slots for the 21 characters they lack, so five fall back.
An extra glyph packs as two 2bpp tiles, top then bottom; plane 1 is the body and plane 0 the
edge ringing it.

### randomizer/hook-save-bytes.keep.test.ts

`core/game-hooks/save_bytes.h` is the source of truth with its own `_Static_assert`s, which
only fire on a core rebuild and cannot see TS. The test parses the header's flat
`#define NAME 0xHEX` lines; generating the TS instead would only move the drift to a stale
artifact.

### randomizer/key-drop-size.keep.test.ts

The core matches a drop override on room and drop size, so a key drop armed at the wrong size
never fires and the vanilla key is granted. A drop whose vanilla item is its dungeon's Big
Key is armed large, every other one small.

### randomizer/location-names-closed.keep.test.ts

Every spot of the world is a check row (`world/seed-locations.ts`), so the world the graph
declares is the set every id keyed table must agree with. Most tables reach the rule
registry, which throws on an unknown target; the tables listed here do not, so a stale id
would sit there unnoticed. The declared set is the widest any option opens (key drops on,
every pond selling its whole ladder). The bunny list exempts two story events alongside its
locations. A rule table may hold only passages and events. A pond slot is a location only
where a pond sells it, and Normal sells none.

### randomizer/option-wiring.keep.test.ts

The creation panel and the profile writer once built their overrides separately, so a row
wired into one froze silently. Both read `randomizerChoiceOverrides` now, and the suite walks
the whole catalog by value, since a missing field still puts its key in the map with nothing
behind it. The price block's percentage is a number, every other key a tick. The base fixture
pins the shop mode to vanilla, because a fresh profile starts shuffled; the shop cases stock
one purchase per slot.

### randomizer/plan-covers-placement.keep.test.ts

Every location a placement names must appear in the physical plan as an entry or an explicit
error; that gap once let shuffled dungeon prizes vanish between generation and the session.
Shop slots reach the session through seams of their own (the hut and the bomb counter too),
so every mode and both depths are pinned, and a shelf slot must never be an error row.

### randomizer/pool-listing-sprites.keep.test.ts

Two hops leave the options panel drawing placeholders over sprites on disk. The panel renders
inside the profile creation form, possibly with no active profile and no ROM picked, so
`spriteRomOf` lets a ready ROM stand in. And every sprite an item record names must be one the
extraction writes, or the row asks for a URL that 404s over `app-sprite://`.

### randomizer/progressive-tick-consequences.keep.test.ts

The consequence lines are the panel's live reading of `derivedItemPower`; for any tick set,
the switches the derivation masks on must be exactly the ones the visible lines stand for.

### randomizer/receipt-highlight.keep.test.ts

Every composed line marks what was found in the primary highlight and who it came from or
went to in the secondary one. The composer turns the markup into the core's highlight bytes
(`core/game-hooks/dialog_highlight.c`), measures it as zero pixels, and reopens a span at
every row break. The two colours default to the app's gold and green, snapped to 15 bit
colour as the core's own defaults are.

### randomizer/shop-slots-panel.keep.test.ts

The count control was once fed the stored slot count, which custom mode never reads, so it
sat still while the ticks moved. In custom mode the opened set is the ticked set, so a slider
would always sit full; the modes the ticks alone decide show a read out. A new profile ticks
every shelf slot and the bomb counter; the potion seller's three cauldrons start unticked,
since a cauldron holding a shuffled item is opt in.

### randomizer/rule-parity-harness and rule-node-parity.keep.test.ts

The guard that the rules answer exactly as they did before they became node trees
(`world/rules/rule-node.type.ts`). The digests were captured from the closure only engine:
every location, story event and exit rule, asked over 5000 seeded random collection states
per option set (mulberry32, so the states repeat on every run). Half of the states see a
random fill seam, so rules that read placements answer both ways; `actRecord` attaches a
random record of done acts, as a world built from a save does. The generation half pins whole
placements for 20 seeds; a placement digest spells out maps and sets so every entry counts.
The export half inlines every derived helper down to the primitive list, sends the trees
through JSON and back, and asks them beside the engine's own rules.

A digest moves on purpose only when a rule is meant to change; recapture it in the same
change and say which rule moved. Recaptures so far were renames that moved no answer: event
slots keyed by item check ids becoming ledger event records, shop purchases keyed by shelf and
slot, the flute and floodgate slots becoming story events, the event pairs becoming story
events of the world (the capacity shop token went too; only the "capacity vanilla" rule digest
moved, and no placement), the Activated Flute (`item-075`) becoming an ordinary item, the Flute
becoming the Progressive Ocarina family (`item-179`), and the placement stats dropping
`capacityShuffle`.

## regression

The regression net. `run-snapshot` records what every save in the corpus reports into
`.user-data/net/<ROTP_NET_LABEL>.json`; `run-compare` holds the current snapshot to the
baseline, allowing exactly the rows `expected-changes.data.ts` declares. Take the baseline
with `ROTP_NET_LABEL=baseline` before a change and `ROTP_NET_LABEL=current` after, then run
the compare with `ROTP_NET_BASE` set. Without a label the snapshot writes nothing, and without
`ROTP_NET_BASE` the compare skips, so a bare `vitest run` never compares two stray files.
Both only read saves.

Everything is keyed by id, never by name, so a rename cannot hide a behaviour change; the
`names` map is the one name column and is compared on its own. A placement is compared by
id for the same reason.

### regression/corpus

The save states and seeds the net runs over are discovered, never listed: every quick and
manual save of every profile under `.user-data`, and every save state fixture. The four npc
and four world item spots in the key drop seed are the ones the net proves deliverable, and
every pond's own pair is proven deliverable so no pond is held back. Seeds are append only:
removing or editing one makes every stored baseline unreadable for that seed.

### regression/expected-changes.data.ts

The rows the current step may move and the names it may change. A refactor step leaves
every list empty and must move nothing. A behaviour step writes its rows here before it
runs, so the change is reviewed next to the code. A difference is never accepted by
regenerating the baseline; the baseline would learn whatever the bug did. `save: '*'` covers
every save, and `because` is read in review, not by the test.

The current baseline is `story-events-floor`, captured on 2026-09-27 after the Archipelago
merge. The story events stopped being locations of the world, so their rows read the
dataset's own record like every other event row (`lib/game/tracker/tracker-statuses.ts`).
`check-335` (Frog found) now asks for the Titan's Mitt, where the seed engine asked for heavy
lifting from what the seed's completed locations handed over; seeds only. `check-329`
(Agahnim 1 beaten) asks for a sword and sight inside the tower, where the engine also asked
for the tower's four small keys.

Dropped locations are taken out of the baseline's locations and spheres (an emptied sphere
goes too) and out of the stats counts. New checks are dropped from the completed list so a
new record that steals an existing row's bit is still caught. The `reachableScreens` column
may move wholesale only for a step that changes how it is derived. Declared screen additions
are allowed; a screen leaving the column is a loss and is never declarable.

### regression/run-snapshot.keep.test.ts

The core is armed as the app arms it: gate word 3 gets the tracker query export (1024) and
gate word 5 the default story word. Normal reads through the same engine as a seed, over the
placement where nothing moved. The event ledger is handed to availability, as every app path
does; without it an act reads as done the moment its means are in reach.

## search/catalog.coverage.keep.test.ts

The compile time guard for the catalog is `PROFILE_HUB_TABS: Record<ProfileHubTab, ...>`;
this suite checks the built catalog at runtime. The title bar menu reads
`window.api.isDev` while the catalog builds, so the suite stubs `window` in the node
environment.

## storage/sprite-set-freshness.keep.test.ts

An extraction clears the sprite folder before writing it again under the same names, so
every image on screen fails meanwhile and the image primitive remembers the failure per
source. A rewritten set therefore needs new URLs, or its rows stay on placeholders for the
rest of the session.

## storage/ui-views.keep.test.ts

The ui-views module keeps its cache and timer as private module state, so each test
imports it fresh after `vi.resetModules()`. That also defers the log bus's
`window.addEventListener` until `window` is stubbed. Loading another key rides the shared
in-flight load, which flushes the pending cold start write before it resolves.

## simulation

### simulation/active-states.keep.test.ts

The widget's States row returns a list, since several states hold at once. Names come from
the decompilation routine that sets each tagalong id; an id with no confirmed source is
reported by number. Progress bits come from the live player state bytes and are tested in
`player-state-rules`. An unmapped progress tier invents no story beat. `link_num_keys` is
0xFF outside a dungeon, which once rendered as "255 small keys".

### simulation/annotation-coverage.keep.test.ts

The annotation list is generated, so a new mechanic could produce a kind nothing draws.
`EXPECTED_KINDS` mirrors the `AnnotationKind` union, because a type cannot be enumerated at
runtime. `kill-trigger` describes the whole room and has no tile, so it is panel only.

### simulation/annotation-reachability.keep.test.ts

The Secret Passage case: the uncle blocks the corridor, so the chest behind him must not read
as available. A feature's own tile is usually solid (a chest is a wall tile), so reachability
is judged from the tiles around it.

### simulation/cross-world-gating.keep.test.ts

`screen-030` is `lw-10`, `screen-260` is `west-dark-world` and `screen-463` is
`superbunny-cave-top`. The rain intro run with an empty inventory once warped from `lw-10`
into the dark world. The light world must still be broadly reachable, or a zero dark result
would mean nothing. The `screen-463` crossing carries no `ctx:cross-world` tag; only the
world aware detection catches it.

### simulation/discover

A chest is a solid 2x2 block anchored at its top left tile; the game opens it only from the
tile directly below the footprint, facing up. A reachable tile above or beside it does not
count.

A `CHECK_NPC_FLAGS` config that pins a `room` binds only there: sprite 0x73 matches in room
0x55 (the check) and not in room 0x104 (the scripted opening). Room less configs match by
type anywhere and still honour their presence condition: 0x52 is present only while the
swimming item is unowned, 0x16 is the first sage, 0xEE is no check NPC. Sprites use coarse
reachability there (`posKnown: false`) because matching is under test, not tiles.

A 2x2 overworld area returns its whole sprite table for any of its screens, each spawn
resolved to the screen it sits on; a target is judged against that screen's flood only.
Traversal is virtual, so the observed screen comes from the run's own position.

### simulation/dungeon-ledger

The sewers (room 0x11, palace 0x00) are reachable only through the castle above (palace
0x02), the one case the ledger groups. Traversal ids are the game's room numbers. Item
`item-041`, the bomb pickup, grants the `bombs` token.

### simulation/enemy-reach

Inventories are dataset ids: `item-012` bow, `item-074` tier 1 sword, `item-004` tier 4
sword, `item-013` blue boomerang, `item-008` fire rod. A tier 1 sword is damage class 1; the
blue boomerang fires ancilla 0x05, damage class 0, which is a real class and not harmless.
The fire rod is ancilla 0x02 and reaches without bound. The multi section case splits the
room west and east with the player in the west section.

### simulation/engine-loop

A synthetic three screen world with chests wired to real rooms, so the matcher names them. A
is the start; the chest in room 0x103 hands over the Hammer that unlocks the B to C door. C
holds the chest in room 0x104, the goal. A one sided point resolves its partner through the
global facade (`toScreenIdOf` calls `getConnection`), so the world's points are registered in
the real session registry. The Hammer pickup bumps the epoch; reaching C proves the re-flood.

### simulation/engine-review-fixes

Each `describe` pins one finding of an engine review: visited and failed clear on an epoch
reset; visited pass through screens are backtracked with one event and no new discovery; a
blocked next hop aborts the route instead of teleporting; an unknown position chest is still
discovered; a trigger with no flag change is recorded as failed and retried after a reset; a
generic key is credited to the matched check's dungeon. 2x2 overworld areas pack the second
screen's coordinates past the first, so a known tile can land outside the 64x64 flood grid.

### simulation/exit-distance.keep.test.ts

The ordering score packs real steps, an out of area bias (0x1000) and an unknown distance
sentinel (999) into one number; `steps` must only hold a real distance, never "4096 steps".
The walk BFS follows ledge hops. A ledge drop is one way, so its landing costs more than any
walk on the current footing; otherwise the run drops off with work pending above and, the
screen being marked visited, never comes back. A solid target tile measures from the nearest
walkable tile within four.

### simulation/flag-snapshot.keep.test.ts

The chest open bit for slot 0 is 0x10, the same native fact the matcher uses. Room 0x104 chest
0 is `check-026`; no check maps to room 0x02 chest 0. Overworld byte 0x81 bit 0x40 and
progress byte 2 bit 0x02 are real flags (a ledge item and a merchant).

### simulation/npc-check-naming.keep.test.ts

An NPC marker carries the check id it is plus the name to draw. Sprite 0x73 spawns in the
scripted opening room (no check) and in the passage where the sword is handed over (the
check). Completion is asked by id because names are not unique. Configs with no `room` mean
the sprite type is that check wherever it spawns, the same contract as the flag matcher.

### simulation/overworld-sprite-trigger.keep.test.ts

Outdoor discovery uses the same kind based dispatch as indoors: NPC sprites resolve their
flag and item from the check records' `gameId` by sprite type; anything else maps to null and
is skipped, with no invented overworld mask.

### simulation/player-state-rules.keep.test.ts

`player_sleep_in_bed_state` is a step counter inside the sleeping handler and reads 0 while
asleep, so asleep comes from the handler state; the counter is stale outside it. The bit mask
goes in the chip's hint, never its visible detail.

### simulation/recorder.keep.test.ts

The dedup key includes the location: unidentified observations carry a null `checkId`, so an
identity only key would collapse them into the first one seen.

### simulation/run-trail.keep.test.ts

A stop stores the check tally on arrival, so its haul is the next stop's arrival minus its
own; the last stop has no successor. `screenId` holds a traversal id (`ow:<n>` or
`room:<n>`), which `haulAt` never inspects.

### simulation/screen-panel.keep.test.ts

The "On this screen" list must show everything the overlay draws; an unmapped kind lands in
"Unmapped" and never vanishes.

## snapshot.spec.ts

A visual snapshot driven by environment variables. The app loads the current profile and
save state slot `SNAPSHOT_SLOT` (default 2), then its auto test hook writes
`tests/screenshots/<SNAPSHOT_NAME>.png`. `SNAPSHOT_WAIT` is the time given to the app to
finish (default 20000 ms). Run it with `npx playwright test tests/snapshot.spec.ts`.

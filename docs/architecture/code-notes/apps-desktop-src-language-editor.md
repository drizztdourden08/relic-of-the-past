<!-- @layer docs @kind doc -->
# Code notes: apps/desktop/src/language-editor

Facts about `apps/desktop/src/language-editor/` that the code cannot say on its own. Each heading names a file or folder by its path from the repository root.

## apps/desktop/src/language-editor/behavior/apply-hardcoded.ts

Turns accepted hardcoded name occurrences into new token streams: each accepted run of literal text is replaced by a reference. Only exact matches are applied; a case insensitive near miss would silently recase a line. Cuts inside one token go left to right with a cursor, so an overlapping pair is dropped instead of producing a half eaten phrase. Entries the occurrences do not change are absent from the result.

## apps/desktop/src/language-editor/behavior/hardcoded-report/

The hardcoded name scan grouped per variable, not per occurrence: a proper noun appears dozens of times, and the decision is whether every mention becomes a reference. Near misses (case insensitive matches) are counted but never applied, since applying one would recase a deliberate line. Groups are sorted most found first, and a variable with only near misses still appears, so the reader sees why. `label` is the variable's own label or the phrase itself; `exists` is false when the catalog proposed a variable the set does not carry yet; `entryCount` counts distinct entries the exact occurrences sit in.

## apps/desktop/src/language-editor/behavior/language-set-edits/

Pure immutable transforms on a loaded language set. Every transform shares everything it did not touch: only the edited entry gets a fresh `tokens` array, which lets the validation layer skip the others by array identity. `mapEntry` shares the array when the id matches nothing. `withManyEntryTokens` builds one new set, so the debounced write never sees a half applied snapshot. An emptied note drops back to undefined so it stays out of the written JSON. A set stores only what a translator changed, so clearing a text field drops the key (`withTextValue`); an empty string would read as a translation. `withGlossaryTerm` replaces an existing term with the same key in place.

## apps/desktop/src/language-editor/behavior/load-set-font.ts

A set's drawable font, read from the set's stored pair (see `setFontAssets`). It is cached at module scope by set id, holding the pending promise, so two callers in one tick share one read and a remount never reads the same font again. The font is not editable in the studio, so a cached entry cannot go stale under an edit; only a reimport would need it dropped. The base language code prefers one the caller already holds, because reading the set again would pull its whole payload for one field. The result is null when no font pair is stored or the base language is unknown, and callers then draw nothing.

## apps/desktop/src/language-editor/behavior/select-entries.ts

Narrows the entry list to what a filter asks for, after search. Warnings collects the lines that would fail to encode, which are otherwise invisible until a save refuses them.

## apps/desktop/src/language-editor/behavior/useEntryDraft.ts

Unsaved edits, one draft per entry. Nothing reaches the stored set until commit, because every write rebakes the asset blobs. A draft stays until its entry is saved or cancelled; switching views, opening another entry or closing the card never touches it, and every view of that entry shows the draft. `open` starts a draft from the stored tokens and does nothing when one exists; `cancel` drops the draft and restores nothing, since the set was never touched.

## apps/desktop/src/language-editor/behavior/useEntryIssues.ts

Live per entry validation, incremental: edits are immutable, so a cache keyed by entry id and compared by `tokens` identity validates again only the entry that changed. The base language and the reference key set invalidate the whole cache through a cheap signature. The keys come from the whole substitution list, not the glossary alone, since menu names are referenceable. The validator's alphabet comes from the extraction language table through the base code.

## apps/desktop/src/language-editor/behavior/useEntryOpen.ts

The one place that holds both `useEntryView` (what is open) and `useEntryDraft` (what is unsaved). Entering the editor starts a draft if none exists; leaving it keeps the draft. Commit and cancel drop the entry back to reading. The handlers close over a live ref, so their identity is fixed and the list can memoize its few hundred rows. `selected` is the line the properties panel describes: the last one opened or switched to another view, cleared when that line closes.

## apps/desktop/src/language-editor/behavior/useLanguageEditor.ts

The data layer of the translation editor: loads one set, holds it while edited, validates it live, persists on a debounce. Reads and writes go through the renderer languages store, not `window.api`, so the same call works on the desktop host and the browser host, where `window.api` is only a stub. With `readOnly` (an installed set) every edit is refused, so nothing is marked or written. `current` mirrors `set` so an edit can read the current value without depending on it. `apply` runs one immutable transform, then marks the result for a debounced write.

The stored pair is folded into the one list the UI edits, the same way the write path does, so what is shown is what a save persists. The fold is keyed on the three fields, not the set, because a new variable list per keystroke would invalidate the layout cache for the whole set.

## apps/desktop/src/language-editor/behavior/useSetExport.ts

Exports the open set as `.rlang` through the platform's save path: a save dialog on desktop, a share sheet on mobile, a download in a browser. A pending edit is written first, so the file holds what the editor shows. A cancelled dialog is an ordinary outcome, not a failure.

## apps/desktop/src/language-editor/behavior/useSetFont.ts

One language set's font as React state. The read is memoised in `load-set-font`; the returned object is memoised because consumers feed `sheet` and `metrics` straight into the dependency list of a canvas redraw effect. Passing `base` (the set's base language code) when the set is already loaded saves a second read.

## apps/desktop/src/language-editor/behavior/useSetPersistence.ts

Debounced whole set persistence. A write is expensive (it recompiles every cached asset blob), so an edit only records a snapshot and the write waits for `SAVE_DEBOUNCE_MS` of quiet. `revision` counts edits and `persisted` holds the revision the last completed write carried, so an edit landing mid write is armed again instead of clobbered. `epoch` does the same for a set swap: a write whose set was swapped out meanwhile drops its result. `runRef` breaks the arm and run cycle: the timer reaches the latest `run` through it. A failed write stays dirty, and the next edit or `saveNow` arms the write again. After unmount no timer fires again, so a newer edit is persisted at once, and unmounting flushes a pending edit so it is never lost. `markEdited` records a snapshot and restarts the quiet period; `reset` takes a freshly loaded set (or none) as the new baseline, dropping pending writes; `saveNow` with a write already in flight returns at once, and that write or its next arm carries the newest snapshot.

## apps/desktop/src/language-editor/behavior/useTextGroups.ts

The text groups the studio shows, and which one is open. The catalog decides which slots exist; storage only holds what a translator wrote. The record dataset is handed to the builder, not imported by it, because the builder is exported again from the language barrel the storage layer uses. The menu and credits text is read from the player's own file, only when a set is open; a set whose ROM is not stored has nothing to show for those two groups. When the stored file is another region's, the slots and sizes are right but the words are not this set's originals, and each row says so. A missing key in `values` means the slot is untranslated.

## apps/desktop/src/language-editor/behavior/useVariablesTab.ts

The state of the variables tab: filtering, usage counts and the hardcoded name scan. The scan runs only when the dialog opens, because `findHardcoded` walks every text run against every candidate phrase. Applying a report is one edit, so the debounced save sees a single new set.

## apps/desktop/src/language-editor/behavior/variable-edits/

One variable's value written back into the pair the set stores (glossary and name table). The key shapes mirror `packages/languages/src/messages/variables/name-tables-from-variables.ts` exactly (`bottle-<content>`, `label-<section>`, anything else is an item), so a round trip is byte identical. An engine variable has no stored value and is refused (`isEditable`).

## apps/desktop/src/language-editor/editor-ui/behavior/useDialogueEditor.ts

Callbacks are held in refs so the editor is built once.
The caret line is not cleared on blur.
An empty transaction repaints the gutters.
Glyphs that are spelled as a pair insert both entries.

## apps/desktop/src/language-editor/editor-ui/behavior/useTokenSync.ts

The hook remembers the signature of what the editor last sent out.
When the incoming tokens match it, the editor is not reset, which keeps the caret in place.
Content is set with `emitUpdate: false` so the reset does not echo back as an edit.

## apps/desktop/src/language-editor/editor-ui/char-advance.ts

Gives each typed character its real width from the pack's width table.
The editor wraps every character in a cell of that width.

## apps/desktop/src/language-editor/editor-ui/char-cells.ts

Builds the per-character cells that the editor draws as decorations.

## apps/desktop/src/language-editor/editor-ui/DialogueEditor.css

`position: relative` on the card is the anchor the legend floats against.
Overflow stays visible, because a clipped card would cut off the legend and a parameter picker.
The surface sets no letter spacing.
Every character sits in a cell of its own real width, and one spacing value cannot stand in for a font that advances 1 to 8 pixels per glyph.
Ink is not clipped to its cell.
Painting full width while advancing less is closer to what the engine draws than cropping a letter.
Ink is centred so the six characters whose face advance disagrees with the width table do not look out of step.
A character the language has no glyph for keeps the face's own advance and is underlined in red, because it is why the line will not encode.
The no wrap rule is stated on the ProseMirror host too.
The editor sets `break-spaces` there, which let a long line break after an inline atom and paint over the line below.
The row's edge is a ruler drawn as a background.
A background cannot create a line break opportunity, so it marks the limit without reflowing the text it measures.
The empty line prompt uses the interface face so it never reads as game text.
The shared lengths sit on the body, the common parent, so gutter row N always sits beside text line N.
A row is one cell tall plus a little leading, because the face's ink is about 3px taller than its 16px cell.
`--gutter-head-h` pushes the text down by the gutter's heading row, which fixed a 21px misalignment.

## apps/desktop/src/language-editor/editor-ui/DialogueEditor.tsx

The font handle is kept in a ref so decorations read the current font.
The editor extensions are keyed on the contents of the glyph set and on whether the font is ready.
A change to either rebuilds them.

## apps/desktop/src/language-editor/editor-ui/editor-contract/

This folder is the one place the editor UI imports the `editor/` layer from.
Every other file in `editor-ui/` goes through it.

## apps/desktop/src/language-editor/editor-ui/editor-ui.type.ts

`GlyphFontHandle` is a live handle.
It is read when a decoration paints, so a font that loads later still draws.

## apps/desktop/src/language-editor/editor-ui/EditorToolbar.css

The toolbar is one row of equal icon buttons and does not wrap.
A row that reflows moves a button out from under the pointer.
`overflow: visible` is needed because every card is anchored inside this row.
A divider between groups is shorter than the row, so it reads as a pause.

## apps/desktop/src/language-editor/editor-ui/EditorToolbar.tsx

Only one card is open at a time, and the row owns which one.
A press outside closes it, unless a design system dropdown is open, since that list is drawn in a portal.

## apps/desktop/src/language-editor/editor-ui/glyph-names.ts

Glyph names are stored with brackets, such as `[Up]`.
`BRACKETED` matches that form.

## apps/desktop/src/language-editor/editor-ui/icon-for-token/

Icons are picked by code name only.
The line start markers share one symbol.

## apps/desktop/src/language-editor/editor-ui/icon-svg.ts

Builds a DOM `svg` for markers that are drawn outside React.
The icon data is bundled with the app, so writing it with `innerHTML` is safe.

## apps/desktop/src/language-editor/editor-ui/popovers/encodable-presets.ts

Pause and text speed are the two codes an author still places by hand.
Both take a raw parameter from 0 to 15.
A pause is roughly half a second per step, so four points cover a beat, a breath, a long hold and a full stop.
Speed is frames of delay per character, and zero draws the whole message at once.
Every preset is filtered through what the language can encode, so nothing offered can fail to compile.
An encoder that refuses the code leaves an empty list, and its button is disabled.

## apps/desktop/src/language-editor/editor-ui/popovers/GlyphChoice.tsx

Each choice draws with the game's own pixels, so the button shows exactly what lands in the line.
A character spelled as a pair inserts both tokens.

## apps/desktop/src/language-editor/editor-ui/popovers/GlyphPopover.css

The grid uses auto fill, so it suits an alphabet of six characters or forty.
A cell takes an icon's size and keeps the glyph's 1 to 2 proportion so the picture does not stretch.

## apps/desktop/src/language-editor/editor-ui/popovers/GlyphPopover.tsx

Picture characters belong to the dialogue alphabet, so they are drawn from the pack's own font.
Which names are characters comes from the language's alphabet, so each set offers exactly its own.

## apps/desktop/src/language-editor/editor-ui/popovers/PopoverShell.css

The card is absolute, not in a portal, so it stays in its button's stacking context and needs no measuring.
The width is kept narrow on purpose, because one card does one thing.
The `end` variant opens leftward so the last buttons in the row stay inside the pane.

## apps/desktop/src/language-editor/editor-ui/popovers/PopoverShell.tsx

Every toolbar card is drawn in this shell, anchored under its own button.
It floats over the content, because a toolbar that changes height moves the text away from the pointer.
`keepFocus` swallows `mousedown` for a card that holds only buttons, which keeps the caret alive in the text.
A card holding a field must not swallow it, or the field could never be typed in.
The editor restores its stored selection before it places a token, so the insert lands at that selection either way.
The toolbar owns which card is open and every way of closing it.

## apps/desktop/src/language-editor/editor-ui/popovers/portal-layer.ts

A design system `Select` draws its list through a portal, so the list is not inside the card.
A press on one of its values looks like a press outside the card.
Checking whether the portal's popover layer holds anything tells those two cases apart.
A press that lands elsewhere still closes the list, and the next press closes the card.

## apps/desktop/src/language-editor/editor-ui/popovers/PresetPopover.css

The four values read as a scale, so the buttons keep equal weight and none looks like the default.

## apps/desktop/src/language-editor/editor-ui/popovers/PresetPopover.tsx

One card serves both pause and speed: each is one code with one parameter.
It holds only buttons, so the caret stays in the text.

## apps/desktop/src/language-editor/editor-ui/popovers/settings-fields.ts

`apps/desktop/src/language-editor/sub-components/message-settings` names the three settings.
Labels, descriptions and values come from the control code catalog, narrowed to what the language can encode.
The `automatic` option means the entry says nothing and the engine default applies.

## apps/desktop/src/language-editor/editor-ui/popovers/SettingsPopover.css

Each label sits above its list, because the card is too narrow for two columns.

## apps/desktop/src/language-editor/editor-ui/popovers/SettingsPopover.tsx

The three display codes are read in a pre pass, and the last one in the message wins.
Their place in the text means nothing, so they are shown here, not as chips.
The structure mode sits beside them because it also applies to the whole entry.

## apps/desktop/src/language-editor/editor-ui/popovers/structure-modes.constants.ts

The modes and what they decide live in the shared layer.
This file only names them on screen.

## apps/desktop/src/language-editor/editor-ui/popovers/VariableChoice.tsx

A variable the engine owns still appears, with a small padlock.
The player's name is the most common insert of all.

## apps/desktop/src/language-editor/editor-ui/popovers/VariablePopover.tsx

The list is filtered by typing, not split into sections.
A translator knows the word, not the family it belongs to.
Enter takes the first row.
`tokenForVariable` decides which token a row inserts.

## apps/desktop/src/language-editor/editor-ui/substitution-cells.ts

A substitution reserves its worst case width.
A name reserves six of the widest glyphs, because the player name `PLAYER` has six letters.
A number reserves one digit.
Both numbers come from the layout plan.

## apps/desktop/src/language-editor/editor-ui/TokenAtom.css

A token chip sits on a row of fixed height, so it must not grow the line.
It has no wrapping, no vertical padding, and a height of `1em`.
It is an atomic inline box, so its reserved width stays a measurement.
The pane opts every descendant into selection, and the chip opts back out with a more specific selector.
Token families differ by hue and by border, so colour is never the only signal.
An atom is selected whole, so the selection ring goes round the chip.
The chip's label is ours, so it uses the interface face and never looks like typed letters.
A picture character is one of the line's characters, not a chip, so its wrapper only adds the selection ring.
A substitution chip is as wide as the widest value it can draw, in game pixels.
`border-box` makes that width the whole footprint.
It takes the line's own font size and leading, so it cannot grow the row.
Each stand in character uses two selectors so it beats the text primitive's 13px size, which grew the row past its height.

## apps/desktop/src/language-editor/editor-ui/tokens-signature.ts

The signature joins tokens with a NUL character, which no token can contain.
`serializeTokens` throws on a reference it cannot resolve, so the signature catches that and falls back.

## apps/desktop/src/language-editor/editor-ui/ToolbarButton.css

The card positions against the wrapper, so the wrapper carries `position: relative`, not the button.

## apps/desktop/src/language-editor/editor-ui/ToolbarButton.tsx

The button swallows `mousedown`, so the caret in the text survives the press.

## apps/desktop/src/language-editor/editor/attrs-to-token/

The return half of the atom contract: an inline node back to the token it stands for, and a paragraph's children back to one line's content. The walk is flat: text nodes accumulate into one maximal run, and atoms rebuild their original token from the attributes. A run is flushed only when it is not empty, so two adjacent atoms produce no phantom empty text token between them, which is the case a naive walker gets wrong.

Values are read defensively, not trusted: a paste, an older stored document, or a node view that stringified an attribute can put a decimal string where a number belongs, and an out of range row must still resolve to something the model accepts. Rows are the three line start markers; anything else falls back to the first. Anything unrecognisable is dropped instead of becoming an invalid token. Like its counterpart this module imports no editor runtime; it reads plain ProseMirror JSON and needs no DOM.

## apps/desktop/src/language-editor/editor/auto-wrap/

Wrapping while typing: the editor's half of the author never thinking about the row. The engine never wraps: a row drawn past its 168px interior is drawn into the next row's tiles. So after every change the first line wider than the row is cut at the last word boundary that still fits (the model's own `breakLine`), the joining space is dropped the way any wrap drops it, and the remainder becomes the next line with a derived advance. The cut lands on the joining space, so everything in `head` sits before it. The pass repeats until nothing is overlong, so a long paste settles in one transaction; `MAX_CUTS_PER_PASS` is a fuse, since a pass never needs more cuts than a paste has words. Positions are taken fresh from the transaction's own document, so repeated cuts compose.

A single word or variable wider than a whole row has no safe cut, since cutting it would change what it says, so it is left whole for the validator to flag. `breakLine` answering null there is also what keeps the loop finite. The wait travels with the text: wrapping a line that ended its box moves the wait onto the remainder, because the words that moved down still finish the box.

## apps/desktop/src/language-editor/editor/choice-lines.ts

Choice options are edited where they live: inside the editor, as the lines they are. A choice prompt stores its option text as the last lines of the entry, one option per line, with the prompt code as the stream's final token; that was verified against every prompt in the vanilla corpus. So the options need no second editing surface: this plugin finds the prompt code in the document (`OPTION_COUNTS` says how many option lines each prompt reads), marks the option lines, and the stylesheet dresses them as the selectable rows the player will see. Typing in one is typing in the entry, and every editor behaviour (wrapping, measuring, undo) applies unchanged. The decoration carries the option's 1 based index, which the line gutter and the option tag both read.

## apps/desktop/src/language-editor/editor/delete-merged-pair/

Backspace and Delete over a merged picture character: both halves go, or neither does. The picture is one character to the author, so removing the character before the caret has to mean the whole picture. Left to the ordinary delete, one press took away half of it and left the other half standing: a picture the alphabet has an entry for, which encodes and bakes perfectly well and draws as nonsense on screen.

Three ways in, one range: the caret may be after the pair (Backspace, direction -1), before it (Delete, direction 1), or the pair may be selected because a click landed on it. A click always selects one half's node, since that is the object the browser hit, and that selection is widened to the pair here, not at the click. Both commands decline when the gesture is not over a pair, so an ordinary character, an ordinary atom and a line boundary keep their own behaviour.

## apps/desktop/src/language-editor/editor/doc-to-lines.ts

Editor document to lines: the return half of the bridge, and the pivot every consumer reads. There is exactly one view per paragraph, always, which keeps the gutter beside the text honest: row three of the gutter belongs to the third paragraph whatever that paragraph contains, including nothing. A bare paragraph is accepted as a one line document. The token stream falls out of these views through the model's own inverse (`joinLines`), so this file never writes a control code. An entry that was opened and not edited comes back out byte identical: its advance codes were carried through the attributes untouched, and nothing here invents or corrects one.

## apps/desktop/src/language-editor/editor/editor-runtime/

The live context the structure plugins read at dispatch time. A ProseMirror plugin is built once, when the editor is created, but the language's font arrives later and the automation mode can change while the editor is open. Threading either through the extension list would rebuild the editor, and rebuilding is exactly what loses the caret, so the plugins close over this one mutable object instead, and the component keeps it current (`updateEditorRuntime`). A singleton is safe because the editor enforces one open draft at a time: two dialogue editors never accept keystrokes at once. If that rule ever changes, this must become per editor plugin state.

## apps/desktop/src/language-editor/editor/gutter-refresh.ts

Repaints every line's gutter after every transaction, straight from the editor state. The node view repaints its own gutter when its node is redrawn, yet a typed character can be adopted from the DOM without a redraw, and the pack's font can arrive after the lines were first drawn. Driving the repaint from the view's update hook closes both gaps: whatever changed and however, the gutters end the transaction correct.

## apps/desktop/src/language-editor/editor/line-attrs/

The attribute contract of one line: everything a paragraph remembers that is not its text. A line's two structural facts are the code that put the pen on its row and whether a wait follows it. Neither is content: the engine only meets them at a line's edges, so carrying them as block attributes is both truer and easier to edit than burying them in the run as inline objects. The document's block type is the paragraph (`DIALOGUE_LINE_TYPE`): one paragraph is one line, and every attribute field is always present.

The advance is stored as a kind plus a row, not as the model's union, because a ProseMirror attribute has to survive a trip through the DOM as a string. A null kind is a real value meaning a null advance: the line carries no code of its own, and it is written back exactly as read, which lets an untouched entry round trip. A stored row may arrive as a decimal string (a DOM attribute) or outside the three markers (a paste); it resolves to the first row, not to nothing, because the line was authored with a code and dropping it would change what the engine draws. For `endsBox`, absent, `false` and `'false'` all mean no wait. The rendered `data-*` attributes are not decoration: the stylesheet groups the lines of one box by looking for the line after a `data-ends-box` one, so the box grouping needs no second source of truth.

## apps/desktop/src/language-editor/editor/line-here.ts

Where the caret is, in lines. Every line command needs the same three facts: which paragraph holds the caret, where it starts, and which line number it is. Getting any of them slightly wrong moves an edit onto the wrong row, so one locator serves all of them. `PARAGRAPH_DEPTH` is 1: the document holds only paragraphs and a paragraph only inline content, so there is nothing deeper to walk. `pos` is the position immediately before the paragraph, which is what `setNodeMarkup` takes; `index` is 0 based among the paragraphs; `offset` is the caret offset within the line's content.

## apps/desktop/src/language-editor/editor/line-node-view/

How one line is drawn: its row information and its text as one element. The gutter is a child of the same paragraph that holds the text, so the two cannot be laid out apart: there is no second column to drift and nothing to align. It shows the line number, a meter of the row's 168px filled so far, the pixels left, and the character count (atoms count as one, like the caret steps). The meter reads as tight from `TIGHT_FROM` up, matching the fit chips of the list. The gutter is painted from the line's own node every time the node changes, which is every keystroke in that line and nothing else.

The gutter is outside the editable content and outside the document: the caret cannot enter it, a copy cannot carry it, and a mutation inside it is never mistaken for typing (`ignoreMutation`). `paintGutter` is shared with the refresh plugin, which drives every gutter from the editor state after each transaction; the line number comes from that walk, since a node cannot know its own position, so the node view paints with it unknown and the refresh fills it in.

## apps/desktop/src/language-editor/editor/line-paragraph.ts

The block a line occupies: an ordinary paragraph that also remembers which code put the pen on its row and whether a wait follows it. The keys are bound as a plain ProseMirror keymap instead of through the framework's shortcut layer: each command builds and dispatches its own transaction, and the framework's wrapper dispatches one of its own around whatever a handler does, which would apply the edit twice. A keymap plugin hands the command the state and dispatcher directly, which is the contract the commands are written to.

The priority is raised (`KEYMAP_PRIORITY`) so this keymap is consulted before the base bindings. Enter must not fall through to the generic block split, which would make a paragraph with default attributes: a line with no advance code in the middle of an entry, which the engine has no way to draw. The two bare arrows are taken for the reverse reason: left to the browser they step by DOM position, and a line has more of those than characters (see `step-caret`). Shift with an arrow, word jumps and the vertical arrows are deliberately not bound. Backspace and Delete try the merged picture first, since it is one character and one press takes both halves; declining falls through to the line merge, then to the base keymap's ordinary delete. Absent attribute fields are left off the element, not written as null. The line draws its own row gutter beside its text through its node view.

## apps/desktop/src/language-editor/editor/line-shape/

One line as the document stores it, and the two derivations the editor needs from it. Measurement is never stored; it is computed again from the shared layout walk every time, so the gutter can never show a stale width.

A paragraph is numbered here instead of by splitting the token stream again: a paragraph exists in the document even when it contributes no tokens (an empty line that carries no code, such as the first line of a new entry), and the model's splitter rightly reports nothing for it. A gutter that lost that row would stop lining up with the text, so numbering follows the paragraphs and only the numbers are derived. The rule is the model's: a row marker parks the pen on its own row, a scroll parks it on the bottom row, and a line with no code sits on the first row of its box (`rowOfAdvance`).

`measurableGlossary` widens the glossary to answer every reference the tokens make. Resolving a reference to a key the set does not carry throws, and mid edit that is an ordinary state: a term can be renamed or removed while an entry still points at it. An editor that threw there would go blank on a keystroke, so an unknown key measures as its own name. That is wrong by exactly the width of a placeholder, and the entry validator reports it as a real issue.

`advanceAfterLine` is the one place a code is invented, and only for a line an author just asked for. `advanceForNewLine` reads a previous line's row and whether it ends the box, so the view handed to it is structure with its measurements zeroed: they are not read, and measuring would carry a font this far down for nothing.

## apps/desktop/src/language-editor/editor/line-tokens.ts

A line's content as tokens, read straight off the live document node: text children become text tokens, inline atoms become the token their attributes spell. Shared by everything that measures a line while it is typed.

## apps/desktop/src/language-editor/editor/lines-of-tokens.ts

A stored token stream as the lines an author edits: the model's own splitter, with the one guard the editor needs. Splitting measures each line, and measuring resolves glossary references, which throws on a key the set no longer carries. Opening an entry that points at a removed term must show the entry, not an error, so the glossary is widened first (`measurableGlossary`). Nothing else changes: the advance codes come back exactly as authored, which is what `joinLines` needs to write them back untouched.

## apps/desktop/src/language-editor/editor/lines-to-doc.ts

Lines to editor document: the forward half of the bridge. One line is one paragraph. That is the whole change from the single run editor this replaced: the engine writes into a three row box and never wraps, so what an author edits is a stack of lines, and a document shaped like that can be guttered and grouped the way a code editor is. A line's advance code and trailing wait become paragraph attributes, not nodes in the run, so neither can sit in the wrong place: a row marker cannot end up mid sentence, and a wait cannot end up anywhere but a line's end. An empty set of lines still yields one empty paragraph (`EMPTY_LINE`), the canonical empty document: the schema requires at least one block, and an author needs a row to type into.

## apps/desktop/src/language-editor/editor/merge-lines/

Backspace at the start of a line and Delete at the end of one: both the inverse of Enter. A merge drops a code instead of moving one. The line that disappears is the one whose advance put the pen where it was, and once its text has joined the line above there is nothing left for that code to do; the surviving line keeps its own. This is the only way an authored advance is ever removed, and it removes exactly the one the author deleted.

The wait is the opposite: it belongs to whichever line now ends the run of text, so it survives from either side. If the line merged away closed the box, the combined line closes it instead; otherwise deleting a line break would silently join two boxes and change what the player has to press. The markup is set before the join, because it changes no positions and keeps the join boundary valid. Both commands decline when they do not apply, so the keys keep their ordinary behaviour everywhere except a line boundary.

## apps/desktop/src/language-editor/editor/merged-glyph/

The picture characters spelled as two alphabet entries, and which half a given entry is. A few pictures are too wide for one cell, so the alphabet spells them with a pair of adjacent entries and the engine draws the halves side by side. To an author it is one picture: inserted, read and deleted as one thing. Drawing the halves as two objects gave a caret position in the middle of a picture that the browser could not paint (a zero width rectangle between two uneditable boxes), and a click that could only ever select half of it.

The pairs are not listed here. The sprite manifest already records them: an extraction recipe that names a second glyph produces one sprite covering both entries, and the derived map marks the two entries `first` and `second` of that one file (`buildPairs`). Reading that keeps the two from drifting apart. Names are the bare bracket names (`1HeartL`, not `[1HeartL]`), because that is the form a token carries and the drawing code asks with. Only the base alphabet's pairs are known; a localized alphabet that splits a picture its own way keeps its own entry names, resolves to nothing here, and draws as two cells as it did before. `isMergedSecond` is true for an entry that closes a pair, which draws nothing of its own.

## apps/desktop/src/language-editor/editor/merged-pair/

Where the two halves of a merged picture character sit in the document. The model keeps both halves, because they are two alphabet entries and the stored entry must round trip byte for byte. Every gesture still treats them as one character: the caret steps across the pair in one press, and one Backspace takes both away. Everything that needs to know whether a position is in the middle of a picture asks here, so the answer is derived once from the pairing the sprite manifest records. Positions are document positions: each half is an inline leaf of size one, so a pair occupies `from` to `from + 2`, and the position between the halves (`splitsMergedPair`) is the one the browser could never paint a caret at.

## apps/desktop/src/language-editor/editor/renumber/

Row codes follow the lines, so the author never renumbers anything. When a line is opened, wrapped in or removed, every line after it has moved, so its advance code is derived again: rows fill downward, and once the bottom row is taken the box scrolls. A wait is ignored by the derivation on purpose. The engine clears nothing at a wait, so continuing downward (and scrolling from the bottom row) is the one continuation that draws over what is already on screen. That is also the vanilla corpus's own idiom: scrolls outnumber row one returns thirty five to one.

Reach follows the automation mode. Continuous renumbers to the end of the entry; in block stops where the changed line's box ends; off renumbers nothing (a line created by a wrap still gets its own derived code at creation). Lines before the change are never touched, which keeps an untouched entry serialising byte for byte.

## apps/desktop/src/language-editor/editor/schema.ts

The editor's extension list: the smallest schema that can hold a dialogue entry and nothing else. The document is a stack of lines, `paragraph+`, one paragraph per line. The engine writes into a three row box and never wraps, so the thing being edited is a stack of lines, not one long run with control codes buried in it. Enter makes a line and Backspace at a line's start removes one; both are the line node's own business. There is deliberately no mark in the list: the target format has no bold, italic, heading or list, so the schema must not offer one, and an unknown mark pasted in has no type to parse into and drops to plain text. Undo and redo use the ProseMirror history plugin wired directly (`EditHistory`), because the framework's own history extension is not installed (no starter kit, no marks): same engine, one dependency fewer.

## apps/desktop/src/language-editor/editor/split-line.ts

Enter starts a new line. This is the one gesture in the editor that invents a control code, and it asks the model for it (`advanceForNewLine`) instead of deciding: the box fills from the top, so the line after row one is row two, after row two is row three, and once the bottom row is taken the box scrolls to make room. A line opened after a box ending wait starts the next box at row one again.

The wait travels with the text, not the row. Splitting a line that ended its box leaves the first half open and the second half closing the box, which is what an author means by pressing Enter mid sentence: the words that moved down still finish the box. The advance is computed against the first half as it will be after the split, when it no longer ends its box, so a line that used to close the box hands the new line the next row down instead of restarting at row one. The paragraph's own start is before everything the split touches, so its position still points at the first half after the split.

The automation mode is a promise about what Enter may restructure: off consumes the key and changes nothing; in block refuses once the caret's box already holds its three rows (`rowsInBoxBefore` counts back to the previous wait).

## apps/desktop/src/language-editor/editor/step-caret/

Left and right by one character of the line, whatever that character is made of. The browser moves a caret between DOM positions, and a line has more of those than characters. Every character sits in a cell of its own so it can be billed its real advance, and each boundary between two cells is two equivalent DOM positions, since the end of one span is the start of the next. Native motion therefore stopped twice per character and the caret visibly jittered backwards. An inserted token is the same problem from the other side: one character to the author, and the caret has no business landing inside it.

Stepping by document position instead settles both. One press is one position: one typed character, the whole of one atom, or the jump from the end of a line to the start of the next. Nothing else about selection changes; Shift with an arrow, word jumps, the vertical arrows and clicking stay with the editor, which is why only the two bare keys are taken. A non empty selection collapses to its own edge instead of stepping past it, so after clicking an atom the first arrow puts the caret beside it. A merged picture is the one place where one press crosses two positions: the step passes over the position between its halves and lands on the far side.

## apps/desktop/src/language-editor/editor/toggle-wait/

Whether a line ends its box: a per line flag, flipped from the line's end. A wait for button is the one control code a player experiences: the moment the box stops and asks for a press. It can only occur at the end of a line, so it is a property of the line, not something inserted at a caret, and turning it on or off is one gesture. Two ways in, one transaction: `toggleWaitAt` is for the marker drawn at a line's end, which knows the position it was drawn at; `toggleWaitHere` is the keyboard route, acting on the caret's line.

## apps/desktop/src/language-editor/editor/token-attrs/

The atom contract: one non text token as an indivisible inline node, and a line's content as the inline children of a paragraph. A row marker and the wait that closes a box are line structure: they only occur at a line's edges, so they live in the block's attributes and never appear in a run. What is left is what sits in the text: a substitution, a glossary reference, a picture character, and any control code that takes effect mid line. `DialogueTokenKind` mirrors `Token['t']` minus text.

This module is free of any editor framework runtime import: it builds plain ProseMirror JSON, which keeps it pure, DOM free and testable alone. It owns the attribute contract (`DialogueTokenAttrs`) that the node extension declares and `attrs-to-token` reads back, so the three stay in step from one definition. In that contract `null` means the field is absent from the token and `undefined` never appears, so a `param` or `slot` of 0 stays distinguishable from no parameter. `tokenToNode` is what a toolbar hands to `editor.commands.insertContent` to drop an atom at the caret. `inlineContent` folds text into the preceding run, so no two text nodes adjoin.

## apps/desktop/src/language-editor/editor/token-node/

The atomic inline node a non text token occupies. Everything that is not plain text and sits in the run is one indivisible character to the caret: a mid line control code, a substitution variable, a glossary reference, a picture character. It can be selected and deleted whole, never typed into and never split; text around it stays ordinary. Line structure is not here: a row marker and a box closing wait are attributes of the line, though the node still knows how to draw one if a paste brings it in, so nothing is lost silently.

How an atom leaves the editor: as HTML (copy and paste inside the editor) it is `span[data-dialogue-token]` with one data attribute per field, so a round trip through the clipboard rebuilds the identical token; the node is a leaf, so its inner label is never parsed again as content. As plain text (copy out, `editor.getText()`) it is the bracket form the stored dialogue format uses, through `serializeTokens`; a glossary reference has no bracket form, so it renders as `{key}`, and plain text is one way. Absent fields are omitted from the DOM, not written as null. The node renders a bare labelled span; chip styling and parameter editing belong to a node view in the UI layer.

## apps/desktop/src/language-editor/language-editor.type.ts

The state types of the editor's data layer: what the editor hook hands the UI (the loaded set, save and dirty flags, per entry validation) and what an edit to the name table looks like. `EntryIssueMap` is keyed by the entry's own game index. `NameEdit` is discriminated on the group so every group keeps its own key type: an item record id, a bottle slot number, one of the fixed pause menu label keys.

Every mutation is immutable and marks the set dirty. The structure mode is part of the set, so changing it is an edit like any other. An emptied text value drops the override. `setVariableValue` routes to whichever table the variable is projected from; an engine owned variable has no stored value, so a write to one is ignored instead of landing where nothing reads it. `setManyEntryTokens` replaces several entries in one pass (the hardcoded name apply). `saveNow` flushes a pending debounced write (a Save button, a tab change).

`dirty` means edits exist that the debounced write has not persisted. `saving` means a write is in flight, which also recompiles the asset blobs. `variables` is the set's one substitution list, projected live from the pair it is stored as, so an edit to a term or a menu name shows without a save first. `terms` is every variable that carries text of its own, in the shape the measurement and validation walks take; it is wider than `set.glossary`, because a menu name may be referenced from a line and a walk given only the glossary would fail on it.

## apps/desktop/src/language-editor/LanguageEditor.css

The editor's body is the one scroll, so the action row, the toolbar and the properties panel stay put. Selection is opted back in for the work area and every descendant. The app wide reset resolves `none` down the whole tree, and an element that cannot be selected cannot start a selection either, so a press outside the typing surface left the old highlight painted. Naming the descendants too is what makes it stick, the same fix as the log panel.

## apps/desktop/src/language-editor/LanguageEditor.tsx

The translation editor: one language set, edited a line at a time. The glossary and the menu name table are one Variables tab on purpose: as two lists a translator had to work out which one a piece of text lived in. It is the detail of the set list, built from the shared studio parts: one action row (Save, Export) with the save state at its end, the editor with its section toolbar (the tabs, and on Dialogue the search and the filter), and the properties panel, kept under `language-studio.properties`. `readOnly` marks an installed set, which opens and previews and changes nothing; `origin` is the origin bar of an installed set, shown above the action row. A spinner shows while the set loads and an empty state only when the read failed. The properties panel shows the selected line on Dialogue (its facts and its translator note) above the set's own facts; the facts are not repeated inside the open line, so an open line costs only its text. `LOCKED` marks the two tabs whose surfaces are built but not yet connected to the game.

## apps/desktop/src/language-editor/sub-components/code-params.ts

The values a picker may offer for one control code.
What the language can encode comes from `encodableParams`.
The catalog's documented range narrows it, since the raw encoder accepts all 256 bytes.
`null` means the code takes no parameter, so the insert is one click.

## apps/desktop/src/language-editor/behavior/studio-frame/useStudioActions.ts

Save and Export are separate groups because they end in different places: Save keeps the set in this app, Export makes a file. Save is off for an installed set, which is never written, and while nothing changed. Export saves first (`useSetExport`), so it is off only while a save or an export runs.

## apps/desktop/src/language-editor/sub-components/studio-frame/section-tool-groups.tsx

The search and the filter exist only on the Dialogue section, because the other sections have no list to search or filter.

## apps/desktop/src/language-editor/sub-components/DialogueTab.css

The frame's surface scrolls, so the list takes its natural height. The search box and the filter sit in the frame toolbar, not here.
The list is the query container for its rows.
Every row has the same fixed columns, so whether there is room for the line's words depends on the list's width, as `entry-row.css` reads it.

## apps/desktop/src/language-editor/sub-components/DialogueTab.tsx

A searchable list of entries, closed by default, any number of which may be open.
A set has a few hundred entries and the list's job is finding one, so each closed row is a dense line of facts.
Only the editing view can change an entry, and only one entry may hold unsaved work at a time.
Entries the engine uses as scaffolding are shown locked, because they hold no words to translate and editing one breaks every choice prompt.
Every listed entry is measured, not only the ones near the viewport.
A closed row paints no canvas, so measuring the whole set is cheap.
The layout cache is keyed on each entry's token array, so each entry is walked once for the life of the set.
An entry with unsaved words is shown with them in every view.

## apps/desktop/src/language-editor/sub-components/EntryEditor.css

The commit pair sits at the end of the card so it is always in the same place.
The refusal message is a whole sentence on purpose, because `too long` alone sounds like the text will be trimmed, and it will not.

## apps/desktop/src/language-editor/sub-components/EntryEditor.tsx

Edit mode for one entry: the editor and the commit pair.
Line widths live in the editor's gutter, and the entry's identity lives in the panel around it.
Saving is refused while a row is too long.
The engine keeps writing past the edge of the box and paints over the line below, so an overlong row is a defect nobody sees until the scene is played.
`tokens` are the draft; the parent holds the committed entry.

## apps/desktop/src/language-editor/sub-components/insert-menu-model.ts

Builds the insert menu from the control code catalog and the language's alphabet.
`SECTION_OF_CODE` only says which section a code belongs in; every label, risk and range comes from the catalog.
A code the catalog will not offer, or marks dangerous, is dropped.
Codes missing from the table are left out on purpose: choice prompts get their own editor, and display codes are settings.
`CODE_ORDER` sets the row order, since object key order sorts digits first.
`parseTokens` gives line start markers the `break` kind and the two substitutions the `var` kind, so the menu emits those shapes to survive a save and reload.
A glossary pick becomes a `ref` token, so retagging the term once updates every entry that points at it.
Picture characters are found in the alphabet and round trip as `cmd` tokens with no parameter.

## apps/desktop/src/language-editor/sub-components/insert-menu.type.ts

The insert menu model is presentation only.
`make` builds the token to add, and `choice` is null for a row that needs none.

## apps/desktop/src/language-editor/sub-components/LockedEntryCard.tsx

The stand in for an entry a translator must never edit, such as a choice prompt cursor frame or the extraction padding string.
`structuralEntry` in `packages/languages/src/messages/codes/structural-entries.ts` lists them.
It uses the same row shape as a closed entry, dashed and dimmed, so the locked rows are not the loudest rows in the list.
The reason is stated in full as the row's title, calmly, as a fact about what the entry is for.

## apps/desktop/src/language-editor/sub-components/message-settings/

The three display codes: text palette, box frame and box slot.
The engine reads them in a pre pass, so the last one in the message is the one that applies.
They are settings, so they are edited as pure array functions, not as chips.
The catalog's `scope` field is not used as the filter, because it also marks the two substitution codes.
Reading returns `null` when the entry never sets the code, or when the last one has no parameter.
Writing rewrites the last occurrence in place and drops earlier duplicates, which could never apply.
Clearing removes every occurrence, so the engine default applies.

## apps/desktop/src/language-editor/sub-components/overflow-reason.ts

Names the consequence, because `too long` sounds like the text will be trimmed or wrapped.
It returns an empty string when every row fits.

## apps/desktop/src/language-editor/sub-components/SetCreateForm.tsx

Starts a new set from a base language or as a copy of an existing set.
It stays collapsed until asked for, so the set list remains the first thing in the pane.

## apps/desktop/src/language-editor/sub-components/StaleGameNotice.css

A warning strip, not a card, carried by the warning tone over a light fill.

## apps/desktop/src/language-editor/sub-components/StaleGameNotice.tsx

Shown when the running game plays older text than the set on screen.
Text reaches the emulator once, when a profile loads and the game boots.
Nothing reads it again, not a save and not a save state, so an edit saved mid session is invisible until the profile loads again.
Reloading restarts the game, so the notice says so.

## apps/desktop/src/language-editor/sub-components/text-groups/

The fixed text slots: which ones a translator has written, which ones a search keeps, and how a value fits its room.
A slot counts as translated only when its override is present, not blank, and not the exact original.
The fit is a plain character count, because these surfaces draw one character per cell.
`ROW_CAP` limits the rows drawn at once, because one group runs to the high hundreds and every row holds a live field.
`CAPS_ALPHABET` is what the caps only surface can draw.
A tally is `known` only when the caller passed that group's overrides; otherwise the rail shows the group's size.

## apps/desktop/src/language-editor/sub-components/text-groups/TextGroupRail.css

Selection uses the gold border and fill, not weight, because the tally already varies in weight and colour.
A finished group's tally turns gold.

## apps/desktop/src/language-editor/sub-components/text-groups/TextGroupRail.tsx

Each group shows its own tally, read from the same overrides the rows use.

## apps/desktop/src/language-editor/sub-components/text-groups/TextGroupRailItem.tsx

A group with no slots is listed with a plain note, so a translator is not left hunting for it.

## apps/desktop/src/language-editor/sub-components/text-groups/TextGroupsTab.css

The rail and the panel head stay in place while only the rows scroll.
The rail column is narrow because the rows carry the fields a translator types into.
The capped message sits at the foot of the drawn rows.

## apps/desktop/src/language-editor/sub-components/text-groups/TextGroupsTab.tsx

The groups on the left and the chosen group's slots as rows.
The list is capped, not virtualized, and the rest are stated as not drawn; search reaches them.
The search and the toggle are the tab's own state.

## apps/desktop/src/language-editor/sub-components/text-groups/TextSlotRow.css

The row is two lines, not four columns.
The pane is about 500px wide, and four columns left the field 26px wide.
The fit slot is always present, so metered and unmetered rows line up.
The placeholder uses the dim text colour, because the original must read like a typed value.
A full slot turns gold and a slot past full turns red.
The note is italic, so it reads as a standing fact about the slot.

## apps/desktop/src/language-editor/sub-components/text-groups/TextSlotRow.tsx

The original is the field's placeholder and the reference beside it, so an untranslated row shows the words the surface will draw.
Once words are typed, the original moves below the field.
The caution states what the surface can draw, not what the translator did wrong.

## apps/desktop/src/language-editor/sub-components/UnbuiltPane.css

The notice sits outside the covered region, because the scrim blurs what it covers.
The scrim takes the warning tone, because this lock is unfinished work, not a choice the owner made.
The scrim message is held at the top and stays sticky, because the covered list can run to a thousand rows.

## apps/desktop/src/language-editor/sub-components/UnbuiltPane.tsx

A pane whose editing surface exists but does not reach the game yet.
These tabs read the shipped text, measure it and keep what is typed, but nothing is baked into the assets.
The pane says so twice: in a notice that stays readable, and in a scrim that also takes the surface out of the tab order.
The surface stays visible so the shape of the work can be seen while it is decided.

## apps/desktop/src/language-editor/sub-components/variables/FindHardcodedDialog.css

The tick and the name lead, then the phrase, the counts and the near miss note, in a fixed order.
The note comes last because it does not change what applying does.

## apps/desktop/src/language-editor/sub-components/variables/FindHardcodedDialog.tsx

Lists every place the set spells a name out where it could reference the variable.
A reference follows a later rename, literal text does not.
The scan changes nothing; the dialog opens with every row unticked and states its totals before applying.
Near misses matched only with case ignored, so they are reported and never applied.
The ticked rows are the only state here, and they are dropped when the dialog closes.

## apps/desktop/src/language-editor/sub-components/variables/HardcodedGroupRow.tsx

The near miss count sits on its own row, because it belongs to that phrase.
A row with nothing to apply still appears, with its tick disabled.

## apps/desktop/src/language-editor/sub-components/variables/variable-token.ts

A variable the engine owns stays a control code, because the game substitutes it at draw time.
Every other variable is inserted as a reference, which survives a rename and becomes literal text only at bake time.
It returns null when an engine key is unknown.

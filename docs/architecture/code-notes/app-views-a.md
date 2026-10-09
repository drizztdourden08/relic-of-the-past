<!-- @layer docs @kind doc -->

# Code notes: app views A

Facts about the Data Manager and the HUD layout editor views that the code cannot say by itself. Each heading names a file or folder under `apps/desktop/src/views/`.

## DataManager

### DataManager/DataManager.css

`.data-manager` sets `user-select: text` to opt out of the app wide `user-select: none` in the design system reset. A selection can only be cleared by starting another one, so with every surface at `none` a stray selection here could never be dismissed.

The gap on `.data-manager__body` leaves room for the round toggle of the side nav, which straddles its right edge.

### DataManager/sub-components/LanguageManager.tsx

Creating or duplicating a set rebakes the asset blobs, so `busy` locks the list while one runs.

Deleting a set installed from the Hookshop uninstalls it the way the Hookshop tab does, so its install record goes too.

The duplicate source list leaves installed sets out. An installed set is copied through its origin bar, which checks the licence and keeps the credit.

`refreshThenSelect` rereads the list first, because after a duplicate or an update the set to show may be one the list has not read yet.

### DataManager/sub-components/MsuManager.tsx

A pack installed from the Hookshop is read only: its row carries the lock, its studio opens under the origin bar, and Delete uninstalls it the way the Hookshop tab does.

### DataManager/sub-components/ProfileManager.tsx

While the creation form has the randomizer enabled, the option catalog takes over the whole detail pane. The form keeps the fixed width list column and the options get the remaining side with their own scroll.

The randomizer form state is the option choices plus the connection fields, so it goes to `RandomizerOptionsPanel` whole. Listing the option fields again there would be a second list that forgets a row the catalog gained.

### DataManager/sub-components/RomKindTabs.tsx

The tab labels come from the ROM kind spec, never from a hardcoded or commercial title string.

### DataManager/sub-components/SpriteManager.tsx

The extracted list is reread when the background extraction for the active ROM lands (`spritesAvailable`), so a set that appeared on its own moves from available to imported without a remount.

### DataManager/sub-components/profile-manager/build-randomizer-config/

`buildRandomizerConfig` turns the randomizer fields of the creation form into the profile's `ProfileRandomizerConfig`.

The seed is thrown when the form opens (`freshRandomizerForm`), and again after each create. Every seeded preview on the options panel (the pond demands, the shelves a random scope opens) reads it while the player is still setting the profile up, so what they see is what they will get. A blank seed is refused by `randomizerFormError` instead of filled in, because a preview cannot be drawn from a seed that does not exist yet.

The options field freezes the entire catalog snapshot (schema v2): the baselines plus the choices the form exposes, read through the one choices to overrides reading that the live panel also uses. A row wired into one of them can never be missing from the other.

`EMPTY_RANDOMIZER_FORM` starts on the catalog baselines. Every plain switch is read off them, and every block starts on the same default setting its catalog rows are written from, so a fresh form freezes exactly the snapshot a bare catalog freeze would. In plain terms for a new profile: every dungeon keeps its own keys, maps and compasses; every shop slot but the hut's is ticked; the whole capacity feature is on, on the fresh profile ladders; every progressive tier ships and every family climbs its ladder in order, with arrows found and not bought; every family carries the copies it always carried and the hearts climb to the ceiling the game enforces; accessibility asks for every location reachable; dark rooms need a light and all four lights count.

A Custom wallet pins `carryMoreRupees` on the profile (`frozenSettings`), because the wallet ladder only ever lowers that setting's cap.

An Archipelago profile needs a server it can boot against, so `randomizerFormError` also checks the server draft in online mode.

### DataManager/sub-components/profile-manager/useProfileManager.ts

Escape is consumed (`preventDefault`) when it closes the new profile row, so abandoning the row does not also close the page.

### DataManager/sub-components/profile-manager/ArchipelagoFields.tsx

The Archipelago part of the creation form: the server setup that the Network tab also edits later, with its Test connection, then the two session switches a new profile starts with. After creation both switches live in the profile's Online settings.

### DataManager/sub-components/profile-manager/ProfileDetailPanel.tsx

Changing the MSU pack calls `reloadMsuForProfile`, so the new pack is audible now and not at the next boot. That call does nothing unless this profile is the one playing.

### DataManager/sub-components/profile-manager/RandomizerFields.tsx

The randomizer section of the creation form: the enable toggle, then seed and mode, and the server setup when Archipelago is picked. The seed arrives already thrown so the options panel can preview what it rolls. Typing over it is expected; emptying it is refused, because there is then nothing to preview from.

### DataManager/sub-components/profile-manager/RandomizerOptionsPanel.tsx

The complete option catalog of the randomizer, drawn next to the creation form when the randomizer is enabled, split beside the item pool it produces. The catalog is dealt into tabs by subject: the world, the ending it is played to, the items, the shops, the dungeon items, the capacity families, the wishing ponds, the subjects this version has yet to build, and everything else it fixes. Each tab keeps the panel order: the live sections first under their real catalog headings, then the block that tab exists for. A tab wears the number of its rows moved off the baseline, so a changed setting is never lost behind a tab nobody opened. A subject tab may also keep the fixed rows of its own subject, which is why the locked catalog is split the same way the live one is.

The feedback does not move with the tabs. The pool total sits under the tab strip as the footer of the options column, and the item pool keeps the right pane, collapsed until asked for. Every row carries its In Pool cell, computed live from the snapshot the current choices would freeze. The total, the fill bar and those cells all read the same accounting, so every edit moves them together.

Below `SPLIT_MIN_REM` the panel drops the pool pane and lists the item pool as the last tab (`POOL_TAB`). `SplitPane` stacks its panes below the same window width, so a panel wide enough to split never meets that stacking. Widening back to the split takes the pool tab out of the strip, and the pane holds the pool again. `OPTIONS_SHARE` is the share of the split the options keep.

The same panel shows the stored options of a profile read only. Given a `frozen` snapshot and no `onChange`, every row reads that snapshot instead of one rebuilt from `value`, every block gets no handler, and every value is drawn as a tag in place of its control. A profile made before a catalog change still shows what it was rolled with, and the creation screen and the Options tab of the Randomizer page are one view that cannot drift apart. `romFile` picks the extracted sprite set that illustrates the pool; `seed` is the seed every seeded preview reads.

### DataManager/sub-components/profile-manager/RandomizerOptionsPanel.css

The panel sits in the detail pane of the master detail layout, which already draws the surface, border and padding. Only the tab body scrolls: the header, the tabs and the pool total stay put, so the feedback for an edit never scrolls away with the rows.

`.randomizer-options__root` is the measured box: the panel reads its own width there to choose between the split and the pool as a tab, so it fills its host in both.

The changed count badge of a tab is gold, so a moved setting reads at a glance against the muted strip.

At 900px and below the options stack under the form column (`.master-detail--rand-options`) instead of squeezing beside it, because the split needs both columns.

### DataManager/sub-components/profile-manager/profile-presets/

The two presets of the creation form seed a profile with config overrides on top of the app's own `DEFAULT_SETTINGS`. A preset only touches the profile's own config; the randomizer is a separate choice on the same form and is never part of either preset.

Vanilla only pins the two fields the default does not already give: a 4:3 picture and Vanilla Safe, which forces every non stock behaviour off whatever else is stored. Enhanced is every field a reference profile diverges from the default on: general and display comfort settings, every rendering companion, and the HUD and world item presentation features.

### DataManager/sub-components/profile-manager/randomizer-options/OptionTabBody.tsx

The body of the selected options tab. Each tab keeps the panel order: the live sections the player may change first, still under their catalog headings, then the block that tab exists for, then the fixed rows of the subject. An unbuilt tab is one line and whatever locked rows the catalog files under it. Given no `onChange` the tab is drawn read only: no block receives a handler, and every row and block shows its value as a tag.

The capacity families and the wishing pond share the same physical slots, so those two tabs render the pair the capacity and pond rule allows instead of the raw choices, and an edit on either side re-points the other. The pond tab opens with that pair read back as plain sentences, derived on every render.

`walletFloor` is what these settings let the seed charge at once, and `capacity` is the families with the final wallet cap already standing on that floor. Every ceiling in the tab reads the held profile, so a shot cost, a shelf price, a throw and the wallet row never disagree about what the wallet holds. `heldPond` is the capacity pond as the seed will read it, held to what the wallet family can hold.

`pondProfiles` is what the three pond blocks hold; `shownPonds` is what the tabs show. The share switch is resolved by the model's own reader (`effectivePondProfiles`), never a second time here. While sharing, every pond edit goes to the capacity pond, so a frozen capacity pond freezes all three (`frozenPonds`). `FROZEN_PONDS` is the capacity pond alone: with the master switch off, the pond bound to the capacity families is not the player's to set. A live control that cannot change the seed is the thing to avoid.

Vanilla shops shuffle nothing, so with the shop mode on vanilla every control under it, the price rows included, is frozen.

`ShopSlotsBlock` gets the seed so the random mode draws its shelves from it, and the cards show the set this profile will open.

Only an edit to the capacity pond settles the capacity and pond pair through `withCapacityPondRule`; the other two ponds stand alone. While sharing, every edit lands on the capacity pond, so every edit settles it.

The world tab closes on the dark room section, and its light tiles read through the world item scope switch. The items tab reads its item power rows through the blade ticks above them: a row the ticks have decided is shown on and inert with the reason on it, and the stored answer is left untouched.

### DataManager/sub-components/profile-manager/randomizer-options/ponds-with-edit.ts

While the share switch is on, every pond reads the rows of the capacity pond (`pond-share.ts`). An edit from whichever tab therefore writes to the capacity pond, and the other two keep the rows they hold, which is what gives them back when the switch goes off again.

### DataManager/sub-components/profile-manager/randomizer-options/CapacityTabBody.tsx

The capacity tab: the four families under their master and progressive switches, drawn from the pair the capacity and pond rule allows instead of the raw choices, so an edit on either side re-points the other. Every edit leaves through the rule. `rule` is the pair after the rule settled it; `capacity` is the families with the final wallet cap already held to the floor.

### DataManager/sub-components/profile-manager/randomizer-options/OptionGroupList.tsx

The option rows a tab owns, each still under its catalog heading, each row carrying its In Pool cell. Without `live` the rows render as the fixed values of the catalog, the shape the locked sections take. `frozenKeys` names the rows a sibling setting has taken out of the player's hands, so they grey out instead of offering a control that could not change the seed. `notes` carries the sentence naming that setting, one per row, so the reason sits on the row it explains.

### DataManager/sub-components/profile-manager/randomizer-options/LockedRowsSection.tsx

The fixed rows a tab keeps beneath its live ones, merged under one heading. Nothing here unlocks anything: every row renders as the catalog defines it, control disabled, with the catalog tag saying whether the value is fixed by this version or the feature is absent.

### DataManager/sub-components/profile-manager/randomizer-options/SubjectFixedRows.tsx

Which tabs keep a fixed section is the answer of `SUBJECT_FIXED_TABS`, so a subject that grows a fixed section is one entry there and nothing in the layout. The body branches on `isSubjectFixedTab` and `isUpcomingTab`, never on another comparison in the layout.

### DataManager/sub-components/profile-manager/randomizer-options/UpcomingTabBody.tsx

A tab whose whole subject is still to be built. Rows the catalog already carries for it are shown under the one heading, locked as the catalog defines them. A tab with no rows yet is that heading on its own: an honest empty page instead of a heading over nothing.

### DataManager/sub-components/profile-manager/randomizer-options/choice-edit.ts

`choiceEditOf` builds the edit handlers of the tabs from the one change callback the panel holds. A read only panel holds none, so every handler it builds is absent, and an absent handler is what draws a block as a readout. That keeps the wiring of each block to one line whichever way the panel is shown.

### DataManager/sub-components/profile-manager/randomizer-options/option-tabs-of.ts

The tab strip of the options panel, in the order of the tab model (`OPTION_TAB_IDS`), so a tab cannot exist in one and be missing from the other. Each tab wears the number of its rows off the baseline; a tab with nothing changed wears nothing, so the badge only ever means a setting in here was moved.

### DataManager/sub-components/profile-manager/randomizer-options/value-for.ts

The master switch and the pond mode rows are read off the snapshot instead of the raw choices. The snapshot is the pair after the capacity and pond rule settled it, so the row says what the seed will be built from, not what was asked before the rule answered. Plain unlocked rows go through the catalog key to form field map (`PLAIN_FIELD_BY_KEY`), so a new unlocked toggle is one map row plus its form field.

### DataManager/sub-components/profile-manager/randomizer-options/choices-after-row.ts

A pond mode row rewrites that pond. Only the capacity pond is bound to the capacity families, so only its move asks the rule to settle the pair. A select row writes the catalog key, a slider a number and a toggle a boolean, because coercing a chosen key to a boolean would store `true` for every value the row offers. A row no field backs leaves the choices as they were.

### DataManager/sub-components/rom-manager/RomDetailPanel.tsx

A base cartridge keeps its extract assets action (`AssetsRow`). A supplement has none, because there is nothing to extract from it on its own, so it shows which bases currently carry its sidecar (`SupplementRow`).

### DataManager/sub-components/rom-manager/RomList.tsx

One list for both kinds: base cartridges with their extraction status, and supplement cartridges with their attachment status. A supplement has no extraction of its own, only a sidecar per attached base.

### DataManager/sub-components/rom-manager/useRomManager.ts

The supplement list is fetched apart from the `romStatuses` prop, because supplements carry no extraction status of their own. The attachment of a supplement only shows once the rebuild that `romStatuses` reports on finishes, so the list is reread whenever that prop changes.

A supplement only reaches the game through a rebuild of the base blob that carries it. A successful supplement import therefore calls `onExtractAssets` for every base cartridge that already has assets built (`triggerRebuild`): the same call the base lane makes for itself, fanned out.

## DataManager MSU studio

### DataManager/sub-components/msu/behavior/effect-query.ts

The effects search is split into which port and what to look for. A port tag such as `sfx2` must mean the port: as plain text it matches nothing and would empty the list. The tag can sit anywhere in the query. `channel` is null when the query names no port and both ports are in play; `text` is what is left to match ids, names and triggers against. A second port named after a first is a contradiction, not a widening, so the later one wins.

### DataManager/sub-components/msu/behavior/layer-target/

Where a layer list lives inside a manifest. A music slot and a claimed sound hold the same layer shape in two places, so the editor gets a pair of accessors (`read`, `write`) instead of a slot number: the Strategy pattern. `previewKey` identifies the target in the live report, so a layer card's readout knows it is the one playing. `oneShot` is true on the effect channels, where a looping layer has nothing to end it and would follow the player around.

### DataManager/sub-components/msu/behavior/pack-manifest/

The studio works against an effective manifest: the pack's own when it has one, otherwise a synthesized single layer view of its numbered files (`effectiveManifest`). Only an explicit save writes one out.

`singleTrackManifest` is what the preview engine is handed: the one track asked for and nothing else to decode. `withTrackLayers` inserts the track when it is new. `bodyLayer` is the default layer for a slot: `single` with one file (it repeats at the file's loop point), `sequential` with several. `withTrackFiles` replaces the files of a track's first layer, which is the assign this file to this slot edit. `withTrackFilesAdded` adds uploaded files to that first layer and keeps what is already there.

### DataManager/sub-components/msu/behavior/park-file.ts

Clearing a slot moves its file out of the numbered range (a `-unused` name) instead of deleting it, so clearing destroys nothing.

### DataManager/sub-components/msu/behavior/preview-key/

Keys for the live report. Slot 5 and sound 5 are different auditions, so a bare number will not do.

### DataManager/sub-components/msu/behavior/preview-report-store.ts

A frame rate feed of the preview's live state, kept outside React: pushing it through state would render the whole slot list sixty times a second. Readouts read it through `useSyncExternalStore`. A report's `key` says which audition it is, so a readout can tell nothing from something else; `detail` is a short live note beside the clock, such as how many effects overlap.

A frame that would draw the same as the last is not published. The signature rounds every number to the precision it is shown at, the finest thing drawn from it: the countdown, the elapsed clock and the position driving the sound bar's width are tracked to tenths (`TENTHS`), and a duration, which only changes with the file, to whole seconds (`SECONDS`). It walks every voice, since one voice moving is a visible change, and it includes the voice count, since a voice starting or ending adds or removes a row. A silent layer's row shows the last file played, so that is in the signature too.

`getSnapshot` returns the same object until the next publish, so a selector reading one layer out of it stays referentially cacheable.

### DataManager/sub-components/msu/behavior/save-bytes.ts

A blob download is the one save path both hosts share; there is no save file IPC channel. The desktop shell has no `will-download` handler, so Chromium shows a real save dialog. The object URL is revoked after `REVOKE_AFTER_MS`, because revoking it straight away can race the download starting.

### DataManager/sub-components/msu/behavior/sound-channel-kind/

The channel index and additivity come from the engine (`SOUND_CHANNELS`), so the previewer cannot number a channel differently. `channelIndexOf` is the index `onGameSound` takes: 0 ambient, 1 sfx1, 2 sfx2. The effect channels are additive: each trigger layers over whatever is still sounding.

### DataManager/sub-components/msu/behavior/sound-manifest/

A manifest is written whole, so every function here touches one channel and copies the rest forward. An empty channel is removed and an empty `sounds` key dropped (set to `undefined`, which serializes away), so claim then unclaim leaves the file as it was found. `withSoundLayers` carries the rest of a sound definition instead of rebuilding it. Only a claimed sound can carry a continuity group (`withSoundGroup`). `withoutSound` unclaims a sound so the sound chip plays it again. `singleSoundManifest` is what the preview engine is handed: the one sound asked for and no music, so only that decodes.

### DataManager/sub-components/msu/behavior/sound-subtitle.ts

The sentence under a sound channel's title. Effects channels say how much of the range the game raises; the ambient channel says how much is hidden. Each effects port names itself so two lists of the same ids do not read as one. `raisedCount` counts the rows the generated catalogue has a call site for; `reachableCount` (ambient only) the rows the game can reach; `hiddenCount` the rows the reachable trim holds back.

### DataManager/sub-components/msu/behavior/track-file-name/

Filename rules for numbered slots. Without a manifest the number at the end of a filename is the slot, and the prefix must match what the pack already uses: `pack-05.pcm` has prefix `pack-`, number `05` and extension `pcm` (`NUMBERED_RE`). `sanitizeFileName` makes a name the user brought in safe to join onto a pack path. `uniqueFileName` returns the name, or the first variant with a `(2)` style suffix the pack does not hold.

### DataManager/sub-components/msu/msu.type.ts

A pack carrying a `pack.json` is layered; one with only numbered audio files is classic (`PackFormat`). `MatchedTrack.layerCount` is how many layers the manifest gives the slot, 0 for a slot the manifest does not cover. `ActionResult` is the outcome of one storage action, phrased for the status line of the panel.

`MsuEffectsPanelProps.manifest` is what the rows and editors show; `saveBase` is what a save writes into. `readOnly` marks an installed pack: sounds play, nothing changes.

On a track row, `playingOriginal` is true while the sound chip's own version of the slot is the one sounding. On a sound row, `label` exists only for unambiguous ids and `triggers` describes the rest; `hex` is the id as the studio shows it (`0x0C`); `sites` is how many places raise it, roughly how often it is heard; `layerCount` is 0 while the pack leaves the sound to the sound chip; `unlisted` marks an id the pack claims that the catalogue does not list; `role` is what the id does on the ambient channel, null on the effects channels, which have no roles; `unreachable` marks an id nothing in the game can raise, shown only on request.

`showChannel` tags a row with its channel wherever one list holds more than one, because the channels do not share id spaces. `additive` is set on an effects channel, where every press adds a sound, so play never becomes stop. `chipAudible` is null while the channel is still being scanned and false once known to make no sound.

`SoundPanelController` is one channel's wiring, handed around whole. A list showing two channels keeps one each and picks by row, so `SoundListItemProps.sound` is the controller for that row's channel, not for the list.

### DataManager/sub-components/msu/behavior/get-track-number.ts

Delegates to `trackNumberOf` in shared, so the studio and the pack loader can never disagree on the slot number of a file.

### DataManager/sub-components/msu/msu.constants.ts

`AUDIO_ACCEPT` lists what a drop zone accepts. Nothing is transcoded on the way in; the engine decodes each of these itself. `AMBIENT_ROLE_HINTS` explain each ambient role in the row tooltip, because the labels alone are too terse. `SOUND_FILTER_HINT` and `SOUND_FILTER_PLACEHOLDER` are one spelling of the sound search, so the single channel tab and the merged one read alike.

### DataManager/sub-components/msu/sound-labels/

`SOUND_CHANNEL_TAGS` are the row tags for a list holding more than one channel; they must stay legible at the width of the id column. The two effect channels share a tab but are separate id spaces, so every row there is tagged. `STUDIO_TABS` put Music first, since that is what most packs only have, and Files last, since the file pool is not something the game asks for. `listSummary` shows the first `NAMES_SHOWN` names then a count; the full list stays in the row tooltip.

### DataManager/sub-components/msu/useMsuManager.ts

Composes the hooks in `behavior/` into one flat surface. Every action's outcome lands in one status line.

`skipNote` names both kinds of skipped file on an import (files in subfolders, files whose slot another file already claimed). Both are normal for a pack that ships extras, but silence would read as everything came in.

A dropped `.msul` carries its own manifest, so it becomes a layered pack, not a raw copy.

`loadingFiles` is true only while the first read of a pack is in flight. A reload keeps the studio mounted with its current rows, so an edit never blanks the pane and throws the scroll position away.

### DataManager/sub-components/msu/behavior/useAudibleIds.ts

Which ids on a channel the sound chip makes a sound for. The list shows every id, since the catalogue cannot see ids picked from a table at runtime, so each is rendered once to tell the dead tail apart. The scan is deferred a tick past mount so the tab paints first; it also warms the core load.

`audible` is null until the scan has run, so rows show no verdict instead of a wrong one. An empty result means the core could not render, which is not the same as all silent, so it is stored as null.

`span` keys the effect on the ends of the id range. The array is rebuilt every render, but its contents are a fixed range per channel, so depending on it directly would rescan continuously.

### DataManager/sub-components/msu/behavior/useFileAudition.ts

Holds only the name of the file playing; one at a time is enforced by the engine underneath. The playhead is not held here, because it would render the list every frame; the player reads it off the handle. Repeat points are learned by playing (`loopOf`: seconds the file repeats from, null when it declares none, undefined until it has played), since reading one costs the whole file.

Only the newest press (`latest`) may publish what is playing; the engine already silenced older nodes. Leaving the tab stops the audition, because leaving the panel means stop, not a background player.

A new `files` identity means the disk moved on. Only what is gone is forgotten: renaming one file while listening to another must not cut the listening short or drop other repeat points. Another pack is another pool entirely, even where two share a filename.

### DataManager/sub-components/msu/behavior/useFilePanel.ts

The files tab, wired. Metadata comes from `packFileMetadata`, which opens no file. A repeat point is not read here: it needs the bytes of the file, and a whole list would pull gigabytes through memory. `useFileAudition` learns it on play.

`saveBase` is what a rename writes into, null for a classic pack, which must stay classic. A rename keeps the extension, because it says how the audio is encoded. Storage moves the bytes only, so a pack with a manifest is re-pointed in the same step (`withFileRenamed`), or every layer built on the file would stop finding it.

`ready` stays false until the metadata has settled for the current pack, so the panel shows nothing instead of a false empty state. The previous metadata stays up during a reread. `formats` counts the files of each format, the biggest group first. `report` lets an action owned by the panel above, such as a bulk removal, land in the same status line.

### DataManager/sub-components/msu/behavior/useFileUsage.ts

Maps a filename to the slots and sounds that name it, in the wording the studio uses elsewhere. It is built once per manifest so rows do not each scan it.

### DataManager/sub-components/msu/behavior/useOptimize.ts

Get the tool, measure, show the numbers, convert. Measuring runs on its own once the tool is available, and nothing is written until the numbers are accepted. The `tool` step covers both offering the download and watching it arrive. `open` false tears the flow down, so reopening starts from the tool check again.

The pack is reread the moment a run settles (`onRunSettled`), success or failure, not when the dialog closes: the run rewrites the manifest as it goes, and an edit saved from the stale copy would write the old references back. A failed run may still have converted part of the pack, so the reread is unconditional. Only the candidates a run would touch count (`convertibleNames`); an unreadable file is not one of them. Measuring moves the step on, so the effect that starts it cannot trigger itself again.

### DataManager/sub-components/msu/behavior/useOriginalPreview.ts

Auditions the sound chip's own version of a sound or track. It is separate from `useSoundPreview`, which builds a whole pack session; an original is one buffer. The button is never disabled on an availability check: whether the core can render changes when the game boots, with no render here to notice, so pressing always tries and says why if it cannot.

`playing` is the id whose original is sounding, so a row can light its own button. A second press on the one sounding is a stop, the way the pack preview behaves. The button lights straight away, because the first press may wait on a core load and a control that does nothing for a second reads as broken. A failed start clears only the row that call was for, since another press may have superseded it. Switching channel or leaving the view silences it.

### DataManager/sub-components/msu/behavior/usePackContents.ts

The files, slots and manifest of the selected pack; `reload` rereads after every edit. Only a pack switch starts from nothing; a reload keeps the contents up, so `loaded` survives it.

### DataManager/sub-components/msu/behavior/usePackExport.ts

Exports as `.msul` (whole) or MSU-1 (flattened, playable elsewhere). MSU-1 decodes through an `OfflineAudioContext`, because an ordinary context would hold the sound card open for the whole export. The `.msul` entries are read at export time, not from the studio's copy, so the archive is the folder as it is now.

### DataManager/sub-components/msu/behavior/usePackImport.ts

Reads a dropped `.msul` into a pack. The install itself lives in `packages/msu/src/msul/install-msul-pack`, shared with the file association path and the store. A pack that lists more than it holds is named at once, while the archive is to hand.

### DataManager/sub-components/msu/behavior/usePackList.ts

The pack list, selection and whole pack operations. Manifests are read here so rows need not ask storage. `listMsuPacks` counts only the two MSU extensions, so a layered pack full of wav or flac would report nothing; the audio listing is the one that sees every playable file.

### DataManager/sub-components/msu/behavior/usePreviewReport.ts

Subscribes one component to the live report, so only it redraws per frame. It checks the key because auditioning one thing while another is expanded is normal.

### DataManager/sub-components/msu/behavior/usePreviewSession.ts

One AudioContext, one engine, one polling loop. The preview owns its own context, because the editor works with no game running and a shared context could outlive the panel. A second audition or leaving the panel tears the pair down. The engine is polled once per animation frame into the preview report store, and the loop ends itself when there is nothing to poll. The caller supplies the manifest (only what this audition needs, so nothing else in the pack is decoded), the start call and the reader, so slots and sounds share this. One store lives for the whole life of the hook, so a subscriber never has to resubscribe.

The engine plays the literal slot (`isDeluxe: false`), never the extended remap: the row the user clicked is the row to hear. A suspended context would decode and schedule silently, so `start` waits for it to resume, and gives up if it was stopped or superseded meanwhile. `start` resolves true once the audio has started, false when there was nothing to play. `retrigger` fires again into the running session, since additive channels add a sound per press; it returns false with no live session.

### DataManager/sub-components/msu/behavior/useSoundPanel.ts

One sound channel's tab, wired. The filter and the unreachable toggle are owned by the list, so two channels shown as one list search as one. Replace only opens the editor: an empty claim would silence the chip's version, so the editor's save writes the claim. Unclaiming is a real write. `manifest` is what the rows and the editor show; `saveBase` is what a write goes into, the pack's own manifest when it has one.

One thing sounds at a time, so each start silences the other. `closeLayers` exists for a list drawing on more than one channel: opening a row there has to shut the row open on the other, or two editors sit open at once over one shared save.

### DataManager/sub-components/msu/behavior/useSoundPreview.ts

Auditions one claimed sound through `onGameSound`, as the game raises it. On an effects channel a repeat press fires into the running session, because rebuilding would turn overlap into a stutter. The ambient channel is stateful, so there a repeat press replaces the bed, as in the game. `playing` is the preview key of the sound the session belongs to, which a row compares against. The overlap count shows only while more than one set is sounding. Leaving the tab or switching packs silences whatever is playing.

### DataManager/sub-components/msu/behavior/useSoundRows.ts

One channel's catalogue crossed with what the pack authors. Replaced rows are lifted to the top with a stable sort, so the catalogue's busiest first order survives inside each group.

Effects channels list every id, not only the named ones: the catalogue reads the game's source and cannot see an id picked from a table at runtime, such as the sword beam by sword level. Such ids are still named (`soundName`), because a documented name is the only description there is. Id 0 means nothing to play, so the range starts at `FIRST_PLAYABLE_ID`. Only the ambient channel has a reachable set (`ambient-reach.ts`); it defaults to the ids the game can reach, the rest stay a toggle away, and a claimed row is always listed, because hiding someone's existing work would leave them no way back to it.

`raisedCount` is said once at the top instead of on fifty rows. `unreachableCount` counts over the whole range, so the number the toggle offers does not change once it is on.

### DataManager/sub-components/msu/behavior/useSoundUpload.ts

Drops audio into the pack without claiming a slot: only a safe unused name is needed. It is not the track upload with a flag, because that hook's weight is the slot naming (prefix, number, extension).

### DataManager/sub-components/msu/behavior/useSupersededFiles.ts

Originals a converted file has taken over from: the same stem in the target format. There is no record of a past run, and none is needed. Removing them re-points the manifest first, so a reference the conversion did not move cannot leave its slot silent. `saveBase` is null for a classic pack, whose filenames are its wiring. Files are deleted one at a time: a hundred concurrent deletes buy nothing over a directory being rewritten anyway.

### DataManager/sub-components/msu/behavior/useTrackAssign.ts

Assign this file to slot N, as a change on disk. Classic packs have no manifest, so the filename is the assignment and the file is renamed; in a layered pack the manifest is, so files stay. Occupancy is a question about the number, not the name: `pack-5.pcm` and `pack-5.wav` would both claim slot 5, so an exact name check would leave the pack ambiguous. When both files must move it is a true swap, so neither is lost: the displaced audio takes the name the newly assigned file gave up, which keeps it visible in the pack.

### DataManager/sub-components/msu/behavior/useTrackPreview.ts

Auditions one music slot as the game would hear it. The session underneath owns the context, the engine and the polling. A failed start clears only the row that call was for. Leaving the panel or switching packs silences it.

### DataManager/sub-components/msu/behavior/useTrackRows.ts

Every vanilla slot is listed, filled or not; extended slots join only for an extended pack. A number the game never asks for is not a slot, so such files show only in the file list as unused. The vanilla range is a property of the format (`VANILLA_TRACK_COUNT`), not of the name dataset, which would otherwise turn a slot with no name into a slot that is not there. Extended slots come from the tables, so an extended pack shows every slot it could fill.

### DataManager/sub-components/msu/behavior/useTrackUpload.ts

Drops audio straight into a slot. Nothing is transcoded, so the only decisions are the file's name and what to do with the slot's occupant. Progress goes through the shared import bus. In a classic pack the first file has to land on the slot's own name; extra files, and every file of a layered pack, keep their own names and are wired up by the manifest. Any file already numbered for the slot moves aside, whatever its extension.

### DataManager/sub-components/msu/FileRow.tsx

One file in the pack: what it is, what plays it, and its name. The name is editable here because in a pack without a manifest the name is the wiring, and everywhere else it is the only handle the layer editor offers for picking a file. A rename commits when the field is left, never per keystroke: every commit copies the bytes to the new name and re-points the manifest, which is not something to do once per letter.

The card is the entry and the grid row is only its top line, so the player opens inside the file it belongs to instead of under it. Every cell sits in the column template the list declares, so a row cannot lay itself out and drift out of line with the header.

Length, rate and channels are known for MSU-1 pcm alone. That format fixes the rate and the channel count, so all three follow from the byte count; an encoded file would have to be decoded to answer, so it reads as unknown (`UNKNOWN`), not as zero. A repeat point needs the file itself, so it appears once the file has been played. `usedBy` empty means nothing plays the file. `loading` is true while its bytes are fetched and decoded, before a note sounds.

Escape has to be known to the blur that follows it in the same tick, so `cancelled` is a ref, not state. Escape is consumed (`preventDefault`), so abandoning a rename does not also close the page.

### DataManager/sub-components/msu/MsuEffectsPanel.tsx

Both effect channels as one list with one search box: guessing which of two lists held a sound was the problem. The channels stay separate id spaces (0x12 differs per port), carried by each row leading with its port. Each channel keeps its own controller; this panel hands them one query, picks the right one per row, and keeps them from sounding at once. A port tag in the search box means the port, not text to find, so it narrows the merged list.

The ids interleave in one list: 0x01 on both ports, then 0x02 on both. Grouping by port would put the two lists back, only without the headings that made them navigable. Each channel silences only its own audition, so the list stops the other one itself, and only one row editor is open across the whole list, or two editors would sit open over one shared save. Rows are keyed by channel and id, because the ports share id numbers.

### DataManager/sub-components/msu/MsuFilePanel.tsx

The pack as files, not slots. The drop zone and the format conversion live here because the files are one shared pool that every slot and sound draws from. `manifest` is what the rows credit a file to: the pack's own manifest, or the classic view of its files. `saveBase` is null for a classic pack, which stays classic.

`EMPTY_PACK` blocks the conversion, since there is nothing to convert in a pack with no audio. `NO_USES` is one stable empty list, so a row with no uses is not handed a fresh array on every render. `COLUMNS` are the headings in grid order and must stay in step with the CSS template that sizes them; the last one is the row's buttons, which need the width but not a heading.

Deleting a file a slot still names leaves that slot silent, so the confirmation names the slots. Superseded originals are normally orphans; one still named by a slot is re-pointed to its converted file first. Nothing renders until the first metadata read settles, because an empty state would claim the pack has no files.

### DataManager/sub-components/msu/MsuPackHeader.tsx

Standard or Extended matches the wording of the audio settings; Layered or Classic is whether a manifest exists. An installed pack keeps its name, and it still exports.

### DataManager/sub-components/msu/MsuPackToolbar.tsx

One name field serves both a new empty pack and an import, because two fields invite filling in the wrong one. `nameInstalled` is true when the name is a pack installed from the Hookshop, which nothing may write into.

### DataManager/sub-components/msu/MsuSoundPanel.tsx

One sound channel on its own tab. The filter is owned here, not in the hook, because a list built from more than one channel has to put one query across all of them. `showUnreachable` is off by default: the ids it reveals are ones nothing in the game can raise. `hasHidden` is only true where a reachable set exists to hide anything, which is the ambient channel.

### DataManager/sub-components/msu/MsuStudio.tsx

The selected pack's studio: its origin bar when it came from the Hookshop, then the music, ambient, effects and files tabs. An installed pack is read only in every tab: it plays and exports, and nothing that writes into it is on. `origin` is null for the player's own pack. The tab is owned by the manager, so it holds while another pack loads.

A music audition is owned above the tabs, so leaving the music tab silences it; the sound tabs stop themselves by unmounting. The files tab gets the pack's own manifest as `saveBase` (null for a classic pack), because a rename must not hand a classic pack a manifest.

### DataManager/sub-components/msu/MsuTrackPanel.tsx

The original music of the sound chip is previewed here (`useOriginalPreview('music')`), not passed in, because it needs only the slot number. One thing sounds at a time, so each start silences the other. `reportStore` is the live per layer feed of the preview, read only by the readouts that draw it. `onConfirm` is the app's confirm dialog, for a layer edit that discards files.

### DataManager/sub-components/msu/PackSummary.tsx

The format breakdown lives here because it decides whether a pack plays everywhere: only MSU-1 pcm is native to every build. `formats` has one entry per format present, the biggest group first. `unusedCount` counts the files no slot and no sound names. `supersededCount` counts originals a same stem converted file has already taken over from; the remove button appears only once there is something to remove. `optimizeBlockedBecause` says why the conversion is not on offer, null when it is.

### DataManager/sub-components/msu/SoundDetail.tsx

The drop zone adds to the pack's pool, not to this sound; the layer editor below is where a file gets used. The continuity group field is sound level, so it sits beside the editor, and it only shows once the sound is claimed. `unclaimed` is true while nothing claims the sound yet, so the first save is what claims it.

### DataManager/sub-components/msu/SoundGroupField.tsx

The continuity group is a free text name, not a toggle, because the relation is between sounds. It saves on blur straight into the manifest; it is sound level, so it cannot ride the layer editor's save. The field resyncs when the saved group changes underneath.

### DataManager/sub-components/msu/SoundListItem.tsx

Shared by the ambient list and the merged effects list so the row, readout and editor stay together. The channel's controller arrives whole; a merged list picks one per row.

### DataManager/sub-components/msu/SoundRow.tsx

Identity reads name then evidence: the catalogue name on top (a best guess) and the game's own function names beneath (not a guess). An id with no name is named by its functions; the full trigger list stays in the tooltip. Play never becomes stop on an effects channel, because pressing it again is meant to add a sound. With nothing replacing it, play means the chip's own version, which is the sound there.

The role badge says what the id does on its channel, which decides whether a replacement can work. The Never raised badge shows only because the unreachable ids were asked for, so it says why the id was hidden. The Silent badge is only worth showing on an id with nothing on it, since the pack could still put a sound there.

### DataManager/sub-components/msu/TrackDetail.tsx

There is deliberately no drop zone here: files are a pack level pool, and a per slot target implied ownership.

### DataManager/sub-components/msu/TrackSection.tsx

One titled band of slots, with the expanded slot's editor spliced in directly beneath its row, and the live readout opening under whichever row is playing.

### DataManager/sub-components/msu/LayerEditor/LayerEditor.tsx

Edits one slot's layers and writes them to the pack's manifest. Saving a pack that has no manifest yet writes one for the whole pack, not just this slot: the draft is seeded from the synthesized single layer view, so the other slots are kept exactly as they played before. That is the moment a classic pack becomes a layered one, and the subtitle says so before the user commits to it. A loop point applies to a single file layer, so only each layer's first file is consulted for its loop sample.

### DataManager/sub-components/msu/LayerEditor/LayerEditor.type.ts

`ConfirmRequest` asks the app's own confirm dialog a yes or no question and runs the callback on a yes. It is the signature the rest of the manager already takes, so an editor nested in it hands the request up instead of standing up a dialog of its own. `onConfirm` is used for the one edit that costs the layer something (see `useModeChange`).

`target` says which layer list is edited: a music slot, or a sound on one of the three channels. `manifest` is what the editor shows: the pack's manifest with its classic files filled in.

`saveBase` is what the editor writes into. For a pack that already has a `pack.json` it is that file as it sits on disk, so saving one slot leaves the rest of the pack out of the manifest and still playing through the classic fallback; otherwise a single edit would freeze all of the roughly 100 numbered files into authored entries. For a pack with no manifest yet it is the synthesized whole pack view, which is exactly what the first save is meant to create. A sound's layers are written into the same base for the same reason, and the write only rebuilds its own channel (see `sound-manifest`).

`isLayered` is false while the pack has no `pack.json`; the first save creates one. `reportStore` is the live feed of the preview: each card gets its own readout element, so a saved layer shows what it is doing while it is edited. `readOnly` marks an installed pack: the layers show as they are and every control that changes them is off.

### DataManager/sub-components/msu/LayerEditor/behavior/layer-ops/

The pure edits behind the layer editor, kept out of the hook so each can be read on its own.

A layer's `id` is generated once, at creation (`createLayer`), and never rewritten. The resume snapshot in a save file is keyed by it, so a regenerated id would silently drop that layer's position and restart it from the top on load. A new layer starts in the mode its channel can end in: an effect channel gets `once`, because it is fired at a moment and is over, and a loop there would still be playing long after.

The optional scheduling fields are held explicitly while editing, since a control cannot render `undefined`, and dropped again on the way out when they carry their default (`normalizeLayers`). A pack that uses neither crossfade nor wait for completion is therefore written exactly as an older studio wrote it. `DEFAULT_CROSSFADE_SECONDS` is 0: no overlap, one pass cuts straight to the next, which is what a lone looping file wants. `DEFAULT_WAIT_FOR_COMPLETION` is false: the gap is timed from the sound's start, so a long sound overlaps the next; that is the historical default.

An absent crossfade is legal and means off; a present one has to be a real duration between 0 and `MAX_CROSSFADE_SECONDS`. `normalizeLayers` also clamps a crossfade a hand edit put out of range. `validateLayers` returns the first reason the layers could not play, phrased for the error line of the editor.

### DataManager/sub-components/msu/LayerEditor/behavior/useLayerEditor.ts

Holds the layer list being edited and writes it back to `pack.json`. The draft is seeded once, on mount. The editor is mounted with a key of pack and target, so switching slots or sounds gives a fresh draft and an edit in progress is never overwritten by a background reload of the pack. Reading and writing go through the target, so this hook is the same for a music slot and a claimed sound. `manifest` seeds the draft with the merged view, so a classic slot shows the layer it plays today; `saveBase` is what goes to disk. The layers are normalized on the way out only: the draft keeps the optional fields so the controls have a value to render, while the file gets none it does not need.

### DataManager/sub-components/msu/LayerEditor/behavior/useFileLoopSamples.ts

The loop point each of these files declares, to show what a slot already does before anyone sets anything. Without it, the Repeat from field opened at 0 on a track that plainly repeats from 13 seconds: the manifest had no loop point, so the field showed the manifest, while the value in force was the one inside the `.pcm` header. Reading it here means the control opens on the effective value, and an author starts from what they can hear. It takes the whole set of names so the editor resolves every layer in one hook, since a component cannot call one hook per layer in a loop. Only `.pcm` costs a read; every other format answers null without being opened. The names arrive as a fresh array each render, so the effect keys on the joined names.

### DataManager/sub-components/msu/LayerEditor/LayerEditor.css

The crossfade and wait switch blocks are framed and inset from the controls above them, so neither is mistaken for another volume style slider or for body copy; both were. The number box and the state chip sit beside the crossfade slider, so the slider gets a floor wide enough to stay draggable and a ceiling that leaves room for them. The effect chain uses the same framed inset block for the same reason; each effect is one line with its place in the chain leading, so the order reads top to bottom.

### DataManager/sub-components/msu/LayerEditor/sub-components/CrossfadeField/CrossfadeField.tsx

The crossfade window of a looping layer: a framed block with a number box and a state label, not a bare slider, because a slider at zero draws no fill and was invisible under the Volume slider. Zero means no overlap, a distinct behaviour, so it is named instead of reading as unset. The value is rounded to hundredths: the arrows step by 0.25, and rounding 0.25 or 0.75 to a tenth moved the value just set. `layerId` keeps this control apart from any other on screen.

### DataManager/sub-components/msu/LayerEditor/sub-components/IntervalTimes/IntervalTimes.tsx

The offsets are seconds from the moment the slot started. They are kept sorted and free of duplicates, because two identical offsets would schedule the same sound twice.

### DataManager/sub-components/msu/LayerEditor/sub-components/LayerCard/LayerCard.tsx

Presentational: every edit leaves as a patch, so the card never knows whether it is savable. `NO_EFFECTS` is one stable empty chain, so a layer without effects is not handed a fresh array on every render. `single` is the order where one track repeats on itself: the layer holds exactly that file, and only that order ever reaches a file's own end, so the loop point field shows only then. `live` is the readout, supplied ready made so the card stays presentational while it redraws. `fileLoopSample` is the loop point the layer's own file declares, used when the manifest sets none.

The Chance slider is rolled each time the layer starts. Some effects fire on a fixed cycle, which a real recording turns into a metronome; thinning them breaks that up.

### DataManager/sub-components/msu/LayerEditor/sub-components/LayerCard/behavior/useModeChange.ts

`single` holds one file, so switching into it drops the rest. The question is asked before the order changes, so a refusal leaves everything as it was, and files and mode go out as one patch, so a save or revert cannot catch the layer half changed. Only the crossing into `single` costs files; being there already, or leaving it, costs none. The confirmation names the surviving file and counts the dropped ones (`singleDiscardMessage`), because the rest are removed needs a number.

### DataManager/sub-components/msu/LayerEditor/sub-components/LayerEffectsField/LayerEffectsField.tsx

A preset is a starting point, not a mode: choosing one writes its effects onto the layer. There is no custom entry; the picker derives its value by comparing the chain to each preset (`presetOf`, empty when it matches none, including an empty chain) instead of remembering the choice, so it never claims a state the numbers do not bear out. Effect rows are keyed by index on purpose: an effect has no identity beyond its place in the chain.

`DEFAULT_EFFECT` is where a newly added effect of each kind starts, audible but not drastic. `MIN_HZ` and `MAX_HZ` are the range of the ear, give or take; a cutoff outside it does nothing a listener could hear. `MAX_DB` of 12 covers every tasteful move and most of the others.

### DataManager/sub-components/msu/LayerEditor/sub-components/LayerEffectsField/sub-components/EffectRow.tsx

Changing the kind resets the effect to that kind's default, because a cutoff in Hz has no meaning as a band gain in dB.

### DataManager/sub-components/msu/LayerEditor/sub-components/LayerFileList/LayerFileList.tsx

Order matters: sequential loops play top to bottom and the resume snapshot stores an index, so reordering is an explicit move. A pool capped at one file says so in words instead of showing a greyed out picker, since the reason lives two controls further up the card. An empty single file layer still needs its one file, so the cap only closes once the layer is full.

### DataManager/sub-components/msu/LayerEditor/sub-components/LoopPointField/LoopPointField.tsx

The loop point of a looping layer. MSU-1 stores it in the `.pcm` header as a sample count; other formats have nowhere to put it, so it lives in the manifest and overrides what a `.pcm` declares. It is edited in seconds and stored in whole samples, the only resolution the format stores. The seconds are rounded to the millisecond for display only (a real track gave 13.181768707482993), because a loop a few samples off clicks. The manifest value wins; the file's own point is what the slot does until someone overrides it. `MAX_LOOP_SECONDS` is an hour: past that it is not an intro any more. `layerId` namespaces the input id, so several layer cards on screen do not share one.

### DataManager/sub-components/msu/LayerEditor/sub-components/PlayModeFields/PlayModeFields.tsx

Switching mode replaces the parameters wholesale; edits within a mode spread the current mode, so changing the order does not reset the crossfade. The crossfade and wait switch get framed blocks because both were missed among look alike controls. Repeatable controls take an id from the layer, because the switch otherwise derives its id from its label and two random layers would collide. There is nothing to cross into when one track repeats on itself, so the crossfade is not offered for the single order.

The order hints are read under the control, because the order chosen changes what the layer is. The wait for completion hint is written per state, because what matters is the audible consequence now.

### DataManager/sub-components/msu/msu-studio.css and msu-files.css

The sound row channel tag has a fixed width so the ids beside it line up, and is monospaced so the tag reads as a port name.

The files tab owns its own scrolling (`.msu-panel--files`), so its header stays put while the list moves under it. One column template (`--msu-file-cols`) serves the whole files list: the header and the cards read it, so they cannot drift apart. The header is a label strip, not a table head: no rules or frame, so what sits under it still reads as cards. Its transparent border matches the card border so the two share one column origin. The card is the entry and the player expands inside it; there is no striping, which would read as a table.

### DataManager/sub-components/msu/OptimizeDialog/OptimizeDialog.tsx

Converts and stops: originals stay on disk as the fallback, and removing them is a separate confirmed action. The run cannot be dismissed, because it writes the manifest as it goes. The pack is reread the moment a run settles (`onConverted`), not on the way out; see `useOptimize`. The candidate list can run to a hundred files, so it scrolls inside the dialog instead of pushing the actions off the bottom.

### DataManager/sub-components/msu/OptimizeDialog/sub-components/PreviewStep/

Only measured rows are summed (`previewTotals`): folding an unmeasured file in at its current size would present a guess as part of a measured total. Growth counts like saving, so a pack of mp3s shows the total getting bigger instead of a flattering net figure. `convertibleCount` is how many rows a run would convert; excluded rows are not counted. The net label reads as a minus sign for bytes saved and a plus sign when the pack grows.

A file that would grow reads `+` in the danger colour and stays in the run (`CandidateRow`): one format is the point, and an already compressed file pays in bytes, not quality.

### DataManager/sub-components/msu/OptimizeDialog/sub-components/RunStep/RunStep.tsx

Repeat points are reported first: a loop position dies with the file's container, so it is written into the manifest before any format changes, and the count makes that verifiable. `progress` is null until the first file reports in; `result` is null while the run is going.

### DataManager/sub-components/msu/PreviewReadout/PreviewReadout.tsx

Subscribes to the report store itself, so a published frame redraws this block alone. It renders nothing while the preview is still decoding or another row is the one playing. The elapsed clock is what `interval` layers are scheduled against; it is labelled because unlabelled seconds next to a position such as 0:15 / 0:50 read as the track's own time. `previewKey` is what the readout belongs to; `label` names it in the heading, such as slot 5 or Ambient 0x05.

### DataManager/sub-components/msu/PreviewReadout/PreviewReadout.type.ts

A meter row is one audible sound, or the wait before the next one (`LayerMeterKind`), so overlaps are visible. Row ids number voices oldest first. `caption` is the file name shortened to fit; `title` keeps the full name for hover. `fill` is 0 to 1, or null when there is no denominator, and then the label stands alone with no bar. A `FadeMeter` fill reads 1 the instant the fade completes. `introFill` marks the intro a looping file plays once, null when the whole file repeats; it is drawn behind the fill so the loop jump reads as structure, not a glitch. A silent continuous layer still gets a voice row. `showName` is set on the readout under a slot; the one inside a layer card is already named.

### DataManager/sub-components/msu/PreviewReadout/behavior/layerMeters.ts

One layer's live report as meter rows: one row per audible sound, oldest first, plus the wait before the next one. A sound can outlast its own gap, so folding them into one bar would hide the overlap worth watching. Rows come from the report, except that only gap modes (`GAP_MODES`: random, interval) get a next row: a loop has no next event, and a gap mode keeps its row even without a countdown, because waiting for this sound to end is a state. A countdown fills towards the next sound, with the wait it started from as denominator; a fade fills the same way; a zero length gap has no window to fill but the number still reads. With no countdown chosen yet and wait for completion on, the gap only begins once the sound ends. An MSU-1 loop point is usually not the start, so the label says where it repeats from, which keeps the position dropping back from looking broken. Gap modes carry silence in the countdown row, so only continuous modes need the silent row.

### DataManager/sub-components/msu/PreviewReadout/behavior/voiceCaptions.ts

Captions rows by file name, since which file of the pool landed is the point. Names are shortened from the middle (`shortName`), because the tail (variant number, extension) is what differs; the caption column is narrow on purpose (`MAX_CAPTION`). Two rows can name the same file (a loop crossfading against itself, a random pool drawing twice); those are marked by fade direction (`FADE_MARK`) when fading and by order otherwise. The full name is kept as the title whenever the caption is not the whole story.

### DataManager/sub-components/msu/PreviewReadout/sub-components/

`LayerLive` subscribes on its own behalf, so the layer card stays presentational and a frame redraws this line, not the card's inputs. An unsaved layer is not playing yet, which renders nothing, not an error. `LayerMeter` is presentational and has no overlapping marker; two rows are the overlap. `MeterRow` draws the bar only when the row has a denominator, because a bar at zero reads as stuck, not as no measurement; green marks something sounding, gold the thing being waited for. `FadeChip` sits beside the position reading, not in place of it, since the sound still advances while its level moves.

### DataManager/sub-components/msu/PreviewReadout/PreviewReadout.css

The detail note is pushed against the clock, not centred, so the head reads title, note, clock. Sounding or not is carried by the pulse dot, so the state reads without parsing text. A layer shows a row per audible sound plus its countdown, stacked under the one head line. Each row is named after the file it plays, so stacked rows are never ambiguous. The countdown caption is a word, not a file, so it is styled as a label and never reads as one of the sounds. With no bar drawn, the wording takes the space the bar would have had, so rows stay aligned. A pass fading in takes the sounding colour; one fading out keeps the gold of something waited on, so direction reads without the words. The fade bar is short on purpose: it measures the fade, not the file, and must not rival the position bar.

## DataManager Language Studio

### DataManager/sub-components/language-editor/LanguageEditor.tsx

The translation editor: one language set, edited a line at a time. The glossary and the menu name table are one Variables tab on purpose: as two lists a translator had to work out which one a piece of text lived in. `id` null renders the empty state; `readOnly` marks an installed set, which opens and previews and changes nothing; `origin` is the origin bar of an installed set, shown above its header. `LOCKED` marks the two tabs whose surfaces are built but not yet connected to the game.

### DataManager/sub-components/language-editor/LanguageEditor.css

The editor scrolls only on the inside; the header and tabs stay put. Selection is opted back in for the pane and every descendant. The app wide reset resolves `none` down the whole tree, and an element that cannot be selected cannot start a selection either, so a press outside the typing surface left the old highlight painted. Naming the descendants too is what makes it stick, the same fix as the log panel.

### DataManager/sub-components/language-editor/language-editor.type.ts

The state types of the editor's data layer: what the editor hook hands the UI (the loaded set, save and dirty flags, per entry validation) and what an edit to the name table looks like. `EntryIssueMap` is keyed by the entry's own game index. `NameEdit` is discriminated on the group so every group keeps its own key type: an item record id, a bottle slot number, one of the fixed pause menu label keys.

Every mutation is immutable and marks the set dirty. The structure mode is part of the set, so changing it is an edit like any other. An emptied text value drops the override. `setVariableValue` routes to whichever table the variable is projected from; an engine owned variable has no stored value, so a write to one is ignored instead of landing where nothing reads it. `setManyEntryTokens` replaces several entries in one pass (the hardcoded name apply). `saveNow` flushes a pending debounced write (a Save button, a tab change).

`dirty` means edits exist that the debounced write has not persisted. `saving` means a write is in flight, which also recompiles the asset blobs. `variables` is the set's one substitution list, projected live from the pair it is stored as, so an edit to a term or a menu name shows without a save first. `terms` is every variable that carries text of its own, in the shape the measurement and validation walks take; it is wider than `set.glossary`, because a menu name may be referenced from a line and a walk given only the glossary would fail on it.

### DataManager/sub-components/language-editor/behavior/apply-hardcoded.ts

Turns accepted hardcoded name occurrences into new token streams: each accepted run of literal text is replaced by a reference. Only exact matches are applied; a case insensitive near miss would silently recase a line. Cuts inside one token go left to right with a cursor, so an overlapping pair is dropped instead of producing a half eaten phrase. Entries the occurrences do not change are absent from the result.

### DataManager/sub-components/language-editor/behavior/hardcoded-report/

The hardcoded name scan grouped per variable, not per occurrence: a proper noun appears dozens of times, and the decision is whether every mention becomes a reference. Near misses (case insensitive matches) are counted but never applied, since applying one would recase a deliberate line. Groups are sorted most found first, and a variable with only near misses still appears, so the reader sees why. `label` is the variable's own label or the phrase itself; `exists` is false when the catalog proposed a variable the set does not carry yet; `entryCount` counts distinct entries the exact occurrences sit in.

### DataManager/sub-components/language-editor/behavior/language-set-edits/

Pure immutable transforms on a loaded language set. Every transform shares everything it did not touch: only the edited entry gets a fresh `tokens` array, which lets the validation layer skip the others by array identity. `mapEntry` shares the array when the id matches nothing. `withManyEntryTokens` builds one new set, so the debounced write never sees a half applied snapshot. An emptied note drops back to undefined so it stays out of the written JSON. A set stores only what a translator changed, so clearing a text field drops the key (`withTextValue`); an empty string would read as a translation. `withGlossaryTerm` replaces an existing term with the same key in place.

### DataManager/sub-components/language-editor/behavior/load-set-font.ts

A set's drawable font, read from the set's stored pair (see `setFontAssets`). It is cached at module scope by set id, holding the pending promise, so two callers in one tick share one read and a remount never reads the same font again. The font is not editable in the studio, so a cached entry cannot go stale under an edit; only a reimport would need it dropped. The base language code prefers one the caller already holds, because reading the set again would pull its whole payload for one field. The result is null when no font pair is stored or the base language is unknown, and callers then draw nothing.

### DataManager/sub-components/language-editor/behavior/select-entries.ts

Narrows the entry list to what a filter asks for, after search. Warnings collects the lines that would fail to encode, which are otherwise invisible until a save refuses them.

### DataManager/sub-components/language-editor/behavior/useEntryDraft.ts

Unsaved edits, one draft per entry. Nothing reaches the stored set until commit, because every write rebakes the asset blobs. A draft stays until its entry is saved or cancelled; switching views, opening another entry or closing the card never touches it, and every view of that entry shows the draft. `open` starts a draft from the stored tokens and does nothing when one exists; `cancel` drops the draft and restores nothing, since the set was never touched.

### DataManager/sub-components/language-editor/behavior/useEntryIssues.ts

Live per entry validation, incremental: edits are immutable, so a cache keyed by entry id and compared by `tokens` identity validates again only the entry that changed. The base language and the reference key set invalidate the whole cache through a cheap signature. The keys come from the whole substitution list, not the glossary alone, since menu names are referenceable. The validator's alphabet comes from the extraction language table through the base code.

### DataManager/sub-components/language-editor/behavior/useEntryOpen.ts

The one place that holds both `useEntryView` (what is open) and `useEntryDraft` (what is unsaved). Entering the editor starts a draft if none exists; leaving it keeps the draft. Commit and cancel drop the entry back to reading. The handlers close over a live ref, so their identity is fixed and the list can memoize its few hundred rows.

### DataManager/sub-components/language-editor/behavior/useLanguageEditor.ts

The data layer of the translation editor: loads one set, holds it while edited, validates it live, persists on a debounce. Reads and writes go through the renderer languages store, not `window.api`, so the same call works on the desktop host and the browser host, where `window.api` is only a stub. With `readOnly` (an installed set) every edit is refused, so nothing is marked or written. `current` mirrors `set` so an edit can read the current value without depending on it. `apply` runs one immutable transform, then marks the result for a debounced write.

The stored pair is folded into the one list the UI edits, the same way the write path does, so what is shown is what a save persists. The fold is keyed on the three fields, not the set, because a new variable list per keystroke would invalidate the layout cache for the whole set.

### DataManager/sub-components/language-editor/behavior/useSetExport.ts

Exports the open set as `.rlang` through the platform's save path: a save dialog on desktop, a share sheet on mobile, a download in a browser. A pending edit is written first, so the file holds what the editor shows. A cancelled dialog is an ordinary outcome, not a failure.

### DataManager/sub-components/language-editor/behavior/useSetFont.ts

One language set's font as React state. The read is memoised in `load-set-font`; the returned object is memoised because consumers feed `sheet` and `metrics` straight into the dependency list of a canvas redraw effect. Passing `base` (the set's base language code) when the set is already loaded saves a second read.

### DataManager/sub-components/language-editor/behavior/useSetPersistence.ts

Debounced whole set persistence. A write is expensive (it recompiles every cached asset blob), so an edit only records a snapshot and the write waits for `SAVE_DEBOUNCE_MS` of quiet. `revision` counts edits and `persisted` holds the revision the last completed write carried, so an edit landing mid write is armed again instead of clobbered. `epoch` does the same for a set swap: a write whose set was swapped out meanwhile drops its result. `runRef` breaks the arm and run cycle: the timer reaches the latest `run` through it. A failed write stays dirty, and the next edit or `saveNow` arms the write again. After unmount no timer fires again, so a newer edit is persisted at once, and unmounting flushes a pending edit so it is never lost. `markEdited` records a snapshot and restarts the quiet period; `reset` takes a freshly loaded set (or none) as the new baseline, dropping pending writes; `saveNow` with a write already in flight returns at once, and that write or its next arm carries the newest snapshot.

### DataManager/sub-components/language-editor/behavior/useTextGroups.ts

The text groups the studio shows, and which one is open. The catalog decides which slots exist; storage only holds what a translator wrote. The record dataset is handed to the builder, not imported by it, because the builder is exported again from the language barrel the storage layer uses. The menu and credits text is read from the player's own file, only when a set is open; a set whose ROM is not stored has nothing to show for those two groups. When the stored file is another region's, the slots and sizes are right but the words are not this set's originals, and each row says so. A missing key in `values` means the slot is untranslated.

### DataManager/sub-components/language-editor/behavior/useVariablesTab.ts

The state of the variables tab: filtering, usage counts and the hardcoded name scan. The scan runs only when the dialog opens, because `findHardcoded` walks every text run against every candidate phrase. Applying a report is one edit, so the debounced save sees a single new set.

### DataManager/sub-components/language-editor/behavior/variable-edits/

One variable's value written back into the pair the set stores (glossary and name table). The key shapes mirror `variables/from-legacy.ts` exactly (`bottle-<content>`, `label-<section>`, anything else is an item), so a round trip is byte identical. An engine variable has no stored value and is refused (`isEditable`).

### DataManager/sub-components/language-editor/editor/attrs-to-token/

The return half of the atom contract: an inline node back to the token it stands for, and a paragraph's children back to one line's content. The walk is flat: text nodes accumulate into one maximal run, and atoms rebuild their original token from the attributes. A run is flushed only when it is not empty, so two adjacent atoms produce no phantom empty text token between them, which is the case a naive walker gets wrong.

Values are read defensively, not trusted: a paste, an older stored document, or a node view that stringified an attribute can put a decimal string where a number belongs, and an out of range row must still resolve to something the model accepts. Rows are the three line start markers; anything else falls back to the first. Anything unrecognisable is dropped instead of becoming an invalid token. Like its counterpart this module imports no editor runtime; it reads plain ProseMirror JSON and needs no DOM.

### DataManager/sub-components/language-editor/editor/auto-wrap/

Wrapping while typing: the editor's half of the author never thinking about the row. The engine never wraps: a row drawn past its 168px interior is drawn into the next row's tiles. So after every change the first line wider than the row is cut at the last word boundary that still fits (the model's own `breakLine`), the joining space is dropped the way any wrap drops it, and the remainder becomes the next line with a derived advance. The cut lands on the joining space, so everything in `head` sits before it. The pass repeats until nothing is overlong, so a long paste settles in one transaction; `MAX_CUTS_PER_PASS` is a fuse, since a pass never needs more cuts than a paste has words. Positions are taken fresh from the transaction's own document, so repeated cuts compose.

A single word or variable wider than a whole row has no safe cut, since cutting it would change what it says, so it is left whole for the validator to flag. `breakLine` answering null there is also what keeps the loop finite. The wait travels with the text: wrapping a line that ended its box moves the wait onto the remainder, because the words that moved down still finish the box.

### DataManager/sub-components/language-editor/editor/choice-lines.ts

Choice options are edited where they live: inside the editor, as the lines they are. A choice prompt stores its option text as the last lines of the entry, one option per line, with the prompt code as the stream's final token; that was verified against every prompt in the vanilla corpus. So the options need no second editing surface: this plugin finds the prompt code in the document (`OPTION_COUNTS` says how many option lines each prompt reads), marks the option lines, and the stylesheet dresses them as the selectable rows the player will see. Typing in one is typing in the entry, and every editor behaviour (wrapping, measuring, undo) applies unchanged. The decoration carries the option's 1 based index, which the line gutter and the option tag both read.

### DataManager/sub-components/language-editor/editor/delete-merged-pair/

Backspace and Delete over a merged picture character: both halves go, or neither does. The picture is one character to the author, so removing the character before the caret has to mean the whole picture. Left to the ordinary delete, one press took away half of it and left the other half standing: a picture the alphabet has an entry for, which encodes and bakes perfectly well and draws as nonsense on screen.

Three ways in, one range: the caret may be after the pair (Backspace, direction -1), before it (Delete, direction 1), or the pair may be selected because a click landed on it. A click always selects one half's node, since that is the object the browser hit, and that selection is widened to the pair here, not at the click. Both commands decline when the gesture is not over a pair, so an ordinary character, an ordinary atom and a line boundary keep their own behaviour.

### DataManager/sub-components/language-editor/editor/doc-to-lines.ts

Editor document to lines: the return half of the bridge, and the pivot every consumer reads. There is exactly one view per paragraph, always, which keeps the gutter beside the text honest: row three of the gutter belongs to the third paragraph whatever that paragraph contains, including nothing. A bare paragraph is accepted as a one line document. The token stream falls out of these views through the model's own inverse (`joinLines`), so this file never writes a control code. An entry that was opened and not edited comes back out byte identical: its advance codes were carried through the attributes untouched, and nothing here invents or corrects one.

### DataManager/sub-components/language-editor/editor/editor-runtime/

The live context the structure plugins read at dispatch time. A ProseMirror plugin is built once, when the editor is created, but the language's font arrives later and the automation mode can change while the editor is open. Threading either through the extension list would rebuild the editor, and rebuilding is exactly what loses the caret, so the plugins close over this one mutable object instead, and the component keeps it current (`updateEditorRuntime`). A singleton is safe because the editor enforces one open draft at a time: two dialogue editors never accept keystrokes at once. If that rule ever changes, this must become per editor plugin state.

### DataManager/sub-components/language-editor/editor/gutter-refresh.ts

Repaints every line's gutter after every transaction, straight from the editor state. The node view repaints its own gutter when its node is redrawn, yet a typed character can be adopted from the DOM without a redraw, and the pack's font can arrive after the lines were first drawn. Driving the repaint from the view's update hook closes both gaps: whatever changed and however, the gutters end the transaction correct.

### DataManager/sub-components/language-editor/editor/line-attrs/

The attribute contract of one line: everything a paragraph remembers that is not its text. A line's two structural facts are the code that put the pen on its row and whether a wait follows it. Neither is content: the engine only meets them at a line's edges, so carrying them as block attributes is both truer and easier to edit than burying them in the run as inline objects. The document's block type is the paragraph (`DIALOGUE_LINE_TYPE`): one paragraph is one line, and every attribute field is always present.

The advance is stored as a kind plus a row, not as the model's union, because a ProseMirror attribute has to survive a trip through the DOM as a string. A null kind is a real value meaning a null advance: the line carries no code of its own, and it is written back exactly as read, which lets an untouched entry round trip. A stored row may arrive as a decimal string (a DOM attribute) or outside the three markers (a paste); it resolves to the first row, not to nothing, because the line was authored with a code and dropping it would change what the engine draws. For `endsBox`, absent, `false` and `'false'` all mean no wait. The rendered `data-*` attributes are not decoration: the stylesheet groups the lines of one box by looking for the line after a `data-ends-box` one, so the box grouping needs no second source of truth.

### DataManager/sub-components/language-editor/editor/line-here.ts

Where the caret is, in lines. Every line command needs the same three facts: which paragraph holds the caret, where it starts, and which line number it is. Getting any of them slightly wrong moves an edit onto the wrong row, so one locator serves all of them. `PARAGRAPH_DEPTH` is 1: the document holds only paragraphs and a paragraph only inline content, so there is nothing deeper to walk. `pos` is the position immediately before the paragraph, which is what `setNodeMarkup` takes; `index` is 0 based among the paragraphs; `offset` is the caret offset within the line's content.

### DataManager/sub-components/language-editor/editor/line-node-view/

How one line is drawn: its row information and its text as one element. The gutter is a child of the same paragraph that holds the text, so the two cannot be laid out apart: there is no second column to drift and nothing to align. It shows the line number, a meter of the row's 168px filled so far, the pixels left, and the character count (atoms count as one, like the caret steps). The meter reads as tight from `TIGHT_FROM` up, matching the fit chips of the list. The gutter is painted from the line's own node every time the node changes, which is every keystroke in that line and nothing else.

The gutter is outside the editable content and outside the document: the caret cannot enter it, a copy cannot carry it, and a mutation inside it is never mistaken for typing (`ignoreMutation`). `paintGutter` is shared with the refresh plugin, which drives every gutter from the editor state after each transaction; the line number comes from that walk, since a node cannot know its own position, so the node view paints with it unknown and the refresh fills it in.

### DataManager/sub-components/language-editor/editor/line-paragraph.ts

The block a line occupies: an ordinary paragraph that also remembers which code put the pen on its row and whether a wait follows it. The keys are bound as a plain ProseMirror keymap instead of through the framework's shortcut layer: each command builds and dispatches its own transaction, and the framework's wrapper dispatches one of its own around whatever a handler does, which would apply the edit twice. A keymap plugin hands the command the state and dispatcher directly, which is the contract the commands are written to.

The priority is raised (`KEYMAP_PRIORITY`) so this keymap is consulted before the base bindings. Enter must not fall through to the generic block split, which would make a paragraph with default attributes: a line with no advance code in the middle of an entry, which the engine has no way to draw. The two bare arrows are taken for the reverse reason: left to the browser they step by DOM position, and a line has more of those than characters (see `step-caret`). Shift with an arrow, word jumps and the vertical arrows are deliberately not bound. Backspace and Delete try the merged picture first, since it is one character and one press takes both halves; declining falls through to the line merge, then to the base keymap's ordinary delete. Absent attribute fields are left off the element, not written as null. The line draws its own row gutter beside its text through its node view.

### DataManager/sub-components/language-editor/editor/line-shape/

One line as the document stores it, and the two derivations the editor needs from it. Measurement is never stored; it is computed again from the shared layout walk every time, so the gutter can never show a stale width.

A paragraph is numbered here instead of by splitting the token stream again: a paragraph exists in the document even when it contributes no tokens (an empty line that carries no code, such as the first line of a new entry), and the model's splitter rightly reports nothing for it. A gutter that lost that row would stop lining up with the text, so numbering follows the paragraphs and only the numbers are derived. The rule is the model's: a row marker parks the pen on its own row, a scroll parks it on the bottom row, and a line with no code sits on the first row of its box (`rowOfAdvance`).

`measurableGlossary` widens the glossary to answer every reference the tokens make. Resolving a reference to a key the set does not carry throws, and mid edit that is an ordinary state: a term can be renamed or removed while an entry still points at it. An editor that threw there would go blank on a keystroke, so an unknown key measures as its own name. That is wrong by exactly the width of a placeholder, and the entry validator reports it as a real issue.

`advanceAfterLine` is the one place a code is invented, and only for a line an author just asked for. `advanceForNewLine` reads a previous line's row and whether it ends the box, so the view handed to it is structure with its measurements zeroed: they are not read, and measuring would carry a font this far down for nothing.

### DataManager/sub-components/language-editor/editor/line-tokens.ts

A line's content as tokens, read straight off the live document node: text children become text tokens, inline atoms become the token their attributes spell. Shared by everything that measures a line while it is typed.

### DataManager/sub-components/language-editor/editor/lines-of-tokens.ts

A stored token stream as the lines an author edits: the model's own splitter, with the one guard the editor needs. Splitting measures each line, and measuring resolves glossary references, which throws on a key the set no longer carries. Opening an entry that points at a removed term must show the entry, not an error, so the glossary is widened first (`measurableGlossary`). Nothing else changes: the advance codes come back exactly as authored, which is what `joinLines` needs to write them back untouched.

### DataManager/sub-components/language-editor/editor/lines-to-doc.ts

Lines to editor document: the forward half of the bridge. One line is one paragraph. That is the whole change from the single run editor this replaced: the engine writes into a three row box and never wraps, so what an author edits is a stack of lines, and a document shaped like that can be guttered and grouped the way a code editor is. A line's advance code and trailing wait become paragraph attributes, not nodes in the run, so neither can sit in the wrong place: a row marker cannot end up mid sentence, and a wait cannot end up anywhere but a line's end. An empty set of lines still yields one empty paragraph (`EMPTY_LINE`), the canonical empty document: the schema requires at least one block, and an author needs a row to type into.

### DataManager/sub-components/language-editor/editor/merge-lines/

Backspace at the start of a line and Delete at the end of one: both the inverse of Enter. A merge drops a code instead of moving one. The line that disappears is the one whose advance put the pen where it was, and once its text has joined the line above there is nothing left for that code to do; the surviving line keeps its own. This is the only way an authored advance is ever removed, and it removes exactly the one the author deleted.

The wait is the opposite: it belongs to whichever line now ends the run of text, so it survives from either side. If the line merged away closed the box, the combined line closes it instead; otherwise deleting a line break would silently join two boxes and change what the player has to press. The markup is set before the join, because it changes no positions and keeps the join boundary valid. Both commands decline when they do not apply, so the keys keep their ordinary behaviour everywhere except a line boundary.

### DataManager/sub-components/language-editor/editor/merged-glyph/

The picture characters spelled as two alphabet entries, and which half a given entry is. A few pictures are too wide for one cell, so the alphabet spells them with a pair of adjacent entries and the engine draws the halves side by side. To an author it is one picture: inserted, read and deleted as one thing. Drawing the halves as two objects gave a caret position in the middle of a picture that the browser could not paint (a zero width rectangle between two uneditable boxes), and a click that could only ever select half of it.

The pairs are not listed here. The sprite manifest already records them: an extraction recipe that names a second glyph produces one sprite covering both entries, and the derived map marks the two entries `first` and `second` of that one file (`buildPairs`). Reading that keeps the two from drifting apart. Names are the bare bracket names (`1HeartL`, not `[1HeartL]`), because that is the form a token carries and the drawing code asks with. Only the base alphabet's pairs are known; a localized alphabet that splits a picture its own way keeps its own entry names, resolves to nothing here, and draws as two cells as it did before. `isMergedSecond` is true for an entry that closes a pair, which draws nothing of its own.

### DataManager/sub-components/language-editor/editor/merged-pair/

Where the two halves of a merged picture character sit in the document. The model keeps both halves, because they are two alphabet entries and the stored entry must round trip byte for byte. Every gesture still treats them as one character: the caret steps across the pair in one press, and one Backspace takes both away. Everything that needs to know whether a position is in the middle of a picture asks here, so the answer is derived once from the pairing the sprite manifest records. Positions are document positions: each half is an inline leaf of size one, so a pair occupies `from` to `from + 2`, and the position between the halves (`splitsMergedPair`) is the one the browser could never paint a caret at.

### DataManager/sub-components/language-editor/editor/renumber/

Row codes follow the lines, so the author never renumbers anything. When a line is opened, wrapped in or removed, every line after it has moved, so its advance code is derived again: rows fill downward, and once the bottom row is taken the box scrolls. A wait is ignored by the derivation on purpose. The engine clears nothing at a wait, so continuing downward (and scrolling from the bottom row) is the one continuation that draws over what is already on screen. That is also the vanilla corpus's own idiom: scrolls outnumber row one returns thirty five to one.

Reach follows the automation mode. Continuous renumbers to the end of the entry; in block stops where the changed line's box ends; off renumbers nothing (a line created by a wrap still gets its own derived code at creation). Lines before the change are never touched, which keeps an untouched entry serialising byte for byte.

### DataManager/sub-components/language-editor/editor/schema.ts

The editor's extension list: the smallest schema that can hold a dialogue entry and nothing else. The document is a stack of lines, `paragraph+`, one paragraph per line. The engine writes into a three row box and never wraps, so the thing being edited is a stack of lines, not one long run with control codes buried in it. Enter makes a line and Backspace at a line's start removes one; both are the line node's own business. There is deliberately no mark in the list: the target format has no bold, italic, heading or list, so the schema must not offer one, and an unknown mark pasted in has no type to parse into and drops to plain text. Undo and redo use the ProseMirror history plugin wired directly (`EditHistory`), because the framework's own history extension is not installed (no starter kit, no marks): same engine, one dependency fewer.

### DataManager/sub-components/language-editor/editor/split-line.ts

Enter starts a new line. This is the one gesture in the editor that invents a control code, and it asks the model for it (`advanceForNewLine`) instead of deciding: the box fills from the top, so the line after row one is row two, after row two is row three, and once the bottom row is taken the box scrolls to make room. A line opened after a box ending wait starts the next box at row one again.

The wait travels with the text, not the row. Splitting a line that ended its box leaves the first half open and the second half closing the box, which is what an author means by pressing Enter mid sentence: the words that moved down still finish the box. The advance is computed against the first half as it will be after the split, when it no longer ends its box, so a line that used to close the box hands the new line the next row down instead of restarting at row one. The paragraph's own start is before everything the split touches, so its position still points at the first half after the split.

The automation mode is a promise about what Enter may restructure: off consumes the key and changes nothing; in block refuses once the caret's box already holds its three rows (`rowsInBoxBefore` counts back to the previous wait).

### DataManager/sub-components/language-editor/editor/step-caret/

Left and right by one character of the line, whatever that character is made of. The browser moves a caret between DOM positions, and a line has more of those than characters. Every character sits in a cell of its own so it can be billed its real advance, and each boundary between two cells is two equivalent DOM positions, since the end of one span is the start of the next. Native motion therefore stopped twice per character and the caret visibly jittered backwards. An inserted token is the same problem from the other side: one character to the author, and the caret has no business landing inside it.

Stepping by document position instead settles both. One press is one position: one typed character, the whole of one atom, or the jump from the end of a line to the start of the next. Nothing else about selection changes; Shift with an arrow, word jumps, the vertical arrows and clicking stay with the editor, which is why only the two bare keys are taken. A non empty selection collapses to its own edge instead of stepping past it, so after clicking an atom the first arrow puts the caret beside it. A merged picture is the one place where one press crosses two positions: the step passes over the position between its halves and lands on the far side.

### DataManager/sub-components/language-editor/editor/toggle-wait/

Whether a line ends its box: a per line flag, flipped from the line's end. A wait for button is the one control code a player experiences: the moment the box stops and asks for a press. It can only occur at the end of a line, so it is a property of the line, not something inserted at a caret, and turning it on or off is one gesture. Two ways in, one transaction: `toggleWaitAt` is for the marker drawn at a line's end, which knows the position it was drawn at; `toggleWaitHere` is the keyboard route, acting on the caret's line.

### DataManager/sub-components/language-editor/editor/token-attrs/

The atom contract: one non text token as an indivisible inline node, and a line's content as the inline children of a paragraph. A row marker and the wait that closes a box are line structure: they only occur at a line's edges, so they live in the block's attributes and never appear in a run. What is left is what sits in the text: a substitution, a glossary reference, a picture character, and any control code that takes effect mid line. `DialogueTokenKind` mirrors `Token['t']` minus text.

This module is free of any editor framework runtime import: it builds plain ProseMirror JSON, which keeps it pure, DOM free and testable alone. It owns the attribute contract (`DialogueTokenAttrs`) that the node extension declares and `attrs-to-token` reads back, so the three stay in step from one definition. In that contract `null` means the field is absent from the token and `undefined` never appears, so a `param` or `slot` of 0 stays distinguishable from no parameter. `tokenToNode` is what a toolbar hands to `editor.commands.insertContent` to drop an atom at the caret. `inlineContent` folds text into the preceding run, so no two text nodes adjoin.

### DataManager/sub-components/language-editor/editor/token-node/

The atomic inline node a non text token occupies. Everything that is not plain text and sits in the run is one indivisible character to the caret: a mid line control code, a substitution variable, a glossary reference, a picture character. It can be selected and deleted whole, never typed into and never split; text around it stays ordinary. Line structure is not here: a row marker and a box closing wait are attributes of the line, though the node still knows how to draw one if a paste brings it in, so nothing is lost silently.

How an atom leaves the editor: as HTML (copy and paste inside the editor) it is `span[data-dialogue-token]` with one data attribute per field, so a round trip through the clipboard rebuilds the identical token; the node is a leaf, so its inner label is never parsed again as content. As plain text (copy out, `editor.getText()`) it is the bracket form the stored dialogue format uses, through `serializeTokens`; a glossary reference has no bracket form, so it renders as `{key}`, and plain text is one way. Absent fields are omitted from the DOM, not written as null. The node renders a bare labelled span; chip styling and parameter editing belong to a node view in the UI layer.

### DataManager/sub-components/language-editor/editor-ui/char-advance.ts

Gives each typed character its real width from the pack's width table.
The editor wraps every character in a cell of that width.

### DataManager/sub-components/language-editor/editor-ui/char-cells.ts

Builds the per-character cells that the editor draws as decorations.

### DataManager/sub-components/language-editor/editor-ui/editor-contract

This folder is the one place the editor UI imports the `editor/` layer from.
Every other file in `editor-ui/` goes through it.

### DataManager/sub-components/language-editor/editor-ui/editor-ui.type.ts

`GlyphFontHandle` is a live handle.
It is read when a decoration paints, so a font that loads later still draws.

### DataManager/sub-components/language-editor/editor-ui/glyph-names.ts

Glyph names are stored with brackets, such as `[Up]`.
`BRACKETED` matches that form.

### DataManager/sub-components/language-editor/editor-ui/icon-for-token

Icons are picked by code name only.
The line start markers share one symbol.

### DataManager/sub-components/language-editor/editor-ui/icon-svg.ts

Builds a DOM `svg` for markers that are drawn outside React.
The icon data is bundled with the app, so writing it with `innerHTML` is safe.

### DataManager/sub-components/language-editor/editor-ui/substitution-cells.ts

A substitution reserves its worst case width.
A name reserves six of the widest glyphs, because the player name `PLAYER` has six letters.
A number reserves one digit.
Both numbers come from the layout plan.

### DataManager/sub-components/language-editor/editor-ui/tokens-signature.ts

The signature joins tokens with a NUL character, which no token can contain.
`serializeTokens` throws on a reference it cannot resolve, so the signature catches that and falls back.

### DataManager/sub-components/language-editor/editor-ui/DialogueEditor.tsx

The font handle is kept in a ref so decorations read the current font.
The editor extensions are keyed on the contents of the glyph set and on whether the font is ready.
A change to either rebuilds them.

### DataManager/sub-components/language-editor/editor-ui/DialogueEditor.css

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

### DataManager/sub-components/language-editor/editor-ui/DialogueEditor.lines.css

One paragraph is one line of the box.
Its height is pinned so a taller glyph cannot pull the line away from its gutter row.
Its width is not set, because a set width made a long line wrap and paint over the next one.
The paragraph is a block, not flex.
A flex container has no inline line boxes, so Up and Down moved the caret sideways and a copy put a newline between every letter.
The line height is set on the paragraph because `.game-text` sets a line height of 1.5, which came to 48px against a 32px row.
`white-space: pre` alone is not enough, since an inline atom is a break opportunity of its own.
Setting `white-space-collapse` and `text-wrap-mode` separately turns wrapping off there too and keeps the double spaces dialogue relies on.
The gutter is drawn by the node view inside the same paragraph as the text, so the two cannot misalign.
The caret never enters it.
The meter shows how much of the row's 168px the line has spent.
The pixel figure is what is left before the edge.
The character count uses the caret's own unit.
The line content span is an inline block.
As plain inline content, a decorated option line could break onto a second row inside the fixed height paragraph.
Option lines are dressed as the rows the player will choose between.
The first 8px cell of an option is the engine's cursor column, which the stored text spells with `>` or spaces.
The rule on the left joins the lines of one box and breaks after the line the player stops on.
Its width is left alone, because a thicker border would move the text without moving the ruler.
Line end markers are decorations with no place in the document, so neither the caret nor the widths know about them.
Each marker kind has a fixed slot on every line.
Drawing the wait control only on the caret's line moved the marker beside it by about 14px as the caret moved.
Markers ignore the pointer and selection.
Otherwise `caretRangeFromPoint` returned the icon and select all painted the symbols.
The wait marker is the one marker that is also a control.
Its off state means no wait yet, and it shows only on the caret's line, faintly.

### DataManager/sub-components/language-editor/editor-ui/EditorToolbar.tsx

Only one card is open at a time, and the row owns which one.
A press outside closes it, unless a design system dropdown is open, since that list is drawn in a portal.

### DataManager/sub-components/language-editor/editor-ui/EditorToolbar.css

The toolbar is one row of equal icon buttons and does not wrap.
A row that reflows moves a button out from under the pointer.
`overflow: visible` is needed because every card is anchored inside this row.
A divider between groups is shorter than the row, so it reads as a pause.

### DataManager/sub-components/language-editor/editor-ui/ToolbarButton.tsx

The button swallows `mousedown`, so the caret in the text survives the press.

### DataManager/sub-components/language-editor/editor-ui/ToolbarButton.css

The card positions against the wrapper, so the wrapper carries `position: relative`, not the button.

### DataManager/sub-components/language-editor/editor-ui/TokenAtom.css

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

### DataManager/sub-components/language-editor/editor-ui/behavior/useDialogueEditor.ts

Callbacks are held in refs so the editor is built once.
The caret line is not cleared on blur.
An empty transaction repaints the gutters.
Glyphs that are spelled as a pair insert both entries.

### DataManager/sub-components/language-editor/editor-ui/behavior/useDismissOnOutside.ts

Listens to `mousedown` in the capture phase, so a press is seen before any child handler stops it.

### DataManager/sub-components/language-editor/editor-ui/behavior/useTokenSync.ts

The hook remembers the signature of what the editor last sent out.
When the incoming tokens match it, the editor is not reset, which keeps the caret in place.
Content is set with `emitUpdate: false` so the reset does not echo back as an edit.

### DataManager/sub-components/language-editor/editor-ui/popovers/portal-layer.ts

A design system `Select` draws its list through a portal, so the list is not inside the card.
A press on one of its values looks like a press outside the card.
Checking whether the portal's popover layer holds anything tells those two cases apart.
A press that lands elsewhere still closes the list, and the next press closes the card.

### DataManager/sub-components/language-editor/editor-ui/popovers/PopoverShell.tsx

Every toolbar card is drawn in this shell, anchored under its own button.
It floats over the content, because a toolbar that changes height moves the text away from the pointer.
`keepFocus` swallows `mousedown` for a card that holds only buttons, which keeps the caret alive in the text.
A card holding a field must not swallow it, or the field could never be typed in.
The editor restores its stored selection before it places a token, so the insert lands at that selection either way.
The toolbar owns which card is open and every way of closing it.

### DataManager/sub-components/language-editor/editor-ui/popovers/PopoverShell.css

The card is absolute, not in a portal, so it stays in its button's stacking context and needs no measuring.
The width is kept narrow on purpose, because one card does one thing.
The `end` variant opens leftward so the last buttons in the row stay inside the pane.

### DataManager/sub-components/language-editor/editor-ui/popovers/presets

Pause and text speed are the two codes an author still places by hand.
Both take a raw parameter from 0 to 15.
A pause is roughly half a second per step, so four points cover a beat, a breath, a long hold and a full stop.
Speed is frames of delay per character, and zero draws the whole message at once.
Every preset is filtered through what the language can encode, so nothing offered can fail to compile.
An encoder that refuses the code leaves an empty list, and its button is disabled.

### DataManager/sub-components/language-editor/editor-ui/popovers/PresetPopover.tsx

One card serves both pause and speed: each is one code with one parameter.
It holds only buttons, so the caret stays in the text.

### DataManager/sub-components/language-editor/editor-ui/popovers/PresetPopover.css

The four values read as a scale, so the buttons keep equal weight and none looks like the default.

### DataManager/sub-components/language-editor/editor-ui/popovers/GlyphPopover.tsx

Picture characters belong to the dialogue alphabet, so they are drawn from the pack's own font.
Which names are characters comes from the language's alphabet, so each set offers exactly its own.

### DataManager/sub-components/language-editor/editor-ui/popovers/GlyphPopover.css

The grid uses auto fill, so it suits an alphabet of six characters or forty.
A cell takes an icon's size and keeps the glyph's 1 to 2 proportion so the picture does not stretch.

### DataManager/sub-components/language-editor/editor-ui/popovers/GlyphChoice.tsx

Each choice draws with the game's own pixels, so the button shows exactly what lands in the line.
A character spelled as a pair inserts both tokens.

### DataManager/sub-components/language-editor/editor-ui/popovers/settings-fields.ts

`message-settings.ts` names the three settings.
Labels, descriptions and values come from the control code catalog, narrowed to what the language can encode.
The `automatic` option means the entry says nothing and the engine default applies.

### DataManager/sub-components/language-editor/editor-ui/popovers/SettingsPopover.tsx

The three display codes are read in a pre pass, and the last one in the message wins.
Their place in the text means nothing, so they are shown here, not as chips.
The structure mode sits beside them because it also applies to the whole entry.

### DataManager/sub-components/language-editor/editor-ui/popovers/SettingsPopover.css

Each label sits above its list, because the card is too narrow for two columns.

### DataManager/sub-components/language-editor/editor-ui/popovers/structure-modes.constants.ts

The modes and what they decide live in the shared layer.
This file only names them on screen.

### DataManager/sub-components/language-editor/editor-ui/popovers/VariablePopover.tsx

The list is filtered by typing, not split into sections.
A translator knows the word, not the family it belongs to.
Enter takes the first row.
`tokenForVariable` decides which token a row inserts.

### DataManager/sub-components/language-editor/editor-ui/popovers/VariableChoice.tsx

A variable the engine owns still appears, with a small padlock.
The player's name is the most common insert of all.

### DataManager/sub-components/language-editor/sub-components/BundleHeader.tsx

The identity card for the set being edited: its name, its origin, its size, and whether the last edit reached disk.
A translator can have a set from a ROM and a copy open in one session, so the name and origin stay on screen.
`warnings` counts entries with a validation issue across the whole set.
An installed set is never written, so its save state reads `Read only`.
`onExport` saves the set as a `.rlang` file, and `exportStatus` says what the last export did.

### DataManager/sub-components/language-editor/sub-components/BundleHeader.css

Name and origin come first, the countable facts sit in a quiet mono row, and the save state comes last so it reads as status.

### DataManager/sub-components/language-editor/sub-components/DialogueTab.tsx

A searchable list of entries, closed by default, any number of which may be open.
A set has a few hundred entries and the list's job is finding one, so each closed row is a dense line of facts.
Only the editing view can change an entry, and only one entry may hold unsaved work at a time.
Entries the engine uses as scaffolding are shown locked, because they hold no words to translate and editing one breaks every choice prompt.
Every listed entry is measured, not only the ones near the viewport.
A closed row paints no canvas, so measuring the whole set is cheap.
The layout cache is keyed on each entry's token array, so each entry is walked once for the life of the set.
An entry with unsaved words is shown with them in every view.

### DataManager/sub-components/language-editor/sub-components/DialogueTab.css

Only the card list scrolls, so the search box and filters stay in place.
The list is the query container for its rows.
Every row has the same fixed columns, so whether there is room for the line's words depends on the list's width, as `EntryCardCollapsed.css` reads it.

### DataManager/sub-components/language-editor/sub-components/EntryEditor.tsx

Edit mode for one entry: the editor and the commit pair.
Line widths live in the editor's gutter, and the entry's identity lives in the panel around it.
Saving is refused while a row is too long.
The engine keeps writing past the edge of the box and paints over the line below, so an overlong row is a defect nobody sees until the scene is played.
`tokens` are the draft; the parent holds the committed entry.

### DataManager/sub-components/language-editor/sub-components/EntryEditor.css

The commit pair sits at the end of the card so it is always in the same place.
The refusal message is a whole sentence on purpose, because `too long` alone sounds like the text will be trimmed, and it will not.

### DataManager/sub-components/language-editor/sub-components/LockedEntryCard.tsx

The stand in for an entry a translator must never edit, such as a choice prompt cursor frame or the extraction padding string.
`structuralEntry` in `packages/languages/src/messages/codes/structural-entries.ts` lists them.
It uses the same row shape as a closed entry, dashed and dimmed, so the locked rows are not the loudest rows in the list.
The reason is stated in full as the row's title, calmly, as a fact about what the entry is for.

### DataManager/sub-components/language-editor/sub-components/SetCreateForm.tsx

Starts a new set from a base language or as a copy of an existing set.
It stays collapsed until asked for, so the set list remains the first thing in the pane.

### DataManager/sub-components/language-editor/sub-components/StaleGameNotice.tsx

Shown when the running game plays older text than the set on screen.
Text reaches the emulator once, when a profile loads and the game boots.
Nothing reads it again, not a save and not a save state, so an edit saved mid session is invisible until the profile loads again.
Reloading restarts the game, so the notice says so.

### DataManager/sub-components/language-editor/sub-components/StaleGameNotice.css

A warning strip, not a card, carried by the warning tone over a light fill.

### DataManager/sub-components/language-editor/sub-components/UnbuiltPane.tsx

A pane whose editing surface exists but does not reach the game yet.
These tabs read the shipped text, measure it and keep what is typed, but nothing is baked into the assets.
The pane says so twice: in a notice that stays readable, and in a scrim that also takes the surface out of the tab order.
The surface stays visible so the shape of the work can be seen while it is decided.

### DataManager/sub-components/language-editor/sub-components/UnbuiltPane.css

The notice sits outside the covered region, because the scrim blurs what it covers.
The scrim takes the warning tone, because this lock is unfinished work, not a choice the owner made.
The scrim message is held at the top and stays sticky, because the covered list can run to a thousand rows.

### DataManager/sub-components/language-editor/sub-components/code-params.ts

The values a picker may offer for one control code.
What the language can encode comes from `encodableParams`.
The catalog's documented range narrows it, since the raw encoder accepts all 256 bytes.
`null` means the code takes no parameter, so the insert is one click.

### DataManager/sub-components/language-editor/sub-components/insert-menu.model.ts

Builds the insert menu from the control code catalog and the language's alphabet.
`SECTION_OF_CODE` only says which section a code belongs in; every label, risk and range comes from the catalog.
A code the catalog will not offer, or marks dangerous, is dropped.
Codes missing from the table are left out on purpose: choice prompts get their own editor, and display codes are settings.
`CODE_ORDER` sets the row order, since object key order sorts digits first.
`parseTokens` gives line start markers the `break` kind and the two substitutions the `var` kind, so the menu emits those shapes to survive a save and reload.
A glossary pick becomes a `ref` token, so retagging the term once updates every entry that points at it.
Picture characters are found in the alphabet and round trip as `cmd` tokens with no parameter.

### DataManager/sub-components/language-editor/sub-components/insert-menu.type.ts

The insert menu model is presentation only.
`make` builds the token to add, and `choice` is null for a row that needs none.

### DataManager/sub-components/language-editor/sub-components/message-settings

The three display codes: text palette, box frame and box slot.
The engine reads them in a pre pass, so the last one in the message is the one that applies.
They are settings, so they are edited as pure array functions, not as chips.
The catalog's `scope` field is not used as the filter, because it also marks the two substitution codes.
Reading returns `null` when the entry never sets the code, or when the last one has no parameter.
Writing rewrites the last occurrence in place and drops earlier duplicates, which could never apply.
Clearing removes every occurrence, so the engine default applies.

### DataManager/sub-components/language-editor/sub-components/overflow-reason.ts

Names the consequence, because `too long` sounds like the text will be trimmed or wrapped.
It returns an empty string when every row fits.

### DataManager/sub-components/language-editor/sub-components/text-groups

The fixed text slots: which ones a translator has written, which ones a search keeps, and how a value fits its room.
A slot counts as translated only when its override is present, not blank, and not the exact original.
The fit is a plain character count, because these surfaces draw one character per cell.
`ROW_CAP` limits the rows drawn at once, because one group runs to the high hundreds and every row holds a live field.
`CAPS_ALPHABET` is what the caps only surface can draw.
A tally is `known` only when the caller passed that group's overrides; otherwise the rail shows the group's size.

### DataManager/sub-components/language-editor/sub-components/text-groups/TextGroupsTab.tsx

The groups on the left and the chosen group's slots as rows.
The list is capped, not virtualized, and the rest are stated as not drawn; search reaches them.
The search and the toggle are the tab's own state.

### DataManager/sub-components/language-editor/sub-components/text-groups/TextGroupsTab.css

The rail and the panel head stay in place while only the rows scroll.
The rail column is narrow because the rows carry the fields a translator types into.
The capped message sits at the foot of the drawn rows.

### DataManager/sub-components/language-editor/sub-components/text-groups/TextGroupRail.tsx

Each group shows its own tally, read from the same overrides the rows use.

### DataManager/sub-components/language-editor/sub-components/text-groups/TextGroupRail.css

Selection uses the gold border and fill, not weight, because the tally already varies in weight and colour.
A finished group's tally turns gold.

### DataManager/sub-components/language-editor/sub-components/text-groups/TextGroupRailItem.tsx

A group with no slots is listed with a plain note, so a translator is not left hunting for it.

### DataManager/sub-components/language-editor/sub-components/text-groups/TextSlotRow.tsx

The original is the field's placeholder and the reference beside it, so an untranslated row shows the words the surface will draw.
Once words are typed, the original moves below the field.
The caution states what the surface can draw, not what the translator did wrong.

### DataManager/sub-components/language-editor/sub-components/text-groups/TextSlotRow.css

The row is two lines, not four columns.
The pane is about 500px wide, and four columns left the field 26px wide.
The fit slot is always present, so metered and unmetered rows line up.
The placeholder uses the dim text colour, because the original must read like a typed value.
A full slot turns gold and a slot past full turns red.
The note is italic, so it reads as a standing fact about the slot.

### DataManager/sub-components/language-editor/sub-components/variables/FindHardcodedDialog.tsx

Lists every place the set spells a name out where it could reference the variable.
A reference follows a later rename, literal text does not.
The scan changes nothing; the dialog opens with every row unticked and states its totals before applying.
Near misses matched only with case ignored, so they are reported and never applied.
The ticked rows are the only state here, and they are dropped when the dialog closes.

### DataManager/sub-components/language-editor/sub-components/variables/FindHardcodedDialog.css

The tick and the name lead, then the phrase, the counts and the near miss note, in a fixed order.
The note comes last because it does not change what applying does.

### DataManager/sub-components/language-editor/sub-components/variables/HardcodedGroupRow.tsx

The near miss count sits on its own row, because it belongs to that phrase.
A row with nothing to apply still appears, with its tick disabled.

### DataManager/sub-components/language-editor/sub-components/variables/variable-token.ts

A variable the engine owns stays a control code, because the game substitutes it at draw time.
Every other variable is inserted as a reference, which survives a rename and becomes literal text only at bake time.
It returns null when an engine key is unknown.

## HudLayoutEditor

### HudLayoutEditor/HudLayoutEditor.tsx

The editor arranges the app drawn HUD and shows it on the surface it will be drawn over.
It has four parts.
A toolbar across the top is the only way anything is added; it also holds what the preview is judged against: the display ratio and the ground.
An outline on the left is the document as a tree, with drag to reparent and reorder, since a stage position cannot express a node's place among its siblings.
The stage in the middle is the play field at true scale, drawn by the game's own renderer over the game's own ground.
An inspector on the right is the selected node's box, plus what a container does with its children.
A slot number is never validated against a device; the running scheme only sizes the preview's slot list and notes, never blocks, a slot past its range.
Nothing is written until Save; the draft is a memento, so walking away leaves the live HUD as it was.
This view is the only tier that touches data: the layout store, saved layouts, input profiles and glyph packs. Everything below takes props.
Both rails keep their width in the view store, never the document, because a panel width is a fact about the editor.
The editor's step is read here and provided as a context, which keeps stepped inputs reusable and measurable.
The motion transport is created here, the only tier allowed to own state the whole editor reads, and passed as a context; under reduced motion it reports itself disabled.
The step strip sits under the preview because it changes how the panel behaves, not what the document says.
The slot scheme, grid solve and flex slot contexts are provided around the inspector, because they are facts about the session.

### HudLayoutEditor/behavior/useHudLayoutEditor.ts

The editor view's data: the draft, edits, glyph packs, schemes, sample state and the placed layout.
The open layout is captured once, so a save that forks does not reopen the editor on the layout it just left.
A save points the edited scheme at what was saved, because a fork nothing wears would be a copy made for no reason.
One solve feeds both the panel's lattice and the stage's overlay and echo, so a panel cell has the stage cell's shape.
One placement feeds the flex strip, so each cell is drawn at the size its child was given.
Deleting the selected glyph pack falls back to Auto, because a deleted pack left selected would silently fall through to the device family.
The whole document's validator blocks Save: any invalid expression makes `errors` non empty, and `warnings` are the reflow notes from `validate-motion-warnings.ts`, shown on the node's Motion section.

### HudLayoutEditor/HudLayoutEditor.constants.ts

The editor's static choices.
`SNES_LINES` is the console's line count; every ratio keeps that height and changes only the width, because the HUD is authored in SNES pixels.
The ratios are the displays a layout must survive: 16:9 is the tightest a host drawn style runs at, 21:9 is where a corner group drifts furthest, and 4:3 is narrower than a host drawn style allows, on purpose, so single ratio layouts show while authoring.
The grounds come from the extraction definitions, not a second list, and from the definitions instead of `SPRITE_MANIFEST`, which is empty in a checkout with no vault records.
`GROUND_TILE` is one ground block in game pixels.
`COUNT_STEP`, `ANGLE_STEP` and `MS_STEP` are steps that belong to the property, not the session: a count is whole children, an angle is degrees, and a duration is milliseconds, where a step of 8 would nudge a 200ms fade by 4% at a time.

### HudLayoutEditor/HudLayoutEditor.type.ts

`layoutId` is omitted from the Advanced menu, where the editor opens whatever the active scheme wears, read from the layout store.
`onCommitted` fires after a successful save, once the live HUD and the edited scheme already point at the saved layout.

### HudLayoutEditor/HudLayoutEditor.css

The editor is a full page reached from the Advanced menu, so it fills its layer.
The toolbar runs across the top with the outline, stage and inspector columns below; rails are fixed and the stage takes the rest, so the stage being judged does not jump when a panel grows.
Rail width is set inline from the view store; the drag previews onto `style.width` and commits on release.
`scrollbar-gutter: stable` reserves the scrollbar's width, so content does not shift as a panel's height changes.
The stage column scrolls, because the stage keeps its aspect and can be taller than a short window; otherwise an element past the fold could not be clicked, which once stranded the wallet.
The global settings strip sits under the preview, pinned to the column's bottom with `margin-top: auto`, as the maintainer asked.
It is separated by a rule, not a card, the same reasoning as `.hud-subsec`.
The segmented track there is intrinsically sized so the label does not stretch away from it.

### HudLayoutEditor/behavior/action-keys

A key press is looked up by the cap label the legend draws, such as `←`, `Del` or `Esc`.
Both manipulation components draw the same legend from the same kind of table, so both use this.
Because the pressed key becomes the cap label and is matched against the action rows, the shortcut always does what the legend says.
A row claims a press only when its caps are exactly that one key.
A cursor row that names four arrow caps claims none of them.

### HudLayoutEditor/behavior/align-options

The alignment values each engine supports, one row of tiles per axis.
A 3x3 pad could not show distribution: nine cells cross two positions, so `between` and `stretch` had no cell.
One row per axis has room for six values and a diagram large enough to read.
Only values the engine supports get a tile.
A grid's `justifyItems` and `alignItems` take start, center, end and stretch, because a grid cell is a real box.
A flex `justify` on the main axis takes start, center, end, between, around and evenly; the last two live in `place-flow.ts`.
A flex `align` on the cross axis takes start, center and end, with no stretch, because the flow engine never stretches and reads a stray `stretch` as `start`.
Rows are named by what they move.
A grid's axes are fixed and drawn as `↔` and `↕`.
A flex container's rows are `main` and `cross`, and the diagrams turn with `direction`.
`CSS_POSITION` is what each tile's own CSS is set to, so the diagram is the value.
`stretch` falls back to `flex-start`, and the bars grow instead.
`justify` runs along `direction` and `align` crosses it, so a row aligns down and a column aligns across.

### HudLayoutEditor/behavior/appearance-summary

What a collapsed group says about itself; the part of `SubsectionGroup` that is not a component.
A closed group must still state its value, such as `2px solid #c8a84e`, or the author has to open every group to find the active one.
Summaries are one line at 188px, so they are terse.
A border reads as width and style, and its colour is the swatch beside it.
A formula reads as a formula, such as `= gap_base`, because `value-text` owns that spelling.
`swatchOf` paints a flat colour as is, draws a gradient, and reduces an image to a hatch.
`paintText` gives the hex itself for a flat colour, since for a background or tint the colour is the whole value.
A shadow summary uses the CSS shorthand order, so it matches the rendered shadow.
`spread` appears only when it is not zero.
The list summary shows the count so it is readable with every card shut.

### HudLayoutEditor/behavior/bound-values

Every data bound `Value` on one node, in one place.
It is the reason the Data section exists, and it feeds the bound count badge on every other section's collapsed header.
It walks the whole node object and finds a bound value by its shape, `{ from: 'data', expr }`.
A new bindable field is found the moment it exists, with no second list to update.
It does not descend into a nested node (`child`, `node`, `otherwise`, `children`), because each is a different node with its own Data section.
A path is classed by its first segment, since each section's fields share one: `style.*` is Appearance and `element.*` is Content.
The counts per section drive the small `● n` badge.

### HudLayoutEditor/behavior/case-match

Which case of a `switch` is winning for the data the stage previews.
In a `switch` the order is the logic, and the reader cannot see it run, so this answers it next to the list of cases.
It uses the engine's own reading: `gateTruthy` from `engine/motion.ts` is the rule `engine/expand.ts` picks a winner with.
A `when` that does not compile resolves to 0 and does not match, as in expansion.
`OTHERWISE` (`-1`) stands for the fallback branch.
Inside a repeat there is no single answer, so the report is a count of instances each case wins, such as `matches 6 of 20`.
`matches now` is kept for a single scope.
An empty scope list means nothing is known, such as no provider or a repeat of 0, and nothing is marked.

### HudLayoutEditor/behavior/check-expr.ts

Says whether an expression can be written as it stands, and what the author needs to hear if not.
The field, the menu and the error line share this one entry point, so they never disagree.
It restates the name rule of `validate-value.ts` on purpose, because that file formats its findings for a file report.
`hud-inspector-value-input.keep.test.ts` checks that the two agree over a table of expressions.
`extraNames` carries `delta`, which is valid only in `transition.when`.
`reads` is empty while the formula does not compile, because a half parsed name list is a guess.

### HudLayoutEditor/behavior/drop-ghost

What the drag ghost says: three lines in a fixed order, computed from one intent and nothing else.
Line 1 states what kind of container the node is dropping into, which the maintainer asked for.
The rest is needed because a gesture that can work three levels deeper than expected owes a readout of the level it chose.
The kind, not the name, leads, because the boxes on screen do not show which engine will place the node.
It speaks only the layout vocabulary: `row`, `column`, `grid 3×2`, `overlap`, `screen`. There is no `stack`.
`overlap` is a UI word and never a document kind.
It is a grid whose children all name one cell, found by shape with `isOverlay`, the same predicate `validate-motion-warnings.ts` reads.
It needs two children, because `isOverlay` is trivially true of a grid with one placed child, and a 3x2 grid holding one node is still a grid.
The grid size uses the same two functions the engine sizes tracks with, so the card matches the layout.
A refused drop names both nodes, and the whole card turns colour so the state reads in peripheral vision.
`refusalText` gives a sentence the author can act on.
It is a pure function of the document and one intent, so every sentence on the card can be tested.
The path runs from the root to the target, so a refused drop shows how far out to move.
The repeat warning says the target draws N times, so the dropped node will too.
In `position 2 of 3` the count leaves out the node when it already sits in that parent, which is the index rule `moveNode` uses.
`with` separates an empty cell from a co placed one, which is how an overlay is authored.
The nudge state was removed along with the stage's drop surface.
`announcementFor` flattens the card into the sentence the outline's `aria-live` region reads.
It takes the model, not the intent, so it cannot drift from the card.
A refusal reads `can't move X.` plus the reason, which already names both nodes.
The card sits below and right of the cursor; anything closer than about 10px covers the line it describes.
It flips to the other side within 150px of the viewport edge, the same reflex `usePickerPopover` has.
The flip is a translation, so the card never needs a layout pass, which would make it lag the cursor by a frame.

### HudLayoutEditor/behavior/drop-intent.ts

What a drop would do, never how the pointer said it.
The outline speaks in rows and zones and the keyboard in directions; both produce a `DropIntent`, and one function consumes it.
The `grid` intent no longer has a producer since the stage stopped being a drop surface, but `applyDrop` still writes it.
This is the only file that makes the move write.
A grid drop is two edits, `moveNode` and `patchNode`, applied as one entry.
`hud-drop-intent.keep.test.ts` checks that no other editor file calls `moveNode`, which is why this file keeps its five functions together.
Validity is checked after the target is chosen and never retargets, so every refusal names both nodes.
`ids` is an array from the start and takes one entry; a multi drop keeps document order and lands contiguously.
The outline can insert at the front of a container.
The screen's child order is the paint order, so putting a backdrop behind everything is a front insertion.
The middle band of a row splits at its midline into `inside-start` and `inside-end`.
A leaf has no inside, so its middle counts as `after`; the screen has no siblings, so its whole row is its interior.
The refusal reasons are: `self`, `descendant`, `not-a-container`, `source-locked` (screen root, repeat child or switch case), `target-locked` (a repeat or switch element), `grid-column` (past the last declared column; rows grow, columns do not) and `budget` (past `MAX_EXPANDED_NODES`).
The screen, a repeat's child and a switch's case have no parent array to splice from.
A repeat or switch element can be dragged but never dropped into, because its child is set in Content.
The budget is measured on the document the drop would produce.
Re measuring every frame is cheap: a pure walk over a few hundred nodes.
A `place` that no longer means anything is deleted on a reparenting drop; a node that only moved inside its own parent keeps its cell.
Entering a container without a cell writes no `place`, so it flows in document order.
The refusal text names nodes by id, because `labelOf` gives the kind and would read `row is already inside row`.

### HudLayoutEditor/behavior/easing-curves

The easings an author may pick, derived from the engine.
`motion-easing.ts` decides what a curve does and `validate-motion.ts` decides what a document may hold; this offers their overlap: five named curves plus `steps(n)`.
Each thumbnail is drawn by sampling `easingFn`, so it cannot drift from the curve it names.
`NAMED_EASINGS` lists no curve, then the one sided curves, then both, the same list the validator accepts.
`CURVE_BOX` is square, so a linear curve reads as 45 degrees.
`CURVE_SAMPLES` is enough for flat step tops and smooth curves at 16px, and short enough for a DOM attribute.
`steps(0)` cannot be produced here: the validator refuses it and `parseSteps` reads it as null, so `stepsName` clamps `n` to 1 or more.
A non finite or fractional `n`, such as a half typed spinner, falls back to the default.
`stepsCountOf` uses the engine's reading, so picker and sampler agree on what a steps curve is.
The path flips y, because SVG y grows down and an easing's output grows up.
An unknown name draws as linear, as it does at render time.
`easingLabel` shows `default` when the field is unset and the animation's own easing applies.

### HudLayoutEditor/behavior/editor-step

The editor's step, carried to every number in the panel.
`ValueInput` has taken a `step` for a long time, so a context lets the step reach about 25 fields without threading it through.
`ValueField` uses it as a default; a field that passes its own `step` still wins, so `opacity` steps by 0.05.
The default is 1, so a field rendered outside the provider, such as a measurement rig, steps by one.
The View is the only provider, and the only reader of `hud-editor-view-store`.

### HudLayoutEditor/behavior/expr-errors

Parse errors from expr-eval, turned into sentences an author can act on.
Every message matched here was probed against the shipped parser, with assignment, function definitions, `in`, arrays and concatenation turned off.
Seven shapes are translated; anything else passes the parser's own words through.
`x in y` and `life_current 8` both report `Expected EOF`, so the source is read to tell them apart.
`in` is disabled on purpose, and the message says so.
A `fix` is a whole replacement expression, so a one click correction cannot half apply.
`column` is 1 based, from the parser's `[1:n]`.
A missing operator between two values is nearly always multiplication, so the fix offers `*`.
An unclosed paren names its call, such as `ceil(`, because that helps in a formula with several parens.
`raw` is the parser's message as `compileExpr` returns it, never the file report wrapper from `validate-value.ts`.
An unknown name is the one error that is not the parser's.

### HudLayoutEditor/behavior/flex-slots

Where a flex container's children landed; it is to the flex editor what `grid-solve` is to the lattice.
The strip draws the stage's own placement, read from `usePlacedLayout`, so a panel cell has the shape of the cell on the stage.
A flex container has no lattice to solve, so where its children were placed is the arrangement.
It is a context, not a prop, because it is a fact about the preview, not about the selected node.
A prop would pass through `NodeInspector`, `LayoutSection` and `FlexEditor` without being read.
An empty list means the container is not on the stage right now, such as a repeat template or a test mount.
The strip then falls back to equal shares.
A repeat's copies share one authored id, so matching on it takes the first instance, as `grid-solve-lookup.ts` does.
A slot's size is in game pixels and unit free, so the strip may draw it at any size.
`useFlexSlots` never returns null, so no caller has to branch.

### HudLayoutEditor/behavior/formula-catalog

What the formula menu offers.
A name that exists only in some places is listed, disabled, with its reason.
Leaving `index` out silently looks broken, and offering it outside a repeat makes a formula that resolves to 0 at runtime with no warning.
`and`, `or` and `not` are the logical operators.
`&&` is a parse error, and `||` used to concatenate into a silent wrong number, so neither spelling appears in any group.
The maths functions are the parser's real set after assignment, function definitions, arrays, `in` and concatenation are turned off.
Trigonometry is left out because a HUD is axis aligned.
The list functions (`length`, `join`, `map`, `filter`, `fold`, `indexOf`, `fac`, `gamma`) are left out because each fails at evaluation time.
`random()` is refused by `compile-expr.ts`.
Groups show what the field can read first, then what it can do with it.

### HudLayoutEditor/behavior/formula-scope

A formula inside a `repeat` produces `count` values, not one.
`InstanceStrip` needs the whole set, so it needs the enclosing repeat's count and `item`.
It is carried as a context because `insideRepeat` is already threaded through about thirty call sites as a boolean.
The inspector answers once at the root of the panel, and the field reads it where needed.
The default is nothing known, not outside a repeat.
A field outside the provider still says it is in a repeat when its own prop says so; it just cannot draw the strip.
The count is floored and never negative, matching the clamp in `engine/expand.ts`; the strip caps its own drawing separately.

### HudLayoutEditor/behavior/formula-starters

The corpus is ten formulas: across the three built in layouts and six presets there are 44 bound expressions and 10 distinct ones.
24 of them are a bare variable name and the rest are four shapes.
They are offered as sentences, with the formula as the subtitle, so each is readable before it is chosen.
The fraction pairs are generated from the `<thing>_current` and `<thing>_max` convention in `variables.ts`, so a new resource gets its fraction for free.
`select` is the part left selected after inserting, so the next keystroke replaces what the author still has to decide.
`CONTAINER_SIZE` is 8 because one heart is eight eighths, so a capacity of 160 is 20 containers.
A `count` is never offered a comparison and a `when` is never offered a fraction, which is why starters beat a flat palette.

### HudLayoutEditor/behavior/glyph-art

Which picture a glyph position draws, resolved like the live HUD: this pack, then its fallback, then generic.
It moved out of `GlyphPickerGrid` so `ReferenceField` and `SlotRefField` can show the artwork at rest.
The D pad cross is one picture for every pack, because DPAD is not a real SDL position.
A null pack means Auto, which is whatever generic draws.
`undefined` is a real answer for a position nothing draws, and `Thumbnail` shows its placeholder.

### HudLayoutEditor/behavior/grid-solve-lookup.ts

The lookup behind `GridSolveContext`: every grid on the stage, solved once, keyed by container id.
`solveGrid` gets the container's real placed rectangle and the same `MeasureContext` that `StageGridEcho` and `ContainerOverlay` read, so panel and stage cells match by construction.
The solve's unit is the container's own placed scale, so a grid inside a scaled subtree solves against the area it has; the compact layout runs at 0.75.
Track sizes come back in authored pixels, so the panel can draw them as `fr` weights and the stage at the display scale.
A repeat's copies share one id, and the first one is taken.

### HudLayoutEditor/behavior/grid-solve

The panel's lattice and the stage read one solve.
An `auto` track's size is its widest child and a `fill` track's is what was left, so only `solveGrid` against a real box can answer.
The View solves once for every grid and hands the answer down as a context.
A prop would pass through `NodeInspector`, `LayoutSection`, `GridTemplateEditor` and `GridEditor` without being read.
`null` means the grid is not on the stage right now, and the lattice falls back to equal shares.
Solved sizes are in game pixels, so the panel can draw them at any scale.
`useGridSolve` never returns null.

### HudLayoutEditor/behavior/index-selection

Picking items out of a strip; the grid's track headers and the flex editor's child cells share this rule.
A plain press picks one, `Shift` takes the run from the anchor, the primary modifier toggles one in or out, and an empty set is no selection.
`isPrimaryModifier` is the only modifier test, so `Cmd` works on a Mac and the legend's cap, from `primaryModifierLabel`, matches.
It writes nothing: selection is context for a toolbar and an echo, never an edit.
Modifiers are taken as a plain shape so a test can press a key without a DOM.
`held` is the current run only when the press lands on the same strip; a `Shift` across strips has no anchor, so the caller decides.
`null` means nothing is selected, because the modifier removed the last member.

### HudLayoutEditor/behavior/keyframe-track

The arithmetic behind `KeyframeTrack`, kept out of the component so its two rules can be tested without a browser.
Keys cannot cross: `sampleKeyframes` sorts by `at` on every sample, so a swap would make the dragged diamond edit a different point.
A drag is clamped against its neighbours in track order, at least `MIN_GAP` apart, since a zero width span cannot be authored on purpose.
A crowded track collapses to the upper bound and does not jump past it.
Adding a key samples the curve where it lands, so the shape is unchanged until the value row is touched.
A click within `MIN_GAP` of an existing key selects it instead of stacking a second key.
`at` is rounded to 2 decimals, because a pointer on a 200px rail resolves finer and long floats in a saved document are noise.
Track order relies on a stable sort, which `Array.prototype.sort` has been since ES2019.
`moveKey` keeps the authored order, because the selected index points into that list.
An unmeasured rail reads as 0, not `NaN`, so nothing bad reaches the document.
A key can be removed only while more than two remain, the validator's minimum, so the button and the handler agree.

### HudLayoutEditor/behavior/layout-sides

The one place the two engines are translated into the shapes the sections take, so no section branches on the engine.
Both engines store `gap: { x, y }`, so `gapCellsOf` gives the same two cells for both, and pressing Type leaves section one's shape alone.
`x` is horizontal and `y` vertical whichever way children flow, so `↔` and `↕` mean the same thing everywhere.
The cap is what the field shows in its row; the label is what a screen reader says.
Alignment is the one thing still per engine.
A grid places items in cells on two fixed axes (`justifyItems`, `alignItems`, both `stretch` by default in `place-grid.ts`).
A flex container distributes along its flow (`justify`, six values) and positions across it (`align`, three values).
Flex rows are named `main` and `cross`, and `main` points wherever `direction` points.

### HudLayoutEditor/behavior/motion-preview

The editor's own transport (scrub, play, pause) for the stage's motion clock, so an author sees a heart pulse without reasoning about keyframes.
It overrides a clock and does not add one.
`HudNodeRenderer` already runs `useMotionClock` for any surface with an animation, so this hook produces one number, `nowMs`, that the stage passes in place of its free running clock.
`null` means do not override, and the stage runs as it always has.
It is a context because the View creates the transport and one control four levels down reads it.
Reduced motion disables it.
Under `prefers-reduced-motion: reduce` every animation is silenced at the source, in the first branch of `resolveNodeAnimationStyle`, so a play button would move nothing.
Transitions and enter and exit keep running under reduced motion, as in the game, and none of them are driven from here.
`DEFAULT_SPAN_MS` is one pass of a 1000ms animation, longer than every duration in the shipped documents.
The scrub is in milliseconds, not cycles, because `delay` puts two animations on one node at different points.
Scrubbing pauses first, since scrubbing while playing would fight over the same number.
The state hook is called once, by the View, and its animation frame loop runs only while playing.
The clock wraps at the span, so play repeats one cycle and the scrub head stays meaningful.
`useMotionPreview` returns null outside a provider, such as a test fixture with no stage.

### HudLayoutEditor/behavior/new-node

Everything the toolbar can insert, built here and nowhere else.
Each factory makes a node that is valid on its own: a fresh id and the minimum a validator accepts.
Nothing sets a size, margin or scale; a new element takes its intrinsic size and its place in the flow.
The label is the outline's, not the document's, so renaming a kind never touches a saved file.
Ids are short and stable because they show in the outline.
A new grid has two `auto` tracks each way, because a 1x1 grid draws nothing recognisable in the template editor's miniature.
A grid was not insertable until phase 7 of `plans/hud-inspector-ux-review.html`; before that the only path was switching a flex container's engine.
An overlay is a one cell grid whose children all name that cell, which is what `direction: 'stack'` became.
Children dropped into it still need their cell, which `GridEditor` writes.
A placeholder child is the minimum a `repeat` or `switch` branch needs; the outline is where it is replaced.
A new countdown has no `variant`, so it follows the profile's own pie until Content pins one.
`labelOf` shows a container's direction and an element's kind, with the number or button that tells it apart.
`slotsOf` lists every slot number a node names; it flags an out of range slot in the outline, and the stage selection uses it.

### HudLayoutEditor/behavior/node-art

What a reference to another node shows: its picture where the editor owns one, a human name, and its kind.
A switch case and a repeat's child are references to whole subtrees, and used to print an id the author never chose.
The editor owns artwork for `sprite`, `glyph` and a `button`'s idle face, so those draw it; every other kind gets a one character stand in and its name.
The id is not dropped, it is demoted: `ReferenceField` shows the kind as the dim half of the label.
`src` is `undefined` when a kind has no artwork, and `placeholder` is what `Thumbnail` draws instead of a broken image.
Each placeholder is a stand in with a shape, never `?`.

### HudLayoutEditor/behavior/node-edits

Editing the tree, as pure functions over a whole document.
Each operation returns a new layout and mutates nothing, so the draft can be a memento: one value to compare against and one to reset to.
The outline's drag, the toolbar's insert and the inspector's edit all use these functions.
There is one tree and one root; the nine anchored regions became ordinary children of the screen.
The screen is the only node with no parent and the only one `moveNode` refuses.
A move is a remove then an insert, with the index resolved after the removal; the other order lands one place short when a node moves down among its siblings.
A repeat's `child` and a switch's case and `otherwise` nodes are reachable too, and their `parent` is null.
They can be selected and patched but never moved or dropped into by the outline.
Removing a case node removes the whole case, since a case with no face means nothing.
Removing a repeat's only child is refused, because a repeat needs one.
Both fold back to the original through `mapTree` instead of producing an invalid document.
A switch never drops to zero cases; it falls back to the original list.
The walk is depth first, parents before children, which is document order; the screen is always the first row.
The screen cannot be deleted: a map that drops it, or returns something that is not a container, keeps the original.
`patchNode` shallow merges a patch; a key set to `undefined` is removed, which is how a box property is cleared.
`insertNode` appends when `at` is not given.
`moveNode` refuses the screen, a target that is not a container, and a target inside the moved node, returning the document untouched.

### HudLayoutEditor/behavior/offset

A node's position is its `margin.left` and `margin.top`, and this is the only place that says so.
The model has no `offset` property on purpose; a displacement already is a margin, which is how the button cluster's radial offsets are authored.
A second property would give every node two ways to move and a merge rule to explain.
`OffsetField` is the only writer left since the stage drag was removed.
A test forbids a hand written `margin.left =` anywhere else in the editor, so a second writer cannot appear unnoticed.
Zero is absent: an offset of 0 means wherever the parent put it, so committing it deletes the key.
`EdgesInput` follows the same rule, so a box that was only looked at does not grow four margins.
An edge set with nothing left in it becomes `undefined`, so a node moved back leaves the document as it was.

### HudLayoutEditor/behavior/sample-state

A plausible save to arrange a HUD against when no game is running.
The editor is reached from settings, where the game is least likely to be up, and an empty save would draw no hearts and no chips.
So the elements get something to draw: a hurt life bar wide enough to wrap, half a magic meter, two and three digit counts, a four figure rupee count, and a pad with six controls, four holding something.
The UI labels this as sample data, and it is never written anywhere.
Health is in eighths of a heart: 14 of 20 containers. Magic runs from 0 to 128.
The countdown is always caught part way, 18 of the digging game's 30 seconds, because a real one runs for 30 seconds at most and would rarely show.
Almost every item is owned, because placeholders get a random item and a silhouette says nothing about density.
Two inventory cells stay empty on purpose, so the dimmed state shows somewhere.
Eight sample slots draw the face group and the D pad; eight is the widest the two crosses get side by side, not a ceiling.
The sample binds none of them, because the preview is about size, not about what fires.
Item ids are the core's new style hud item ids.
The item pool holds ids whose art is distinct enough that a row reads as different things.
Every slot gets an item so density can be judged, as the maintainer asked.
The choice is fixed per slot number, not random, so a placeholder does not change on every keystroke and two people see the same picture.
The second and fourth slots always hold the sword and the contextual action, because a layout must be judged with both and neither wears an item sprite.
It never touches the player's own assignments.

### HudLayoutEditor/behavior/slot-scheme

The slot list the preview is drawn for, reachable from a field.
A slot number is never validated against a device.
The scheme gives a preview: the field shows what a number currently draws, and a number past the list is still legal and previews as empty with a note.
It is a context because the scheme is a fact about the editor session, not the selected node.
The default is an empty list, which means nothing is previewed, not that no slots exist; consumers draw the number they were given either way.
`slotInScheme` only claims something about the preview, not the HUD.

### HudLayoutEditor/behavior/stage-cells.ts

A placed grid's cells in display pixels; the one door the stage's grid drawings use.
`gridCellRects(container, box, unit, ctx)` is easy to break: `box` and its result share one coordinate space, and `unit` is that space's pixels per authored pixel.
The stage drawings once passed the game pixel rect with the display scale as `unit`.
Fixed tracks looked right, but `fill` tracks stayed in game pixels, so the grid drew at `1 / displayScale` of its size: selecting all nine screen cells lit 72% of the stage at a 1.39 scale.
So the solve runs in game pixels at the container's own placed scale, then multiplies by the display scale, and a caller never sees either half.
`hud-stage-cells.keep.test.ts` checks that no other editor file calls `gridCellRects`.

### HudLayoutEditor/behavior/stage-slot-rects.ts

A flex container's slots: the box each child was placed in, so the space between them reads as a gap.
There is nothing to solve: a flex child either took part in the flow or left it (`collapsed` in `place-flow.ts`), so where children landed is the arrangement.
Placed ids are unique after `expand.ts` suffixes repeat copies with `#i`, so matching by id cannot pick up another instance.

### HudLayoutEditor/behavior/scaled-rect.ts

The one display scale conversion both stage drawings share.

### HudLayoutEditor/behavior/step-intent

The keyboard producer: it turns a node and one of four directions into the same `DropIntent` the pointer makes.
Reparenting is the main structural edit in this editor, and it was pointer only until this existed.
It is not a hit test: the intent comes from the tree and goes through the same `applyDrop`, so the keyboard cannot reach a state the pointer could not, and a refusal reads the same sentence.
Up and down reorder; left and right promote and demote, as in every outline editor (Word's outline view, OmniOutliner, Blender's outliner, Markdown lists).
`null` and a refused intent differ.
`null` means there is nowhere to go, such as already first or last, and the row shakes, because the list already shows it.
A refused intent means there is a target and it is illegal, which is a sentence and is announced.
The screen, a repeat's child and a switch's case have no array to splice, so they have no step.
`out` moves into the grandparent, just after the old parent; `in` appends to the previous sibling when it is a container.
The menu rows follow the wireframe's order.
A dimmed item that names its precondition teaches the rule, so `Move out of hud` keeps the parent's name even when dead, and `Move into...` stays an ellipsis until there is a sibling to name.
`STEP_KEYS` is the one map the row handler and the menu's shortcut column read, so a hint never names a key that does something else.

### HudLayoutEditor/behavior/toolbar-menus

Everything the toolbar's list style buttons can insert or start from.
Sprite and Glyph are picked by eye in `SpritePicker` and `GlyphPickerGrid`, and Slot has its own panel (`SlotPickerPanel`), so they are not built here.
What remains is a plain list: containers, the spacer, the dynamic objects, the subtree presets, and the start from layout list.
A new element kind needs a way in here or it cannot be inserted.
The four vitals (`life`, `magic`, `consumables`, `wallet`) no longer exist in `HudElementSpec`; hearts, the magic bar and the wallet are ordinary subtrees in the Preset menu now.
Every row carries an icon in the same column, so a menu reads as a column of pictures.
The icons are Lucide through `@iconify/react`, one stroke weight at 16px; Unicode characters drew in whatever font the OS picked.
Row and column take the icon that draws what they do: a flex row puts children side by side, which Lucide calls `columns`, and a column stacks them, which is `rows`.
Overlay is a grid preset, a 1x1 grid whose children share the cell, so the common case is one click.
The Grid entry made grids authorable from the toolbar; before it the only way was to insert a Row and switch its engine.
The dynamic objects each insert the minimum a validator accepts, ready for the inspector to tune; the countdown sits beside them because it draws live data and has nothing to pick by eye.
Each preset insert is a fresh copy from `instantiatePreset` with every id rekeyed, so nothing points back at the preset.
The start from list is the same list `PresetBar` shows.
`GLYPH_POSITIONS` is every position a pack is keyed by, plus the synthetic whole D pad cross.

### HudLayoutEditor/behavior/track-extents

A grid's track list, as list edits.
They live outside the component because a track list is the one thing in this section a document can get structurally wrong (`columns` may never be empty), and the edits are testable without rendering.
`trackWeight` is a gauge, not geometry: the lattice takes its proportions from the engine's solve (`GridLattice/behavior/lattice-geometry`), so this weight sizes nothing a pointer aims at.
`fill` draws wider than `auto`, and the measured modes scale off typed numbers: 16 game pixels and 25% both land on 1.
The four extent modes live here, because both `ExtentField` and the selected track's header (`TrackHead`) offer them.
A bare expression is `px` shorthand, as `hud-node.ts` notes.
A bound extent has no literal to carry across a mode change, so it reads as 0; `ValueField` is where an expression gets a real editor.
A data bound track's chip shows `ƒx`, the same mark `ValueInput` uses for a formula.
A range edit applies to every track the header selection named, not just the anchor.
A new track lands after the one it was added from, where the strip's `+` sits.
A move out of range is refused, not clamped, so a button that should be disabled cannot swap without notice.

### HudLayoutEditor/behavior/transition-edits

`node.transition` holds two unrelated ideas: value transitions (a bound number changed, ease toward it) and enter and exit.
Two subsections of Motion write that one field, so the merge lives here, owned by neither.
Unchecking the last property must not drop an enter, and clearing an exit must not drop the properties.
The object becomes `undefined` only when nothing is left: no properties, no enter, no exit.
Which properties something drives is an annotation, not a filter; every property is offered.
`position` counts as driven only inside a `repeat`, the one case where placement moves without a bound field naming it.
An explicit `undefined` in the patch means clear the key, so such keys are removed and no `"easing": undefined` reaches the saved JSON.
The six properties follow the order of `hud-motion.ts`.

### HudLayoutEditor/behavior/tree-context

Questions the inspector's sections ask about where the selected node sits, which `siteOf` alone cannot answer now that repeat and switch nodes are reachable.
`realParentOf` finds the real container a node's box is placed under, walking through repeat and switch ancestors as `validate-motion-warnings.ts` does, since they draw no box of their own.
The Placement section's cell fields and the Layout section's engine both key off it.
`isInsideRepeat` says whether `index`, `count` and `item` are valid names for `validateValue`.
`enclosingRepeatOf` gives the nearest repeat's spec, so the editor knows how many values a formula produces and what each `item` reads, the same names `engine/expand.ts` uses.
`breadcrumbOf` gives root to node labels for Identity.
`ancestorIdsOf` gives the ids between the root and the node, which the outline must expand before it can scroll to a row selected on the stage.
`rootsOf` stays a function so every walk reads where the document starts from one place; it was a list while regions hung beside the screen.

### HudLayoutEditor/behavior/use-drag-autoscroll

The outline's drag reaches past the fold with a ramped animation frame pan on its scroller.
Only the outline pans, because only it takes a drop; the stage column lost its drop surface, and a scroller that pans under a drag it can never accept moves for no reason.
Depth in the band is speed: `RATE` ramps linearly across `HOT`, because a constant rate either overshoots or crawls.
That is why the band is drawn (`.is-autoscroll`).
`HOT` is one outline row plus a margin: deep enough to enter on purpose, shallow enough that the last row can still take a drop.
`RATE` is pixels per frame at the very edge, and 0 at the inner lip.
`rateFor` is exported so a test can pin the ramp without a DOM.
It pans only while the pointer is inside the scroller's rect, so a drag that wandered off the rail does not drag the list along.
Each frame that moved the scroller re-emits the pointer's last position, so the target keeps resolving as rows slide under a still cursor.
It uses animation frames, never `setInterval`, so it runs on the same clock as the ghost.
The loop stops four independent ways: `active` going false (a drop or `Escape`), `pointerup`, `pointercancel` or `blur`, and the effect teardown.
Not scheduling the next frame is itself the stop, when the band was left or nothing is left to scroll.
Reduced motion halves the rate and never disables it, because disabling makes a target unreachable; the keyboard path is the real answer for anyone who cannot drag.
The setting is read once per drag, because `window.matchMedia` does not exist in every host.
`scrollerFor` walks up to the nearest ancestor that can scroll, because which element scrolls is a CSS decision; `.hud-outline__rows` was not a scroller at first.

### HudLayoutEditor/behavior/repeat-move.ts

Re-emits the pointer's last position so the gesture re-resolves while the pointer is still.
Auto scroll needs it: rows slide under a still cursor, and a hit test that only runs on `pointermove` keeps naming the old row.

### HudLayoutEditor/behavior/useDragGesture.ts

The outline's drop gesture, now its only caller since the stage nudge was removed.
It uses pointer events, not the HTML5 drag API.
That API's drag image is a snapshot taken once at `dragstart`, which fights the ghost card, and hiding it is a per platform hack.
`dragover` is coarse and throttled, and the zone arithmetic needs a real point every frame.
It keeps `useResize`'s discipline: pointer capture, a slop threshold, a preview on every move, and one commit on release.
The drag never touches the document: `resolve` is pure and `commit` runs once on `pointerup`.
So cancel is free, and the tree is not re solved under the pointer mid drag.
The old stage nudge wrote the document on every `pointermove`; one drag is now one edit, counted in `tests/hud/hud-drag-gesture.keep.test.ts`.
Capture is taken at the threshold, not the press, so a wobbling click is still a click.
Once the gesture is real, the trailing `click` is swallowed in the capture phase, because a press and release on different rows still synthesise a click on their common ancestor.
`Escape` cancels the drag and nothing else; it sits at the `drag` level of the dismiss stack, above `popover`.
It registers only while a drag is live, so a press that never moved owns no key.
`SLOP` is 2: below it a press is a click that wobbled.

### HudLayoutEditor/behavior/useOutlineKeys.ts

The outline's keyboard path: four shortcuts on a focused row, and the sentence they announce.
The modifier is `isPrimaryModifier`, not literal `Ctrl`: `metaKey` alone on macOS and iOS, `ctrlKey` alone elsewhere, either where the host cannot say.
The keys were checked to be free: the global map binds Alt+Enter, Ctrl+Shift+D, the primary modifier with K and `Escape` (`useKeyboardShortcuts.ts`); the search palette owns bare arrows and Enter only while focused; `KeyRail` owns bare Left and Right on a keyframe.
Shift and Alt are excluded so a Ctrl+Shift+Arrow text selection is never swallowed.
It is bound on the row, not on `document`, so there is no second global listener to order.
One `aria-live` region, written only here, reads `announcementFor`, the ghost's lines flattened, so the announcement and the card share their phrasing.
Nowhere to go is not a refusal: the row shakes 2px for `SHAKE_MS`, long enough to see and short enough that a held key still repeats.

### HudLayoutEditor/behavior/useOutlineScroll.ts

Scrolls the outline to the selected row only when the selection came from outside the outline.
`onSelect` is shared by the stage, the inspector and the outline's rows, so the origin is found by comparing with the last id the outline's own rows selected (`markSelf`).
Scrolling the list under the cursor right after a click in it is the jumpiness this avoids.
Collapsed ancestors are expanded whatever the origin, because a hidden row must exist before it can be scrolled to.
`lastHandled` is separate from `lastSelf`, so an unrelated re-render cannot scroll again for an unchanged selection.
The scroll waits one frame for the expanded row to exist.

### HudLayoutEditor/behavior/usePanelResize.ts

The outline and inspector rails' resize wiring, kept out of the editor's view.
Width comes from the view store, `useResize` drives the drag, and `onPreview` writes each rail's inline style so state only changes on release.
The inspector's handle is on its own left edge, so `invert` flips the delta.

### HudLayoutEditor/behavior/useSpringLoad.ts

Hovering a collapsed row during a drag opens it after 500ms, like Finder and Explorer, at the low end of their 500 to 600ms range.
Collapse state is `collapsedNodeIds` in the view store, because folding a row is a fact about how someone is looking at the tree.
It is for aiming past a row, not reaching it: a collapsed row is already a target (`inside` appends), and spring load reaches its descendants.
A spring opened row closes again on drop unless the drop landed in it or below it.
A drag should not leave the view changed, but closing the row that just received the node would read as a failed drop.
A cancel closes every sprung row, since nothing landed.
The timer resets on leaving the row, and `pending` drives the caret's wait, the only animation in the design.

### HudLayoutEditor/behavior/useTextValue.ts

The draft and commit half of `TextValueField`, applying `useValueInput`'s rules to a string.
There is no mode switch: one field, one string, and a leading `=` is the only thing that means formula.
The old `text | ƒx` switch destroyed the formula on a round trip.
A literal commits on change, so the stage follows typing; a formula commits on blur or Enter, so a half typed one never reaches the document.
Escape abandons the draft and marks the key handled.
A blur with nothing uncommitted writes nothing, so a click that changed nothing does not mark the draft dirty.
The `=` chip appears on focus and does what typing `=` does, keeping the text already there.
`dirty` is an edit that has not reached the document, which is why a result is withheld.

### HudLayoutEditor/behavior/useEditorSchemes.ts

The control scheme running right now, a quiet background fact and never a control set in this editor.
Slot numbers are never validated against a device, so this exists for two things only.
It sizes the preview's slot list realistically, so a pad layout previews with pad shaped content and a keyboard layout with keyboard shaped content.
It writes the scheme's half of the layout and scheme link on save, so a saved copy still points at a scheme that wears it.
The list comes from the profile's input profiles through the same migration every reader uses, so old slot lists show their real numbers.
Only schemes with a modern block are offered, because a classic profile has no slots.
The scheme in force is found in three steps, because none is always right.
The live settings come first, when a profile is loaded for play.
Then the profile's own recorded choice, which outranks the input manager, because the manager is seeded with the keyboard preset at boot.
The manager is used only when there is no stored choice.
A change is written to disk and to the running session; re-pushing the active profile rebuilds the bindings, and both the HUD layout store and the control scheme store follow them, so the game sees it at once.

### HudLayoutEditor/behavior/useGlyphPacks.ts

Every glyph pack the editor can offer, and the operations on the player's own packs.
Custom packs are loaded with the shipped ones and passed to the glyph chain as one list, so a custom pack is consulted first and falls through to the pack it names and then the device family.
Images are primed into the object URL cache as soon as packs are read, because rendering needs that lookup to be synchronous.
`version` bumps whenever an image is added or removed, because a re-import keeps the same file key and the pack object alone cannot say so.
`packs` lists shipped packs first, then the player's own, as one stable array so the preview's memo holds.

### HudLayoutEditor/behavior/useLayoutDraft.ts

The working layout, kept as a memento.
The editor copies the layout in force when it opens (`origin`, never written), edits `draft`, and only Save reaches storage and the layout store.
Closing the editor leaves the HUD as it was, and Reset returns to the memento without an undo log.
`dirty` is a comparison against the memento, not a flag, so an edit that restores the original reports nothing to save.
A built in layout is a file in the repository, so saving one always forks it; "Save as..." makes that explicit.
`apply` takes a pure transform over the whole layout and is the only way anything changes the draft.
The toolbar's insert, the outline's drag and the inspector's fields all arrive through it.
Start from keeps the draft's own identity when it has one, so it restyles the open layout instead of switching layouts.
The start from list holds the shipped layouts, then the custom ones.

### HudLayoutEditor/behavior/useNodeEdits.ts

Selection, and the things that can be done to the selected node.
The selection is an id, not a node, because every edit rebuilds the tree and a held node would be stale one keystroke later.
`drop` is the one door both surfaces' `DropIntent` comes through; `behavior/drop-intent.ts` is the only module that calls `moveNode`, and a test checks it.
The newly inserted node becomes the selection, because the next step is usually to size or move it.

### HudLayoutEditor/behavior/insert-site.ts

Where an insert lands.
With a container selected it goes into that container.
With an element selected it goes beside it, in its parent, right after it.
With nothing selected it goes into the screen, so the toolbar is never inert.

### HudLayoutEditor/behavior/useSampleState.ts

What the editor's preview draws against.
The vitals prefer the running game, and the slots never do.
The vitals decide size, so a player who alt tabs out of a save arranges against their own numbers; with nothing running, a plausible save exercises the same size questions.
The countdown is always sample, drawn in the profile's own pie, so a countdown node is always visible on the stage.
The slots are always sample, with an item dealt to every placeholder, because a live save with two things assigned says nothing about density.
The slot list comes from the scheme being edited for, not the device in hand, so a pad layout draws pad glyphs and a keyboard layout draws key caps.
The content has the same shape the live HUD passes the renderer, built by the same `buildSlotContent`, so the preview cannot disagree with the game.
A save with no heart containers has never been loaded, which is the whole liveness test.
Bow tier 3 and up is the silver art, as the live HUD reads it, and health is stored in eighths of a heart.

### HudLayoutEditor/behavior/useSampleState.type.ts

`live` is false when nothing is running and the values are made up.
`filledSlots` lists slot numbers that fire something, for the layout pass's dim rule.
`hearts` counts heart containers; the life block grows a row per ten.
`dataScope` is what every bound value, repeat and switch in the preview reads, built from the same vitals.
An empty `slots` argument falls back to a plausible eight.

### HudLayoutEditor/behavior/value-text

The one rule that replaced the `123 | ƒx` switch: what a person types, and what the document keeps.
The leading `=` is the only thing that marks a formula, and it is never stored.
Text with no `=` that parses as a finite numeral is a number; text with a leading `=` is always `{ from: 'data', expr }`, even when a bare numeral follows.
So `=24` and `24` are both legal and both round trip.
`compile-expr` never sees the `=`, and every shipped layout reads back as, for example, `= ceil(life_max / 8)`.
`==` escapes one literal `=`, as in a spreadsheet; it matters only on a text field.
The stepper is a predicate, not a mode: the arrows, spinner and wheel work while the current text is a bare numeral, checked on every keystroke.
`NUMERAL` is stricter than `Number()`: an empty string, a space, `Infinity` and `0x10` are not numerals, or clearing a field would commit a number.
A stored expression is always shown with its marker back on.
`undefined` is the empty field, for optional properties such as a min or max limit.
An unparseable literal on a numeric field is an error the caller reports, not a value it stores.
A `text` element's `value` is the one property that is `Value | string`, and the one place the `==` escape is used.
`TextContent` once had an outer `text | ƒx` switch that threw the expression away; there is no switch now, so nothing is lost.
A stored string that starts with `=` is shown escaped, so what reads back is what was stored.
A text value never fails to parse: anything not a formula and not a numeral is a string.
A bare numeral stays a number, because `format.digits` and `format.pad` only apply to numbers (`hud-text.ts`).
Typing `=` before `24` keeps the digits as the start of the formula, and deleting the `=` leaves text the field reads back as a numeral if it can.

### HudLayoutEditor/sub-components/AlignmentTiles.tsx

One labelled row of tiles per axis, and each tile draws its own answer.
The diagram is the value: a tile's outline uses the very CSS it writes, a two cell grid with the literal `justify-items` and `align-items`, or a flex box with the literal `justify-content` and `align-items`.
So `space-around` can only draw as `space-around`, and if the engine ever drifts from the browser, a screenshot shows it.
The old 3x3 pad crossed two positions, so `between` and `stretch` became orphan toggles and `around` and `evenly` could not be added; its previews were 18px squares.
Flex diagrams turn with `direction`, because a flex container's axes do; a grid's rows are `↔` and `↕` and always draw across.
Every tile is the same size, set by the widest row, because rows sized separately drew the same control at two sizes.
A row longer than four folds in half, so six main axis tiles split into positions (start, center, end) over distributions (between, around, evenly).
On one line they were about 26px wide at the 232px rail, and the three distributions differed by about a pixel.
The fold keeps start, center and end lined up down the whole component, and every line is full.
A grid tile has two bars, one per cell; a flex tile has three, enough to show a gap at each end and one in the middle.
A bar lies across the axis it moves along, so it reads as a child and not an arrow.
`stretch` changes the bar instead of moving it: the fixed size goes `auto` so the grid's own stretch fills the cell.
A row's `key` is the document key it writes, and also the tile's `data-align` prefix that tests press.
The cap is printed in front of the row; `label` is the group's accessible name.

### HudLayoutEditor/sub-components/BoundedValueField.tsx

A scalar with a known range, drawn as its range: `fill (0-1)`, `armor (0-2)`, `bands (1 or 2)`.
The slider is the second half of the field, not the field: `ValueInput` stays, because a bounded scalar is just as bindable and `= item` is the most common thing written into `fill`.
The slider shows only while the value is a literal number; a formula has no handle, so there is no track.
Out of range is still not an error: a stored `fill: 4` loads, draws and reads back as 4, and only the slider's handle is clamped to the track.

### HudLayoutEditor/sub-components/BoxModelField.tsx

The box model, drawn: padding nests inside margin, with an editable number on every edge and the box's size in the middle.
Every browser inspector since Firebug in 2006, Figma, Webflow, Unity's RectTransform and Blender's N panel draw it this way, because the nesting says which side is which.
The old four spinners in a row had 3px of typing surface at the 188px rail.
Margin left and top are dimmed and read only, because Placement edits them as the node's offset (`behavior/offset`); two editors for one pair of keys would compete.
Only padding gets the link toggle: two of the margin's four edges belong to another section, so linking them would write keys this control does not own.
The screen root has no margin, because its rectangle is the view.
`centre` is the authored size shown in the middle cell, such as `80 x auto`.

### HudLayoutEditor/sub-components/ButtonStateRow.tsx

One button state's face: an image from the same sprite grid as the toolbar's Sprite insert, or a glyph picked by sight from `GlyphPickerGrid`, never typed by name.
An absent optional state falls back to `idle`, the one state that is never empty.
Both faces are `ReferenceField`s, so neither can be typed into; a typo in the old sprite slug box made a face that silently drew nothing.

### HudLayoutEditor/sub-components/ButtonStatesEditor.tsx

A `button`'s whole Content: which control it binds to, then a face per state.
It binds by verb or by slot number; slot numbers are 1 based and uncapped, since a keyboard alone reaches 107 glyphs, and never validated against a device.
The slot half is `SlotRefField`, which shows the glyph the number currently draws instead of repeating the "any number" policy.

### HudLayoutEditor/sub-components/CaseListEditor.tsx

A `switch`'s cases. They reorder, because the order is the logic: the first match wins, top to bottom.
It also has an `otherwise` row and "+ add case".
A case's `node` is a whole subtree, so this edits only `when` and the case's place in the list.
Its content is tuned like any other node: select it in the outline, which lists it, and the rest of the panel takes over.
The case node is a `ReferenceField` whose button jumps the selection there.
Which branch is winning is drawn, not deduced: `behavior/case-match` asks the engine's own predicate, so the marker matches the stage.
Inside a repeat a switch runs once per instance, so the previewed data is the whole set and the marker shows a count, such as `matches 6 of 20`.

### HudLayoutEditor/sub-components/ColorField.tsx

One colour row: a swatch that opens the real picker, and the hex beside it.
Appearance's background, border, outline, tint, text colour, text stroke and every gradient stop use this row.
The swatch is the control; the hex is a readout you may also type into.
`ColorPickerPopover` owns the floating half: it portals onto the `popover` layer, flips when there is no room below, and sits on the shared dismiss stack, so `Escape` closes the picker and not the whole editor.
The grid's guide colour does not use this row: `LayoutSettings` anchors the popover to a bare `ColorSwatch`, because the hex box was the widest thing on that line.
Appearance keeps the hex, because a gradient is read by its numbers as much as by its squares.

### HudLayoutEditor/sub-components/ContainerOverlay.tsx

The selected container's own arrangement, drawn over the preview in its own `guide.color`, only while the grid view toggle is on, and never in the game.
It reads `useHudEditorViewStore` directly, as `EditorToolbar` does for this view only flag.
It works for either engine.
A grid draws its cell boundaries from the engine's own solve (`stageCellRects`), so an empty column still has lines.
A flex container draws its children's slots from where they were placed (`stageSlotRects`); the space between them shows as the gap it is.
It is purely visual: no click targets, no writes, `pointer-events: none` and `aria-hidden`.
The lattice lists every cell edge once.
`OverlayFlexSlots` insets each slot by a pixel and dashes it, so a first child's slot never sits exactly under the gold selection outline and reads as one box.

### HudLayoutEditor/sub-components/DirectionControl.tsx

Two arrows instead of a text `Select`: which way a flex container's children flow.
There used to be a third answer, `stack`, until overlay went back to the grid it always was; "Overlay" is now a grid preset in the Container menu.
The arrows are Lucide icons, and the "direction" label is gone in the `bare` variant, because an arrow already says direction.
Each option's label is its accessible name and tooltip: a word plus what it does.

### HudLayoutEditor/sub-components/DisabledReason.tsx

A group that cannot be edited yet, with the cause on it.
The fields stay visible, because a property that vanishes when a switch flips is one you stop trusting.
The reason sits on the surface, and the one control that would lift the lock is offered as an action.
It is `DisabledOverlay`, which already handles `inert` on the covered subtree (out of the tab order and the accessibility tree), the scrim and the action; this adds the inspector's density.
It is always `contained`, because every caller sits in the scrolling inspector rail, where the default overhang would be clipped.
`actionLabel` is omitted for a lock nothing here can undo, such as the screen root, whose rectangle is the view.

### HudLayoutEditor/sub-components/DragGhost

The card that follows the cursor while an outline drag is live, in three lines.
What it says comes from `behavior/drop-ghost`; this is only the drawing, so the wording is testable without a DOM and the outline's `aria-live` region reads the same words.
It tracks the cursor itself, because the gesture skips re-renders when two frames resolve to the same drop, and the card must move every frame.
It renders through `Portal` at the `tooltip` layer, so neither the stage's `overflow: hidden` nor a rail's scroller clips it, and an open picker never draws over it.
It does not animate, because an eased ghost reads as latency.
The first frame after the slop threshold has no point yet, so it is skipped.
`GhostCard` is separate from the portal and tracking so the drawing can be server rendered and measured in the headless harness.

### HudLayoutEditor/sub-components/EasingPicker.tsx

The easing curve, drawn, as every motion tool does (After Effects, Framer, Webflow, the devtools cubic bezier editor), instead of five names in a `Select`.
It offers the engine's own set: five named curves plus `steps(n)`, each thumbnail sampled from `easingFn`, so a tile cannot show a shape the renderer would not draw.
`steps(0)` is unreachable because the count floors at 1, the same `[1-9]\d*` the validator enforces.
A tile is a toggle: six small tiles wrap inside the 188px content floor and each shows its answer at rest.
The `auto` tile appears only where the field may be unset, such as a keyframe's span override that inherits the animation's easing.
`unsetHint` says what no choice means at each call site: a keyframe inherits its animation's easing, a transition falls back to the renderer's `ease-out`.

### HudLayoutEditor/sub-components/EdgesField.tsx

Which sides a border draws on, as `HudBorderSides` (`hud-style.ts`).
Absent means every side, so an author who never opens it gets a border on all four.
It edits four booleans, unlike `EdgesInput`, which edits four numbers, so it stays its own component.
The first uncheck seeds the other three as explicitly on, and when all four are on again the value becomes absent.

### HudLayoutEditor/sub-components/EditorStage.tsx

The stage is the play field at true scale over a real ground.
Its aspect is the ratio being judged, one game pixel is one stage unit, and every element is drawn by the same `HudNodeRenderer` that draws it in game, over the same solved tree.
The ground is tiled behind it because two defects in one week were invisible against the background they were drawn on.
The grid is one tile of 8 game pixels, the game's own unit.
Picking and selection are a layer of their own, so the art is untouched by the editor.
Nothing is dragged here; the margin nudge and corner scale handle are gone, so what the engine placed is drawn as is.
The overlay targets the selected node when it is a container of either engine, or its real parent when a child is selected, so a child is seen in the arrangement that placed it.
The motion transport's `nowMs` overrides the stage clock only once the author takes hold of it.

### HudLayoutEditor/sub-components/StageGridEcho

The stage's echo of what is selected in the grid editor, for "click a cell, see it in the layout", and nothing else.
`pointer-events: none` on the layer matters: the surface it replaced was clickable, and that was removed on purpose.
Geometry comes from the engine's solve through `stageCellRects`, not from where children landed, so an empty cell still has a rectangle to point at.
A repeat's copies all echo, because one template became N boxes.
`hull` is the bounding box of the selected cells.

### HudLayoutEditor/sub-components/StageFlexEcho.tsx

The same echo for a flex container's picked children.
There is nothing to solve: a child's placed rectangle is what the strip pointed at.
Every expanded copy whose authored id was picked lights up.

### HudLayoutEditor/sub-components/EditorStepStrip.tsx

The editor's global settings strip, under the preview in the centre column, where the maintainer put it.
It holds one setting and is built to hold more: `STEP 1 · 2 · 4 · 8`, how far one `−` or `+` in the inspector moves a number.
8 is there because the game's grid is 8px, and 4 and 8 are the gaps people type most.
It lives in the centre column because a setting that changes every stepped field cannot sit inside one section without reading as that section's property.
It is view only: the View reads `hud-editor-view-store` and passes the value and setter.

### HudLayoutEditor/sub-components/EditorToolbar.tsx

The bar across the top: everything that can be added, and everything the preview is judged against.
It is icon only, grouped by what a button makes, with separators between groups; tooltips carry the names.
Sprite and Glyph open picker grids, because you recognise them by picture, never by filename.
The display ratio and the ground sit on the right; both are session only and never written to the document.
The glyph pack is written to the document and is edited only in the inspector's `GlyphPackPicker`, so this toolbar does not repeat it.
One menu is open at a time, closed by choosing, by Escape, or by pressing anywhere outside a menu.
A press outside the bar and any open panel closes it; panels may be portalled, so they are checked too.
The bar, not each menu, registers at the `menu` dismiss level; a picker it opens registers at `popover` and wins, so Escape over the sprite grid closes only the grid.
The grid view toggle moved to `LayoutSettings`, beside the guide colour it draws, and is not mirrored here.
Snapping stays, because it is about the stage and belongs to no rail section.
The icons are Lucide, from one table in `behavior/toolbar-menus`.
`slotNumbers` are a shortcut in the Slot panel, never a cap on what can be typed.
`targetLabel` names the container where the next insert lands.

### HudLayoutEditor/sub-components/EngineToggle.tsx

Which engine arranges this container: two icon buttons and nothing else.
It replaced a full width `SegmentedControl` under an "engine" label, which cost about 40px in a section whose problem was height.
It is defined once and mounted in two places, in the grid toolbar and at the head of the flex bar, so neither copy can drift.
It is deliberately simple: `onChange` is the caller's engine swap, which reshapes the node in `LayoutSection`.
The icons show the arrangement: three bars spread along a line for flex, a lattice for grid, the same icon as the toolbar's Grid row.

### HudLayoutEditor/sub-components/EnterExitEditor.tsx

Motion's third block: what happens when the node itself arrives or leaves, such as a `repeat` gaining or losing a child.
"A bound value changed" cannot describe something that did not exist a frame ago.
It renders whatever is bound; the old Transitions section hid enter and exit when nothing was bound, which gated an unrelated control.
Outside a repeat it is annotated, not disabled, because authors often build the child first and wrap it in the repeat later.
Each row is one `ToggleGroup`, because `properties` is a multi select: a fade and a scale is an ordinary enter.
`position` is the small settle that `useEnterExit`'s pre enter transform draws, not a free offset.
The validator refuses empty `properties`, so clearing the last one clears the whole enter or exit.

### HudLayoutEditor/sub-components/ExpressionInput.tsx

A bare expression string, wherever the document stores one instead of a `Value`: a switch case's `when`, a repeat's `item`, an animation or transition gate.
It is the same field, adapted at the type boundary only; the leading `=` is typed, never stored.
`role="gate"` offers comparisons and `and` as starters, never fractions.
The old `+ var` select appended names at the end only, and the `? syntax` link opened expr-eval's README, which describes features this grammar refuses; `FormulaMenu` replaces both.
`extraNames` carries a name valid only at one call site, such as `delta` in `transition.when`.

### HudLayoutEditor/sub-components/ExtentField.tsx

One axis of a box's size as one field: a number whose unit is the mode.
The old `ExtentInput` used two rows, with `auto` and `fill` leaving an empty disabled spinner; Figma and Webflow use one field whose suffix names the unit.
There is no spinner: a `NumberInput`'s spinner column is 29px, more than half of a half width field at the 188px rail.
`NumberCell` keeps the arrow keys, so the field is wider than the two row control it replaced.
The suffix opens a four item menu instead of cycling, so every mode is one click and visible.
It is a `DropdownMenu`: portalled, and on the dismiss stack at `menu`, so one `Escape` closes only the menu.
`bare` is for the grid toolbar's slot, which reserves a fixed height; the label becomes the group's `aria-label`.
A bound extent has no literal to show, so it reads as blank; `ValueField` is where an expression is edited.

### HudLayoutEditor/sub-components/FlowSettings.tsx

Section two is Flow, its own section for one reason.
`direction` and `wrap` once sat above the alignment tiles in the same section, and since flex tiles turn with `direction`, pressing `column` rotated tiles two rows below in that section.
The maintainer's rule is that nothing in a section may change when another option in the same section is clicked.
The tiles still turn, but now a later section reacts to an earlier one, which the rule allows.
Two icon options on one row, about 86px, fit every rail width from 220 to 320.

### HudLayoutEditor/sub-components/FontPicker.tsx

Real faces only: ALttP Dialogue, the bundled pixel recreation, and the app's UI sans and mono. There is no library of others.
The game face only looks right at whole multiples of its 16px design size, so its size snaps to one.
`FONT_VARS` are the same variables `HudText` draws with, so the specimen is the face the stage uses.
The specimen shows the face at the chosen size and weight, because a name in a `Select` says nothing about how it looks.
Weight is a slider: CSS defines nine weights and both UI faces are variable across all of them.

### HudLayoutEditor/sub-components/GlyphPackPicker.tsx

Which artwork the chips wear.
"Auto" is the default and follows the pad in hand, so a player who never opens this sees their own controller.
A chosen pack overrides the device; a custom pack overrides only the positions it has images for and inherits the rest, so importing one button is quick.
Only positions the current cluster draws are offered, because a glyph for a control the pad does not report is invisible work.

### HudLayoutEditor/sub-components/GlyphPickerGrid.tsx

The Glyph insert, picked by eye: tabs are the packs and tiles are the artwork.
It replaced a nested menu that asked players to recognise a control by its SDL name, such as `LEFT_SHOULDER`.
Each tile resolves through the live HUD's fallback chain (pack, its fallback, generic), so a position shows the picture it would get in game.
A position nothing draws is left out.

### HudLayoutEditor/sub-components/GradientRamp.tsx

The ramp is what is being edited, so the ramp is drawn, as in Figma, Photoshop, devtools and Blender's colour ramp.
It replaced one row per stop with nothing rendering the gradient.
Only the selected stop takes rows, so any number of stops costs one ramp and two rows.
Click selects, drag moves, and double click on the ramp adds a stop there.
Arrow keys nudge the focused stop by 1%, or 10% with Shift, and `at` is also a number field, because dragging is for feel and typing is for exact values.
Stops are sorted on every write and the selection follows the moved stop, so dragging past another stop does not start editing its neighbour.
`at` is a bare number in `hud-value.ts`, not a `Value`, so it uses `NumberInput`; a stop position cannot be bound.

### HudLayoutEditor/sub-components/GroundPicker.tsx

Which surface the HUD is arranged over: five flat grounds cut from the game (turf, an indoor floor, sand, and water at two depths), tiled behind the stage.
Two defects in one week were invisible against the background they were drawn on: a black silhouette on black, and a dimmed chip lost over grass.
Each swatch is the tile itself, so a ground is chosen by recognising it.

### HudLayoutEditor/sub-components/LayoutSettings.tsx

Section one: the type, and what is true of every container.
It keeps the maintainer's rule that options go by concern and nothing in a section changes when another option in the same section is clicked.
An earlier version grew a second gap field and an overlay piece when the type changed; both engines now store `gap: { x, y }`, any container has a `guide`, and the overlay draws a flex container's slots.
Type is `flex | grid`; pressing it only lights the other button, and everything else it does happens in later sections.
Gap is `↔` and `↕`, two `ValueField`s under both engines; `x` is always horizontal and `y` always vertical.
Overlay is the toggle and the guide swatch under both engines; a grid draws cell boundaries and a flex container its children's slots, in the container's own `guide.color`.
Labels sit beside each control, because the row is 26px tall and a word costs about 30px of width where a label line would cost about 14px of height three times.
The two gap cells share a host box (`.hud-layout-set__gaps`), so a formula typed in one floats over the other instead of pushing it to a new row.
It is titled `Container`, because the accordion around it is already called Layout and `LAYOUT / LAYOUT` read as a stutter.

### HudLayoutEditor/sub-components/LayoutSettings.type.ts

The section's props name no engine anywhere, so pressing Type changes only which button is lit.
A gap cell's `cap` is the glyph in front of the field, always horizontal for `↔` and vertical for `↕`; `label` is its accessible name, such as `gap x`.
The overlay's flag belongs to the editor (the view store) and its colour to the container.

### HudLayoutEditor/sub-components/LayoutSettingsPiece.tsx

A labelled piece of section one: a word, then the control, on one line.

### HudLayoutEditor/sub-components/MinMaxField.tsx

A lower and an upper limit on each axis, as two optional ranges in two rows.
It replaced separate `min` and `max` groups with four checkboxes and four sentences; a checkbox in front of a field says what the field can already say.
A limit is cleared by emptying the field, through `ValueInput`'s `onClear`.
An emptied limit deletes its key instead of zeroing it, because `min.w = 0` is a real constraint that pins a `fill` child open at nothing.
An emptied limit leaves the document identical to one that never had it; emptying both axes deletes `min` or `max` itself.
`{ w: undefined, h: 4 }` and `{ h: 4 }` are different documents on disk, since the first keeps a `w` key through JSON, so a cleared axis is deleted.
A limit may still be a formula, typed with `=`.
A limit is a size in HUD pixels, so it moves by the editor's step.

### HudLayoutEditor/sub-components/MotionTransport.tsx

Play and scrub against the real stage, so an animation can be seen without saving and watching the game.
It drives the stage's one clock, the one `HudNodeRenderer` samples every animation against, so what moves is the real HUD; a separate mini preview would be a second implementation of motion.
Play loops over one span, the longest `delay + duration` on the node, so a stagger in a repeat plays from the first instance's start to the last one's finish.
Under reduced motion it is disabled and says so, because every animation is silenced then and a dead button would look broken.
A running preview is the innermost surface, so `Escape` stops it and leaves the editor open; it registers at the `dialog` level, only while playing.
Outside the editor's provider, such as a test fixture, there is no stage, so nothing is drawn.

### HudLayoutEditor/sub-components/NumberCell.tsx

A number in a narrow cell, such as a box model edge or an extent beside its unit.
It is a `TextInput`, not a `NumberInput`, because a spinner column takes 29px, which is the whole edge cell; four spinners in a row left 3px of typing surface at the 188px rail.
The arrow keys still nudge, by the editor's step, since every number here is in HUD pixels.
It keeps a draft, because `-` and `-1` are on the way to `-12`; what parses commits and what does not waits.
Empty clears the edge, so a box that was only looked at does not grow four zeroes.
`readOnly` marks a number another section owns, with the reason in `title`; `placeholder` states what blank means, `0` for an edge and `auto` for an extent.

### HudLayoutEditor/sub-components/NodeInspector.tsx

The selected node's properties in eight collapsible sections, in order: Identity, Placement, Layout, Size & Box, Appearance, Content, Data, Motion.
Only sections that apply render: Layout only for a container, Content only for an element.
Each collapsed header carries a `● n` bound count badge, so the panel can be scanned without opening anything.
Animation and Transitions became one Motion section with three subsections; its badge adds the two old counts.
At most `MAX_OPEN` sections are open; opening another closes the oldest, which is how eight sections fit in 232px.
Selecting a different node resets to a default pair of open sections.
The screen has no parent and no size to argue about, so Placement is hidden for it and Size & Box is locked.
`otherIds` is every id except this node's, which the id field checks duplicates against.
A formula in a repeat's subtree produces `count` values; the instance scopes are computed once here and passed through `FormulaScopeContext`.
`onDrop` is the editor's one reorder door: Layout's flex strip moves a child, and only `applyDrop` may call `moveNode`, so the intent travels up.
`reflowWarnings` are the reflow warnings from `validate-motion-warnings.ts` for the whole document, filtered here to this node.

### HudLayoutEditor/sub-components/OffsetField.tsx

Where a node is and how to move it: two numbers, negatives allowed, wired to `margin.left` and `margin.top` through `behavior/offset`.
Under a flex or grid parent they displace the node from where the flow put it.
`PositionInput` is the primitive, with its shell, caps and draft rules (a half typed `-` survives, a commit never emits NaN); this adds only the meaning.
The label is "offset" with the reference frame in the hint, because "offset" alone would read as an absolute screen position.
`PositionInput` gets no `label`, so it does not draw a second caption; each axis is named by its own cap.

### HudLayoutEditor/sub-components/OutlinePanel.tsx

The document as a tree, screen root, band, container, element, with drag to reparent and reorder.
It replaced "five handles": a tree cannot be edited by dragging boxes on a stage, because what moves is a node's place among its siblings and its parent.
The drop is resolved in `behavior/drop-intent`, not here; this file only says which row the pointer is over, the one question only the DOM can answer.
The screen is always the first row, at depth 0, and the only root; it is never dragged or removed. Everything below it drags, including the former regions.
Every row with a subtree can collapse on its own, expanded by default; collapse state lives in the view store, never the document.
The row list is the scroller, so the label and hint stay put and the two 24px pan bands are sticky children of the list, drawn instead of discovered.
It is reachable without a pointer: four shortcuts on a focused row, a context menu that teaches them, and one `aria-live` region reading the ghost's words, written here and nowhere else.
The spring load is settled from `commit` through a ref, before the drop, so rows the drag opened close again except the one it landed in.
A refused drop has no row highlight; the ghost card turns and names both nodes instead.

### HudLayoutEditor/behavior/outline-rows.ts

Flattens the tree into outline rows; a collapsed row's descendants are not walked, so this is also the filter.
A row has a subtree when it is a container with children, a repeat, or a switch.
A direct child of the screen carries a badge naming its cell in the screen's grid; a child with no `place` flows automatically and has no single cell.
A repeat's child and a switch's cases are locked rows: selectable and editable, but not draggable, since they sit in no container's `children` array.

### HudLayoutEditor/behavior/row-under.ts

The row under the pointer, looked up, not received: pointer capture makes every move report on the source row, which is also what lets the drag survive leaving the rail.
A locked row is not a target.

### HudLayoutEditor/sub-components/OutlineRow.tsx

One line of the outline: what the node is, and every handle the gesture needs.
The whole row is both the drag source and the drop target, so the tree is edited with one gesture.
The drop it promises is a class on the row, not a separate indicator, so the line the pointer shows is where the drop lands.
It binds one pointer handler: it arms the drag and names its id in `data-outline-row`, which the panel hit tests once capture is taken.
A slot number past the previewed scheme is a note, never an error; the node still draws, just empty.
A row with a subtree gets its own disclosure triangle outside the name button, since a button cannot nest a button; the parent owns collapse state.
The triangle is an SVG path, because `▸` and `▾` font glyphs read as dots at this row height; one shape rotates when open.
The two inside halves reuse the before and after edge lines instead of a third mark.
The context menu opens from right click and from the platform's keyboard gestures, the `ContextMenu` key and Shift+F10.
`cell` is a badge naming the root grid cell; the cell is edited in Placement.
A locked row (a repeat's child or a switch case) neither drags nor takes a drop; removing it removes its whole case.
The screen is never a drag source but stays a valid drop target.
`springing` turns the caret over the spring load wait; `shaking` marks a keyboard move with nowhere to go.

### HudLayoutEditor/sub-components/OutlineRowMenu.tsx

The row's context menu is the only place the four move operations are spelled in words, so it is where the shortcuts are learned.
Each item prints its key with `primaryModifierLabel`, so the label always matches the key that works on this platform.
A dimmed item that names its precondition teaches the rule, such as `Move into hearts` going grey or becoming `Move into...`.
It needs no key handling: `DropdownMenu` registers at the `menu` dismiss level, below a popover opened from it and a live drag, above the editor layer.
`removable` matches the row's own remove button: a repeat's child and the screen cannot be removed.

### HudLayoutEditor/sub-components/PaintField.tsx

A `Paint`: a flat colour, a gradient, or a tiled or stretched image.
The old row spent 75% of its width on a kind `Select` and left the hex field 13.9px, so colours clipped to `#f(`; the colour half is now `ColorField` and only the kind switch remains, as three icons.
The kind switch is opt in: borders, outlines, tints and shadows are flat colours in every shipped document, so only the background passes `kinds`.
A document that already holds a gradient where a colour is usual gets the switch back automatically, so its value is never silently flattened.
So every flat colour in Appearance is one `ColorField`: background, border, outline, tint, every shadow, and every gradient stop through `GradientRamp`.

### HudLayoutEditor/sub-components/PresetBar.tsx

Where a layout comes from, and where it goes.
"Start from" restyles the draft and keeps its identity, so browsing cannot lose a named, saved layout; nothing writes until Save.
A shipped preset is code, not data, so Save on one forks it, and the button says so.
An invalid expression anywhere blocks Save: the caller runs `validateLayout` on the whole document, both Save buttons disable, and the first problem is named.

### HudLayoutEditor/sub-components/RatioPicker.tsx

Which display the layout is judged on.
The stage re-runs the same layout pass at the chosen aspect, with no scaling or letterboxing, so a group that only fits at 21:9 or a wallet that falls off at 4:3 shows while authoring.
It is a row of chips, because the point is to flick between them and watch what moves.

### HudLayoutEditor/sub-components/ReferenceField.tsx

One shape for every reference to something else: the thing itself, its human name, and a caret; the whole row is the trigger.
It generalises what the sprite field already did; four other places printed identifiers such as `DPAD` or `generic · A` although the editor owns the picture.
A picture referent draws through `src`, falling back per image; a typeface has no picture, so `specimen` renders sample text in that face.
There are two actions: `pick` opens a picker for a sprite, glyph or button face; `go` selects a subtree (a switch case or a repeat's child), which is edited in place.
It owns no picker: the caller mounts it as `children`, anchored to the ref, so this file knows nothing about manifests, packs or schemes.
`kind` is the dim half of the label, the kind or id.
`compact` fits the reference on one line inside a card.

### HudLayoutEditor/sub-components/SectionAccordion.tsx

One collapsible section of the inspector; these keep a panel of about thirty properties scannable at 232px.
The header carries a `● n` bound count badge, so an active section shows without opening; it is never shown as `● 0`.
Open state belongs to the parent, `NodeInspector`, which closes the oldest section when too many open.

### HudLayoutEditor/sub-components/ShadowListEditor.tsx

`HudBoxStyle.shadow` is a list, because a box may stack several, such as a sheen and a drop.
`+ add shadow` once sat under `radius` and read as part of it, and each shadow was five bare rows; each shadow is now a collapsed `SubsectionGroup` showing its values and a colour chip.
The open group belongs to the section: `AppearanceSection` holds one `openKey` across Background, Border, Outline, Tint and every shadow, so only one is open at a time.
`shadow-<i>` is this list's key namespace.

### HudLayoutEditor/sub-components/SidesField.tsx

Which sides a border draws on, drawn as the box it is about.
It replaced four checkboxes that ran together as one string; the value is a position, and a position is drawn, as in the box model.
Each edge is a real button with `aria-pressed`, so each bar is its own control; the bars are 7px thick because 3px is not a hit target.
Absent means every side (`hud-style.ts`), so the first uncheck seeds the other three as on, the rule shared with `EdgesField`, whose side list it reuses.

### HudLayoutEditor/sub-components/SlotChips.tsx

`dimWhenEmpty` is a list of slot numbers, edited as a list.
It replaced a text box of comma separated numbers that re-parsed on every keystroke and dropped fragments; the value is `number[]` in `hud-node.ts`.
It is not `TagInput`, which is a string vocabulary with suggestions and validation; only the shape of removable chips with an entry is borrowed.
The entry is always visible, because the number field is the add button.
Duplicates and zero are refused and the list is sorted, because it is a set.
`readOnly` shows chips derived elsewhere that nothing edits.

### HudLayoutEditor/sub-components/SlotPickerPanel.tsx

The Slot insert, never a fixed range: slot numbers are not validated against a device, a keyboard alone reaches 107 glyphs, and slot 40 can be placed with nothing plugged in.
It offers the previewed scheme's numbers as a shortcut, plus a numeric field with no maximum.
The toolbar asks which kind of object to make for a number, so each row has two actions; `SlotRefField` asks only for a number, so `onPickNumber` collapses each row to one click.

### HudLayoutEditor/sub-components/SlotRefField.tsx

A slot number, showing what that number currently draws.
Three fields (the `slot` element, a glyph by slot, a button's slot bind) once repeated the same "any number" paragraph; that is a policy, not a hint, and it is gone.
The policy is unchanged: uncapped, 1 based, never checked against a device.
Only a consequence is shown: a number past the previewed scheme says in one line that it draws nothing here and is still legal.
With no scheme previewed there is no claim to make, so no note is drawn.
It previews the glyph, never the item, even for the `slot` element: the glyph is stable for the scheme, while the preview deals random items on purpose.
It is built on `SlotPickerPanel` and takes props with no store, so other slot fields can reuse it.

### HudLayoutEditor/sub-components/SpriteExtractionNotice.tsx

The one place every sprite picker says sprites are not fully extracted for this ROM, with a one click fix, instead of blank tiles.
`SpritePicker` is a design system composite with no store, so this View tier component reads `sprite-availability-store` and runs extraction.
Callers pass it as the picker's `notice`; it renders nothing once sprites exist.
It is the popover sized version of `HudStyleControl`'s notice and extract pattern.

### HudLayoutEditor/sub-components/StageSelection.tsx

The picking layer over the stage: one hit box per placed node, an outline round the selected one, and a measured `W×H` badge.
It sits over the art and every rectangle comes from the engine, so what is clickable is exactly what was drawn.
The stage only selects; the maintainer asked to select on the stage but not drag, so the margin nudge and the scale handle are gone.
Position is edited in Placement's `OffsetField` and scale in Size & Box, both by keyboard, so nothing is written by accident while picking.
A press selects on the way down, with no slop threshold.
The screen root is an ordinary pick, since selecting writes nothing; it is how the screen's Layout section is reached.
A press that finds a box stops propagation, because the stage's own press clears the selection.
`data-node-id` names each placed rectangle, so `hud-layout-options.keep.spec.ts` can read real positions after a gap or reorder change.

### HudLayoutEditor/sub-components/SubSection.tsx

A section is a title, a gold underline, and the content under it, as the maintainer asked.
There is no box: no border, no sunken well, no radius; the content sits on the panel's own background.
An earlier version nested three framed surfaces around one list of fields.
It is the accordion's idiom one step quieter: `--c-gold` instead of `--c-gold-bright`, over a 1px rule, so it belongs to its section.
The title is printed uppercase by the sheet, so pass it in sentence case.

### HudLayoutEditor/sub-components/SubsectionGroup.tsx

One level down from `SectionAccordion`, applied inside Appearance, the longest section.
Border, Outline, Tint and each Shadow were sub editors behind a plain `Toggle` that looked just like a boolean.
The header states the value, such as `2px solid` beside a colour swatch, so the active group shows without opening; `behavior/appearance-summary` owns the wording.
The enable checkbox is a sibling of the trigger, because a checkbox in a button is invalid and unreachable by keyboard.
Turning a group on opens it in the same gesture; the caller does this, since it enforces one open at a time.
A group that is off cannot be opened, because there is no value behind it; the trigger is disabled and the summary says `off`.
Without an enable box a group is always on, such as a shadow card that exists because it was added.
`action` is the control at the far right, such as removing a shadow, never the expand gesture.

### HudLayoutEditor/sub-components/ToolbarMenu.tsx

One small icon toolbar button and what it drops: a plain `DropdownMenu` list or a custom panel such as a picker grid.
It is icon only with the label in `title`, so a dozen fit in one row.
Only one menu is open at a time, so open state belongs to the parent.
A custom panel owns its own dismissal. Icons are Lucide through `@iconify/react`.

### HudLayoutEditor/sub-components/ValueField.tsx

One control wherever a number is accepted, now a thin wrapper over `ValueInput`.
The old `123 | ƒx` switch is gone; a leading `=` means formula and the field is always typed.
The prop shape is kept, so about 25 call sites did not change.
Typing `=` before `24` seeds the formula with the digits, and deleting `=` leaves them to read as a number.
A number with no `step` moves by the editor's step from `editor-step`, so gaps, margins, offsets and sizes nudge alike; a field passing its own `step` keeps it, such as `opacity` at 0.05.
Pass a `step` only for numbers that are not pixels: fractions, counts, milliseconds.
`aria-label` names the field when its visible label is a glyph in the caller's row.

### HudLayoutEditor/sub-components/HudLayoutEditor.appearance.css

Styles for Appearance's own controls: the collapsible sub group, the border's box diagram, the gradient ramp and the slot chips.
It is imported by those components, not by the view, so rules arrive with the components that need them.
A sub group's header is the whole design: a checkbox, a name, a swatch, the value in words and a caret.
An open group reads as raised, not as a second border, so a stack of closed groups and one open one scans as one list.
The trigger fills the row, so the whole line is the hit target.
An off group's name goes quiet so it does not compete with the groups that paint something.
The swatch's `background` is set inline because it is the value.
The summary is the only thing allowed to run out of space; it ellipses instead of wrapping, so the header stays one line.
The border sides box uses 7px bars because a 3px target cannot be hit; its dotted centre is the node's ink and not a control.
The ramp's inline background is the gradient being edited.
A stop is taller than the track and centred on its position, so a stop at 0 or 1 can be grabbed at the edge.
The slot chip entry is narrow: three digits cover every slot in the game.

### HudLayoutEditor/sub-components/HudLayoutEditor.content.css

Styles for the Content section's controls, imported by `ReferenceField`, `SlotRefField`, `BoundedValueField` and `TextValueField`.
`.hud-ref-field` replaced the sprite only `.hud-sprite-field`, so the row shape lives in one rule.
A compact reference inside a card uses a one line tall picture.
`min-width: 0` on the name matters: a flex item does not shrink below its content, so a long label would push the caret past the rail.
The kind, or a subtree's id, is demoted but kept, so two sprite children stay distinguishable.
A specimen stands in for type, such as `07` drawn in the face being chosen.
The bounded field tightens the design system `Slider`, whose 16px gap and base size label suit a settings row, not a 188px rail.

### HudLayoutEditor/sub-components/HudLayoutEditor.fields.css

Fixes for flex rows whose fields collapsed to nothing.
`.text-input` and `.select-trigger` are `width: 100%`, and on a flex item a percentage width is the flex basis, so each claimed the whole row while a `flex: 1` sibling got nothing.
The colour row, the most rendered row in Appearance, had 13.9px of typing area for a `#rrggbb` value before this.
The `Select` beside a numeric field stops claiming the whole row.

### HudLayoutEditor/sub-components/HudLayoutEditor.drag.css

The outline's drag only: the ghost, the pan band, the spring load caret and the keyboard path's two signals.
The stage's drop surface rules were removed when the maintainer dropped that mechanic; there is no `.hud-drop` and no `nudge` tone.
The outline's scroll rules live here beside the pan band they exist for.
It is imported by `DragGhost` and `OutlinePanel`, not by the view.
Almost nothing animates: an eased ghost reads as latency and a fading indicator is wrong for 120ms.
The spring load caret is the one exception, because turning over the 500ms dwell is the only way to show waiting.
The ghost has `pointer-events: none` because a card under the cursor would take the drop.
The repeat warning line says the drop lands in a template that draws N times.
A refused drop turns the whole card, readable in peripheral vision.
The row list scrolls inside its panel, so the label and hint stay and the band has an edge to stick to.
The pan bands are zero height sticky children of the scroller, drawn only during a drag.
The spring duration here and `SPRING_MS` in `useSpringLoad` are the same number.
Nowhere to go shakes the row instead of announcing anything.
Both animations stop under reduced motion.
The `aria-live` text is clipped, not hidden, so it stays in the accessibility tree and takes no space.

### HudLayoutEditor/sub-components/HudLayoutEditor.geometry.css

The geometry half of the inspector: Position and placement, and Size and box.
Every rule is one the primitives cannot express, since a nested box model is a drawing.
The offset row only sets row participation; `PositionInput`'s shell lives in the design system.
`DisabledReason` tightens the composite's scrim, because a 232px rail cannot spend 16px of padding and a semibold line on a lock.
The extent field's unit suffix is a button and must not shrink; the number takes what is left.
Box model edge columns are elastic with a floor: fixed columns would waste the 289px rail and fold at 188.
The offset owned margin edges are dimmed and inert, not hidden, so the ring still shows what a margin is.
The link chain is padding's alone, because two margin edges belong to another section.

### HudLayoutEditor/sub-components/HudLayoutEditor.inspector.css

The accordion panel and the controls it is built from.
A section header's gold rule shows only when open, separating title from body.
A value field is a flex child of `.hud-inspect__row` and must be able to shrink; `.hud-value-field--wide` in `ValueInput.css` overrides the basis while a formula is edited.
`.hud-expr__live` serves `DataSection`, the one place in the panel that is a report, not a field.
Most `PaintField` layout moved to `Field size="sm"` and `Flex gap="2xs"`; what remains is a padded card, a border and an anchor's `position`.
A flex child's overlay slot is dashed and inset by a pixel, so it is never mistaken for, or drawn under, the solid gold selection outline.
`hud-inspector-property-rows.keep.test.ts` counts the `--space-2xs` uses in this sheet, and `hud-layout-section-controls.keep.test.ts` checks the slot is dashed.
The button state face rule went when faces became `ReferenceField`s.
The stage's measured badge remains; the snap guide went with the drag.
A repeat or switch embedded outline row is muted, since it cannot be dragged.

### HudLayoutEditor/sub-components/HudLayoutEditor.layout.css

The Layout section's own controls: alignment tiles, the direction choice, the colour row and sub-sections.
It is imported by its components, not the view, so a control can move sections without anyone moving an import.
One row of tiles per axis; the 3x3 pad could not express a distribution and its nine 18px previews were unreadable.
The axis cap has a fixed width so both rows start at the same x, and is as narrow as `cross` allows; it is one tile tall so it centres on the first line of a folded row.
One track count for the whole component, `--hud-align-cols`, from the widest row.
Sizing rows separately drew the same control at two sizes, and wrapping with `auto-fill` let six tiles take three lines and grew the section from 150px to 420.
So tiles shrink, capped by `minmax(0, 72px)`, and `justify-content: start` leaves leftover space at the end of a short row.
The tile size rule is two classes deep so it beats `.icon-btn--sm`'s 26px square whatever order sheets load in.
Every tile has an outline, because unframed tiles read as one continuous wall of bars; the selected tile keeps its gold.
A diagram's `display`, `justify-*` and `align-*` are set inline, because they are the value.
Bars use `currentcolor`, so the selected tile's bars turn gold with its outline.
A flex tile's three bars are thinner than a grid's two.
A grid tile draws its cell divider, because `justifyItems` positions a child inside its own cell, the same dashed cell idiom as the lattice.
The colour row's `position: relative` anchors the popover, and a zero basis on the hex stops the swatch and field fighting over the row.
Sections are `sm` apart and items inside one `2xs`, so the air between sections is larger than within one.
A sub-section has no box, only a title over a 1px `--c-gold` rule, one step quieter than the accordion header's 2px rule.

### HudLayoutEditor/sub-components/HudLayoutEditor.layout-set.css

Section one's packing and the flow row, split from `layout.css`.
Every piece is one row, so pieces wrap into as few lines as their widths allow and the gap piece takes the rest.
Each label sits beside its control, because the row is 26px tall: a word costs about 30px of width, a label line about 14px of height per piece.
The gap piece grows so the section is flush at both ends at the 320px rail.
`.hud-layout-set__overlay`'s `position: relative` anchors the colour popover.
The two gap cells share a box that a formula being typed floats over; `usePromoteOverlay` measures it, so the overlay never covers the `GAP` label, and both cells wrap together.
The flex flow row is icon buttons on the panel background with no border, wrapping at narrow rails, using the same `2xs` and `sm` gaps as section one.
`.hud-extent--bare` is the grid toolbar's bare extent wrapper.

### HudLayoutEditor/sub-components/HudLayoutEditor.motion.css

Styles for Motion: the keyframe track, the easing tiles, the transport and a transition row.
The rail is inset by a margin, not padding: a child with `position: absolute` resolves `left: 0%` and `100%` against the padding box, so padding would not keep a diamond inside.
With a margin, the space the pointer is measured in and the surface the author sees are the same rectangle, and the 11px diamond at `at: 1` hangs into the margin.
Each key's `left` is set inline, the one computed value here.
The transport only stops the play button from stretching; the slider fills the rest.
An `input[type=range]` has an intrinsic width of about 129px, its automatic minimum on a flex item, and `Slider`'s gap adds 16px.
Before the slider rules here it overflowed the rail by 14px at 232 and 36px at 188; `Slider` itself is left alone because settings screens have the width it assumes.

### HudLayoutEditor/sub-components/HudLayoutEditor.panels.css

The insert bar, the inspector's rows and the stage's pick boxes.
A formula being edited in a half width pair sets `flex-basis: 100%` on itself, and `flex-wrap` on `.hud-inspect__row` lets its sibling drop to the next line.
The extent and edge rules set only flex behaviour; the column and its label gap come from `Field`.

### HudLayoutEditor/sub-components/HudLayoutEditor.outline.css

The outline and inspector panel shells and the outline rows, split from `panels.css`.
Both rails are bordered, rounded and shadowed so they read as panels floating over the stage.
`--shadow-lg` is the design system's weight for a persistent panel, as in `DialogShell` and `Drawer`; popovers use `--shadow-dropdown`.
`--radius-md` matches `DropdownMenu`'s floating surfaces, one step above the stage's `--radius-sm`.
The row list scrolls inside the panel; the scrolling rules live in `drag.css` beside the pan band.
Rows set `user-select: none`, because the pointer based drag no longer gets that from `draggable`.
A row with no subtree gets a blank the width of the disclosure triangle, so names line up.
The triangle rotates a quarter turn when open, so the silhouette stays the same and only the state changes.

### HudLayoutEditor/sub-components/HudLayoutEditor.pickers.css

Icon only toolbar buttons are square, because the label lives in the tooltip.
Picker panels float over the stage's ground and live art, so they need an opaque surface (`--c-surface`, as `DropdownMenu` uses), plus a border and shadow to read as floating.
Extra right padding keeps tiles clear of the reserved scrollbar gutter.
A panel flipped above its trigger is shifted up by its own height after layout, as `Select` and `TagInput` do; see `SpritePicker.css`.
`TabBar` scrolls past its own edge, so the tab wrapper only stays out of its way.
Tile rules are two classes deep so they beat the bare `Button` rules whatever the import order.
The slot picker is a numeric entry above a list, never a fixed grid.
`.hud-sprite-field` was replaced by `.hud-ref-field` in `content.css`.

### HudLayoutEditor/sub-components/content/ButtonContent.tsx

`button` passes straight through to `ButtonStatesEditor`.

### HudLayoutEditor/sub-components/content/CountdownContent.tsx

`countdown` has one choice: which pie it draws.
`profile` follows the player's Countdown Timer setting; `pixel` and `smooth` pin this node to one pie.
Pressing a segment changes only the lit segment, because the hint below is the same sentence for all three.
`setting` is written back as an absent key, so a node that follows the profile reads the same whether it was inserted or reset.

### HudLayoutEditor/sub-components/content/GlyphContent.tsx

A `glyph` element shows a fixed position, or whatever slot N is bound to now, never both.
It is picked by sight from the toolbar's Glyph grid, never typed by an SDL name.
The resting field shows the picture through `behavior/glyph-art`, the same as the picker, instead of the SDL token.
The slot branch uses `SlotRefField`, which draws the glyph the slot is bound to instead of describing it.
The two options are single words, because longer phrases overflowed a 188px rail by 32px in the width harness.

### HudLayoutEditor/sub-components/content/RepeatContent.tsx

`repeat` edits its `count`, the `item` expression each pass gets, and its one `child`.
The child is a whole subtree, edited by selecting it in the outline, so this only jumps there through a `ReferenceField` with the `go` caret.
`count` is read in the repeat node's own ambient scope (`validate-dynamic-node.ts`: a repeat's child is inside the repeat, its count is not).
`item` is always checked as inside the repeat, since it is read per pass.

### HudLayoutEditor/sub-components/content/ShapeContent.tsx

`shape` draws the two named pictures, `heart` and `magic-bar`, that a sprite, switch or tint cannot draw.
`fill`, `armor` and `bands` are bounded scalars drawn as their range.
The ranges are the renderer's real ones: `HudHeart.constants` clamps `armor` to `HEART_TINTS.length - 1`, which is 2, and `HudShape` floors `bands` at 1 for the half magic upgrade's two bands.

### HudLayoutEditor/sub-components/content/SlotContent.tsx

A `slot` element draws the item sprite a slot holds, wherever the author places it, with any number.
`SlotRefField` shows what the number draws and speaks only when there is something to say.

### HudLayoutEditor/sub-components/content/SpriteContent.tsx

A `sprite` element's file, picked by sight and shown as its thumbnail and label, not a slug in a text box.
This row invented the `ReferenceField` shape, which now serves glyphs, button faces, switch cases and repeat children.
The sprite's natural box is not asked for: `intrinsic-size.ts` reads it from the manifest (`SPRITE_BOX_BY_FILE`), and `spec.box` still round trips for older documents.

### HudLayoutEditor/sub-components/content/SwitchContent.tsx

`switch` passes straight through to `CaseListEditor`, which owns the case list.
A case's `when` is checked under the switch node's ambient `insideRepeat` (`caseAt` in `validate-dynamic-node.ts`), because a top level switch such as the arrow preset's `silver_arrows` gate has no `index`, `count` or `item`.

### HudLayoutEditor/sub-components/content/TextContent.tsx

A `text` element is a string or a number, drawn in the game's extracted glyphs or a real font.
A counter is a text with a numeric value and zero padding, the toolbar's Counter button, not a separate kind.
The old `text | ƒx` switch destroyed values on a round trip; `TextValueField` is one field where a leading `=` means formula.
Digits and pad apply when the value resolves to a number, a bound expression or a typed numeral, so they are offered only then.
The HUD digits sheet has digits only, and the field now says so.
The content sheet is imported here, because the face specimen uses `.hud-ref-field__specimen`.
Tracking is a number input, not a slider: it is extra letter spacing in SNES pixels with no bound anywhere in the model, validator or renderer.

### HudLayoutEditor/sub-components/content/TextValueField.tsx

A `text` element's value as one field, which also removed a data loss bug.
Two stacked mode switches once wrote `''` or `{ from: 'data', expr: '0' }` over the value, destroying formulas with no warning.
It is the same input as `ValueInput` without assuming a literal is a number: a leading `=` means formula and is never stored, `==` escapes a literal `=`, and anything else is a string (`behavior/value-text`).
It is not `ValueInput` itself, because `ValueInput` speaks `Value` and this is the one property typed `Value | string`.
Both share the rule, `readExpr`'s errors, `FormulaFeedback`'s result line and `FormulaProblem`'s follow ups.
The result shows the moment the formula compiles.

### HudLayoutEditor/sub-components/sections/AnimationSection.tsx

The first block of Motion: the animations. Each is a clock the document drives for its own sake, gated by an expression.
Each animation is a `SubsectionGroup`: the property names it, a one line summary such as `300ms · loop · gated` says what it does while closed, and delete is the header's action.
The reflow warning lands on the card that animates the property named in it (`validate-motion-warnings.ts` writes the property into the string), under that card's property control.
The generic "width and height can reflow siblings" note covers an animation just switched to `width` that is not saved yet, which the document walk cannot see.
There is one transport, not one per card, because every animation samples one shared clock; that shared clock is the staggering mechanism.
`openIndex` and `onOpen` belong to `MotionSection`, so one card is open at a time.
`warnings` holds this node's reflow lines, already filtered by id.
Deleting the last animation clears the field instead of leaving `[]`. The renderer reads both the same, but only an absent key keeps the saved document clean.

### HudLayoutEditor/sub-components/sections/AppearanceSection.tsx

Opacity, visible, background, border, radius, shadow, outline, tint, clip and dim when empty: how a box is painted, never its geometry, which belongs to Size and Box.
Background, Border, Outline, Tint and each Shadow are `SubsectionGroup`s: one header row with the enable box, a swatch and the value in words, closed by default.
Visible, opacity, radius, clip and dim when empty stay as plain rows, since they are not sub editors.
One group is open at a time, and this file owns that set. `openKey` spans the shadow cards too, which is why `ShadowListEditor` takes it.
So the section's height with everything on is one screen plus the single open group.
Enabling a group opens it.
`MAX_OUTLINE_PX` is 2 because an outline is drawn as stacked filters, cheap at one or two pixels and expensive past that (see `hud-style.ts`).
`CORNERS` follows the CSS `border-radius` order as initials: at the 188px rail each label gets about 88px, and `BOTTOM RIGHT` does not fit on one line once `Field` uppercases it.

### HudLayoutEditor/sub-components/sections/ContentSection.tsx

Dispatches to the one editor that knows this element's shape.
A container has no Content section: `NodeInspector` renders it only for an `element`. A `spacer` needs nothing beyond its box.

### HudLayoutEditor/sub-components/sections/DataSection.tsx

Every bound property on this node in one place, with its expression and live value. It answers what makes this move.
It is read only. Each expression is edited in the section that owns its field, such as Size and Box for `scale` or Appearance for `style.tint.amount`.
The empty state is the one place the binding feature is announced. `ValueInput` has no resting chip or switch, so this section tells the author once that typing `=` drives a number.

### HudLayoutEditor/sub-components/sections/IdentitySection.tsx

The node's id and nothing else. Kind, path and a standing uniqueness note were removed, since the header already names the kind.
The id rule is shown where it is broken: the field keeps a draft, checks it on every keystroke and names the problem under itself.
It commits only a valid id, on blur or Enter, so a rename never passes through a duplicate on the way to a fine name.
The two rules are the validator's own: `validate-box.ts` needs a non empty id and `validate-node.ts` refuses one used twice.
`otherIds` holds every other node's id, the set a duplicate is measured against.
Selecting another node resets the draft, so the field never shows the previous node's id.
Escape calls `preventDefault`, which tells the dismiss stack the key was used here, so an abandoned rename does not also close the editor.
The breadcrumb shows only for a node deep inside a switch or repeat.

### HudLayoutEditor/sub-components/sections/LayoutSection.tsx

Four sections, each one concern, so nothing in a section changes when another option in that same section is pressed.
Layout holds type, gap on both axes and the overlay, the same for every container, since both engines store `gap: { x, y }` and any container has a `guide`.
Flow is direction and wrap, flex only. It is its own section because direction turns the alignment diagrams, so the tiles are a later section reacting to an earlier one.
Alignment is the tiles: pressing one writes one key and lights one tile.
Grid manipulation or Flex manipulation is the container's structure: a grid's tracks, or a flex container's child order.
This file translates the two engines into one shape: the alignment rows and which manipulation component to mount (`behavior/layout-sides.ts`).
It reads the view store for the overlay flag, which is editor state, not document state.
Switching engine is a conversion through `engineSwitchPatch`; a fresh container through a merging patch left the other engine's keys behind and crashed the layout pass.
A gap cell writes one axis and leaves the other alone, the same rule a tile follows.
`onPatch` writes this container only. A child's cell belongs to that child's Placement section.
`onDrop` is the one route a reorder takes, since moving a node is `applyDrop`'s job, and a grep test enforces it. A harness without the view leaves it out and the strip is read only.

### HudLayoutEditor/sub-components/sections/MotionSection.tsx

One section for animations, transitions and enter and exit, three shapes of how a node moves that were hard to find apart.
An animation runs on its own clock, a transition fires when a bound value changes, and enter and exit cover a repeat gaining or losing a child.
Three subsections, one open at a time, each header stating its own count.
The open animation card lives here, so switching subsections keeps the card selection.
`warnings` holds `validate-motion-warnings.ts`'s lines for this node, already filtered.

### HudLayoutEditor/sub-components/sections/PlacementSection.tsx

Answers where this node is and how to move it.
Offset comes first, as in other inspectors. It writes `margin.left` and `margin.top` (`behavior/offset.ts`).
There is no `order` field: the outline's drag reorders siblings.
There is no nine anchor dropdown; a former region is a child of the screen's grid, so moving it is picking a cell.
`CellPicker` shows the parent's grid and writes only this child's `place`. It cannot edit a track, and the grid editor cannot edit a child.
The self alignment pair lives here because where inside the cell is the child's own property.
Under a grid parent both axes apply; under flex there is one cross axis and `justifySelf` is ignored.
`parent` is the real container after any repeat or switch ancestor expands, `null` only for the screen.
`onSelectNode` selects the parent, which is how its Layout is opened.
A flex parent has no lattice, so `FLEX_STANDIN` is drawn behind the scrim to show what the control would be.
`engineOf` names the cause shown on the scrim. A grid parent never reaches it.

### HudLayoutEditor/sub-components/sections/SizeBoxSection.tsx

Size, then limits, then the box, then the transform: `ExtentField` twice on one row, one `MinMaxField`, one `BoxModelField` and `scale`.
Margin left and top are the node's offset and Placement owns them, so they show dimmed in the ring with the reason.
The screen's lock is one `DisabledReason` scrim over size and limits, with the margin ring locked and `scale` read only.
The screen's padding, the one thing it authors, stays live outside the scrim. `inert` on the covered subtree takes it out of the tab order.
`isScreen` marks the whole screen root.

### HudLayoutEditor/behavior/extent-text.ts

What the middle of the box model reads: the authored size, not the resolved rectangle.
The panel does not have the placed rectangle, the stage does, and a number labelled resolved that was not would be worse than none.

### HudLayoutEditor/sub-components/sections/TransitionsSection.tsx

The second Motion block: value transitions, which ease instead of snapping when a bound value on this node changes.
All six properties are offered; the ones nothing drives are annotated on their row instead of being left out.
The empty state covers this list only, and `EnterExitEditor` is a sibling block that always renders.
`HudTransition` carries one duration and one easing for the whole list, so they are one pair beneath the rows, labelled as shared.
Per property timing would change the type, the validator, `bake-motion.ts`, `resolve-node-transition.ts` and every saved document.

### HudLayoutEditor/sub-components/CellPicker/CellPicker.tsx

The child's own cell picker: the same lattice as `GridEditor`, with the opposite meaning.
The grid editor no longer touches children, so a grid child gets its placement control here.
It shows the parent's grid with its tracks, proportions and every other occupant, and writes only this child's `place`.
Click a cell to set it; Shift click or drag a rectangle to set the span.
There is no track editing here: no header selects, no insert, no remove, no toolbar. The parent's template belongs to the parent's Layout section.
Each of the two look alike controls states in its own heading what it writes, which guards against confusing them.
`container` is the parent, shown whole and never changed.
Selected means this child stands on the cell, so the selection and the child's footprint are the same rectangle.

### HudLayoutEditor/sub-components/CellPicker/CellPicker.css

The picker shares the lattice sheet and its drawing, and owns only its frame and its legend.
A second copy of the lattice rules would let the two controls drift into looking like different grids.

### HudLayoutEditor/sub-components/CellPicker/behavior/useCellPick.ts

The child's own gesture, and the only place in the panel where clicking a cell writes anything.
A plain press sets `place`; Shift press or a drag sets the span.
A press can write here, unlike in the grid editor, because this control's whole subject is one child under that child's Placement heading.
A plain placement clears the spans, since moving is moving. The drag rectangle is how to move and resize at once.
A drag commits once, on release. Travel only moves the cursor, the same discipline as `useDragGesture`.
`place` is the child's own `place` as the document has it.

### HudLayoutEditor/sub-components/CellPicker/behavior/span-place.ts

The `place` covering two corner cells, with `colSpan` and `rowSpan` written only when larger than 1.

### HudLayoutEditor/sub-components/KeyframeTrack/KeyframeTrack.tsx

One animation's keyframes, as a track with a selected key.
The old row put `at`, the value, an easing `Select` and a delete button on one flex line per key. `at` and the `Select` declare `width: 100%`, a 100% basis on a flex item, so the value had no room to grow at any rail width.
The fix is that one key is edited at a time and its three fields are three full width rows.
`at` is a `Slider`: a bounded 0 to 1 with no units, dragged more often than typed, and the same number the diamond above moves.
The label belongs to the `Field`, not the `Slider`, because `Slider` puts its label beside the track and an `input[type=range]` will not shrink below about 129px; the pair overflowed the rail by 14px at 232 and 36px at 188.
Labels above the control are also the row grammar the rest of the panel uses.
A key can be deleted from under the selection, or the animation replaced by a preset, so the index is clamped on read instead of repaired in an effect that runs a render late.
`easing` is the animation's default easing, read by a new key's sampled value and by a span that does not override it.
`endLabel` is the ruler's right end: the resolved duration or the formula. `head` is the transport's position, 0 to 1 of this animation's cycle, or `null`.

### HudLayoutEditor/sub-components/KeyframeTrack/sub-components/KeyRail.tsx

The track: a time ruler, one draggable diamond per keyframe, a playhead, and click anywhere to add.
Every diamond is a button, so the track works without a pointer: Tab moves between keys, the arrow keys nudge the focused key by `NUDGE` (0.01, Shift for `NUDGE_COARSE`, 0.1), Enter or Space selects it.
The pointer is captured on the rail, not the diamond. A capture on the 11px diamond stops once the pointer leaves it; on the rail the drag survives travel past either end, and `clampAt` keeps the result between the neighbours.
`onAdd` runs for a click on empty track and adds a key there holding the curve's own value.
`head` is `null` when the transport is idle or reduced motion has silenced it.

### HudLayoutEditor/sub-components/FlexEditor/FlexEditor.tsx

Section four under a flex container is Flex manipulation.
The grid's manipulation section edits the grid's structure, its tracks, and the children follow. A flex container's structure is the order of its children: each child is its own track along `direction`.
So this is the same control one dimension down, with the same three bands.
`SelectionToolbar` holds actions on the selection only. It is sticky, one row, with the same reserved height when nothing is picked, and it is the same component the lattice mounts.
`FlexStrip` is the drawing: one cell per child, sized by the child's real placed size (`behavior/flex-slots.ts`), drawn along the container's direction and wrapping as it wraps.
`SelectionLegend` shows what is selected and what can be pressed now, drawn with `KeyCap` and `MouseGlyph`.
A press writes nothing: click, `{mod}` click and Shift click all leave the document byte identical, and only choose what the toolbar and the stage echo read.
The one write goes through the one route. A reorder is a `moveNode`, and `behavior/drop-intent.ts` is the only module that calls one, which a grep test checks. This component hands a `DropIntent` up and never touches the tree.
`moveNode` removes and then inserts, so its index is into the list without this child, which is exactly the destination slot in both directions. An earlier `+1` for the forward case sent "move later" to the end.
The stage echoes what is picked, visually and never as an edit, keyed by the children's ids.
`onDrop` is the editor's single `applyDrop` route. A harness without the view leaves it out and the strip is a read only drawing.

### HudLayoutEditor/sub-components/FlexEditor/FlexEditor.type.ts

A flex container's structure is the order of its children, which is why this type is much smaller than the grid's.
Each child is a track laid end to end along `direction`, so the actions are those a line of tracks has: earlier, later, to the start, to the end.
There is no insert and no remove: a child is added by the toolbar and deleted from the outline. There is no property editing: a child's size, place and alignment are its own sections.
A selection is context, not an edit. Nothing in `FlexSelection` is ever written.
`FlexSelection` holds 0 based indices into `container.children`. `none` is the resting state, for which the toolbar prints its hint.
`FlexEditorEdits` has one write, `move`, because a reorder is a `moveNode` and `applyDrop` is its only caller. `refuse` says in the legend why an action was refused.

### HudLayoutEditor/sub-components/FlexEditor/behavior/flex-actions

One table, and every row is an action on the selection, the grid's rule kept. The toolbar, legend and keyboard all read these rows, so the legend never promises a shortcut the toolbar lacks.
Four buttons, always, in reading order: start, earlier, later, end. A move that cannot apply is disabled in place, never removed. When they were dropped, a second press on the same spot undid the first, because the buttons shifted.
`run` is left off a move that cannot apply, which also keeps its key from firing, since `runnerFor` answers only rows that can run.
Moves need one picked child. A multi pick still names itself in the chip and echoes on the stage, but a run has no single place to land, so it refuses in the legend with `MANY`. The selection is a run from day one, for the same reason `drop-intent.ts`'s `ids` is an array.
The arrows follow the flow: a row's earlier is the left arrow and a column's is the up arrow, from the grid's `EARLIER_ICON` and `EARLIER_KEY` pair keyed by axis (`axisOf`). The two end moves use the arrow into a wall icons so they differ from one step moves.
`GESTURES` are the three pointer gestures shown under every state. They write nothing.
`moveRun` writes the multi pick refusal once instead of four times.
`gestureActions` holds legend only rows. `clear` lives there because Escape has no button.
`chipOf` returns two or three words, uppercased by the sheet, so a screen reader hears "item 2". `null` is nothing selected, and the toolbar prints its own hint.
`statusOf` is the one line under the strip: what is picked and its name. It stays short enough for the 232px rail, since the legend truncates instead of wrapping.

### HudLayoutEditor/sub-components/FlexEditor/behavior/useFlexSelection.ts

The flex strip's selection. A press writes nothing, the lattice's rule: click, `{mod}` click and Shift click change what the toolbar offers and what the stage echoes, never the document.
The pick rule is `behavior/index-selection.ts`, the same function the grid's track headers call, so the two strips share one Shift behaviour.
Escape registers on the dismiss stack at `popover`, so it clears the selection and leaves the editor layer standing.
The selection is dropped when the child count changes, not remapped. A move keeps indices meaningful, but a child arriving or leaving through the outline would re point every index.

### HudLayoutEditor/sub-components/FlexEditor/sub-components/FlexStrip.tsx

The drawing: one cell per child, in flow order, at the proportions the engine gave them.
Each cell's `flex-grow` is its child's real placed size along the flow, the same way the lattice enters its track weights, over a minimum so a zero sized child can still be pressed.
It is drawn the way the container is drawn: `flex-direction` and `flex-wrap` follow the container's `direction` and `wrap`.
One tab stop, with the cursor as `aria-activedescendant`. A button per child would put six tab stops before the legend; the strip takes focus and the arrows move inside it, as in the lattice.
A press writes nothing: everything is `onPointerDown` into a selection hook.
A cell's `weight` is the child's placed size along the flow in game pixels, `0` for a child not on stage now, which draws at an equal share.

### HudLayoutEditor/sub-components/FlexEditor/behavior/weights-of.ts

Equal shares when nothing has a size yet, which says no proportions are known instead of guessing. The lattice makes the same fallback.

### HudLayoutEditor/sub-components/FlexEditor/sub-components/HudLayoutEditor.flex.css

The flex manipulation drawing. The toolbar and legend bands are `SelectionBands`, shared with the grid; only the drawing is here.
`flex-direction` follows the container's `direction` and `flex-wrap` its `wrap`, so a column's children stack in the panel as on the stage.
It borrows the lattice's look on purpose: dashed idle cell, gold selected fill, monospace ellipsised label.
The strip is flat like the lattice: no well, padding or border of its own.
A row draws across, one band tall; a column draws down and each cell keeps the band height.
A column's cells share the strip's width and take their weight in height.
The cell weight is the child's real placed size in `flex-grow`, over a floor big enough to press and read a few characters. Past that the strip overflows, as the lattice does.
The keyboard cursor is a rim, not a fill, so it shows inside a selection, and only while the strip has focus.
The label is its own block with the ellipsis rule, centred. As an anonymous flex item a long name clipped at both ends.

### HudLayoutEditor/sub-components/SelectionBands/selection-bands.type.ts

One action table shape for every manipulation component. The grid editor invented it and the flex editor needs the same, so it lives here instead of being copied.
The toolbar, legend and keyboard all read one table, so a legend cannot promise a shortcut no button runs.
`button` draws in the toolbar and `gesture` exists only in the legend. Both come from the same table per selection.
`EditorShortcut` is what the legend prints and the keyboard looks up: caps for the keys and an optional lit mouse. `{mod}` is replaced with `primaryModifierLabel(os)`, so a cap matches the key.
`icon` is a Lucide icon through `@iconify/react`, for `button` only.
Toolbar rows are grouped by separators; a change of `group` draws one.
`disabled` draws the action in place but inert: no `run`, no key, no legend row. A button that vanished let the next one slide under the cursor, so pressing "later" twice on the second to last child pressed "earlier" the second time.

### HudLayoutEditor/sub-components/SelectionBands/SelectionLegend/SelectionLegend.tsx

Band 3: one or two short lines under the drawing saying what is selected and what can be pressed now.
It is drawn, not spelled: keys are `KeyCap`s and the pointer is a `MouseGlyph` with the relevant part lit, so the strip is scanned, not parsed.
The modifier cap says the Mac command glyph on a Mac and `Ctrl` elsewhere, from `primaryModifierLabel(os)`, the same answer `isPrimaryModifier` gives the key handler.
Every entry is an action table row with a shortcut.
A refusal shows here, the only place in the control that says no, as `role="status"` so a screen reader hears it without the focus moving.
It is a fixed height strip: the status truncates with its full sentence on `title`, so the legend swaps its text instead of reflowing the band below.

### HudLayoutEditor/sub-components/SelectionBands/behavior/cap-label.ts

`{mod}` is the platform's own word. The command glyph reads as a cap and `Cmd` reads as text, so the Mac label is the glyph and everything else keeps the word.

### HudLayoutEditor/sub-components/SelectionBands/behavior/legend-entries.ts

Every shortcut the table declares, as data, so a test can assert the legend is a property of the table, not a second copy of its strings.

### HudLayoutEditor/sub-components/SelectionBands/SelectionToolbar/SelectionToolbar.tsx

The contextual toolbar is one row with one subject and only buttons in it: insert, move and remove, the things that act on what is picked.
Engine, guide, gap and item alignment are sections one and two; add column and add row are the lattice's trailing plus buttons.
It is one row at every rail. A track's size control now sits on its own header (`TrackHead`), since an 81px extent field here pushed five buttons onto a second line at 232px.
The leading chip names what it acts on: `COLUMN 2`, `ROW 1`, `3 CELLS` under a grid, `ITEM 2`, `3 ITEMS` under flex. With nothing selected the chip is `null` and one muted hint shows in the same reserved height, so the drawing below never moves.
The hint is the caller's words. The grid's wording told flex users to pick a column in a control with none.
It is `aria-live="polite"`, so a screen reader hears it fill in after a press elsewhere.
It reuses `.hud-toolbar`, `.hud-toolbar__button` and `.hud-toolbar__sep` from the screen toolbar, so the two stay the same kind of toolbar.
`chip` is what the actions act on. `actions` holds actions on the selection only, empty when there is none. `hint` is what to say when nothing is picked, in the mounting control's own nouns.

### HudLayoutEditor/sub-components/SelectionBands/SelectionToolbar/SelectionToolbar.constants.ts

`NO_SELECTION` is the grid's wording, kept as the default because every existing test presses it and it is what the lattice means.

### HudLayoutEditor/sub-components/SelectionBands/behavior/render-rows.tsx

The toolbar's buttons, with a separator wherever an action's `group` changes, so grouping is a property of the action table.

### HudLayoutEditor/sub-components/SelectionBands/HudLayoutEditor.bands.css

The two bands a manipulation section wears, shared by the grid and flex editors: the contextual strip above the drawing and the legend under it.
The class names keep their `hud-grid__` prefix on purpose. Several measurement tests pin these blocks by name at three rails, among them `hud-grid-strip`, `layout-bands.probe` and `hud-inspector-layout-widths`.
`.hud-toolbar.hud-grid__bar` has the same specificity as a descendant rule, so it still beats `.hud-toolbar`'s border and wash, and has no ancestor, so it works inside `.hud-flex` too.
The strip inherits `.hud-toolbar`'s flex, wrap and gap from `panels.css`.
It is sticky and so opaque: a translucent background showed the drawing sliding under its buttons.
It is flat: border, radius and wash are removed, since `.hud-toolbar` would draw one more box inside a section.
The reserved 26px height is on the chip and the hint, one of which shows in every state. A `min-height` on the strip would measure its content box and disagree with its padding.
The chip names the subject so icon buttons that appear on a press are legible.
Buttons are 26px, matching `icon-btn--sm`, which puts a cell's four inserts on one line at the 188px rail.
A move that cannot apply keeps its place and loses its ink.
The divider has no margins, since the strip's own gap already separates it.
The legend has two rows and swaps its text instead of reflowing.
The status truncates instead of wrapping; its full sentence is on `title`.
The key row wraps. When it scrolled sideways at 232px a legend ended mid word. The legend is last in the block, so a second line moves nothing.
One entry is a row so the picture and the word never wrap apart.

### HudLayoutEditor/sub-components/GridEditor/GridEditor.tsx

Section three is the grid component and nothing else.
It has no settings and no box around it: engine, guide, tracks, gap and item alignment are sections one and two, and the section's gold rule says what this is.
Three bands on one subject, the lattice: `SelectionToolbar` with actions on the selection only, `GridLattice` as the drawing and the tracks' own controls, and `SelectionLegend` with what is selected and what can be pressed.
The track controls sit on the drawing. The two plus buttons are the lattice's last header cells, beside the strip they extend.
The selected track's size is its header's label, which is the menu button, so the toolbar fits one row at the 232px rail.
A press writes nothing: clicking, `{mod}` clicking, Shift clicking and dragging across cells leave the document byte identical and only choose what the toolbar and stage echo read.
There is no child manipulation here. A child's cell is set in its own Placement section by `CellPicker`.
`onPatchContainer` is the only way out of this control, and it names the container alone.

### HudLayoutEditor/sub-components/GridEditor/GridEditor.type.ts

`GridSelection` is one selection made three ways. There is no occupant kind: the grid editor edits the grid only.
`cells` is a list, not a rectangle, because the primary modifier toggles cells in one at a time. `track` carries the axis so the toolbar knows which extent list it edits.
A selection is context, not an edit. Nothing in the union is written to the document.
The action table shape lives in `SelectionBands/selection-bands.type.ts`, shared with the flex section. `GridShortcut`, `GridActionKind` and `GridAction` stay as aliases so this folder reads in the grid's own words.
There is no `control` action kind: a field in the action strip was a property in an action row and made the strip two rows deep at 232px. Size lives on the track header.
`GridEditorEdits` has two writes, both about the grid. `patchContainer` covers tracks, gap, item alignment and the guide colour. `refuse` explains a refused action in the legend.
`occupants` is read only, drawn so a track edit's blast radius is visible.

### HudLayoutEditor/sub-components/GridEditor/behavior/grid-actions.ts

The one table: every row is an action on the selection, and the toolbar, legend and keyboard read the same rows.
There is no persistent group of grid properties in the toolbar. Properties in an action table are a category error, so they live in the Layout sections.
`contextualActions` is what can be done to the selection, `[]` when there is none, and the toolbar then prints a hint in the same reserved height.
`gestureActions` is legend only: what the pointer and the arrows do. `clear` lives there because Escape has no button.
Add column and add row are not here; they are always available and live on the lattice.
Its vocabulary is the grid only: columns and rows (insert, remove, move, size). Placing, spanning and self alignment of a child are done in that child's Placement section.
An action that cannot apply is absent for cells; a track move is disabled in place, see `grid-track-actions`.
`gridActions` is the whole table in render order, toolbar rows first, then legend rows. `grid-keys` looks a press up across all of it.
This file re-exports `contextualActions` and `gestureActions` because the HUD tests import them from this path.

### HudLayoutEditor/sub-components/GridEditor/behavior/grid-actions.constants.ts

`GESTURES` are the four pointer gestures shown under every state with a lattice. They write nothing: a click, modifier click, Shift click and drag leave the document byte identical.

### HudLayoutEditor/sub-components/GridEditor/behavior/grid-cell-state

What a cell looks like and the one rectangle the stage echoes.
Two facts, four states: is the cell in the selection, and is a child standing in it. Occupancy is drawn so a track edit's blast radius shows before the button is pressed.
`selectionBounds` is contiguous by construction for a track and the hull of the picked cells otherwise. `StageGridEcho` washes this rectangle.

### HudLayoutEditor/sub-components/GridEditor/behavior/grid-icons

The grid toolbar's icons. Unicode glyphs were drawn by whatever font the OS picked, unrelated to the icons around them; the project uses Lucide through `@iconify/react`, one stroke weight at 16px.
Add column and add row use a plain plus on the lattice, so they are not here.
The inserts are drawn here in Lucide's grammar, a track and a plus on the side the new one lands, in a 24px box with a 2px round `currentColor` stroke (`drawn`). The pinned Lucide has no `between-horizontal` family, and the arrow to line stand in collided with the flex strip's "move to the start".
`EARLIER_ICON` and `LATER_ICON` are the arrows the legend prints, since reordering is a direction.
`START_ICON` and `END_ICON` are arrows into a wall, because "move to the edge" needs a different picture from "move one along"; the flex strip once drew both as the same arrow.
`EARLIER_KEY` and `LATER_KEY` are the caps the legend prints for the same moves, one source for both bands.

### HudLayoutEditor/sub-components/GridEditor/behavior/grid-keys

The keyboard looks its action up by the cap the legend draws, through `behavior/action-keys.ts`, shared with the flex editor.
What is left here is the lattice's own cursor motion over two axes, grouped in the legend as one arrows row, which writes nothing.
The primary modifier with an arrow jumps to the edge; Shift extends a cell selection from its anchor.

### HudLayoutEditor/sub-components/GridEditor/behavior/grid-status

The one line saying what is selected, plus the words the toolbar's leading chip wears.
The chip names what the toolbar acts on: `COLUMN 2`, `ROW 1`, `3 CELLS`. It comes from the same selection as the status line, so they never disagree.
The status names what a track holds, so a person sees what the next press will move. Children follow a track edit automatically.
On a 3 by 3 grid it also names the anchor, such as bottom left, since the nine anchor dropdown was removed when the screen became a grid.
The chip is lowercase in the string and uppercased by the sheet, so a screen reader hears "column 2". `null` is nothing selected, and the toolbar prints its own hint.

### HudLayoutEditor/sub-components/GridEditor/behavior/grid-track-actions

What a selected column or row can have done to it, which is all this editor does beside the container's gap, alignment, guide colour and engine.
There is no "a child is in the way" refusal: children are kept valid automatically and `editGridTracks` moves them with the edit. The one refusal left is that `columns` may never be empty, `validate-container.ts`'s floor.
Every row is an action on the selected track, so all live in the sticky strip and none survives a clear.
Size is not a row: the selected header's label is the menu (`TrackHead`).
Every track edit goes through `packages/hud/src/layouts/grid-track-edits.ts`, which returns the container with the new track list and the children's remapped `place` together, so the panel never writes one without the other.
`applyTrackEdit` takes a container, not a selection, so callers that never see a selection can use it. `applyEdit` is the same route reached through a `GridActionContext`.
`trackExtentOf` returns the declared extent, so an implicit row's size menu opens on `auto` instead of the solved size.
`removeRun` removes the range back to front, so the indices still name the same tracks after the first goes.
A move that cannot apply is disabled in place, never absent, because a vanished button slides the next one under the cursor.

### HudLayoutEditor/sub-components/GridEditor/behavior/useGridSelection.ts

The lattice's selection and the one drag in the editor.
A click writes nothing. A plain click once committed an armed placement and moved a child; there is no commit here now.
The drag selects and never moves. The release only ends the rectangle.
Every modifier goes through `isPrimaryModifier`, never a literal `ctrlKey`, so Cmd works on a Mac and the legend matches the key.
Escape registers on the dismiss stack at `popover`, so it clears the selection and leaves the editor layer standing.
The track pick rule is shared with the flex editor's cells through `behavior/index-selection.ts`.

### HudLayoutEditor/sub-components/GridEditor/HudLayoutEditor.grid.css

What is left of the grid editor's own chrome once the bands moved to `SelectionBands`. The lattice has its own sheet beside `GridLattice`, since two controls stand on that drawing.
`.hud-grid` is a bare column of three bands on the panel background. Its card, border, radius, title and settings well were removed to avoid boxes inside boxes.
`.hud-cellpick__title` keeps its own rules, since the cell picker is the same drawing with the opposite meaning and the title tells them apart.
`.hud-grid-echo` is visual only and takes no pointer, on purpose; its colour comes inline from the container's `guide.color` so the echo and guide lines read as one.

### HudLayoutEditor/sub-components/GridLattice/GridLattice.tsx

The drawing, and the track controls that stand on it.
Two controls mount it with opposite meanings: `GridEditor` edits the grid, `CellPicker` edits one child's cell. Neither owns it: it takes what a cell looks like and what a press means as props, and writes nothing itself.
A mount that passes no `onAddTrack` or `onSizeTrack` gets a pure drawing, which is what `CellPicker` needs.
The plus button is the last header on both strips, so the template grows one 22px column and one 22px row for them. A plus beside the strip it extends says where the new track lands.
The cells match the real tracks: column widths and row heights are the engine's own solve, as `fr` weights over a `minmax(24px, ...)` floor, inside a body whose height is definite (`latticeHeight`) so the row weights have something to divide.
Past the point where every track clears 24px the body scrolls, with both header strips sticky as frozen panes, since the strips are what identify a cell.
Occupancy is drawn, never touched: a child's label sits over its cells with `pointer-events: none`, so a track edit's effect is visible but the child cannot be edited here.
One tab stop: the body takes focus and the cursor is `aria-activedescendant`. A button per cell would make a 6 by 4 grid 24 tab stops. The two plus buttons and a selected track's size button are the exception, each a thing a keyboard has no other route to.

### HudLayoutEditor/sub-components/GridLattice/GridLattice.type.ts

`LatticeCellState` is four states from two facts: is the cell selected, and is a child standing in it.
`rows` is short or absent when the grid's rows are implicit. `colSizes` and `rowSizes` are the engine's solved sizes in game pixels; empty means nothing is solved yet and every track draws at an equal share.
`occupants` are drawn faintly and read only, so a person can see what a track edit will affect.
`activeChildId` is the child the mount is about, drawn brighter than its siblings.
`label` is the spoken name for the whole lattice.
`onTrackDown` is omitted by `CellPicker`, since a child's own picker may not select a track.
`onAddTrack`, `onSizeTrack` and `extentOf` are optional together. Given, the strips grow a trailing plus and a selected header's label becomes its size menu. Omitted, the lattice is a pure drawing.
`extentOf` returns the declared extent, which the size menu opens on, not the solved one.

### HudLayoutEditor/sub-components/GridLattice/behavior/head-title.ts

An empty `auto` track is drawn at the floor, and the header title says so instead of letting 24px pass for its size.

### HudLayoutEditor/sub-components/GridLattice/behavior/lattice-geometry

The lattice's arithmetic: addresses, rectangles, occupancy and proportions.
The cells match the real tracks. Track sizes come from the engine's `solveGrid` as `fr` weights with a `minmax(24px, ...)` floor, so a track keeps its share until that would fall below the target size. The whole drawing is one `grid-template` string, which also lets it be rendered and measured in a headless browser.
An empty `auto` track solves to 0 and is drawn at the floor, marked; `emptyOn` is what the header uses to say so.
Occupancy is the engine's own answer (`assignCells`): pure, needing no `MeasureContext`, and it resolves auto flowed children, so the panel and stage agree. It is read only here.
`CellRef` is 1 based, like `place.column` and `place.row`.
`Occupant` is a child's resolved footprint from `assignCells`.
`CELL_MIN` is the WCAG 2.2 SC 2.5.8 target size on both axes, the one number a proportion never overrides.
`GUTTER` is the row header strip's width and `HEAD` the column header strip's height. The gutter is 42, not 24, because a selected row header shows its size control (`TrackHead`) and needs about 34px of mono; that removed an 81px field from the toolbar so it fits one row at 232px. The toolbar chip names the row while the swap lasts.
`ADD` is the trailing strip on each axis where the plus button lives.
`occupantsOf` skips a countdown, a floating overlay that spans the whole grid only so it sizes no track and is not placed while idle; counting it would mark every cell taken. It is kept when it is the child being edited, so its own picker shows where it stands.
`originsIn` returns the occupants whose origin is inside the rectangle, which is what "this track holds" means.
`rowCountFor` is as many rows as the children reach, never fewer than declared.
`trackTemplate` writes one axis as `fr` weights with the target size floor under each. The floor takes space from the others instead of shrinking any track below 24px; when floors no longer fit, the lattice scrolls with sticky headers.
`PAD` and `GAP` are the lattice's padding and cell gap, needed because the height is computed, not left to the browser.
`ROW_IDEAL` is a comfortable band before the cap; `VIEWPORT` is the cap.
`latticeHeight` gives the body a definite height, or the row `fr`s have nothing to divide and every row collapses onto its floor. It is arithmetic instead of `aspect-ratio` from the grid's shape: the 398 by 224 screen in a 188px rail leaves 96px for three rows that need 72 of floor plus 30 of chrome, so every row would floor. Each axis keeps its own track proportions, and the height is big enough to show them and small enough to keep the legend in view. Past the cap it scrolls.

### HudLayoutEditor/sub-components/GridLattice/sub-components/AddTrackButton.tsx

The plus at the end of a header strip: just the icon, and where it sits says what it does.
It is a header cell placed in the lattice's own template one past the last track, so it moves, scrolls and sticks with the strip it extends.
It is never part of a selection. It carries no `data-on`, stops its `pointerdown` from reaching the lattice's drag, and appends through the same document rule as every track edit (`grid-track-edits.ts` remaps every child's `place`).
`at` is the 1 based grid line it sits on, one past the last track's header.

### HudLayoutEditor/sub-components/GridLattice/sub-components/TrackHead.tsx

One track's header and its size control.
The size is on the header because the header already printed `auto`, `fill` or `24px`. A second size field in the toolbar said the same fact and cost 81px, forcing two rows at 232px. Selecting the track turns its label into the button that opens the four item menu.
A row header prints its number and swaps it for its size while selected. It has 42px, and the toolbar chip names the row for as long as the swap lasts.
The menu is `DropdownMenu`: portalled, since the lattice scrolls and would clip an inline menu, and registered on the dismiss stack at `menu`, so one Escape closes only the menu.
`index` is 0 based, like the extent lists. `text` is what the header prints when not selected. `empty` means the track solved to nothing and is drawn at the 24px floor.

### HudLayoutEditor/sub-components/GridLattice/HudLayoutEditor.lattice.css

The drawing two controls stand on (`GridEditor` and `CellPicker`), so it has its own sheet.
Past the point where every track clears the 24px floor the body overflows and scrolls instead of shrinking a track, and both header strips stay put so a scrolled cell can be identified. 220px caps a ten row grid.
The lattice is flat on the panel with no sunken well; the dashed cells are the drawing.
`scrollbar-width` alone switches Chromium to the native bar and drops the app's themed scrollbar, so `scrollbar-color` keeps it the panel's own.
The grid template carries the solved sizes as `fr` weights over a 24px floor, and the inline height from `latticeHeight` gives the row weights something to divide.
`min-width` and `min-height` of `min-content` let the body grow past the rail when the floors stop fitting, so nothing is clipped and the sticky column strip spans what it labels.
A `role="row"` line is `display: contents`, giving semantics but no box, so every header, cell and occupant places itself.
The corner is the one cell whose address never changes, so it is placed in the sheet.
A header that selects nothing has a default cursor: `CellPicker` shows the parent's tracks and may not edit them.
An empty `auto` track's header is dashed, because the 24px it occupies is the minimum, not its size.
The selected track's size is its own label, in the same place and width.
The plus is dashed because it is not a track, only the place the next one appears.
Four cell states, four paints, from two facts crossed. They are asserted as four distinct computed paints in Chromium.
Selected and occupied keeps the selection fill under a hatch, so a track edit's effect stays visible while picked.
The keyboard cursor is a rim, not a fill, so it shows inside a selection, and only while the keyboard is in the grid; drawn always, it showed a selection that was not one.
The occupant label is drawn once across its span and never takes the pointer. It is a block centred by the grid, because as a flex item its text clipped at both ends instead of ending in an ellipsis.

### HudLayoutEditor/sub-components/ValueInput/ValueInput.tsx

One always typed field in place of the old number or formula mode switch. `24` stays a number; `= life_current / 8` is a formula. The leading `=` says formula and is never stored (`behavior/value-text.ts`).
No chip at rest: there is no switch, chip, border colour or hint until focus. The `=` button appears on the focused row only. A resting chip was 19% of a half width field on about thirty rows.
One `<input>`, never swapped, so focus and caret survive typing `=`. The spinner is drawn here instead of using `NumberInput`, whose `type="number"` cannot hold a formula; the spinner and arrow keys depend on the current text, not on a remembered mode.
A formula being edited in a half width field floats over its row as an overlay with its own box frozen at its resting height, so nothing beside it moves (`behavior/usePromoteOverlay.ts`). Giving the field `flex: 1 0 100%` once pushed the sibling onto a new line.
The spinner buttons are named after the field, from `aria-label` when the visible label is a glyph in the caller's row, such as the gap cells and `MinMaxField`'s limits.
The result shows the moment the formula compiles. A half typed `life_current /` does not compile, so `problem` withholds it.
`rangeNote` warns when a valid result is outside the field's own range.

### HudLayoutEditor/sub-components/ValueInput/ValueInput.type.ts

A superset of what `ValueField` and `ExpressionInput` took, so both are thin adapters and their 30 or so call sites are unchanged.
`value` `undefined` renders an empty field, for an optional property with no value; only a caller that passes `onClear` should pass it.
`onClear` makes the field optional: emptying it deletes the key instead of reverting on blur. `Value` has no `undefined`, so the absence lives in the caller's document shape.
`scope` is the sample state's data scope the result previews against. `insideRepeat` says whether `index`, `count` and `item` are names here.
`extraNames` is only for `transition.when`, for its `delta`.
`role` picks which starting points to offer: a `count` is never offered a comparison and a `when` never a fraction.
`min`, `max` and `step` bound the stepper and the out of range warning.
`placeholder` states what leaving it blank means, such as `none`, `auto` or `0`.
`readOnly` is for a value the panel derived or another section owns, and `derivedFrom` says where it comes from.

### HudLayoutEditor/sub-components/ValueInput/behavior/useValueInput.ts

The seven states of `ValueInput`, as one draft string and two booleans.
A number commits on change, so dragging the spinner tracks on the stage. A formula commits on blur or Enter, so a half typed one never reaches the document or flashes the stage to zero.
Emptying an optional field commits on change too, since an empty field is not half typed and waiting would leave the stage showing a removed limit.
With the menu open, Escape belongs to the menu on the dismiss stack at `popover`, so this handler leaves it alone. With the menu shut, the field abandons the edit and calls `preventDefault()` so the panel behind does not close too.
Arrows nudge a bare numeral and are left to the completion list in a formula.
`insert` replaces the identifier under the caret or inserts at it, never appending to the end.
`dirty` marks an edit that has not reached the document.
`onClear` is for optional properties only. Without it an empty field is a draft that never commits, with the placeholder saying so.

### HudLayoutEditor/sub-components/ValueInput/behavior/prefix-at.ts

The identifier the caret sits at the end of, which the completion filters on. It is empty after anything else, so nothing but values is offered right after a `(`.

### HudLayoutEditor/sub-components/ValueInput/behavior/usePromoteOverlay.ts

A formula being edited expands over its siblings and never pushes them.
The field's box is frozen and its control floats: the root keeps its exact height so the row does not change, and `.field__control` is lifted out of flow, spanning the row above its neighbours.
It measures on focus, not on promotion. On promotion the floating class is already on, and the field is already taller because a `=` adds a result line; measuring then reserved 7px the field never had at rest and moved the other half of the pair down.
A field that was already a formula is measured with its result line, since that is its resting look.
One measurement per edit, so the overlay does not chase the result line it grows.
`focused` says when to measure and `formula` when to float. The class and numbers stay empty until the resting geometry is read, so no frame is half promoted.

### HudLayoutEditor/sub-components/ValueInput/behavior/usePromoteOverlay.constants.ts

`HOST_SELECTOR` is the box the overlay spans: a pair's `.hud-inspect__row`, or the gap cells' `.hud-layout-set__gaps`. Anything else falls back to the field's parent, never the whole panel.

### HudLayoutEditor/sub-components/ValueInput/behavior/usePromoteOverlay.type.ts

`PromoteBox` holds custom properties for the sheet, so the rule that floats the control lives in CSS and the hook only answers where.

### HudLayoutEditor/sub-components/ValueInput/sub-components/FormulaFeedback.tsx

Everything under a formula in the order wanted: the result, the instance strip when there is one, the names it reads with their live values, and a warning when the number is legal but unintended.
The result is withheld mid edit, never guessed.
Amber is not red: a formula that parses and names only known variables can still return a number nobody meant. `ceil(life_max / 0)` folds `Infinity` to the safety ceiling in `resolve-value.ts` and returns 1,000,000.
`result` is null while the formula is mid edit or does not compile. `outOfRange` is set outside the field's accepted range.

### HudLayoutEditor/sub-components/ValueInput/sub-components/FormulaMenu.tsx

The variable menu, the autocomplete and the starting points are one list with two triggers.
It is a popover, not a docked panel: eighteen names is about 290px, taller than most sections at the rail. Typing a letter filters the same list.
It registers at `popover`, so Escape closes the menu and leaves the field and editor alone.
`&&` and `||` appear nowhere; `||` was a silent wrong number bug until `concatenate: false`.
`filter` is the identifier under the caret; empty opens the menu unfiltered.

### HudLayoutEditor/sub-components/ValueInput/sub-components/FormulaProblem.tsx

The three lines after a translated expression error: the one click replacement, the did you mean, and the column.
It is shared by `TextValueField` and `ValueInput` so both report errors the same way.
A fix is a whole replacement expression, never a patch, so it cannot half correct a formula. `onFix` applies `fix.expr` as the whole expression.
`problem` is null when the formula parses and names only known variables.

### HudLayoutEditor/sub-components/ValueInput/sub-components/InstanceStrip.tsx

A formula inside a `repeat` produces one value per instance. The strip shows one cell per instance with a reading beneath, a quick check that a slice formula is right.
It is a strip, not a table, which would not fit a 232px rail; the shape of the run is the answer.
It caps at `MAX_CELLS`, 20, and says so, since a repeat's count can resolve to hundreds.
`previewIndex` is the instance the stage previews, outlined in the strip.

### HudLayoutEditor/sub-components/ValueInput/behavior/summarise.ts

A gate reads back as 1 or 0, so "true on 3 of 20" is the summary; a measurement reads back as a spread, so its two ends are.

### HudLayoutEditor/sub-components/ValueInput/ValueInput.css

The field mirrors `.number-input`'s geometry: one bordered box with a borderless field and a flush spinner column. It cannot be a `NumberInput`, whose `<input type="number">` cannot hold a formula.
The five `--ctl-*` values are the compact tier's seam from `TextInput.css`, set here because this control is always `sm`.
A formula is a state of the field, shown by a cool border and mono text, as in After Effects, Blender and Unity.
The field selector uses two classes because the field is also a `TextInput` with `.text-input`; one class would tie on specificity and depend on bundle order.
A derived or read only field is dashed and dim but readable.
The spinner exists while the text is a bare numeral, so it comes and goes as `=` is typed and deleted.
The `=` chip is 12px on the focused row only.
Promotion: the root keeps its resting height (`--promote-height`) and the control is lifted out to span the row. Both numbers are measured before the class lands.

### HudLayoutEditor/sub-components/ValueInput/sub-components/FormulaMenu.css

The formula menu's sheet. `ValueInput.tsx` imports it, with `InstanceStrip.css`, right after `ValueInput.css`, so the cascade order is the one the single sheet had.
The variable list is a popover with a filter because eighteen names is about 290px, taller than most sections.
A name out of scope is listed and explained, never dropped, so an author who saw `index` yesterday does not think the editor is broken.

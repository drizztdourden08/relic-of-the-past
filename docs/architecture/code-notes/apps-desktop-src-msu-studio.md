<!-- @layer docs @kind doc -->
# Code notes: apps/desktop/src/msu-studio

Facts about `apps/desktop/src/msu-studio/` that the code cannot say on its own. Each heading names a file or folder by its path from the repository root.

## apps/desktop/src/msu-studio/behavior/effect-query.ts

The effects search is split into which port and what to look for. A port tag such as `sfx2` must mean the port: as plain text it matches nothing and would empty the list. The tag can sit anywhere in the query. `channel` is null when the query names no port and both ports are in play; `text` is what is left to match ids, names and triggers against. A second port named after a first is a contradiction, not a widening, so the later one wins.

## apps/desktop/src/msu-studio/behavior/get-track-number.ts

Delegates to `trackNumberOf` in shared, so the studio and the pack loader can never disagree on the slot number of a file.

## apps/desktop/src/msu-studio/behavior/layer-target/

Where a layer list lives inside a manifest. A music slot and a claimed sound hold the same layer shape in two places, so the editor gets a pair of accessors (`read`, `write`) instead of a slot number: the Strategy pattern. `previewKey` identifies the target in the live report, so a layer card's readout knows it is the one playing. `oneShot` is true on the effect channels, where a looping layer has nothing to end it and would follow the player around.

## apps/desktop/src/msu-studio/behavior/pack-manifest/

The studio works against an effective manifest: the pack's own when it has one, otherwise a synthesized single layer view of its numbered files (`effectiveManifest`). Only an explicit save writes one out.

`singleTrackManifest` is what the preview engine is handed: the one track asked for and nothing else to decode. `withTrackLayers` inserts the track when it is new. `bodyLayer` is the default layer for a slot: `single` with one file (it repeats at the file's loop point), `sequential` with several. `withTrackFiles` replaces the files of a track's first layer, which is the assign this file to this slot edit.

## apps/desktop/src/msu-studio/behavior/park-file.ts

Clearing a slot moves its file out of the numbered range (a `-unused` name) instead of deleting it, so clearing destroys nothing.

## apps/desktop/src/msu-studio/behavior/preview-key/

Keys for the live report. Slot 5 and sound 5 are different auditions, so a bare number will not do.

## apps/desktop/src/msu-studio/behavior/preview-report-store.ts

A frame rate feed of the preview's live state, kept outside React: pushing it through state would render the whole slot list sixty times a second. Readouts read it through `useSyncExternalStore`. A report's `key` says which audition it is, so a readout can tell nothing from something else; `detail` is a short live note beside the clock, such as how many effects overlap.

A frame that would draw the same as the last is not published. The signature rounds every number to the precision it is shown at, the finest thing drawn from it: the countdown, the elapsed clock and the position driving the sound bar's width are tracked to tenths (`TENTHS`), and a duration, which only changes with the file, to whole seconds (`SECONDS`). It walks every voice, since one voice moving is a visible change, and it includes the voice count, since a voice starting or ending adds or removes a row. A silent layer's row shows the last file played, so that is in the signature too.

`getSnapshot` returns the same object until the next publish, so a selector reading one layer out of it stays referentially cacheable.

## apps/desktop/src/msu-studio/behavior/save-bytes.ts

A blob download is the one save path both hosts share; there is no save file IPC channel. The desktop shell has no `will-download` handler, so Chromium shows a real save dialog. The object URL is revoked after `REVOKE_AFTER_MS`, because revoking it straight away can race the download starting.

## apps/desktop/src/msu-studio/behavior/sound-channel-kind/

The channel index and additivity come from the engine (`SOUND_CHANNELS`), so the previewer cannot number a channel differently. `channelIndexOf` is the index `onGameSound` takes: 0 ambient, 1 sfx1, 2 sfx2. The effect channels are additive: each trigger layers over whatever is still sounding.

## apps/desktop/src/msu-studio/behavior/sound-manifest/

A manifest is written whole, so every function here touches one channel and copies the rest forward. An empty channel is removed and an empty `sounds` key dropped (set to `undefined`, which serializes away), so claim then unclaim leaves the file as it was found. `withSoundLayers` carries the rest of a sound definition instead of rebuilding it. Only a claimed sound can carry a continuity group (`withSoundGroup`). `withoutSound` unclaims a sound so the sound chip plays it again. `singleSoundManifest` is what the preview engine is handed: the one sound asked for and no music, so only that decodes.

## apps/desktop/src/msu-studio/behavior/sound-subtitle.ts

The note about a sound channel, shown in the details panel while no sound is open. Effects channels say how much of the range the game raises; the ambient channel says how much is hidden. Each effects port names itself so two lists of the same ids do not read as one. `raisedCount` counts the rows the generated catalogue has a call site for; `reachableCount` (ambient only) the rows the game can reach; `hiddenCount` the rows the reachable trim holds back.

## apps/desktop/src/msu-studio/behavior/studio-frame/useStudioActions.ts

Only an export group, with no save group beside it: a pack is written on every edit, so there is nothing to save. Both exports are off while any pack action or export runs.

## apps/desktop/src/msu-studio/behavior/track-file-name/

Filename rules for numbered slots. Without a manifest the number at the end of a filename is the slot, and the prefix must match what the pack already uses: `pack-05.pcm` has prefix `pack-`, number `05` and extension `pcm` (`NUMBERED_RE`). `sanitizeFileName` makes a name the user brought in safe to join onto a pack path. `uniqueFileName` returns the name, or the first variant with a `(2)` style suffix the pack does not hold.

## apps/desktop/src/msu-studio/behavior/useAudibleIds.ts

Which ids on a channel the sound chip makes a sound for. The list shows every id, since the catalogue cannot see ids picked from a table at runtime, so each is rendered once to tell the dead tail apart. The scan is deferred a tick past mount so the tab paints first; it also warms the core load.

`audible` is null until the scan has run, so rows show no verdict instead of a wrong one. An empty result means the core could not render, which is not the same as all silent, so it is stored as null.

`span` keys the effect on the ends of the id range. The array is rebuilt every render, but its contents are a fixed range per channel, so depending on it directly would rescan continuously.

## apps/desktop/src/msu-studio/behavior/useFileAudition.ts

Holds only the name of the file playing; one at a time is enforced by the engine underneath. The playhead is not held here, because it would render the list every frame; the player reads it off the handle. Repeat points are learned by playing (`loopOf`: seconds the file repeats from, null when it declares none, undefined until it has played), since reading one costs the whole file.

Only the newest press (`latest`) may publish what is playing; the engine already silenced older nodes. Leaving the tab stops the audition, because leaving the panel means stop, not a background player.

A new `files` identity means the disk moved on. Only what is gone is forgotten: renaming one file while listening to another must not cut the listening short or drop other repeat points. Another pack is another pool entirely, even where two share a filename.

## apps/desktop/src/msu-studio/behavior/useFilePanel.ts

The files tab, wired. Metadata comes from `packFileMetadata`, which opens no file. A repeat point is not read here: it needs the bytes of the file, and a whole list would pull gigabytes through memory. `useFileAudition` learns it on play.

`saveBase` is what a rename writes into, null for a classic pack, which must stay classic. A rename keeps the extension, because it says how the audio is encoded. Storage moves the bytes only, so a pack with a manifest is re-pointed in the same step (`withFileRenamed`), or every layer built on the file would stop finding it.

`ready` stays false until the metadata has settled for the current pack, so the panel shows nothing instead of a false empty state. The previous metadata stays up during a reread. `formats` counts the files of each format, the biggest group first. `report` lets an action owned by the panel above, such as a bulk removal, land in the same status line.

## apps/desktop/src/msu-studio/behavior/useFileUsage.ts

Maps a filename to the slots and sounds that name it, in the wording the studio uses elsewhere. It is built once per manifest so rows do not each scan it.

## apps/desktop/src/msu-studio/behavior/useOptimize.ts

Get the tool, measure, show the numbers, convert. Measuring runs on its own once the tool is available, and nothing is written until the numbers are accepted. The `tool` step covers both offering the download and watching it arrive. `open` false tears the flow down, so reopening starts from the tool check again.

The pack is reread the moment a run settles (`onRunSettled`), success or failure, not when the dialog closes: the run rewrites the manifest as it goes, and an edit saved from the stale copy would write the old references back. A failed run may still have converted part of the pack, so the reread is unconditional. Only the candidates a run would touch count (`convertibleNames`); an unreadable file is not one of them. Measuring moves the step on, so the effect that starts it cannot trigger itself again.

## apps/desktop/src/msu-studio/behavior/useOriginalPreview.ts

Auditions the sound chip's own version of a sound or track. It is separate from `useSoundPreview`, which builds a whole pack session; an original is one buffer. The button is never disabled on an availability check: whether the core can render changes when the game boots, with no render here to notice, so pressing always tries and says why if it cannot.

`playing` is the id whose original is sounding, so a row can light its own button. A second press on the one sounding is a stop, the way the pack preview behaves. The button lights straight away, because the first press may wait on a core load and a control that does nothing for a second reads as broken. A failed start clears only the row that call was for, since another press may have superseded it. Switching channel or leaving the view silences it.

## apps/desktop/src/msu-studio/behavior/usePackContents.ts

The files, slots and manifest of the selected pack; `reload` rereads after every edit. Only a pack switch starts from nothing; a reload keeps the contents up, so `loaded` survives it. `loaded` is the name of the pack whose contents arrived, so a switch never shows the previous pack's files for a frame.

## apps/desktop/src/msu-studio/behavior/usePackExport.ts

Exports as `.msul` (whole) or MSU-1 (flattened, playable elsewhere). MSU-1 decodes through an `OfflineAudioContext`, because an ordinary context would hold the sound card open for the whole export. The `.msul` entries are read at export time, not from the studio's copy, so the archive is the folder as it is now.

## apps/desktop/src/msu-studio/behavior/usePackImport.ts

Reads a dropped `.msul` into a pack. The install itself lives in `packages/msu/src/msul/install-msul-pack`, shared with the file association path and the store. A pack that lists more than it holds is named at once, while the archive is to hand.

## apps/desktop/src/msu-studio/behavior/usePackList.ts

The pack list, selection and whole pack operations. Manifests are read here so rows need not ask storage. `listMsuPacks` counts only the two MSU extensions, so a layered pack full of wav or flac would report nothing; the audio listing is the one that sees every playable file.

## apps/desktop/src/msu-studio/behavior/usePreviewReport.ts

Subscribes one component to the live report, so only it redraws per frame. It checks the key because auditioning one thing while another is expanded is normal.

## apps/desktop/src/msu-studio/behavior/usePreviewSession.ts

One AudioContext, one engine, one polling loop. The preview owns its own context, because the editor works with no game running and a shared context could outlive the panel. A second audition or leaving the panel tears the pair down. The engine is polled once per animation frame into the preview report store, and the loop ends itself when there is nothing to poll. The caller supplies the manifest (only what this audition needs, so nothing else in the pack is decoded), the start call and the reader, so slots and sounds share this. One store lives for the whole life of the hook, so a subscriber never has to resubscribe.

The engine plays the literal slot (`isDeluxe: false`), never the extended remap: the row the user clicked is the row to hear. A suspended context would decode and schedule silently, so `start` waits for it to resume, and gives up if it was stopped or superseded meanwhile. `start` resolves true once the audio has started, false when there was nothing to play. `retrigger` fires again into the running session, since additive channels add a sound per press; it returns false with no live session.

## apps/desktop/src/msu-studio/behavior/useSoundPanel.ts

One sound channel's tab, wired. The filter and the unreachable toggle are owned by the list, so two channels shown as one list search as one. Replace only opens the editor: an empty claim would silence the chip's version, so the editor's save writes the claim. Unclaiming is a real write. `manifest` is what the rows and the editor show; `saveBase` is what a write goes into, the pack's own manifest when it has one.

One thing sounds at a time, so each start silences the other. `closeLayers` exists for a list drawing on more than one channel: opening a row there has to shut the row open on the other, or two editors sit open at once over one shared save.

## apps/desktop/src/msu-studio/behavior/useSoundPreview.ts

Auditions one claimed sound through `onGameSound`, as the game raises it. On an effects channel a repeat press fires into the running session, because rebuilding would turn overlap into a stutter. The ambient channel is stateful, so there a repeat press replaces the bed, as in the game. `playing` is the preview key of the sound the session belongs to, which a row compares against. The overlap count shows only while more than one set is sounding. Leaving the tab or switching packs silences whatever is playing.

## apps/desktop/src/msu-studio/behavior/useSoundRows.ts

One channel's catalogue crossed with what the pack authors. Replaced rows are lifted to the top with a stable sort, so the catalogue's busiest first order survives inside each group.

Effects channels list every id, not only the named ones: the catalogue reads the game's source and cannot see an id picked from a table at runtime, such as the sword beam by sword level. Such ids are still named (`soundName`), because a documented name is the only description there is. Id 0 means nothing to play, so the range starts at `FIRST_PLAYABLE_ID`. Only the ambient channel has a reachable set (`packages/game-data/src/data/ambient-reach`); it defaults to the ids the game can reach, the rest stay a toggle away, and a claimed row is always listed, because hiding someone's existing work would leave them no way back to it.

`raisedCount` is said once at the top instead of on fifty rows. `unreachableCount` counts over the whole range, so the number the toggle offers does not change once it is on.

## apps/desktop/src/msu-studio/behavior/useSoundUpload.ts

Drops audio into the pack without claiming a slot: only a safe unused name is needed. It is not the track upload with a flag, because that hook's weight is the slot naming (prefix, number, extension).

## apps/desktop/src/msu-studio/behavior/useSupersededFiles.ts

Originals a converted file has taken over from: the same stem in the target format. There is no record of a past run, and none is needed. Removing them re-points the manifest first, so a reference the conversion did not move cannot leave its slot silent. `saveBase` is null for a classic pack, whose filenames are its wiring. Files are deleted one at a time: a hundred concurrent deletes buy nothing over a directory being rewritten anyway.

## apps/desktop/src/msu-studio/behavior/useTrackAssign.ts

Assign this file to slot N, as a change on disk. Classic packs have no manifest, so the filename is the assignment and the file is renamed; in a layered pack the manifest is, so files stay. Occupancy is a question about the number, not the name: `pack-5.pcm` and `pack-5.wav` would both claim slot 5, so an exact name check would leave the pack ambiguous. When both files must move it is a true swap, so neither is lost: the displaced audio takes the name the newly assigned file gave up, which keeps it visible in the pack.

## apps/desktop/src/msu-studio/behavior/useTrackPreview.ts

Auditions one music slot as the game would hear it. The session underneath owns the context, the engine and the polling. A failed start clears only the row that call was for. Leaving the panel or switching packs silences it.

## apps/desktop/src/msu-studio/behavior/useTrackRows.ts

Every vanilla slot is listed, filled or not; extended slots join only for an extended pack. A number the game never asks for is not a slot, so such files show only in the file list as unused. The vanilla range is a property of the format (`VANILLA_TRACK_COUNT`), not of the name dataset, which would otherwise turn a slot with no name into a slot that is not there. Extended slots come from the tables, so an extended pack shows every slot it could fill.

## apps/desktop/src/msu-studio/FileRow.tsx

One file in the pack: what it is, what plays it, and its name. The name is editable here because in a pack without a manifest the name is the wiring, and everywhere else it is the only handle the layer editor offers for picking a file. A rename commits when the field is left, never per keystroke: every commit copies the bytes to the new name and re-points the manifest, which is not something to do once per letter.

The card is the entry and the grid row is only its top line, so the player opens inside the file it belongs to instead of under it. Every cell sits in the column template the list declares, so a row cannot lay itself out and drift out of line with the header.

Length, rate and channels are known for MSU-1 pcm alone. That format fixes the rate and the channel count, so all three follow from the byte count; an encoded file would have to be decoded to answer, so it reads as unknown (`UNKNOWN`), not as zero. A repeat point needs the file itself, so it appears once the file has been played. `usedBy` empty means nothing plays the file. `loading` is true while its bytes are fetched and decoded, before a note sounds.

Escape has to be known to the blur that follows it in the same tick, so `cancelled` is a ref, not state. Escape is consumed (`preventDefault`), so abandoning a rename does not also close the page.

## apps/desktop/src/msu-studio/LayerEditor/behavior/layer-ops.constants.ts

The pure edits behind the layer editor, kept out of the hook so each can be read on its own.

A layer's `id` is generated once, at creation (`createLayer`), and never rewritten. The resume snapshot in a save file is keyed by it, so a regenerated id would silently drop that layer's position and restart it from the top on load. A new layer starts in the mode its channel can end in: an effect channel gets `once`, because it is fired at a moment and is over, and a loop there would still be playing long after.

The optional scheduling fields are held explicitly while editing, since a control cannot render `undefined`, and dropped again on the way out when they carry their default (`normalizeLayers`). A pack that uses neither crossfade nor wait for completion is therefore written exactly as an older studio wrote it. `DEFAULT_CROSSFADE_SECONDS` is 0: no overlap, one pass cuts straight to the next, which is what a lone looping file wants. `DEFAULT_WAIT_FOR_COMPLETION` is false: the gap is timed from the sound's start, so a long sound overlaps the next; that is the historical default.

An absent crossfade is legal and means off; a present one has to be a real duration between 0 and `MAX_CROSSFADE_SECONDS`. `normalizeLayers` also clamps a crossfade a hand edit put out of range. `validateLayers` returns the first reason the layers could not play, phrased for the error line of the editor.

## apps/desktop/src/msu-studio/LayerEditor/behavior/useFileLoopSamples.ts

The loop point each of these files declares, to show what a slot already does before anyone sets anything. Without it, the Repeat from field opened at 0 on a track that plainly repeats from 13 seconds: the manifest had no loop point, so the field showed the manifest, while the value in force was the one inside the `.pcm` header. Reading it here means the control opens on the effective value, and an author starts from what they can hear. It takes the whole set of names so the editor resolves every layer in one hook, since a component cannot call one hook per layer in a loop. Only `.pcm` costs a read; every other format answers null without being opened. The names arrive as a fresh array each render, so the effect keys on the joined names.

## apps/desktop/src/msu-studio/LayerEditor/behavior/useLayerEditor.ts

Holds the layer list being edited and writes it back to `pack.json`. The draft is seeded once, on mount. The editor is mounted with a key of pack and target, so switching slots or sounds gives a fresh draft and an edit in progress is never overwritten by a background reload of the pack. Reading and writing go through the target, so this hook is the same for a music slot and a claimed sound. `manifest` seeds the draft with the merged view, so a classic slot shows the layer it plays today; `saveBase` is what goes to disk. The layers are normalized on the way out only: the draft keeps the optional fields so the controls have a value to render, while the file gets none it does not need.

## apps/desktop/src/msu-studio/LayerEditor/LayerEditor.css

The crossfade and wait switch blocks are framed and inset from the controls above them, so neither is mistaken for another volume style slider or for body copy; both were. The number box and the state chip sit beside the crossfade slider, so the slider gets a floor wide enough to stay draggable and a ceiling that leaves room for them. The effect chain uses the same framed inset block for the same reason; each effect is one line with its place in the chain leading, so the order reads top to bottom.

## apps/desktop/src/msu-studio/LayerEditor/LayerEditor.tsx

Edits one slot's layers and writes them to the pack's manifest. Saving a pack that has no manifest yet writes one for the whole pack, not just this slot: the draft is seeded from the synthesized single layer view, so the other slots are kept exactly as they played before. That is the moment a classic pack becomes a layered one, and the subtitle says so before the user commits to it. A loop point applies to a single file layer, so only each layer's first file is consulted for its loop sample.

## apps/desktop/src/msu-studio/LayerEditor/LayerEditor.type.ts

`ConfirmRequest` asks the app's own confirm dialog a yes or no question and runs the callback on a yes. It is the signature the rest of the manager already takes, so an editor nested in it hands the request up instead of standing up a dialog of its own. `onConfirm` is used for the one edit that costs the layer something (see `useModeChange`).

`target` says which layer list is edited: a music slot, or a sound on one of the three channels. `manifest` is what the editor shows: the pack's manifest with its classic files filled in.

`saveBase` is what the editor writes into. For a pack that already has a `pack.json` it is that file as it sits on disk, so saving one slot leaves the rest of the pack out of the manifest and still playing through the classic fallback; otherwise a single edit would freeze all of the roughly 100 numbered files into authored entries. For a pack with no manifest yet it is the synthesized whole pack view, which is exactly what the first save is meant to create. A sound's layers are written into the same base for the same reason, and the write only rebuilds its own channel (see `sound-manifest`).

`isLayered` is false while the pack has no `pack.json`; the first save creates one. `reportStore` is the live feed of the preview: each card gets its own readout element, so a saved layer shows what it is doing while it is edited. `readOnly` marks an installed pack: the layers show as they are and every control that changes them is off.

## apps/desktop/src/msu-studio/LayerEditor/sub-components/CrossfadeField/CrossfadeField.tsx

The crossfade window of a looping layer: a framed block with a number box and a state label, not a bare slider, because a slider at zero draws no fill and was invisible under the Volume slider. Zero means no overlap, a distinct behaviour, so it is named instead of reading as unset. The value is rounded to hundredths: the arrows step by 0.25, and rounding 0.25 or 0.75 to a tenth moved the value just set. `layerId` keeps this control apart from any other on screen.

## apps/desktop/src/msu-studio/LayerEditor/sub-components/IntervalTimes/IntervalTimes.tsx

The offsets are seconds from the moment the slot started. They are kept sorted and free of duplicates, because two identical offsets would schedule the same sound twice.

## apps/desktop/src/msu-studio/LayerEditor/sub-components/LayerCard/behavior/useModeChange.ts

`single` holds one file, so switching into it drops the rest. The question is asked before the order changes, so a refusal leaves everything as it was, and files and mode go out as one patch, so a save or revert cannot catch the layer half changed. Only the crossing into `single` costs files; being there already, or leaving it, costs none. The confirmation names the surviving file and counts the dropped ones (`singleDiscardMessage`), because the rest are removed needs a number.

## apps/desktop/src/msu-studio/LayerEditor/sub-components/LayerCard/LayerCard.tsx

Presentational: every edit leaves as a patch, so the card never knows whether it is savable. `NO_EFFECTS` is one stable empty chain, so a layer without effects is not handed a fresh array on every render. `single` is the order where one track repeats on itself: the layer holds exactly that file, and only that order ever reaches a file's own end, so the loop point field shows only then. `live` is the readout, supplied ready made so the card stays presentational while it redraws. `fileLoopSample` is the loop point the layer's own file declares, used when the manifest sets none.

The Chance slider is rolled each time the layer starts. Some effects fire on a fixed cycle, which a real recording turns into a metronome; thinning them breaks that up.

## apps/desktop/src/msu-studio/LayerEditor/sub-components/LayerEffectsField/LayerEffectsField.tsx

A preset is a starting point, not a mode: choosing one writes its effects onto the layer. There is no custom entry; the picker derives its value by comparing the chain to each preset (`presetOf`, empty when it matches none, including an empty chain) instead of remembering the choice, so it never claims a state the numbers do not bear out. Effect rows are keyed by index on purpose: an effect has no identity beyond its place in the chain.

`DEFAULT_EFFECT` is where a newly added effect of each kind starts, audible but not drastic. `MIN_HZ` and `MAX_HZ` are the range of the ear, give or take; a cutoff outside it does nothing a listener could hear. `MAX_DB` of 12 covers every tasteful move and most of the others.

## apps/desktop/src/msu-studio/LayerEditor/sub-components/LayerEffectsField/sub-components/EffectRow.tsx

Changing the kind resets the effect to that kind's default, because a cutoff in Hz has no meaning as a band gain in dB.

## apps/desktop/src/msu-studio/LayerEditor/sub-components/LayerFileList/LayerFileList.tsx

Order matters: sequential loops play top to bottom and the resume snapshot stores an index, so reordering is an explicit move. A pool capped at one file says so in words instead of showing a greyed out picker, since the reason lives two controls further up the card. An empty single file layer still needs its one file, so the cap only closes once the layer is full.

## apps/desktop/src/msu-studio/LayerEditor/sub-components/LoopPointField/LoopPointField.tsx

The loop point of a looping layer. MSU-1 stores it in the `.pcm` header as a sample count; other formats have nowhere to put it, so it lives in the manifest and overrides what a `.pcm` declares. It is edited in seconds and stored in whole samples, the only resolution the format stores. The seconds are rounded to the millisecond for display only (a real track gave 13.181768707482993), because a loop a few samples off clicks. The manifest value wins; the file's own point is what the slot does until someone overrides it. `MAX_LOOP_SECONDS` is an hour: past that it is not an intro any more. `layerId` namespaces the input id, so several layer cards on screen do not share one.

## apps/desktop/src/msu-studio/LayerEditor/sub-components/PlayModeFields/PlayModeFields.tsx

Switching mode replaces the parameters wholesale; edits within a mode spread the current mode, so changing the order does not reset the crossfade. The crossfade and wait switch get framed blocks because both were missed among look alike controls. Repeatable controls take an id from the layer, because the switch otherwise derives its id from its label and two random layers would collide. There is nothing to cross into when one track repeats on itself, so the crossfade is not offered for the single order.

The order hints are read under the control, because the order chosen changes what the layer is. The wait for completion hint is written per state, because what matters is the audible consequence now.

## apps/desktop/src/msu-studio/msu.constants.ts

`AUDIO_ACCEPT` lists what a drop zone accepts. Nothing is transcoded on the way in; the engine decodes each of these itself. `AMBIENT_ROLE_HINTS` explain each ambient role in the row tooltip, because the labels alone are too terse. `SOUND_FILTER_HINT` and `SOUND_FILTER_PLACEHOLDER` are one spelling of the sound search, so the single channel tab and the merged one read alike; the hint sits in the channel note of the details panel, the placeholder in the toolbar's search box.

## apps/desktop/src/msu-studio/msu.type.ts

A pack carrying a `pack.json` is layered; one with only numbered audio files is classic (`PackFormat`). `MatchedTrack.layerCount` is how many layers the manifest gives the slot, 0 for a slot the manifest does not cover. `ActionResult` is the outcome of one storage action, phrased for the status line of the panel.

`MsuEffectsPanelProps.manifest` is what the rows and editors show; `saveBase` is what a save writes into. `readOnly` marks an installed pack: sounds play, nothing changes.

`TrackPreviewControls` is the music tab's preview wiring, shared by the rows and the details panel: `playing` is the slot the pack is auditioning, `playingOriginal` the slot whose sound chip version is sounding, and starting either also selects the slot, so the readout in the details panel is the one that plays. On a sound row, `label` exists only for unambiguous ids and `triggers` describes the rest; `hex` is the id as the studio shows it (`0x0C`); `sites` is how many places raise it, roughly how often it is heard; `layerCount` is 0 while the pack leaves the sound to the sound chip; `unlisted` marks an id the pack claims that the catalogue does not list; `role` is what the id does on the ambient channel, null on the effects channels, which have no roles; `unreachable` marks an id nothing in the game can raise, shown only on request.

`showChannel` tags a row with its channel wherever one list holds more than one, because the channels do not share id spaces. `additive` is set on an effects channel, where every press adds a sound, so play never becomes stop. `chipAudible` is null while the channel is still being scanned and false once known to make no sound.

`SoundPanelController` is one channel's wiring, handed around whole. A list showing two channels keeps one each and picks by row, so `SoundListItemProps.sound` is the controller for that row's channel, not for the list.

## apps/desktop/src/msu-studio/MsuEffectsPanel.tsx

Both effect channels as one list with one search box: guessing which of two lists held a sound was the problem. The channels stay separate id spaces (0x12 differs per port), carried by each row leading with its port. Each channel keeps its own controller; this panel hands them one query, picks the right one per row, and keeps them from sounding at once. A port tag in the search box means the port, not text to find, so it narrows the merged list.

The ids interleave in one list: 0x01 on both ports, then 0x02 on both. Grouping by port would put the two lists back, only without the headings that made them navigable. Each channel silences only its own audition, so the list stops the other one itself, and only one sound is open in the details panel across the whole list, or two editors would compete for one shared save. Rows are keyed by channel and id, because the ports share id numbers.

## apps/desktop/src/msu-studio/MsuFilePanel.tsx

The pack as files, not slots. The drop zone and the format conversion live here because the files are one shared pool that every slot and sound draws from. `manifest` is what the rows credit a file to: the pack's own manifest, or the classic view of its files. `saveBase` is null for a classic pack, which stays classic.

`EMPTY_PACK` blocks the conversion, since there is nothing to convert in a pack with no audio. `NO_USES` is one stable empty list, so a row with no uses is not handed a fresh array on every render. `COLUMNS` are the headings in grid order and must stay in step with the CSS template that sizes them; the last one is the row's buttons, which need the width but not a heading.

Deleting a file a slot still names leaves that slot silent, so the confirmation names the slots. Superseded originals are normally orphans; one still named by a slot is re-pointed to its converted file first. A spinner shows until the first metadata read settles, because an empty state would claim the pack has no files.

## apps/desktop/src/msu-studio/MsuPackToolbar.tsx

One name field serves both a new empty pack and an import, because two fields invite filling in the wrong one. `nameInstalled` is true when the name is a pack installed from the Hookshop, which nothing may write into.

## apps/desktop/src/msu-studio/MsuSoundPanel.tsx

One sound channel on its own tab. The filter is owned here, not in the hook, because a list built from more than one channel has to put one query across all of them. `showUnreachable` is off by default: the ids it reveals are ones nothing in the game can raise. `hasHidden` is only true where a reachable set exists to hide anything, which is the ambient channel.

## apps/desktop/src/msu-studio/MsuStudio.tsx

The detail of the pack list, built from the shared studio parts: one action row (Export) with the last outcome at its end, then the tab's own body. Each tab draws its body itself (`StudioBody`): the tabs and the tab's search on the toolbar, a dense list that takes the height, and the details panel, kept under `msu-studio.details` for every tab. The panel shows the selected slot or sound, and the pack's properties when nothing is selected. A spinner shows until the pack has loaded. An installed pack is read only in every tab: it plays and exports, and nothing that writes into it is on. `origin` is null for the player's own pack. The tab is owned by the manager, so it holds while another pack loads.

There is no save group: every edit writes to the pack as it is made. A music audition is owned above the tabs, so leaving the music tab silences it; the sound tabs stop themselves by unmounting. The files tab gets the pack's own manifest as `saveBase` (null for a classic pack), because a rename must not hand a classic pack a manifest.

## apps/desktop/src/msu-studio/MsuMusicTab.tsx

The original music of the sound chip is previewed here (`useOriginalPreview('music')`), not passed in, because it needs only the slot number. One thing sounds at a time, so each start silences the other. The tab owns the preview wiring, so the slot rows and the details panel press the same buttons and light the same state. Clicking a row opens it in the details panel and clicking it again closes it.

## apps/desktop/src/msu-studio/OptimizeDialog/OptimizeDialog.tsx

Converts and stops: originals stay on disk as the fallback, and removing them is a separate confirmed action. The run cannot be dismissed, because it writes the manifest as it goes. The pack is reread the moment a run settles (`onConverted`), not on the way out; see `useOptimize`. The candidate list can run to a hundred files, so it scrolls inside the dialog instead of pushing the actions off the bottom.

## apps/desktop/src/msu-studio/OptimizeDialog/sub-components/PreviewStep/

Only measured rows are summed (`previewTotals`): folding an unmeasured file in at its current size would present a guess as part of a measured total. Growth counts like saving, so a pack of mp3s shows the total getting bigger instead of a flattering net figure. `convertibleCount` is how many rows a run would convert; excluded rows are not counted. The net label reads as a minus sign for bytes saved and a plus sign when the pack grows.

A file that would grow reads `+` in the danger colour and stays in the run (`CandidateRow`): one format is the point, and an already compressed file pays in bytes, not quality.

## apps/desktop/src/msu-studio/OptimizeDialog/sub-components/RunStep/RunStep.tsx

Repeat points are reported first: a loop position dies with the file's container, so it is written into the manifest before any format changes, and the count makes that verifiable. `progress` is null until the first file reports in; `result` is null while the run is going.

## apps/desktop/src/msu-studio/PackSummary.tsx

The format breakdown lives here because it decides whether a pack plays everywhere: only MSU-1 pcm is native to every build. `formats` has one entry per format present, the biggest group first. `unusedCount` counts the files no slot and no sound names. `supersededCount` counts originals a same stem converted file has already taken over from; the remove button appears only once there is something to remove. `optimizeBlockedBecause` says why the conversion is not on offer, null when it is.

## apps/desktop/src/msu-studio/PreviewReadout/behavior/layer-meters.ts

One layer's live report as meter rows: one row per audible sound, oldest first, plus the wait before the next one. A sound can outlast its own gap, so folding them into one bar would hide the overlap worth watching. Rows come from the report, except that only gap modes (`GAP_MODES`: random, interval) get a next row: a loop has no next event, and a gap mode keeps its row even without a countdown, because waiting for this sound to end is a state. A countdown fills towards the next sound, with the wait it started from as denominator; a fade fills the same way; a zero length gap has no window to fill but the number still reads. With no countdown chosen yet and wait for completion on, the gap only begins once the sound ends. An MSU-1 loop point is usually not the start, so the label says where it repeats from, which keeps the position dropping back from looking broken. Gap modes carry silence in the countdown row, so only continuous modes need the silent row.

## apps/desktop/src/msu-studio/PreviewReadout/behavior/voice-captions.ts

Captions rows by file name, since which file of the pool landed is the point. Names are shortened from the middle (`shortName`), because the tail (variant number, extension) is what differs; the caption column is narrow on purpose (`MAX_CAPTION`). Two rows can name the same file (a loop crossfading against itself, a random pool drawing twice); those are marked by fade direction (`FADE_MARK`) when fading and by order otherwise. The full name is kept as the title whenever the caption is not the whole story.

## apps/desktop/src/msu-studio/PreviewReadout/PreviewReadout.css

The detail note is pushed against the clock, not centred, so the head reads title, note, clock. Sounding or not is carried by the pulse dot, so the state reads without parsing text. A layer shows a row per audible sound plus its countdown, stacked under the one head line. Each row is named after the file it plays, so stacked rows are never ambiguous. The countdown caption is a word, not a file, so it is styled as a label and never reads as one of the sounds. With no bar drawn, the wording takes the space the bar would have had, so rows stay aligned. A pass fading in takes the sounding colour; one fading out keeps the gold of something waited on, so direction reads without the words. The fade bar is short on purpose: it measures the fade, not the file, and must not rival the position bar.

## apps/desktop/src/msu-studio/PreviewReadout/PreviewReadout.tsx

Subscribes to the report store itself, so a published frame redraws this block alone. It renders nothing while the preview is still decoding or another row is the one playing. The elapsed clock is what `interval` layers are scheduled against; it is labelled because unlabelled seconds next to a position such as 0:15 / 0:50 read as the track's own time. `previewKey` is what the readout belongs to; `label` names it in the heading, such as slot 5 or Ambient 0x05.

## apps/desktop/src/msu-studio/PreviewReadout/PreviewReadout.type.ts

A meter row is one audible sound, or the wait before the next one (`LayerMeterKind`), so overlaps are visible. Row ids number voices oldest first. `caption` is the file name shortened to fit; `title` keeps the full name for hover. `fill` is 0 to 1, or null when there is no denominator, and then the label stands alone with no bar. A `FadeMeter` fill reads 1 the instant the fade completes. `introFill` marks the intro a looping file plays once, null when the whole file repeats; it is drawn behind the fill so the loop jump reads as structure, not a glitch. A silent continuous layer still gets a voice row. `showName` is set on the readout under a slot; the one inside a layer card is already named.

## apps/desktop/src/msu-studio/PreviewReadout/sub-components/

`LayerLive` subscribes on its own behalf, so the layer card stays presentational and a frame redraws this line, not the card's inputs. An unsaved layer is not playing yet, which renders nothing, not an error. `LayerMeter` is presentational and has no overlapping marker; two rows are the overlap. `MeterRow` draws the bar only when the row has a denominator, because a bar at zero reads as stuck, not as no measurement; green marks something sounding, gold the thing being waited for. `FadeChip` sits beside the position reading, not in place of it, since the sound still advances while its level moves.

## apps/desktop/src/msu-studio/sound-labels/

`SOUND_CHANNEL_TAGS` are the row tags for a list holding more than one channel; they must stay legible at the width of the id column. The two effect channels share a tab but are separate id spaces, so every row there is tagged. `STUDIO_TABS` put Music first, since that is what most packs only have, and Files last, since the file pool is not something the game asks for. `listSummary` shows the first `NAMES_SHOWN` names then a count; the full list stays in the row tooltip.

## apps/desktop/src/msu-studio/SoundDetail.tsx

The open sound in the details panel: its title, badges, preview buttons and Stop replacing, the live readout while it plays, then its audio section and the layer editor. The drop zone adds to the pack's pool, not to this sound; the layer editor below is where a file gets used. The continuity group field is sound level, so it sits beside the editor, and it only shows once the sound is claimed. A sound nothing claims yet is still sounding from the chip, so the first save is what claims it.

## apps/desktop/src/msu-studio/SoundGroupField.tsx

The continuity group is a free text name, not a toggle, because the relation is between sounds. It saves on blur straight into the manifest; it is sound level, so it cannot ride the layer editor's save. The field resyncs when the saved group changes underneath.

## apps/desktop/src/msu-studio/SoundListItem.tsx

Shared by the ambient list and the merged effects list, so a row reads its state from its own channel's controller the same way in both. The controller arrives whole; a merged list picks one per row.

## apps/desktop/src/msu-studio/SoundRow.tsx

Identity reads name then evidence: the catalogue name on top (a best guess) and the game's own function names beneath (not a guess). An id with no name is named by its functions; the full trigger list stays in the tooltip. The row selects the sound for the details panel, and a preview selects it too. Play never becomes stop on an effects channel, because pressing it again is meant to add a sound. With nothing replacing it, play means the chip's own version, which is the sound there.

The role badge says what the id does on its channel, which decides whether a replacement can work. The Never raised badge shows only because the unreachable ids were asked for, so it says why the id was hidden. The Silent badge is only worth showing on an id with nothing on it, since the pack could still put a sound there.

## apps/desktop/src/msu-studio/studio-frame/PackProperties.tsx

The details panel while nothing is selected: the pack name with its rename, and the facts of the pack. Slots filled counts the slots that name a file. Rename is off for an installed pack, which keeps its name.

## apps/desktop/src/msu-studio/TrackDetail.tsx

The selected slot in the details panel: its preview buttons and live readout, the file it plays, then the layer editor. There is deliberately no drop zone here: files are a pack level pool, and a per slot target implied ownership.

## apps/desktop/src/msu-studio/TrackSection.tsx

One titled band of slots, one dense line each. The open slot's editor and the live readout are in the details panel, so the list keeps its height whatever is open.

## apps/desktop/src/msu-studio/useMsuManager.ts

Composes the hooks in `behavior/` into one flat surface. Every action's outcome lands in one status line. `openTrack` is the slot in the details panel; it clears when another pack is picked, since slot numbers mean nothing across packs.

`skipNote` names both kinds of skipped file on an import (files in subfolders, files whose slot another file already claimed). Both are normal for a pack that ships extras, but silence would read as everything came in.

A dropped `.msul` carries its own manifest, so it becomes a layered pack, not a raw copy.

`loadingFiles` is true only while the first read of a pack is in flight. A reload keeps the studio mounted with its current rows, so an edit never blanks the pane and throws the scroll position away.

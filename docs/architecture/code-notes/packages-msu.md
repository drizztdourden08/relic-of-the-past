<!-- @layer docs @kind doc -->
# Code notes: packages/msu

Facts about `packages/msu` that the code cannot say on its own. Each heading names a file or folder by its path from the repository root.

## packages/msu/src/audio-probe/audio-probe.type.ts

- What a decoder can report about one audio file. Every field is nullable because the probe is optional: without a decoder nothing is knowable for an encoded file, and nulls are never guessed.
- Units: `durationSeconds` in seconds, `sampleRate` in Hz, `bitRate` in bits per second.
- `AudioProbe` takes a POSIX path relative to the Data root. It resolves null whenever nothing can be read (no decoder, not a media file, probe failed), so an absent probe and a failed one look alike.

## packages/msu/src/bridge/sound-claim/

- Tells the core which sound ids the app has taken over, per channel. The gate bits (host-gates) say the host handles a channel; these masks say which ids on it. Without a mask an armed gate claims nothing, and without the gate a mask is never consulted.
- voidCall swallows a missing export, so an older core with no WasmSetSoundClaim never claims anything and the renderer stays up.
- Clearing every channel is the state a session must leave the core in.

Which sound ids a pack claims on a channel, as the 64 bit mask the core wants. The core reports
only a sound whose bit is set, so the mask decides whether the app replaces an effect or the
chip plays it. It travels as two unsigned 32 bit halves because that is what a `ccall` can
carry; bit 31 makes a JS int negative, so each half is converted to uint32. Ids outside 0 to 63
are dropped, never wrapped, so a typo claims nothing. Channels are in the core's index order:
ambient, sfx1, sfx2. Only sounds that author at least one layer are claimed.

## packages/msu/src/classic-manifest/index.ts

- A classic MSU-1 pack (bare `<n>.pcm` files, no manifest) is presented as a manifest with one layer per track, so the engine has a single shape to play.
- Looping follows the game's own table: a fanfare must not repeat. A repeating slot uses order `single`, one file repeating at its own loop point; `sequential` would describe a pool of files that is not there.
- Packs in the wild contain two files claiming the same number (`3.pcm` beside `themename-3.pcm`), and MSU-1 only opens one. The canonical `<n>.<ext>` wins, otherwise the first name alphabetically.
- A manifest describes only the authored slots. The remaining numbered files fill the gaps, otherwise adding layers to one slot would silence the rest of the pack.

## packages/msu/src/edit/index.ts

- The text helpers (parse, serialize, new) are pure, so the main-process handlers, which speak Node fs, share the same format and validation.
- The on-disk form has `modifiedAt` stamped, a 2-space indent and a trailing newline.
- `parseManifest` returns null for missing text, malformed JSON, or a version this build does not know.
- A pack's name is its folder. The name inside its manifest follows the folder on every read and write, so a renamed pack, its export and its store install carry the same name.
- The inventory is taken from the folder at write time, never from the caller: a manifest held in memory only knows the files it was read with.
- FileStore has no move, so a rename copies every entry across and drops the old folder, then rewrites the manifest so its name follows the new folder.

## packages/msu/src/inventory/index.ts

- The inventory is every regular file in the pack folder except the manifest, sorted by name so two saves of the same folder produce the same text. Packs hold more than the wiring (alternates, an unwired bed, a cover), and an export that followed references alone would leave those behind.
- The inventory is written into the manifest on every save, an archive carries exactly that list, and an import can report which files did not make it.

## packages/msu/src/layer-edit/index.ts

- Both halves of a manifest carry layers (music slots and sound channels), and the same file can belong to both. `mapLayers` is the one walk over both, and the manifest is rebuilt whole so a channel a transform does not touch is still copied.
- Lives in shared because the renderer re-points a manifest when a file is renamed by hand, and the main process does it when a file's format changes.
- Names match case-insensitively: a hand-written manifest can spell a name in a case the disk does not and still play on a case-insensitive filesystem.
- A loop sample read from a file header is written only into layers that do not declare one; an explicit `loopSample` is the pack author's decision. A layer over several files holds one repeat point, so the first file to declare one wins. That is a limit of the format.

## packages/msu/src/msu-sound-claims/

- What the core is told about replacement sounds when a session starts and stops.
- Two things travel together and must never disagree: the gate bit that hands a channel over, and the mask of ids taken over on it. A channel the settings switch off publishes an empty mask and a cleared gate, so the core cannot report it at all: the app never receives those events.
- A gate is armed only when the pack authors something on that channel. An armed gate with an empty mask would be a channel handed over with nothing to play it.
- SoundReplacement says whether each group of channels may be replaced at all; both are false under Vanilla Safe. ClaimedCounts is how many ids were claimed per channel, for the session's log line.
- withdrawSoundClaims hands every channel back to the sound chip.

## packages/msu/src/msu1-format/msu1-format.constants.ts

- The MSU-1 `.pcm` container is shared because both sides read its header: the renderer decodes the audio, and the main process reads the loop point from the first eight bytes.
- Rate and channel count are fixed by the format: 44100 Hz, 16-bit signed, stereo, little endian, left channel first. That is why they are constants and not fields.
- One frame is a left and right pair of int16.

## packages/msu/src/msul/import-msul.ts

- Reads a `.msul` pack back into a manifest and its files, the exact inverse of `packages/msu/src/player/export/export-msul`, so a pack exported and imported again is the pack you started with.
- Every failure is something a user did (wrong file, hand-edited manifest, a pack from a newer build), so each throws a message written for them. The validation is spelled out here because `parseManifest` collapses every cause into null and could only give one generic message.
- `files` holds every non-manifest entry, in archive order.

## packages/msu/src/msul/install-msul-pack/index.ts

- A pack arrives three ways: dropped into the Data Manager, opened from the desktop through the file association, or installed from the store. All three give the same result, and the pack always lands in a folder of its own, never over an existing one.
- The manifest is written last: a run that dies part way through the audio leaves a classic, still playable pack, not a layered one whose layers name files that never arrived. That write re-stamps the inventory from the folder.
- Entry names are flattened to a bare file name, because a manifest can only name a file inside its own pack.
- `ownName` is the folder name the pack asked for; `pack` differs from it only when that name was taken.
- `missingFiles` lists files the manifest names but the archive lacks. It is always empty for a pack exported before the manifest carried an inventory.

## packages/msu/src/msul/install-msul-pack/sanitize-pack-name.ts

- Pack names become folder names, so characters a folder name cannot hold are stripped, including the control characters 0x00 to 0x1f. The pattern holds those bytes literally and must stay as written.

## packages/msu/src/music-debug/

- The music debugger's data: every sound event in one ordered feed, with running counts.
- Three sources: the core's sound trace reports every id the game raises, claimed or not, so the feed shows what the chip plays next to what the pack replaced. The core's music trace does the same for the music-control port, fades included, even when no pack owns music. The engine's debug bus adds what neither can see: chance rolls, where a layer decided not to sound.
- Owner is who produced or suppressed the sound: the pack's engine, the sound chip, or a lost roll. `at` is wall-clock ms for the feed's timestamps.
- MUSIC_CODES are the game's fade bytes (0xF0 to 0xF3), named the way the disassembly names them.
- window.__onSoundTrace is every raise on the three sound ports with its claim verdict; window.__onMusicTrace is every accepted music-control write and who owns music.
- The core-side trace gate costs host calls while armed, so it is armed only while a debugger watches; the engine's bus is free and stays attached for the whole run.
- The armed wish is kept here instead of trusting the gate mirror: every game boot starts from a cleared gate word (resetGame wipes the mirror, then the core comes up with nothing set), so an arming made before or across a boot is applied again once the new core is running.
- initMusicDebug runs from game start, never at import time. A module that subscribes because something imported it runs wherever the bundler orders it, which is how the same registration in packages/game-core/src/host-menu once ran before wasm-bridge had initialised and killed the bundled renderer at load. Nothing here can fire before a core exists, so installing at game start costs no event.
- Disarming keeps whatever the feed already collected.
- The events array and counters snapshot stay stable between notifications, so useSyncExternalStore sees one snapshot per change.

## packages/msu/src/optimize/msu-optimize.constants.ts

- FLAC is the target because it is lossless, so no candidate loses a generation.

## packages/msu/src/optimize/msu-optimize.type.ts

- Optimizing normalises a pack to one audio format. Every audio file is a candidate, compressed ones included: an mp3 is decoded once and stored exactly (lossless but bigger, shown as a negative saving). A file already in the target format is not a candidate, and neither is an original a previous run already converted.
- Only a file no probe can read (a custom wrapper, a corrupt file) is excluded, through `excludedBecause`.
- The estimate is measured, never a flat ratio: FLAC on 16-bit stereo lands anywhere from 40% to 70% depending on the material. A short slice (`OPTIMIZE_SLICE_SECONDS`) is encoded for real and the ratio scaled up.
- `estimatedBytes` is null when nothing could be measured (excluded, or unknown duration). A value bigger than `currentBytes` is normal for a compressed source.
- `carryLoopSample` is the repeat point to move into the manifest before the file's format changes. It lives in the MSU-1 header and dies with the container, so a run writes it into the layer's `loopSample` first; an intro then loop track that loses it repeats from zero.
- `alreadyTargetCount` counts files already held in the target format (the file itself, or a converted copy beside it), so the preview can say the pack is part way there.
- `OptimizeProgress.index` is the 1-based position of the file being worked on.
- `OptimizeConversion.outputName` keeps the same stem in the target format, suffixed if that name was taken. `bytes` is the size it came out at.
- `loopPointsCarried` counts repeat points written into the manifest before the first encode ran.

## packages/msu/src/packs/base-metadata.ts

- An MSU-1 `.pcm` is raw samples at a fixed rate and channel count, so its duration and bit rate follow from the byte count. For an encoded file the figures live inside the codec, so they stay null unless a probe supplies them, never guessed.

## packages/msu/src/packs/index.ts

- Layout: `msu/<pack>/<track>.{pcm,opuz,msu}`. This folder is the one import site for the whole MSU storage surface, so it re-exports the edit half.
- A layered pack's file names are arbitrary (`wind-loop.flac`), so the numbered track list cannot see them; `listAudioFiles` lists every audio file.
- `deletePack` moves the pack to the recycle bin where the platform has one, so it can be put back.

## packages/msu/src/packs/pack-file-metadata.ts

- The base pass is arithmetic on the directory listing, which keeps a multi-gigabyte pack affordable. The probe is optional and only asked about encoded files.
- `.opuz` is a custom wrapper no decoder reads, so it is not probed.
- A probe is a process launch and a converted pack has about a hundred files. One at a time was too slow and a hundred at once fight for the disk, hence four in flight.
- The loop point is not read here. It sits in the first eight bytes, but a FileStore reads whole files, so a listing would pull the entire pack through memory.

## packages/msu/src/packs/read-msu1-loop-sample.ts

- An MSU-1 file starts with a four-byte magic, followed by the loop sample as a little-endian uint32 at offset 4. Returns null for any other format and for an invalid MSU-1 file.

## packages/msu/src/paths/index.ts

- Pack and file names come from user input (imported archives, the pack editor), so every name that becomes a path segment is checked for traversal.
- `AUDIO_EXTENSIONS` are the two MSU formats plus browser-playable audio.
- The track-number pattern is built from `AUDIO_EXTENSIONS` on purpose. A classic pack has no manifest, so the file name does the wiring, and the set of formats accepted as audio must be the set a track number can be read from. Hardcoding `(pcm|opuz)` once made a converted `foo-2.flac` stop being track 2.

## packages/msu/src/player/build-channels/build-channels.ts

Turns a pack manifest into the four channels the engine drives. Music comes from `tracks`,
the other three from `sounds`; a pack with no sounds gets three empty channels. Music and the
ambient bed follow the music volume and the effect channels follow SFX; the bed has its own
group so a storm can sit under quiet music. Each channel keeps 48 decoded programs: music
tracks are minutes of PCM, so a handful covers area churn, while effects are short and a
channel may cycle through dozens in a fight, so keeping more beats decoding a bonk per hit.
Effects have no per trigger callback, since logging every trigger would bury every other
diagnostic; the channel's `report()` is how the studio watches them. Music restarts on a
repeat: the game's own repeats are filtered before they arrive, and the one that does arrive
follows a fade to zero and is meant to bring the music back.

## packages/msu/src/player/channel/

One replaceable sound chip channel, in the two behaviours the game needs. Music and the
ambient bed are stateful (a new id replaces the old and has a position worth resuming); the
two effect channels are additive (a new id layers over what is sounding, nothing resumes).
The engine holds four channels and never asks which is which.

## packages/msu/src/player/channels/active-layers/

Builds, reads and tears down the layers of one sounding program: a gain at the layer's
volume, a scheduler for its play mode, and a voice factory bound to that gain.

- `chance` absent or at least 100 always sounds (every layer authored before the field
  existed). Every roll goes to the debug bus, because a lost roll starts nothing and the bus
  is its only record. A thinned layer is skipped outright, not started silent, so it holds no
  voice or timer and never shows as sounding.
- The chain is volume, then the layer's effects, then the channel. Effects sit on the layer
  because the chain is where one recording becomes its indoor or distant version.
- The loop start applies only to a single file layer; a pool restarts every file from its
  top. The exporter follows the same rule, so a pack sounds the same either way.
- The resume callback gives a music layer its resume snapshot and an additive layer the file
  picked for this trigger; the file count is what decoded, possibly fewer than authored.
- A set is finished when nothing is audible and nothing is scheduled. A random or interval
  layer between events reports a countdown, so it is never swept mid cycle.

## packages/msu/src/player/channels/additive-channel.ts

Every trigger layers over what is already sounding, as the two effect channels do: each
trigger gets its own voices and gain path, so ten hits in a row are ten overlapping sounds.
Reusing the stateful behaviour would make rapid effects clip each other mid sample. Nothing is
resumable; a save has no half a bonk to return to.

- At most 16 trigger sets sound at once per channel. The sound chip had eight voices for
  everything, so a real pack never comes close; the cap is for a long file authored onto a
  rapid fire id, which would otherwise stack a set every frame. Over the cap the oldest set
  goes, since the newest is the one the player just caused.
- The game's pan bits arrive on the channel write: `0x80` left, `0x40` right, anything else
  centred. Only additive channels honour pan; a bed re-panned mid loop would need its graph
  rebuilt. A centred trigger feeds the channel gain directly.
- Only a stop bumps the generation, so a decode still in flight cannot spawn after teardown.
- Finished sets are swept before counting, so the cap counts what is audible. The report
  describes the newest set, the sound that just landed.

## packages/msu/src/player/channels/channel.type.ts

- `fadeNode` is the gain the game's own volume transitions act on. Only music is ever sent
  one; the others hold it at full so every channel has the same three stage gain chain.
- `restartOnRepeat`: off, selecting the id already playing is a no op (the chip's behaviour
  for a port rewritten with its own value, which the ambient bed needs); on, it restarts,
  which music needs after a fade to zero.
- `resumeEnabled` is read per selection, so a mid session toggle applies at once.
- Programs sharing a `group` hand playback across on a switch (`MsuSoundDef.syncGroup`).

## packages/msu/src/player/channels/stateful-channel.ts

A new id replaces what is playing (music, the ambient bed). A generation guard stops a slow
decode from resurrecting a superseded id. The position is captured on the way out, so leaving
an area remembers where its audio was, and the gain returns to full the moment something
starts. Id 0, or an unauthored id, means silence.

- A repeat of the playing id is a no op unless `restartOnRepeat`: the game rewrites the ambient
  id on every screen transition, so otherwise the rain would restart at every edge. Music's
  only repeat follows a fade to zero, and only a fresh start brings its gain back. A repeat of
  the id still decoding is absorbed the same way, since the game writes ambient ids in bursts
  and a second write would supersede the first start and the position it carried.
- When the outgoing and incoming ids share a sync group, layers are matched by what they play
  (files and mode), not by id, and a matched layer continues from its exact position, pending
  timer included, so a storm crossing a doorway keeps its rain and its next thunder. This
  continuity outranks the resume setting.
- Positions are always recorded; the resume setting only decides whether re-entry uses them.
  `forget` clears them without touching what is sounding.
- The studio polls `report` so a random scheduler's wait shows as a wait, not an unexplained
  silence.

## packages/msu/src/player/channels/trigger-pool.ts

Which file each layer of an additive channel uses for this trigger. A sword swing authored
with four recordings should sound like four recordings. The variation belongs to the trigger,
not the play mode, so it is chosen here and handed to the scheduler as the starting file; the
continuous modes already draw from their own pool. A file is drawn from every file except the
one the layer just used, since the same sample twice reads as broken variation. It is
deliberately unseeded; only the exporter, which must produce the same bytes twice, needs a
seed.

## packages/msu/src/player/debug-bus/

The engine's own diagnostic feed for decisions no live report can show. A channel report
says what is sounding and the core's sound trace says what the game raised; the chance roll
sits between them, and a layer that lost its roll appears in neither. Without this feed a 10%
thunder looks like a broken one. It lives outside React and is always on: publishing to
nobody costs nothing, and a bad listener never breaks playback. A roll event names the
channel, the program (track number or sound id), the layer and its odds (1 to 100).

## packages/msu/src/player/decode/

- `decode-audio-file`: three paths, picked from the file's leading bytes, not its name.
  MSU-1 `.pcm` is raw samples converted here (with a loop point in its header); `.opuz` is
  Opus in the decompilation's own container, repackaged as Ogg so the browser can decode it
  (with a loop point too); everything else goes to the browser's decoder (wav, mp3, ogg,
  flac, opus). An AudioBuffer keeps its own sample rate and the graph resamples to the
  device rate, so the C player's bug of 48 kHz audio playing fast cannot happen here.
  `decodeAudioData` detaches the buffer it gets, so it is handed a copy; the caller's bytes
  may be a view into an array we do not own. `loopSample` is in samples at the buffer's rate.
- `decode-opuz.ts`: `.opuz` is played by repackaging, not by decoding ourselves. Its payload
  is ordinary Opus and Chromium has a decoder that only lacks this container, so each range's
  packets are wrapped in an in memory Ogg stream. Each range is its own stream because a range
  is a seek, and the decoder must start clean, as the C player reset its decoder before every
  seek. Dropped samples are trimmed here, not declared as pre-skip, so trimming happens once.
  Ranges are laid end to end into one buffer, which turns the container's jump back into a
  plain loop point. Decoding uses a private 48 kHz context so no resampling shifts sample
  counts.
- `ogg-crc32.ts`: Ogg's CRC-32 shares only the polynomial (`0x04c11db7`) with the zip and PNG
  CRC: it reflects neither input nor result, starts from zero and applies no final xor. A
  stock CRC gives a number a demuxer silently rejects, and the stream decodes to nothing. The
  checksum covers the whole page with its own four bytes set to zero.
- `ogg-opus.ts`: wraps bare Opus packets in an Ogg stream so the browser can decode them, with
  no codec, library or wasm. The layout follows RFC 7845: `OpusHead` alone on the first page,
  `OpusTags` alone on the second, then audio. A page states its length as lacing bytes (255
  per full 255 bytes, then the remainder, so an exact multiple needs a trailing zero) and
  holds at most 255 of them. Packets are at most 1276 bytes and never split across pages.
  Granule positions count 48 kHz samples from the start, and the last page must be flagged end
  of stream or a demuxer keeps waiting. The head uses output gain 0 and channel mapping family
  0 (mono or plain stereo); the tags packet has no user comments.
- `opus-packets.ts`: a packet's length comes from its TOC byte: mode and bandwidth in the top
  five bits, frame count in the bottom two (code 3 puts the count in the next byte). Frame
  sizes are 10, 20, 40, 60 ms for speech configs (0 to 11), 10 and 20 ms for hybrid (12 to
  15), and 2.5, 5, 10, 20 ms for music configs, all in 48 kHz samples.
- `parse-msu1`: the MSU-1 `.pcm` container is the 4 byte "MSU1" magic, a 32 bit little endian
  loop point in samples, then interleaved signed 16 bit little endian stereo at 44100 Hz. Every
  MSU-1 emulator and flash cart reads it, so it is what we parse on import and write on
  export. A loop point past the end resets to 0.
- `parse-opuz`: the upstream `.opuz` container, built so a player can seek to the loop point
  without decoding from the top. All fields are little endian. `+0` u32 magic "OPUZ"; `+4` u32
  unused here (the sibling `.pcm` keeps its loop point there); from `+8` a range table of ten
  byte records: u32 file offset of the range's packet stream, u32 samples to play, u16 flags
  (bits 0 to 13 samples to drop first, bit 14 looping restarts here, bit 15 after this range
  jump back to the bit 14 range). A record without bit 15 continues at the next record; an
  offset of zero ends playback. Ranges may overlap, because the loop range starts a little
  ahead of the loop point and its drop covers the difference, which lets the decoder resume
  without a seam. A packet stream is u16 framing (bits 0 to 14 length, at most 1275; bit 15
  means the first byte was left out and is `0xFC`) then the packet. `0xFC` is fullband stereo
  in 20 ms frames, which nearly every music packet uses. Audio is always 48 kHz stereo.

## packages/msu/src/player/engine.ts

The single entry point for replacement audio; nothing above it touches an audio node. The
gain chain, innermost first: per layer volume, the game's own fades, the volume group (music
and ambient follow the music slider, effects the SFX one), then the shared output. The stages
are separate so a fade cannot clobber a user setting and the reverse.

- The ambient bed has its own volume group: it is neither music nor a one shot, and the
  setting exists to hold a storm under a quiet piece.
- The game's music control byte: below `0xF0` selects a track (0 is silence), `0xF1` to `0xF3`
  are volume transitions, and the rest of `0xF0` and up only concerns the sound chip.
- A track faded to silence is still active in the graph, but reporting it as playing would make
  the game skip the re-select that brings the sound back, so a faded track answers not playing.
- The title reset runs before the select, so the track this event starts begins fresh.
- Track ids are remapped (deluxe packs) before comparing, so two areas sharing one vanilla
  byte compare as different music where the pack differs.
- Game sounds arrive on channel index 0 (ambient), 1 (sfx1) or 2 (sfx2); only claimed ids
  arrive.
- A save's audio snapshot holds music plus the bed; effects have no position. On restore an
  `ambient` of `undefined` comes from a snapshot taken before beds were resumable and leaves
  the bed alone, while `null` means the save had none.

## packages/msu/src/player/export/

- `dedupe-files.ts`: packs collect byte identical duplicates (a `wind.flac` copied per area, a
  silent stub under a dozen names); storing one copy is free and on a gigabyte pack decides
  whether it can be shared at all. The map covers every referenced name, so a manifest rewrite
  maps each reference unconditionally. A missing file aborts the export with its name, rather
  than producing a pack that fails on import.
- `export-msu1`: a plain MSU-1 set for other players, named per the SD2SNES convention
  (`<base>.msu` plus `<base>-<track>.pcm`), which snes9x 1.55 and up, bsnes and higan, the
  FXPak and MiSTer all look for. The `.msu` file is an empty marker. Layers cannot survive (MSU-1
  is one stream), so every track is flattened first. A track whose files are all missing is
  skipped, since a header only `.pcm` would play silence. Entries are stored, not deflated: PCM
  barely compresses and a set is gigabytes. The stem becomes a filename, so path characters are
  removed. One decode per distinct filename per track.
- `export-msul`: `.msul` is our own container and the only format that keeps a pack whole
  (layers, play modes, volumes, loop points, metadata). It is a plain ZIP under another
  extension, so a user can rename it and read `pack.json`. `pack.json` is the first entry (a
  reader identifies a pack from the head of the file) and the only deflated one; audio is
  stored. Every file in the pack folder is stored, wired or not, since an export that followed
  references alone once left an unwired bed behind. Referenced names come first so dedupe keeps
  a wired file under its own name and drops the unwired copy. The manifest is serialized by hand
  so `modifiedAt` is not restamped; export must be reproducible. The rewritten manifest's
  `files` is the archive's own inventory. A later pass may transcode per layer Opus presets
  between dedupe and entry building; dedupe has to stay ahead of it so identical sources encode
  once.
- `fade-envelope`: the same envelope `voice.ts` gives a live voice, duplicated on purpose because
  the two run on different clocks (live starts at `currentTime`, offline at a computed time). Any
  change to the voice envelope must be mirrored here or an export stops sounding like its
  preview. A fade out never starts before the rise finishes. No fade means no gain node.
- `flatten-track`: MSU-1 is one stream on one track register, so export mixes the layers
  offline at 44100 Hz; layering survives only in `.msul`. Every random choice comes from a PRNG
  seeded by the track number, so two exports of the same pack are byte identical. The loop
  point is normally 0: the render window is one pass of the loop layer. The exception is a track
  whose body is a single file with its own loop point (every classic pack track): that layer
  renders as one pass and its loop point goes into the header, so the player does the
  intro then loop natively. Other layers in the intro region are heard only on the first pass,
  which suits a sting and thins an ambient layer. A crossfaded loop layer exports with loop point
  0, since live crossfading restarts each pass from the top by hand; every crossfade inside the
  cycle is reproduced and the wrap from the last frame to frame 0 is a hard cut, the same seam a
  zero crossfade pack has. Fading the ends would dip at every loop, and folding the tail into
  the head only works for a sequential pool.
- `layer-window`: the loop layer's pass is the loop period; other modes are placed inside it. A
  track with no loop layer uses the longest span any layer occupies. The render is capped at
  ten minutes because a manifest is user authored. Crossfades are floored at zero and otherwise
  taken as written (the editor's ceiling is not re-applied, or a render would stop matching its
  preview), and clamped per file to half its length like the live scheduler. A crossfaded cycle
  is shorter than the sum of its files by one window per file. The dominant loop layer is the
  longest one, the only one whose loop point can survive the flatten.
- `place-source`: the primitive every export mode schedules through. A fading source gets its
  own gain node, like a live voice. At most 4096 sources per layer, so a zero gap cannot spin
  forever. `singlePass` plays the pool once for the layer whose loop point is carried into the
  header.
- `prng`: mulberry32, because `Math.random` cannot be used on the export path. One stream per
  layer is derived from the track seed, so adding a layer or changing a file count does not
  shift the choices of the layers beside it.
- `remap-manifest`: the half of dedupe that is easy to get wrong. There are exactly two
  reference sites, a layer's `files` and the cover image. Layers live in both the music slots
  and the sound channels, so the walk goes through `mapLayers`; an export that listed only the
  tracks once shipped a bed naming a file that was never written. An unmapped name keeps itself.
- `schedule-layer.ts`: unrolls each live scheduler's rules into start calls. `random` waits a
  gap before its first event, like the live one; the gap is drawn either way so
  `waitForCompletion` changes only spacing, not the sequence of choices; waiting for completion
  measures the gap from the end of the sound. `interval` walks its offsets as a cycle as long as
  the last offset, each offset using the file at its position; offsets all at zero fire once.
- `schedule-loop`: without a crossfade, passes butt together and a single file repeats from its
  own loop point (a manifest loop point is in 44100 Hz samples whatever the file's rate); a
  pool restarts each file from its top. With a crossfade, a pass starts one window before the
  previous ends and rises while that one falls; the outgoing fade lasts the outgoing file's
  window and the rise the incoming file's; every pass starts at the top of its file; the opening
  pass does not rise. Random order never repeats a file twice running.
- `write-pcm`: the inverse of `parse-msu1`. The loop point is in frames (a left and right pair),
  not bytes. Always stereo (mono is duplicated, wider keeps the first two) and always 44100 Hz.
  Samples are clamped before scaling by 32768, since a hot mix would otherwise wrap into the
  opposite polarity as a click. A loop point past the end is clamped.

## packages/msu/src/player/fade/

The game asks for volume transitions with three control bytes, not a level: `0xF1` fades out,
`0xF2` ducks to a low level, `0xF3` returns to full. Each has its own speed, a per frame step
out of 256 at 60 frames a second, converted to a ramp duration so a fade takes the same wall
time as on hardware. A starting track returns to full at the fastest step (24).

## packages/msu/src/player/layer-effects/build-effect-chain.ts

Every effect is one or more biquad filters, the whole vocabulary the manifest allows, so it
plays the same everywhere and can be flattened into an export. The three band EQ is a low shelf
at 250 Hz, a peak at 1 kHz (Q 0.7, about an octave and a half) and a high shelf at 4 kHz. An
empty chain is no nodes at all.

## packages/msu/src/player/schedulers/

The strategy seam for layer playback: each play mode is one scheduler, and `create-scheduler`
is the one place modes map to behaviour.

- `once`: plays one file and stops; a finished one shot resumes from the start, not its tail.
- `loop`: one file loops on itself; several play in order or shuffled, never the same file twice
  running. `single` ignores any crossfade. With a crossfade the passes are chained by hand
  (each fades out over its last window while the next rises), giving up gapless native looping,
  so a zero crossfade keeps the simpler path. Repeats start at the loop point, since the intro
  plays once. The position readout follows the newest voice, and the reported loop point is the
  scheduler's own, since a crossfaded buffer does not loop.
- `random`: fire, wait a random gap, fire again. The gap is measured from the start of a sound by
  default (long sounds overlap) or from its end with `waitForCompletion`. Resume keeps only the
  remaining gap, so the next event is not bunched against the previous one. While waiting for a
  sound to finish there is no countdown to show.
- `interval`: fires at fixed offsets from the track start (a thunderclap eight seconds in),
  repeating as a cycle once the last offset passes; wrapping gives a gap of cycle minus previous
  plus next. The offsets are sorted and deduplicated because order is meaning. With one file per
  offset each offset gets its own sound. Resume re-enters the cycle at the same point.
- `LayerContext.loopSeconds` is where each repeat starts, from the manifest or the file, and is
  zero unless the layer has exactly one file, matching the exporter.

## packages/msu/src/player/title-reset/

Replacement audio goes back to nothing at the title. Resume positions carried across runs would
start the opening in the middle of itself. The game ends a run by reloading the sound chip's
song bank, which stops the chip's ambience without raising the no bed id, so a storm would keep
raining over the title. Reaching a title module is the one unambiguous signal that no run is in
progress, and save and quit, a game over and a hard reset all arrive there. The modules are the
core's own dispatch order (`kMainRouting`), the same set `packages/game-core/src/ui-bridge-parser` reads as the
title UI mode: intro (0), file select (1), copy file (2), kill file (3), name file (4) and the
attract demo (20). Music is not silenced: every path to the title fades it out first
(`Death_Func31` and `FadeMusicAndResetSRAMMirror` write the fade byte the same frame), so a cut
would replace that fade with a click. Silencing happens once on the way in; forgetting
positions happens on every title event, since the title loops into its demo and back.

## packages/msu/src/player/track-loader.ts

Audio is decoded per id, on demand: a real pack is over a gigabyte of PCM and only a few ids
sound at a time. Decoded audio is cached so re-entering an area or repeating an effect does not
decode twice, capped so a long session cannot grow without bound. One loader per channel, so a
busy effect channel cannot evict the music. A layer whose files all failed is dropped rather
than left to play silence.

## packages/msu/src/player/voice.ts

One sounding buffer that can report its position, which Web Audio does not expose; that read is
what makes resume possible. A voice asked to fade gets its own gain node, so two passes of a
loop can move in opposite directions without touching the layer's volume. The manifest's loop
point overrides the file's: it is what gives a `.wav` or `.mp3` the intro then loop structure
only an MSU-1 header can carry. It is in seconds, because a manifest loop point is defined at
44100 Hz while a `.pcm` header's is in the file's rate; the caller converts. An MSU-1 loop point
is normally not zero (an intro plays once, a body repeats), so the position jumping back there is
the file working as authored.

## packages/msu/src/resume/index.ts

- The music resume state is a sidecar, `{save}.msu.json`, next to the save it belongs to, because quick slots have no manifest. This fits all three save kinds.
- The save owns its lifetime: the save stores clear it whenever that save is written or deleted, so a caller persisting a new snapshot writes it after the save bytes.

## packages/msu/src/store/install/install-msul.ts

- Music packs install through the Data Manager's own `.msul` install, into a new folder under `msu/` named after the pack itself. Uninstall removes that folder.
- After an update removed the version before it, the new folder moves back to the pack's own name, so updates never pile up "(2)" suffixes.

## packages/msu/src/superseded/index.ts

- A file is superseded when the pack also holds its stem in the target format, whichever way round the two arrived. There is no record of a past conversion. The same rule decides what the files list offers to throw out and where a reference moves, so the two cannot disagree.
- Stems match case-insensitively, for the same reason as layer names.
- The main process reconciles the manifest once the last converted file lands, and the renderer moves every reference before an original is deleted, so removal never silences a slot.
- A reference to a file no longer on disk still moves if its stem is there. Two references landing on the same file collapse to one.
- `withSupersededRepointed` returns the same object when nothing moved, so a caller can skip the write.

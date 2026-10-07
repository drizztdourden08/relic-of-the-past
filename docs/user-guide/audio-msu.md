<!-- @layer docs @kind doc -->
<!-- @wiki-title: Audio and Music Packs -->
# Audio and Music Packs

These settings live in the **Audio** tab of a profile, and each one is saved with that profile. Start at the top with the overall levels, then move down to output quality and finally music packs.

## Volume

- **Master Volume:** a slider from 0 to 100% (default 100). This sets the overall output level for everything you hear, so turning it down quiets music and sound effects together.
- **Music Volume:** a slider from 0 to 100% (default 100) with its own mute toggle. It controls the background music, and it is also the volume a music pack plays at, since a pack replaces that same music instead of playing alongside it.
- **SFX Volume:** a slider from 0 to 100% (default 100) with its own mute toggle. It controls the sound effects.

The Music and SFX sliders only take effect once **Independent Music / SFX** is on; with it off you get the original audio mix exactly.

## Playback

- **Channels:** Mono or Stereo (default Stereo). Stereo separates the left and right output so sounds feel like they come from a direction.
- **Sample Rate:** 22050, 32000, 44100, or 48000 Hz (default 44100). This is the output rate for the game's own sound chip. Music packs are resampled to match automatically, whatever rate their files happen to use, so you no longer have to match this to your pack.
- **Buffer Size:** 512, 1024, 2048, or 4096 (default 2048). A smaller buffer lowers latency but can introduce crackling, while a larger buffer stays steady at the cost of a little delay.

## Music Packs

A music pack replaces the original soundtrack with recorded music. You import packs and assign one to a profile in the [Data Manager](data-manager.md); the settings here decide how it plays.

- **Replace ambient sounds:** a toggle (default on). Lets a pack take over the game's looping background sounds, like the storm rain or a waterfall. With it off, those always come from the game.
- **Replace sound effects:** a toggle (default on). Lets a pack take over one-shot effects, like an explosion or a menu blip. With it off, effects always come from the game.
- **Configuration:** Auto or Manual (default Auto). In **Auto**, whichever pack is assigned to the profile plays, and its format is read from the files themselves. There is nothing to match up by hand. **Manual** lets you switch replacement music off without unassigning the pack.
- **Music Pack:** in Auto, a read-only summary of what was found: *Standard* for a pack covering the original music slots, *Extended* for one that also has the extra per-area and per-interior tracks, or *None* when no pack is assigned. In Manual, this becomes a simple On/Off switch.
- **Resume Tracks:** a toggle (default on). With it on, returning to an area picks its music up where it left off instead of restarting. Save states remember the position too, so loading a save resumes the music it was playing.

### Supported files

Packs can hold `.pcm` files (the standard MSU-1 format that other emulators use) and ordinary `.wav`, `.mp3`, `.ogg`, `.flac` and `.opus` files. Nothing needs converting to play locally.

### Layered packs

A pack made in this app can stack several sounds on one track. A pack might hold a wind bed that loops, occasional gusts drawn at random from a few files, and two music pieces alternating. Each layer chooses how it plays: once, looping, at random intervals between a minimum and maximum, or at fixed offsets. See [Data Manager](data-manager.md) for building one.

### Replacing sounds, not just music

The game plays audio on four separate channels: its music, a looping ambient bed, and two channels of one-shot sound effects. A pack can replace any of them, **one sound at a time**.

Each sound the game can play has a number, and a pack only takes over the numbers it actually provides audio for. Everything else keeps coming from the game exactly as before. A pack can replace the storm rain and leave every other sound untouched, or swap a single sound effect and nothing more. The Data Manager lists every sound with a short description of what triggers it, and you pick which ones to replace.

Every sound and every music slot can be listened to before you decide. Each row has an outline play
button that plays the game's own version, and a filled one that plays the pack's, so on anything the
pack answers you can hear the two back to back. Only one plays at a time, so they never overlap.

Each channel lists **every** id it can carry, with a plain-language name and, underneath, the game
functions that raise it. The heading says how many of them the game actually asks for; the rest are
ids the channel can still carry, and you can replace those too, though nothing in the game will
trigger them. Ids the sound chip makes no sound for at all are marked as silent.

Names are documented for every effect and for each ambient bed the game uses. A few are a best guess
at a sound nobody has pinned down, which is why the function names stay on the row as evidence, and
why the play button is the final word. The search box narrows the list by id, by name, or by the
function name, so if you know roughly where in the game a sound happens you can find it that way.

The original is generated from your own game files at the moment you ask for it. That works whether
or not a game is running. Nothing is stored, and nothing about the running game is disturbed. A
one-shot effect plays once and stops when it ends; music and an ambient bed have no end, so those
loop until you stop them, the same as they would in game.

Two things follow from this:

- **The two toggles above are master switches.** With *Replace ambient sounds* off, no pack can take over an ambient sound, whatever it contains. The same goes for effects. Nothing is reported to the app for a channel that is switched off.
- **Sound effects can stack.** Because the game fires effects as one-shots, each trigger plays its own copy. Ten sword swings in a row are ten overlapping sounds, the same as the original. If you give an effect several files, a different one is picked each time it fires, so a repeated sound varies instead of being identical every time.

### Sharing packs

A pack can be exported two ways:

- **Music pack (`.msul`):** this app's own format. It keeps the layers, the per-layer settings and the pack details, and imports back without losing anything. It is an ordinary zip archive underneath, so renaming it to `.zip` lets any archive tool look inside.
- **MSU-1:** the standard format other emulators and flash carts read. Layered tracks are mixed down to a single track each, because MSU-1 plays one audio stream at a time and cannot represent layers.

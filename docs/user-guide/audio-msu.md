<!-- @layer docs @kind doc -->
<!-- @wiki-title: Audio and MSU -->
# Audio and MSU

These settings live in the **Audio** tab of a profile, and each one is saved with that profile. Start at the top with the overall levels, then move down to output quality and finally MSU music.

## Volume

- **Master Volume** — a slider from 0 to 100% (default 100). This sets the overall output level for everything you hear, so turning it down quiets music and sound effects together.
- **Music Volume** — a slider from 0 to 100% (default 100) with its own mute toggle. It controls the background music, which plays on SPC channels 0 through 5.
- **SFX Volume** — a slider from 0 to 100% (default 100) with its own mute toggle. It controls the sound effects, which play on SPC channels 6 and 7.

## Playback

- **Channels** — a segmented control offering Mono or Stereo (default Stereo). Stereo separates the left and right output so sounds feel like they come from a direction.
- **Sample Rate** — a segmented control offering 22050, 32000, 44100, and 48000 Hz (default 44100). A higher rate captures more audio detail, and 44100 or 48000 is the recommended choice.
- **Buffer Size** — a segmented control offering 512, 1024, 2048, and 4096 (default 2048). A smaller buffer lowers latency but can introduce crackling, while a larger buffer stays steady at the cost of a little delay.

## MSU Audio

MSU music swaps the original SNES soundtrack for CD-quality tracks. You import and manage packs in the [Data Manager](data-manager.md), then choose one here.

- **MSU Pack** — imports an MSU pack from a `.zip` file so its CD-quality music is available to the game.
- **MSU Mode** — a segmented control offering Off, MSU, Deluxe, OPUZ, and Deluxe OPUZ (default Off). This picks which CD-music format to use and needs MSU files to be available.
- **Resume MSU** — a toggle (default on, available when MSU is on). With it on, a track picks up where it left off instead of restarting from the beginning.
- **MSU Volume** — a slider from 0 to 100% (default 100, available when MSU is on). It sets the MSU music level relative to the sound effects.

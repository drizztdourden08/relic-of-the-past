# Audio & MSU

## Volume Controls

Three independent volume sliders, all accessible from Profile Settings → Audio:

- **Master** — overall volume multiplier
- **Music** — background music level
- **SFX** — sound effects level

Each slider operates independently. Setting Music to 0 mutes music while keeping sound effects audible.

### Mute Toggle

A speaker icon in the title bar provides instant mute/unmute without opening settings. Mute state persists across sessions.

---

## MSU-1 Support

MSU-1 is a SNES enhancement chip specification that allows CD-quality audio tracks to replace the original game music. The community has produced dozens of MSU packs — orchestral, remixed, other game soundtracks, etc.

### Importing an MSU Pack

1. Open Menu → Data → **MSU Packs**
2. Click **Import MSU**
3. Select the folder containing your MSU files (`.pcm` tracks and `.msu` file)

The pack is copied into the app's data directory.

### Selecting an MSU Pack

1. Open Profile Settings → Audio
2. Select your imported pack from the MSU dropdown
3. The game will use the MSU tracks instead of the original SNES audio

### MSU Pack Format

A valid MSU pack contains:
- A `.msu` file (metadata)
- Numbered `.pcm` files (one per track)

Track numbering follows the community MSU-1 standard for A Link to the Past.

### Per-Profile

MSU pack selection is per-profile. You can have one profile with orchestral music and another with the original soundtrack.

<!-- @layer docs @kind doc -->
# Audio & MSU

## Volume Controls

There are three volume sliders in Profile Settings → Audio:

- **Master** — overall volume multiplier
- **Music** — background music level
- **SFX** — sound effects level

Each slider works on its own, so setting Music to 0 mutes the music while sound effects keep playing.

### Mute Toggle

A speaker icon in the title bar mutes and unmutes audio without opening settings. The mute state is remembered between sessions.

---

## MSU-1 Support

MSU-1 is a SNES enhancement chip specification that lets CD-quality audio tracks stand in for the original game music. The community has produced dozens of MSU packs, including orchestral versions, remixes, and soundtracks lifted from other games.

### Importing an MSU Pack

1. Open Menu → Data → **MSU Packs**
2. Click **Import MSU**
3. Select the folder containing your MSU files (`.pcm` tracks and `.msu` file)

The pack is copied into the app's data directory.

### Selecting an MSU Pack

1. Open Profile Settings → Audio
2. Select your imported pack from the MSU dropdown
3. The game plays the MSU tracks in place of the original SNES audio

### MSU Pack Format

A valid MSU pack contains:

- A `.msu` file (metadata)
- Numbered `.pcm` files (one per track)

Track numbering follows the community MSU-1 standard for A Link to the Past.

### Per-Profile

MSU pack selection is saved per profile. One profile can run orchestral music while another keeps the original soundtrack.

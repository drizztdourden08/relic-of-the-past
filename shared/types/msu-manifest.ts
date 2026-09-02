/* @layer shared-types @kind logic */
/**
 * The MSU-Layered (.msul) pack format.
 *
 * A pack folder may carry a `pack.json` manifest describing layered audio. Packs without
 * one are "classic": plain `<n>.pcm` / `<n>.opuz` files, which the engine synthesizes into
 * a single looping layer per track so one playback path serves both.
 *
 * MSU-1 itself cannot represent layers (single audio stream, one track register), so
 * layering is our extension — preserved by the `.msul` container, flattened on MSU-1 export.
 */

/** Longest crossfade a loop may use, in seconds. */
const MAX_CROSSFADE_SECONDS = 10;

/** How a layer's files are scheduled once its track becomes active. */
type LayerPlayMode =
  // Play through once and stop.
  | { kind: 'once' }
  // Play continuously; with several files, in order or shuffled, one after another.
  | {
    kind: 'loop';
    /**
     * How the loop comes round again. `sequential` and `random` move BETWEEN files; `single` plays
     * one track that repeats on itself at its own loop point, with no crossfade — which is exactly
     * what MSU-1 does, and why it is an order rather than a mode of its own.
     */
    order: 'sequential' | 'random' | 'single';
    /**
     * Overlap between one pass and the next, in seconds (0-10). The outgoing audio fades out
     * while the incoming fades in over this window, so a pool of themes blends instead of
     * cutting. 0 or absent keeps the hard cut, which is what a pack authored before this
     * existed expects.
     */
    crossfadeSeconds?: number;
  }
  // Fire a single file at a random gap, forever (wind swooshes, distant thunder).
  | {
    kind: 'random';
    minDelaySeconds: number;
    maxDelaySeconds: number;
    /**
     * When true, the gap is measured from the moment the sound FINISHES, so one plays at a
     * time. When false or absent the gap is measured from when it STARTED, so a sound longer
     * than the gap can still be playing when the next one fires — deliberate for layering
     * several overlapping gusts, and the behavior packs authored before this relied on.
     */
    waitForCompletion?: boolean;
  }
  // Fire at fixed offsets measured from the moment the track started.
  | { kind: 'interval'; atSeconds: number[] };

/**
 * One processing stage on a layer, applied in the order listed, after the layer's own volume and
 * before it joins the channel. Kept to what a single biquad filter can do, so the description is
 * small, plays identically everywhere the pack does, and can be flattened into an export later.
 *
 * The case that made this exist: one recording of rain serving both outdoors and indoors. The
 * indoor version is the same file heard through walls — the highs gone, the rest dulled — which is
 * a low-pass, not a second recording.
 */
type LayerEffect =
  /** Rolls off everything above the cutoff: muffled, behind a wall, under water. */
  | { kind: 'lowpass'; frequencyHz: number }
  /** Rolls off everything below the cutoff: thin, distant, through a speaker. */
  | { kind: 'highpass'; frequencyHz: number }
  /** Three bands of shelf and peak gain, in decibels; 0 on all three is a no-op. */
  | { kind: 'eq'; lowDb: number; midDb: number; highDb: number };

interface MsuLayer {
  id: string;
  name: string;
  /** Filenames within the pack. More than one = a pool the play mode draws from. */
  files: string[];
  mode: LayerPlayMode;
  /** Processing on this layer's audio, in order. Absent or empty plays the files as they are. */
  effects?: LayerEffect[];
  /** 0-100, relative to the profile's music volume. */
  volume: number;
  /**
   * How likely this layer is to sound at all, 1-100. Rolled once each time the layer STARTS, so
   * on a one-shot effect it is a per-trigger chance and on a bed it decides whether that bed
   * carries the layer this time round.
   *
   * The game raises some effects far more often than a replacement wants to be heard — the storm's
   * thunder fires on a fixed frame cycle, which a real recording turns into a metronome. Thinning
   * it here keeps the sound tied to the moment the game means it, which a free-running random
   * layer cannot do. Absent means 100: every start sounds, the behaviour of every pack written
   * before this existed.
   */
  chance?: number;
  /**
   * Loop restart point, in samples at 44100 Hz. Carried through to the MSU-1 loop-point
   * field on export. Undefined = restart at the beginning.
   */
  loopSample?: number;
}

/**
 * The game's sound-chip channels other than music, each with its own id space.
 * `ambient` is the looping bed (rain, falls, dungeon hum); `sfx1`/`sfx2` are the one-shot
 * effect channels (explosions, bonks, menu blips).
 */
type SoundChannel = 'ambient' | 'sfx1' | 'sfx2';

/**
 * A replacement for one of the game's sounds, keyed by the id the game itself raises. The
 * layers are the same shape a music track uses, so every play mode, crossfade and volume
 * applies here too.
 */
interface MsuSoundDef {
  soundId: number;
  layers: MsuLayer[];
  /**
   * Sounds sharing a group hand playback across when one replaces the other: a layer whose files
   * and play mode match a layer of the outgoing sound carries on from the same position instead
   * of restarting. Whatever does NOT match still changes — effects, volume, an extra layer only
   * one of them has. The case in mind: the same storm indoors and outdoors, where a doorway
   * should change how the rain sounds, never where it is.
   */
  syncGroup?: string;
}

interface MsuTrackDef {
  /** The game's music slot — the same numbering as `<n>.pcm` (37+ is the Deluxe range). */
  trackNum: number;
  layers: MsuLayer[];
}

interface MsuPackMeta {
  name: string;
  author?: string;
  description?: string;
  /** Filename of a cover image inside the pack. */
  cover?: string;
  createdAt: number;
  modifiedAt: number;
}

interface MsuPackManifest {
  /** Bumped only on a breaking change; readers reject what they don't know. */
  version: 1;
  meta: MsuPackMeta;
  tracks: MsuTrackDef[];
  /**
   * Sounds this pack replaces, per channel. Absent or empty means the pack claims nothing and
   * every sound keeps playing from the chip — which is what every pack authored before this
   * existed expects.
   */
  sounds?: Partial<Record<SoundChannel, MsuSoundDef[]>>;
  /**
   * Every file the pack folder holds, the manifest itself excepted, sorted by name — wired or
   * not. Stamped on every save from the folder itself, so it is a record rather than a claim, and
   * an exported archive carries this exact list. Absent on a manifest written before this existed.
   */
  files?: string[];
}

/** Where one layer was when playback stopped — the unit the resume snapshot is built from. */
interface LayerResume {
  /** Index into the layer's `files`, for multi-file modes. */
  fileIndex: number;
  offsetSeconds: number;
  /** Seconds left on a pending random/interval event, or null when nothing is scheduled. */
  nextEventInSeconds: number | null;
}

/** A whole track's playback position: what gets embedded in save-state metadata. */
interface MsuResumeState {
  trackNum: number;
  /** Keyed by layer id, so adding or removing a layer can't corrupt an old snapshot. */
  layers: Record<string, LayerResume>;
  /**
   * The ambient bed playing alongside, if the pack replaced it. Only the continuous channels
   * are worth restoring — a one-shot effect has no position to return to.
   */
  ambient?: { soundId: number; layers: Record<string, LayerResume> } | null;
}

const MSUL_EXTENSION = 'msul';
const MSUL_MANIFEST_NAME = 'pack.json';
/**
 * The game's own music slots run 1..34 — that is every song id the engine has. Slot 15 is among
 * them but no code path ever requests it, so it is listed and simply never heard.
 *
 * 35 and 36 are NOT slots: they are the gap between the vanilla range and the Deluxe one. Listing
 * up to the Deluxe threshold treats that gap as two real tracks, which is how the studio came to
 * show slots the game cannot play and hang names on them.
 */
const VANILLA_TRACK_COUNT = 34;

/**
 * Track numbers at or above this are the Deluxe-only range: the per-area and per-interior tracks
 * that extend the vanilla set. Used to RECOGNISE a Deluxe pack — not to count vanilla slots, which
 * stop at VANILLA_TRACK_COUNT.
 */
const DELUXE_TRACK_THRESHOLD = 37;
/**
 * Ids a sound channel can carry, 0 included. The value the game writes to a port keeps its top two
 * bits for pan, which leaves six for the id — so this is a property of the hardware interface, not
 * a count of the sounds that happen to exist.
 */
const SOUND_ID_COUNT = 64;

export {
  MSUL_EXTENSION, MSUL_MANIFEST_NAME, DELUXE_TRACK_THRESHOLD, VANILLA_TRACK_COUNT,
  MAX_CROSSFADE_SECONDS, SOUND_ID_COUNT,
};
export type {
  LayerEffect,
  LayerPlayMode, MsuLayer, MsuTrackDef, MsuPackMeta, MsuPackManifest, LayerResume, MsuResumeState,
  SoundChannel, MsuSoundDef,
};

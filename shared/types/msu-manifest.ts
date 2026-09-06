/* @layer shared-types @kind logic */
/**
 * The MSU-Layered (.msul) pack format.
 *
 * A pack folder may carry a `pack.json` manifest describing layered audio. Packs without
 * one are "classic": plain `<n>.pcm` / `<n>.opuz` files, which the engine synthesizes into
 * a single looping layer per track so one playback path serves both.
 *
 * MSU-1 itself cannot represent layers (single audio stream, one track register), so
 * layering is our extension. The `.msul` container keeps it, and MSU-1 export flattens it.
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
     * `sequential` and `random` move BETWEEN files; `single` repeats one track at its own loop
     * point with no crossfade, which is what MSU-1 does (hence an order, not a mode of its own).
     */
    order: 'sequential' | 'random' | 'single';
    /**
     * Overlap between one pass and the next, in seconds (0-10): outgoing fades out while
     * incoming fades in. 0 or absent keeps the hard cut older packs expect.
     */
    crossfadeSeconds?: number;
  }
  // Fire a single file at a random gap, forever (wind swooshes, distant thunder).
  | {
    kind: 'random';
    minDelaySeconds: number;
    maxDelaySeconds: number;
    /**
     * True: the gap is measured from when the sound FINISHES, so one plays at a time. False or
     * absent: measured from when it STARTED, so sounds may overlap (deliberate for layering
     * several gusts, and what older packs relied on).
     */
    waitForCompletion?: boolean;
  }
  // Fire at fixed offsets measured from the moment the track started.
  | { kind: 'interval'; atSeconds: number[] };

/**
 * One processing stage on a layer, applied in the order listed, after the layer's own volume and
 * before it joins the channel. Limited to what a single biquad filter can do, so it plays the
 * same everywhere and can be flattened into an export. Motivating case: one rain recording heard
 * outdoors and, low-passed, indoors through walls.
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
   * Chance this layer sounds at all, 1-100, rolled each time the layer STARTS: a per-trigger
   * chance on a one-shot, a per-bed decision on a bed. Exists because the game raises some
   * effects on a fixed frame cycle (the storm's thunder), which a real recording turns into a
   * metronome. Absent means 100, the behaviour of older packs.
   */
  chance?: number;
  /** Loop restart point, in samples at 44100 Hz (the MSU-1 loop-point field on export). Undefined = beginning. */
  loopSample?: number;
}

/**
 * The game's non-music sound-chip channels, each with its own id space. `ambient` is the
 * looping bed (rain, falls, hum); `sfx1`/`sfx2` are the one-shot effect channels.
 */
type SoundChannel = 'ambient' | 'sfx1' | 'sfx2';

/** A replacement for one game sound, keyed by the id the game raises. Layers are the music-track shape, so every play mode, crossfade and volume applies. */
interface MsuSoundDef {
  soundId: number;
  layers: MsuLayer[];
  /**
   * Sounds sharing a group hand playback across when one replaces the other: a layer whose files
   * and play mode match one of the outgoing sound carries on from the same position. Whatever
   * does NOT match (effects, volume, an extra layer) still changes. Case in mind: the same storm
   * indoors and outdoors, where a doorway changes how the rain sounds, never where it is.
   */
  syncGroup?: string;
}

interface MsuTrackDef {
  /** The game's music slot, same numbering as `<n>.pcm` (37+ is the Deluxe range). */
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
  /** Sounds this pack replaces, per channel. Absent or empty: every sound keeps playing from the chip (what older packs expect). */
  sounds?: Partial<Record<SoundChannel, MsuSoundDef[]>>;
  /**
   * Every file the pack folder holds except the manifest, sorted by name, wired or not. Stamped
   * from the folder on every save, so it is a record, not a claim; an exported archive carries
   * this exact list. Absent on older manifests.
   */
  files?: string[];
}

/** Where one layer was when playback stopped. The resume snapshot is built from these. */
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
  /** The ambient bed playing alongside, if the pack replaced it. Only continuous channels are restored; a one-shot has no position. */
  ambient?: { soundId: number; layers: Record<string, LayerResume> } | null;
}

const MSUL_EXTENSION = 'msul';
const MSUL_MANIFEST_NAME = 'pack.json';
/**
 * The game's own music slots run 1..34, every song id the engine has. Slot 15 is listed but no
 * code path ever requests it. 35 and 36 are NOT slots: they are the gap before the Deluxe range,
 * and listing up to the Deluxe threshold once made the studio show slots the game cannot play.
 */
const VANILLA_TRACK_COUNT = 34;

/**
 * Track numbers at or above this are the Deluxe-only range (per-area and per-interior tracks).
 * Used to RECOGNISE a Deluxe pack, not to count vanilla slots (VANILLA_TRACK_COUNT).
 */
const DELUXE_TRACK_THRESHOLD = 37;
/**
 * Ids a sound channel can carry, 0 included. The port value keeps its top two bits for pan,
 * leaving six for the id, so this is a hardware property, not a count of existing sounds.
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

/* @layer renderer-components @kind logic */
/**
 * The `sounds` half of a manifest, shaped for the editor.
 *
 * A manifest is written WHOLE, so every function here rebuilds only the one channel it touches
 * and copies `tracks` and the other two channels forward untouched — anything not carried over
 * would be dropped from the pack on the next save.
 *
 * A channel with nothing left in it is removed rather than left as an empty list, and a pack
 * with no claimed sounds at all loses the `sounds` key entirely, so claiming and then
 * un-claiming a sound leaves the file exactly as it was found.
 */
import type { MsuLayer, MsuPackManifest, MsuSoundDef, SoundChannel } from '@shared/types/msu-manifest';

const soundDefsOfChannel = (manifest: MsuPackManifest, channel: SoundChannel): MsuSoundDef[] =>
  manifest.sounds?.[channel] ?? [];

const layersOfSound = (
  manifest: MsuPackManifest, channel: SoundChannel, soundId: number,
): MsuLayer[] =>
  soundDefsOfChannel(manifest, channel).find((sound) => sound.soundId === soundId)?.layers ?? [];

/** One channel's list replaced, with every other channel copied across as it stands. */
const withChannelDefs = (
  manifest: MsuPackManifest, channel: SoundChannel, defs: MsuSoundDef[],
): MsuPackManifest => {
  const next: Partial<Record<SoundChannel, MsuSoundDef[]>> = {};
  for (const [name, existing] of Object.entries(manifest.sounds ?? {})) {
    if (name !== channel && existing.length > 0) next[name as SoundChannel] = existing;
  }
  if (defs.length > 0) next[channel] = defs;
  // `undefined` serializes away, which is what an authoring-nothing pack should look like.
  return { ...manifest, sounds: Object.keys(next).length > 0 ? next : undefined };
};

/**
 * The manifest with one sound's layers replaced, inserting the sound when it is new. The rest of
 * the definition is carried, not rebuilt — a layer save must never eat the sound's other fields.
 */
const withSoundLayers = (
  manifest: MsuPackManifest, channel: SoundChannel, soundId: number, layers: MsuLayer[],
): MsuPackManifest => {
  const defs = soundDefsOfChannel(manifest, channel);
  const existing = defs.find((sound) => sound.soundId === soundId);
  const replaced: MsuSoundDef = { ...existing, soundId, layers };
  const next = existing
    ? defs.map((sound) => (sound.soundId === soundId ? replaced : sound))
    : [...defs, replaced].sort((a, b) => a.soundId - b.soundId);
  return withChannelDefs(manifest, channel, next);
};

/** The saved continuity group of one sound, or undefined for none or an unclaimed id. */
const syncGroupOf = (
  manifest: MsuPackManifest, channel: SoundChannel, soundId: number,
): string | undefined =>
  soundDefsOfChannel(manifest, channel).find((sound) => sound.soundId === soundId)?.syncGroup;

/**
 * The manifest with one sound's continuity group set or cleared. Only a claimed sound can carry
 * one — with no definition there is nothing to hand playback across from.
 */
const withSoundGroup = (
  manifest: MsuPackManifest, channel: SoundChannel, soundId: number, group: string | undefined,
): MsuPackManifest => {
  const defs = soundDefsOfChannel(manifest, channel);
  if (!defs.some((sound) => sound.soundId === soundId)) return manifest;
  const next = defs.map((sound) => (sound.soundId === soundId
    ? { ...sound, syncGroup: group === '' ? undefined : group }
    : sound));
  return withChannelDefs(manifest, channel, next);
};

/** The manifest with one sound un-claimed, so the chip plays it again. */
const withoutSound = (
  manifest: MsuPackManifest, channel: SoundChannel, soundId: number,
): MsuPackManifest => withChannelDefs(
  manifest,
  channel,
  soundDefsOfChannel(manifest, channel).filter((sound) => sound.soundId !== soundId),
);

/**
 * What the preview engine is handed: the one sound asked for, on its own channel, and no music
 * at all — an audition should decode a bonk, not the pack's whole soundtrack.
 */
const singleSoundManifest = (
  manifest: MsuPackManifest, channel: SoundChannel, soundId: number,
): MsuPackManifest => ({
  ...manifest,
  tracks: [],
  sounds: {
    [channel]: soundDefsOfChannel(manifest, channel).filter((sound) => sound.soundId === soundId),
  },
});

export {
  soundDefsOfChannel, layersOfSound, syncGroupOf, withChannelDefs, withSoundLayers, withSoundGroup, withoutSound,
  singleSoundManifest,
};

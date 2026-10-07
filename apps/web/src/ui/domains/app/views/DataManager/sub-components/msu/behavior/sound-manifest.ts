/* @layer renderer-components @kind logic */
/**
 * A manifest is written WHOLE, so every function here touches one channel and copies the rest
 * forward. An empty channel is removed and an empty `sounds` key dropped, so claim-then-unclaim
 * leaves the file as it was found.
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

/** One sound's layers replaced (inserted when new). The rest of the definition is carried, not rebuilt. */
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

/** One sound's continuity group set or cleared. Only a claimed sound can carry one. */
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

/** What the preview engine is handed: the one sound asked for and no music, so only that decodes. */
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

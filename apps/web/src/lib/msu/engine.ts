/* @layer renderer-lib @kind logic */
/**
 * The single entry point for replacement audio. Everything above it (the bridge, the widget,
 * the pack previewer) talks to this and never touches an audio node directly.
 *
 * Four channels: music and the ambient bed replace what is playing when a new id arrives; the
 * two effect channels layer each trigger over the last. See `channel.ts` for that split.
 *
 * Gain chain, outermost last: per-layer volume → the game's own fades → the volume group
 * (music/ambient follow the music slider, effects follow the SFX one) → the shared output.
 * Keeping the stages separate means a fade cannot clobber a user setting and vice versa.
 */
import type { MsuPackManifest, MsuResumeState } from '@shared/types/msu-manifest';
import { remapDeluxeTrack } from '@shared/game/data/msu-deluxe-remap';
import { buildChannels } from './build-channels';
import type { ChannelReport, MsuChannelName } from './channel';
import { SOUND_CHANNELS } from './sound-claim';
import type { LayerReport } from './channel';
import type { LoadBytes } from './track-loader';
import { applyFade, isFadeControl } from './fade';
import { createTitleReset } from './title-reset';

interface MsuEngineOptions {
  ctx: BaseAudioContext;
  destination: AudioNode;
  manifest: MsuPackManifest;
  loadBytes: LoadBytes;
  /** Whether to apply the extended per-area/per-entrance track remapping. */
  isDeluxe: boolean;
  /** Current music volume, 0-100. Read on each change so a live slider applies at once. */
  musicVolume: () => number;
  /**
   * Current SFX volume, 0-100. Replacement effects are effects, so they follow that slider
   * rather than the music one. Omitted (previewing a single track) means "the music volume".
   */
  sfxVolume?: () => number;
  /** The ambient bed's own slider; falls back to the music one where the setting is absent. */
  ambientVolume?: () => number;
  /**
   * Whether re-entering an area picks its music up where it left off. Read per track change
   * rather than captured, so toggling the setting mid-session takes effect immediately.
   * Omitted for one-off uses like previewing a track, which should always start clean.
   */
  resumeEnabled?: () => boolean;
  /**
   * Whether reaching the title screen forgets those positions again, so the opening plays with
   * its animation and the next run starts its music from the top. Read per event, same as above.
   */
  resetAtTitle?: () => boolean;
  onError?: (message: string) => void;
  /** Reported when a return to the title actually dropped something. */
  onReset?: () => void;
  /** Reports each track that starts, for diagnostics — how many layers actually decoded. */
  onTrack?: (trackNum: number, layerCount: number, resumed: boolean) => void;
  /** The same, for the ambient bed. Effects are far too frequent to report one at a time. */
  onAmbient?: (soundId: number, layerCount: number, resumed: boolean) => void;
}

/** The music channel's live state, in the shape the studio's preview has always read. */
interface TrackReport {
  trackNum: number;
  elapsedSeconds: number;
  layers: LayerReport[];
}

const createMsuEngine = (options: MsuEngineOptions) => {
  const {
    ctx, destination, manifest, loadBytes, isDeluxe,
    musicVolume, sfxVolume, ambientVolume, resumeEnabled, resetAtTitle, onError, onReset,
    onTrack, onAmbient,
  } = options;

  const readSfxVolume = sfxVolume ?? musicVolume;
  // The bed is its own group: it is neither music nor a one-shot, and the reason the setting
  // exists is to hold a storm under a quiet piece without touching either slider.
  const readAmbientVolume = ambientVolume ?? musicVolume;
  const musicGain = ctx.createGain();
  const ambientGain = ctx.createGain();
  const sfxGain = ctx.createGain();
  musicGain.connect(destination);
  ambientGain.connect(destination);
  sfxGain.connect(destination);
  musicGain.gain.value = musicVolume() / 100;
  ambientGain.gain.value = readAmbientVolume() / 100;
  sfxGain.gain.value = readSfxVolume() / 100;

  const channels = buildChannels({
    ctx, musicOut: musicGain, ambientOut: ambientGain, sfxOut: sfxGain, manifest, loadBytes,
    resumeEnabled, onError, onTrack, onAmbient,
  });
  const music = channels.music;
  const ambient = channels.ambient;
  const all = [music, ambient, channels.sfx1, channels.sfx2];
  const titleReset = createTitleReset(channels, resetAtTitle, onReset);

  /**
   * The game's music-control byte. Values below 0xf0 select a track (0 = silence), 0xf1..0xf3
   * are volume transitions, and anything else in the 0xf0 range only concerns the sound chip.
   */
  // Whether the music has been faded to silence and not brought back. Part of the "is playing"
  // answer below: a faded track is still active in the graph, but telling the game it is playing
  // would make it skip the re-select that is the only thing that brings the sound back.
  let fadedToZero = false;

  const onMusicCtrl = (ctrl: number, module: number, entrance: number, overworldArea: number): void => {
    // Ahead of the select below, so the track this event starts is the one that begins fresh.
    titleReset(module);
    if (isFadeControl(ctrl)) {
      if (ctrl === 0xf1) fadedToZero = true;
      if (ctrl === 0xf3) fadedToZero = false;
      applyFade(music.fadeNode, ctx.currentTime, ctrl);
      return;
    }
    if ((ctrl & 0xf0) === 0xf0) return;
    fadedToZero = false;
    music.trigger(isDeluxe ? remapDeluxeTrack(ctrl, { overworldArea, entrance }) : ctrl);
  };

  /**
   * The game's "is this track playing" question, answered the way this engine plays it: the
   * track is remapped first, so two areas sharing one vanilla byte compare as different music
   * where the pack gives them different tracks — which is what makes the music change at plain
   * screen edges. Audibility counts: a track faded to silence answers no, so the re-select that
   * follows a fade is never skipped.
   */
  const isPlayingTrack = (ctrl: number, entrance: number, overworldArea: number): boolean => {
    if (fadedToZero) return false;
    const target = isDeluxe ? remapDeluxeTrack(ctrl, { overworldArea, entrance }) : ctrl;
    return music.report()?.id === target;
  };

  /**
   * A sound the core has handed over, on the channel index it reports (0 ambient, 1 sfx1,
   * 2 sfx2). Only claimed ids ever arrive here, so an unknown channel is the only thing to
   * guard: an id with no program is the channel's own business.
   */
  const onGameSound = (channel: number, id: number, pan: number): void => {
    const name = SOUND_CHANNELS[channel];
    if (!name) return;
    channels[name].trigger(id, pan);
  };

  const syncVolume = (): void => {
    musicGain.gain.value = musicVolume() / 100;
    ambientGain.gain.value = readAmbientVolume() / 100;
    sfxGain.gain.value = readSfxVolume() / 100;
  };

  /**
   * Live positions for a save's metadata: the music, plus the bed playing alongside it. Effects
   * are deliberately absent — a one-shot has no position to return to.
   */
  const snapshot = (): MsuResumeState | null => {
    const track = music.snapshot();
    if (!track) return null;
    const bed = ambient.snapshot();
    return {
      trackNum: track.id,
      layers: track.layers,
      ambient: bed ? { soundId: bed.id, layers: bed.layers } : null,
    };
  };

  /** What every layer of the playing track is doing right now. */
  const report = (): TrackReport | null => {
    const state = music.report();
    if (!state) return null;
    return { trackNum: state.id, elapsedSeconds: state.elapsedSeconds, layers: state.layers };
  };

  /** The same, for any channel — how the studio watches the beds and the effects. */
  const reportChannel = (name: MsuChannelName): ChannelReport | null => channels[name].report();

  /** Resume the audio a loaded save was playing. */
  const restore = (state: MsuResumeState | null): void => {
    music.restore(state ? { id: state.trackNum, layers: state.layers } : null);
    // `undefined` is a snapshot taken before beds were resumable: it says nothing about the
    // ambient channel, so leave it alone rather than silencing a bed the core just re-announced.
    // `null` is a save that genuinely had none.
    if (state?.ambient === undefined) return;
    ambient.restore(state.ambient ? { id: state.ambient.soundId, layers: state.ambient.layers } : null);
  };

  const stop = (): void => { all.forEach((channel) => channel.stop()); };

  const dispose = (): void => {
    all.forEach((channel) => channel.dispose());
    musicGain.disconnect();
    sfxGain.disconnect();
  };

  return { onMusicCtrl, onGameSound, isPlayingTrack, syncVolume, snapshot, report, reportChannel, restore, stop, dispose };
};

type MsuEngine = ReturnType<typeof createMsuEngine>;

export { createMsuEngine };
export type { MsuEngine, MsuEngineOptions, TrackReport, LayerReport, ChannelReport, MsuChannelName };

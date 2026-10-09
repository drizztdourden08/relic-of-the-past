/* @layer renderer-lib @kind logic */
import type { MsuResumeState } from '@rotp/game-data';
import { remapDeluxeTrack } from '@rotp/game-data';
import { buildChannels } from './build-channels';
import type { ChannelReport, MsuChannelName } from './channel';
import { SOUND_CHANNELS } from './sound-claim';
import { applyFade, isFadeControl, MUSIC_FADE_OUT, MUSIC_FULL_VOLUME } from './fade';
import { createTitleReset } from './title-reset';
import type { MsuEngineOptions, TrackReport } from './engine.type';
import { CHIP_ONLY_CONTROL_MASK } from './engine.constants';

const createMsuEngine = (options: MsuEngineOptions) => {
  const {
    ctx, destination, manifest, loadBytes, isDeluxe,
    musicVolume, sfxVolume, ambientVolume, resumeEnabled, resetAtTitle, onError, onReset,
    onTrack, onAmbient,
  } = options;

  const readSfxVolume = sfxVolume ?? musicVolume;
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

  let fadedToZero = false;

  const targetTrack = (ctrl: number, entrance: number, overworldArea: number): number =>
    (isDeluxe ? remapDeluxeTrack(ctrl, { overworldArea, entrance }) : ctrl);

  const onMusicCtrl = (ctrl: number, module: number, entrance: number, overworldArea: number): void => {
    titleReset(module);
    if (isFadeControl(ctrl)) {
      if (ctrl === MUSIC_FADE_OUT) fadedToZero = true;
      if (ctrl === MUSIC_FULL_VOLUME) fadedToZero = false;
      applyFade(music.fadeNode, ctx.currentTime, ctrl);
      return;
    }
    if ((ctrl & CHIP_ONLY_CONTROL_MASK) === CHIP_ONLY_CONTROL_MASK) return;
    fadedToZero = false;
    music.trigger(targetTrack(ctrl, entrance, overworldArea));
  };

  const isPlayingTrack = (ctrl: number, entrance: number, overworldArea: number): boolean => {
    if (fadedToZero) return false;
    return music.report()?.id === targetTrack(ctrl, entrance, overworldArea);
  };

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

  const report = (): TrackReport | null => {
    const state = music.report();
    if (!state) return null;
    return { trackNum: state.id, elapsedSeconds: state.elapsedSeconds, layers: state.layers };
  };

  const reportChannel = (name: MsuChannelName): ChannelReport | null => channels[name].report();

  const restore = (state: MsuResumeState | null): void => {
    music.restore(state ? { id: state.trackNum, layers: state.layers } : null);
    const savedBeforeBedsResumed = state?.ambient === undefined;
    if (savedBeforeBedsResumed) return;
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

export { createMsuEngine };
export type { MsuEngine, MsuEngineOptions, TrackReport } from './engine.type';
export type { LayerReport, ChannelReport, MsuChannelName } from './channel';

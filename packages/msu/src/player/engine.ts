/* @layer renderer-lib @kind logic */
import type { MsuResumeState } from '@rotp/game-data';
import { remapDeluxeTrack } from '@rotp/game-data';
import { buildChannels } from './build-channels';
import type { ChannelReport, MsuChannelName } from './channel';
import { SOUND_CHANNELS } from './sound-claim';
import { applyFade, isFadeControl, MUSIC_FADE_OUT, MUSIC_FULL_VOLUME } from './fade';
import { createTitleReset } from './title-reset';
import { createEngineGains } from './engine-parts/create-engine-gains';
import { reportTrack } from './engine-parts/report-track';
import { restoreMsu } from './engine-parts/restore-msu';
import { snapshotMsu } from './engine-parts/snapshot-msu';
import type { MsuEngineOptions } from './engine.type';
import { CHIP_ONLY_CONTROL_MASK } from './engine.constants';

const createMsuEngine = (options: MsuEngineOptions) => {
  const {
    ctx, destination, manifest, loadBytes, isDeluxe,
    musicVolume, sfxVolume, ambientVolume, resumeEnabled, resetAtTitle, onError, onReset,
    onTrack, onAmbient,
  } = options;

  const gains = createEngineGains(ctx, destination, {
    music: musicVolume, ambient: ambientVolume ?? musicVolume, sfx: sfxVolume ?? musicVolume,
  });

  const channels = buildChannels({
    ctx, musicOut: gains.musicGain, ambientOut: gains.ambientGain, sfxOut: gains.sfxGain, manifest, loadBytes,
    resumeEnabled, onError, onTrack, onAmbient,
  });
  const { music, ambient } = channels;
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

  const reportChannel = (name: MsuChannelName): ChannelReport | null => channels[name].report();

  const stop = (): void => { all.forEach((channel) => channel.stop()); };

  const dispose = (): void => {
    all.forEach((channel) => channel.dispose());
    gains.disconnect();
  };

  return {
    onMusicCtrl,
    onGameSound,
    isPlayingTrack,
    syncVolume: gains.sync,
    snapshot: () => snapshotMsu(music, ambient),
    report: () => reportTrack(music),
    reportChannel,
    restore: (state: MsuResumeState | null) => restoreMsu(music, ambient, state),
    stop,
    dispose,
  };
};

export { createMsuEngine };
export type { MsuEngine } from './engine.type';
export type { LayerReport, ChannelReport, MsuChannelName } from './channel';

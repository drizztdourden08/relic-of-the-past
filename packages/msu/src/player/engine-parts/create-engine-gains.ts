/* @layer renderer-lib @kind logic */
import type { EngineGains, EngineVolumes } from './engine-parts.type';

const createEngineGains = (ctx: BaseAudioContext, destination: AudioNode, volumes: EngineVolumes): EngineGains => {
  const musicGain = ctx.createGain();
  const ambientGain = ctx.createGain();
  const sfxGain = ctx.createGain();
  musicGain.connect(destination);
  ambientGain.connect(destination);
  sfxGain.connect(destination);

  const sync = (): void => {
    musicGain.gain.value = volumes.music() / 100;
    ambientGain.gain.value = volumes.ambient() / 100;
    sfxGain.gain.value = volumes.sfx() / 100;
  };
  sync();

  const disconnect = (): void => {
    musicGain.disconnect();
    sfxGain.disconnect();
  };

  return { musicGain, ambientGain, sfxGain, sync, disconnect };
};

export { createEngineGains };

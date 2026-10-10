/* @layer renderer-lib @kind logic */
import type { ResolvedLayer } from './layer-window.type';

const bufferAt = (resolved: ResolvedLayer, index: number): AudioBuffer => {
  const buffer = resolved.buffers[index];
  if (buffer === undefined) throw new Error(`Layer ${String(resolved.index)} has no buffer ${String(index)}`);
  return buffer;
};

export { bufferAt };

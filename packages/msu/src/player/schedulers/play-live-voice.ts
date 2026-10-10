/* @layer renderer-lib @kind logic */
import type { LayerContext, LiveVoice } from './scheduler.type';

const playLiveVoice = (
  ctx: LayerContext, fileIndex: number, onEnded: (entry: LiveVoice | null) => void,
): LiveVoice => {
  let entry: LiveVoice | null = null;
  const voice = ctx.play(fileIndex, { loop: false, onEnded: () => { onEnded(entry); } });
  entry = { voice, fileIndex };
  return entry;
};

export { playLiveVoice };

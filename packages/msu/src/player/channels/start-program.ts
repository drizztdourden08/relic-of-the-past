/* @layer renderer-lib @kind logic */
import { startLayers } from './active-layers';
import type { ActiveProgram, StartProgramParams } from './stateful-channel.type';

const startProgram = async (params: StartProgramParams): Promise<ActiveProgram | null> => {
  const { ctx, name, fadeGain, loader, program, resume, isCurrent } = params;
  const loaded = await loader.load(program.id, program.layers);
  const supersededWhileDecoding = !isCurrent();
  if (supersededWhileDecoding) return null;

  const startedAt = ctx.currentTime;
  const layers = startLayers({
    ctx,
    channel: name,
    destination: fadeGain,
    program,
    loaded,
    elapsedSeconds: () => ctx.currentTime - startedAt,
    resumeFor: (layer) => resume?.layers[layer.id] ?? null,
  });
  return { id: program.id, startedAt, layers };
};

export { startProgram };

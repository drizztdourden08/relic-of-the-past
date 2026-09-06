/* @layer renderer-lib @kind logic */
/**
 * A channel where every trigger LAYERS over what is already sounding, as the two effect channels do.
 *
 * Each trigger spawns its own set of voices and its own gain path, so ten hits in a row are ten
 * overlapping sounds. Reusing the stateful behavior here (stop the previous, start the next)
 * would make rapid-fire effects clip each other off mid-sample, which is the specific bug this
 * kind exists to avoid.
 *
 * Nothing here is resumable: a save has no meaningful "half a bonk" to return to.
 */
import { createTrackLoader } from '../track-loader';
import { layerReports, layersFinished, startLayers, stopLayers } from './active-layers';
import type { ActiveLayer, ChannelOptions, ChannelReport, SoundChannelApi } from './channel.type';
import { createTriggerPool } from './trigger-pool';

/**
 * How many trigger sets one channel may have sounding at once. Generous on purpose, since the sound
 * chip itself only had eight voices for everything, so a legitimate pack never comes close.
 * The cap exists for the pathological case: a long file authored onto a rapid-fire id would
 * otherwise stack a new set every frame until the audio graph buckles.
 */
const MAX_LIVE_TRIGGERS = 16;

/** The game's two pan bits, as they arrive on the channel write. */
const PAN_LEFT = 0x80;
const PAN_RIGHT = 0x40;

interface LiveSet {
  id: number;
  startedAt: number;
  layers: ActiveLayer[];
  /** The node this set feeds, either a panner of its own or the channel gain when centred. */
  out: AudioNode;
}

/** A panner for an off-centre trigger; the channel gain itself when centred or unsupported. */
const panTo = (ctx: BaseAudioContext, destination: AudioNode, pan: number): AudioNode => {
  if (pan !== PAN_LEFT && pan !== PAN_RIGHT) return destination;
  if (typeof ctx.createStereoPanner !== 'function') return destination;
  const panner = ctx.createStereoPanner();
  panner.pan.value = pan === PAN_LEFT ? -1 : 1;
  panner.connect(destination);
  return panner;
};

const createAdditiveChannel = (options: ChannelOptions): SoundChannelApi => {
  const { ctx, destination, name, programs, loadBytes, cacheLimit, onError, onStart } = options;

  const fadeGain = ctx.createGain();
  fadeGain.connect(destination);

  const loader = createTrackLoader(ctx, loadBytes, onError, cacheLimit);
  const byId = new Map(programs.map((program) => [program.id, program]));
  const pool = createTriggerPool();

  let sets: LiveSet[] = [];
  let lastId = 0;
  // Only a stop bumps this: it exists so a decode still in flight cannot spawn after teardown.
  let generation = 0;

  const release = (set: LiveSet): void => {
    stopLayers(set.layers);
    if (set.out !== fadeGain) set.out.disconnect();
  };

  /** Sweep sets that have played out, so the cap counts what is audible and nodes are released. */
  const prune = (): void => {
    const finished = sets.filter((set) => layersFinished(set.layers));
    if (finished.length === 0) return;
    finished.forEach(release);
    sets = sets.filter((set) => !finished.includes(set));
  };

  const spawn = async (id: number, pan: number): Promise<void> => {
    const mine = generation;
    const program = byId.get(id);
    if (!program) return;

    const loaded = await loader.load(id, program.layers);
    if (mine !== generation || loaded.length === 0) return; // stopped while decoding

    prune();
    const out = panTo(ctx, fadeGain, pan);
    const startedAt = ctx.currentTime;
    const layers = startLayers({
      ctx,
      channel: name,
      destination: out,
      program,
      loaded,
      elapsedSeconds: () => ctx.currentTime - startedAt,
      resumeFor: (layer, fileCount) => pool.pick(layer, fileCount),
    });

    sets.push({ id, startedAt, layers, out });
    // Oldest first: the newest trigger is the one the player just caused and must be heard.
    while (sets.length > MAX_LIVE_TRIGGERS) {
      const oldest = sets.shift();
      if (oldest) release(oldest);
    }
    onStart?.(id, layers.length, false);
  };

  const trigger = (id: number, pan = 0): void => {
    if (!byId.has(id)) return;
    lastId = id;
    void spawn(id, pan);
  };

  const stop = (): void => {
    generation += 1;
    sets.forEach(release);
    sets = [];
  };

  /** The newest set is the one to describe: it is the sound that just landed. */
  const report = (): ChannelReport | null => {
    prune();
    const newest = sets[sets.length - 1];
    if (!newest) return null;
    return {
      channel: name,
      kind: 'additive',
      id: newest.id,
      elapsedSeconds: ctx.currentTime - newest.startedAt,
      layers: layerReports(newest.layers),
      setCount: sets.length,
      voiceCap: MAX_LIVE_TRIGGERS,
    };
  };

  const dispose = (): void => {
    stop();
    loader.clear();
    fadeGain.disconnect();
  };

  return {
    kind: 'additive',
    fadeNode: fadeGain,
    trigger,
    activeId: () => (sets.length > 0 ? lastId : null),
    // Effects are deliberately not part of a save's audio position.
    snapshot: () => null,
    restore: () => {},
    // Nothing is remembered here, so there is never anything to forget.
    forget: () => {},
    report,
    stop,
    dispose,
  };
};

export { createAdditiveChannel, MAX_LIVE_TRIGGERS };

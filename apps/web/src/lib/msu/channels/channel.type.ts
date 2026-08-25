/* @layer renderer-lib @kind types */
/**
 * The seam between the engine and one sound-chip channel.
 *
 * The game has four things the app can replace — music, the ambient bed, and two effect
 * channels — and they split into exactly two behaviors, which is what `ChannelKind` names.
 * Everything else about them (layers, play modes, volumes, reporting) is identical, so they
 * share one interface and the engine never branches on which channel it is holding.
 */
import type { LayerResume, MsuLayer, SoundChannel } from '@shared/types/msu-manifest';
import type { EffectChain } from '../layer-effects';
import type { LayerActivity, LayerScheduler } from '../schedulers/scheduler.type';
import type { LoadBytes } from '../track-loader';

/** Every channel the engine drives: the music slot plus the three sound-chip channels. */
type MsuChannelName = 'music' | SoundChannel;

/**
 * How a channel treats a new id.
 *
 * `stateful` (music, ambient) — the new id REPLACES what is sounding, and what it replaced had
 * a position worth resuming later.
 *
 * `additive` (sfx1, sfx2) — the new id LAYERS another set of voices over whatever is already
 * sounding, so ten triggers in a row are ten overlapping sounds. There is nothing to resume,
 * and stopping the previous set would make rapid effects cut each other off.
 */
type ChannelKind = 'stateful' | 'additive';

/**
 * One playable id, reduced to what a music track and a claimed sound both carry. Keeping the
 * two shapes apart all the way down would duplicate every channel for no behavioral difference.
 */
interface SoundProgram {
  id: number;
  layers: MsuLayer[];
  /** Programs sharing a group hand playback across on a switch — see MsuSoundDef.syncGroup. */
  group?: string;
}

/** One layer of a sounding program: its scheduler and the gain node that scheduler feeds. */
interface ActiveLayer {
  layerId: string;
  layerName: string;
  modeKind: string;
  scheduler: LayerScheduler;
  gain: GainNode;
  /** The layer's effects, between its gain and the channel; empty is a pass-through. */
  effects: EffectChain;
}

/** One layer's live state, for the studio's preview readout. */
interface LayerReport extends LayerActivity {
  layerId: string;
  layerName: string;
  modeKind: string;
}

/** A stateful channel's position — what music's resume map and the ambient snapshot both hold. */
interface ChannelResume {
  id: number;
  layers: Record<string, LayerResume>;
}

/** Everything the studio needs to draw one channel's live state. */
interface ChannelReport {
  channel: MsuChannelName;
  kind: ChannelKind;
  /** The sounding id for a stateful channel; the most recent trigger for an additive one. */
  id: number;
  elapsedSeconds: number;
  layers: LayerReport[];
  /** How many trigger sets are sounding at once — always 1 for a stateful channel. */
  setCount: number;
  /** The ceiling `setCount` is held under, or null when the kind has no ceiling. */
  voiceCap: number | null;
}

interface ChannelOptions {
  ctx: BaseAudioContext;
  /** Where this channel's audio goes: the gain node for its volume group. */
  destination: AudioNode;
  name: MsuChannelName;
  kind: ChannelKind;
  programs: SoundProgram[];
  loadBytes: LoadBytes;
  /** How many decoded programs to keep; effects are small enough to keep many more than music. */
  cacheLimit?: number;
  /**
   * Whether re-selecting an id picks it up where it left off. Read per selection rather than
   * captured, so toggling the setting mid-session takes effect immediately. Stateful only.
   */
  resumeEnabled?: () => boolean;
  /**
   * Whether selecting the id already playing starts it again. Off, a repeat is a no-op — the
   * chip's own behaviour for a port rewritten with the value it holds, and what the ambient bed
   * needs. On, it restarts, which is what music needs after a fade to zero. Stateful only.
   */
  restartOnRepeat?: boolean;
  onError?: (message: string) => void;
  /** Reports each id that starts, for diagnostics — how many layers actually decoded. */
  onStart?: (id: number, layerCount: number, resumed: boolean) => void;
}

interface SoundChannelApi {
  kind: ChannelKind;
  /**
   * The gain node the game's own volume transitions act on. Only the music channel is ever sent
   * one; the others hold it at full so every channel has the same three-stage gain chain.
   */
  fadeNode: GainNode;
  /**
   * Play an id. `pan` is the game's two pan bits (0 centre, 0x80 left, 0x40 right) and is
   * honored by additive channels only — a bed re-panned mid-loop would need its graph rebuilt,
   * and music never carries pan at all.
   */
  trigger: (id: number, pan?: number) => void;
  /** The sounding id, or the last one triggered for an additive channel. Null when silent. */
  activeId: () => number | null;
  /** Live position, safe to read while playback continues. Always null for an additive channel. */
  snapshot: () => ChannelResume | null;
  /** Pick playback up from a snapshot. A no-op on an additive channel: effects are not resumed. */
  restore: (state: ChannelResume | null) => void;
  report: () => ChannelReport | null;
  stop: () => void;
  dispose: () => void;
}

export type {
  MsuChannelName, ChannelKind, SoundProgram, ActiveLayer, LayerReport,
  ChannelResume, ChannelReport, ChannelOptions, SoundChannelApi,
};

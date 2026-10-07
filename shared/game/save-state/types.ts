/* @layer shared-game @kind types */
/**
 * Save state identity: what a build declares about the format it reads, what a .sav
 * records about the build that wrote it, and the verdicts drawn from comparing them.
 */

/**
 * A format the project has shipped. The id comes from the generated module; a row here
 * is the human-readable half, saying what moved and from which version. The release gate
 * refuses to publish an id with no row, which is the only reason this table exists.
 */
interface KnownFormat {
  id: string;
  /** First app version that shipped this format. */
  since: string;
  /** What changed in the layout. One sentence. */
  note: string;
}

/** Written into the trailer of every save this build produces. Kept tiny. */
interface StateStamp {
  /** Trailer schema, not the state format. */
  v: 1;
  /** App version that wrote it, e.g. '0.17.1'. */
  app: string;
  formatId: string;
  /** Epoch ms. */
  at: number;
}

/**
 * Whether a version being offered reads the same format this build writes.
 *
 * 'unverifiable' is a first-class answer instead of an optimistic 'compatible'. A
 * target that published nothing, or that could not be reached, is unknown, and
 * saying otherwise is how save states get lost silently.
 */
type TargetCompat =
  | { kind: 'compatible' }
  | { kind: 'incompatible'; targetId: string }
  | { kind: 'unverifiable'; why: 'not-published' | 'unreachable' };

/** Whether a file on disk can be handed to the core. */
type Loadability =
  | { ok: true; stamp: StateStamp | null }
  | { ok: false; stamp: StateStamp | null; reason: 'format-mismatch' | 'not-a-state'; message: string };

export type { KnownFormat, Loadability, StateStamp, TargetCompat };

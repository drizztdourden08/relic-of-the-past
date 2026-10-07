/* @layer shared-game @kind types */
/**
 * Types for the reference randomizer's option catalog: the full, transcribed
 * option surface shown (mostly frozen) in the profile-creation UI, plus the
 * snapshot shape stored on a profile's randomizer config.
 */

import type { OptionDetail } from './option-description.type';

type ApOptionKind = 'choice' | 'range' | 'toggle' | 'text';

/**
 * Honest audit of what this app's generation engine does with the option:
 * 'active': the engine varies or enforces the shown value;
 * 'vanilla-fixed': a real gameplay option pinned to its vanilla/off value,
 *   and the engine actually produces that behavior;
 * 'not-implemented': the feature does not exist in this engine at all (the
 *   shown value is the off/vanilla value, so nothing is promised);
 * 'not-applicable': the option asks a question this app never asks, so no
 *   value of it could mean anything here.
 *
 * A row whose capability this app offers under a control of its own is not in
 * the catalog at all, because the question is asked once, by the control that answers
 * it, so there is no class for a superseded row to carry.
 */
type ApOptionImplementation = 'active' | 'vanilla-fixed' | 'not-implemented' | 'not-applicable';

type ApOptionValue = string | number | boolean;

/** Re-exported so a catalog consumer never has to know which file the shape lives in. */
type ApOptionDetail = OptionDetail;

interface ApOptionChoice {
  /** Canonical option key, as spelled by the source (e.g. 'no_glitches'). */
  value: string;
  /** Humanized label shown in the UI. */
  label: string;
  /** The source's numeric value for this choice ('random' stays a string). */
  apValue: number | string;
}

interface ApOptionRange {
  min: number;
  max: number;
}

type ApOptionGroupId =
  | 'scope'
  | 'world'
  | 'goal'
  | 'dungeon-items'
  | 'items'
  | 'shops'
  | 'enemies'
  | 'timers'
  /** Rows about a session shared with other players, not about the seed's own shape. */
  | 'session'
  | 'other';

interface ApOptionGroup {
  id: ApOptionGroupId;
  label: string;
}

interface ApOptionDef {
  /** Source option name (dataclass field), used as the snapshot key. */
  key: string;
  displayName: string;
  group: ApOptionGroupId;
  kind: ApOptionKind;
  choices?: readonly ApOptionChoice[];
  range?: ApOptionRange;
  /**
   * The whole description as one string: the plain reading a caption, a
   * tooltip or a screen reader gets. Derived from the description entry, so a
   * listed one arrives here already flattened to "term: detail" per line.
   * Empty when the label already says everything the row does.
   */
  description: string;
  /** The same description as lines, when it was written as a list. */
  details?: readonly OptionDetail[];
  /** What this app's engine actually does with the option, see the type doc. */
  implementation: ApOptionImplementation;
  /** The source project's own default for this option. */
  apDefault: ApOptionValue;
  /** The value THIS app hard-sets (equals apDefault unless overridden). */
  baseline: ApOptionValue;
  /** True for every option the player may not change at creation time. */
  locked: boolean;
  /** True for options this app defines itself, not part of the source set. */
  synthetic?: boolean;
}

/**
 * The frozen option snapshot recorded on a profile at creation time. v2
 * carries the 22 per-family capacity rows; the v1 schema (one capacity
 * toggle) is adapted on read by normalizeRandomizerOptions.
 */
interface RandomizerOptionsSnapshot {
  schema: 'ap-options-v2';
  values: Record<string, ApOptionValue>;
}

export type {
  ApOptionChoice,
  ApOptionDef,
  ApOptionDetail,
  ApOptionGroup,
  ApOptionGroupId,
  ApOptionImplementation,
  ApOptionKind,
  ApOptionRange,
  ApOptionValue,
  RandomizerOptionsSnapshot,
};

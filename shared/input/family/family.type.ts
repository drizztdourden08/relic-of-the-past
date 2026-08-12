/* @layer shared-input @kind types */
/**
 * Display-metadata model for the input family layer.
 *
 * This model answers exactly one question: what to SHOW for a control SDL
 * has already reported as present. It never decides whether a control
 * exists; that answer belongs to SDL alone. Every field is keyed by SDL's
 * own positional names, never by an id this layer invents, so a family file
 * can never disagree with the device it describes.
 */

import type { SnesButton } from '../../types/controls';
import type { SdlAxisName, SdlButtonName, SdlGamepadType } from '../sdl-buttons';

// -- SDL's device and positional vocabulary (mirrors the native contract) --

/** The console button union this layer's console defaults point at, reused
 *  from the existing SNES button type rather than redeclared. */
type ConsoleButton = SnesButton;

// -- Display metadata a family (or a single device) can answer with --

interface FamilyMetadata {
  readonly types: readonly SdlGamepadType[];
  readonly brandLogoKey?: string;
  /** Display-only rename of the device's own reported name. Never changes
   *  what the device is or what it can do. */
  readonly deviceName?: (sdlName: string) => string;
  readonly buttonLabels?: Partial<Record<SdlButtonName, string>>;
  readonly axisLabels?: Partial<Record<SdlAxisName, string>>;
  readonly buttonIcons?: Partial<Record<SdlButtonName, string>>;
  readonly axisIcons?: Partial<Record<SdlAxisName, string>>;
  /**
   * Console defaults for applying a preset or drag and drop on the controls
   * screen only. Never consumed by detection, calibration, or the
   * diagnostic; those surfaces show what SDL reports, not a suggestion.
   */
  readonly consoleDefaults?: Partial<Record<SdlButtonName, ConsoleButton>>;
  /**
   * How far a trigger reported as an axis must travel before it also counts
   * as "pressed" for a display that highlights it like a button. Only
   * meaningful for an axis in the 'trigger' category; a digital-only trigger
   * (reported as a plain button, no axis) has no threshold to speak of, since
   * its button state already is the pressed state. Falls back to
   * DEFAULT_TRIGGER_PRESS_THRESHOLD (see live-control-state.ts) when unset.
   */
  readonly triggerPressThreshold?: number;
  /**
   * Maps a 0-1 pattern intensity to the motor magnitude this family should
   * actually play, so a pad can compensate for how strong its own rumble
   * tech feels. Applied to strength only, never to segment duration. Falls
   * back to identity (no adjustment) when unset.
   */
  readonly shapeVibration?: (intensity: number) => number;
  /**
   * Minimum total duration (ms) this family's motor needs to actually spin up
   * and register as a felt pulse. A pattern authored shorter than this is
   * stretched up to it (see shared/input/family/vibration-shaping.ts); it
   * never shortens an already-longer pattern, and never touches intensity.
   * Falls back to 0 (no floor) when unset. A pattern can opt itself out
   * entirely via HapticPatternEntry.minDurationExempt.
   */
  readonly minDurationMs?: number;
}

interface DeviceOverride extends Omit<FamilyMetadata, 'types'> {
  readonly vendorId: string;
  readonly productId: string;
}

// -- Resolved output (what a caller actually renders) --

type ResolvedControlCategory = 'face' | 'shoulder' | 'trigger' | 'dpad' | 'stick' | 'system';

interface ResolvedControl {
  readonly position: SdlButtonName | SdlAxisName;
  readonly kind: 'button' | 'axis';
  readonly label: string;
  readonly icon: string;
  readonly category: ResolvedControlCategory;
  /** Set only for an axis in the 'trigger' category; see
   *  FamilyMetadata.triggerPressThreshold and resolveLiveControlState, which
   *  is what actually turns this into a live pressed boolean. */
  readonly pressThreshold?: number;
}

interface ResolvedDevice {
  readonly deviceKey: string;
  readonly name: string;
  readonly sdlType: SdlGamepadType;
  readonly brandLogoKey: string;
  readonly hasRumble: boolean;
  readonly hasGyro: boolean;
  readonly connection: string;
  readonly controls: readonly ResolvedControl[];
}

export type {ConsoleButton,
  DeviceOverride,
  FamilyMetadata,
  ResolvedControl,
  ResolvedControlCategory,
  ResolvedDevice};

// Re-exported from the single declaration in ../sdl-buttons so callers can
// keep importing the whole model from one place without it being redeclared.
export type { SdlAxisName, SdlButtonName, SdlGamepadType };

/* @layer renderer-components @kind types */
/**
 * What section one takes (§58). It is ENGINE-FREE, not "almost", which is
 * what §56 settled for and what the maintainer sent back:
 *
 * > "THE FUCKING OPTIONS GO BY CONCERNS. NOTHING IN A FUCKING SECTION SHOULD
 * > CHANGE WHEN CLICKING ANY FUCKING OTHER OPTION IN THAT SAME FUCKING SECTION!"
 *
 * Type, gap and overlay are three questions EVERY container answers, so this
 * shape names no engine anywhere: the gap is two axes under both (§57), and the
 * overlay draws a grid's cell boundaries or a flex container's slots from the
 * same toggle and the same guide colour. Pressing Type therefore changes which
 * button is lit and NOTHING else in the section.
 */
import type { Value } from '@shared/types/hud';

type GapAxis = 'x' | 'y';

interface GapCell {
  axis: GapAxis;
  /** The glyph printed in front of the field. `↔` is ALWAYS horizontal and `↕`
   *  ALWAYS vertical, whichever way a flex container happens to flow (§57.1). */
  cap: string;
  /** The accessible name, such as `gap x` or `gap y`. */
  label: string;
  value: Value;
}

/** The overlay piece: a colour and a flag, neither of which knows an engine.
 *  The flag is the EDITOR's (the view store); the colour is the container's. */
interface OverlaySide {
  guide: string;
  onGuide: (color: string) => void;
  overlayOn: boolean;
  onToggleOverlay: () => void;
}

interface LayoutSettingsProps {
  engine: 'flex' | 'grid';
  onSetEngine: (next: string) => void;
  overlay: OverlaySide;
  gap: readonly GapCell[];
  onGap: (axis: GapAxis, next: Value) => void;
  scope: Readonly<Record<string, number>>;
  insideRepeat?: boolean;
}

export type { GapAxis, GapCell, LayoutSettingsProps, OverlaySide };

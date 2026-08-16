/* @layer renderer-components @kind logic */
/**
 * Whether a control fits the row it was put in.
 *
 * Two numbers decide it: what the control takes at its content width, and what
 * the row can show. An option count decides nothing here — four words fit a row
 * that four sentences push straight past the edge of.
 *
 * Pure arithmetic on those two numbers, so the rule is assertable without a
 * browser; reading them off the DOM is the hook's job.
 */

/** Sub-pixel layout rounding is not an overflow, so a hair of slack is allowed. */
const FIT_TOLERANCE = 1;

interface FitProbe {
  /** What the control takes at its content width, whatever the row allows. */
  naturalWidth: number;
  /** What the row can show without anything pushing past its edge. */
  availableWidth: number;
}

const fitsRow = ({ naturalWidth, availableWidth }: FitProbe): boolean =>
  naturalWidth <= availableWidth + FIT_TOLERANCE;

export { FIT_TOLERANCE, fitsRow };
export type { FitProbe };

/* @layer tests @kind constants */
import type { PositionAxis } from '../../../apps/web/src/ui/design-system/primitives/PositionInput';

const GRID: PositionAxis = { min: 0, max: 63 };
const SIGNED: PositionAxis = { min: -8, max: 8 };
const OPEN: PositionAxis = {};

export { GRID, OPEN, SIGNED };

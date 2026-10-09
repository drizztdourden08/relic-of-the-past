/* @layer renderer-components @kind logic */
import { HUD_VARIABLES } from '@shared/hud/data';
import type { FormulaStarter } from './formula-starters.type';

const pairedNames = (): readonly string[] => HUD_VARIABLES
  .map((entry) => entry.name)
  .filter((name) => name.endsWith('_current'))
  .map((name) => name.slice(0, -'_current'.length))
  .filter((stem) => HUD_VARIABLES.some((entry) => entry.name === `${stem}_max`));

const fractionStarters = (): readonly FormulaStarter[] => pairedNames().map((stem) => ({
  title: `${stem} as a fraction of its maximum`,
  expr: `${stem}_current / ${stem}_max`,
  select: `${stem}_current`,
}));

export { fractionStarters };

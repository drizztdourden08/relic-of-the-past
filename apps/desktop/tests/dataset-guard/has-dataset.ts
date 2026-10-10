/* @layer tests @kind helper */
import { all } from '@rotp/game-data';

const hasDataset = (): boolean => all('screen').length > 0;

export { hasDataset };

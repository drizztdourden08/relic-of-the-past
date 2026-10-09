/* @layer shared-game @kind logic */
import type { GridPos } from '../../../navigation/types';
import type { ScreenGridBundle } from '../../types';
import type { Weapon } from '../enemy-reach/enemy-reach.type';
import { findContactPosition } from './find-contact-position';
import { findLineOfFirePosition } from './find-line-of-fire-position';

const findPositionFor = (
  weapon: Weapon,
  target: GridPos,
  reached: boolean[][] | undefined,
  bundle: ScreenGridBundle | undefined,
  collisionTable: number[] | undefined,
): GridPos | undefined =>
  weapon.kind === 'contact'
    ? findContactPosition(target, reached, weapon.travel)
    : findLineOfFirePosition(target, weapon.travel, reached, bundle, collisionTable);

export { findPositionFor };

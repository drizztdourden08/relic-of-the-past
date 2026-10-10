/* @layer shared-game @kind logic */
import type { GridPos } from '@rotp/game-core';
import type { FiringScene } from './enemy-reach-geometry.type';
import type { Weapon } from '../enemy-reach/enemy-reach.type';
import { findContactPosition } from './find-contact-position';
import { findLineOfFirePosition } from './find-line-of-fire-position';

const findPositionFor = (weapon: Weapon, target: GridPos, scene: FiringScene): GridPos | undefined =>
  weapon.kind === 'contact'
    ? findContactPosition(target, scene.reached, weapon.travel)
    : findLineOfFirePosition(target, weapon.travel, scene);

export { findPositionFor };

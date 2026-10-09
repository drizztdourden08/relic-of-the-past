/* @layer shared-game @kind logic */
import type { Facing } from '../../data/native-tables/player-pose-atlas';
import type { HeroBeat, HeroRng, HeroSequenceDef, HeroTake } from './hero-idle.type';
import { START_FACING } from './hero-idle.constants';
import { buildFlourishTake } from './build-flourish-take';
import { buildLookTake } from './build-look-take';
import { buildPaceTake } from './build-pace-take';
import { buildSpinTake } from './build-spin-take';
import { buildStillTake } from './build-still-take';
import { buildSwingTake } from './build-swing-take';
import { otherFacing } from './other-facing';
import { pickInt } from './pick-int';

const facingFor = (def: HeroSequenceDef, rng: HeroRng, current: Facing): Facing => {
  if (def.facing === 'toward-viewer') return START_FACING;
  if (def.facing === 'random') return otherFacing(rng, current);
  return current;
};

const lengthFor = (def: HeroSequenceDef, rng: HeroRng): number =>
  def.frames ? pickInt(rng, def.frames[0], def.frames[1]) : 0;

const beatsFor = (def: HeroSequenceDef, rng: HeroRng, facing: Facing): HeroBeat[] => {
  const frames = lengthFor(def, rng);
  if (def.kind === 'still') return buildStillTake(facing, frames);
  if (def.kind === 'look') return buildLookTake(rng, facing, frames);
  if (def.kind === 'pace') return buildPaceTake(rng, facing, frames);
  if (def.kind === 'swing') return buildSwingTake(facing);
  if (def.kind === 'charge-spin') return buildSpinTake(facing);
  return buildFlourishTake(facing);
};

const takeFor = (def: HeroSequenceDef, rng: HeroRng, current: Facing): HeroTake => {
  const facing = facingFor(def, rng, current);
  const beats = beatsFor(def, rng, facing);
  return {
    id: def.id,
    beats,
    frames: beats.reduce((sum, beat) => sum + beat.hold, 0),
    endFacing: beats[beats.length - 1]?.facing ?? facing,
  };
};

export { takeFor };

/* @layer shared-game @kind logic */
import { ROWS_PER_BOX } from '../layout/types';
import type { StructureMode, StructurePolicy } from './types';

const kContinuous: StructurePolicy = {
  mode: 'continuous',
  canOpenLine: () => true,
  cascadesAcrossBlocks: true,
  restartsAtBlock: false,
};

const kBlock: StructurePolicy = {
  mode: 'block',
  canOpenLine: linesInBlock => linesInBlock < ROWS_PER_BOX,
  cascadesAcrossBlocks: false,
  restartsAtBlock: true,
};

const kOff: StructurePolicy = {
  mode: 'off',
  canOpenLine: () => false,
  cascadesAcrossBlocks: false,
  restartsAtBlock: true,
};

const kPolicies: Record<StructureMode, StructurePolicy> = {
  continuous: kContinuous,
  block: kBlock,
  off: kOff,
};

const policyFor = (mode: StructureMode): StructurePolicy => kPolicies[mode];

export { policyFor };

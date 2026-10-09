/* @layer shared-game @kind constants */
import type { RequiredRung } from '../progressive.type';

const REQUIRED_RUNGS: readonly RequiredRung[] = [
  {
    family: 'bow',
    from: 1,
    why: 'the last fight asks for silver arrows, and nothing else can finish it',
  },
  {
    family: 'glove',
    from: 1,
    why: 'the heavy lift is the only way into several places the seed has to be able to reach',
  },
];

export { REQUIRED_RUNGS };

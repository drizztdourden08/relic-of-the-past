/* @layer shared-game @kind logic */
import type { SeedRef } from '../rule-node.type';

const seedRef = (key: string): SeedRef => ({ seed: key });

export { seedRef };

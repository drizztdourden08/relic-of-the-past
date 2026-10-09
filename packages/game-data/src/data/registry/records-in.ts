/* @layer shared-game @kind logic */
import type { RecordModule } from './registry.type';

const recordsIn = <T>(modules: Record<string, unknown>): T[] => {
  const collected: T[] = [];
  for (const module of Object.values(modules)) {
    for (const exported of Object.values(module as RecordModule)) {
      if (Array.isArray(exported)) collected.push(...(exported as T[]));
    }
  }
  return collected;
};

export { recordsIn };

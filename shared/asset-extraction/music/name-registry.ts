/* @layer shared-asset-extraction @kind logic */
/** Tracks compiled music entities by name for cross-referencing. */
import type { Entity } from './compile-types';

class NameRegistry {
  private types = new Map<string, Entity>();

  getOrCreate<T extends Entity>(name: string, type: string, isCreate: boolean): T | null {
    if (name === 'None') return null;

    const existing = this.types.get(name);
    if (existing) {
      if (isCreate) {
        if (existing.defined) throw new Error(`${name} already defined`);
        existing.defined = true;
      }
      return existing as T;
    }

    const entity = {
      type,
      name,
      defined: isCreate,
      ea: null,
      writeAddr: 0,
    } as unknown as T;

    if (name.includes('_0x')) {
      (entity as Entity).ea = parseInt(name.slice(name.indexOf('_0x') + 3), 16);
    }

    this.types.set(name, entity as Entity);
    return entity;
  }

  checkAllDefined(): void {
    for (const [name, entity] of Array.from(this.types)) {
      if (!entity.defined) throw new Error(`Symbol ${name} not defined`);
    }
  }
}

export { NameRegistry };

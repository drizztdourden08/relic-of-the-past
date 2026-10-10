/* @layer shared-asset-extraction @kind logic */
import type { Entity, EntityByType, EntityType } from './compile-types.type';
import { COMPILE_ENTITY_FACTORIES } from './compile-entity.constants';
import { isEntityOf } from './is-entity-of';

const eaOfName = (name: string): number | null =>
  name.includes('_0x') ? parseInt(name.slice(name.indexOf('_0x') + 3), 16) : null;

class NameRegistry {
  private types = new Map<string, Entity>();

  getOrCreate<K extends EntityType>(name: string, type: K, isCreate: boolean): EntityByType[K] | null {
    if (name === 'None') return null;

    const existing = this.types.get(name);
    if (existing) {
      if (!isEntityOf(existing, type)) throw new Error(`${name} is a ${existing.type}, not a ${type}`);
      if (isCreate) {
        if (existing.defined) throw new Error(`${name} already defined`);
        existing.defined = true;
      }
      return existing;
    }

    const entity = COMPILE_ENTITY_FACTORIES[type](name, eaOfName(name), isCreate);
    this.types.set(name, entity);
    return entity;
  }

  checkAllDefined(): void {
    for (const [name, entity] of this.types) {
      if (!entity.defined) throw new Error(`Symbol ${name} not defined`);
    }
  }
}

export { NameRegistry };

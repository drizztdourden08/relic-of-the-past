/* @layer shared-asset-extraction @kind logic */
import type { Entity, EntityByType, EntityType } from './compile-types.type';

const isEntityOf = <K extends EntityType>(entity: Entity, type: K): entity is EntityByType[K] => entity.type === type;

export { isEntityOf };

/* @layer shared-asset-extraction @kind logic */
import type { MusicEntity, MusicEntityByType, MusicEntityType } from './extract-types.type';

const isMusicEntityOf = <K extends MusicEntityType>(entity: MusicEntity, type: K): entity is MusicEntityByType[K] =>
  entity.type === type;

export { isMusicEntityOf };

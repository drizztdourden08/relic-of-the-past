/* @layer renderer-widgets @kind types */
import type { Text } from '@drizztdourden08/brock-core/i18n';
import type { SpriteOf } from '../ItemsTab.type';

type TextOf = (value: Text) => string;

interface SlotArt {
  slot: number;
  sprite: SpriteOf;
}

interface ByValueSpecParams {
  slot: number;
  nameKey: string;
  table: Readonly<Record<number, number>>;
  sprite: SpriteOf;
}

export type { ByValueSpecParams, SlotArt, TextOf };

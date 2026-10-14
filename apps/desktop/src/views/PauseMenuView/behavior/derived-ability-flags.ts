/* @layer renderer-hud @kind logic */
import type { PauseMenuData } from '../../../hooks/hooks.type';
import { BOOK_FLAGS } from './derived-ability-flags.constants';

const derivedAbilityFlags = (data: PauseMenuData): number =>
  data.abilityFlags || (
    (data.gloves > 0 ? 0x80 : 0)
    | ((data.items[14] ?? 0) > 0 ? BOOK_FLAGS : 0)
    | 0x08
    | (data.boots > 0 ? 0x04 : 0)
    | (data.flippers > 0 ? 0x02 : 0)
  );

export { derivedAbilityFlags };

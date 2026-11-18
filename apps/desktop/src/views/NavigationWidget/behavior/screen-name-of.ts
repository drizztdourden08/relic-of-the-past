/* @layer renderer-widgets @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { ScreenRecord } from '@rotp/game-data';

const hexId = (value: number, width: number): string => value.toString(16).toUpperCase().padStart(width, '0');

const screenNameOf = (
  t: I18n['t'], detected: ScreenRecord | null, isIndoors: boolean, roomIndex: number, overworldScreenIndex: number,
): string => detected?.name ?? (isIndoors ? t('views-navigation:name.room', { id: hexId(roomIndex, 4) }) : t('views-navigation:name.screen', { id: hexId(overworldScreenIndex, 2) }));

export { screenNameOf };

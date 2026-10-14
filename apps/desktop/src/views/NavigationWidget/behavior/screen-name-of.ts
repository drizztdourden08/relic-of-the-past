/* @layer renderer-widgets @kind logic */
import type { ScreenRecord } from '@rotp/game-data';

const hexName = (prefix: string, value: number, width: number): string =>
  `${prefix} 0x${value.toString(16).toUpperCase().padStart(width, '0')}`;

const screenNameOf = (
  detected: ScreenRecord | null, isIndoors: boolean, roomIndex: number, overworldScreenIndex: number,
): string => detected?.name ?? (isIndoors ? hexName('Room', roomIndex, 4) : hexName('Screen', overworldScreenIndex, 2));

export { screenNameOf };

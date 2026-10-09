/* @layer renderer-hud @kind logic */
import type { Paint } from '@shared/types/hud';

const flatColor = (paint: Paint): string => (typeof paint === 'string' ? paint : '#000');

export { flatColor };

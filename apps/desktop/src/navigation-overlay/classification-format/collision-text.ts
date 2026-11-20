/* @layer renderer-components @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { TilePassability } from '@rotp/game-core';
import { optionText } from '@rotp/randomizer';

const collisionText = (collision: TilePassability): string => {
  if (collision.type === 'obstacle') return optionText(msg('views-navigation:overlay.collision.obstacle', { req: collision.req }));
  if (collision.type === 'ledge') return optionText(msg('views-navigation:overlay.collision.ledge', { dir: collision.dir }));
  if (collision.type === 'free') return optionText(msg('views-navigation:overlay.collision.free'));
  if (collision.type === 'blocked') return optionText(msg('views-navigation:overlay.collision.blocked'));
  if (collision.type === 'stairs') return optionText(msg('views-navigation:overlay.collision.stairs'));
  if (collision.type === 'pit') return optionText(msg('views-navigation:overlay.collision.pit'));
  return optionText(msg('views-navigation:overlay.collision.water'));
};

export { collisionText };

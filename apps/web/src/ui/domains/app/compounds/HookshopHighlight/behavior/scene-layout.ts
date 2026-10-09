/* @layer renderer-components @kind logic */
import { hookshotCurve, layoutHookshot } from '../../Hookshot';
import type { HookshopParts, HookshopLayout, Point } from '../HookshopHighlight.type';
import { bagEffects } from './bag-effects';
import { nearSideOf } from './near-side-of';
import { placed } from './placed';
import { rightmost } from './rightmost';
import {
  BAG_ANGLE, BOT_ANGLE, BOT_AT, CHAIN_BEND, CHAIN_LENGTH, HEIGHT, HOOKSHOT_ANGLE, MARGIN,
} from './scene-layout.constants';
import { turn } from './turn';

const computeLayout = (parts: HookshopParts): HookshopLayout => {
  const { bot: b, bag: g, stamp: st, sparkle: sp } = parts;
  const bot = placed('bot', BOT_AT[0], BOT_AT[1], b.w, b.h, BOT_ANGLE);
  const botCentre: Point = [bot.left + bot.originX, bot.top + bot.originY];
  const pod = turn([bot.left + b.pod[0], bot.top + b.pod[1]], botCentre, BOT_ANGLE);

  const hookshot = hookshotCurve(pod, HOOKSHOT_ANGLE, CHAIN_LENGTH, CHAIN_BEND);
  const { tip } = layoutHookshot(hookshot);

  const bw = g.w * g.scale, bh = g.h * g.scale;
  const bagOrigin: Point = [bw / 2, bh / 2];
  const catchFromOrigin = turn([g.catch[0] * g.scale, g.catch[1] * g.scale], bagOrigin, BAG_ANGLE);
  const bag = placed('bag', tip[0] - catchFromOrigin[0], tip[1] - catchFromOrigin[1], bw, bh, BAG_ANGLE, bagOrigin);
  const bagPivot: Point = [bag.left + bagOrigin[0], bag.top + bagOrigin[1]];
  const onBag = ([x, y]: Point) => turn([bag.left + x * g.scale, bag.top + y * g.scale], bagPivot, BAG_ANGLE);
  const hookshotClip = nearSideOf(onBag(g.frontEdge[0]), onBag(g.frontEdge[1]));
  const sw = st.w * st.scale, sh = st.h * st.scale;
  const stamp = placed('stamp', g.stampCentre[0] * g.scale - sw / 2, g.stampCentre[1] * g.scale - sh / 2, sw, sh, g.stampAngle);

  const trailOppositeThePull = HOOKSHOT_ANGLE + CHAIN_BEND + 180;
  const { stars, speedLines } = bagEffects(parts, onBag, trailOppositeThePull);
  const apex = turn([bot.left + b.w / 2, bot.top], botCentre, BOT_ANGLE);
  const effects = [placed('sparkle', apex[0] - sp.w / 2 - 1, apex[1] - sp.h / 2 + 2, sp.w, sp.h), ...speedLines];
  const width = Math.ceil(Math.max(...[bag, ...stars, ...speedLines].map(rightmost)) + MARGIN);
  return { width, height: HEIGHT, bot, hookshot, hookshotClip, behindBag: stars, bag, stamp, effects };
};

export { computeLayout };

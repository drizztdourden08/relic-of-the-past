/* @layer renderer-components @kind logic */
/**
 * Where each part of the Hookshop highlight sits and how it is turned, in mascot pixels.
 * The mascot leans back and holds the hookshot in its right pod. The chain leaves at a
 * fixed angle and bends along an even arc. The bag is placed so the head's point lands just
 * past the front face's left edge at mid-height, whatever the angles are, and the hookshot
 * is clipped along that edge so the point goes in behind the front. The stamp is placed
 * inside the bag's box, square to the front's bottom edge, so it turns with the bag.
 */
import { hookshotCurve, layoutHookshot } from '../../Hookshot';
import type { HookshopParts, HookshopLayout, Point } from '../HookshopHighlight.type';
import { bagEffects } from './bag-effects';
import { nearSideOf, placed, rightmost, turn } from './plane-geometry';

const BOT_AT: Point = [2, 15];
const BOT_ANGLE = -6;
const HOOKSHOT_ANGLE = -11;
const CHAIN_LENGTH = 30;
const CHAIN_BEND = 12;
const BAG_ANGLE = -15;
const HEIGHT = 52;
const MARGIN = 2;

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

  // the bag travels back along the chain, so the lines trail the other way
  const trail = HOOKSHOT_ANGLE + CHAIN_BEND + 180;
  const { stars, speedLines } = bagEffects(parts, onBag, trail);
  const apex = turn([bot.left + b.w / 2, bot.top], botCentre, BOT_ANGLE);
  const effects = [placed('sparkle', apex[0] - sp.w / 2 - 1, apex[1] - sp.h / 2 + 2, sp.w, sp.h), ...speedLines];
  const width = Math.ceil(Math.max(...[bag, ...stars, ...speedLines].map(rightmost)) + MARGIN);
  return { width, height: HEIGHT, bot, hookshot, hookshotClip, behindBag: stars, bag, stamp, effects };
};

export { computeLayout };

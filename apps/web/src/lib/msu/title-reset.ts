/* @layer renderer-lib @kind logic */
/**
 * Putting replacement audio back to nothing once the game is at its title.
 *
 * Two things go wrong when a run's audio survives into the next one. Positions: resuming exists
 * for a run in progress, and carried across runs it starts the opening in the middle of itself
 * instead of with its animation. And the bed: the game ends a run by reloading its sound chip's
 * song bank wholesale, which stops the chip's own ambience without ever raising the "no bed" id
 * a host would hear, so a storm that was playing when the player quit keeps raining over the
 * title with nothing left to stop it.
 *
 * Reaching a title module is the one unambiguous signal that no run is in progress. The modules
 * are set by the game, so a save-and-quit, a game over taken back to the file screen and a hard
 * reset all arrive here without this having to recognise each path separately.
 */
import type { MsuChannelName, SoundChannelApi } from './channel';

/**
 * The modules with no run behind them. Numbers are the core's own dispatch order
 * (`kMainRouting`), the same set `lib/game/ui-bridge-parser.ts` reads as the `title` UI mode.
 */
const TITLE_MODULES: ReadonlySet<number> = new Set([
  0,  // Module00_Intro — the opening animation
  1,  // Module01_FileSelect
  2,  // Module02_CopyFile
  3,  // Module03_KILLFile
  4,  // Module04_NameFile
  20, // Module14_Attract — the legend demo the title loops into
]);

/**
 * The channels silenced outright on the way in. Music is deliberately absent: every path to the
 * title fades it out first (`Death_Func31` and `FadeMusicAndResetSRAMMirror` both write the fade
 * byte in the frame they set the module), so cutting it here would replace that fade with a
 * click. The bed and the effects get no such courtesy from the game and have to be cut.
 */
const SILENCED: readonly MsuChannelName[] = ['ambient', 'sfx1', 'sfx2'];

const isTitleModule = (module: number): boolean => TITLE_MODULES.has(module);

/**
 * A reset pass to run on each music event, given the module it was reported from.
 *
 * Silencing happens once, on the way in. Forgetting happens on every title event instead: the
 * title loops into its attract demo and back, and clearing only on the way in would let the
 * second pass through that loop resume the first pass's music.
 */
const createTitleReset = (
  channels: Record<MsuChannelName, SoundChannelApi>,
  enabled?: () => boolean,
  onReset?: () => void,
) => {
  const all = Object.values(channels);
  const silenced = SILENCED.map((name) => channels[name]);
  let wasTitle = false;

  return (module: number): void => {
    const title = isTitleModule(module);
    const entering = title && !wasTitle;
    wasTitle = title;
    if (!title || !(enabled?.() ?? false)) return;
    if (entering) {
      silenced.forEach((channel) => channel.stop());
      onReset?.();
    }
    all.forEach((channel) => channel.forget());
  };
};

export { TITLE_MODULES, SILENCED, isTitleModule, createTitleReset };

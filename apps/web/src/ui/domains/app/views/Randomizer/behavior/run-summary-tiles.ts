/* @layer renderer-components @kind logic */
/**
 * The Run tab summary's tiles: what the run is (profile, seed, mode, who started it, and for
 * an Archipelago run where it connects and as whom), then the plan counters a local session
 * armed with.
 */
import type { StatTileProps } from '@ds/primitives';
import type { ProfileRandomizerConfig } from '@shared/types/profile';
import type { SessionSource } from '@app/lib/game/randomizer-client';

/**
 * Nicer wording for the counters we know about. Anything not listed still
 * shows, humanized from its key, while the plan's classes are actively being
 * reworked (drop and standing overrides, deliver rows converting to physical
 * ones), and a hardcoded list silently omits whichever one lands next. This
 * one already drifted once.
 */
const COUNTER_LABELS: Readonly<Record<string, string>> = {
  override: 'chest overrides',
  overrideNpc: 'npc overrides',
  overrideDrop: 'drop overrides',
  overrideStanding: 'standing overrides',
  overrideScripted: 'scripted overrides',
  deliver: 'deliver',
  vanillaLocked: 'vanilla-locked',
  pollBlind: 'poll-blind',
  errors: 'errors',
};

const humanize = (key: string): string =>
  key.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();

const sourceLabel = (source: SessionSource | null): string =>
  source === 'profile' ? 'started by this profile' : source === 'manual' ? 'started manually' : 'not started';

const summaryTilesOf = (profileName: string, config: ProfileRandomizerConfig, source: SessionSource | null): StatTileProps[] => {
  const tiles: StatTileProps[] = [
    { label: 'profile', value: profileName },
    { label: 'seed', value: config.seed },
    { label: 'mode', value: config.mode },
    { label: 'origin', value: sourceLabel(source) },
  ];
  if (config.mode !== 'online') return tiles;
  return [
    ...tiles,
    { label: 'server', value: config.serverUrl ?? '(none)' },
    { label: 'slot', value: config.slotName ?? 'Player' },
    { label: 'death link', value: config.deathLink ? 'on' : 'off' },
  ];
};

/** The plan's counters, one tile each. */
const counterTilesOf = (stats: object | null): StatTileProps[] =>
  (stats === null ? [] : Object.entries(stats).map(([key, count]) => ({
    label: COUNTER_LABELS[key] ?? humanize(key),
    value: String(count),
  })));

export { counterTilesOf, summaryTilesOf };

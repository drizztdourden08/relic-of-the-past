/* @layer renderer-components @kind component */
/**
 * The facts of the run: which profile it belongs to, the seed it was generated
 * from, the live session state out of the shared store, and, once a local
 * session has armed, the plan counters it armed with. An Archipelago run adds
 * its connection facts, a one-line network status that opens the Network tab,
 * and the button that saves its files. The frozen option catalog is
 * RunOptions' job; the placement is the spoiler tab's.
 */
import { Box, Text } from '@ds/primitives';
import type { ProfileRandomizerConfig } from '@shared/types/profile';
import type { ActiveSession, SessionSource } from '../../../../../../lib/game/randomizer-client';
import { ArchipelagoFiles } from './ArchipelagoFiles';
import { NetworkPill } from './NetworkTab';

interface RunSummaryProps {
  profileId: string;
  profileName: string;
  config: ProfileRandomizerConfig;
  session: ActiveSession | null;
  source: SessionSource | null;
  status: ActiveSession['status'];
  gameRunning: boolean;
  onOpenNetwork: () => void;
}

interface Fact {
  label: string;
  value: string;
}

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

const RunSummary = (props: RunSummaryProps) => {
  const { profileId, profileName, config, session, source, status, gameRunning, onOpenNetwork } = props;
  const archipelago = config.mode === 'online';
  const localStats = session?.kind === 'local' ? session.stats : null;

  const facts: Fact[] = [
    { label: 'seed', value: config.seed },
    { label: 'mode', value: config.mode },
    { label: 'session', value: status },
    { label: 'origin', value: sourceLabel(source) },
  ];
  if (archipelago) {
    facts.push({ label: 'server', value: config.serverUrl ?? '(none)' });
    facts.push({ label: 'slot', value: config.slotName ?? 'Player' });
    facts.push({ label: 'death link', value: config.deathLink ? 'on' : 'off' });
  }

  const counters: Fact[] = localStats === null ? [] : Object.entries(localStats)
    .map(([key, count]) => ({ label: COUNTER_LABELS[key] ?? humanize(key), value: String(count) }));

  return (
    <Box className="randomizer-page__panel">
      <Box className="randomizer-page__header">
        <Text className="randomizer-page__profile-name">{profileName}</Text>
        <Text className={`randomizer-page__status-chip randomizer-page__status-chip--${status}`}>{status}</Text>
      </Box>

      {archipelago && <NetworkPill onOpen={onOpenNetwork} />}

      <Box className="randomizer-page__facts">
        {facts.map((fact) => (
          <Box key={fact.label} className="randomizer-page__fact">
            <Text className="randomizer-page__fact-label">{fact.label}</Text>
            <Text className="randomizer-page__fact-value">{fact.value}</Text>
          </Box>
        ))}
      </Box>

      {counters.length > 0 && (
        <Box className="randomizer-page__facts randomizer-page__facts--counters">
          {counters.map((counter) => (
            <Box key={counter.label} className="randomizer-page__fact">
              <Text className="randomizer-page__fact-label">{counter.label}</Text>
              <Text className="randomizer-page__fact-value">{counter.value}</Text>
            </Box>
          ))}
        </Box>
      )}

      {archipelago && <ArchipelagoFiles profileId={profileId} />}

      {!session && !gameRunning && (
        <Text className="randomizer-page__hint">The session starts automatically when the game boots.</Text>
      )}
    </Box>
  );
};

export { RunSummary };
export type { RunSummaryProps };

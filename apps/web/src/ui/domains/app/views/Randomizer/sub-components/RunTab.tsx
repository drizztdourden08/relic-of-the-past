/* @layer renderer-components @kind component */
/**
 * The Run tab's stack: what the run is, then the options it was generated
 * with, then the dev-only sandbox. A vanilla profile (or none) gets a quiet
 * empty state instead, since there is nothing to say about a run that isn't one.
 */
import { Box, Text } from '@ds/primitives';
import { RunSummary } from './RunSummary';
import { RunOptions } from './RunOptions';
import { RandomizerSandbox } from './RandomizerSandbox';
import type { ProfileRandomizerConfig } from '@shared/types/profile';
import type { ActiveSession, SessionSource } from '../../../../../../lib/game/randomizer-client';

interface RunTabProps {
  profileName: string | null;
  config: ProfileRandomizerConfig | null;
  session: ActiveSession | null;
  source: SessionSource | null;
  status: ActiveSession['status'];
  gameRunning: boolean;
}

const RunTab = (props: RunTabProps) => {
  const { profileName, config, session, source, status, gameRunning } = props;

  return (
    <Box className="randomizer-page__scroll">
      {config && profileName ? (
        <>
          <RunSummary
            profileName={profileName}
            config={config}
            session={session}
            source={source}
            status={status}
            gameRunning={gameRunning}
          />
          <RunOptions options={config.options} seed={config.seed} />
        </>
      ) : (
        <Box className="randomizer-page__panel">
          <Text className="randomizer-page__hint">
            {profileName
              ? 'This profile is not randomized. Randomizer options are chosen when creating a profile.'
              : 'No active profile.'}
          </Text>
        </Box>
      )}

      {window.api?.isDev && (
        <RandomizerSandbox session={session} status={status} gameRunning={gameRunning} />
      )}
    </Box>
  );
};

export { RunTab };
export type { RunTabProps };

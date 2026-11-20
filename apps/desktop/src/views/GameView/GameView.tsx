/* @layer renderer-app @kind component */
import { I18nProvider, bugReport } from '@drizztdourden08/brock-react';
import { Box, Image } from '@drizztdourden08/tessera/primitives';
import { GameLayer } from '@app/views/GameLayer';
import { SaveStateOverlay } from '@app/views/SaveStateOverlay/SaveStateOverlay';
import { DebugFloatingControls } from '@app/compounds/DebugFloatingControls';
import { useGameSession } from '@app/hooks/useGameSession';
import { gameI18n } from '@app/shell/game-locale';
import { useGameLocale } from './behavior/useGameLocale';
import { BACKGROUND_LOGO } from './GameView.constants';
import './GameView.css';

const GameView = () => {
  const { game, display, saveOverlay, profileMgmt } = useGameSession();
  const profileId = profileMgmt.activeProfile?.id;
  useGameLocale(profileMgmt.activeProfile?.language);

  return (
    <Box className="game-view">
      {!game.isRunning && <Image className="game-view__bg-logo" src={BACKGROUND_LOGO} alt="" />}
      <I18nProvider i18n={gameI18n} document={false}>
        <GameLayer
          assetData={game.assetData}
          configIni={game.configIni}
          profileId={profileId}
          stretch={display.viewportConstraint !== 'none'}
          edgeEffect={display.overworldEdgeEffect}
          pixelPerfect={display.pixelPerfect}
          shadowCasting={display.postProcessingShadows}
        />
        <SaveStateOverlay
          open={saveOverlay.open}
          onClose={saveOverlay.close}
          highlightedSlot={saveOverlay.highlightedSlot}
          holdProgress={saveOverlay.holdProgress}
          hints={saveOverlay.hints}
        />
      </I18nProvider>
      <DebugFloatingControls profileId={profileId ?? null} gameRunning={game.isRunning} onOpenReport={bugReport.open} />
    </Box>
  );
};

export { GameView };

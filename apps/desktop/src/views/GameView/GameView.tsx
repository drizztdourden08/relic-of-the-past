/* @layer renderer-app @kind component */
import { bugReport, useDeveloperTools } from '@drizztdourden08/brock-react';
import { Box, Image } from '@drizztdourden08/tessera/primitives';
import { GameLayer } from '@app/views/GameLayer';
import { SaveStateOverlay } from '@app/views/SaveStateOverlay/SaveStateOverlay';
import { DebugFloatingControls } from '@app/compounds/DebugFloatingControls';
import { useGameSession } from '@app/hooks/useGameSession';
import { BACKGROUND_LOGO } from './GameView.constants';
import './GameView.css';

const GameView = () => {
  const { game, display, saveOverlay, profileMgmt } = useGameSession();
  const developerToolsEnabled = useDeveloperTools();
  const profileId = profileMgmt.activeProfile?.id;

  return (
    <Box className="game-view">
      {!game.isRunning && <Image className="game-view__bg-logo" src={BACKGROUND_LOGO} alt="" />}
      <GameLayer
        assetData={game.assetData}
        configIni={game.configIni}
        profileId={profileId}
        stretch={display.viewportConstraint !== 'none'}
        edgeEffect={display.overworldEdgeEffect}
        pixelPerfect={display.pixelPerfect}
        shadowCasting={display.postProcessingShadows}
        developerToolsEnabled={developerToolsEnabled}
      />
      <SaveStateOverlay
        open={saveOverlay.open}
        onClose={saveOverlay.close}
        highlightedSlot={saveOverlay.highlightedSlot}
        holdProgress={saveOverlay.holdProgress}
        hints={saveOverlay.hints}
      />
      <DebugFloatingControls profileId={profileId ?? null} gameRunning={game.isRunning} onOpenReport={bugReport.open} />
    </Box>
  );
};

export { GameView };

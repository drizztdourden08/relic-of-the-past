/* @layer renderer-appshell @kind logic */
import { requireHostApi } from '@drizztdourden08/brock-react';
import { loadState } from '@app/game';
import type { RunDumpLayersParams } from './useDumpLayers.type';
import { EXIT_DELAY_MS, RENDER_SETTLE_MS } from './auto-launch.constants';
import { waitForGameRunning } from './wait-for-game-running';
import { captureLayersSnapshot } from './capture-layers-snapshot';
import { buildDumpLayersOutput } from './build-dump-layers-output';
import { logHoverVerdict } from './log-hover-verdict';

const runDumpLayers = async (params: RunDumpLayersParams): Promise<void> => {
  const { activeProfile, loadProfileForGame, openNavWidget, slot, hoverTile, isCancelled } = params;

  console.log(`[DumpLayers] Starting game for profile: ${activeProfile.name}`);
  await loadProfileForGame(activeProfile);

  await waitForGameRunning(isCancelled);
  if (isCancelled()) return;

  console.log(`[DumpLayers] Game running. Loading state slot ${slot}...`);
  await loadState(slot);

  await new Promise((r) => setTimeout(r, RENDER_SETTLE_MS));
  if (isCancelled()) return;

  console.log('[DumpLayers] Taking screenshot...');
  const screenshotPath = await requireHostApi().takeScreenshot(`dump-layers-state${slot}`);
  console.log(`[DumpLayers] Screenshot: ${screenshotPath}`);

  const snapshot = await captureLayersSnapshot({ slot, screenshotPath, hoverTile }, openNavWidget);
  const output = buildDumpLayersOutput(snapshot);
  console.log(`[DumpLayers] hasDualLayers=${output.hasDualLayers}, linkLayer=${snapshot.playerLayer}`);
  if (output.grids) {
    console.log(`[DumpLayers] ${output.grids.splitTiles.length} tiles with layer split`);
  } else {
    console.log('[DumpLayers] No dual layers (single-layer room or layers identical after normalization)');
  }
  if (snapshot.hoverVerification && hoverTile) logHoverVerdict(hoverTile, snapshot.hoverVerification);

  const path = await requireHostApi().writeDumpLayers(output);
  console.log(`[DumpLayers] Output written to: ${path}`);

  setTimeout(() => window.close(), EXIT_DELAY_MS);
};

export { runDumpLayers };

/* @layer renderer-widgets @kind hook */
import { useState, useCallback } from 'react';
import type { TileReq } from '@rotp/game-data';
import { log } from '@app/log-bus';
import { wasmGetIndoorLayer0Grid } from '../../../game';
import { annotateFlooded } from '../../../nav-widget/nav-flood/annotate-flooded';
import { annotateLayerToggles, buildIndoorScreenBundle, computeFallHoleLandings } from '../../../nav-widget/nav-flood/finalize';
import { collectScreenCrossings } from '../../../nav-widget/nav-flood/collect-screen-crossings';
import { prepareFloodRun } from '../../../nav-widget/nav-flood/prepare/prepare-flood-run';
import { propagateScreens } from '../../../nav-widget/nav-flood/propagate';
import { summarizeResponses } from '../../../nav-widget/nav-flood/summarize-responses';
import type { FloodRunParams } from './hooks.type';

const useFloodRun = (params: FloodRunParams) => {
  const { isIndoors, activeScreenIndex, overworldScreenIndex, screenName, screenId, equipment, inventoryItems, actions } = params;
  const { setScreenBundle, setData, setCrossings, setAnnotations } = actions;
  const [running, setRunning] = useState(false);
  const [dynamicBlockerCount, setDynamicBlockerCount] = useState(0);

  const handleRun = useCallback(() => {
    if (running || (isIndoors && !wasmGetIndoorLayer0Grid())) return;

    setRunning(true);
    try {
      const prep = prepareFloodRun({ isIndoors, activeScreenIndex, overworldScreenIndex, equipment, inventoryItems });
      const { primaryScreenIndex, items, intraEdges, roomLayout } = prep;

      const { responses, overworldBundle } = propagateScreens({
        isIndoors, primaryScreenIndex, startPos: prep.startPos, items, allEntrances: prep.allEntrances, intraEdges,
      });
      if (overworldBundle) setScreenBundle(overworldBundle);

      const summary = summarizeResponses(responses, primaryScreenIndex);
      if (summary === null) return;
      const { fillResults, primaryResult, allConnections } = summary;

      annotateLayerToggles(allConnections, isIndoors);
      if (isIndoors) {
        setScreenBundle(buildIndoorScreenBundle({ screenName, primaryScreenIndex, allConnections, roomLayout, intraEdges }));
      }

      setDynamicBlockerCount(summary.dynamicBlockerCount);
      const fallHoleSpawns = computeFallHoleLandings(primaryScreenIndex, isIndoors);
      setData({
        result: primaryResult, connections: allConnections, results: fillResults, fallHoleSpawns, respawnEntIds: prep.currentRespawnIds,
      });
      setCrossings(collectScreenCrossings({ isIndoors, responses, items: items as TileReq[] }));
      setAnnotations(annotateFlooded({ fillResults, isIndoors, primaryScreenIndex, primaryScreenId: screenId }));
    } catch (e) {
      log.error(`[Navigation] Flood run failed: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setRunning(false);
    }
  }, [
    running, isIndoors, activeScreenIndex, overworldScreenIndex, equipment, inventoryItems, screenName, screenId,
    setScreenBundle, setData, setCrossings, setAnnotations,
  ]);

  return { running, dynamicBlockerCount, handleRun };
};

export { useFloodRun };

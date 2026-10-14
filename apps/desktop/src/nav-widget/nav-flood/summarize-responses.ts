/* @layer renderer-widgets @kind logic */
import type { FloodSummary, ScreenResponse } from './nav-flood.type';

const summarizeResponses = (responses: readonly ScreenResponse[], primaryScreenIndex: number): FloodSummary | null => {
  const fillResults = responses.map((response) => response.result);
  const primaryResult = fillResults.find((result) => result.screenIndex === primaryScreenIndex) ?? fillResults[0];
  if (primaryResult === undefined) return null;

  return {
    fillResults,
    primaryResult,
    allConnections: responses.flatMap((response) => response.connections.map((c) => ({ ...c, sourceScreen: response.screenIndex }))),
    dynamicBlockerCount: responses.reduce(
      (sum, x) => sum + (x.result.dynamicBlockerCells?.length ?? x.dynamicBlockers?.length ?? 0),
      0,
    ),
  };
};

export { summarizeResponses };

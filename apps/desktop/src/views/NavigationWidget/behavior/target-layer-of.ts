/* @layer renderer-widgets @kind logic */
const targetLayerOf = (toggles: boolean, playerLayer: number | null | undefined): string | null => {
  if (!toggles || playerLayer == null) return null;
  return playerLayer === 0 ? 'Lower' : 'Upper';
};

export { targetLayerOf };

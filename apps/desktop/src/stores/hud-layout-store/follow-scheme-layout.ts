/* @layer renderer-stores @kind logic */
import { DEFAULT_LAYOUT } from '@rotp/hud';
import { resolveStoredLayout } from '@app/lib/hud/layout-document-io';
import { onSchemeBindings } from '@rotp/input-mapping';
import type { ModernBindings } from '@rotp/game-data';
import { useHudLayoutStore } from './useHudLayoutStore';

let wantedLayoutId = DEFAULT_LAYOUT.id;

const followSchemeLayout = (bindings: ModernBindings | null): void => {
  const id = bindings?.layoutId ?? DEFAULT_LAYOUT.id;
  if (id === useHudLayoutStore.getState().layoutId) return;
  wantedLayoutId = id;
  resolveStoredLayout(id)
    .then((layout) => { if (wantedLayoutId === id) useHudLayoutStore.getState().setLayout(layout); })
    .catch((e: unknown) => console.error('[hud] failed to resolve the scheme\'s HUD layout', e));
};

onSchemeBindings(followSchemeLayout);

export { followSchemeLayout };

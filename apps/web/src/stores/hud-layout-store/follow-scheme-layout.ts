/* @layer renderer-stores @kind logic */
import { DEFAULT_LAYOUT } from '@shared/hud/layouts';
import { resolveStoredLayout } from '@app/lib/hud/layout-document-io';
import { onSchemeBindings } from '@app/lib/input/scheme-runtime';
import type { ModernBindings } from '@shared/types/controls';
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

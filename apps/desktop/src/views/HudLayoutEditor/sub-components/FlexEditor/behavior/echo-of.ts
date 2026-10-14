/* @layer renderer-components @kind logic */
import type { FlexEcho } from '@app/stores/hud-editor-view-store';
import type { HudFlexContainer } from '@rotp/hud';
import type { FlexSelection } from '../FlexEditor.type';

const echoOf = (container: HudFlexContainer, selection: FlexSelection): FlexEcho | null => {
  if (selection.kind !== 'items') return null;
  const ids = selection.indices
    .map((index) => container.children[index]?.id)
    .filter((id): id is string => id !== undefined);
  return ids.length > 0 ? { containerId: container.id, childIds: ids } : null;
};

export { echoOf };

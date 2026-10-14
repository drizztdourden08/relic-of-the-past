/* @layer renderer-components @kind logic */
import type { FlexSlot } from '@app/hud-layout-editing/flex-slots';
import type { HudFlexContainer } from '@rotp/hud';
import type { FlexCell } from '../sub-components/FlexStrip.type';
import type { FlexSelection } from '../FlexEditor.type';

const cellsOf = (
  container: HudFlexContainer, slots: readonly FlexSlot[], selection: FlexSelection,
): FlexCell[] => {
  const horizontal = container.direction === 'row';
  return container.children.map((child, index) => ({
    id: child.id,
    weight: horizontal ? (slots[index]?.w ?? 0) : (slots[index]?.h ?? 0),
    selected: selection.kind === 'items' && selection.indices.includes(index),
  }));
};

export { cellsOf };

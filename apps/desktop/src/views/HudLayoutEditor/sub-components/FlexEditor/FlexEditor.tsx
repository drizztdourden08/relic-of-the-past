/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Box } from '@drizztdourden08/tessera/primitives';
import { capOf, runnerFor } from '@app/hud-layout-editing/action-keys';
import { useFlexSlots } from '@app/hud-layout-editing/flex-slots';
import { SelectionLegend } from '../SelectionLegend';
import { SelectionToolbar } from '../SelectionToolbar';
import { cellsOf } from './behavior/cells-of';
import { chipOf } from './behavior/chip-of';
import { contextualActions } from './behavior/contextual-actions';
import { KEY_STEP } from './behavior/flex-keys.constants';
import { flexActions } from './behavior/flex-actions';
import { statusOf } from './behavior/status-of';
import { useFlexEcho } from './behavior/useFlexEcho';
import { useFlexSelection } from './behavior/useFlexSelection';
import { FlexStrip } from './sub-components/FlexStrip';
import './FlexEditor.css';
import type { KeyboardEvent } from 'react';
import type { FlexActionContext, FlexEditorProps } from './FlexEditor.type';

const FlexEditor = (props: FlexEditorProps) => {
  const { container, onDrop } = props;
  const slots = useFlexSlots(container);
  const flex = useFlexSelection(container.id, container.children.length);

  const move = useCallback((from: number, to: number): void => {
    const id = container.children[from]?.id;
    if (!id) return;
    if (!onDrop) { flex.refuse('This mount cannot reorder because no editor is attached.'); return; }
    onDrop([id], { kind: 'flex', parentId: container.id, index: to });
  }, [container, flex, onDrop]);

  const ctx: FlexActionContext = {
    container,
    selection: flex.selection,
    edits: { move, setSelection: flex.select, refuse: flex.refuse },
  };
  const actions = flexActions(ctx);
  useFlexEcho(container, flex.selection);

  const onKeyDown = (event: KeyboardEvent): void => {
    const cap = capOf(event);
    if (cap === null) return;
    const match = runnerFor(actions, cap);
    if (match?.run) {
      match.run();
      event.preventDefault();
      return;
    }
    const step = KEY_STEP[cap] ?? 0;
    if (step === 0) return;
    const next = Math.min(Math.max(flex.cursor + step, 0), Math.max(container.children.length - 1, 0));
    flex.setCursor(next);
    flex.select({ kind: 'items', indices: [next], anchor: next });
    event.preventDefault();
  };

  return (
    <Box className="hud-flex">
      <SelectionToolbar
        chip={chipOf(flex.selection)}
        actions={contextualActions(ctx)}
        hint="select a child to reorder it"
      />
      <FlexStrip
        cells={cellsOf(container, slots, flex.selection)}
        direction={container.direction}
        wrap={container.wrap === true}
        cursor={flex.cursor}
        label={`${container.children.length} children in flow order. Selecting one edits nothing`}
        onCellDown={flex.pick}
        onKeyDown={onKeyDown}
      />
      <SelectionLegend actions={actions} os={flex.os} status={statusOf(ctx)} refusal={flex.refusal} />
    </Box>
  );
};

export { FlexEditor };
export type { FlexEditorProps } from './FlexEditor.type';

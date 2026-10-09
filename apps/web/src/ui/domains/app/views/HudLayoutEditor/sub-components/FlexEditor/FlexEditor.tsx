/* @layer renderer-components @kind component */
import { useCallback, useEffect, useMemo } from 'react';
import { Box } from '@ds/primitives/Box';
import { useHudEditorViewStore } from '@app/stores/hud-editor-view-store';
import { capOf, runnerFor } from '../../behavior/action-keys';
import { useFlexSlots } from '../../behavior/flex-slots';
import { SelectionLegend, SelectionToolbar } from '../SelectionBands';
import { chipOf, contextualActions, flexActions, statusOf } from './behavior/flex-actions';
import { useFlexSelection } from './behavior/useFlexSelection';
import { FlexStrip } from './sub-components/FlexStrip';
import './sub-components/HudLayoutEditor.flex.css';
import type { KeyboardEvent } from 'react';
import type { FlexActionContext, FlexEditorProps } from './FlexEditor.type';

const FlexEditor = (props: FlexEditorProps) => {
  const { container, onDrop } = props;
  const setFlexEcho = useHudEditorViewStore((s) => s.setFlexEcho);
  const slots = useFlexSlots(container);
  const flex = useFlexSelection(container.id, container.children.length);
  const horizontal = container.direction === 'row';

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

  const echo = useMemo(() => {
    if (flex.selection.kind !== 'items') return null;
    const ids = flex.selection.indices
      .map((index) => container.children[index]?.id)
      .filter((id): id is string => id !== undefined);
    return ids.length > 0 ? { containerId: container.id, childIds: ids } : null;
  }, [container, flex.selection]);
  useEffect(() => {
    setFlexEcho(echo);
    return () => setFlexEcho(null);
  }, [echo, setFlexEcho]);

  const cells = container.children.map((child, index) => ({
    id: child.id,
    weight: horizontal ? (slots[index]?.w ?? 0) : (slots[index]?.h ?? 0),
    selected: flex.selection.kind === 'items' && flex.selection.indices.includes(index),
  }));

  const onKeyDown = (event: KeyboardEvent): void => {
    const cap = capOf(event);
    if (cap === null) return;
    const match = runnerFor(actions, cap);
    if (match?.run) {
      match.run();
      event.preventDefault();
      return;
    }
    const step = cap === '←' || cap === '↑' ? -1 : (cap === '→' || cap === '↓' ? 1 : 0);
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
        cells={cells}
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

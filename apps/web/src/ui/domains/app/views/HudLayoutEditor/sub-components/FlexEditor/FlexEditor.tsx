/* @layer renderer-components @kind component */
/**
 * SECTION FOUR UNDER A FLEX CONTAINER IS FLEX MANIPULATION (§58).
 *
 * > "the flex should have a manipulation section as well. same principle"
 *
 * THE PRINCIPLE, SPELLED OUT. The grid's manipulation section edits the grid's
 * own STRUCTURE, which is its tracks, and the children follow. A flex container's
 * structure IS the order of its children: each child is its own track, laid end
 * to end along `direction`. So this is the same control one dimension down, and
 * it wears the same three bands:
 *
 * - `SelectionToolbar` holds actions on the SELECTION, and only those. Sticky, one
 *   row, with the same reserved height when nothing is picked. Shared, not
 *   copied: it is literally the component the lattice mounts.
 * - `FlexStrip` is the drawing: one cell per child, sized by the child's REAL
 *   placed size (`behavior/flex-slots.ts`), drawn along the container's own
 *   direction and wrapping the way it wraps.
 * - `SelectionLegend` shows what is selected and what can be pressed right now,
 *   drawn with `KeyCap`/`MouseGlyph` instead of spelled in prose.
 *
 * A PRESS WRITES NOTHING, and that is the lattice's rule kept exactly: clicking,
 * `{mod}`-clicking and `Shift`-clicking all leave the document byte-identical.
 * What they choose is the context the toolbar and the stage echo read.
 *
 * THE ONE WRITE GOES THROUGH THE ONE DOOR. A reorder is a `moveNode`, and
 * `behavior/drop-intent.ts` is the only module in this editor that calls one, and a
 * grep test says so. So this component produces a `DropIntent` and hands it up;
 * it never touches the tree itself, never inserts, never deletes, and never
 * edits a child's properties.
 */
import { useCallback, useEffect, useMemo } from 'react';
import { Box } from '@ds/primitives/Box';
import { useHudEditorViewStore } from '@app/stores/hud-editor-view-store';
import { capOf, runnerFor } from '../../behavior/action-keys';
import { useFlexSlots } from '../../behavior/flex-slots';
import { SelectionLegend, SelectionToolbar } from '../SelectionBands';
import { chipOf, contextualActions, flexActions, statusOf } from './behavior/flex-actions';
import { useFlexSelection } from './behavior/use-flex-selection';
import { FlexStrip } from './sub-components/FlexStrip';
import './sub-components/HudLayoutEditor.flex.css';
import type { KeyboardEvent } from 'react';
import type { DropIntent } from '../../behavior/drop-intent';
import type { HudFlexContainer } from '@shared/types/hud';
import type { FlexActionContext } from './FlexEditor.type';

interface FlexEditorProps {
  container: HudFlexContainer;
  /** The editor's single `applyDrop` door. Absent in a harness that mounts the
   *  section without the View, where the strip is a read-only drawing. */
  onDrop?: (ids: readonly string[], intent: DropIntent) => void;
}

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
    // `moveNode` REMOVES AND THEN INSERTS, so the index it takes is an index
    // into the list WITHOUT this child in it, which is exactly the destination
    // slot, in both directions, with no compensation either way. Round 20 shipped
    // a `+1` for the forward case and "move later" sent the child to the END;
    // the real-app spec caught it on the first press.
    onDrop([id], { kind: 'flex', parentId: container.id, index: to });
  }, [container, flex, onDrop]);

  const ctx: FlexActionContext = {
    container,
    selection: flex.selection,
    edits: { move, setSelection: flex.select, refuse: flex.refuse },
  };
  const actions = flexActions(ctx);

  // THE STAGE ECHOES WHAT IS PICKED, visually and never as an edit. It uses the same
  // arrangement the lattice publishes on, on the key that suits a flex
  // container: the ids of the children, because children are all it has.
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
export type { FlexEditorProps };

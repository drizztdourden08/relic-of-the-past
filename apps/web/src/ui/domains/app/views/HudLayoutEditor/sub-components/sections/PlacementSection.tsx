/* @layer renderer-components @kind component */
/**
 * POSITION & PLACEMENT answers "where is this, and how do I move it".
 *
 * OFFSET IS FIRST, because every mature inspector puts position first: Figma's
 * X/Y with a constraint widget, Unity's RectTransform, Blender's transform
 * panel. It writes `margin.left`/`margin.top` (`behavior/offset.ts`), which is
 * what the model already means by displacement.
 *
 * `order` IS GONE. The outline's drag already reorders siblings, and a stray
 * integer that silently overrides tree order is the classic CSS `order` trap.
 *
 * THE NINE-ANCHOR DROPDOWN IS GONE TOO (§42). A former region is an ordinary
 * child of the screen's grid, so "move the wallet" is picking a cell.
 *
 * AND THE CHILD PICKS IT WITH ITS OWN CONTROL AGAIN (§50, retiring §48's
 * arrangement). §48 mounted the PARENT'S `GridEditor` here with this child
 * pre-selected and a move armed, which made clicking a cell in a grid editor
 * move a child, in both of the places that editor appears, and that is the bug
 * this amendment was opened for. `CellPicker` is the same lattice with the
 * opposite subject: it shows the parent's grid and writes exactly one thing,
 * THIS child's `place`. It cannot edit a track, and the grid editor cannot edit
 * a child. The self-alignment pair comes back here with it, because "where
 * inside the cell" is the child's property too.
 */
import { Box } from '@ds/primitives/Box';
import { Field } from '@ds/primitives/Field';
import { Select } from '@ds/primitives/Select';
import { CellPicker } from '../CellPicker';
import { DisabledReason } from '../DisabledReason';
import { OffsetField } from '../OffsetField';
import type { HudAlignSelf, HudContainer, HudGridContainer, HudNode } from '@shared/types/hud';

const ALIGN_SELF: readonly HudAlignSelf[] = ['start', 'center', 'end', 'stretch'];
const OPTIONS = ALIGN_SELF.map((v) => ({ value: v, label: v }));

/** What the scrim names as the cause. A grid parent never reaches this. */
const engineOf = (parent: HudContainer): string =>
  (parent.layout === 'grid' ? 'grid' : `flex ${parent.direction}`);

interface PlacementSectionProps {
  node: HudNode;
  /** The real container this node's box will actually be placed under, once
   *  any repeat/switch ancestor expands. `null` only for the screen. */
  parent: HudContainer | null;
  /** Selects the parent, which is how "open the parent's Layout" is reached. */
  onSelectNode?: (id: string) => void;
  onPatch: (patch: Partial<HudNode>) => void;
}

/** A flex parent has no lattice to draw, so the scrim needs something behind it
 *  that says what the control would be. */
const FLEX_STANDIN: HudGridContainer = {
  kind: 'container', id: 'not-a-grid', layout: 'grid',
  columns: ['auto', 'auto', 'auto'], rows: ['auto', 'auto'], children: [],
};

const PlacementSection = (props: PlacementSectionProps) => {
  const { node, parent, onSelectNode, onPatch } = props;
  const isGrid = parent?.layout === 'grid';

  return (
    <Box className="hud-inspect__group">
      <OffsetField
        value={node.margin}
        onChange={(margin) => onPatch({ margin })}
        from="where the parent puts it"
      />

      <DisabledReason
        active={!isGrid}
        reason={parent
          ? `This parent is a ${engineOf(parent)}. Switch it to grid to place by cell.`
          : 'The screen is the whole view; it sits in nothing.'}
        actionLabel={parent && onSelectNode ? "Open the parent's Layout" : undefined}
        onAction={parent && onSelectNode ? () => onSelectNode(parent.id) : undefined}
      >
        <CellPicker
          container={isGrid ? (parent as HudGridContainer) : FLEX_STANDIN}
          childId={node.id}
          place={node.place}
          onChange={(place) => onPatch({ place })}
        />
      </DisabledReason>

      {/* Under a GRID parent both axes are the child's to argue with; under a
          flex one there is a single cross axis and `justifySelf` is ignored. */}
      <Box className="hud-inspect__row">
        <Field size="sm" label={isGrid ? 'align down' : 'align self'} className="hud-inspect__extent">
          <Select
            size="sm"
            value={node.alignSelf ?? ''}
            placeholder="parent default"
            options={OPTIONS}
            onChange={(v) => onPatch({ alignSelf: (v || undefined) as HudAlignSelf | undefined })}
          />
        </Field>
        {isGrid && (
          <Field size="sm" label="align across" className="hud-inspect__extent">
            <Select
              size="sm"
              value={node.justifySelf ?? ''}
              placeholder="follows down"
              options={OPTIONS}
              onChange={(v) => onPatch({ justifySelf: (v || undefined) as HudAlignSelf | undefined })}
            />
          </Field>
        )}
      </Box>
    </Box>
  );
};

export { PlacementSection };
export type { PlacementSectionProps };

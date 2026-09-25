/* @layer renderer-components @kind component */
/**
 * SIZE, THEN LIMITS, THEN THE BOX, THEN THE TRANSFORM. That is the order every
 * inspector in the discipline uses, in four controls instead of nine rows.
 *
 * The section was two extents spending two rows each on four modes, four
 * checkboxes and four sentences for two optional ranges, and eight unlabelled
 * `t r b l` spinners. It is now `ExtentField` x2 on one row, one `MinMaxField`,
 * one `BoxModelField`, and `scale`.
 *
 * MARGIN IS NO LONGER THE HIDDEN POSITION EDITOR. `margin.left`/`margin.top`
 * are the node's offset and Placement owns them (`behavior/offset.ts`); this
 * section shows them dimmed inside the ring with the reason under it.
 *
 * THE SCREEN'S LOCK IS A SCRIM, NOT FIVE DISABLED INPUTS AND A NOTE PLACED
 * BETWEEN THE FIELDS IT COVERS AND THE ONES IT DOES NOT. Everything the screen
 * cannot author stays visible under one `DisabledReason`, with size and limits
 * together, the margin ring locked in place and `scale` read-only. Its
 * PADDING, the one thing it does author, stays live and outside the scrim.
 * `inert` on the covered subtree is what actually makes it unreachable; the
 * old `disabled` props left the fields in the tab order.
 */
import { Box } from '@ds/primitives/Box';
import { BoxModelField } from '../BoxModelField';
import { DisabledReason } from '../DisabledReason';
import { ExtentField } from '../ExtentField';
import { MinMaxField } from '../MinMaxField';
import { ValueInput } from '../ValueInput';
import type { Extent, HudNode } from '@shared/types/hud';

const SCREEN_REASON = 'The screen is always exactly the view, at every aspect and every resolution.';

interface SizeBoxSectionProps {
  node: HudNode;
  onPatch: (patch: Partial<HudNode>) => void;
  scope: Readonly<Record<string, number>>;
  insideRepeat?: boolean;
  /** The whole-screen root: padding only, everything else locked. */
  isScreen?: boolean;
}

/** What the middle of the box model reads. The AUTHORED size, not the resolved
 *  rectangle. The panel does not have the placed rect, the stage does, and a
 *  number labelled "resolved" that was not would be worse than none. */
const extentText = (extent: Extent | undefined): string => {
  if (extent === undefined || extent === 'auto') return 'auto';
  if (extent === 'fill') return 'fill';
  if ('pct' in extent) return typeof extent.pct === 'number' ? `${extent.pct}%` : '% ƒx';
  if ('px' in extent) return typeof extent.px === 'number' ? String(extent.px) : 'ƒx';
  return 'ƒx';
};

const SizeBoxSection = (props: SizeBoxSectionProps) => {
  const { node, onPatch, scope, insideRepeat, isScreen = false } = props;

  const setSize = (axis: 'w' | 'h', next: Extent | undefined): void => {
    const size = { ...node.size, [axis]: next };
    if (size.w === undefined) delete size.w;
    if (size.h === undefined) delete size.h;
    onPatch({ size: size.w === undefined && size.h === undefined ? undefined : size });
  };

  return (
    <Box className="hud-inspect__group">
      <DisabledReason active={isScreen} reason={SCREEN_REASON}>
        <Box className="hud-inspect__group">
          <Box className="hud-inspect__row">
            <ExtentField label="w" value={node.size?.w} onChange={(next) => setSize('w', next)} />
            <ExtentField label="h" value={node.size?.h} onChange={(next) => setSize('h', next)} />
          </Box>
          <MinMaxField
            min={node.min}
            max={node.max}
            onMin={(min) => onPatch({ min })}
            onMax={(max) => onPatch({ max })}
            scope={scope}
            insideRepeat={insideRepeat}
          />
        </Box>
      </DisabledReason>

      <BoxModelField
        margin={node.margin}
        padding={node.padding}
        marginLocked={isScreen}
        centre={`${extentText(node.size?.w)} × ${extentText(node.size?.h)}`}
        onMargin={(margin) => onPatch({ margin })}
        onPadding={(padding) => onPatch({ padding })}
      />

      <ValueInput
        label="scale"
        value={node.scale ?? 1}
        readOnly={isScreen}
        derivedFrom={isScreen ? SCREEN_REASON : undefined}
        onChange={(scale) => onPatch({ scale: scale === 1 ? undefined : scale })}
        scope={scope}
        insideRepeat={insideRepeat}
        role="number"
        min={0.1}
        step={0.05}
      />
    </Box>
  );
};

export { SizeBoxSection, extentText };
export type { SizeBoxSectionProps };

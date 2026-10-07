/* @layer renderer-components @kind component */
/**
 * `repeat` edits its own `count`, the `item` expression each pass gets, and its
 * one `child`. The child is a full subtree, edited the normal way once
 * selected. It is reachable in the outline now (`node-edits.ts`'s own extension),
 * so this only jumps the selection there instead of re-implementing a
 * second node editor inline.
 *
 * THE JUMP IS A `ReferenceField` NOW (phase 9), not `flex · flex-4a91` in a
 * monospace box. A repeat's child is a whole subtree, not something
 * chosen from a list, so it carries the `go` caret instead of the picker's.
 * A caret that opened nothing would be the panel lying about what a click
 * does. It still draws the child's own artwork and name exactly as the other
 * four references do.
 */
import { Box } from '@ds/primitives/Box';
import { Field } from '@ds/primitives/Field';
import { ExpressionInput } from '../ExpressionInput';
import { ReferenceField } from '../ReferenceField';
import { ValueField } from '../ValueField';
import { nodeArtOf } from '../../behavior/node-art';
import type { GlyphPack, HudRepeatSpec } from '@shared/types/hud';
import { COUNT_STEP } from '../../HudLayoutEditor.constants';

interface RepeatContentProps {
  spec: HudRepeatSpec;
  onChange: (patch: Partial<HudRepeatSpec>) => void;
  scope: Readonly<Record<string, number>>;
  glyphPacks: readonly GlyphPack[];
  /** Whether the REPEAT NODE ITSELF sits inside an outer repeat. `count` is
   *  read in that ambient scope, per `validate-dynamic-node.ts`'s own header
   *  ("a repeat's child is inside repeat; its count is not"). `item` is
   *  always checked with `insideRepeat: true` regardless, since it is read in
   *  the repeat's own per-pass scope. */
  insideRepeat?: boolean;
  onSelectNode: (id: string) => void;
}

const RepeatContent = (props: RepeatContentProps) => {
  const { spec, onChange, scope, insideRepeat, glyphPacks, onSelectNode } = props;
  const child = nodeArtOf(spec.child, glyphPacks);
  return (
    <Box className="hud-inspect__group">
      <ValueField label="count" value={spec.count} onChange={(count) => onChange({ count })} scope={scope} insideRepeat={insideRepeat} min={0} step={COUNT_STEP} />
      <Field size="sm" label="item">
        <ExpressionInput
          value={spec.item ?? 'index'}
          onChange={(item) => onChange({ item: item === 'index' ? undefined : item })}
          scope={scope}
          insideRepeat
          aria-label="Repeat item expression"
        />
      </Field>
      <ReferenceField
        label="child"
        action="go"
        src={child.src}
        placeholder={child.placeholder}
        name={child.name}
        kind={child.kind}
        onOpen={() => onSelectNode(spec.child.id)}
        aria-label={`Go to the repeated child: ${child.name}`}
      />
    </Box>
  );
};

export { RepeatContent };
export type { RepeatContentProps };

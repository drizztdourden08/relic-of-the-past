/* @layer renderer-components @kind component */
/** `switch` is a thin pass-through to `CaseListEditor`, which owns the whole
 *  case-list UX (reordering, `otherwise`, "+ add case"). */
import { CaseListEditor } from '../CaseListEditor';
import type { GlyphPack, HudSwitchSpec } from '@shared/types/hud';

interface SwitchContentProps {
  spec: HudSwitchSpec;
  onChange: (patch: Partial<HudSwitchSpec>) => void;
  scope: Readonly<Record<string, number>>;
  /** Whether the SWITCH NODE ITSELF sits inside a repeat. A case's `when` is
   *  checked under this AMBIENT value (`validate-dynamic-node.ts`'s own
   *  `caseAt`), not forced true: a top-level switch (e.g. the arrow preset's
   *  `silver_arrows` gate) has no `index`/`count`/`item` to read. */
  insideRepeat?: boolean;
  glyphPacks: readonly GlyphPack[];
  selectedId: string | null;
  onSelectNode: (id: string) => void;
}

const SwitchContent = (props: SwitchContentProps) => {
  const { spec, onChange, scope, insideRepeat, glyphPacks, selectedId, onSelectNode } = props;
  return (
    <CaseListEditor
      spec={spec}
      onChange={onChange}
      scope={scope}
      insideRepeat={insideRepeat}
      glyphPacks={glyphPacks}
      selectedId={selectedId}
      onSelectNode={onSelectNode}
    />
  );
};

export { SwitchContent };
export type { SwitchContentProps };

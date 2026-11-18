/* @layer renderer-components @kind component */
import { nodeArtOf } from '@app/hud-layout-editing/node-art';
import { ReferenceField } from './ReferenceField';
import type { CaseBranchProps } from './CaseBranch.type';
import { useT } from '@drizztdourden08/brock-react';

const CaseBranch = (props: CaseBranchProps) => {
  const t = useT();
  const t = useT();
  const { node, label, glyphPacks, onSelectNode } = props;
  const art = nodeArtOf(node, glyphPacks, t);

  return (
    <ReferenceField
      compact
      action="go"
      src={art.src}
      placeholder={art.icon}
      name={art.name}
      kind={art.kind}
      onOpen={() => onSelectNode(node.id)}
      aria-label={t('hud-editor:case-branch.go', { label, name: art.name })}
    />
  );
};

export { CaseBranch };

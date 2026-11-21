/* @layer renderer-components @kind component */
import { nodeArtOf } from '@app/hud-layout-editing/node-art';
import { builtInNodeName } from '@app/hud-layout-editing/node-name';
import { ReferenceField } from './ReferenceField';
import type { CaseBranchProps } from './CaseBranch.type';
import { useT } from '@drizztdourden08/brock-react';

const CaseBranch = (props: CaseBranchProps) => {
  const t = useT();
  const { node, label, glyphPacks, onSelectNode } = props;
  const art = nodeArtOf(node, glyphPacks, t);
  const name = builtInNodeName(node.id, t) ?? art.name;

  return (
    <ReferenceField
      compact
      action="go"
      src={art.src}
      placeholder={art.icon}
      name={name}
      kind={art.kind}
      onOpen={() => onSelectNode(node.id)}
      aria-label={t('hud-editor:case-branch.go', { label, name })}
    />
  );
};

export { CaseBranch };
